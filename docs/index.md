---
layout: home
hero:
  name: Pi Agent 原理与实现
  text: 从零到一实现一个 AI Agent
  tagline: 用工程化视角拆解 Pi 的核心思想：模型流、Agent Loop、工具调用、会话树、资源加载与上下文压缩。
  image:
    src: /logo.svg
    alt: Pi Agent 教程
  actions:
    - theme: brand
      text: 开始学习
      link: /quick-start
    - theme: alt
      text: 运行最终项目
      link: /project/run
features:
  - title: 不是源码翻译
    details: 先建立最小心智模型，再逐层拆解 Pi 的实现。每一节都回答“为什么需要这一层”。
  - title: 渐进式 Demo
    details: 四个核心小 Demo 分别覆盖循环、工具、会话树、压缩，另有一个可选真模型烟测。读者可以直接运行、改动、观察输出。
  - title: 可运行目标项目
    details: 最后实现一个 React + Node + TypeScript 的教学版 Agent，保留 Pi 的核心设计味道。
---

## 这套教程适合谁

你不需要已经写过 Agent 框架，但最好具备这些基础：TypeScript、Node.js、HTTP API、React 的基本状态管理，以及能读懂一些异步代码。

这套教程默认读者是计算机本科毕业生：已经知道“调用大模型 API”是什么，但还没有把“模型、工具、状态、流式事件、会话持久化”串成一个完整系统。

## 你会学到什么

```mermaid
flowchart LR
  A["最小 Agent 循环"] --> B["工具调用"]
  B --> C["事件与状态"]
  C --> D["JSONL 会话树"]
  D --> E["资源加载与系统提示词"]
  E --> F["上下文压缩"]
  F --> G["React + Node 教学版 Agent"]
```

## 站点中的代码

教程中的小 Demo 位于 `examples/demos/`，最终项目位于 `examples/teaching-agent/`。你可以先读概念，再运行代码；也可以反过来，先跑起来再回头看解释。

## 联系与赞助

原 README 里的作者联系方式与赞助二维码已经整理到 [联系与赞助](/contact)。如果这套教程帮你把 Agent 系统想清楚了，欢迎去那里找作者继续交流。
