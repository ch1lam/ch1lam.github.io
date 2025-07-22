---
author: chilam
pubDatetime: 2025-7-22 07:02:53
title: Dokploy 服务迁移实战：从旧 VPS 平滑过渡到新服务器
slug: dokploy-vps-migration
featured: false
draft: false
tags:
  - dokploy
  - 教程
description: 手把手教你如何使用 Dokploy 实现服务平滑迁移：从旧 VPS 快速迁移到新服务器，涵盖数据备份、还原、IP 配置、SSL 申请等完整流程。
---

## 迁移背景

由于 [爪云 (Claw.Cloud) 宣布下线香港优化线路服务器](https://www.landiannews.com/archives/109721.html)，我不得不将现有业务迁移至其他区域。可惜 Claw.Cloud 并未提供一键迁移方案，需要完全自行处理数据与服务搬迁。好在我所有服务均由 **Dokploy** 托管，从准备到完成总计不足 2 小时，过程相当顺利。

## 迁移前准备

### 准备 S3 存储

首先需要一台 S3 兼容的对象存储。我选择 [Cloudflare R2](https://docs.dokploy.com/docs/core/cloudflare-r2) 作为示例，按照官方文档完成 Bucket 与 Access Key 配置即可。

### 备份 docker-compose 服务数据

1. 打开目标服务页面，将服务 **停止**。
2. 进入 **Volume Backups**，点击 **Add Volume Backup**。
3. `schedule` 随意填写（如每日 00:00）。此次备份仅用于迁移，后续可删除该计划。
4. 选择刚刚配置好的 **S3** 存储。
5. 勾选需要备份的卷，参考官方文档 [Volume Backups](https://docs.dokploy.com/docs/core/volume-backups)。
6. 卷名称应符合 `{应用名}_{数据卷名}` 格式。例如应用 `rsshub-server-1finwz` 的 `redis-data` 卷应命名为 `rsshub-server-1finwz_redis-data`。
7. 点击 **Create Volume Backup** 开始备份。

### 备份 Dokploy 服务本身
参考 [Backups](https://docs.dokploy.com/docs/core/backups) 文档，进入 **Web Server Setting → Backups**，点击 **Create Backup** 并根据向导完成备份。

## 在新 VPS 上安装 Dokploy

1. SSH 登录新服务器，执行以下脚本安装 Dokploy：

```sh
curl -sSL https://dokploy.com/install.sh | sh
```

2. 安装完成后 Dokploy 会自动启动。访问 `http://<新IP>:3000`，根据引导完成初始化配置。

> 初始化时的账号信息无须谨慎填写，稍后在恢复备份时会被覆盖。

## Dokploy 还原流程
### 1 恢复 Dokploy 配置

在 **Web Server Setting → Backups** 中点击 **Restore Backup**，选择之前导出的备份文件并开始还原。

### 2 更新服务器 IP

在 **Server → Update IP Address** 中填写新服务器 IP，保存后 Dokploy 会同步更新内部配置。

### 3 重新申请/配置 SSL

进入 **Server Domain** 页面，检查域名，重新申请或导入 SSL 证书并保存。

### 4 配置 Docker Registry（可选）

若在短时间内需要拉取大量镜像，可能触发 Docker Hub 速率限制。提前配置 Registry 凭证可避免构建失败。

按照 [官方指引](https://docs.docker.com/security/access-tokens/) 生成 Personal Access Token，并在 Dokploy 中新增 Registry：
- **Registry Name**：`dockerhub`
- **Username**：Docker 用户名
- **Password**：刚生成的 Token

### 5 还原服务数据卷

此时在 **Projects** 中可见服务已被导入，但镜像尚未构建。**务必先还原数据卷再执行构建**，否则可能出现数据缺失。

进入 **Volume Backups**，点击 **Restore Volume Backup** 并选择对应备份。

全部卷恢复完成后，回到 **General** 页面点击 **Deploy**，耐心等待镜像构建与容器启动。

## DNS 切换与 SSL 更新

最后前往 DNS 服务商将域名 A 记录指向新服务器，耐心等待解析生效。如使用 CDN，也别忘了同步更新源站 IP。
