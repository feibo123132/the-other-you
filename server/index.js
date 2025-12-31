const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });
const { Signer } = require('@volcengine/openapi');
const FormData = require('form-data');
const crypto = require('crypto');

const HOST = 'visual.volcengineapi.com';
const REGION = 'cn-north-1';
const SERVICE = 'cv';
const VERSION = '2022-08-31';
const PORT = process.env.PORT || 8787;

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cors());

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const accessKeyId = process.env.VOLC_ACCESSKEY;
const secretKey = process.env.VOLC_SECRETKEY;

async function signAndPost(action, body) {
  const bodyString = JSON.stringify(body);
  const requestData = {
    region: REGION,
    method: 'POST',
    params: { Action: action, Version: VERSION },
    headers: { Host: HOST, 'Content-Type': 'application/json' },
    body: bodyString,
  };
  const signer = new Signer(requestData, SERVICE);
  signer.addAuthorization({ accessKeyId, secretKey, sessionToken: '' });
  const url = `https://${HOST}/`;
  return await axios.post(url, bodyString, {
    params: requestData.params,
    headers: requestData.headers,
    timeout: 30000,
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function computeDedupeKey(prompt, imageUrl, requestId) {
  if (requestId) return String(requestId);
  const raw = imageUrl
    ? (imageUrl.startsWith('data:') ? (imageUrl.split(',')[1] || imageUrl) : imageUrl)
    : 'NO_IMAGE';
  const s = `${prompt || ''}|${raw}`;
  return crypto.createHash('sha256').update(s).digest('hex');
}

async function uploadToTempHost(base64Str) {
  const m = base64Str.match(/^data:(.*?);base64,(.*)$/);
  const mime = m ? m[1] : 'image/jpeg';
  const b64 = m ? m[2] : base64Str;
  const buf = Buffer.from(b64, 'base64');
  const ext = (mime.split('/')[1] || 'jpg').toLowerCase();

  async function uploadToTmpfiles(buffer) {
    const form = new FormData();
    form.append('file', buffer, { filename: `image.${ext}`, contentType: mime });
    const resp = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: form.getHeaders(),
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });
    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(`tmpfiles ${resp.status}`);
    }
    const pageUrl = resp.data && (resp.data.data?.url || resp.data.url || resp.data.data?.file_url);
    if (!pageUrl) throw new Error('tmpfiles no url');
    const seg = pageUrl.split('tmpfiles.org/')[1];
    const id = seg ? seg.replace(/^\/+/, '').replace(/\/+$/, '') : '';
    const directUrl = id ? `https://tmpfiles.org/dl/${id}` : pageUrl;
    return directUrl;
  }

  async function uploadTo0x0(buffer) {
    const form = new FormData();
    form.append('file', buffer, { filename: `image.${ext}`, contentType: mime });
    const resp = await axios.post('https://0x0.st', form, {
      headers: form.getHeaders(),
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      responseType: 'text',
      validateStatus: () => true,
    });
    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(`0x0.st ${resp.status}`);
    }
    const url = (resp.data || '').trim();
    if (!/^https?:\/\//.test(url)) throw new Error('0x0.st no url');
    return url;
  }

  const maxRetries = 2;
  let lastErr;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await uploadToTmpfiles(buf);
    } catch (e) {
      lastErr = e;
      await sleep(1000 * (i + 1));
    }
  }
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await uploadTo0x0(buf);
    } catch (e) {
      lastErr = e;
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error(`上传失败: ${lastErr?.message || 'unknown'}`);
}

// ---------------- 队列系统 ----------------
const tasks = new Map();
const queue = [];
const sseClients = new Map();
let workerRunning = false;
let activeSubmits = 0;
const MAX_CONCURRENT_SUBMIT = 1;
const submissions = new Map();

function broadcast(taskId, payload) {
  const set = sseClients.get(taskId);
  if (!set) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) {
    try { res.write(data); } catch(e) {}
  }
}

async function acquireSubmitSlot() {
  while (activeSubmits >= MAX_CONCURRENT_SUBMIT) {
    await sleep(500);
  }
  activeSubmits++;
}
function releaseSubmitSlot() {
  activeSubmits = Math.max(0, activeSubmits - 1);
}

async function submitWithRetry(body, timeoutMs) {
  const start = Date.now();
  let delay = 2000;
  while (Date.now() - start < timeoutMs) {
    try {
      console.log(`📡 尝试提交任务...`);
      return await signAndPost('CVSync2AsyncSubmitTask', body);
    } catch (e) {
      const status = e.response?.status;
      const code = e.response?.data?.code;
      if (code === 50430 || status === 429 || status === 503) {
        console.warn(`⚠️ 并发受限，等待 ${delay}ms 后重试...`);
        await sleep(delay);
        delay = Math.min(delay * 2, 15000);
        continue;
      }
      throw e;
    }
  }
  throw new Error('提交阶段超时');
}

async function startWorker() {
  if (workerRunning) return;
  workerRunning = true;
  console.log('👷 Worker 启动...');

  while (queue.length > 0) {
    const t = queue.shift();
    const { id, prompt, finalImageUrl } = t;
    console.log(`🔄 [Worker] 处理任务: ${id}`);
    
    const timeoutMs = 5 * 60 * 1000; 
    const start = Date.now();

    tasks.set(id, { status: 'submitting', progress: 5, message: '排队提交...' });
    broadcast(id, tasks.get(id));

    let taskId = null;
    try {
      await acquireSubmitSlot();
      const submitBody = {
        req_key: 'jimeng_t2i_v40',
        prompt,
        image_urls: [finalImageUrl],
        scale: 0.5,
        logo_info: { add_logo: false },
        force_single: true,
      };
      
      const submitResp = await submitWithRetry(submitBody, timeoutMs);
      taskId = submitResp.data?.data?.task_id || submitResp.data?.task_id;
      releaseSubmitSlot();
      
      if (!taskId) throw new Error('未返回 task_id');
      console.log(`✅ 提交成功 ID: ${taskId}`);

    } catch (e) {
      releaseSubmitSlot();
      console.error('❌ 提交失败:', e.message);
      tasks.set(id, { status: 'failed', progress: 0, message: '提交失败' });
      broadcast(id, tasks.get(id));
      continue;
    }

    tasks.set(id, { status: 'generating', progress: 20, message: 'AI 绘图中...', providerTaskId: taskId });
    broadcast(id, tasks.get(id));

    let imageUrls = null;
    while (Date.now() - start < timeoutMs) {
      await sleep(2000);
      try {
        const pollResp = await signAndPost('CVSync2AsyncGetResult', { req_key: 'jimeng_t2i_v40', task_id: taskId });
        const respData = pollResp.data?.data || pollResp.data; // 核心数据层
        const status = respData?.status;
        
        console.log(`⏳ 轮询 ${taskId}: ${status}`);

        if (status === 'done') {
          console.log("📦 收到 DONE 响应，原始数据:", JSON.stringify(respData).substring(0, 200) + "..."); // 打印日志方便调试

          // === 核心修复：兼容 Base64 和 URL ===
          if (respData.image_urls && respData.image_urls.length > 0) {
            imageUrls = respData.image_urls;
          } else if (respData.binary_data_base64 && respData.binary_data_base64.length > 0) {
            // 如果返回的是 Base64，我们要给它加上前缀，让浏览器能识别
            imageUrls = respData.binary_data_base64.map(b64 => `data:image/jpeg;base64,${b64}`);
            console.log("✅ 成功提取 Base64 图片数据");
          } else if (respData.image_url) {
            imageUrls = [respData.image_url];
          }
          
          break; // 跳出轮询
        }
        if (status === 'failed' || status === 'error') {
          throw new Error('即梦返回 failed');
        }
      } catch (e) {
        console.error('轮询出错:', e.message);
      }
    }

    if (imageUrls && imageUrls.length > 0) {
      console.log(`🎉 任务 ${id} 成功！图片长度: ${imageUrls[0].length}`);
      tasks.set(id, { status: 'done', progress: 100, message: '完成！', imageUrl: imageUrls[0] });
      broadcast(id, tasks.get(id));
    } else {
      console.error(`💀 任务 ${id} 解析图片失败或超时`);
      // 这里不报超时，而是报解析错误，方便定位
      tasks.set(id, { status: 'failed', progress: 0, message: '生成成功但解析图片失败' });
      broadcast(id, tasks.get(id));
    }
  }
  workerRunning = false;
}

// ---------------- 接口 ----------------

app.post('/api/generate', async (req, res) => {
  const { prompt, imageUrl } = req.body || {};
  const fallbackImage = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=800&fit=crop';
  for (const [k, v] of submissions) { if ((Date.now() - v.ts) > 60000) submissions.delete(k); }
  const reqId = req.headers['x-request-id'];
  const key = computeDedupeKey(prompt, imageUrl, reqId);
  const existing = submissions.get(key);
  if (existing && (Date.now() - existing.ts) < 10000) {
    return res.json({ taskId: existing.id });
  }
  const id = Date.now().toString();
  submissions.set(key, { id, ts: Date.now() });
  let finalImageUrl;
  if (imageUrl && imageUrl.startsWith('data:')) {
    try {
      console.log(`📷 收到 Base64，长度=${imageUrl.length}`);
      finalImageUrl = await uploadToTempHost(imageUrl);
      console.log(`🌐 上传成功，直链=${finalImageUrl}`);
    } catch (e) {
      const msg = e?.message || 'unknown';
      submissions.delete(key);
      console.error('临时图床上传失败:', msg);
      return res.status(500).json({ error: 'upload_failed', detail: msg });
    }
  } else {
    finalImageUrl = imageUrl || fallbackImage;
  }
  console.log(`➕ 任务入队: ${id}`);
  tasks.set(id, { status: 'queued', progress: 0, message: '排队中...' });
  queue.push({ id, prompt, finalImageUrl });
  startWorker();
  res.json({ taskId: id });
});

app.get('/api/progress/:taskId', (req, res) => {
  const { taskId } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  
  const set = sseClients.get(taskId) || new Set();
  set.add(res);
  sseClients.set(taskId, set);
  
  const current = tasks.get(taskId) || { status: 'unknown' };
  res.write(`data: ${JSON.stringify(current)}\n\n`);
  
  req.on('close', () => {
    const s = sseClients.get(taskId);
    if (s) { s.delete(res); if(s.size===0) sseClients.delete(taskId); }
  });
});

app.get('/api/result/:taskId', (req, res) => {
  const t = tasks.get(req.params.taskId);
  if (!t) return res.status(404).json({ error: '任务不存在' });
  if (t.status === 'failed') return res.status(500).json({ error: t.message || '失败' });
  if (t.status !== 'done') return res.status(202).json({ status: t.status });
  res.json({ imageUrl: t.imageUrl });
});

app.get('/api/health', (req, res) => res.json({ ok: true, port: PORT }));

app.listen(PORT, '0.0.0.0', () => console.log(`server started on http://0.0.0.0:${PORT}`));
