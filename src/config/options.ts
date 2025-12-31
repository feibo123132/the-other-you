import { TransformOption } from '../types/transform';

export const transformOptions: TransformOption[] = [
  // 风格变换模式
  {
    id: 'ghibli',
    label: '吉卜力',
    icon: '🎨',
    category: 'style',
    promptTemplate: 'Studio Ghibli style, warm hand-drawn animation texture, soft colors, dreamy atmosphere',
  },
  {
    id: 'watercolor',
    label: '水彩漫画',
    icon: '🖌️',
    category: 'style',
    promptTemplate: '手绘水彩漫画风格，色彩浓郁，治愈系水彩质感，高细节插画，干净手绘构图无多余元素，约瑟夫·祖布科维奇水彩风格插图，钢笔和水彩混合媒介，轮廓线清晰，色彩真实，参考实景生成，32k超高清。',
  },
  {
    id: 'Moebius',
    label: '墨必斯风',
    icon: '🌌',
    category: 'style',
    promptTemplate: 'Moebius (Jean Giraud)风格，极繁主义，极致表现力，浪漫感，细节完美，大师杰作',
  },
  {
    id: 'Irasutoya',
    label: '扁平插画',
    icon: '🖍️',
    category: 'style',
    promptTemplate: 'Irasutoya style, flat illustration',
  },
  {
    id: 'sunny-realism',
    label: '阳光写真',
    icon: '✨',
    category: 'style',
    promptTemplate: '采用细腻皮肤真实质感的风格，画面中展现了一个不改变原图形象的脸部特写，通过略微俯视的镜头角度进行呈现。背景营造出清醒系且阳光的场景氛围，人物有着散乱的头发随风飘动的感觉， 发型不变，发丝随风飘动，不改变原片发色。人物的眼神闪闪发光，其中带着阳光和魅惑的情绪，尽显魅惑高冷的气质。画面着重句勒了人物的面部细节，高先处理十分讲究，同时画面虽现出带有摄影机极蓝噪点的画质，并且有着蓝白色通透效果。原比例。原比例。原比例。不要改变人脸比例和形象！！！比例3：4。原比例。原比例。',
  },
  {
    id: 'aquatic-dream',
    label: '水下梦境',
    icon: '🐠',
    category: 'style',
    promptTemplate: '水后时尚人像，面部大特写，极近距离拍摄，眼神直视镜头，神态自然松弛，清透水感妆容，睫毛根根分明，肤质细腻通透，微光在面部高光浮动。人物和数尾迷你热带小鱼在鱼缸前景缓缓穿梭，尾鳍透明灵动，人物用手指和小鱼互动。水面折射出晃动光纹，碎光斑点在脸庞跳跃，水下漂浮粒子环绕，透明水肌理清晰反光。整体氛围梦幻安静，棕黑色系暗调，高级感浓厚，漂浮失焦、动态模糊与细腻胶片颗粒交错，光影写意杰作。整体就是人物在鱼缸玻璃后，和小鱼互动。',
  },
  {
    id: 'scale-figure',
    label: '3D手办',
    icon: '🤖',
    category: 'style',
    promptTemplate: 'Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it.',
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