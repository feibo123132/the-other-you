## 问题结论
- 报错："Unable to locate executable file: pnpm" 出现在 `actions/setup-node@v4` 步骤，因为我们启用了 `cache: 'pnpm'`，该动作会尝试调用 `pnpm` 以获取缓存路径；但默认未开启 Corepack，也未安装 pnpm，导致命令不可用。

## 修复思路
- 让 `pnpm` 在 PATH 中可用，然后再安装依赖与构建。
- 简化为“先安装 Node → 启用 Corepack → 安装 pnpm → 安装依赖 → 构建”。
- 为避免再次触发该类错误，移除 `actions/setup-node` 的 `cache: 'pnpm'`，后续如需缓存再加。

## 我将修改的文件
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`

## 更新后的工作流（替换原内容）

### 1) CI
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

      - name: Enable Corepack
        run: corepack enable

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

### 2) Deploy Pages
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

      - name: Enable Corepack
        run: corepack enable

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Build (set base path for Pages)
        run: pnpm run build -- --base=/the-other-you/

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

## 你的操作
- 我更新工作流后，你只需：
  - 将变更推送到 `main` 或在 Actions 页面点击 “Re-run jobs”。
  - 部署完成后，访问 `https://<你的用户名>.github.io/the-other-you/`。

## 备注
- 若后续需要缓存加速，再安全地引入 `cache: 'pnpm'`（前提：先 `corepack enable` 或使用 `pnpm/action-setup` 使 pnpm 在 PATH 中）。