---
author: chilam
pubDatetime: 2024-05-09 06:10:19
title: 将博客从Hexo迁移到Astro
slug: 将博客从Hexo迁移到Astro
featured: false
draft: false
tags:
  - hexo
  - astro
  - blog
  - 教程
description: 抛弃 Hexo，拥抱 Astro！新的框架，新的折腾～
---

## 引言

用了4年的 Hexo，终于是要迁移了。由于 Hexo性能较差，自定义需要学习特定的模版语法，开发维护成本都比较高，偏离了用 markdown 做静态博客的初衷，所以我在两年前就动了心思去重构博客。在经过一番考虑后，认为终极方案就是 Next.js —— SEO 友好，性能好，易与现代前端组件结合，便于自定义。但是有一个致命的缺点就是开发、设计成本高，直接导致了我迟迟未能执行这个计划。

直到我遇到 Astro。

近两年 Astro 在前端圈内爆火，起初我并未在意，觉得这只是又一个内卷产物，徒增学习成本。而在前两天，偶然进入了一个很丝滑的博客，让我大为震惊，点开 About 看见博客的技术栈，用的正是 Astro。这个时候我知道博客迁移的计划不能一拖再拖了。

## 准备工作

### 代码仓库

我直接使用旧框架的仓库，新开了个分支做测试。
当然，直接创建一个新仓库也完全没问题的。

### 静态页面托管服务

我使用的是 Vercel，注册后配置一下权限，便可以直接从 github 导入代码。它能识别导入的项目并自动使用对应的配置模板。

这里有一点需要注意，导入时默认使用 master 分支的代码。在导入之后，可以通过 `Setting` - `Git` - `Production Branch` 设置中修改为指定分支。

### 自定义域名

准备一个域名，后续需要配置域名解析，由于我使用的是 Vercel 托管我的页面，所以域名解析使用 NS (Name Server) 方式，在域名管理后台配置 Vercel 对应的 DNS 服务器即可。

## 迁移过程

### 使用 Astro Paper 主题创建项目

这里使用 pnpm 是因为我在使用 npm/yarn 作为包管理器，在发布时会出现错误。

```shell
# 创建项目
pnpm create astro@latest --template satnaing/astro-paper
```

项目启动的过程中可能会报 `Could not find Sharp` 的错误，可以根据[官方文档](https://docs.astro.build/en/reference/errors/missing-sharp/)去修改对应的配置文件。

我们这里其实不需要使用 Sharp 依赖，如果需要再手动添加依赖即可。

### 配置

对主题做一些基本配置，参考[官方教程 - How to configure AstroPaper theme](https://astro-paper.pages.dev/posts/how-to-configure-astropaper-theme/)配置即可。

### 迁移文章图片链接

由于新旧框架的目录结构不同，导致图片的路径也不一样。参考[官方文档示例 - Storing Images for Blog Content](https://astro-paper.pages.dev/posts/adding-new-posts-in-astropaper-theme/#storing-images-for-blog-content)修改图片路径即可。

### 添加目录树

框架中没有目录树组件，需要自己手撸，这边参考了 [4Ark](https://4ark.me/posts/2024-03-20-hexo-to-astro/#%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95)的文章，以及[Astro cactus 主题的目录树的实现](https://github.com/chrismwilliams/astro-theme-cactus/commit/b8925a8c9cccefc30daf2ca90ebed925ba879af1)。

这里可以直接复制 [4Ark博客仓库Commit](https://github.com/gd4Ark/gd4Ark.github.io/commits/astro-paper/)的代码。

遇到目录树没有hover效果，只需要修改一下样式即可。

> `src/components/TocHeading.astro` 的第**14**行代码，hover样式改为 `hover:text-skin-accent`

```astro
<li class={`${depth > 2 ? "ms-2" : ""}`}>
  <a
    aria-label={`Scroll to section: ${text}`}
    class={`block line-clamp-2 hover:text-skin-accent text-nowrap max-w-[14rem] overflow-hidden overflow-ellipsis ${depth <= 2 ? "mt-3" : "mt-2 text-[0.80rem]"}`}
    href={`#${slug}`}><span class="me-0.5"></span>{text}</a
  >
  {
    !!children.length && (
      <ul>
        {children.map(subheading => (
          <Astro.self heading={subheading} />
        ))}
      </ul>
    )
  }
</li>
```

### 添加评论系统

Astro Paper主题没有带评论模块，所以这里要自己搭建，这里参考了 [Astro 搭建博客系列：添加 giscus 评论系统](https://www.jizhule.cn/posts/astro-%E6%90%AD%E5%BB%BA%E5%8D%9A%E5%AE%A2%E7%B3%BB%E5%88%97%E6%B7%BB%E5%8A%A0-giscus-%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F) 简单配置了一下。

注意.env文件不要提交到远程仓库上面去了。

> 目前有个 bug 是首次进入网页没有加载评论系统，刷新下就好了，不知道是不是懒加载的原因，不太影响使用，后续再处理了。

### 更换主题颜色

夜间模式的颜色比较丑，参考[官方文档 - Predefined color schemes](https://astro-paper.pages.dev/posts/predefined-color-schemes/)简单修改了下。

## 发布配置

### 配置domain

在 Vercel Project 的 `Setting` - `Domains` 中设置自定义的域名。

### 配置环境变量

在 Vercel Project 的 `Setting` - `Environment Variables` 中设置对应的环境变量，我这里只设置了 Giscus 对应的环境变量。

### 重新部署

一般重新提交代码，系统就会自动部署了。在变更了环境变量后，我们需要手动重新部署。

1. 点击 `Project` - `Production Deployment` - `Build Logs` 按钮
2. 点击 `...` 按钮，选择下拉选择框中的 `Redeploy`
3. 稍等片刻，即部署完成

## 总结

总共花了1天左右的时间就把博客迁移到 Astro 了，实际上操作起来迁移成本是小于我估计的。在使用它的过程中，他的易用性也出乎我意料，由于它的语法借鉴了Vue 、React等语言框架优点，再阅读代码的时候几乎没有压力，甚至文档都没有去看，就可以理解了。

同时它能很好的与各种主流前端组件兼容，所以可预见的是日后我需要定制功能，开发过程也是很平滑的。这一点恰好可以弥补他的缺点——添加功能需要额外的开发成本。

总体而言 Astro 作为博客是一个很好的框架，他的所有特性都是为内容网站而做的，Astro 就像是为了制作博客网站量身打造一样。喜欢折腾的朋友一定不要错过！

> 后续博客还需要添加流量统计、站点统计、版权声明等功能，添加完成后再回来更新这篇文章～

## 参考文章

1. [再见 Hexo，你好 Astro！](https://4ark.me/posts/2024-03-20-hexo-to-astro/)
2. [Astro + Vercel 快速搭建自己的博客网站](https://www.jizhule.cn/posts/astro--vercel-%E5%BF%AB%E9%80%9F%E6%90%AD%E5%BB%BA%E8%87%AA%E5%B7%B1%E7%9A%84%E5%8D%9A%E5%AE%A2%E7%BD%91%E7%AB%99)
3. [Astro 搭建个人博客](https://xiaoshu.zhubai.love/posts/2236736097726132224)
