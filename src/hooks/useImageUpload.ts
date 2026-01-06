import { useState, useCallback, useEffect } from 'react';
import { validateImageFile, compressImage } from '../services/imageProcessor';

export interface UseImageUploadReturn {
  selectedImages: File[];
  previewUrls: string[];
  isUploading: boolean;
  error: string;
  handleImageSelect: (files: File[]) => Promise<void>;
  handleImageRemove: (index: number) => void;
  clearImages: () => void;
}

const STORAGE_KEY = 'THE_OTHER_YOU_DRAFT_IMAGES';

export const useImageUpload = (maxImages: number = 3): UseImageUploadReturn => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  // 初始化：从 localStorage 读取
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const imagesData: string[] = JSON.parse(storedData);
        if (Array.isArray(imagesData) && imagesData.length > 0) {
          // 将 Base64 转换回 File 对象
          const files = imagesData.map((dataUrl, index) => {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], `draft_image_${index}.jpg`, { type: mime });
          });
          
          // 为恢复的文件创建预览 URL
          const urls = files.map(file => URL.createObjectURL(file));

          setSelectedImages(files);
          setPreviewUrls(urls);
        }
      }
    } catch (e) {
      console.error('Failed to restore images from storage:', e);
    }
  }, []);

  // 持久化：压缩并保存
  const saveImagesToStorage = async (files: File[]) => {
    if (files.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    try {
      // 1. 压缩所有图片
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, 1024, 1024, 0.7)) // 适当降低质量以节省空间
      );

      // 2. 转 Base64
      const base64Promises = compressedFiles.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }));
      
      const base64Images = await Promise.all(base64Promises);
      
      // 3. 尝试保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(base64Images));
    } catch (e: any) {
      console.error('Failed to save images to storage:', e);
      // 如果是配额不足
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        setError('空间不足，图片保存失败'); // 微型提示（Toast效果由UI层处理，这里设置状态）
        // 尝试只保存 Prompt (由 Home 组件处理)，这里我们至少不崩溃
      }
    }
  };

  const handleImageSelect = useCallback(async (files: File[]) => {
    try {
      setIsUploading(true);
      setError('');
      
      const newFiles: File[] = [];
      const newUrls: string[] = [];

      // 计算还能添加多少张
      const remainingSlots = maxImages - selectedImages.length;
      const filesToProcess = files.slice(0, remainingSlots);

      if (filesToProcess.length === 0 && files.length > 0) {
        setError(`最多只能上传 ${maxImages} 张图片`);
        return;
      }

      for (const file of filesToProcess) {
        // 验证文件
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          setError(validation.error || '文件验证失败');
          continue;
        }

        // 立即设置原文件，先显示预览
        const immediateUrl = URL.createObjectURL(file);
        newFiles.push(file);
        newUrls.push(immediateUrl);
      }
      
      const updatedImages = [...selectedImages, ...newFiles];
      setSelectedImages(updatedImages);
      setPreviewUrls(prev => [...prev, ...newUrls]);
      
      // 异步保存到 LocalStorage
      // 不等待保存完成，避免阻塞 UI
      saveImagesToStorage(updatedImages);
      
    } catch (error) {
      console.error('图片处理失败:', error);
      setError('图片处理失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, [selectedImages, maxImages]);

  const handleImageRemove = useCallback((index: number) => {
    setPreviewUrls(prev => {
      const urlToRemove = prev[index];
      if (urlToRemove) URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, i) => i !== index);
    });
    
    setSelectedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      saveImagesToStorage(newImages); // 更新存储
      return newImages;
    });
    setError('');
  }, []);

  const clearImages = useCallback(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setSelectedImages([]);
    localStorage.removeItem(STORAGE_KEY); // 清除存储
    setError('');
  }, [previewUrls]);

  return {
    selectedImages,
    previewUrls,
    isUploading,
    error,
    handleImageSelect,
    handleImageRemove,
    clearImages
  };
};
