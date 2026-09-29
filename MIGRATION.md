# Astro / AstroPaper 升级记录

日期：2026-09-29。

## 版本与方法

- Astro：4.16.18 → **7.3.5**（执行时 npm `latest`）。
- AstroPaper：4.8.0 → **6.1.0**，来源为正式 tag `v6.1.0`，
  commit `4c33a60529f9c443145a89fe526ff231c009272d`。
- Tailwind CSS：3 → 4；React / Fuse.js 搜索替换为主题内置 Astro 组件 / Pagefind。
- 内容集合切换到 `src/content.config.ts`、`glob()` loader 和 `render()`。
- `ViewTransitions` 替换为 `ClientRouter`。
- Astro 7 保留 `unified()` Markdown 管线，继续支持 remark-toc、remark-collapse，
  并引入主题自带 callouts、代码标注和图片灯箱。
- `compressHTML: true` 保留原有 HTML 空格行为。
- 原有 jampack 后处理移除，使用 Astro / Sharp 优化本地图片；构建后生成静态搜索索引。

采用正式主题源码替换旧主题实现，再迁回站点定制的方式。没有引入上游演示文章、
默认作者或社交账号，原有文章与图片保留在原路径。将来升级先对比上述上游 tag，
重点核对下表的本地差异。

## 保留的定制

| 内容                                          | 当前位置 / 兼容方式                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| 域名、Tach、chilam、社交链接、6 / 5 分页      | `astro-paper.config.ts`                                                    |
| 中文首页                                      | `src/pages/index.astro`                                                    |
| About 正文                                    | `src/content/pages/about.md`，访问地址仍为 `/about/`                       |
| 15 篇文章与所有图片                           | `src/content/blog/` / `src/assets/images/` 原样保留                        |
| 文章 URL                                      | `glob()` 自动读取已有 `slug`，包括带大写 Hexo 的中文 slug                  |
| 标签 URL                                      | 保留 lodash.kebabcase，避免 javaScript / centOS 等标签改址                 |
| 原图片导入                                    | `tsconfig.json` 保留 `@assets/*` 别名                                      |
| 中文日期与时间                                | `Datetime.astro`，明确 `Asia/Shanghai` 时区，消除构建机时区差异            |
| 霞鹜文楷、配色、字距                          | `Layout.astro` / `styles/theme.css` / `styles/global.css`                  |
| 桌面侧边目录                                  | `Toc.astro` / `TocHeading.astro` / `generateToc.ts`，长目录可滚动          |
| Giscus                                        | 原环境变量名和 `og:title` 映射，文章标题仍为 `标题 \| Tach`                |
| 广告 / Vercel 统计 / 站点验证                 | `Layout.astro`，广告发布者 ID 与 `ads.txt` 保留                            |
| 中文 OG                                       | 主题新版 OG 模板 + 本地 LXGW WenKai Lite 字体，不再构建时请求 Google Fonts |
| 编辑链接                                      | 原仓库 master 分支 + 原 Markdown 文件路径                                  |
| RSS、归档、标签、分页、分享、进度条、复制代码 | 采用 6.1.0 实现并检查现有内容                                              |
| Commitizen / Husky / lint-staged              | 保留原有开发工作流                                                         |

## 兼容修正

- RSS 自动发现使用文件路径 `/rss.xml`，避免 locale helper 添加 `/rss.xml/`。
- 文章只输出一个 `og:type=article`，避免与网站默认元数据重复。
- OG 图片地址改为与文章 slug 一致的 `/posts/<slug>/index.png`，修复原来标题与
  slug 混用导致的 OG 引用错误。
- Giscus 在 `astro:page-load` 挂载、页面离开时清理主题 observer；观察 `data-theme`
  更新后再同步，避免读取切换前的主题。未配置时不发出无效请求。
- Node / pnpm / 锁文件与 CI、Docker 同步；修复旧 Docker 忽略所有 `.astro` 文件的问题。
- 浏览器字体仍使用原 cdnjs 地址；仅 OG 字体离线，字体文件不会发送给访客。

## 验证与范围

执行 `pnpm build` 后运行 `pnpm verify:migration`，以 `scripts/fixtures/legacy-posts.json`
记录的升级前 15 篇文章为基线，验证原有文章及标签 URL、
canonical、RSS、sitemap、中文搜索索引、1200×630 OG 图片、编辑链接和站内资源。
真实浏览器检查首页、文章、明暗切换、中文搜索、桌面目录和移动布局。

本次通过：冻结锁文件安装、Astro 检查（0 错误 / 0 警告）、ESLint、Prettier、
完整构建，以及 15 篇旧文章 / 26 个标签 / 51 个 HTML 页面的资源检查。
Playwright 验证中文“精度”搜索命中、搜索到文章导航、1440px 桌面目录、390px
移动端无横向溢出；使用拦截脚本验证 Giscus 配置、主题消息、离开和返回页面时重新挂载。
浏览器 QA 截图位于本地 `output/playwright/`（不提交）。

旧 Hexo 功能测试文章有一段未渲染的 LaTeX，被 Markdown 解释成 `x-x_0` 相对链接；
这是原文章已有内容，检查器仅对该精确位置保留例外，未修改历史正文或额外引入数学插件。

本地没有生产 Giscus 环境变量，因此真实 GitHub 评论加载、Vercel 数据上报和广告投放
需要在带原环境配置的部署中确认。本次只完成本地迁移，没有推送或部署。

## 参考

- [AstroPaper 6.1.0](https://github.com/satnaing/astro-paper/releases/tag/v6.1.0)
- [AstroPaper 6 迁移说明](https://github.com/satnaing/astro-paper/blob/v6.1.0/src/content/posts/_releases/astro-paper-6.md)
- [Astro 5 迁移](https://docs.astro.build/en/guides/upgrade-to/v5/)
- [Astro 6 迁移](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Astro 7 迁移](https://docs.astro.build/en/guides/upgrade-to/v7/)
