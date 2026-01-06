export interface PromptItem {
  id: string;
  title: string;
  content: string;
  category: 'portrait' | 'gameplay';
}

export const promptLibrary: PromptItem[] = [
  // 人物写真
  {
    id: 'portrait-1',
    title: '海边日系写真',
    content: '日系胶片感，少女在海边奔跑，阳光明媚，海浪拍打沙滩，清新自然，笑容灿烂，高画质',
    category: 'portrait'
  },
  {
    id: 'portrait-2',
    title: '赛博朋克风格',
    content: '赛博朋克风格，霓虹灯光，雨夜街头，高科技装备，冷酷表情，未来感，电影质感',
    category: 'portrait'
  },
  {
    id: 'portrait-3',
    title: '古风汉服',
    content: '中国古风，身穿汉服，手持团扇，站在桃花树下，温婉贤淑，柔美光线，古色古香',
    category: 'portrait'
  },
  // 热门玩法
  {
    id: 'gameplay-1',
    title: '粘土人风格',
    content: '3D粘土人风格，Q版可爱，圆润质感，色彩鲜艳，微缩模型场景，移轴摄影效果',
    category: 'gameplay'
  },
  {
    id: 'gameplay-2',
    title: '皮克斯动画风',
    content: '皮克斯动画电影风格，3D渲染，夸张表情，生动角色，明亮色彩，温馨氛围，细节丰富',
    category: 'gameplay'
  },
  {
    id: 'gameplay-3',
    title: '乐高玩具风',
    content: '乐高积木风格，由乐高积木搭建而成，塑料质感，鲜艳色彩，趣味性，创意拼搭',
    category: 'gameplay'
  }
];
