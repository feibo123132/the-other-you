// src/services/imageProcessor.ts

// ============================================================
// 🛑 核心配置：强制直连后端 (硬编码 IP，防止 localhost 解析问题)
// ============================================================
const API_BASE_URL = 'http://192.168.1.3:8787/api'; 

// 图片压缩处理 (保持不变)
export const compressImage = async (
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Failed to get canvas context')); return; }
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
              resolve(compressedFile);
            } else { resolve(file); }
          }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file); // 降级
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// 下载图片 (保持不变)
export const downloadImage = async (imageUrl: string, fileName: string = 'ai-transform.jpg') => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('下载失败，请重试');
  }
};

// 验证图片文件 (保持不变)
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file.type.startsWith('image/') && file.type !== '') {
     // iOS HEIC compat
  }
  if (file.size > 15 * 1024 * 1024) { 
    return { isValid: false, error: '图片大小不能超过 15MB' };
  }
  return { isValid: true };
};

// ============================================================
// 🚀 API 调用核心 (全部修改为直连 127.0.0.1)
// ============================================================

// 1. 发起任务 (对应 POST /api/generate)
export const startGeneration = async (
  prompt: string,
  imageUrl?: string,
  scale: number = 0.5
): Promise<string> => {
  console.log('🚀 [前端] 发起生成请求:', `${API_BASE_URL}/generate`);
  
  const resp = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageUrl, scale }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error('❌ [前端] 生成请求失败:', text);
    throw new Error(text || '生成失败');
  }
  const data = await resp.json();
  console.log('✅ [前端] 任务创建成功, ID:', data.taskId);
  return data.taskId;
};

// 2. 监听进度 (对应 SSE /api/progress)
export const subscribeProgress = (taskId: string, onUpdate: (u: { status: string; progress: number; message: string }) => void) => {
  const url = `${API_BASE_URL}/progress/${taskId}`;
  console.log('📡 [前端] 监听 SSE:', url);
  
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      console.log('🔄 [SSE] 收到更新:', data);
      onUpdate({ status: data.status, progress: data.progress || 0, message: data.message || '' });
    } catch (e) {
      console.error('SSE 解析错误', e);
    }
  };
  return es; // 返回 es 对象以便外部 close
};

// 3. 拉取结果 (对应 GET /api/result)
export const fetchResult = async (taskId: string): Promise<string> => {
  const url = `${API_BASE_URL}/result/${taskId}`;
  console.log('📥 [前端] 拉取最终结果:', url);

  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || '获取结果失败');
  }
  const data = await resp.json();
  if (data.imageUrl) return data.imageUrl;
  throw new Error('任务未完成');
};

// 4. 兼容旧接口 (防止 hooks 还在调这个老名字)
// 我们把它“重定向”到新的 startGeneration，虽然逻辑不同（它需要等待），
// 但为了防止报错，我们让它直接抛出错误提示开发者升级，或者直接复用 startGeneration 
// (鉴于现在逻辑变了，抛错是最安全的，强迫你去修 hooks)
export const generateByServer = async (...args: any[]) => {
  console.error("❌ 错误：前端代码调用了过时的 generateByServer，请检查 useGeneration.ts");
  throw new Error("Internal Error: Frontend calling deprecated function");
};