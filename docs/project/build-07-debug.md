# Step 7：调试与验收

一个 Agent 项目最难调试的地方，是问题可能出在很多层：前端请求、API、session、loop、模型、工具、文件系统。验收清单可以帮你快速定位。

## 先跑静态检查

```bash
npm run teaching-agent:typecheck
npm run teaching-agent:build
```

如果这里失败，先不要启动浏览器。TypeScript 和 Vite build 能抓住大多数协议和前端编译问题。

## 再跑 API

启动：

```bash
npm run teaching-agent:dev
```

检查：

```bash
curl http://localhost:4317/api/session
```

你应该看到：

```json
{
  "sessionId": "teaching-session",
  "messages": [],
  "tools": [
    { "name": "list_files" },
    { "name": "read_file" },
    { "name": "write_note" }
  ]
}
```

提交 prompt：

```bash
curl -X POST http://localhost:4317/api/prompt \
  -H 'Content-Type: application/json' \
  -d '{"text":"列出工作区文件"}'
```

预期消息数至少包含：

| 顺序 | role | 说明 |
| --- | --- | --- |
| 1 | user | 当前输入 |
| 2 | assistant | `list_files` tool call |
| 3 | toolResult | 文件列表 |
| 4 | assistant | 基于工具结果的回答 |

## 浏览器验收

桌面视口检查：

- 聊天区能展示 user、assistant、toolResult。
- 工具调用以独立块展示。
- Tools 区域有三个工具。
- Event Timeline 有 `turn_start`、`tool_start`、`tool_end`、`agent_end`。

移动视口检查：

- 390px 宽度下不横向溢出。
- 输入框和发送按钮不重叠。
- 工具 JSON 可以换行。
- 侧栏内容落到聊天区下方。

## 从症状定位问题

| 症状 | 优先检查 |
| --- | --- |
| 前端空白 | 浏览器 console、Vite build |
| 提交后 400 | `/api/prompt` 的 text 是否为空 |
| 只有 tool call 没有最终回答 | loop 是否把 toolResult push 回 context |
| 工具结果显示在 UI，但模型不知道 | toolResult 是否 append 到 `newMessages` 和 store |
| 刷新后历史丢失 | `.teaching-agent/session.jsonl` 是否写入 |
| 路径越界报错 | `resolveInsideWorkspace()` 是否正确拦截 |
| 时间线没有工具事件 | loop 是否 emit `tool_execution_start/end` |

## 清理验证产物

这些文件不要提交：

```text
docs/.vitepress/dist/
examples/teaching-agent/dist/
examples/teaching-agent/.teaching-agent/
output/
.playwright-cli/
```

仓库的 `.gitignore` 已经覆盖这些路径。最终提交前仍然要看一眼：

```bash
git status --short
```

## 常见错误

| 错误 | 后果 |
| --- | --- |
| 只跑 docs build，不跑 Demo | 教程页面正常但示例坏了 |
| 只跑 API，不看浏览器 | CSS 溢出、按钮状态、事件展示可能漏掉 |
| 把 session JSONL 提交了 | 把本地测试历史混入教程 |
| 在文档里写真实 API Key | 泄漏密钥，读者也无法复现 |

## 小练习

故意把 `read_file` 的路径改成 `../README.md`，观察 API 返回、toolResult、前端时间线分别怎么表现。一个好的 Agent 教学项目，错误路径也应该可解释，而不是直接崩溃。

