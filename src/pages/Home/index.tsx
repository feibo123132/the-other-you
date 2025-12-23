import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../../components/ImageUploader';
import StyleSelector from '../../components/StyleSelector';
import { useImageUpload } from '../../hooks/useImageUpload';
import { TransformOption } from '../../types/transform';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedImage, handleImageSelect, handleImageRemove } = useImageUpload();
  const [selectedOption, setSelectedOption] = useState<TransformOption | null>(null);

  // 处理生成按钮点击
  const handleGenerate = () => {
    if (selectedImage && selectedOption) {
      // 将数据传递到结果页面
      navigate('/result', {
        state: {
          originalImage: selectedImage,
          selectedOption: selectedOption,
        },
      });
    }
  };

  // 检查是否可以生成
  const canGenerate = selectedImage && selectedOption;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      {/* 头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4"
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
          
          <ImageUploader
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onImageRemove={handleImageRemove}
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