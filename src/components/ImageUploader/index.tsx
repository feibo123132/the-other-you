import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (files: File[]) => void;
  selectedImages: File[];
  previewUrls: string[];
  onImageRemove: (index: number) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelect, 
  selectedImages, 
  previewUrls,
  onImageRemove,
  maxImages = 3
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (file && file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    });
    
    if (validFiles.length > 0) {
      onImageSelect(validFiles);
    }
  };

  // 处理文件输入变化
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileSelect(event.target.files);
    }
    // 清空以确保选择同一张图片时也能触发变更
    event.target.value = '';
  };

  // ... (drag handlers remain mostly same)
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileSelect(event.dataTransfer.files);
    }
  };

  // ... (touch handlers remain same)
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    element.style.transform = 'scale(0.98)';
    element.style.transition = 'transform 0.1s ease';
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    element.style.transform = 'scale(1)';
    setTimeout(() => {
      element.style.transition = '';
    }, 100);
  };

  const canAddMore = selectedImages.length < maxImages;

  return (
    <div className="w-full">
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <motion.div
              key={`preview-${index}-${url}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-primary-200"
            >
              <img
                src={url}
                alt={`预览 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => onImageRemove(index)}
                className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4"
              >
                <p className="text-white text-sm font-medium truncate">
                  {selectedImages[index]?.name}
                </p>
              </motion.div>
            </motion.div>
          ))}

          {canAddMore && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`
                relative w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center p-6
                ${isDragOver 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-primary-400'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onClick={(e) => e.stopPropagation()}
                onChange={handleFileInputChange}
                className="sr-only"
              />

              <label htmlFor="file-input" className="absolute inset-0" />
              
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <Upload className="w-12 h-12 text-primary-500 mx-auto" />
              </motion.div>
              
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                上传照片 ({selectedImages.length}/{maxImages})
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                点击或拖拽图片到此处
              </p>
              
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
                选择图片
              </div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
