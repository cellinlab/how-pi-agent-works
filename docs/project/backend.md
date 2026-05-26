# 后端实现

后端是整个教学项目的核心。它负责把用户输入变成消息，把消息交给 Agent Loop，把工具调用落到本地文件系统，再把完整事件和会话返回给前端。

## 模块拆分

| 文件 | 作用 |
| --- | --- |
| `src/shared/protocol.ts` | 共享消息、事件、工具类型 |
| `src/server/agent/model.ts` | 教学版模型接口，隔离 MockModel 和未来真实模型 adapter |
| `src/server/agent/mockModel.ts` | 确定性假模型，模拟 tool call 和最终回答 |
| `src/server/agent/tools.ts` | 工具注册表和内置工具 |
| `src/server/agent/sessionStore.ts` | JSONL 会话树 |
| `src/server/agent/loop.ts` | Agent Loop |
| `src/server/index.ts` | Express API |

## Agent Loop 的接口

教学版的 loop 接收一个上下文：

```ts
type RunContext = {
  systemPrompt: string;
  messages: AgentMessage[];
  tools: ToolDefinition[];
  model: TeachingModel;
  beforeToolCall?: BeforeToolCall;
};
```

返回：

```ts
type RunResult = {
  newMessages: AgentMessage[];
  events: AgentEvent[];
};
```

`newMessages` 只表示本次 loop 产生的新 assistant/toolResult 消息，不是完整会话。完整上下文仍由 `JsonlSessionStore.buildContext()` 构建。

这个设计和 Pi 的 `runAgentLoop` 一样：loop 本身不关心 HTTP，也不直接操作 React UI，更不会直接写 session 文件。教学版里，持久化发生在 `src/server/index.ts`：API 调用 `runAgentLoop()` 后，再把 `result.newMessages` 逐条交给 `store.appendMessage()`。

`TeachingModel` 是为了让 loop 不依赖某个具体模型类：

```ts
export interface TeachingModel {
  complete(input: CompleteInput): Promise<AssistantMessage>;
}
```

现在实现它的是 `MockModel`。未来如果接入 OpenAI-compatible adapter，只要 adapter 也返回教学版 `AssistantMessage`，loop、工具和会话存储都不用重写。

## 工具注册表

教学版工具只有三个：

| 工具 | 作用 |
| --- | --- |
| `list_files` | 列出 `workspace/` 下的文件 |
| `read_file` | 读取 `workspace/` 下的文本文件 |
| `write_note` | 写入 `workspace/notes/` 下的笔记 |

所有路径都会被限制在 `workspace/` 里。这是一个很重要的安全习惯：哪怕是教学项目，也不要让模型参数直接访问任意路径。

## 工具权限 hook

工具真正执行前会先经过 `beforeToolCall`。教学版支持三种决策：

| 决策 | 作用 |
| --- | --- |
| `allow` | 直接执行工具 |
| `block` | 不执行工具，生成 `isError: true` 的 tool result |
| `rewrite` | 改写参数后再执行工具 |

默认规则很小：`write_note` 不允许写入包含 `secret` 或 `秘密` 的笔记文件；`list_files` 如果缺少 `path`，会补成 `"."`。这不是完整权限系统，但足够让你看到 Pi 里 tool hook 的工程意义：模型提出工具调用，本地运行时仍然有最后的审批权。

## 会话存储

每条消息都会追加为 JSONL：

```json
{"type":"message","id":"entry_1","parentId":null,"message":{"role":"user","content":[{"type":"text","text":"列出文件"}]}}
```

教学版保留 `leafId`，这样你可以继续扩展出分支功能。

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/session` | 返回当前消息、事件和可用工具 |
| `POST` | `/api/prompt` | 追加用户消息，运行 Agent，返回最新状态 |
| `POST` | `/api/runs` | 创建一次流式 run，返回 `runId` |
| `GET` | `/api/runs/:runId/events` | 用 SSE 推送 run 内的 AgentEvent |
| `POST` | `/api/branch` | 切换当前 `leafId`，从已有 entry 继续 |
| `POST` | `/api/reset` | 清空教学会话 |

`POST /api/prompt` 仍然保留，方便 curl 和一次性 API 调试。前端默认使用 `/api/runs` + SSE：后端会把已经发生的事件缓存在 run record 里，浏览器连接后先回放历史事件，再继续接收新事件。run 结束时发送 `run_done`，前端再用服务端返回的完整 session 对齐最终状态。

`POST /api/branch` 不复制历史，也不删除分支。它只是把 `JsonlSessionStore` 的当前 leaf 指向某个已有 entry。下一次 prompt 会以这个 entry 为父节点继续生长，这正是 JSONL tree 的价值所在。

## 替换真实模型的位置

如果你想接真实模型，只需要替换 `mockModel.complete()`：

```ts
const assistant = await model.complete({
  systemPrompt,
  messages,
  tools
});
```

真实模型返回的结构仍然应该是 `AssistantMessage`，里面可以包含 `toolCall` 内容块。只要这个协议不变，loop 不需要大改。
