## 症状与根因
- 即梦侧并发受限（50430），导致我们“单次 await 等到完成”的模式经常超时（504）。
- 真实生成大概率能成功，但需要排队等待；当前后端阻塞等待 → 前端超时。

## 解决思路（动用所有资源）
- 后端改为“排队+异步处理+SSE 推送进度”：请求立即返回 `taskId`，后台持续重试提交并轮询结果。
- 前端先展示 Mock 结果避免卡顿；同时订阅 SSE，一旦真实结果完成自动替换。

## 后端改造
- 数据结构：内存 `tasks` Map（`{status, progress, message, imageUrl, createdAt}`），`queue` 数组，单 worker 串行处理。
- 接口：
  - `POST /api/generate`：创建任务（包含 prompt、风格、图片摘要）。返回 `{taskId}`；将任务入队并标记 `queued`。
  - `GET /api/progress/:taskId`：SSE 推送状态（`queued/submitting/generating/done/failed`）与进度、提示。
  - `GET /api/result/:taskId`：返回真实结果（若已完成）。
- Worker 逻辑：
  - 从队列取任务 → `submitWithRetry`（指数退避，处理 50430/429/503）→ 成功后轮询直到 `done`。
  - 每一步更新 `tasks` 并向 SSE 客户端广播进度。
  - 超时（如 10–15 分钟上限）标记 `failed`，返回具体错误文案。
- 额外优化：
  - “重复请求合并”：相同参数短时间内仅保留一个后台任务，其他复用结果。
  - “结果缓存”：完成后缓存 N 分钟，以便快速二次展示。

## 前端改造
- `useGeneration.ts`：
  - 调用 `POST /api/generate` 获取 `taskId`；立即进入进度状态，订阅 `GET /api/progress/:taskId` 的 SSE。
  - 并行展示 Mock 结果（标注“演示结果，真实生成完成后自动替换”）。
  - 收到 `done` 事件后，通过 `GET /api/result/:taskId` 拉取真实图，替换当前结果。
  - 若后台最终 `failed`：保留 Mock，并显示清晰错误文案。
- 其它页面无须大改；按钮“重新生成”走同一流程。

## 体验与收益
- 用户不再遇到 504；总能看到即时的演示图，真实结果完成后自动替换。
- 同参数重复生成不会触发多次并发；后台自动排队与重试，极大提高成功率。

## 实施步骤
1. 在后端新增 `tasks`、`queue`、SSE 管道与三个接口；将现有阻塞式 `/api/generate` 改为入队返回。
2. 在前端把 `useGeneration.ts` 切换到“生成→订阅 SSE→替换结果”的模式，保留现有进度 UI。
3. 验证：本地多次点击、并发点击，确保不再超时且真实结果能在完成后替换展示。

## 说明
- 由于供应侧强并发限制，“单 await 直达完成”在峰值下不可行；队列+SSE 是在 MVP 范围内最可靠的解决方案。
- 仍保持本地演示友好：实时展示 Mock，避免现场空白与弹窗打断。