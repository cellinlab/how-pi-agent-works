# Demo 4：上下文压缩

这个 Demo 展示“摘要旧内容 + 保留最近内容”的结构。

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

## 为什么保留最近消息

最近消息通常包含当前任务最细的约束和工具输出。如果完全用摘要替换，模型很容易丢掉参数、路径、错误栈、用户刚强调的限制。

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
