const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
const { Signer } = require('@volcengine/openapi');
const FormData = require('form-data');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function loadEnvFile() {
  const candidates = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return envPath;
    }
  }
  return null;
}

const loadedEnvPath = loadEnvFile();

const HOST = 'visual.volcengineapi.com';
const REGION = 'cn-north-1';
const SERVICE = 'cv';
const VERSION = '2022-08-31';
// 恢复为 8787，由 Nginx 负责反向代理和 80/443 监听
const PORT = process.env.PORT || 8787;

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cors());

// 托管打包后的前端网页
app.use(express.static(path.join(__dirname, '../dist')));

// 处理单页应用路由：所有找不到的路径都返回 index.html
// 但排除 /api 开头的请求，避免 API 404 时返回 HTML
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const accessKeyId = process.env.VOLC_ACCESSKEY;
const secretKey = process.env.VOLC_SECRETKEY;

const AUTH_CODE_TTL_SEC = Number(process.env.AUTH_CODE_TTL_SEC || 300);
const AUTH_SEND_COOLDOWN_SEC = Number(process.env.AUTH_SEND_COOLDOWN_SEC || 60);
const AUTH_MAX_VERIFY_ATTEMPTS = Number(process.env.AUTH_MAX_VERIFY_ATTEMPTS || 5);
const AUTH_MAX_SEND_PER_IP_PER_HOUR = Number(process.env.AUTH_MAX_SEND_PER_IP_PER_HOUR || 20);
const AUTH_SESSION_TTL_SEC = Number(process.env.AUTH_SESSION_TTL_SEC || 86400);
const AUTH_CODE_TTL_MS = AUTH_CODE_TTL_SEC * 1000;
const AUTH_SEND_COOLDOWN_MS = AUTH_SEND_COOLDOWN_SEC * 1000;
const AUTH_IP_WINDOW_MS = 60 * 60 * 1000;
const AUTH_SESSION_TTL_MS = AUTH_SESSION_TTL_SEC * 1000;
const ALLOWED_GENERATE_EMAIL = normalizeEmail(process.env.ALLOWED_GENERATE_EMAIL || '2421415030@qq.com');

const authCodeStore = new Map();
const authSessionStore = new Map();
const ipSendWindowStore = new Map();
let smtpTransporter = null;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseBoolEnv(value, defaultValue) {
  if (value == null) return defaultValue;
  const v = String(value).trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return defaultValue;
}

function createVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function resolveSessionFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const session = authSessionStore.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    authSessionStore.delete(token);
    return null;
  }
  return { token, ...session };
}

function cleanupAuthStores() {
  const now = Date.now();
  for (const [email, record] of authCodeStore) {
    if (!record || now > record.expiresAt) {
      authCodeStore.delete(email);
    }
  }
  for (const [token, session] of authSessionStore) {
    if (!session || now > session.expiresAt) {
      authSessionStore.delete(token);
    }
  }
  for (const [ip, timestamps] of ipSendWindowStore) {
    const filtered = timestamps.filter((ts) => now - ts <= AUTH_IP_WINDOW_MS);
    if (filtered.length > 0) {
      ipSendWindowStore.set(ip, filtered);
    } else {
      ipSendWindowStore.delete(ip);
    }
  }
}

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;
  const host = process.env.QQ_SMTP_HOST || 'smtp.qq.com';
  const port = Number(process.env.QQ_SMTP_PORT || 465);
  const secure = parseBoolEnv(process.env.QQ_SMTP_SECURE, port === 465);
  const user = process.env.QQ_SMTP_USER;
  const pass = process.env.QQ_SMTP_PASS;

  if (!user || !pass) {
    throw new Error('QQ SMTP not configured');
  }

  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return smtpTransporter;
}

async function sendVerificationEmail(targetEmail, code) {
  const transporter = getSmtpTransporter();
  const sender = process.env.QQ_SMTP_FROM || process.env.QQ_SMTP_USER;
  const subject = '[The Other You] Verification Code';
  const text = `Verification code: ${code}\nExpires in: ${AUTH_CODE_TTL_SEC} seconds\nDo not share this code.`;
  const html = `
    <div style="font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin: 0 0 12px;">Verification Code</h2>
      <p style="margin: 0 0 12px;">Your verification code is:</p>
      <p style="margin: 0 0 12px; font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p style="margin: 0 0 12px;">Expires in: ${AUTH_CODE_TTL_SEC} seconds.</p>
      <p style="margin: 0;">If this wasn't you, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: sender,
    to: targetEmail,
    subject,
    text,
    html,
  });
}

function describeMailError(error) {
  const code = error?.code ? ` code=${error.code}` : '';
  const responseCode = error?.responseCode ? ` responseCode=${error.responseCode}` : '';
  const command = error?.command ? ` command=${error.command}` : '';
  return `${error?.message || error}${code}${responseCode}${command}`;
}

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

function toImageUrlArray(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const item of input) {
    if (typeof item === 'string' && item.trim()) {
      out.push(item.trim());
      continue;
    }
    if (item && typeof item === 'object') {
      const maybe = item.url || item.image_url || item.imageUrl || item.uri;
      if (typeof maybe === 'string' && maybe.trim()) {
        out.push(maybe.trim());
      }
    }
  }
  return out;
}

function toBase64DataUrlArray(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const item of input) {
    if (typeof item !== 'string' || !item.trim()) continue;
    const v = item.trim();
    out.push(v.startsWith('data:') ? v : `data:image/jpeg;base64,${v}`);
  }
  return out;
}

function extractProviderImages(respData) {
  const candidates = [respData, respData?.data, respData?.result, respData?.output];

  for (const c of candidates) {
    if (!c || typeof c !== 'object') continue;

    const urls = toImageUrlArray(c.image_urls);
    if (urls.length > 0) return urls;

    const base64Urls = toBase64DataUrlArray(c.binary_data_base64);
    if (base64Urls.length > 0) return base64Urls;

    if (typeof c.image_url === 'string' && c.image_url.trim()) return [c.image_url.trim()];
    if (typeof c.imageUrl === 'string' && c.imageUrl.trim()) return [c.imageUrl.trim()];
  }

  return [];
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
    let providerFailedMessage = '';
    let lastPollError = null;
    while (Date.now() - start < timeoutMs) {
      await sleep(2000);
      try {
        const pollResp = await signAndPost('CVSync2AsyncGetResult', { req_key: 'jimeng_t2i_v40', task_id: taskId });
        const respData = pollResp.data?.data || pollResp.data; // 核心数据层
        const status = String(respData?.status || respData?.task_status || respData?.state || '').toLowerCase();
        
        console.log(`⏳ 轮询 ${taskId}: ${status}`);

        if (status === 'done' || status === 'success' || status === 'succeeded') {
          console.log("📦 收到 DONE 响应，原始数据:", JSON.stringify(respData).substring(0, 200) + "..."); // 打印日志方便调试

          imageUrls = extractProviderImages(respData);
          if (!imageUrls || imageUrls.length === 0) {
            lastPollError = new Error('provider_done_but_no_image_payload');
          }
          
          break; // 跳出轮询
        }
        if (status === 'failed' || status === 'error' || status === 'cancelled' || status === 'canceled') {
          providerFailedMessage = respData?.message || respData?.error || respData?.reason || 'provider_task_failed';
          break;
        }
      } catch (e) {
        lastPollError = e;
        console.error('轮询出错:', e.message);
      }
    }

    if (providerFailedMessage) {
      console.error(`❌ 任务 ${id} Provider失败: ${providerFailedMessage}`);
      tasks.set(id, { status: 'failed', progress: 0, message: providerFailedMessage });
      broadcast(id, tasks.get(id));
      continue;
    }

    if (imageUrls && imageUrls.length > 0) {
      console.log(`🎉 任务 ${id} 成功！图片长度: ${imageUrls[0].length}`);
      tasks.set(id, { status: 'done', progress: 100, message: '完成！', imageUrl: imageUrls[0] });
      broadcast(id, tasks.get(id));
    } else {
      const reason = lastPollError?.message || 'result_timeout_or_parse_failed';
      console.error(`💀 任务 ${id} 失败: ${reason}`);
      tasks.set(id, { status: 'failed', progress: 0, message: reason });
      broadcast(id, tasks.get(id));
    }
  }
  workerRunning = false;
}

// ---------------- 接口 ----------------

app.post('/api/auth/send-code', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: '请输入有效的邮箱地址' });
  }

  cleanupAuthStores();
  const now = Date.now();
  const existing = authCodeStore.get(email);
  if (existing && now - existing.lastSentAt < AUTH_SEND_COOLDOWN_MS) {
    const remainSec = Math.ceil((AUTH_SEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return res.status(429).json({ message: `请求过于频繁，请在${remainSec}秒后重试` });
  }

  const ip = getClientIp(req);
  const sentAtList = ipSendWindowStore.get(ip) || [];
  const recentSentAt = sentAtList.filter((ts) => now - ts <= AUTH_IP_WINDOW_MS);
  if (recentSentAt.length >= AUTH_MAX_SEND_PER_IP_PER_HOUR) {
    return res.status(429).json({ message: '发送过于频繁，请稍后再试' });
  }

  const code = createVerificationCode();
  try {
    await sendVerificationEmail(email, code);
    authCodeStore.set(email, {
      code,
      expiresAt: now + AUTH_CODE_TTL_MS,
      lastSentAt: now,
      failedAttempts: 0,
    });
    recentSentAt.push(now);
    ipSendWindowStore.set(ip, recentSentAt);
    return res.json({ ok: true, expiresIn: AUTH_CODE_TTL_SEC });
  } catch (error) {
    console.error('[Auth] send code failed:', describeMailError(error));
    if (error?.message === 'QQ SMTP not configured') {
      return res.status(500).json({ message: '服务端未配置QQ SMTP账号，请先完成环境变量配置' });
    }
    return res.status(500).json({ message: '验证码发送失败，请稍后重试' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code || '').trim();
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: '请输入有效的邮箱地址' });
  }
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: '请输入6位数字验证码' });
  }

  cleanupAuthStores();
  const record = authCodeStore.get(email);
  if (!record) {
    return res.status(400).json({ message: '请先获取验证码' });
  }
  if (Date.now() > record.expiresAt) {
    authCodeStore.delete(email);
    return res.status(400).json({ message: '验证码已过期，请重新发送' });
  }
  if (record.code !== code) {
    const nextFailedAttempts = (record.failedAttempts || 0) + 1;
    if (nextFailedAttempts >= AUTH_MAX_VERIFY_ATTEMPTS) {
      authCodeStore.delete(email);
      return res.status(400).json({ message: '验证码错误次数过多，请重新发送' });
    }
    authCodeStore.set(email, { ...record, failedAttempts: nextFailedAttempts });
    const leftAttempts = AUTH_MAX_VERIFY_ATTEMPTS - nextFailedAttempts;
    return res.status(400).json({ message: `验证码错误，还可重试${leftAttempts}次` });
  }

  authCodeStore.delete(email);
  const allowGenerate = email === ALLOWED_GENERATE_EMAIL;
  const token = createSessionToken();
  authSessionStore.set(token, {
    email,
    allowGenerate,
    expiresAt: Date.now() + AUTH_SESSION_TTL_MS,
  });
  return res.json({
    ok: true,
    email,
    token,
    allowGenerate,
    sessionExpiresIn: AUTH_SESSION_TTL_SEC,
  });
});
app.post('/api/generate', async (req, res) => {
  cleanupAuthStores();
  const session = resolveSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ message: '请先登录后再使用AI生图功能' });
  }
  if (!session.allowGenerate || session.email !== ALLOWED_GENERATE_EMAIL) {
    return res.status(403).json({ message: '当前账号无AI生图权限' });
  }

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

app.listen(PORT, '0.0.0.0', () => {
  const smtpConfigured = Boolean(process.env.QQ_SMTP_USER && process.env.QQ_SMTP_PASS);
  console.log(`server started on http://0.0.0.0:${PORT}`);
  console.log(`[env] loaded=${loadedEnvPath || 'none'} smtpConfigured=${smtpConfigured}`);
});
