# 配置 Nginx 实现全站 HTTPS

我将协助您完成 Nginx 配置、后端端口调整以及提供部署脚本。

## 1. 生成 Nginx 配置文件
我将在项目根目录下创建一个 `deploy` 文件夹，并生成 `jieyouyuzhou.cn.conf` 文件，内容包含：
- **HTTP (80) 重定向**：强制跳转 HTTPS。
- **HTTPS (443) 配置**：
    - 加载证书文件（假设路径为 `/etc/nginx/ssl/`）。
    - 反向代理到本地 `http://127.0.0.1:8787`。
    - **SSE 支持**：设置 `proxy_buffering off`、`chunked_transfer_encoding off` 等关键头信息。
    - **静态资源缓存**：针对 `/assets/` 开启长期缓存。
    - **SPA 路由支持**：`try_files $uri $uri/ /index.html`（虽然 Node.js 后端也做了兜底，但在 Nginx 层做效率更高）。

## 2. 修改后端代码 (`server/index.cjs`)
- 将 `PORT` 重新修改回 `8787`。
- 这样 Node.js 仅监听本地端口，由 Nginx 负责对外暴露和 SSL 卸载。

## 3. 提供部署指南
我将在 `deploy/README.md` 中提供详细的 Ubuntu 部署步骤：
- 安装 Nginx。
- 创建证书目录并上传文件。
- 复制配置文件并启用。
- 验证配置并重启 Nginx。

## 执行计划
1.  修改 `server/index.cjs` 恢复端口为 8787。
2.  创建 `deploy/jieyouyuzhou.cn.conf`。
3.  创建 `deploy/README.md`。
