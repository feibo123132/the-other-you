## 问题与原因
- 设备摄像头被强制打开：`capture="environment"` 会在移动端优先调起相机。
- 拍照后“无响应”：iOS/iPad 常生成 `image/heic`，当前校验仅允许 JPG/PNG/WebP；且压缩使用 `<canvas>` 对 HEIC 可能解码失败，导致被拒绝或报错。

## 解决策略
1) 移除 `capture`，保留 `accept="image/*"`，让系统默认弹出“照片库”，用户可再选择拍摄。
2) 放宽文件校验：改为 `file.type.startsWith('image/')`，额外允许 `image/heic`/`image/heif`。
3) 压缩容错：`compressImage` 在无法解码（`img.onerror`）时直接返回原文件，不阻断流程；仍然为支持格式进行压缩。
4) 保持现有可点击输入与覆盖 `label`，确保移动端手势触发稳定。

## 变更文件
- `src/components/ImageUploader/index.tsx`：去掉 `capture`。
- `src/services/imageProcessor.ts`：
  - `validateImageFile` 放宽类型校验。
  - `compressImage` 的 `img.onerror` 改为返回原文件作为降级。

## 验证
- iPad/iPhone：点击上传默认进入“照片库”；选择 HEIC/JPG 正常显示预览与后续生成。
- Android：可选择照片库或拍照；拍照后返回 JPG 正常；若遇到不支持格式则走降级路径。

## 请求确认
- 确认后我将进行上述修改并完成验证。