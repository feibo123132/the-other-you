import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';

export interface ImageNodeData {
  imageUrl: string;
  label: string;
  isSource?: boolean;
}

const ImageNode: React.FC<NodeProps<ImageNodeData>> = ({ data, isConnectable }) => {
  const isSource = data.isSource;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 100 }}
      className="relative flex flex-col items-center"
    >
      {/* 节点主体 */}
      <div 
        className={`
          relative rounded-full overflow-hidden shadow-lg border-4 transition-all duration-300
          ${isSource 
            ? 'w-32 h-32 border-primary-500 shadow-primary-200/50 z-10' 
            : 'w-24 h-24 border-white hover:border-secondary-300 z-0'
          }
        `}
      >
        <img 
          src={data.imageUrl} 
          alt={data.label} 
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* 光效遮罩 (仅原图) */}
        {isSource && (
          <div className="absolute inset-0 ring-4 ring-primary-300/30 rounded-full animate-pulse" />
        )}
      </div>

      {/* 标签 */}
      <div 
        className={`
          mt-3 px-3 py-1 rounded-full text-sm font-medium shadow-sm
          ${isSource 
            ? 'bg-primary-500 text-white' 
            : 'bg-white text-gray-700 border border-gray-100'
          }
        `}
      >
        {data.label}
      </div>

      {/* 连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!bg-gray-300 !w-3 !h-3 !-ml-1.5"
        style={{ opacity: isSource ? 0 : 1 }} // 原图没有输入
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!bg-primary-400 !w-3 !h-3 !-mr-1.5"
        style={{ opacity: isSource ? 1 : 0 }} // 只有原图有输出 (在放射布局中)
      />
    </motion.div>
  );
};

export default memo(ImageNode);
