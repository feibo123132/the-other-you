import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Layers, CheckCircle, Loader2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../../components/ImageUploader';
import StyleSelector from '../../components/StyleSelector';
import TaskListModal from '../../components/TaskListModal';
import { useImageUpload } from '../../hooks/useImageUpload';
import { TransformOption } from '../../types/transform';
import { useGenerationContext } from '../../context/GenerationContext';
import { getOptionById } from '../../config/options';
import { useAuthStore } from '@/store/useAuthStore';

const STORAGE_PROMPT_KEY = 'THE_OTHER_YOU_DRAFT_PROMPT';
const STORAGE_STYLE_KEY = 'THE_OTHER_YOU_DRAFT_STYLE';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { startTask, tasks } = useGenerationContext();
  const canGenerateByAuth = useAuthStore((state) => state.canGenerate);
  const currentUser = useAuthStore((state) => state.currentUser);
  const { selectedImages, previewUrls, handleImageSelect, handleImageRemove } = useImageUpload();
  const [selectedOption, setSelectedOption] = useState<TransformOption | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  
  // 初始化：恢复 Prompt 和 Style
  useEffect(() => {
    const savedPrompt = localStorage.getItem(STORAGE_PROMPT_KEY);
    if (savedPrompt) setCustomPrompt(savedPrompt);

    const savedStyleId = localStorage.getItem(STORAGE_STYLE_KEY);
    if (savedStyleId) {
      const option = getOptionById(savedStyleId);
      if (option) setSelectedOption(option);
    }
  }, []);

  // 持久化 Prompt
  useEffect(() => {
    localStorage.setItem(STORAGE_PROMPT_KEY, customPrompt);
  }, [customPrompt]);

  // 持久化 Style
  useEffect(() => {
    if (selectedOption) {
      localStorage.setItem(STORAGE_STYLE_KEY, selectedOption.id);
    } else {
      localStorage.removeItem(STORAGE_STYLE_KEY);
    }
  }, [selectedOption]);

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
    if (!canGenerateByAuth) {
      if (!currentUser) {
        alert('请先登录授权邮箱后再使用AI生图功能');
      } else {
        alert('当前账号无AI生图权限，请使用 2421415030@qq.com 登录');
      }
      return;
    }

    const hasPrompt = customPrompt.trim().length > 0;
    const hasStyle = !!selectedOption;

    if (selectedImages.length > 0 && (hasPrompt || hasStyle)) {
      try {
        let finalOption: TransformOption;
        let finalPrompt: string | undefined;

        if (hasStyle && hasPrompt) {
          // Case 1: 风格 + 自定义 Prompt -> 拼接，且覆盖 Label 以显示在任务列表
          finalPrompt = `${customPrompt.trim()}, ${selectedOption!.promptTemplate}`;
          finalOption = {
            ...selectedOption!,
            label: '自定义风格' // 或 `自定义: ${selectedOption!.label}`
          };
        } else if (hasStyle && !hasPrompt) {
          // Case 2: 仅风格 -> 正常使用
          finalPrompt = undefined;
          finalOption = selectedOption!;
        } else {
          // Case 3: 仅自定义 Prompt -> 创建虚拟风格对象
          finalPrompt = customPrompt.trim();
          finalOption = {
            id: 'custom',
            label: '自定义风格',
            icon: '✨',
            category: 'style',
            promptTemplate: '' // 不会被使用，因为 passed customPrompt
          };
        }

        await startTask(selectedImages, finalOption, finalPrompt);
        // 不跳转，仅打开任务列表或者提示
        setIsTaskListOpen(true);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  // 检查是否可以生成
  const canGenerate =
    canGenerateByAuth && selectedImages.length > 0 && (selectedOption || customPrompt.trim().length > 0);

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
          如果去旅行的话，你想去哪里
        </p>
        
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium transition-colors"
          >
            作品展示栏
          </button>

          <button
            onClick={() => navigate('/style-universe')}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium transition-colors flex items-center gap-1"
          >
            <Zap className="w-4 h-4" />
            风格宇宙
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
              第一步：上传照片 (支持最多3张)
            </h2>
          </div>
          <ImageUploader 
            onImageSelect={handleImageSelect} 
            selectedImages={selectedImages} 
            previewUrls={previewUrls}
            onImageRemove={handleImageRemove} 
            maxImages={3}
          />
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
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">优先使用自定义 Prompt；为空时使用所选风格提示词</div>
            <button
              onClick={() => navigate('/prompts')}
              className="text-xs flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
            >
              <Sparkles className="w-3 h-3" />
              打开 Prompt 库
            </button>
          </div>
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
                <span>启动</span>
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
