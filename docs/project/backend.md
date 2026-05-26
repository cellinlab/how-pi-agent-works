# 后端实现

后端是整个教学项目的核心。它负责把用户输入变成消息，把消息交给 Agent Loop，把工具调用落到本地文件系统，再把完整事件和会话返回给前端。

## 模块拆分

| 文件 | 作用 |
| --- | --- |
| `src/shared/protocol.ts` | 共享消息、事件、工具类型 |
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
};
```

返回：

```ts
type RunResult = {
  messages: AgentMessage[];
  events: AgentEvent[];
};
```

这个设计和 Pi 的 `runAgentLoop` 一样：loop 本身不关心 HTTP，也不直接操作 React UI。

## 工具注册表

教学版工具只有三个：

| 工具 | 作用 |
| --- | --- |
| `list_files` | 列出 `workspace/` 下的文件 |
| `read_file` | 读取 `workspace/` 下的文本文件 |
| `write_note` | 写入 `workspace/notes/` 下的笔记 |

所有路径都会被限制在 `workspace/` 里。这是一个很重要的安全习惯：哪怕是教学项目，也不要让模型参数直接访问任意路径。

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
| `POST` | `/api/reset` | 清空教学会话 |

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
