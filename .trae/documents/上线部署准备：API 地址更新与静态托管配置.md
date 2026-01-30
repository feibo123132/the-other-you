# 上线前代码调整计划

根据您的指示，我将执行以下修改以确保项目具备上线条件。鉴于 `package.json` 中定义了 `"type": "module"`，而服务端代码使用 CommonJS (`require`) 语法，我会将服务端文件重命名为 `.cjs` 以避免运行错误。

## 1. 前端 API 地址修改
### 修改文件：`src/services/imageProcessor.ts`
- 将 `API_BASE_URL` 修改为生产环境地址 `https://jieyouyuzhou.cn/api`。

## 2. 后端静态托管与端口配置
### 重命名与修改：`server/index.js` -> `server/index.cjs`
- **重命名**：将文件后缀改为 `.cjs`，以确保在 ESM 项目中正确识别 CommonJS 语法。
- **添加静态托管**：引入 `path` 模块，在 `app.use(cors())` 后添加 `express.static` 托管 `../dist` 目录。
- **SPA 路由支持**：添加通配符路由，将非 `/api` 开头的请求重定向到 `index.html`。
- **端口配置**：将端口变量修改为 `const PORT = 80;`（强制使用 80 端口，以便通过域名直接访问）。
  > **注意**：通常建议使用 `process.env.PORT || 80` 以保持灵活性，但此处将严格遵照您的“强制设为 80”指示，直接赋值为 80。

## 3. 更新 `package.json`
- **修改启动脚本**：将 `"server"` 脚本命令更新为指向新文件：`node server/index.cjs`。
- **确认构建脚本**：现有 `"build"` 脚本 (`tsc -b && vite build`) 已正确配置，无需修改。
