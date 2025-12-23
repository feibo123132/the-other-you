import { useState, useCallback } from 'react';
import { GenerationTask, TransformOption } from '../types/transform';
import { mockAIService } from '../services/mockAI';

export const useGeneration = () => {
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const generateImage = useCallback(async (
    originalImage: File,
    selectedOption: TransformOption
  ) => {
    try {
      setIsGenerating(true);
      setError('');
      setProgress(0);
      setProgressMessage('准备开始...');

      // 创建任务
      const task: GenerationTask = {
        id: Date.now().toString(),
        originalImage,
        selectedOption,
        status: 'processing',
        createdAt: new Date(),
      };

      setCurrentTask(task);

      // 模拟进度更新
      const progressGenerator = mockAIService.generateImageWithProgress(
        originalImage,
        selectedOption
      );

      for await (const update of progressGenerator) {
        setProgress(update.progress);
        setProgressMessage(update.message);
      }

      // 生成图片
      const resultImage = await mockAIService.generateImage(
        originalImage,
        selectedOption
      );

      // 更新任务状态
      const completedTask: GenerationTask = {
        ...task,
        status: 'completed',
        resultImage,
      };

      setCurrentTask(completedTask);
      return completedTask;
    } catch (error) {
      console.error('生成失败:', error);
      setError('生成失败，请重试');
      
      setCurrentTask(prev => prev ? { ...prev, status: 'failed' } : prev);
      throw error;
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressMessage('');
    }
  }, []);

  const resetGeneration = useCallback(() => {
    setCurrentTask(null);
    setIsGenerating(false);
    setError('');
    setProgress(0);
    setProgressMessage('');
  }, []);

  return {
    currentTask,
    isGenerating,
    error,
    progress,
    progressMessage,
    generateImage,
    resetGeneration,
  };
};
