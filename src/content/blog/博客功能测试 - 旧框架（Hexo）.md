---
author: chilam
pubDatetime: 2020-05-27 20:17:19
title: 博客功能测试 - 旧框架（Hexo）
slug: 博客功能测试-旧框架-Hexo
featured: false
draft: false
tags:
  - test
  - hexo
description: 本文章用于测试博客中的各种功能。
---

## 部署优化

### 利用 git branch 管理 hexo 源文件

新建一个 source 分支用于存储 hexo 源文件，master 分支存储生成后的 html,css,js 文件。
已完成

### 利用 Vercel(原 Zeit) 托管静态页面

已完成

### 图床测试

#### 直接存放在网站中,通过 Vercel 的 CDN 加速

![default.jpg](@assets/images/博客功能测试/default.jpg)

#### 使用[路过图床](https://imgchr.com/)

![tr45m4.jpg](https://s1.ax1x.com/2020/06/05/tr45m4.jpg)

#### 速度对比

> 左为部署在网站中 右为使用图床

##### 傍晚速度(18:00)

![傍晚速度](@assets/images/博客功能测试/傍晚速度.jpg)

##### 晚上速度(21:00)

![晚上速度](@assets/images/博客功能测试/晚上速度.jpg)

## 页面相关功能

### 代码块样式 - mac panel

TODO

### 数学公式 - MathJax

#### 方程组

$$
\begin{equation}\label{2}
   \begin{cases}
   x_n=b_n^{(n)}/a_{nn}^{(n)},\\\\
   x_i=(b_i^{(i)}-\sum\limits_{j=i+1}^n{a_{ij}^{(i)}x_j})/a_{ii}^{(i)}
   \end{cases}
\end{equation}
$$

#### 公式换行

$$
\begin{equation}
　\begin{aligned}
　　f(x)& =f(x_0)+f[x_0,x_1](x-x_0)+f[x_0,x_1，x_2](x-x_0)(x-x_1)+\cdot\cdot\cdot \\\
&\ \ \ \ \ \ +f[x_0,x_1\cdot\cdot\cdot,x_n](x-x_0)\cdot\cdot\cdot(x-x_{n-1}) \\\
&\ \ \ \ \ \ +f[x,x_0\cdot\cdot\cdot,x_n]\omega_{n+1}(x) \\\
　　& =P_n(x)+R_n(x)
　\end{aligned}
\end{equation}
$$

#### 矩阵

$$
\begin{bmatrix}
　　　　3.01 & 6.03 & 1.99 \\\
　　　　1.27 & 4.16 & -1.23 \\\
　　　　0.987 & -4.81 & 9.34
　　　　\end{bmatrix}
　　　　\begin{bmatrix}
　　　　x_1 \\\ x_2 \\\ x_3
　　　　\end{bmatrix} =
　　　　\begin{bmatrix}
　　　　1 \\\ 1 \\\ 1
　　\end{bmatrix}
$$

### 流程图

#### 饼图

<div class="mermaid" width="100%">
    pie title NETFLIX
         "Time spent looking for movie" : 90
         "Time spent watching it" : 10
</div>

#### 序列图

<div class="mermaid" width="100%">
    sequenceDiagram
        Alice ->> Bob: Hello Bob, how are you?
        Bob-->>John: How about you John?
        Bob--x Alice: I am good thanks!
        Bob-x John: I am good thanks!
        Note right of John: Bob thinks a long<br/>long time, so long<br/>that the text does<br/>not fit on a row.

        Bob-->Alice: Checking with John...
        Alice->John: Yes... John, how are you?

</div>

#### 较大的流程图

<div class="mermaid" width="100%">
    graph TB
        sq[Square shape] --> ci((Circle shape))

        subgraph A
            od>Odd shape]-- Two line<br/>edge comment --> ro
            di{Diamond with <br/> line break} -.-> ro(Rounded<br>square<br>shape)
            di==>ro2(Rounded square shape)
        end

        %% Notice that no text in shape are added here instead that is appended further down
        e --> od3>Really long text with linebreak<br>in an Odd shape]

        %% Comments after double percent signs
        e((Inner / circle<br>and some odd <br>special characters)) --> f(,.?!+-*ز)

        cyr[Cyrillic]-->cyr2((Circle shape Начало));

        classDef green fill:#9f6,stroke:#333,stroke-width:2px;
        classDef orange fill:#f96,stroke:#333,stroke-width:4px;
        class sq,e green
        class di orange

</div>

#### 小结

流程图的样式不对，部分较大的流程图会超出页面界限，在 mermaid 的说明文档中也存在这样的问题，估计是 mermaid 的 bug，修复需要自己自定义 css，比较麻烦。考虑到 markdown 中画流程图的语法也不简单，mermaid 生成的 svg 图片无法放大，因此弃用，除简单图外，均使用插入图片形式展示流程图。

### iframe 视频播放

<iframe src="//player.bilibili.com/player.html?aid=85241895&bvid=BV11741167eC&cid=145722126&page=1" width="100%" height="500" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
