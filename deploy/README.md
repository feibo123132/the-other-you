# 部署指南 (Ubuntu / Debian)

本指南将帮助你在 Ubuntu 服务器上配置 Nginx 并启用 HTTPS。

## 1. 准备工作

确保你已经拥有以下文件（在你的本地电脑上）：
- `jieyouyuzhou.cn_bundle.crt` (证书文件)
- `jieyouyuzhou.cn.key` (私钥文件)

## 2. 安装 Nginx

登录到你的服务器，执行以下命令：

```bash
sudo apt update
sudo apt install nginx -y
```

## 3. 上传证书

在服务器上创建存放证书的目录：

```bash
sudo mkdir -p /etc/nginx/ssl
```

使用 SCP 或 SFTP 工具将本地的证书文件上传到服务器的 `/etc/nginx/ssl/` 目录。
如果你使用命令行 SCP，可以在**本地电脑**执行：

```bash
# 请替换 user@your_server_ip 为实际的用户名和 IP
scp jieyouyuzhou.cn_bundle.crt user@your_server_ip:/tmp/
scp jieyouyuzhou.cn.key user@your_server_ip:/tmp/
```

然后在**服务器**上移动文件：

```bash
sudo mv /tmp/jieyouyuzhou.cn_bundle.crt /etc/nginx/ssl/
sudo mv /tmp/jieyouyuzhou.cn.key /etc/nginx/ssl/
```

## 4. 应用 Nginx 配置

1. 将本项目中的 `deploy/jieyouyuzhou.cn.conf` 文件内容复制。
2. 在服务器上创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/jieyouyuzhou.cn.conf
```

3. 粘贴内容并保存 (Ctrl+O, Enter, Ctrl+X)。
4. 启用该配置：

```bash
sudo ln -s /etc/nginx/sites-available/jieyouyuzhou.cn.conf /etc/nginx/sites-enabled/
```

5. 测试配置是否正确：

```bash
sudo nginx -t
```

如果看到 `syntax is ok` 和 `test is successful`，则继续。

6. 重启 Nginx：

```bash
sudo systemctl reload nginx
```

## 5. 启动应用

确保你的 Node.js 应用正在运行（推荐使用 PM2）：

```bash
# 进入项目目录
cd /path/to/your/project

# 安装依赖
pnpm install

# 构建前端
npm run build

# 启动后端 (使用 PM2 守护进程)
pm2 start server/index.cjs --name "jieyouyuzhou"
```

现在，访问 `https://jieyouyuzhou.cn` 即可看到你的应用！
