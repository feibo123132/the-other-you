import { TransformOption } from '../types/transform';
import { CategoryKey } from './categories';

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
    id: 'scale-figure',
    label: '3D手办',
    icon: '🤖',
    category: 'style',
    promptTemplate: 'Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it.',
  },
  {
    id: 'sunny-realism',
    label: '阳光写真',
    icon: '☀️',
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
    id: 'watercolor',
    label: '水彩漫画',
    icon: '🖌️',
    category: 'style',
    promptTemplate: '手绘水彩漫画风格，色彩浓郁，治愈系水彩质感，高细节插画，干净手绘构图无多余元素，约瑟夫·祖布科维奇水彩风格插图，钢笔和水彩混合媒介，轮廓线清晰，色彩真实，参考实景生成，32k超高清。',
  },
  {
    id: 'hand-polaroid',
    label: '拍立得',
    icon: '🎞️',
    category: 'style',
    promptTemplate: '将提供的照片转换为一张拍立得（白色相纸边框、底部留白、纸张质感清晰）。一只手从下方拿着这张拍立得，拍立得表面有轻微光泽与颗粒。背景为一张木质桌面，上面随意散落着其他拍立得照片，略微虚化，不要成为主体。整体氛围真实自然，就像在翻看照片时抓拍的瞬间。',
  },
  {
    id: 'Moebius',
    label: '墨必斯风',
    icon: '🌌',
    category: 'style',
    promptTemplate: 'Moebius (Jean Giraud)风格，极繁主义，极致表现力，浪漫感，细节完美，大师杰作',
  },
  {
    id: 'anime',
    label: '日系动漫',
    icon: '🌸',
    category: 'style',
    promptTemplate: 'Japanese anime style, sharp color contrast, detailed features, dynamic pose',
  },
  {
    id: 'Irasutoya',
    label: '扁平插画',
    icon: '🖍️',
    category: 'style',
    promptTemplate: 'Irasutoya style, flat illustration',
  },
  // 打卡模式
  {
    id: 'tiananmen',
    label: '天安门',
    icon: '🏯',
    category: 'location',
    promptTemplate: '图中的人物在天安门广场进行自拍，景点里有不少游客',
  },
  {
    id: 'bund',
    label: '外滩',
    icon: '🌃',
    category: 'location',
    promptTemplate: '图中的人物在上海外滩进行拍照，喝着奶茶，抛出wink',
  },
  {
    id: 'xihu-cute',
    label: '杭州西湖-正脸-俏皮',
    icon: '🚣‍♀️',
    category: 'location',
    promptTemplate: '图中的人物在西湖的标志性建筑旁进行拍照，中景，人物离镜头别太近，摆出俏皮可爱的拍照姿势',
  },
  {
    id: 'xihu-side',
    label: '杭州西湖-侧脸-远眺',
    icon: '🚣‍♀️',
    category: 'location',
    promptTemplate: '图中的人物在西湖的标志性建筑旁进行拍照，中景，人物离镜头别太近，坐在地上，望着湖远方，侧脸',
  },
  // 人物写真
  {
    id: 'sunny-realism',
    label: '阳光写真',
    icon: '☀️',
    category: 'portrait',
    promptTemplate: '采用细腻皮肤真实质感的风格，画面中展现了一个不改变原图形象的脸部特写，通过略微俯视的镜头角度进行呈现。背景营造出清醒系且阳光的场景氛围，人物有着散乱的头发随风飘动的感觉， 发型不变，发丝随风飘动，不改变原片发色。人物的眼神闪闪发光，其中带着阳光和魅惑的情绪，尽显魅惑高冷的气质。画面着重句勒了人物的面部细节，高先处理十分讲究，同时画面虽现出带有摄影机极蓝噪点的画质，并且有着蓝白色通透效果。原比例。原比例。原比例。不要改变人脸比例和形象！！！比例3：4。原比例。原比例。',
  },
  {
    id: 'aquatic-dream',
    label: '水下梦境',
    icon: '🐠',
    category: 'portrait',
    promptTemplate: '水后时尚人像，面部大特写，极近距离拍摄，眼神直视镜头，神态自然松弛，清透水感妆容，睫毛根根分明，肤质细腻通透，微光在面部高光浮动。人物和数尾迷你热带小鱼在鱼缸前景缓缓穿梭，尾鳍透明灵动，人物用手指和小鱼互动。水面折射出晃动光纹，碎光斑点在脸庞跳跃，水下漂浮粒子环绕，透明水肌理清晰反光。整体氛围梦幻安静，棕黑色系暗调，高级感浓厚，漂浮失焦、动态模糊与细腻胶片颗粒交错，光影写意杰作。整体就是人物在鱼缸玻璃后，和小鱼互动。',
  },
  {
    id: 'kuromi-style',
    label: '库洛米风',
    icon: '🎀',
    category: 'portrait',
    promptTemplate: '参考图的面部特征，生成全身工作室肖像：一位甜美的年轻东亚女性坐在浅紫色背景前的地板上，穿着舒适的超大号薰衣草色粗针织毛衣、白色裙子和白色袜子，深情地抱着一个大型三丽鸥库洛米毛绒玩具，温柔地看着镜头。背景装饰有俏皮的手绘紫色涂鸦和文字，包括"A"、“ANNISA”、纸飞机和花朵，风格类似K-pop照片卡或粉丝杂志封面。光线明亮柔和，营造可爱温馨的氛围。',
  },
  {
    id: 'cold-portrait',
    label: '清冷质感',
    icon: '❄️',
    category: 'portrait',
    promptTemplate: '把上传的照片转化为一张通过精准光影与细腻皮肤质感呈现的人像摄影作品： 画面风格是中近景，四分之三侧视角，主体为上传照片中的人物。人物的发丝被阳光照亮，发丝被风吹起，部分刘海和鬓发凌乱地拂过脸颊，头顶发丝略显蓬松。 面部细节精致，眼神温和略带笑意，唇色为偏深的豆沙红，嘴角微微上扬；面部皮肤白皙细腻，带有自然的红晕，尤其是颧骨处，肤质通透。她/他身材纤瘦，如果是女性则穿着一件黑色的细肩带吊带，肩带纤细，紧贴肩膀，露出光洁的脖颈和锁骨，锁骨线条清晰；如果是男性则身穿一件黑色T恤，紧贴肩膀，露出好看的脖颈线条。人物姿态为头部微微一侧倾斜，目光看向画面侧下方，整体呈现出一种安静而略带疏离的情绪。背景是纯黑色，简洁干净，突出主体人物。光线为侧逆光，从画面左侧前方照射过来，在人物左侧脸颊、发丝和肩膀边缘形成明显的高光，勾勒出人物的轮廓，右侧脸颊则处于相对暗的阴影中，形成高对比效果。色调为冷色调，以黑色背景和人物冷白的肤色为主，嘴唇的红色成为画面中唯一的暖色点缀，低饱和。构图上，人物头部位于画面中心偏上位置，头发向左右两侧散开，占据画面大部分空间，形成紧凑而富有张力的构图。画面具有电影感，光影运用营造出氛围感，整体呈现出一种清冷而忧郁的美感。',
  },
  {
    id: 'Boss-Cover',
    label: '大佬封面',
    icon: '💎',
    category: 'portrait',
    promptTemplate: '参考图1形象，生成复古电影海报风格画面：画面下方中央，人物坐在深棕色皮质扶手椅上，身着黑色西装、内搭白色衬衫、系黑色领结，西装左胸口袋露出白色手帕，袖口露出白色衬衫袖口；身体后仰靠在椅背上，双腿并拢，画面左侧的手自然放在膝盖上，手指微屈，画面右侧的手轻轻托着一只黑色猫咪，猫咪身体直立，头部微微抬起，黄色眼睛直视前方；背景为高饱和度正红色纯平面，无纹理渐变；画面中上方白色衬线字体主标题“Cats rule the house, I just pay the rent”居中排版，整体构图垂直居中对称，视觉重心集中在人物面部与文字区域',
  },
  {
    id: 'Summer-portrait',
    label: '夏日写真',
    icon: '🌻',
    category: 'portrait',
    promptTemplate: '参考图1形象和风格，生成夏日写真风格画面：女子梳湿润自然卷发，部分发丝垂落脸颊两侧，皮肤白皙细腻有自然光泽，脸颊泛淡淡粉色红晕，身穿浅色系短款上衣。她位于画面中心，眼睛直视镜头，面部占据主要视觉空间，左手轻轻握着一瓶装有气泡的透明冰凉汽水，瓶身挂着水珠，手部姿态自然放松，背景为简洁浅紫色，光线以柔光为主，亮度适中，突出细腻肌肤与生动表情。',
  },
  {
    id: 'Person-portrait',
    label: '人物肖像',
    icon: '🖼️',
    category: 'portrait',
    promptTemplate: '将图片转换为摄影棚风格的顶级半身肖像照。人物穿着都市休闲服饰，动作自然放松，镜头特写聚焦面部。背景为柔和的渐变色，层次分明，突出主体与背景的分离。画面氛围静谧而温柔，细腻胶片颗粒质感，柔和定向光轻抚面庞，在眼神处留下光点，营造经典黑白摄影的高级氛围。整体保留大量负空间，简洁呼吸，非中心构图。',
  },
  // 明星合照
  {
    id: 'celebrity',
    label: '明星合照',
    icon: '⭐',
    category: 'celebrity',
    promptTemplate: '将提供的两张人物照片合成为一张亲密的合影：两人自然互动（搂肩），色调微暖、轻微暗角与过曝感，真实海边随手拍氛围。',
  },
  {
    id: 'celebrity-pailide',
    label: '明星合照·拍立得',
    icon: '💃',
    category: 'celebrity',
    promptTemplate: '将提供的两张人物照片合成为一张亲密合影的拍立得：白色相纸边框（底部留白），纸面为细腻磨砂颗粒；两人自然互动（搂肩），色调微暖、轻微暗角与过曝感，真实派对随手拍氛围。只输出一张合成图，不要分别生成多张。',
  },
  // 穿梭时空
  {
    id: 'time-child',
    label: '小孩-胖嘟嘟',
    icon: '🧒',
    category: 'time_travel',
    promptTemplate: '这个人10岁时的可爱版本，童年照片，脸颊胖乎乎的，天真的大眼睛，娃娃脸，皮肤质感柔软，穿着 oversized 的童装，怀旧氛围，90年代摄影风格，拿着玩具，保持面部特征的相似度',
  },
  {
    id: 'time-child-normal',
    label: '小孩-正常体重',
    icon: '🧒',
    category: 'time_travel',
    promptTemplate: '这个人10岁时的可爱版本，童年照片，皮肤质感柔软，穿着 oversized 的童装，怀旧氛围，90年代摄影风格，拿着玩具，保持面部特征的相似度',
  },
  {
    id: 'time-teen',
    label: '少年',
    icon: '🧑',
    category: 'time_travel',
    promptTemplate: '一个13岁中学生版本，处于青少年时期，有着年轻的容貌，穿着校服，采用快照风格，相似度极高保持面部特征的相似度',
  },
  {
    id: 'time-young',
    label: '青年',
    icon: '🧑',
    category: 'time_travel',
    promptTemplate: '图中的人物22岁后的模样，带着大学毕业的氛围，穿着学士服，变得更亮眼，下颌线清晰，面部结构成熟，发型时髦，笑容自信，高清摄影，逼真效果，时尚杂志风格',
  },
  {
    id: 'time-middle',
    label: '中年',
    icon: '👨',
    category: 'time_travel',
    promptTemplate: 'Middle-aged portrait style, mature features, balanced lighting, realistic textures, dignified mood',
  },
  {
    id: 'time-elder',
    label: '老年',
    icon: '🧓',
    category: 'time_travel',
    promptTemplate: 'Senior portrait style, gentle contrast, character-rich details, warm tones, respectful aesthetic',
  },
  // 大梦想家
  {
    id: 'job-doctor',
    label: '大梦想家·医生',
    icon: '🩺',
    category: 'dream_jobs',
    promptTemplate: 'Portrait in doctor uniform, hospital environment, clean lighting, professional and caring mood',
  },
  {
    id: 'job-teacher',
    label: '大梦想家·老师',
    icon: '📚',
    category: 'dream_jobs',
    promptTemplate: 'Portrait as teacher in classroom, blackboard background, warm lighting, approachable style',
  },
  {
    id: 'job-streamer',
    label: '大梦想家·主播',
    icon: '🎧',
    category: 'dream_jobs',
    promptTemplate: 'Portrait as streamer, neon ambient lights, desk setup with microphone, modern tech vibe',
  },
  {
    id: 'job-firefighter',
    label: '大梦想家·消防员',
    icon: '🚒',
    category: 'dream_jobs',
    promptTemplate: 'Portrait in firefighter gear, dramatic lighting, heroic mood, city background, strong highlights',
  },
  // 潮流发型
  {
    id: 'hair-big-waves',
    label: '潮流发型·大波浪',
    icon: '💇‍♀️',
    category: 'trendy_hair',
    promptTemplate: 'Big wave curls hairstyle, voluminous textured hair, salon finish, glossy shine',
  },
  {
    id: 'hair-foil-perm',
    label: '潮流发型·锡纸烫',
    icon: '🪙',
    category: 'trendy_hair',
    promptTemplate: 'Textured foil perm hairstyle, tight curls, edgy street style, defined texture',
  },
  {
    id: 'hair-american-spike',
    label: '潮流发型·美式前刺',
    icon: '👨‍🦱',
    category: 'trendy_hair',
    promptTemplate: 'American crop spiky fringe hairstyle, matte finish, clean sides, modern barbershop look',
  },
];

export const getOptionsByCategory = (category: CategoryKey) => {
  return transformOptions.filter(option => option.category === category);
};

export const getOptionById = (id: string) => {
  return transformOptions.find(option => option.id === id);
};
