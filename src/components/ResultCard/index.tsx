import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Share2, ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { downloadImage } from '../../services/imageProcessor';
import { TransformOption } from '../../types/transform';

interface ResultCardProps {
  originalImage: string;
  resultImage: string;
  selectedOption: TransformOption;
  onRegenerate: () => void;
  onBack: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  originalImage,
  resultImage,
  selectedOption,
  onRegenerate,
  onBack,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 下载结果图片
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const fileName = `ai-transform-${selectedOption.label}-${Date.now()}.jpg`;
      await downloadImage(resultImage, fileName);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // 分享功能
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI 图片变换',
          text: `看看我的 ${selectedOption.label} 风格照片！`,
          url: window.location.href,
        });
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  // 拖拽控制（支持鼠标和触摸）
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 重置缩放和位置
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">返回</span>
          </motion.button>
          
          <h1 className="text-base sm:text-lg font-semibold text-gray-800">
            {selectedOption.label} 风格
          </h1>
          
          <div className="w-12 sm:w-16"></div>
        </div>
      </div>

      {/* 图片展示区域 */}
      <div className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* 结果图片 */}
          <div 
            className="relative h-80 sm:h-96 bg-gray-100 overflow-hidden cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              src={resultImage}
              alt="AI 变换结果"
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              drag={false}
            />
            
            {/* 缩放控制按钮 */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <motion.button
                onClick={handleZoomIn}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </motion.button>
              
              <motion.button
                onClick={handleZoomOut}
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ZoomOut className="w-4 h-4 text-gray-700" />
              </motion.button>
              
              <motion.button
                onClick={resetZoom}
                className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-md hover:bg-white transition-colors text-xs font-medium text-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                重置
              </motion.button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* 重新生成 */}
              <motion.button
                onClick={onRegenerate}
                className="flex items-center justify-center space-x-1 sm:space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>重新生成</span>
              </motion.button>

              {/* 下载 */}
              <motion.button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center space-x-1 sm:space-x-2 bg-gradient-to-r from-accent-500 to-orange-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium disabled:opacity-70 text-sm sm:text-base"
                whileHover={{ scale: isDownloading ? 1 : 1.02 }}
                whileTap={{ scale: isDownloading ? 1 : 0.98 }}
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>下载中...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>下载</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* 分享按钮 */}
            <motion.button
              onClick={handleShare}
              className="w-full flex items-center justify-center space-x-1 sm:space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>分享给朋友</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 原始图片对比 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-white rounded-2xl shadow-lg p-4"
        >
          <h3 className="text-sm font-medium text-gray-600 mb-3">原始图片</h3>
          <img
            src={originalImage}
            alt="原始图片"
            className="w-full h-32 object-cover rounded-xl"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ResultCard;