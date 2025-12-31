## 修改入口与数据流
- 按钮与 Prompt 来自配置：在 `src/config/options.ts` 中新增/编辑 `transformOptions` 条目（id、label、icon、category、promptTemplate），UI会自动渲染。
  - 位置：src/config/options.ts:3-48
- 选择的 Prompt 通过 `useGeneration` 传到后端：`selectedOption.promptTemplate` 被用于发起生成请求。
  - 位置：src/hooks/useGeneration.ts:44
- 后端直接使用前端传入的 `prompt` 调用即梦：无需改动即可生效。
  - 位置：server/index.js:140-147（提交 body 中的 `prompt` 字段）

## 具体改动
1. 在 `src/config/options.ts` 中添加更多按钮
- 新增对象到 `transformOptions` 数组，每个对象即一个按钮：
  - 字段：`id`、`label`、`icon`、`category: 'style' | 'location'`、`promptTemplate`
  - 可选字段：`previewImage`
- 示例（粘贴到数组尾部）：
```ts
{ id: 'oil-paint', label: '油画大师', icon: '🖼️', category: 'style', promptTemplate: 'Oil painting, thick brush strokes, Rembrandt lighting, rich texture' },
{ id: 'desert', label: '撒哈拉', icon: '🏜️', category: 'location', promptTemplate: 'Sahara desert dunes at golden hour, warm tones, travel photo style' },
```
- UI会在 `StyleSelector` 中自动读取：src/components/StyleSelector/index.tsx:17-18,70-99

2. 如需新增“分类”（例如 `character`）
- 扩展类型：`src/types/transform.ts:5` 的联合类型，加入 `'character'`
- 在 `options.ts` 为新分类添加条目，并扩展 `getOptionsByCategory` 过滤：当前即可复用
- 在 `StyleSelector` 增加第三个切换按钮，并在网格里按 `activeCategory` 渲染：
  - 修改处：src/components/StyleSelector/index.tsx:15（状态枚举）、23-67（顶部分类按钮）、70-99（选项列表）

3. Prompt 编写建议
- 结构：风格/光效/构图/细节/负向（必要时）
- 英文更稳定；中文可保留，但建议关键风格用英文术语。
- 示例模板：
  - 风格："Studio portrait, soft diffused light"
  - 构图："half-length shot, centered composition"
  - 细节："high detail skin, realistic textures"
  - 负向："no watermark, no text, no frame"

## 验证
- 在首页选择新增按钮：src/pages/Home/index.tsx:93-96
- 点击“开始AI变身”：按钮会把所选 `promptTemplate` 与图片传给后端，后端生成流程保持不变。

如果你确认，我将按你的清单在 `options.ts` 里先添加 6 个新按钮并优化部分现有 Prompt，随后扩展 `StyleSelector` 支持新分类（如需要）。