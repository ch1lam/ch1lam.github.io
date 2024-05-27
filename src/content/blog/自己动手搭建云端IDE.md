---
author: chilam
pubDatetime: 2020-07-09 15:50:51
title: 自己动手搭建云端IDE
slug: building-your-own-cloud-based-ide
featured: false
draft: false
tags:
  - linux
  - vscode
  - 玩具
description: 基于 code-server 搭建一个云端 VS Code，随时随地在浏览器上 Coding
---

## 介绍

最近突然想试 [GitHub Codespaces](https://github.com/features/codespaces)，无奈测试资格永远在等待。[Visual Studio Codespaces](https://visualstudio.microsoft.com/zh-hans/services/visual-studio-codespaces/)(原 Visual Studio Online)需要付费。[Coding](https://coding.net/products/cloudstudio)以前用过还是类似 Idea 的版本，现在变成类似 vscode 的样子，应该还是不错的~~（我选择 GitHub Codespaces）~~。

偶然情况下我发现了开源的 [cdr/code-server](https://github.com/cdr/code-server)，只需拥有一台自己的服务器即可实现属于自己的云端 IDE。

## 准备

### 服务器

我用的是阿里云的学生鸡（1 核 2G，2G 内存，40G 硬盘，1M 带宽）

### 下载 tar.gz

> 国外或港澳台地区的 vps 可以跳过这一步

[下载最新版的 code server 文件](https://github.com/cdr/code-server/releases)，如`code-server-3.4.1-linux-x86_64.tar.gz`

## 开始搭建

### 1.登陆 vps

通过 SSH 远程连接服务器或 VNC 登陆

### 2.上传 tar.gz

各显神通的环节，sftp、pscp…… 我是直接在宝塔面板上传的。

国外或港澳台地区的 vps 直接执行以下代码下载 tar.gz（版本号自行修改成最新版本）

```bash
wget https://github.com/cdr/code-server/releases/download/3.4.1/code-server-3.4.1-linux-x86_64.tar.gz
```

### 3.解压 tar.gz

```bash
tar xf code-server-3.4.1-linux-x86_64.tar.gz
```

### 3.安装配置

```bash
# 进入解压后的目录
cd code-server-3.1.1-linux-x86_64
# 设置一个登陆密码
export PASSWORD="mypassowrd"
# 由于code-server默认只能够监听本地地址，也就是 127.0.0.1
# 指定监听地址、监听端口并执行code-server
./code-server --host 0.0.0.0 --port 8080
```

### 4.服务器防火墙配置

进入阿里云**实例安全组**，将 8080 端口打开。

### 5.测试

在浏览器中输入 {**服务器 IP 地址**}:{**code-server 端口**}，并输入刚才设置的密码，进入属于自己的云端 vscode

安装 vscode 常用插件，如简体中文语言包等。

## One more thing

由于在 Safari 浏览器中使用体验比较糟糕，因此通过一款专门为iPad优化的ios应用[Servediter(原 VSApp)](https://servediter.app/)来实现在iPad上流畅的云端IDE体验。

servediter分为付费和免费，搭建在自己服务器上的code server只需要使用免费服务即可。

### 登陆配置

直接选择菜单中的 **Self Hosted Server**，然后根据要求填写刚才部署的code-server相关信息。

![servediter配置](@assets/images/自己动手搭建云端IDE/servediter配置.jpg)

### 效果

![servediter效果](@assets/images/自己动手搭建云端IDE/servediter效果.jpg)

## 总结

在配合servediter使用的条件下，延迟问题不严重。我认为最大的问题还是受制于vps的性能。在和同类产品对比的情况下，code-server的生产力属性相对逊色，我更倾向于把他当成多平台的笔记类应用，支持vscode的大部分插件、使用自己的vps保障了隐私、用浏览器就能登录使用也足够方便。而如果用于编程，我觉得有点南辕北辙，毕竟专业的事交给更专业的工具去做更好。

## 参考文章

1. [搭建自己的云端 IDE](https://brief-rf.gitee.io/code-server/)
2. [为 iPad 部署基于 VS Code 的远程开发环境](https://sspai.com/post/60456)
3. [【编程】云端 IDE 介绍与搭建教程｜｜新的编程方式增加了！](https://www.bilibili.com/video/BV1Zz411i7rp/)
