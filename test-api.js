// test-api.js - 独立的 API 核验脚本
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const { Signer } = require('@volcengine/openapi');

function loadEnvFile() {
  const candidates = [
    path.resolve(__dirname, '.env.local'),
    path.resolve(__dirname, '.env'),
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

const AK = process.env.VOLC_ACCESSKEY;
const SK = process.env.VOLC_SECRETKEY;

if (!AK || !SK) {
  console.error('❌ 错误：未找到 AK/SK，请检查 .env.local 文件！');
  process.exit(1);
}

const HOST = 'visual.volcengineapi.com';
const SERVICE = 'cv';
const VERSION = '2022-08-31';

async function request(action, body) {
  const requestData = {
    region: 'cn-north-1',
    method: 'POST',
    params: { Action: action, Version: VERSION },
    headers: { Host: HOST, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
  const signer = new Signer(requestData, SERVICE);
  signer.addAuthorization({ accessKeyId: AK, secretKey: SK });
  
  try {
    console.log(`📡 发起请求: ${action}...`);
    const res = await axios.post(`https://${HOST}/`, requestData.body, {
      params: requestData.params,
      headers: requestData.headers,
      timeout: 10000 
    });
    return res.data;
  } catch (e) {
    if (e.response) {
      console.error(`❌ API 拒绝 (${e.response.status}):`, JSON.stringify(e.response.data, null, 2));
    } else {
      console.error('❌ 网络错误:', e.message);
    }
    return null;
  }
}

async function run() {
  console.log('🚀 开始 API 极限测试...');
  console.log('🔑 使用 AK:', AK.slice(0, 5) + '******');

  // 1. 提交任务 (使用一张必然成功的公网图)
  const submitBody = {
    req_key: 'jimeng_t2i_v40',
    prompt: '一只可爱的吉卜力风格的小猫，高清，动漫风格',
    image_urls: ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=800&fit=crop'],
    scale: 0.5,
    logo_info: { add_logo: false }
  };

  const submitRes = await request('CVSync2AsyncSubmitTask', submitBody);
  
  if (!submitRes || !submitRes.data || !submitRes.data.task_id) {
    console.log('💀 提交任务失败，测试终止。');
    return;
  }

  const taskId = submitRes.data.task_id;
  console.log(`✅ 任务提交成功！Task ID: ${taskId}`);
  console.log('⏳ 开始轮询进度...');

  // 2. 轮询结果
  let retry = 0;
  while (retry < 60) {
    retry++;
    await new Promise(r => setTimeout(r, 2000)); // 等2秒
    
    const pollRes = await request('CVSync2AsyncGetResult', { 
      req_key: 'jimeng_t2i_v40', 
      task_id: taskId 
    });

    if (!pollRes) continue;

    const status = pollRes.data.status;
    console.log(`...第 ${retry} 次查询状态: ${status}`);

    if (status === 'done') {
      console.log('🎉🎉🎉 生成成功！');
      console.log('图片地址:', pollRes.data.image_urls[0]);
      return;
    } else if (status === 'failed' || status === 'error') {
      console.error('❌ 生成失败，官方返回原因:', pollRes.data);
      return;
    }
  }
  console.log('⏰ 轮询超时。');
}

run();
