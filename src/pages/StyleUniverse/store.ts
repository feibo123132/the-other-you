import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge, MarkerType } from 'reactflow';
import { getLayoutedElements } from './layout';

export interface UniverseProject {
  id: string;
  name: string;
  coreImage: string; // Base64 or URL
  nodes: Node[];
  edges: Edge[];
  createdAt: number;
}

interface UniverseState {
  projects: UniverseProject[];
  currentProjectId: string | null;
  
  // Actions
  addProject: (coreImage: string, name?: string) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  getCurrentProject: () => UniverseProject | undefined;
}

// 默认 Demo 数据
const DEMO_SOURCE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
const DEMO_STYLES = [
  { id: 'style-1', label: '吉卜力风格', url: 'https://images.unsplash.com/photo-1535581652167-3d6b98c5b73e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
  { id: 'style-2', label: '赛博朋克', url: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
  { id: 'style-3', label: '粘土人', url: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
];

const createInitialGraph = (sourceUrl: string) => {
  const nodes: Node[] = [
    {
      id: 'source',
      type: 'imageNode',
      data: { imageUrl: sourceUrl, label: '核心照片', isSource: true },
      position: { x: 0, y: 0 },
    },
    ...DEMO_STYLES.map((style) => ({
      id: style.id,
      type: 'imageNode',
      data: { imageUrl: style.url, label: style.label },
      position: { x: 0, y: 0 },
    })),
  ];

  const edges: Edge[] = DEMO_STYLES.map((style) => ({
    id: `e-source-${style.id}`,
    source: 'source',
    target: style.id,
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  }));

  // Apply Layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'LR');
  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export const useUniverseStore = create<UniverseState>()(
  persist(
    (set, get) => ({
      projects: [
        {
          id: 'demo-project',
          name: '示例宇宙',
          coreImage: DEMO_SOURCE,
          createdAt: Date.now(),
          ...createInitialGraph(DEMO_SOURCE),
        }
      ],
      currentProjectId: 'demo-project',

      addProject: (coreImage, name) => {
        const id = `project-${Date.now()}`;
        // 新项目暂时只包含一个核心节点
        const nodes: Node[] = [
          {
            id: 'source',
            type: 'imageNode',
            data: { imageUrl: coreImage, label: '核心照片', isSource: true },
            position: { x: 0, y: 0 }, // 后面会自动布局，或者居中
          }
        ];
        
        // 也可以生成一些占位符风格节点，让图不那么空
        const placeholders = [1, 2, 3].map(i => ({
          id: `placeholder-${i}`,
          type: 'imageNode',
          data: { 
            imageUrl: 'https://placehold.co/200x200/e2e8f0/94a3b8?text=Style+' + i, 
            label: '待生成风格' 
          },
          position: { x: 0, y: 0 },
        }));

        const newNodes = [...nodes, ...placeholders];
        const newEdges = placeholders.map(p => ({
          id: `e-source-${p.id}`,
          source: 'source',
          target: p.id,
          animated: true,
          style: { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5,5' },
        }));
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR');

        const newProject: UniverseProject = {
          id,
          name: name || `宇宙 #${get().projects.length + 1}`,
          coreImage,
          nodes: layoutedNodes,
          edges: layoutedEdges,
          createdAt: Date.now(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: id,
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);
          // 如果删除了当前项目，切换到第一个，或者 null
          let nextCurrentId = state.currentProjectId;
          if (state.currentProjectId === id) {
            nextCurrentId = newProjects.length > 0 ? newProjects[0].id : null;
          }
          return { projects: newProjects, currentProjectId: nextCurrentId };
        });
      },

      setCurrentProject: (id) => {
        set({ currentProjectId: id });
      },

      getCurrentProject: () => {
        const { projects, currentProjectId } = get();
        return projects.find((p) => p.id === currentProjectId);
      },
    }),
    {
      name: 'STYLE_UNIVERSE_PROJECTS',
    }
  )
);
