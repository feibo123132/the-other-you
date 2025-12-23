## 结论与原因
- 结论：出现“Maximum update depth exceeded”是由于 `Result` 页面里 `useEffect` 的依赖包含 `generateImage`，而该函数在 `useGeneration` 中依赖 `currentTask`，每次生成都会改变 `currentTask`，从而使 `generateImage` 的函数引用改变，导致 `useEffect`在每次渲染都再次调用 `setState`，形成无限循环。
- 证据：
  - `src/pages/Result/index.tsx:23-41` 的 `useEffect` 依赖为 `[state, navigate, generateImage]`，内部调用 `setOriginalImageUrl` 和 `generateImage`。
  - `src/hooks/useGeneration.ts:12-15, 75` 中 `generateImage` 使用 `useCallback([...currentTask])`，当 `setCurrentTask` 在 `src/hooks/useGeneration.ts:31,57` 更新后，`generateImage` 的引用随依赖变化，触发 `useEffect`重复执行。
  - 浏览器报错与路径定位一致：`Result (src/pages/Result/index.tsx:26:20)`。

## 修复方案A（推荐，最小改动）
- 修改 `src/pages/Result/index.tsx`：
  - 将 `useEffect` 依赖改为不包含 `generateImage`，只在首次进入或依赖数据稳定时执行：
  - 依赖改为 `[]` 或 `[state?.originalImage, state?.selectedOption]`。
  - 保留 `navigate` 的保护逻辑，但不将其作为触发依赖。
- 预期效果：避免无限循环，进度条按 Mock 服务步进至 100%，随后进入结果页。

## 修复方案B（加固Hook稳定性）
- 修改 `src/hooks/useGeneration.ts`：
  - 将 `generateImage` 的 `useCallback` 依赖改为 `[]`，保持函数引用稳定。
  - 将 `catch` 内对 `currentTask` 的更新改为函数式写法：`setCurrentTask(prev => prev ? { ...prev, status: 'failed' } : prev)`。
- 优点：即使页面误把 `generateImage` 放入依赖，也不易触发循环；整体更健壮。

## 验证步骤
1. 进入首页上传图片并选择风格，点击“开始AI变身”。
2. 观察 `LoadingView`：
   - 文案从“准备开始...”前进为“开始处理...→分析图片特征...→应用AI风格...→优化细节...→渲染效果...→完成！”
   - 进度条从 `0%` 增至 `100%`。
3. 自动进入结果页，显示 `ResultCard`，可点击“再来一次”。
4. 控制台无“Maximum update depth exceeded”。

## 风险与兼容
- 方案A最小改动但依赖开发者不误将不稳定引用加入依赖。
- 方案B提升 Hook 稳定性，推荐与方案A同时应用。

## 请求确认
- 是否按方案A+B一起修复？确认后我将进行修改并完成验证。