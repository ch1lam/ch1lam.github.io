---
author: chilam
pubDatetime: 2025-02-18 09:38:53
title: 如何使用Dokploy在二级域名中部署RssHub
slug: deploy-rsshub-with-dokploy-on-subdomain
featured: false
draft: false
tags:
  - linux
  - 教程
  - rsshub
  - dokploy
  - vercel
description: 如何使用Dokploy快速部署和管理RSSHub实例，同时使用二级域名，分别管理 Dokploy Dashboard 以及 RssHub 的具体步骤
---

## 引言
最近趁着黑五优惠入手了一台Claw服务器，正好可以用来部署一些自用服务。最终决定将RSSHub部署到自己的服务器上，同时利用在博客上在用的域名做二级域名。

## 服务安装及配置

### 安装RssHub

由于使用了dokpoly部署，因此可以直接创建一个project，添加一个compose，并在raw中粘贴 [docker-compose](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)的内容。根据自己需要配置compose文件。

执行depoly,稍等片刻就可以打开。默认地址是 `{ip}:1200`。
![docker-compose.yml config](@assets/images/使用Dokploy在二级域名中部署RssHub/docker-compose.png)

### 配置RssHub密钥

接下来配置rsshub的密钥，自定义一个key，并且修改docker-compose。
![access key config 1](@assets/images/使用Dokploy在二级域名中部署RssHub/access-key-config-1.png)

给访问路径加上密钥

![access key config 2](@assets/images/使用Dokploy在二级域名中部署RssHub/access-key-config-2.png)

## 域名配置

域名这部分我是在nameslio上购买的域名，解析到Vercel的name server中，因此我添加二级域名的解析是需要在Vercel后台中配置。

### Nameslio域名配置

首先在域名供应商处配置，因为我博客一直使用name server所以就不打算更改了。

![nameslio domain config](@assets/images/使用Dokploy在二级域名中部署RssHub/nameslio-domain-config.png)

这样可以免费利用上vercel的cdn加速。

### 【关键】Vercel域名配置

接下来是配置的关键，先在Vercel的控制台中找到自己的域名配置，进入详情页。

![vercel domain config 1](@assets/images/使用Dokploy在二级域名中部署RssHub/vercel-domain-config-1.png)

找到`DNS Records` 添加二级域名，类型选择A type，指向要新增服务的主机IP，这里是我在其他服务器上部署的RssHub服务。

![vercel domain config 2](@assets/images/使用Dokploy在二级域名中部署RssHub/vercel-domain-config-2.png)

### Dokploy域名配置

最后回到Dokploy控制台，在对应服务中的domain配置项，添加刚才在vercel新增的二级域名。服务的端口号使用默认的即可。

![dokploy domain config 1](@assets/images/使用Dokploy在二级域名中部署RssHub/dokploy-domain-config-1.png)

![dokploy domain config 2](@assets/images/使用Dokploy在二级域名中部署RssHub/dokploy-domain-config-2.png)

接着修改docker-compose中的配置。

![traefik config](@assets/images/使用Dokploy在二级域名中部署RssHub/traefik-config.png)

重启服务即可！

## 大功告成

e.g. 比如要订阅联合早报，可以在rss阅读器上添加订阅源：
```
https://rsshub.tach.cc/zaobao/realtime/china?key={ACCESS_KEY}
```