## 问题
- CI失败源于 TypeScript 报错：`Property 'style' does not exist on type 'EventTarget & Element'`，位置在 `src/components/ImageUploader/index.tsx` 与 `src/components/StyleSelector/index.tsx` 的触摸事件处理。
- 成因：React 事件未指定泛型，`event.currentTarget` 推断为 `EventTarget & Element`，不包含 `style`。

## 修复方案（最小改动）
- 为触摸事件声明准确类型：
  - `ImageUploader`: `React.TouchEvent<HTMLDivElement>`
  - `StyleSelector.OptionCard`: `React.TouchEvent<HTMLButtonElement>`
- 不改动现有交互逻辑；若后续需要更“React式”写法，可用 Framer Motion 的 `whileTap` 代替内联样式。

## 将执行的更改
- 更新上述两个文件的事件类型签名，保证 `currentTarget.style` 类型安全。
- 运行本地构建验证后，你再触发 Actions 即可通过。

## 预期结果
- CI 的 `Type check` 不再报错；构建继续并通过 Pages 部署。

## 后续可选优化
- 移除直接操作 DOM 样式，使用 `whileTap`/`animate` 统一交互。
