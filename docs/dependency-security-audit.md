# 依赖安全审计（2026-09-29）

针对 Dependabot 邮件中的 fast-uri、ansi-regex、sharp 告警，使用 npm 官方漏洞数据库
审计完整 pnpm 锁文件（包括开发依赖）。修复前有 **8 个受影响的包、21 条漏洞记录**：
15 high、5 moderate、1 low、0 critical。同一个包可能命中多条公告。
修复后同一审计返回 **0 条已知漏洞记录**。这不是对业务代码或第三方服务的全面安全认证。

## 依赖来源与修复

| 包                 | 修复前 | 修复后                         | 记录数 | 当前项目中的用途                                             |
| ------------------ | ------ | ------------------------------ | ------ | ------------------------------------------------------------ |
| fast-uri           | 3.0.6  | 3.1.8                          | 8      | AJV 的 URI 解析；来自 Astro 检查器和 Commitizen / commitlint |
| ansi-regex         | 4.0.0  | 4.x 已移除；现为 5.0.1 / 6.4.0 | 1      | 提交工具等的终端文本处理                                     |
| sharp              | 0.34.5 | 0.35.5                         | 2      | 构建时生成 OG 和处理本地图片                                 |
| brace-expansion    | 1.1.11 | 1.1.21                         | 5      | Commitizen 的文件匹配依赖                                    |
| mdast-util-to-hast | 13.2.0 | 13.2.1                         | 1      | Markdown 转换管线                                            |
| ajv                | 8.17.1 | 8.20.0                         | 1      | 类型检查 / 提交工具的 schema 校验                            |
| picomatch          | 2.3.1  | 2.3.2                          | 2      | lint-staged、lint、提交工具的文件匹配                        |
| yaml               | 2.7.0  | 2.9.1                          | 1      | lint-staged 配置解析                                         |

表中列出的是受影响的旧版本；同一包的其他安全主版本可继续共存。
Sharp 的直接依赖范围改为 `^0.35.5`，与 Astro 使用的版本合并。
其余 7 项最初采用安全 overrides 修复；随后按用户要求批量更新直接依赖并刷新
间接依赖，已移除这些 overrides。AstroPaper 主题版本保持 6.1.0。

## 批量升级后的最终状态

- Vercel Analytics：2.0.1；Speed Insights：2.0.0。
- Satori：0.33.5；Sharp：0.35.5。
- eslint-plugin-astro：3.2.1；lint-staged：17.6.0。
- Prettier：3.9.9；prettier-plugin-astro：1.1.0；按新版格式器重排 Astro 源码。
- 其余直接依赖更新至执行时查询到的稳定版，锁文件同步刷新。
- TypeScript 保持 6.0.3：`@astrojs/check@0.9.10` 的 peer 范围为
  `^5.0.0 || ^6.0.0`，`@typescript-eslint/parser@8.70.1` 要求 `<6.1.0`，
  因此未盲目升级到 TypeScript 7。
- Node 要求随新版 lint 工具调整为 `^22.22.3 || ^24.16.0 || >=26.3.0`；
  已有 `.nvmrc`、CI、Docker 使用的 22.23.2 满足要求。

批量更新去掉旧 overrides 后，原 21 条记录消除，但新版 Satori 明确锁定
`fflate@0.7.3`，新增一条中危记录。仅保留一条 `fflate` 同次版本补丁 override，
升级到 0.7.5+，修复 [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98)。
待 Satori 调整固定版本后可移除该 override。批量升级及此补丁完成后，重新执行
`pnpm audit:security` 返回 `No known vulnerabilities found`；冻结锁文件安装也通过。

## 实际风险

此项目输出静态 `dist/`，没有访客请求驱动的 Node / Sharp 图片处理服务。
fast-uri 和 ansi-regex 的受影响调用链在开发工具中，不会直接作为博客接口暴露给访客。
Sharp 公告涉及处理恶意图片时触发的底层库问题，Markdown 转换问题则需要特别关注
不可信内容进入构建管线的情况。因而风险主要在开发 / 构建阶段；告警本身不是已被入侵的证据。
仍需更新，而不能仅因静态部署就忽略依赖风险。

## 验证

- `pnpm audit --registry=https://registry.npmjs.org --json`：修复前 21，修复后 0。
- Astro / TypeScript 检查：0 errors、0 warnings、0 hints。
- ESLint、Prettier、完整构建通过。
- 迁移回归：15 篇文章、26 个标签、51 个 HTML 页面、RSS、sitemap、中文搜索和 OG 图片通过。

新增 `pnpm audit:security`，CI 在安装后执行此命令。显式使用 npm 官方 registry，
因为本机配置的 npmmirror 返回审计接口不存在，不能将接口失败解释为没有漏洞。
这次修改尚未推送；GitHub 告警状态需要修复进入默认分支、依赖图重新扫描后确认。

## 主要公告

- [ansi-regex ReDoS / CVE-2021-3807](https://github.com/advisories/GHSA-93q8-gq69-wqmw)
- [fast-uri 端口拼接注入](https://github.com/advisories/GHSA-qw65-cvwx-89v3)
- [fast-uri 官方公告列表](https://github.com/fastify/fast-uri/security/advisories)
- [Sharp / libvips 漏洞](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)
- [Sharp / libheif 漏洞](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)
- [Markdown class 属性未清理](https://github.com/advisories/GHSA-4fh9-h7wg-q85m)
- [AJV ReDoS](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6)
- [brace-expansion 资源耗尽](https://github.com/advisories/GHSA-rgw5-rvv9-x895)
- [picomatch ReDoS](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj)
- [YAML 嵌套导致栈溢出](https://github.com/advisories/GHSA-48c2-rrv3-qjmp)
