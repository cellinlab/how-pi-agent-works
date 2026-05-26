# 运行与调试

## 启动

在仓库根目录执行：

```bash
npm install
npm run teaching-agent:dev
```

默认端口：

| 服务 | 地址 |
| --- | --- |
| React 前端 | `http://localhost:5174/` |
| Node API | `http://localhost:4317/` |

Vite 会把 `/api/*` 代理到 Node API。

## 推荐测试 prompt

| 输入 | 预期行为 |
| --- | --- |
| `列出工作区文件` | 模型调用 `list_files`，然后总结文件列表 |
| `读取 README.md` | 模型调用 `read_file`，然后解释文件内容 |
| `写一条关于 agent loop 的笔记` | 模型调用 `write_note` |
| `解释一下工具调用机制` | 不调用工具，直接回答 |

## 调试后端

如果你想单独看 API：

```bash
curl http://localhost:4317/api/session
```

提交 prompt：

```bash
curl -X POST http://localhost:4317/api/prompt \
  -H 'Content-Type: application/json' \
  -d '{"text":"列出工作区文件"}'
```

## 可选真模型烟测

默认教学项目不依赖真实模型。如果你已经有 OpenAI-compatible endpoint，可以单独跑：

```bash
OPENAI_COMPATIBLE_BASE_URL="https://example.com/v1" \
OPENAI_COMPATIBLE_API_KEY="你的 key" \
OPENAI_COMPATIBLE_MODEL="mimo-v2.5-pro" \
npm run demo:05
```

更完整说明见 [可选：接入 OpenAI-compatible 模型](/project/build-08-real-model)。

## 调试会话文件

运行后会生成：

```text
examples/teaching-agent/.teaching-agent/session.jsonl
```

可以用：

```bash
tail -n 20 examples/teaching-agent/.teaching-agent/session.jsonl
```

观察每条消息如何 append。

## 常见问题

| 问题 | 解决 |
| --- | --- |
| 端口被占用 | 改 `src/server/index.ts` 和 `vite.config.ts` 中的端口 |
| 前端请求 404 | 确认 Node API 正在跑，Vite proxy 生效 |
| 会话太乱 | 调用 `/api/reset` 或删除 `.teaching-agent/session.jsonl` |
| 工具读不到文件 | 只允许访问 `workspace/` 下文件 |
