---
author: chilam
pubDatetime: 2025-07-28 00:13:44
title: 【已解决】记一次Excel导入BigDecimal的诡异精度丢失:MyBatis批量插入的深坑
slug: excel-import-bigdecimal-precision-loss-pitfall
featured: false
draft: false
tags:
  - java
  - sql
  - Mybatis
  - JDBC
description: 记一次生产环境由Excel导入引发的BigDecimal精度丢失问题。本文深入分析了因批量导入时首条记录的scale不一致，触发JDBC类型推断的根源，并提供了在setter中统一scale的快速应急方案和多种备选方案。
---

## 背景介绍

在项目中，我们需要支持将 **Excel** 数据导入数据库，金额字段通常用 `BigDecimal` 表示。导入流程大致如下：

1. 读取 Excel，转换为 JSON；
2. 使用 **Fastjson** 反序列化为对象列表；
3. 通过 **MyBatis** 的 `<foreach>` 语句批量插入数据库。

原以为一切顺风顺水，直到有一天上线后突然发现数据库里的金额精度出现离奇丢失：

* `365.91` 变成了 `366`
* `100.00` 变成了 `100`

更离谱的是——**并不是每批都会出问题，但出错率却高达 60%~80%**。

---

## 问题现象

| 现象 | 备注 |
| --- | --- |
| 金额小数位被四舍五入成整数 | 数据库字段已设置 `DECIMAL(18,4)` |
| 问题偶发 | 并非每批都会出错 |
| 原始数据正常 | Excel 与导出的 JSON 均无误 |
| 测试环境正常 | 使用测试数据测试都没问题 |

---

## 初步排查

最先怀疑的候选项：

* Fastjson 反序列化精度问题？
* MyBatis 参数映射有坑？
* 数据库字段类型错误？
* JDBC 驱动暗藏陷阱？

逐一排除后发现，唯独在以下场景能稳定重现：

> **当使用 MyBatis 批量插入时，如果批次首条记录的金额是整数，就容易导致整批金额被按整数插入。**

---

## 根因分析：`BigDecimal.scale` 不一致触发 JDBC 类型推断

### 1. Fastjson 的反序列化行为

```java
JSON.parseObject("\"100\"", BigDecimal.class);   // scale = 0
JSON.parseObject("\"365.91\"", BigDecimal.class); // scale = 2
```

可见 Fastjson 对字符串 `"100"` 反序列化时得到的 `BigDecimal` 精度（`scale`）为 **0**，而含小数点的数值 `"365.91"` 得到的 `scale` 为 **2**。换言之：

> **同一批次内，不同记录的 `BigDecimal` 可能拥有不同的 `scale`。**

### 2. JDBC 驱动的“聪明”优化

MyBatis 的批量插入底层依赖 JDBC 的 batch 机制。为了减少网络交互，JDBC 会**以首条记录的数据类型作为整列的类型模板**——

1. 如果首条记录 `scale = 0`，JDBC 便认定这一列为“整数”；
2. 后续即使存在 `scale > 0` 的记录，也会被自动四舍五入！

于是，Fastjson + MyBatis + JDBC 的组合拳就把坑“打”了出来。

---

## 我的应急处理方案 ✅（火线止血）

事故发生在生产环境，**首要目标是立即止血**。我采用了最直观、也最可靠的方式——**在实体类的 `setter` 中统一 `scale`**。

```java
public void setKursf(BigDecimal kursf) {
    this.kursf = kursf != null ? kursf.setScale(4, RoundingMode.HALF_UP) : null;
}

public void setDmbtr(BigDecimal dmbtr) {
    this.dmbtr = dmbtr != null ? dmbtr.setScale(4, RoundingMode.HALF_UP) : null;
}
```

### 为什么选它？

* ✅ **简单直接**：不依赖框架扩展，也无需改动业务流程；
* ✅ **立刻生效**：改完代码热修即可上线；
* ✅ **最小改动面**：只动关键字段，不影响其他逻辑。

> 这是“快速止血”而非最优解，适用于需要马上解决线上问题的场景。

---

## 其他可选方案 🔄

| 方案 | 适用场景 | 复杂度 |
| --- | --- | --- |
| **统一 `setter`**（本文做法） | 字段较少，追求快速上线 | ⭐ |
| 批量导入后遍历 `List` 统一 `scale` | 允许一次性处理大列表 | ⭐⭐ |
| Fastjson `ValueFilter` / `ExtraProcessor` | 需要从源头统一反序列化精度 | ⭐⭐⭐ |
| 自定义 `TypeHandler` | 深度使用 MyBatis，可复用 | ⭐⭐⭐⭐ |

---

## 小结 🧠

1. **批量插入前，务必统一 `BigDecimal` 的 `scale`**。首条记录决定命运！
2. **别过度相信默认反序列化行为**；精度要自己把控。
3. **生产事故先止血，再寻最优**。在线修复速度往往比代码优雅更重要。

> 希望这篇踩坑记录能帮到你，少走弯路。如遇到类似问题，建议先检查批次首条记录的 `scale()` 值，再追 JDBC 类型推断。祝调试顺利！
