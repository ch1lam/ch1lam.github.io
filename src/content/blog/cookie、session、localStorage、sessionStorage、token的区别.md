---
author: chilam
pubDatetime: 2022-05-02 14:46:49
title: cookie、session、localStorage、sessionStorage、token的区别
slug: cookie、session、localStorage、sessionStorage、token的区别
featured: false
draft: false
tags:
  - javaScript
description: 区分 cookie、session、localStorage、sessionStorage、token 的概念、工作机制、应用场景以及异同点
---

## cookie、session、localStorage、sessionStorage、token 的区别

### 先避坑

- 这里的 token 和上述的几个概念不是同一种东西，token 是一种方法/手段。
- localStorage 和 sessionStorage 统称 webStorage，是 html5 中提出来的，存粹为了保存数据，不会与服务端通信。

### 概念

> HTTP 协议本身是无状态的。什么是无状态呢，即服务器无法判断用户身份

- **cookie** —— 它实际上是一小段的**文本信息**（key-value 格式），它的大小限制在 4KB 左右。当客户端向服务器发起请求，如果服务器需要记录该用户状态，就使用 response 向客户端浏览器发送一个 cookie。客户端浏览器会把 cookie 保存起来。当浏览器再请求该网站时，浏览器把请求的网址连同该 cookie 一同提交给服务器。服务器检查该 cookie，以此来**辨认用户状态**。
- **session** —— 是另一种记录客户状态的机制，保存在服务器中，**相当于程序在服务器上建立的一份用户的档案，用户来访的时候只需要查询用户档案表就可以了。**
- **webStorage** —— 本地存储，存储在客户端，包括 `localStorage` 和 `sessionStorage`。存放数据一般大小为 5MB，而且它仅在客户端（即浏览器）中保存，**不参与和服务器的通信**。

  - **localStorage** —— 数据会**永久保存**在客户端中，直到用户自己清除 localStorage 信息。
  - **sessionStorage** —— 数据存储**仅在当前会话下有效**，关闭页面或浏览器后它将被清除。

- **token** —— token 的意思是**令牌**，是服务端生成的**一串字符串**，作为客户端进行请求的一个标识。

### 工作机制

#### cookie

当用户第一次访问并登录一个网站的时候，cookie 的设置以及发送会经历以下 4 个步骤：

1. 客户端发送一个请求给服务器
2. 服务器返回一个 `HttpResponse` 给客户端，其中包含 `Set-Cookie` 的头部
3. 客户端保存 **cookie**，之后向服务器发送请求时，`HttpRequest` 请求中会包含一个 **cookie** 的头部
4. 服务器返回响应数据

#### session

> session 的工作机制离不开 cookie

虽然 session 保存在服务器，但是它的正常运行仍然需要客户端浏览器的支持。这是因为 session 需要使用 cookie 作为识别标志。

HTTP 协议是无状态的，session 不能依据 HTTP 连接来判断是否为同一客户，**因此服务器向客户端浏览器发送一个名为 `SESSIONID` 的 cookie，它的值为该 Session 的 id**。Session 依据该 cookie 来识别是否为同一用户。

对于不支持 cookie 的手机浏览器，有另一种解决方案：URL 地址重写。**URL 地址重写的原理是将该用户 session 的 id 信息重写到 URL 地址中，服务器能够解析重写后的 URL 获取 session 的 id**。这样即使客户端不支持 cookie，也可以使用 session 来记录用户状态。

#### webStorage

提供一种在 cookie 之外存储会话数据的路径，提供一种存储大量跨会话存在的数据的机制。cookie 为 4KB，而 webStorage 是 5MB。

webStorage 存储在本地的数据可以直接获取，速度快，并且不会随着 http header 发送到服务器端。

##### localStorage

localStorage 的生命周期是永久保存。

相同浏览器的不同页面间可以共享相同的 localStorage（页面属于相同域名和端口）。

> localStorage 在所有同源窗口中都是共享的。

##### sessionStorage

sessionStorage 的生命周期是仅在当前浏览器窗口关闭前有效。

相同浏览器的不同页面或标签间无法共享 sessionStorage 的信息。

> sessionStorage 是在同源的窗口中始终存在的数据。只要这个浏览器窗口没有关闭，即使刷新页面或者进入同源另一个页面，数据依然存在。但是 sessionStorage 在关闭了浏览器窗口后就会被销毁。同时独立的打开同一个窗口同一个页面，sessionStorage 也是不一样的。
>
> 注意的是如果在一个标签页中包含多个 iframe 标签且他们属于同源页面，那么他们之间是可以共享 sessionStorage 的。

##### token

> 当用户第一次登录后，服务器生成一个 token 并将此 token 返回给客户端，以后客户端只需带上这个 token 来请求数据即可，无需再次带上用户名和密码。
>
> 简单 token 的组成；uid (用户唯一的身份标识)、time (当前时间的时间戳)、sign（签名，token 的前几位以哈希算法压缩成的一定长度的十六进制字符串，为防止 token 泄露）。

用户在登录时，客户端会发送加密的用户名和密码到服务器，服务器验证用户名和密码，如果验证成功，就会生成相应位数的字符产作为 token 存储到服务器中，并且将该 token 返回给客户端。

以后客户端再次请求时，凡是需要验证的地方都要带上该 token，然后服务器端验证 token，成功返回所需要的结果，失败返回错误信息，让用户重新登录。其中，服务器上会给 token 设置一个有效期，每次 APP 请求的时候都验证 token 和有效期。

**注意：在网络层面上 token 使用明文传输的话是非常危险的，所以一定要使用 HTTPS 协议。**

### 应用场景

- **cookie** —— 判断用户是否已登录，仅支持浏览器，不支持 app 端
- **session** —— 把客户端信息以某种形式记录在服务器上，如用户的登录信息
- **localStorage** —— 常用于长期登录（+ 判断用户是否已登录），适合长期保存在本地的数据
- **sessionStorage** —— 敏感账号一次性登录
- **token** —— 基于 token 令牌的身份校验，需要防止防跨站请求伪造（CSRF）攻击的场景

### 异同点

|                | cookie                                                                              | session                                              | localStorage                                                    | sessionStorage                                                  |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| 数据的生命期   | 一般由服务器生成，可设置失效时间。如果在浏览器端生成 Cookie，默认是关闭浏览器后失效 | 在超时时间前访问没有访问服务器，session 就会自动失效 | 除非被清除，否则永久保存                                        | 仅在当前会话下有效，关闭页面或浏览器后被清除                    |
| 存放数据大小   | 4K 左右                                                                             | 无限制，但为了减少服务器压力，应该尽量小             | 一般为 5MB                                                      | 一般为 5MB                                                      |
| 与服务器端通信 | 每次都会携带在 HTTP 头中，如果使用 cookie 保存过多数据会带来性能问题                | 保存在服务器端                                       | 仅在客户端（即浏览器）中保存，不参与和服务器的通信              | 仅在客户端（即浏览器）中保存，不参与和服务器的通信              |
| 易用性         | 需要程序员自己封装，源生的 Cookie 接口不友好                                        | 后端再次封装                                         | 源生接口可以接受，亦可再次封装来对 Object 和 Array 有更好的支持 | 源生接口可以接受，亦可再次封装来对 Object 和 Array 有更好的支持 |

### 参考文章

1. [面试题：请问 cookie，localStorage，sessionStorage 的区别\_田江的博客 - CSDN 博客](https://blog.csdn.net/jiang7701037/article/details/89118086)
2. [详说 Cookie, LocalStorage 与 SessionStorage | 咀嚼之味 (jerryzou.com)](https://jerryzou.com/posts/cookie-and-web-storage/)
3. [Cookie、Session、localStorage、sessionStorage 区别和用法 - SegmentFault 思否](https://segmentfault.com/a/1190000039670664)
4. [简单理解 token 的作用及实现原理\_蔡小波的博客 - CSDN 博客](https://blog.csdn.net/qq_22078107/article/details/87871252)
