import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformOption } from '../../types/transform';
import { getOptionsByCategory } from '../../config/options';

interface StyleSelectorProps {
  selectedOption: TransformOption | null;
  onOptionSelect: (option: TransformOption) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  selectedOption, 
  onOptionSelect 
}) => {
  const [activeCategory, setActiveCategory] = useState<'style' | 'location'>('style');

  const styleOptions = getOptionsByCategory('style');
  const locationOptions = getOptionsByCategory('location');

  return (
    <div className="w-full space-y-6">
      {/* 分类选择器 */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        <motion.button
          className={`
            flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 relative
            ${activeCategory === 'style' 
              ? 'text-white' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
          onClick={() => setActiveCategory('style')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeCategory === 'style' && (
            <motion.div
              layoutId="categoryBackground"
              className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl z-0"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">风格变换</span>
        </motion.button>
        
        <motion.button
          className={`
            flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 relative
            ${activeCategory === 'location' 
              ? 'text-white' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
          onClick={() => setActiveCategory('location')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeCategory === 'location' && (
            <motion.div
              layoutId="categoryBackground"
              className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl z-0"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">打卡模式</span>
        </motion.button>
      </div>

      {/* 选项网格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          {activeCategory === 'style' ? (
            styleOptions.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={selectedOption?.id === option.id}
                onClick={() => onOptionSelect(option)}
              />
            ))
          ) : (
            locationOptions.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={selectedOption?.id === option.id}
                onClick={() => onOptionSelect(option)}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// 选项卡片组件
interface OptionCardProps {
  option: TransformOption;
  isSelected: boolean;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ option, isSelected, onClick }) => {
  // 处理触摸事件
  const handleTouchStart = (event: React.TouchEvent) => {
    const element = event.currentTarget;
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const element = event.currentTarget;
    element.style.transform = 'scale(1)';
    setTimeout(() => {
      element.style.transition = '';
    }, 100);
    onClick();
  };

  return (
    <motion.button
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`
        relative p-4 rounded-2xl border-2 transition-all duration-300 text-center select-none
        ${isSelected
          ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ 
          scale: isSelected ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
        className="text-3xl mb-2"
      >
        {option.icon}
      </motion.div>
      
      <div className={`
        text-xs font-medium transition-colors
        ${isSelected ? 'text-primary-700' : 'text-gray-700'}
      `}>
        {option.label}
      </div>
      
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      )}
    </motion.button>
  );
};

export default StyleSelector;