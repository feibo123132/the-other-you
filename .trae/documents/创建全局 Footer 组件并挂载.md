# 创建并挂载全局 Footer 组件

## 组件实现
### 1. 新建 `src/components/Footer/index.tsx`
- 使用 Tailwind CSS 进行样式设计，确保移动端和桌面端适配。
- **布局结构**：使用 Flexbox (`flex flex-col md:flex-row`) 实现响应式布局，手机端垂直排列，电脑端水平排列。
- **样式细节**：
    - 文字颜色：`text-gray-500`
    - 字体大小：`text-sm`
    - 间距：`py-6` (上下间距), `gap-4` (元素间距)
- **内容填充**：
    - ICP 备案号链接：`https://beian.miit.gov.cn/`
    - 公安备案信息：包含图标 (`http://www.beian.gov.cn/img/ghs.png`) 和链接。

## 全局挂载
### 2. 修改 `src/App.tsx`
- 引入 `Footer` 组件。
- 将 `Footer` 组件放置在 `<Router>` 内部、`<Routes>` 之后，确保在所有页面底部显示。
