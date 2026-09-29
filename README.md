# Tach

Chilam 的静态博客：<https://tach.cc/>。

基于 [AstroPaper 6.1.0](https://github.com/satnaing/astro-paper/releases/tag/v6.1.0)，
已迁移到 Astro 7。升级记录、定制清单和验证结果见 [MIGRATION.md](./MIGRATION.md)。

## 本地运行

推荐使用 `.nvmrc` 固定的 Node.js 22.23.2 和 pnpm 11.19.0。新版 lint 工具要求
Node.js 22.22.3+（22.x）、24.16.0+（24.x）或 26.3.0+。

```sh
nvm use
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

开发地址默认为 `http://localhost:4321`。首次使用搜索前需要执行一次 `pnpm build`，
因为 Pagefind 索引来自构建产物。修改文章后需重新构建以更新搜索索引。

```sh
pnpm check              # Astro / TypeScript 检查
pnpm lint               # ESLint
pnpm format:check       # 代码格式（不重排原有文章）
pnpm build              # 静态构建、OG 图片和 Pagefind 索引
pnpm verify:migration   # 旧链接、RSS、sitemap、OG、资源链接检查
pnpm preview            # 生产构建预览
```

## 配置与内容

- `astro-paper.config.ts`：站点信息、分页、社交链接、功能开关、时区。
- `src/content/blog/`：原有 Markdown 文章，继续使用 frontmatter `slug` 控制 URL。
- `src/content/pages/about.md`：About 正文。
- `src/assets/images/`：文章图片；原有 `@assets` 导入继续可用。
- `src/styles/theme.css`：颜色、字体；页面保留霞鹜文楷和原有粉色暗色主题。
- `src/components/Comment.astro`：Giscus 评论，支持客户端页面切换与主题同步。
- `src/components/Toc.astro`：桌面侧边目录。
- `src/assets/fonts/`：仅构建 OG 图片使用的中文字体及许可。

可选环境变量见 `.env.example`。复制为 `.env` 并填写已有值，或继续使用 Vercel 中
配置的 `GISCUS_REPO`、`GISCUS_REPO_ID`、`GISCUS_CATEGORY_ID`、`GISCUS_lang` 和
`PUBLIC_GOOGLE_SITE_VERIFICATION`。没有完整 Giscus 配置时不加载评论脚本。

## 部署

输出仍是 `dist/`，部署构建命令为 `pnpm build`，依赖安装命令为
`pnpm install --frozen-lockfile`。Vercel 项目的 Node.js 版本应设置为 22.x 或更新的
受支持版本；保留现有域名和环境变量。Vercel Analytics / Speed Insights 仍使用平台
端点，本地预览或 GitHub Pages 不提供这些端点。

GitHub Actions 使用同一 Node / pnpm 配置，执行格式、lint、构建和迁移检查。
如使用 Docker，`docker compose up` 启动开发服务器，`docker build -t tach .` 构建
Nginx 静态镜像。评论和站点验证值可以使用同名 `--build-arg` 传入 Docker 构建。

文章版权约定见 About；主题代码沿用仓库的 MIT 许可，字体许可见
`src/assets/fonts/OFL.txt`。
