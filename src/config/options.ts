import { TransformOption } from '../types/transform';

export const transformOptions: TransformOption[] = [
  // 风格变换模式
  {
    id: 'ghibli',
    label: '吉卜力风',
    icon: '🎨',
    category: 'style',
    promptTemplate: 'Studio Ghibli style, warm hand-drawn animation texture, soft colors, dreamy atmosphere',
  },
  {
    id: 'clay',
    label: '黏土风',
    icon: '🏺',
    category: 'style',
    promptTemplate: '3D clay animation style, cute and rounded, smooth textures, vibrant colors',
  },
  {
    id: 'anime',
    label: '日系动漫',
    icon: '🌸',
    category: 'style',
    promptTemplate: 'Japanese anime style, sharp color contrast, detailed features, dynamic pose',
  },
  // 打卡模式
  {
    id: 'eiffel',
    label: '艾菲尔铁塔',
    icon: '🗼',
    category: 'location',
    promptTemplate: 'In front of the Eiffel Tower in Paris, romantic atmosphere, tourist photo style',
  },
  {
    id: 'bund',
    label: '外滩',
    icon: '🌃',
    category: 'location',
    promptTemplate: 'Shanghai Bund night view background, city lights, modern urban atmosphere',
  },
  {
    id: 'tokyo-tower',
    label: '东京塔',
    icon: '🌸',
    category: 'location',
    promptTemplate: 'Tokyo Tower with cherry blossoms, Japanese spring season, pink sakura petals',
  },
];

export const getOptionsByCategory = (category: 'style' | 'location') => {
  return transformOptions.filter(option => option.category === category);
};

export const getOptionById = (id: string) => {
  return transformOptions.find(option => option.id === id);
};