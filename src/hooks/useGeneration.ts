import { useState, useCallback } from 'react';
import { GenerationTask, TransformOption } from '../types/transform';
import { startGeneration, subscribeProgress, fetchResult } from '../services/imageProcessor';
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

      setProgress(10);
      setProgressMessage('提交任务...');

      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('读取图片失败'));
        reader.readAsDataURL(originalImage);
      });

      const taskId = await startGeneration(selectedOption.promptTemplate, dataUrl, 0.5);

      let es: EventSource | null = null;
      es = subscribeProgress(taskId, (u) => {
        setProgress(u.progress);
        setProgressMessage(u.message);
      });

      // 可选：若排队/生成较久，使用本地 Mock 占位
      const fallbackTimer = setTimeout(async () => {
        if (progress < 30) {
          const progressGenerator = mockAIService.generateImageWithProgress(originalImage, selectedOption);
          for await (const update of progressGenerator) {
            setProgress(update.progress);
            setProgressMessage(update.message);
          }
          const mockUrl = await mockAIService.generateImage(originalImage, selectedOption);
          setCurrentTask(prev => prev ? { ...prev, resultImage: mockUrl } : prev);
        }
      }, 3000);

      let resultImage: string = '';
      // 轮询真实结果直到完成
      for (;;) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          resultImage = await fetchResult(taskId);
          break;
        } catch (e) {
          const msg = String((e as any)?.message || e);
          if (!msg.includes('未完成')) throw e;
        }
      }
      clearTimeout(fallbackTimer);
      if (es) es.close();

      // 更新任务状态
      const completedTask: GenerationTask = {
        ...task,
        status: 'completed',
        resultImage,
      };

      setProgress(100);
      setProgressMessage('完成！');
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
