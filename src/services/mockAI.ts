import { TransformOption } from '../types/transform';

class MockAIService {
  private mockImages = [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=800&fit=crop&crop=face',
  ];

  async generateImage(
    originalImage: File, 
    option: TransformOption
  ): Promise<string> {
    // 模拟处理延迟
    await this.simulateDelay(2000, 3000);
    
    // 随机选择一张mock图片
    const randomImage = this.mockImages[
      Math.floor(Math.random() * this.mockImages.length)
    ];
    
    return randomImage;
  }

  private simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // 模拟进度更新
  async *generateImageWithProgress(
    originalImage: File,
    option: TransformOption
  ): AsyncGenerator<{ progress: number; message: string }> {
    const steps = [
      { progress: 0, message: '开始处理...' },
      { progress: 20, message: '分析图片特征...' },
      { progress: 40, message: '应用AI风格...' },
      { progress: 60, message: '优化细节...' },
      { progress: 80, message: '渲染效果...' },
      { progress: 100, message: '完成！' },
    ];

    for (const step of steps) {
      await this.simulateDelay(300, 600);
      yield step;
    }
  }
}

export const mockAIService = new MockAIService();