import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingView from '../../components/LoadingView';
import ResultCard from '../../components/ResultCard';
import { useGeneration } from '../../hooks/useGeneration';
import { TransformOption } from '../../types/transform';

interface LocationState {
  originalImage: File;
  selectedOption: TransformOption;
}

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateImage, currentTask, isGenerating, progress, progressMessage } = useGeneration();
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');

  // 获取传递的数据
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.originalImage || !state?.selectedOption) {
      navigate('/');
      return;
    }

    const url = URL.createObjectURL(state.originalImage);
    setOriginalImageUrl(url);

    generateImage(state.originalImage, state.selectedOption);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  // 处理重新生成
  const handleRegenerate = async () => {
    if (state?.originalImage && state?.selectedOption) {
      await generateImage(state.originalImage, state.selectedOption);
    }
  };

  // 处理返回
  const handleBack = () => {
    navigate('/');
  };

  // 如果没有状态数据，显示加载中
  if (!state) {
    return <div>加载中...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      {isGenerating ? (
        // 加载状态
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoadingView progress={progress} message={progressMessage} />
        </motion.div>
      ) : currentTask?.status === 'completed' && currentTask.resultImage ? (
        // 结果展示
        <motion.div
          key="result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ResultCard
            originalImage={originalImageUrl}
            resultImage={currentTask.resultImage}
            selectedOption={currentTask.selectedOption}
            onRegenerate={handleRegenerate}
            onBack={handleBack}
          />
        </motion.div>
      ) : (
        // 错误状态
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm mx-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-6xl mb-4"
            >
              😅
            </motion.div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              生成失败了
            </h2>
            
            <p className="text-gray-600 mb-6">
              很抱歉，图片生成过程中出现了一些问题。请重试或选择其他风格。
            </p>
            
            <div className="space-y-3">
              <motion.button
                onClick={handleRegenerate}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-xl font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                重新生成
              </motion.button>
              
              <motion.button
                onClick={handleBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                返回首页
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Result;
