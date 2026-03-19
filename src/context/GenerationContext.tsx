import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { GenerationTask, TransformOption } from '../types/transform';
import { startGeneration, subscribeProgress, fetchResult, mergeImages } from '../services/imageProcessor';
import storage, { TASK_STORAGE_KEY } from '../services/storage';

interface GenerationContextType {
  tasks: GenerationTask[];
  startTask: (originalImages: File[], selectedOption: TransformOption, customPrompt?: string) => Promise<string>;
  getTask: (taskId: string) => GenerationTask | undefined;
  removeTask: (taskId: string) => void;
  resetTasks: () => void;
  isLoaded: boolean; // 新增：数据是否已从 IndexedDB 加载完毕
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

const MAX_CONCURRENT_TASKS = 5;

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const initializedTasksRef = useRef<Set<string>>(new Set());

  // 1. 初始化：从 IndexedDB (localforage) 异步读取
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await storage.getItem<GenerationTask[]>(TASK_STORAGE_KEY);
        if (stored) {
          setTasks(stored);
        }
      } catch (e) {
        console.error('Failed to load tasks from IndexedDB:', e);
      } finally {
        setIsLoaded(true); // 无论成功失败，都标记已加载完毕
      }
    };
    loadTasks();
  }, []);

  // 2. 持久化同步：当 tasks 变更时写入 IndexedDB
  useEffect(() => {
    // 重要：只有在初始化加载完成后，才允许写入，防止空状态覆盖旧数据
    if (isLoaded) {
      storage.setItem(TASK_STORAGE_KEY, tasks).catch(e => {
        console.error('Failed to save tasks to IndexedDB:', e);
      });
    }
  }, [tasks, isLoaded]);

  // 3. 核心监控逻辑
  const monitorTask = useCallback((taskId: string) => {
    // 防止对同一个任务进行重复监听
    if (initializedTasksRef.current.has(taskId)) return;
    initializedTasksRef.current.add(taskId);

    let es: any = null;
    let isMonitoring = true;

    const updateTask = (updates: Partial<GenerationTask>) => {
      if (!isMonitoring) return;
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      ));
    };

    // 订阅进度
    subscribeProgress(taskId, (u) => {
      updateTask({
        progress: u.progress,
        progressMessage: u.message
      });
    })
      .then((eventSource) => {
        es = eventSource;
      })
      .catch((err) => {
        console.error(`Subscribe progress failed for task ${taskId}:`, err);
      });

    // 轮询结果
    const pollResult = async () => {
      while (isMonitoring) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const resultImage = await fetchResult(taskId);
          if (resultImage) {
            updateTask({
              status: 'completed',
              resultImage,
              progress: 100,
              progressMessage: '完成！',
              completedAt: Date.now()
            });
            isMonitoring = false;
            es?.close();
            initializedTasksRef.current.delete(taskId);
            break;
          }
        } catch (e: any) {
          const msg = e?.message || String(e);
          if (!msg.includes('未完成')) {
            console.error(`Task ${taskId} failed:`, e);
            updateTask({ status: 'failed', progressMessage: '生成失败' });
            isMonitoring = false;
            es?.close();
            initializedTasksRef.current.delete(taskId);
            break;
          }
        }
      }
    };

    pollResult();
  }, []);

  // 4. 自动恢复机制：当数据加载完毕后，重启进行中的任务监听
  useEffect(() => {
    if (isLoaded) {
      tasks.forEach(task => {
        if (task.status === 'processing') {
          console.log('Resuming task monitoring:', task.id);
          monitorTask(task.id);
        }
      });
    }
  }, [isLoaded]); // 仅在 isLoaded 变为 true 时触发一次

  const startTask = async (originalImages: File[], selectedOption: TransformOption, customPrompt?: string): Promise<string> => {
    const runningCount = tasks.filter(t => t.status === 'processing').length;
    if (runningCount >= MAX_CONCURRENT_TASKS) {
      throw new Error(`同时进行的任务不能超过 ${MAX_CONCURRENT_TASKS} 个`);
    }

    let dataUrl: string;
    try {
      dataUrl = await mergeImages(originalImages);
    } catch (e) {
      throw new Error('处理图片失败');
    }

    const tempId = `temp-${Date.now()}`;
    const newTask: GenerationTask = {
      id: tempId,
      originalImageUrl: dataUrl,
      selectedOption,
      status: 'processing',
      createdAt: Date.now(),
      progress: 0,
      progressMessage: '准备开始...',
    };

    setTasks(prev => [newTask, ...prev]);

    try {
      const realTaskId = await startGeneration(customPrompt || selectedOption.promptTemplate, dataUrl, 0.5);
      
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: realTaskId, progress: 10, progressMessage: '已提交...' } : t));
      
      monitorTask(realTaskId);
      return realTaskId;

    } catch (error) {
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, status: 'failed', progressMessage: '提交失败' } : t));
      throw error;
    }
  };

  const getTask = (taskId: string) => tasks.find(t => t.id === taskId);
  const removeTask = (taskId: string) => setTasks(prev => prev.filter(t => t.id !== taskId));
  const resetTasks = () => setTasks([]);

  return (
    <GenerationContext.Provider value={{ tasks, startTask, getTask, removeTask, resetTasks, isLoaded }}>
      {children}
    </GenerationContext.Provider>
  );
};

export const useGenerationContext = () => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGenerationContext must be used within a GenerationProvider');
  }
  return context;
};
