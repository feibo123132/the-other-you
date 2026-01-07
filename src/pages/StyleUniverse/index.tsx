import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Sparkles, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ImageNode from './ImageNode';
import ProjectSidebar from './ProjectSidebar';
import { useUniverseStore } from './store';

// 自定义节点类型映射
const nodeTypes = {
  imageNode: ImageNode,
};

const StyleUniverse: React.FC = () => {
  const navigate = useNavigate();
  const { getCurrentProject } = useUniverseStore();
  const currentProject = getCurrentProject();
  
  // React Flow State
  // 注意：我们需要在 currentProject 变化时更新 nodes/edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync with Store
  useEffect(() => {
    if (currentProject) {
      setNodes(currentProject.nodes);
      setEdges(currentProject.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [currentProject, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-screen bg-slate-50 relative overflow-hidden">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm pointer-events-none">
        {/* Left */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            风格宇宙
            {currentProject && (
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {currentProject.name}
              </span>
            )}
          </h1>
        </div>

        {/* Right: Manage Button */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-sm border border-gray-200 transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            宇宙管理
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <ProjectSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* React Flow 画布 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={4}
      >
        <Background color="#ccc" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor={(node) => {
            return node.id === 'source' ? '#8b5cf6' : '#e2e8f0';
          }}
          style={{ height: 120 }}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};

export default StyleUniverse;
