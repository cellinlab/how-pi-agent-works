# 运行与学习路线

这一页先帮你把项目跑起来。后面的章节会不断让你回到这些命令上观察 Agent 的行为。

## 环境要求

| 工具 | 建议版本 | 用途 |
| --- | --- | --- |
| Node.js | 20+，推荐 22+ | 运行 VitePress、Demo 和教学版后端 |
| npm | 10+ | 安装依赖、执行 workspace 脚本 |
| 终端 | 任意 | 观察事件流和日志 |

## 安装依赖

```bash
npm install
```

## 启动教程站点

```bash
npm run docs:dev
```

默认会启动 VitePress。终端会打印本地地址，通常是 `http://localhost:5173/`。

## 运行渐进式 Demo

```bash
npm run demo:01
npm run demo:02
npm run demo:03
npm run demo:04
```

前四个 Demo 不依赖真实大模型。它们使用一个确定性的“假模型”来模拟模型输出，目的是让你把核心控制流看清楚。

如果你有 OpenAI-compatible 测试模型，可以额外运行可选 Demo：

```bash
OPENAI_COMPATIBLE_BASE_URL="https://example.com/v1" \
OPENAI_COMPATIBLE_API_KEY="你的 key" \
OPENAI_COMPATIBLE_MODEL="模型名" \
npm run demo:05
```

Demo 5 只从环境变量读取 key，不需要也不应该把 key 写进仓库。

## 启动最终教学项目

```bash
npm run teaching-agent:dev
```

教学项目包含：

| 目录 | 作用 |
| --- | --- |
| `examples/teaching-agent/src/server` | Node.js 后端，包含 Agent Loop、工具注册、会话存储和 API |
| `examples/teaching-agent/src/client` | React 前端，展示聊天、工具调用和事件时间线 |
| `examples/teaching-agent/src/shared` | 前后端共享的消息、事件和工具类型 |

## 推荐学习顺序

1. 先读 [Agent 到底是什么](/concepts/what-is-agent)，建立最小模型。
2. 跑 `npm run demo:01`，看一次没有工具的 Agent 循环。
3. 读 [工具调用机制](/concepts/tools)，再跑 `npm run demo:02`。
4. 读 [会话、树与分支](/concepts/sessions)，再跑 `npm run demo:03`。
5. 读 [上下文、技能与压缩](/concepts/context)，再跑 `npm run demo:04`。
6. 最后进入 [教学版目标项目](/project/overview)，把所有机制组合起来。
7. 如果你有真实模型接口，再读 [可选：接入 OpenAI-compatible 模型](/project/build-08-real-model)。

## 目录总览

```text
how-pi-agent-works/
├─ docs/                         # VitePress 教程站点
│  ├─ concepts/                  # 核心概念
│  ├─ source/                    # Pi 源码链路拆解
│  ├─ demos/                     # 小 Demo 讲解
│  ├─ project/                   # 最终项目教程
│  └─ reference/                 # 常见错误与资料来源
├─ examples/
│  ├─ demos/                     # 四个核心 Demo + 一个可选真模型烟测
│  └─ teaching-agent/            # React + Node 教学版 Agent
└─ public/                       # README 原有二维码资源
```

## 学习时的一个建议

每次读到一个机制，都问自己三个问题：

| 问题 | 目的 |
| --- | --- |
| 这个机制解决了什么痛点？ | 防止把框架设计背成术语 |
| 如果没有它，会在哪里崩？ | 理解边界条件 |
| 它和前后一个机制怎么接上？ | 建立系统视角 |
