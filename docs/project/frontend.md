# 前端实现

前端的任务不是“做一个聊天框”这么简单。它要把 Agent 的过程讲清楚。

所以教学版前端刻意展示三块信息：

| 区域 | 作用 |
| --- | --- |
| 聊天区 | 看用户、助手、工具结果的消息顺序 |
| 事件时间线 | 看 Agent Loop 内部发生了什么 |
| 工具列表 | 看模型当前能调用哪些能力 |

## 状态模型

React 只保存服务端返回的状态：

```ts
type SessionResponse = {
  sessionId: string;
  messages: AgentMessage[];
  events: AgentEvent[];
  tools: ToolDefinition[];
};
```

提交 prompt 后：

```ts
const response = await fetch("/api/prompt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text })
});
const nextState = await response.json();
setSession(nextState);
```

真实产品里可以改成 SSE 或 WebSocket 流式推送。教学版先用普通 JSON，是为了让链路更容易读。

## 为什么展示事件时间线

很多 Agent 问题不是最终答案错，而是中间过程错：

| 症状 | 事件时间线能帮你看到 |
| --- | --- |
| 模型没有调用工具 | 没有 `tool_execution_start` |
| 工具参数错 | `tool_execution_start.args` |
| 工具执行失败 | `tool_execution_end.isError` |
| 模型无限循环 | 多个 turn 持续出现 tool call |

事件时间线是调试 Agent 的放大镜。

## UI 设计取舍

教学版页面不是营销站，而是一个工程工具界面。它保持紧凑、可扫描：

1. 左侧看对话，右侧看工具和事件。
2. 工具结果单独标记，避免和助手文本混淆。
3. 输入区始终在底部，方便反复试 prompt。
4. 错误结果用明显颜色，但不打断整个会话。

## 可扩展方向

前端最值得扩展的是流式体验：

| 当前实现 | 可以扩展为 |
| --- | --- |
| POST 返回完整 JSON | SSE 实时推送 `AgentEvent` |
| 简单事件列表 | 可折叠 turn / message / tool 分组 |
| 文本工具结果 | 代码高亮、diff 视图、图片预览 |
| 单 session | session picker 和 tree viewer |
