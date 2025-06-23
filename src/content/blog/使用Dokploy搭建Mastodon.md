---
author: chilam
pubDatetime: 2025-06-18 00:59:24
title: 使用 Dokploy 搭建 Mastodon
slug: deploy-mastodon-with-dokploy
featured: false
draft: false
tags:
  - 教程
  - Dokploy
  - Mastodon
description: 使用 Dokploy 一键部署 Mastodon 的完整教程，包括环境准备、配置、常见坑及优化建议
---

## 前言

想要一块属于自己的“树洞”并不难，难的是兼顾易用与可控。我先后尝试过 Notion、Obsidian 等笔记软件，总感觉差了点味道。直到遇到类 Twitter 的开源社交平台 Mastodon——发布门槛低，又能保留碎片灵感，还能完全掌控数据，才算真正找到答案。

> 本文默认你已经有基本的 docker 与 dokploy 使用经验。同时本文完整记录了我的实战流程与坑点，保证照着做就能跑起来。

## 环境准备

- 云服务器一台：最低 1C2G / 20 GB 磁盘。纯测试可以再压缩，生产建议 2C4G+。
- 已备案域名一枚。
- SMTP 服务：用来发邮件，我选的是 Mailgun。
- 已就绪的 Dokploy 实例（能正常登录 Web 界面即可）。

## 开始部署

### 1. 第一步, 不要看Mastodon官方文档!!!

直接打开代码仓库 ➜  [github.com/mastodon/mastodon](https://github.com/mastodon/mastodon)

官方文档默认“裸机”部署，Docker 方案一笔带过，依赖多到劝退。而在官方仓库中提供了 `docker-compose.yml`，直接复制即可。

### 2. 复制 `docker-compose.yml` 的内容

将仓库中的 [docker-compose.yml](https://github.com/mastodon/mastodon/blob/main/docker-compose.yml) 文件复制到 dokploy 中

![docker-compose](@assets/images/使用Dokploy搭建Mastodon/docker-compose.png)

- 修改数据库配置

![compose-db](@assets/images/使用Dokploy搭建Mastodon/compose-db.png)

- 修改 Redis 服务名（Dokploy 内置了一个 `redis`，避免重名导致指针混乱）

![compose-redis](@assets/images/使用Dokploy搭建Mastodon/compose-redis.png)

- 修改 web 服务：`env_file` 必须写成 `.env`，Dokploy 才能正确注入 Environment 变量

![compose-web](@assets/images/使用Dokploy搭建Mastodon/compose-web.png)

- 修改streaming配置

![compose-streaming](@assets/images/使用Dokploy搭建Mastodon/compose-streaming.png)

- 修改sidekiq配置

![compose-sidekiq](@assets/images/使用Dokploy搭建Mastodon/compose-sidekiq.png)

- 添加volumes配置

![compose-volumes](@assets/images/使用Dokploy搭建Mastodon/compose-volumes.png)

### 3. 填写环境变量

把仓库里的 [`.env.production.sample`](https://github.com/mastodon/mastodon/blob/main/.env.production.sample) 全量复制到 Dokploy 的 **Environment** 标签页，再按照下面截图逐项修改。

![envirorment](@assets/images/使用Dokploy搭建Mastodon/envirorment.png)

- 配置一些基础参数

![env-base](@assets/images/使用Dokploy搭建Mastodon/env-base.png)

### 4. 先部署一次项目

点 Deploy。第一次一定会失败——别慌，这是 Dokploy 在拉镜像 + 构建依赖。后面还要用到刚生成的容器环境，所以先跑一次。

### 5. 生成密钥 并配置

通过ssh连接到vps上,执行以下命令,找到mastodon的web容器id
```bash
docker ps -a
```

记住我们mastodon的服务名,如 `mastodon-demo-mastodon-xxxxx`

然后进入对应的文件夹中
```bash
cd /etc/dokploy/compose/mastodon-demo-mastodon-xxxxx/code
```

利用web容器中的环境依赖生成OPT_SECERT 和 SECERT
需执行两次：第一次生成 `SECRET_KEY_BASE`，第二次生成 `OTP_SECRET`
```bash
docker compose run --rm web bundle exec rails secret
```
把两段值粘到 Dokploy 的 Environment 中对应字段。

![env-secrets](@assets/images/使用Dokploy搭建Mastodon/env-secrets.png)

同样地,在相同目录中执行命令,生成 `ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY`、`ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT`、`ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY`

```bash
docker compose run --rm web bin/rails db:encryption:init
```

![env-encryption](@assets/images/使用Dokploy搭建Mastodon/env-encryption.png)

同样地,在相同目录中执行命令,生成VAPID_PRIVATE_KEY、VAPID_PUBLIC_KEY

```bash
docker compose run --rm web bundle exec rails mastodon:webpush:generate_vapid_key
```

![env-vapid](@assets/images/使用Dokploy搭建Mastodon/env-vapid.png)

### 6. 配置SMTP服务

找到任意一个SMTP服务,配置到dokploy的environment中,这里不赘述

![env-smtp](@assets/images/使用Dokploy搭建Mastodon/env-smtp.png)

### 7. 初始化postgresql数据库

在相同目录中执行命令,初始化postgresql数据库
```bash
docker compose run --rm web bundle exec rails db:setup
```

### 8. 重新部署

再次点击 Deploy，随后在 Web UI 的 **Logs** 面板查看输出，确保各容器无红色报错。

### 9. 配置域名

打开dokploy的domain页,添加域名,并选择开启SSL

![domain](@assets/images/使用Dokploy搭建Mastodon/domain.png)

### 10. 域名解析

- 添加A记录,指向vps的ip

- 添加 SMTP 相关记录（按服务商文档操作）

![dns-smtp](@assets/images/使用Dokploy搭建Mastodon/dns-smtp.png)

### 11. (可选) 配置ES
配置ES相当简单,只需要将compose文件中的es相关服务取消注释,修改相关依赖及volumn配置即可

![compose-es-1](@assets/images/使用Dokploy搭建Mastodon/compose-es-1.png)
![compose-es-2](@assets/images/使用Dokploy搭建Mastodon/compose-es-2.png)
![compose-es-3](@assets/images/使用Dokploy搭建Mastodon/compose-es-3.png)
同时需要配置dokploy的environment中的ES相关配置

![env-es](@assets/images/使用Dokploy搭建Mastodon/env-es.png)

### 12. (可选) 配置OSS
配置OSS可以参考[官方文档](https://docs.joinmastodon.org/admin/optional/object-storage/)
, 我使用的是R2, 比起AWS配置上会有一些限制

只需要修改environment中的OSS相关配置即可,这里注意`S3_PERMISSION`需要设置为空字符串

![env-r2](@assets/images/使用Dokploy搭建Mastodon/env-r2.png)


### 13. 创建管理员账户
参考官网文档创建第一个管理员账号[https://docs.joinmastodon.org/admin/setup/#admin](https://docs.joinmastodon.org/admin/setup/#admin)

像前面一样,找到mastodon的web容器

```bash
docker ps -a
```

借助 web 容器里的依赖创建管理员账号

```bash
docker exec -it mastodon-demo-mastodon-xxxxx-web-1 sh -c "RAILS_ENV=production bin/tootctl accounts create <你的用户名> --email <你的邮箱> --confirmed --role Owner"
```

创建成功就即可登录, 如果SMTP邮箱服务配置正确,会收到一封确认邮件,确认后即可激活账号.

若没收到确认邮件，可先手动激活账号，再回头检查 SMTP 配置。

```bash
docker exec -it mastodon-demo-mastodon-xxxxx-web-1 sh -c "RAILS_ENV=production bin/tootctl accounts approve <你的用户名>"
```

### 14. 完成
一切就绪！快邀请小伙伴来你的实例玩耍吧～


## 写在最后

流程未必最优，但足够把服务跑稳。欢迎在评论区分享你的踩坑与优化心得，也可以直接来我的实例 `https://imaginationlab.com` 找我聊天～

