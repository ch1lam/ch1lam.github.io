---
author: chilam
pubDatetime: 2020-07-06 22:14:21
title: CentOS 7更新git版本
slug: CentOS 7更新git版本
featured: false
draft: false
tags:
  - linux
  - centOS
  - git
  - 教程
description: CentOS 7 默认 git 版本是 1.8，通过源码编译更新 git 版本
---

## 升级 git 版本

由于 CentOS 7 默认的 repo 和 git 官网都没有提供 rpm，那么只有两种方法，1. 通过源码编译，2. 使用第三方的 rpm，这里使用第一种方法。

### 1. 卸载原有的 git

```bash
yum remove git
```

### 2. 安装相关依赖

```bash
yum -y install zlib-devel curl-devel openssl-devel perl cpio expat-devel gettext-devel openssl zlib autoconf tk perl-ExtUtils-MakeMaker
```

### 3. 获取最新的 git 源码包

从[repo](https://link.jianshu.com/?t=https://github.com/git/git/releases)中下载最新稳定版的 zip 包或者 tar.gz 并解压。
以 tar.gz 格式为例（在网页的 tar.gz 上右键复制下载链接即可）

```bash
wget https://github.com/git/git/archive/v2.27.0.tar.gz
tar zxvf v2.27.0.tar.gz
```

解压后得到一个 git-2.27.0 的目录（版本号与下载的一致），然后进入目录

```bash
cd git-2.27.0
```

### 4. 编译安装

```bash
autoconf
./configure
make
make install
```

以上 4 步请一步步来，以免出现错误不好找原因。

### 5. 添加到环境变量中

```bash
echo "export PATH=$PATH:/usr/local/git/bin" >> /etc/profile && source /etc/profile
```

### 6.查看当前 git 版本

```bash
git --version
```

## 参考文章

1. [CentOS 7 升级 Git](https://www.jianshu.com/p/cae9a3b02d9d)
2. [Centos7 升级 Git 版本](https://juejin.im/post/5dae627751882568a71eed5d)
