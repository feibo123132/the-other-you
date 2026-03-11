import { AUTH_TOKEN_KEY, readStorage } from "@/store/authStorage";

const API_BASE_URL = "https://jieyouyuzhou.cn/api";

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
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
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
              resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const downloadImage = async (imageUrl: string, fileName: string = "ai-transform.jpg") => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    throw new Error("下载失败，请重试");
  }
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file.type.startsWith("image/") && file.type !== "") {
    // Keep iOS HEIC compatibility behavior
  }
  if (file.size > 15 * 1024 * 1024) {
    return { isValid: false, error: "图片大小不能超过 15MB" };
  }
  return { isValid: true };
};

export const mergeImages = async (files: File[]): Promise<string> => {
  if (files.length === 0) throw new Error("No images to merge");
  if (files.length === 1) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(files[0]);
    });
  }

  const images = await Promise.all(
    files.map(
      (file) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image ${file.name}`));
          img.src = URL.createObjectURL(file);
        })
    )
  );

  const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
  const maxHeight = Math.max(...images.map((img) => img.height));
  const canvas = document.createElement("canvas");
  canvas.width = totalWidth;
  canvas.height = maxHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  let currentX = 0;
  images.forEach((img) => {
    ctx.drawImage(img, currentX, 0);
    currentX += img.width;
  });

  return canvas.toDataURL("image/jpeg", 0.9);
};

const parseErrorMessage = async (resp: Response, fallback: string) => {
  try {
    const data = await resp.json();
    return data?.message || data?.error || fallback;
  } catch {
    const text = await resp.text();
    return text || fallback;
  }
};

export const startGeneration = async (prompt: string, imageUrl?: string, scale: number = 0.5): Promise<string> => {
  const authToken = readStorage(AUTH_TOKEN_KEY);
  if (!authToken) {
    throw new Error("请先登录授权邮箱后再使用AI生图功能");
  }

  const url = `${API_BASE_URL}/generate`;
  console.log("🚀 [前端] 发起生成请求:", url);
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ prompt, imageUrl, scale }),
  });

  if (!resp.ok) {
    const message = await parseErrorMessage(resp, "生成失败");
    console.error("❌ [前端] 生成请求失败:", message);
    throw new Error(message);
  }

  const data = await resp.json();
  console.log("✅ [前端] 任务创建成功, ID:", data.taskId);
  return data.taskId;
};

export const subscribeProgress = (
  taskId: string,
  onUpdate: (u: { status: string; progress: number; message: string }) => void
) => {
  const url = `${API_BASE_URL}/progress/${taskId}`;
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onUpdate({ status: data.status, progress: data.progress || 0, message: data.message || "" });
    } catch (e) {
      console.error("SSE parse error:", e);
    }
  };
  return es;
};

export const fetchResult = async (taskId: string): Promise<string> => {
  const url = `${API_BASE_URL}/result/${taskId}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const message = await parseErrorMessage(resp, "获取结果失败");
    throw new Error(message);
  }
  const data = await resp.json();
  if (data.imageUrl) return data.imageUrl;
  throw new Error("任务未完成");
};

export const generateByServer = async (..._args: any[]) => {
  throw new Error("Internal Error: Frontend calling deprecated function");
};

