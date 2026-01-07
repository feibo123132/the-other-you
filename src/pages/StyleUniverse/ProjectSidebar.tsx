import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, LayoutDashboard, Image as ImageIcon } from 'lucide-react';
import { useUniverseStore } from './store';
import { compressImage } from '../../services/imageProcessor';

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ isOpen, onClose }) => {
  const { projects, currentProjectId, setCurrentProject, deleteProject, addProject } = useUniverseStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 简单压缩一下作为 Core Image
      const compressedFile = await compressImage(file, 800, 800, 0.8);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        addProject(base64);
        onClose(); // Auto close after adding
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Failed to process image', error);
      alert('图片处理失败');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary-500" />
                宇宙管理
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {projects.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无宇宙项目</p>
                  <p className="text-sm mt-1">点击下方按钮新建</p>
                </div>
              ) : (
                projects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      relative group p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center
                      ${currentProjectId === project.id 
                        ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }
                    `}
                    onClick={() => setCurrentProject(project.id)}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-100">
                      <img src={project.coreImage} alt="Core" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${currentProjectId === project.id ? 'text-primary-700' : 'text-gray-700'}`}>
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定要销毁这个宇宙吗？')) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Create Button */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新建核心宇宙
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectSidebar;
