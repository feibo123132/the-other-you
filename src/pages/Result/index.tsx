import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingView from '../../components/LoadingView';
import ResultCard from '../../components/ResultCard';
import { useGenerationContext } from '../../context/GenerationContext';

const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getTask, startTask } = useGenerationContext();
  const taskId = searchParams.get('id');
  const task = taskId ? getTask(taskId) : null;
  const [isRetrying, setIsRetrying] = useState(false);

  // 如果没有ID或找不到任务，重定向回首页
  useEffect(() => {
    if (!taskId || !task) {
      // 可以在这里加个 toast 提示“任务不存在”
      // navigate('/');
    }
  }, [taskId, task, navigate]);

  // 处理重新生成 (这里稍微复杂，因为要创建新任务)
  const handleRegenerate = async () => {
    if (task && task.selectedOption) {
      setIsRetrying(true);
      try {
        // 需要 Original Image File 对象。
        // 但持久化后我们只有 DataURL。
        // 如果我们想支持重试，我们需要把 DataURL 转回 Blob/File，或者修改 startTask 支持 DataURL。
        // 简单起见，这里演示 DataURL -> Blob
        const res = await fetch(task.originalImageUrl);
        const blob = await res.blob();
        const file = new File([blob], "retry.jpg", { type: blob.type });

        const newTaskId = await startTask([file], task.selectedOption);
        navigate(`/result?id=${newTaskId}`);
      } catch (e) {
        console.error("Retry failed", e);
        alert("重新生成失败");
      } finally {
        setIsRetrying(false);
      }
    }
  };

  // 处理返回
  const handleBack = () => {
    navigate('/');
  };

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="mb-4">找不到该任务</p>
          <button onClick={handleBack} className="text-primary-600 hover:underline">返回首页</button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {task.status === 'processing' || task.status === 'pending' ? (
        // 加载状态
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-screen" 
        >
          <LoadingView progress={task.progress} message={task.progressMessage} onBack={handleBack} />
        </motion.div>
      ) : task.status === 'completed' && task.resultImage ? (
        // 结果展示
        <motion.div
          key="result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ResultCard
            originalImage={task.originalImageUrl}
            resultImage={task.resultImage}
            selectedOption={task.selectedOption}
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
                disabled={isRetrying}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isRetrying ? '提交中...' : '重新生成'}
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
