import { useState, useCallback } from 'react';
import { validateImageFile, compressImage } from '../services/imageProcessor';

export const useImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleImageSelect = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setError('');
      // 验证文件（放宽为 image/*）
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || '文件验证失败');
        return;
      }

      // 立即设置原文件，先显示预览
      const immediateUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setPreviewUrl(immediateUrl);

      // 后台尝试压缩，成功再替换
      try {
        const compressedFile = await compressImage(file, 1024, 1024, 0.8);
        const newUrl = URL.createObjectURL(compressedFile);
        // 替换为压缩后的文件与预览
        setSelectedImage(compressedFile);
        setPreviewUrl(newUrl);
        // 释放旧URL
        URL.revokeObjectURL(immediateUrl);
      } catch (_) {
        // 压缩失败则保留原文件与预览
      }
    } catch (error) {
      console.error('图片处理失败:', error);
      setError('图片处理失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleImageRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setSelectedImage(null);
    setError('');
  }, [previewUrl]);

  return {
    selectedImage,
    previewUrl,
    isUploading,
    error,
    handleImageSelect,
    handleImageRemove,
  };
};
