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

### 11. 教程正文补强

- 新增 `docs/source/source-map.md`，作为 Pi 源码阅读地图。
- 更新 VitePress sidebar，将“源码阅读地图”加入源码拆解部分。
- 补强以下章节：
  - `docs/concepts/pi-architecture.md`：增加结构化协议流和 LLM/副作用边界。
  - `docs/source/agent-loop.md`：增加 loop 不写磁盘的设计理由和常见误区。
  - `docs/concepts/tools.md`：增加工具 schema 与 prompt guideline 的区别。
  - `docs/concepts/sessions.md`：增加 session entry 类型和会话树误区。
  - `docs/concepts/context.md`：增加压缩策略风险、Skills/Context Files/Prompt Templates 边界和误区。
  - `docs/reference/sources.md`：记录本轮核对过的官方信息。
- 提交：`ccf99a2 docs: expand pi architecture tutorial`。

### 12. Demo 与教学项目对照补强

- 新增 `docs/project/code-map.md`，说明四个 Demo 如何汇入最终 React + Node 教学版 Agent。
- 更新 VitePress sidebar，将“Demo 到项目的映射”加入最终项目部分。
- 更新四个 Demo 文档：
  - 补充学习目标。
  - 补充预期输出或最终项目映射。
  - 保持运行命令、关键代码、小练习完整。
- 给四个 Demo 源码增加少量教学注释，解释关键转折点。
- 提交：`c028336 docs: connect demos to teaching app`。

### 13. 内容补强验证记录

- `npm run docs:build` 成功。
  - VitePress 构建完成。
  - 仍有 VitePress/mermaid chunk size warning，不影响构建产物。
- Demo 验证成功：
  - `npm run demo:01`
  - `npm run demo:02`
  - `npm run demo:03`
  - `npm run demo:04`
- 教学版 Agent 检查成功：
  - `npm run teaching-agent:typecheck`
  - `npm run teaching-agent:build`
- 教学版 Agent dev 验证成功：
  - 启动 `npm run teaching-agent:dev`。
  - `GET /api/session` 返回 `teaching-session`、0 条消息和 3 个工具。
  - `POST /api/prompt` 输入“列出工作区文件”，返回 4 条上下文消息，最终回答包含 `README.md` 和 `agent-notes.md`。
- 浏览器验证成功：
  - Playwright CLI 打开 `http://localhost:5174/`。
  - 桌面视口可见聊天区、工具列表、事件时间线。
  - 输入“读取 agent-notes.md”并提交，页面展示 `read_file` 工具调用、工具结果和最终回答。
  - 切换到 390px 移动视口，页面结构正常，未发现 console error。
- 已清理验证临时产物：
  - `.playwright-cli/`
  - `output/`
  - `docs/.vitepress/dist/`
  - `examples/teaching-agent/dist/`
  - `examples/teaching-agent/.teaching-agent/`

### 14. 最终内容完成阶段启动

- 用户确认继续按计划把所有教程内容补齐。
- 本轮重新核对资料来源：
  - `https://pi.dev/docs/latest`
  - `https://pi.dev/docs/latest/sdk`
  - `https://pi.dev/docs/latest/extensions`
  - `https://pi.dev/docs/latest/session-format`
  - `https://github.com/earendil-works/pi`
- 本地源码参考仍使用 `/tmp/pi-source`，已确认关键包：
  - `@earendil-works/pi-ai`
  - `@earendil-works/pi-agent-core`
  - `@earendil-works/pi-coding-agent`
  - `@earendil-works/pi-tui`
- 本轮提交拆分：
  - Commit 5：最终阶段计划登记。
  - Commit 6：源码深挖与概念闭环。
  - Commit 7：从零实现最终项目教程。
  - Commit 8：最终验证与交付日志。
- 范围约束：
  - 不接真实模型 API。
  - 不引入生产级权限系统、多 session UI 或 OAuth。
  - 教程目标仍是让本科毕业生可以跟做一个保留 Pi 核心思想的教学版 Agent。

### 15. 源码深挖与概念闭环

- 新增 `docs/source/model-protocol.md`：
  - 讲解 `@earendil-works/pi-ai` 为什么要把 provider 差异统一成 `Context`、`Message`、`AssistantMessageEvent`。
  - 说明教学版 `MockModel` 在架构上对应真实 Pi 的模型协议层。
- 新增 `docs/source/tools-extensions.md`：
  - 讲解 Tool、Extension、ResourceLoader 的边界。
  - 补充扩展事件生命周期、工具注册、技能、prompt template、context file 的职责区别。
- 新增 `docs/source/session-compaction.md`：
  - 讲解 JSONL entry tree、leaf 上下文构建、CompactionEntry、BranchSummaryEntry。
  - 对照教学版 `JsonlSessionStore` 的简化范围。
- 更新 `docs/source/source-map.md`：
  - 加入五页源码阅读顺序。
  - 总结源码里的五个不变量。
- 更新 `docs/concepts/pi-architecture.md`：
  - 从三层架构跳转到更细源码页面。
- 更新 `docs/reference/sources.md`：
  - 补充 Prompt Templates、provider、runtime、extensions、compaction 相关源码来源。
- 更新 VitePress sidebar，将新增源码页面纳入第二部分。

### 16. 从零实现最终项目教程

- 新增最终项目分步教程：
  - `docs/project/build-00-roadmap.md`：从空目录到可运行 Agent 的实现路线。
  - `docs/project/build-01-protocol.md`：共享消息、工具、事件、SessionEntry 协议。
  - `docs/project/build-02-loop-model.md`：`runAgentLoop` 与 `MockModel`。
  - `docs/project/build-03-tools.md`：`ToolRegistry`、安全工作区和工具结果回写。
  - `docs/project/build-04-session-store.md`：JSONL append、leaf、上下文构建和简化 compaction。
  - `docs/project/build-05-api.md`：Express API 的 prompt orchestration。
  - `docs/project/build-06-frontend.md`：React 消息、工具列表、事件时间线。
  - `docs/project/build-07-debug.md`：类型检查、API、浏览器和临时产物清理清单。
  - `docs/project/build-08-real-model.md`：可选 OpenAI-compatible 真模型接入。
- 新增 `docs/demos/05-real-model.md` 和 `examples/demos/05-openai-compatible.ts`：
  - 只通过环境变量读取 base URL、API Key、模型名和鉴权 header。
  - 缺少环境变量时打印用法并跳过，避免普通 Demo 验证失败。
  - 配置真实模型时，会发送 `list_files` 工具定义、执行本地工具、再回传 `tool` message 获取最终回答。
- 更新 `README.md`、`docs/quick-start.md`、`docs/index.md`、`docs/project/code-map.md`、`docs/project/overview.md`、`docs/project/run.md`、`docs/project/extend.md` 和资料来源页面。
- 使用临时 OpenAI-compatible endpoint 验证 Demo 5：
  - 模型：`mimo-v2.5-pro`。
  - 鉴权：`api-key` header。
  - 结果：模型返回 `list_files` 工具调用，本地工具列出 `README.md` 和 `agent-notes.md`，第二轮模型给出中文总结。
  - 密钥未写入仓库、文档或日志。
