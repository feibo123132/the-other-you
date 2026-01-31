import localforage from 'localforage';

// 配置 IndexedDB 仓库
const storage = localforage.createInstance({
  name: 'the-other-you-app',
  storeName: 'generation_tasks',
  description: '存储 AI 生成任务及高清图片数据'
});

export const TASK_STORAGE_KEY = 'generation_tasks_v1';

export default storage;