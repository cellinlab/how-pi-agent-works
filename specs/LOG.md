# Pi Agent 教程项目工作日志

## 2026-05-26

### 1. 初始化调研

- 检查当前仓库：只有 README、VISION、LICENSE 和二维码图片资源，没有 VitePress 项目结构。
- 阅读原 README，确认需要保留作者联系方式、视频号/公众号、赞助二维码。
- 克隆 `earendil-works/pi` 到 `/tmp/pi-source` 作为源码参考。
- 联网查看 Pi 官方文档：
  - 文档入口。
  - SDK。
  - Sessions。
  - Session File Format。
  - Compaction。
  - Extensions。
  - Skills。

### 2. 核心理解整理

- 确认 Pi monorepo 三个关键包：
  - `packages/ai`：统一 LLM API 和流式协议。
  - `packages/agent`：Agent Loop、Agent 状态、工具执行。
  - `packages/coding-agent`：会话、资源、工具、扩展、运行模式。
- 阅读关键源码：
  - `packages/agent/src/agent-loop.ts`。
  - `packages/agent/src/agent.ts`。
  - `packages/agent/src/types.ts`。
  - `packages/coding-agent/src/core/agent-session.ts`。
  - `packages/coding-agent/src/core/session-manager.ts`。
  - `packages/coding-agent/src/core/sdk.ts`。
  - `packages/coding-agent/src/core/resource-loader.ts`。
  - `packages/coding-agent/src/core/system-prompt.ts`。
  - `packages/coding-agent/src/core/tools/*`。

### 3. 创建 VitePress 站点骨架

- 新增根 `package.json`，包含：
  - `docs:dev`
  - `docs:build`
  - `docs:preview`
  - `demo:01` 到 `demo:04`
  - `teaching-agent:dev`
  - `teaching-agent:typecheck`
- 创建 `docs/.vitepress/config.mts`。
- 创建 VitePress 主题目录：
  - `docs/.vitepress/theme/index.ts`
  - `docs/.vitepress/theme/Mermaid.vue`
  - `docs/.vitepress/theme/custom.css`
- 添加 `docs/public/logo.svg`。
- 将原 README 中使用的二维码资源复制到：
  - `docs/public/wetouch/`
  - `docs/public/sponsor/`

### 4. 创建教程页面

已创建：

- `docs/index.md`
- `docs/quick-start.md`
- `docs/contact.md`
- `docs/concepts/what-is-agent.md`
- `docs/concepts/pi-architecture.md`
- `docs/concepts/message-and-stream.md`
- `docs/concepts/tools.md`
- `docs/concepts/sessions.md`
- `docs/concepts/context.md`
- `docs/source/agent-loop.md`
- `docs/source/agent-session.md`
- `docs/demos/01-loop.md`
- `docs/demos/02-tools.md`
- `docs/demos/03-session-tree.md`
- `docs/demos/04-compaction.md`
- `docs/project/overview.md`
- `docs/project/backend.md`
- `docs/project/frontend.md`
- `docs/project/run.md`
- `docs/project/extend.md`
- `docs/reference/pitfalls.md`
- `docs/reference/sources.md`

### 5. 用户新增要求

用户提醒：

- 原 README 中的作者信息、联系方式和赞助信息必须加入教程中。

处理：

- 已新增 `docs/contact.md`。
- 已将 `contact` 加入 VitePress nav/sidebar。
- 已复制二维码图片到 VitePress public 目录。

### 6. 用户新增项目管理要求

用户提醒：

- 为了保证后续整体规划控制，最好把整个计划和日志写到 `specs` 中。

处理：

- 新增 `specs/PLAN.md`。
- 新增 `specs/LOG.md`。
- 后续每完成一个阶段继续维护日志。

### 7. 实现 Demo 与教学版 Agent

- 新增四个可运行小 Demo：
  - `examples/demos/01-loop.ts`
  - `examples/demos/02-tools.ts`
  - `examples/demos/03-session-tree.ts`
  - `examples/demos/04-compaction.ts`
- 新增教学版目标项目：
  - `examples/teaching-agent/src/shared/protocol.ts`
  - `examples/teaching-agent/src/server/agent/*`
  - `examples/teaching-agent/src/server/index.ts`
  - `examples/teaching-agent/src/client/*`
  - `examples/teaching-agent/workspace/*`
- 教学版项目实现了：
  - React 前端聊天区、工具列表、事件时间线。
  - Node/Express API。
  - MockModel。
  - ToolRegistry。
  - `list_files`、`read_file`、`write_note`。
  - JSONL SessionStore。
  - 简化 compaction。

### 8. 验证记录

- `npm install` 成功。
- `npm run demo:01` 成功。
- `npm run demo:02` 成功。
- `npm run demo:03` 成功。
- `npm run demo:04` 成功。
- `npm run docs:build` 成功。
- `npm run teaching-agent:typecheck` 成功。
- `npm run teaching-agent:build` 成功。
- 启动 `npm run teaching-agent:dev` 成功：
  - API: `http://localhost:4317`
  - Web: `http://localhost:5174`
- API 验证：
  - `GET /api/session` 返回 session/tools/events。
  - `POST /api/prompt` 输入“列出工作区文件”后，生成 `list_files` 工具调用、工具结果和最终回答。
- Playwright CLI 验证：
  - 打开 `http://localhost:5174/` 成功。
  - 输入“读取 agent-notes.md”并提交成功。
  - 页面展示 `read_file` 工具调用、工具结果和最终回答。
  - 桌面截图：`output/playwright/teaching-agent.png`。
  - 移动端 390px 截图：`output/playwright/teaching-agent-mobile.png`。
  - Console error 为 0。

### 9. README 更新

- README 已改为教程项目说明。
- 保留并整理原作者联系方式、赞助二维码和外部链接。

### 10. 内容补强收口启动

- 用户要求按既定计划继续实现，并保持阶段化提交。
- 本轮执行约束：
  - 先更新 `specs`，再做教程正文，之后补 Demo/教学项目对照，最后验证并记录日志。
  - 不重写已有三个基线提交。
  - 不扩大教学版 Agent 范围，不接真实模型 API。
  - 每个阶段单独 commit。
- 本轮计划已同步到 `specs/PLAN.md` 的“内容补强收口计划”。
