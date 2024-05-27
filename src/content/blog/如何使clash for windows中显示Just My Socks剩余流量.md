---
author: chilam
pubDatetime: 2024-05-27 02:59:19
title: 如何使clash for windows中显示Just My Socks剩余流量
slug: how-to-display-just-my-socks-remaining-traffic-in-clash-for-windows
featured: false
draft: false
tags:
  - clash
  - VPN
  - 教程
description: 将JMS提供的流量查询API使用起来～
---

## 引言

此前经历了一次 JMS 暂停服务，原因是流量用完了，还是一小时内就被人用光了。想到他有一个流量查询的接口迟迟没用上，这就把它对接到 CFW 上去。

## 原理

我们会看到有一些机场到订阅连接在导入 CFW 后会显示总流量、剩余流量、到期时间，而有一些又没有。其原因是在响应头中含有`Subscription-Userinfo`属性（[规范参考此处](https://github.com/crossutility/Quantumult/blob/master/extra-subscription-feature.md)），CFW 会在 Profiles 模块中显示对应的流量及到期信息，响应头常见例子如下：

```yml
subscription-userinfo: upload=455727941; download=6174315083; total=1073741824000; expire=1671815872
```

此外，而 CFW 还支持识别添加在配置文件首行的`subscription-userinfo`，格式以`#`开头，以`;`结尾。示例：

```yml
# upload=455727941; download=6174315083; total=1073741824000; expire=1671815872;
```

> 其中 `upload` 或者 `download` 属性允许只有一个。

由此，我们可以利用CFW的预处理脚本功能实现在 Profiles 模块中显示对应的流量及到期信息

## 实现步骤

在[此篇文章](https://jamesdaily.life/clash_showsub)中实现步骤已经非常清晰，可以直接一步一步跟着做。

其中需要注意的是脚本替换为如下脚本（**其中 url 替换为自己 JMS 服务中的 API 链接**）：

```js
parsers: # array
  - reg: "myprofile.yml"
    code: |
      module.exports.parse = async (raw, { axios, yaml, notify, console }) => {
        // 移除特定注释行
        raw = raw.replace(/# upload=\d*; download=\d*; total=\d*; expire=\d*;*\n/gm,'')
        // Justmysocks的流量查询API
        const url = '（justmysocks带宽统计的API）'
        // 解析返回值
        const response = await axios.get(url)
        const { data, status } = response
        if(status === 200 && data){
          // 从返回的JSON中提取信息
          const { monthly_bw_limit_b, bw_counter_b, bw_reset_day_of_month } = data;
          // 获取本月重置日期的时间戳
          let currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          currentDate.setDate(bw_reset_day_of_month);
          // 如果月份发生了变化，说明当月没有这一天
          if (currentDate.getMonth() !== currentMonth) {
          // 设置为当月最后一天
            currentDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
          }
          const timestamp = Math.floor(currentDate.getTime() / 1000);
          const info = `upload=${bw_counter_b}; total=${monthly_bw_limit_b}; expire=${timestamp};`;
          // 将提取的信息添加到原始数据的顶部
          return `# ${info}\n${raw}`
        }
        return raw
      }
```

### 在 JMS 后台获取 Url

![JMS流量统计API.jpg](@assets/images/如何使clash-for-windows中显示Just-My-Socks剩余流量/JMS流量统计API.jpg)

## 参考文章

1. [如何显示 clash for windows 剩余流量、总流量和剩余日期](https://jamesdaily.life/clash_showsub)
2. [Extra Server Subscription Feature](https://github.com/crossutility/Quantumult/blob/master/extra-subscription-feature.md)
3. [URL Scheme - Clash for Windows 代理工具使用说明](https://docs.gtk.pw/contents/urlscheme.html#subscription-userinfo)
