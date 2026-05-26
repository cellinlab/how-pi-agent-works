# Demo 4：上下文压缩

这个 Demo 展示“摘要旧内容 + 保留最近内容”的结构。

## 学习目标

跑完这一节，你应该能说清楚：压缩不是删除历史，而是把旧消息折叠成摘要，同时保留最近消息原文，降低上下文窗口压力。

## 运行

```bash
npm run demo:04
```

## 核心思想

压缩前：

```text
user 1
assistant 1
tool result 1
user 2
assistant 2
tool result 2
user 3
assistant 3
```

压缩后发给模型：

```text
summary: user 1 ... tool result 2
user 3
assistant 3
```

## 预期输出

```text
tokensBefore: 82

summary:
旧消息共 6 条。关键脉络：...

what the model sees next:
user: 以下是旧上下文摘要...
user: 现在总结 Agent Loop。
assistant: Agent Loop 是上下文、模型、工具结果之间的闭环。
```

## 为什么保留最近消息

最近消息通常包含当前任务最细的约束和工具输出。如果完全用摘要替换，模型很容易丢掉参数、路径、错误栈、用户刚强调的限制。

## 对应最终项目

最终项目的 `compactIfNeeded()` 用同样思路工作：先估算上下文大小，超过阈值时追加 compaction entry，再让 `buildContext()` 输出“摘要消息 + 最近消息”。教学版摘要仍是确定性字符串，方便你观察结构。

## 改造练习

把压缩摘要从一句话改成结构化格式：

```text
已完成：
- ...

关键文件：
- ...

待办：
- ...
```

这会更接近 Pi 的真实 compaction 思路。
