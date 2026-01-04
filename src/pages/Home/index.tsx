import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Layers, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../../components/ImageUploader';
import StyleSelector from '../../components/StyleSelector';
import TaskListModal from '../../components/TaskListModal';
import { useImageUpload } from '../../hooks/useImageUpload';
import { TransformOption } from '../../types/transform';
import { useGenerationContext } from '../../context/GenerationContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { startTask, tasks } = useGenerationContext();
  const { selectedImage: img1, handleImageSelect: select1, handleImageRemove: remove1 } = useImageUpload();
  const { selectedImage: img2, handleImageSelect: select2, handleImageRemove: remove2 } = useImageUpload();
  const { selectedImage: img3, handleImageSelect: select3, handleImageRemove: remove3 } = useImageUpload();
  const [selectedOption, setSelectedOption] = useState<TransformOption | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  
  // 状态标签逻辑
  const processingCount = tasks.filter(t => t.status === 'processing').length;
  const [showCompletedLabel, setShowCompletedLabel] = useState(false);

  useEffect(() => {
    // 检查是否有最近完成的任务（5秒内）
    const hasRecentCompleted = tasks.some(t => 
      t.status === 'completed' && t.completedAt && (Date.now() - t.completedAt < 5000)
    );
    
    if (hasRecentCompleted) {
      setShowCompletedLabel(true);
      const timer = setTimeout(() => setShowCompletedLabel(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [tasks]);

  // 处理生成按钮点击
  const handleGenerate = async () => {
    const chosen = img1 || img2 || img3;
    const hasPrompt = customPrompt.trim().length > 0 || !!selectedOption;
    if (chosen && hasPrompt && selectedOption) {
      try {
        await startTask(chosen, selectedOption, customPrompt.trim());
        // 不跳转，仅打开任务列表或者提示
        setIsTaskListOpen(true);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  // 检查是否可以生成
  const canGenerate = (img1 || img2 || img3) && (selectedOption || customPrompt.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <TaskListModal isOpen={isTaskListOpen} onClose={() => setIsTaskListOpen(false)} />
      
      {/* 头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 relative"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block mb-3 sm:mb-4"
        >
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500 mx-auto" />
        </motion.div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          世界上的另一个你
        </h1>
        
        <p className="text-gray-600 text-base sm:text-lg">
          上传照片，体验AI变身乐趣
        </p>
        
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium transition-colors"
          >
            作品展示栏
          </button>

          <button
            onClick={() => setIsTaskListOpen(true)}
            className="px-4 py-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md text-gray-700 text-sm font-medium transition-all flex items-center gap-2 relative overflow-hidden"
          >
            <Layers className="w-4 h-4" />
            后台任务
            
            {/* 生成中状态 */}
            <AnimatePresence>
              {processingCount > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="ml-1 bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  生成中
                </motion.span>
              )}
            </AnimatePresence>

            {/* 完成状态 */}
            <AnimatePresence>
              {processingCount === 0 && showCompletedLabel && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  完成啦
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* 主要内容 */}
      <div className="px-4 pb-8 space-y-8">
        {/* 图片上传区域 */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center mb-3 sm:mb-4">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              第一步：上传照片
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded">图1</span>
              <ImageUploader onImageSelect={select1} selectedImage={img1} onImageRemove={remove1} />
            </div>
            <div className="relative">
              <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded">图2</span>
              <ImageUploader onImageSelect={select2} selectedImage={img2} onImageRemove={remove2} />
            </div>
            <div className="relative">
              <span className="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded">图3</span>
              <ImageUploader onImageSelect={select3} selectedImage={img3} onImageRemove={remove3} />
            </div>
          </div>
        </motion.section>

        {/* 风格选择区域 */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
            第二步：选择风格
          </h2>
          
          <StyleSelector
            selectedOption={selectedOption}
            onOptionSelect={setSelectedOption}
          />
        </motion.section>

        {/* Prompt 输入区域 */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
            第三步：输入 Prompt（可选）
          </h2>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="在此输入自定义 Prompt（留空则使用所选风格）"
            className="w-full min-h-[100px] rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="text-xs text-gray-500 mt-2">优先使用自定义 Prompt；为空时使用所选风格提示词</div>
        </motion.section>

        {/* 生成按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-4 px-2 sm:px-4"
        >
          <motion.button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`
              w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300
              ${canGenerate
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            whileHover={canGenerate ? { scale: 1.02 } : {}}
            whileTap={canGenerate ? { scale: 0.98 } : {}}
          >
            {canGenerate ? (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>开始AI变身</span>
              </div>
            ) : (
              '请先上传照片并选择风格'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
