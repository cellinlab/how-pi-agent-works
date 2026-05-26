# 前端实现

前端的任务不是“做一个聊天框”这么简单。它要把 Agent 的过程讲清楚。

所以教学版前端刻意展示三块信息：

| 区域 | 作用 |
| --- | --- |
| 聊天区 | 看用户、助手、工具结果的消息顺序 |
| 事件时间线 | 看 Agent Loop 内部发生了什么 |
| Session Tree | 看 JSONL entry 如何形成分支，点击节点切换当前 leaf |
| 工具列表 | 看模型当前能调用哪些能力 |

## 状态模型

React 主要保存服务端返回的状态：

```ts
type SessionResponse = {
  sessionId: string;
  leafId: string | null;
  messages: AgentMessage[];
  events: AgentEvent[];
  tools: ToolDefinition[];
  entries: SessionEntry[];
};
```

提交 prompt 后：

```ts
const response = await fetch("/api/runs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text })
});
const { runId } = await response.json();
const source = new EventSource(`/api/runs/${runId}/events`);
```

`POST /api/prompt` 仍然可以用于 curl 调试；浏览器默认走 SSE。每收到一个 `message_start`、`message_update`、`tool_execution_start/end`，前端就把事件追加到时间线，并用消息事件增量更新聊天区。收到 `run_done` 后，再用完整 session 覆盖本地状态，避免增量过程中漏掉 entry 或工具列表变化。

```mermaid
sequenceDiagram
  participant UI as React
  participant API as Express
  participant Loop as runAgentLoop

  UI->>API: POST /api/runs
  API-->>UI: runId
  UI->>API: GET /api/runs/:id/events
  API->>Loop: runAgentLoop(onEvent)
  Loop-->>API: AgentEvent
  API-->>UI: SSE AgentEvent
  API-->>UI: run_done + full session
```

## 为什么展示事件时间线

很多 Agent 问题不是最终答案错，而是中间过程错：

| 症状 | 事件时间线能帮你看到 |
| --- | --- |
| 模型没有调用工具 | 没有 `tool_execution_start` |
| 工具参数错 | `tool_execution_start.args` |
| 工具执行失败 | `tool_execution_end.isError` |
| 工具被权限拦截 | `tool_permission.action = block` |
| 模型无限循环 | 多个 turn 持续出现 tool call |

事件时间线是调试 Agent 的放大镜。

## 为什么加 Session Tree

会话树如果只存在 JSONL 文件里，读者很难形成直觉。前端现在会把 `entries` 按 `parentId` 构造成树：

```ts
function buildSessionTree(entries: SessionEntry[]) {
  // 1. 为 message / compaction entry 建节点
  // 2. 按 parentId 挂到父节点
  // 3. parentId 为空的节点作为 root
}
```

点击某个节点时，前端调用：

```ts
await fetch("/api/branch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ leafId })
});
```

后端只切换当前 leaf，不会删除其他分支。这样你可以先问“列出文件”，再点击早期 user 节点，从那里问另一个问题，观察树上长出新分支。

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
| SSE 推送 `AgentEvent` | provider token 级 delta、取消和重试 |
| 简单事件列表 | 可折叠 turn / message / tool 分组 |
| 文本工具结果 | 代码高亮、diff 视图、图片预览 |
| 单 session tree | 多 session picker、branch summary |
