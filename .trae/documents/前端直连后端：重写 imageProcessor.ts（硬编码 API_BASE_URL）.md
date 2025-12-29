## 说明
- 采纳“硬编码直连”策略，彻底绕过 Vite 代理。将前端所有请求直接指向 `http://127.0.0.1:8787/api`。
- 移除 `./apiBase` 依赖与旧的同步函数 `generateByServer`，仅保留直连的三大方法：`startGeneration`、`subscribeProgress`、`fetchResult`。
- 后端已启用 `app.use(cors())`，满足跨域直连。

## 重写后的 src/services/imageProcessor.ts（完整文件）
```ts
// 图片压缩处理
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
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        resolve(file);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// 下载图片
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
    throw new Error('下载失败，请重试');
  }
};

// 验证图片文件
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: '请选择图片文件' };
  }
  if (file.size > maxSize) {
    return { isValid: false, error: '图片大小不能超过 10MB' };
  }
  return { isValid: true };
};

// 强制直连本地后端，避开 Vite 代理的不确定性
const API_BASE_URL = 'http://127.0.0.1:8787/api';

export const startGeneration = async (
  prompt: string,
  imageUrl?: string,
  scale: number = 0.5
): Promise<string> => {
  const resp = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageUrl, scale }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || '生成失败');
  }
  const data = await resp.json();
  return data.taskId;
};

export const subscribeProgress = (
  taskId: string,
  onUpdate: (u: { status: string; progress: number; message: string }) => void
) => {
  const es = new EventSource(`${API_BASE_URL}/progress/${taskId}`);
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onUpdate({ status: data.status, progress: data.progress || 0, message: data.message || '' });
    } catch {}
  };
  return es;
};

export const fetchResult = async (taskId: string): Promise<string> => {
  const resp = await fetch(`${API_BASE_URL}/result/${taskId}`);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || '获取结果失败');
  }
  const data = await resp.json();
  if (data.imageUrl) return data.imageUrl;
  throw new Error('任务未完成');
};

// 旧的同步等待接口已废弃（避免误用）
// export const generateByServer = async () => { throw new Error('Deprecated'); };
```

## 应用后预期
- 所有前端调用都直连后端端口 8787；后端已启用 CORS，因此不会被跨域拦截。
- 现场路演不再依赖代理与网络解析差异，稳定性显著提升。