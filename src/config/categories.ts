export type CategoryKey = 'style' | 'location' | 'portrait' | 'celebrity' | 'time_travel' | 'dream_jobs' | 'trendy_hair';

export const CATEGORY_ORDER: CategoryKey[] = [
  'style',
  'portrait',
  'celebrity',
  'location',
  'time_travel',
  'dream_jobs',
  'trendy_hair',
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  style: '热门玩法',
  location: '打卡模式',
  portrait: '人物写真',
  celebrity: '明星合照',
  time_travel: '穿梭时空',
  dream_jobs: '大梦想家',
  trendy_hair: '潮流发型',
};
