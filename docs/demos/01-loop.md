# Demo 1：最小 Agent 循环

这个 Demo 只保留三个东西：

1. 用户消息。
2. 一个确定性的假模型。
3. Agent Loop 事件。

它没有工具、没有会话、没有压缩。目的就是让你先看见“循环”和“事件”。

## 学习目标

跑完这一节，你应该能说清楚：用户消息如何进入上下文，模型如何产生 assistant message，事件为什么要分成 `message_start`、`message_update`、`message_end`。

## 运行

```bash
npm run demo:01
```

你会看到类似输出：

```text
event: agent_start
event: message_start user
event: message_end user
event: message_start assistant
event: message_update assistant text_delta
event: message_end assistant
event: agent_end
```

## 核心代码

打开 `examples/demos/01-loop.ts`，重点看：

```ts
const context: Message[] = [
  { role: "user", content: "请用一句话解释 Agent Loop。" }
];

const assistant = await model.complete(context, emit);
context.push(assistant);
```

这里的 `model.complete()` 虽然是假模型，但它模拟了真实模型的行为：先发 `message_start`，再一段段发 `message_update`，最后发 `message_end`。

## 你应该观察什么

| 观察点 | 为什么重要 |
| --- | --- |
| 用户消息也有 start/end | UI 不应该只关心 assistant |
| assistant 先 update 再 end | 流式渲染依赖 partial message |
| 最终 context 包含两条消息 | 下一轮请求要带着历史 |

## 对应最终项目

最终项目里的 `examples/teaching-agent/src/server/agent/loop.ts` 做了同一件事，但多了 turn、tool call、guardrail 和事件收集。你可以把这个 Demo 当成它的“无工具版本”。

## 改造练习

把用户消息改成两条，然后让假模型把两条消息都读出来。你会看到上下文不是“最后一句话”，而是完整消息列表。
