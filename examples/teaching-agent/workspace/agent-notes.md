# Agent Notes

## Agent Loop

Agent Loop 是一个闭环：构造上下文，请求模型，执行工具，把工具结果写回上下文，然后继续下一轮。

## Tools

工具不是模型自己执行的。模型只输出结构化的 tool call，本地运行时负责校验参数、执行工具、返回 tool result。

## Session Tree

会话树使用 `id` 和 `parentId` 组织历史。当前 `leafId` 决定下一次模型请求能看到哪条路径上的消息。
