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

      // 验证文件
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || '文件验证失败');
        return;
      }

      // 压缩图片
      const compressedFile = await compressImage(file, 1024, 1024, 0.8);
      
      // 创建预览URL
      const url = URL.createObjectURL(compressedFile);
      
      setSelectedImage(compressedFile);
      setPreviewUrl(url);
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