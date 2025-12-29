## 背景与目标
- 即梦 API 仅接受公网 URL，不接受 Base64。
- 现状：如果前端传 Base64，就使用 fallback 图片，导致始终是外国模特。
- 目标：将前端 Base64 上传到无需鉴权的临时图床，拿到可直接访问的公网 URL，再传给即梦。

## 具体改动
1. 引入 `form-data` 作为 `multipart/form-data` 组装器；`axios` 已在项目中使用。
2. 新增函数 `uploadToTempHost(base64Str)`：
   - 解析前端 `data:*;base64,...`，提取 `mime` 与真实 Base64；转为 `Buffer`。
   - 以 `file` 字段 POST 到 `https://tmpfiles.org/api/v1/upload`。
   - 解析返回页面 URL，标准化为可直接下载的 `https://tmpfiles.org/dl/<id>`。
3. 修改 `app.post('/api/generate')` 为 `async`：
   - 若 `imageUrl` 是 Base64，则调用 `uploadToTempHost` 获取公网 URL；失败则返回 500（不再使用 fallback）。
   - 若是普通 URL，则直接使用；若没传则仍用已有 fallback。
4. 其余队列、SSE 与轮询逻辑保持不变。

## 错误处理与兼容
- 上传失败直接返回 500，避免再次落回到 fallback。
- 兼容多种图片 `mime`（jpeg/png/webp），按扩展名设置文件名。
- 为上传请求设置超时，并允许较大的 `body`（保留原服务端 `10mb` 限制）。

## 完整代码（替换 server/index.js）
```js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });
const { Signer } = require('@volcengine/openapi');
const FormData = require('form-data');

const HOST = 'visual.volcengineapi.com';
const REGION = 'cn-north-1';
const SERVICE = 'cv';
const VERSION = '2022-08-31';
const PORT = process.env.PORT || 8787;

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

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

async function uploadToTempHost(base64Str) {
  const m = base64Str.match(/^data:(.*?);base64,(.*)$/);
  const mime = m ? m[1] : 'image/jpeg';
  const b64 = m ? m[2] : base64Str;
  const buf = Buffer.from(b64, 'base64');
  const ext = (mime.split('/')[1] || 'jpg').toLowerCase();
  const form = new FormData();
  form.append('file', buf, { filename: `image.${ext}`, contentType: mime });
  const resp = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
    headers: form.getHeaders(),
    timeout: 30000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  let pageUrl = resp.data && (resp.data.data?.url || resp.data.url || resp.data.data?.file_url);
  if (!pageUrl) throw new Error('临时图床未返回 URL');
  const seg = pageUrl.split('tmpfiles.org/')[1];
  const id = seg ? seg.replace(/^\/+/, '').replace(/\/+$/, '') : '';
  const directUrl = id ? `https://tmpfiles.org/dl/${id}` : pageUrl;
  return directUrl;
}

const tasks = new Map();
const queue = [];
const sseClients = new Map();
let workerRunning = false;
let activeSubmits = 0;
const MAX_CONCURRENT_SUBMIT = 1;

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

    let providerTaskId = null;
    try {
      await acquireSubmitSlot();
      const submitBody = {
        req_key: 'jimeng_t2i_v40',
        prompt,
        image_urls: [finalImageUrl],
        scale: 0.5,
        logo_info: { add_logo: false },
      };
      const submitResp = await submitWithRetry(submitBody, timeoutMs);
      providerTaskId = submitResp.data?.data?.task_id || submitResp.data?.task_id;
      releaseSubmitSlot();
      if (!providerTaskId) throw new Error('未返回 task_id');
      console.log(`✅ 提交成功 ID: ${providerTaskId}`);
    } catch (e) {
      releaseSubmitSlot();
      console.error('❌ 提交失败:', e.message);
      tasks.set(id, { status: 'failed', progress: 0, message: '提交失败' });
      broadcast(id, tasks.get(id));
      continue;
    }

    tasks.set(id, { status: 'generating', progress: 20, message: 'AI 绘图中...', providerTaskId });
    broadcast(id, tasks.get(id));

    let imageUrls = null;
    while (Date.now() - start < timeoutMs) {
      await sleep(2000);
      try {
        const pollResp = await signAndPost('CVSync2AsyncGetResult', { req_key: 'jimeng_t2i_v40', task_id: providerTaskId });
        const respData = pollResp.data?.data || pollResp.data;
        const status = respData?.status;
        console.log(`⏳ 轮询 ${providerTaskId}: ${status}`);
        if (status === 'done') {
          console.log('📦 收到 DONE 响应');
          if (respData.image_urls && respData.image_urls.length > 0) {
            imageUrls = respData.image_urls;
          } else if (respData.binary_data_base64 && respData.binary_data_base64.length > 0) {
            imageUrls = respData.binary_data_base64.map(b64 => `data:image/jpeg;base64,${b64}`);
            console.log('✅ 成功提取 Base64 图片数据');
          } else if (respData.image_url) {
            imageUrls = [respData.image_url];
          }
          break;
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
      tasks.set(id, { status: 'failed', progress: 0, message: '生成成功但解析图片失败' });
      broadcast(id, tasks.get(id));
    }
  }
  workerRunning = false;
}

app.post('/api/generate', async (req, res) => {
  const { prompt, imageUrl } = req.body || {};
  const fallbackImage = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=800&fit=crop';
  let finalImageUrl;
  if (imageUrl && imageUrl.startsWith('data:')) {
    try {
      finalImageUrl = await uploadToTempHost(imageUrl);
    } catch (e) {
      console.error('临时图床上传失败:', e.message);
      return res.status(500).json({ error: '临时图床上传失败' });
    }
  } else {
    finalImageUrl = imageUrl || fallbackImage;
  }

  const id = Date.now().toString();
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

app.listen(PORT, () => console.log(`server started on http://127.0.0.1:${PORT}`));
```

## 需要的依赖
- 新增：`form-data`
- 安装：`npm i form-data`

确认后我将正式应用改动并进行端到端验证（包含上传、即梦生成与前端展示）。