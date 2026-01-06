export type PromptCategory = 
  | 'gameplay' 
  | 'portrait' 
  | 'group' 
  | 'travel' 
  | 'time-travel' 
  | 'dreamer' 
  | 'fashion';

export interface PromptItem {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
}

export const promptLibrary: PromptItem[] = [
  // 热门玩法 (gameplay)
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
  },

  // 人物写真 (portrait)
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

  // 明星合照 (group)
  {
    id: 'group-1',
    title: '红毯合影',
    content: '好莱坞红毯现场，闪光灯闪烁，穿着高定礼服，自信微笑，与国际巨星并肩站立，高端大气',
    category: 'group'
  },
  {
    id: 'group-2',
    title: '时尚杂志封面',
    content: 'VOGUE杂志封面风格，专业摄影棚灯光，时尚造型，冷艳表情，与顶级模特合影，极具张力',
    category: 'group'
  },

  // 旅游打卡 (travel)
  {
    id: 'travel-1',
    title: '埃菲尔铁塔',
    content: '法国巴黎，埃菲尔铁塔下，浪漫氛围，手拿咖啡，法式穿搭，蓝天白云，惬意午后',
    category: 'travel'
  },
  {
    id: 'travel-2',
    title: '圣托里尼',
    content: '希腊圣托里尼，蓝白建筑，爱琴海背景，夕阳西下，白色连衣裙，海风吹拂，唯美浪漫',
    category: 'travel'
  },

  // 穿梭时空 (time-travel)
  {
    id: 'time-1',
    title: '80年代迪斯科',
    content: '80年代复古风格，迪斯科舞厅，爆炸头，喇叭裤，霓虹灯球，动感舞姿，怀旧胶片质感',
    category: 'time-travel'
  },
  {
    id: 'time-2',
    title: '民国上海滩',
    content: '民国时期上海滩，旗袍，黄包车，老式街道，复古色调，优雅知性，电影剧照感',
    category: 'time-travel'
  },

  // 大梦想家 (dreamer)
  {
    id: 'dream-1',
    title: '医生',
    content: '参考图1中小孩的面部特征，生成他长大后的医生职业形象，25岁左右，穿着白色医生大褂，戴着听诊器，在医院诊室背景中，专业严肃的表情',
    category: 'dreamer'
  },
  {
    id: 'dream-2',
    title: '老师',
    content: '参考图1中小孩的面部特征，生成他长大后的老师职业形象，25岁左右，穿着休闲格子衫，戴着眼镜，站在黑板前，温和亲切的表情',
    category: 'dreamer'
  },
  {
    id: 'dream-3',
    title: '主播',
    content: '参考图1中小孩的面部特征，生成他长大后的主播职业形象，25岁左右，穿着时尚的休闲装，在现代化的直播间背景中，自信阳光的表情',
    category: 'dreamer'
  },
  {
    id: 'dream-4',
    title: '歌手',
    content: '参考图1中小孩的面部特征，生成他长大后的歌手职业形象，25岁左右，穿着舞台服装，在灯光璀璨的舞台上，充满活力的表情',
    category: 'dreamer'
  },
  {
    id: 'dream-5',
    title: '舞蹈家',
    content: '参考图1中小孩的面部特征，生成他长大后的舞者职业形象，25岁左右，换上一整套嘻哈舞蹈服装，帅气的舞蹈姿势',
    category: 'dreamer'
  },
  {
    id: 'dream-6',
    title: '警察',
    content: '参考图1中小孩的面部特征，生成他长大后的警察职业形象，25岁左右，穿着警服，在警察局或街道背景中，严肃正直的表情',
    category: 'dreamer'
  },
  {
    id: 'dream-7',
    title: '消防员',
    content: '参考图1中小孩的面部特征，生成他长大后的消防员职业形象，25岁左右，穿着消防服和头盔，在消防站背景中，勇敢坚毅的表情',
    category: 'dreamer'
  },
  {
    id: 'dream-8',
    title: '主持人',
    content: '参考图1中小孩的面部特征，生成他长大后的主持人职业形象，25岁左右，穿着正式的主持服装，在演播厅背景中，自信从容的表情',
    category: 'dreamer'
  },

  // 潮流发型 (fashion)
  {
    id: 'fashion-1',
    title: 'Y2K千禧风',
    content: 'Y2K千禧辣妹风，彩色发夹，金属配饰，鲜艳妆容，复古科技感，个性张扬',
    category: 'fashion'
  },
  {
    id: 'fashion-2',
    title: '高冷超模',
    content: '高级灰发色，利落短发，极简主义穿搭，高冷厌世脸，极简背景，高级质感',
    category: 'fashion'
  }
];
