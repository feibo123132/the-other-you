import { useState, useCallback } from 'react';
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

export const useImageUpload = (maxImages: number = 3): UseImageUploadReturn => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

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
      
      setSelectedImages(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newUrls]);

      // 后台尝试压缩 (暂时跳过，如果需要可以加回)
      
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
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setError('');
  }, []);

  const clearImages = useCallback(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setSelectedImages([]);
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
