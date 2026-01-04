import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useGenerationContext } from '../../context/GenerationContext';
import { useNavigate } from 'react-router-dom';

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskListModal: React.FC<TaskListModalProps> = ({ isOpen, onClose }) => {
  const { tasks } = useGenerationContext();
  const navigate = useNavigate();

  const handleTaskClick = (taskId: string) => {
    navigate(`/result?id=${taskId}`);
    onClose();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center"
          />
          
          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            onWheel={handleWheel}
          >
            {/* 标题栏 */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                后台任务
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              </h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 任务列表 */}
            <div className="overflow-y-auto p-4 space-y-3 min-h-[200px] bg-gray-50/50">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Clock className="w-12 h-12 mb-3 opacity-20" />
                  <p>暂无后台任务</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* 进度条背景 */}
                    {task.status === 'processing' && (
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-primary-100 w-full"
                      >
                        <motion.div 
                          className="h-full bg-primary-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ type: "spring", stiffness: 50 }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {/* 缩略图 */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={task.resultImage || task.originalImageUrl} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                        {task.status === 'processing' && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* 文本信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-gray-800 truncate">
                            {task.selectedOption.label}
                          </span>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {task.status === 'processing' && (
                            <span className="text-xs text-primary-600 flex items-center gap-1">
                              生成中 {task.progress}%
                            </span>
                          )}
                          {task.status === 'completed' && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> 完成
                            </span>
                          )}
                          {task.status === 'failed' && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> 失败
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskListModal;
