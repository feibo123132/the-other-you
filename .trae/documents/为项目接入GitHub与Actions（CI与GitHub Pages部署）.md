## 我将完成的内容（获批后执行）
- 新增两条工作流：
  1) `.github/workflows/ci.yml`：在每次 push/PR 时自动安装依赖（pnpm）、类型检查、构建。
  2) `.github/workflows/deploy-pages.yml`：在 push 到 `main` 时构建并部署到 GitHub Pages。
- 采用 `pnpm`，启用缓存以加速。
- 构建时通过参数设置 Vite `base`，保证 GitHub Pages 子路径资源地址正确，无需修改代码。

## Actions 工作流文件

### 1) CI：`.github/workflows/ci.yml`
```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm exec tsc -p tsconfig.json --noEmit

      - name: Build
        run: pnpm run build
```

### 2) 部署到 GitHub Pages：`.github/workflows/deploy-pages.yml`
```yaml
name: Deploy Pages
on:
  push:
    branches: [ main ]

permissions:
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Build (set base path for Pages)
        run: pnpm run build -- --base=/${{ github.event.repository.name }}/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

说明：如果仓库命名为 `<username>.github.io`（用户主页仓库），请把上面 `--base=/${{ github.event.repository.name }}/` 改成 `--base=/`。

## 你需要执行的步骤
- 在 GitHub 上新建空仓库（建议 `the-other-you`）。
- 在本地项目根目录执行：
  - `git init`
  - `git add -A`
  - `git commit -m "feat: init project"`
  - `git branch -M main`
  - `git remote add origin https://github.com/<your-username>/<repo>.git`
  - `git push -u origin main`
- 在 GitHub 仓库：Settings → Pages → Build and deployment → Source 选择 “GitHub Actions”。
- 打开仓库 “Actions” 页面，确认两条工作流运行成功：
  - CI 通过
  - Deploy Pages 完成并显示访问链接
- 通过 `https://<your-username>.github.io/<repo>/` 访问部署结果。

## 可选增强（后续）
- 在 CI 中添加 `eslint` 与 `prettier` 检查。
- 为 PR 增加 Preview 构建（例如上传构建产物到 artifacts 供下载）。
- 若使用自定义域名，新增 `public/CNAME` 文件，并在仓库 Pages 绑定域名。

## 确认
- 确认后我将把上述两个工作流文件加入项目并推送说明，完成端到端验证。