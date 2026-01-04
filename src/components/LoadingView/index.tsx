import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingViewProps {
  progress: number;
  message: string;
  onBack?: () => void;
}

const LoadingView: React.FC<LoadingViewProps> = ({ progress, message, onBack }) => {
  return (
    <div className="fixed inset-0 bg-gradient-dopamine flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="text-center text-white p-8 relative"
      >
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-0 left-0 p-2 text-white/70 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
        )}
        {/* 动画图标 */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
          className="mb-6"
        >
          <Sparkles className="w-16 h-16 mx-auto" />
        </motion.div>

        {/* 进度条 */}
        <div className="w-64 mx-auto mb-6">
          <div className="bg-white/20 rounded-full h-3 mb-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-white to-white/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          <div className="text-sm font-medium opacity-80">
            {progress}%
          </div>
        </div>

        {/* 消息文本 */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-medium mb-4"
        >
          {message}
        </motion.div>

        {/* 加载动画 */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingView;