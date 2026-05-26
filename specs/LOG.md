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

### 17. 最终验证与交付日志

- 文档站点：
  - `npm run docs:build` 成功。
  - 仍有 VitePress/mermaid chunk size warning，不影响构建。
- Demo 验证：
  - `npm run demo:01` 成功。
  - `npm run demo:02` 成功。
  - `npm run demo:03` 成功。
  - `npm run demo:04` 成功。
  - `npm run demo:05` 在未配置环境变量时打印用法并跳过，退出成功。
  - 使用临时 OpenAI-compatible 环境变量运行 `npm run demo:05` 成功，模型触发 `list_files` tool call，本地工具返回 `README.md` 和 `agent-notes.md`，最终模型返回中文总结。
- 教学版 Agent：
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run teaching-agent:build` 成功。
  - 启动 `npm run teaching-agent:dev` 成功。
- API 验证：
  - `GET /api/session` 返回 `teaching-session`、空消息、三个工具和 session header。
  - `POST /api/reset` 成功清空会话。
  - `POST /api/prompt` 输入“列出工作区文件”，返回 user、assistant toolCall、toolResult、assistant final，JSONL entries 正常追加。
- 浏览器验证：
  - 使用 Playwright CLI 打开 `http://localhost:5174/`。
  - 桌面视口可见聊天区、工具调用、工具列表和事件时间线。
  - 输入“读取 agent-notes.md”并提交，页面展示 `read_file` tool call、toolResult 和最终回答。
  - 切换到 390px 移动视口后页面结构仍正常。
  - Console errors 为 0。
- 清理：
  - 已关闭 Playwright browser。
  - 已停止教学版 dev server。
  - 已删除 `docs/.vitepress/dist/`、`examples/teaching-agent/dist/`、`examples/teaching-agent/.teaching-agent/`、`.playwright-cli/`、`output/`。
  - 已确认仓库文件中不包含临时 API Key 或 token-plan endpoint。

### 18. Mermaid 渲染专项检查

- 用户反馈 `docs/concepts/pi-architecture.md` 中“一次请求的完整链路”图未正常渲染。
- 定位原因：
  - Mermaid sequence diagram 中 `loop` 是保留关键字。
  - 多个 sequence 图使用了 `participant Loop ...`，大小写不同也会触发解析问题。
- 修复内容：
  - 将 sequence diagram 中的 `Loop` participant alias 统一改为 `AgentLoop`。
  - 涉及页面：
    - `docs/concepts/pi-architecture.md`
    - `docs/concepts/tools.md`
    - `docs/source/model-protocol.md`
    - `docs/project/overview.md`
    - `docs/project/build-05-api.md`
- 验证内容：
  - 使用 Mermaid parser 单独检查 9 个 sequence diagram，全部通过。
  - 启动 VitePress dev server，用 Playwright 逐页检查 37 个文档页面。
  - 共发现 42 个 Mermaid block，全部渲染为 SVG，`.mermaid-error` 为 0。
  - 额外补充 VitePress favicon 配置，避免浏览器控制台出现 `/favicon.ico` 404 噪音。

### 19. 本科生试读反馈计划登记

- 用户提供一位本科生读者的试读反馈，整体结论是：
  - 当前主线扎实，概念、Demo、源码拆解、最终项目已经连起来。
  - 但“从零到一复现教学版 Agent”的工程跟做材料还不够手把手。
- 已将反馈拆成后续阶段计划并写入 `specs/PLAN.md`：
  - Commit 9：反馈登记与计划拆分。
  - Commit 10：修正误导性图表与命名不一致。
  - Commit 11：把“从零实现”改成可跟做工程手册。
  - Commit 12：补 provider adapter 与真实模型教学链路。
  - Commit 13：补真实 Pi 压缩复杂边界进阶页。
  - Commit 14：补测试章节与最小测试套件。
  - Commit 15：补工具权限、SSE 流式 UI、会话树 UI、失败模式等进阶工程草图。
  - Commit 16：二轮最终验证与读者路径检查。
- 重新核对的外部参考：
  - `https://pi.dev/docs/latest/sdk`
  - `https://pi.dev/docs/latest/compaction`
  - `https://pi.dev/docs/latest/extensions`
  - `https://pi.dev/news/2026/5/7/pi-has-a-new-home`
- 本轮只登记计划，不开始正文实现。
- 范围说明：
  - 教学版项目默认仍使用 `MockModel`。
  - 真实模型保持为可选 Demo 与 adapter 教学链路。
  - 不把 OAuth、完整扩展系统、生产级权限审批 UI 纳入必须实现范围。

### 20. 误导性图表与命名修正

- 根据本科生反馈，修正 `docs/project/overview.md`：
  - 架构图不再画 `runAgentLoop -> JsonlSessionStore`。
  - 时序图改为 `AgentLoop -->> API: newMessages + events`，再由 `API -> Store: append newMessages`。
  - 与真实代码 `examples/teaching-agent/src/server/index.ts` 保持一致：API 调用 `runAgentLoop()` 后再统一持久化。
- 修正 `docs/project/backend.md`：
  - `RunResult` 返回字段从 `messages` 改为 `newMessages`。
  - 增加说明：`newMessages` 只代表本次 loop 新产生的 assistant/toolResult，完整上下文由 `JsonlSessionStore.buildContext()` 构造。
- 修正 `docs/concepts/sessions.md`：
  - 增加 “真实 Pi 与教学版的版本号” 提示。
  - 事实核对：Pi 官方 Session Format 文档说明当前 session header 会迁移到 v3；v2 引入 `id` / `parentId` 树结构；教学版 `version: 1` 只是教学文件格式版本。
- 修正 `docs/.vitepress/config.mts`：
  - `editLink.pattern` 不再指向 Pi 官方仓库。
  - 改为本教程仓库 `cellinlab/how-pi-agent-works`。
- 验证：
  - `npm run docs:build` 成功。
  - Mermaid sequence diagram parser 检查 9 个图，全部通过。

### 21. 从零实现工程手册补强

- 更新 `docs/project/build-00-roadmap.md`：
  - 增加从空目录创建项目的命令。
  - 增加最小 `package.json`、`tsconfig.json`、`vite.config.ts`。
  - 增加示例 workspace 文件创建命令。
  - 增加“跟做版本 vs 完整仓库版本”提示和阶段 checkpoint 建议。
- 更新 Step 1 到 Step 7：
  - 每个主要实现页补“本节新增文件”。
  - 补可复制代码、局部 diff 或最小可运行骨架。
  - 补运行命令、预期输出、常见报错和 checkpoint。
  - Step 7 增加跟做验收清单和常见报错原文定位表。
- 目的：
  - 让本科毕业生读者不只是理解现有代码，而是知道从空目录要新建哪些文件、写哪些代码、跑哪些命令、看到什么结果。
- 验证：
  - `npm run docs:build` 成功。
  - `git diff --check` 成功。

### 33. Vercel 配置与生产部署

- 配置：
  - 新增根目录 `vercel.json`，将 Vercel 构建限定为 VitePress 教程站点。
  - `installCommand` 使用 `npm install`。
  - `buildCommand` 使用 `npm run docs:build`。
  - `outputDirectory` 使用 `docs/.vitepress/dist`。
  - README 增加 Vercel 部署说明，并明确教学版 Express API 仍作为本地教学运行时。
  - Vercel CLI 自动生成 `.vercel/` 本地链接目录，已加入 `.gitignore`，不提交项目 ID。
- 验证：
  - `npm run docs:build` 成功；仍有 VitePress/Rollup chunk size warning，不影响构建。
  - `git diff --check` 成功。
  - `npx vercel whoami` 成功，当前账号为 `cellinlab`。
  - `curl -L -I https://how-pi-agent-works.vercel.app` 返回 HTTP 200。
  - `npx vercel inspect https://how-pi-agent-works.vercel.app` 显示部署状态为 Ready。
- 部署：
  - 执行 `npx vercel deploy --prod --yes` 成功。
  - Production URL：`https://how-pi-agent-works-qr1tnsmpp-cellinlabs-projects.vercel.app`。
  - Alias：`https://how-pi-agent-works.vercel.app`。
  - Inspect URL：`https://vercel.com/cellinlabs-projects/how-pi-agent-works/5ysThdxkfRv5hp2o2LRqkj2hRrHp`。

### 34. VitePress GitHub 与 X 链接修正

- 修正 VitePress 顶部社媒链接：
  - GitHub 从 Pi 官方仓库改为本教程项目 `https://github.com/cellinlab/how-pi-agent-works`。
  - 新增 X/Twitter：`https://x.com/cellinlab`。
- 补充联系方式：
  - `docs/contact.md` 增加 X/Twitter 地址。
  - README 的联系方式同步增加 X/Twitter 地址。
- 保留资料来源页中的 Pi 官方 GitHub 引用，不把源码参考误改成教程仓库。
- 验证：
  - `npm run docs:build` 成功；仍有 VitePress/Rollup chunk size warning，不影响构建。
  - `git diff --check` 成功。
  - `rg` 确认 `docs/.vitepress/config.mts` 的 `socialLinks` 和 `editLink` 均指向 `cellinlab/how-pi-agent-works`。
  - 线上首页 HTML 已包含 `https://github.com/cellinlab/how-pi-agent-works` 与 `https://x.com/cellinlab`。
- 部署：
  - 执行 `npx vercel deploy --prod --yes` 成功。
  - Production URL：`https://how-pi-agent-works-cybzunqbz-cellinlabs-projects.vercel.app`。
  - Alias：`https://how-pi-agent-works.vercel.app`。
  - Inspect URL：`https://vercel.com/cellinlabs-projects/how-pi-agent-works/GmGysqWVUNTLygCvpqMKWG6LruTU`。

### 22. Provider adapter 与真实模型教学链路

- 更新 `examples/demos/05-openai-compatible.ts`：
  - 增加 `toTeachingAssistantMessage()`，把 OpenAI-compatible assistant message 转成教学版 `AssistantMessage`。
  - 转换 `tool_calls[].function.name/arguments` 为 `ToolCallContent`。
  - 根据 `finish_reason === "tool_calls"` 或 tool call 数量设置 `stopReason: "toolUse"`。
  - 继续保持无环境变量时打印用法并跳过。
- 更新 `docs/project/build-08-real-model.md`：
  - 说明 adapter 的职责：provider 字段只在 adapter 中出现，Agent Loop 只看统一协议。
  - 增加非流式转换表、`toolResult` 回传 provider 的格式、流式 delta 拼接方式、错误和 abort 收尾策略。
  - 对照 Pi SDK 的 `AgentSession` 职责，强调模型状态、消息历史、压缩和事件流属于运行层。
- 更新 `docs/demos/05-real-model.md`：
  - 增加 adapter 函数讲解。
  - 说明 4 轮 tool call guardrail 的意义。
- 事实核对：
  - Pi 官方 SDK 将 `AgentSession` 作为生命周期、消息历史、模型状态、压缩和事件流管理入口。
  - Pi 的 `pi-ai` 层统一 provider 消息、工具和流式事件，避免 provider 差异进入 Agent Loop。
- 验证：
  - `npm run demo:05` 无环境变量路径成功跳过。
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run docs:build` 成功。

### 23. 真实 Pi 压缩复杂边界进阶页

- 新增 `docs/source/advanced-compaction.md`：
  - 解释真实 Pi 为什么不能只做“摘要旧消息 + 保留最近消息”。
  - 覆盖 `reserveTokens`、`keepRecentTokens`、`firstKeptEntryId`、turn boundary、split turn、重复压缩、branch summary 和文件操作追踪。
  - 增加流程图、工具调用切分图、split turn 图、真实 Pi vs 教学版对照表和轻量真实化练习。
- 更新 VitePress sidebar、源码阅读地图和基础压缩页：
  - 将进阶页挂入“第二部分：源码拆解”。
  - 在 `docs/source/session-compaction.md` 末尾引导读者继续阅读进阶边界。
- 事实核对：
  - Pi 官方 Compaction 文档确认自动压缩触发公式、默认 `reserveTokens: 16384`、默认 `keepRecentTokens: 20000`、split turn、cut point 规则、branch summarization 和文件操作累计追踪。
  - Pi 官方 Session Format 文档确认 `CompactionEntry` 的 `summary`、`firstKeptEntryId`、`tokensBefore`、`details` 字段，以及 `BranchSummaryEntry` 的语义。
  - 对照 `packages/coding-agent/src/core/compaction/compaction.ts`、`branch-summarization.ts`、`utils.ts`、`session-manager.ts`，确认文档没有把教学版简化误写成真实 Pi 行为。
- 验证：
  - `npm run docs:build` 成功。
  - `git diff --check` 成功。

### 24. 测试章节与最小测试套件

- 新增根脚本与 workspace 脚本：
  - `npm run teaching-agent:test`
  - `npm --workspace @how-pi-agent-works/teaching-agent run test`
- 新增最小测试套件：
  - `examples/teaching-agent/src/server/agent/loop.test.ts`
  - `examples/teaching-agent/src/server/agent/sessionStore.test.ts`
  - `examples/teaching-agent/src/server/agent/tools.test.ts`
- 覆盖本科生反馈中关心的工程边界：
  - loop 遇到 tool call 后会继续下一轮，形成 `assistant -> toolResult -> assistant`。
  - 工具不存在时会返回 `isError: true` 的 `toolResult`，而不是让 loop 崩溃。
  - 最大轮次可以阻止模型无限 tool call。
  - JSONL session 能从当前 leaf 重建上下文，并忽略兄弟分支。
  - 简化 compaction 会记录 `firstKeptEntryId` 并重建 “summary + recent messages”。
  - `read_file` 路径越界会被工作区安全检查拦截。
- 新增 `docs/project/testing.md`：
  - 讲解 Agent 项目的测试分层、关键断言、API/前端后续测试思路、常见误区和小练习。
  - 在 VitePress sidebar、调试验收页和运行页加入测试章节入口。
- 验证：
  - `npm run teaching-agent:test` 成功，7 个测试通过。
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run teaching-agent:build` 成功。
  - `npm run docs:build` 成功。
  - `git diff --check` 成功。

### 25. 进阶扩展方向工程草图

- 重写 `docs/project/extend.md`：
  - 增加扩展路线图，串联 provider adapter、tool permission hook、SSE streaming UI 和 session tree UI。
  - 解释为什么 provider 适配层不应该泄漏到 Agent Loop，并对照 Pi 的 `pi-ai` 分层。
  - 给出教学版 `beforeToolCall` 权限 hook 草图，覆盖 allow/block/rewrite/confirm 四类决策。
  - 给出 SSE 后端事件推送和 React 增量状态设计，覆盖 `message_update`、`tool_execution_start/end`。
  - 给出会话树 UI 的 API、树构建、leaf 切换和 branch summary 扩展路线。
  - 增加 Agent 失败模式专项表，包括无限 tool call、工具输出过长、模型不调用工具、参数 JSON 错误、provider 超时/断流、路径越界、并发写 session 等。
- 更新 `docs/reference/sources.md`：
  - 增加 Pi 官方 RPC Mode 文档作为事件流和外部 UI 集成参考。
- 事实核对：
  - Pi 官方 Extensions 文档确认扩展可监听 `tool_call`、`tool_result`，并可通过 UI 方法做确认、选择、输入等交互。
  - Pi 官方 SDK 文档确认 `AgentSession.subscribe()` 接收 `message_update`、`tool_execution_start/update/end` 等事件。
  - Pi 官方 RPC Mode 文档确认 JSONL 事件流包含 agent、turn、message、tool execution、compaction、retry 等事件类型。
  - 教程中明确区分真实 Pi 的 `tool_call` hook 与教学版建议命名 `beforeToolCall`。
- 验证：
  - `npm run docs:build` 成功。
  - `git diff --check` 成功。

### 26. 二轮最终验证与读者路径检查

- 文档与 Demo：
  - `npm run docs:build` 成功。
  - `npm run demo:01` 成功。
  - `npm run demo:02` 成功。
  - `npm run demo:03` 成功。
  - `npm run demo:04` 成功。
  - `npm run demo:05` 在未配置环境变量时按预期跳过，退出成功。
- 教学版 Agent：
  - `npm run teaching-agent:test` 成功，7 个测试通过。
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run teaching-agent:build` 成功。
  - 启动 `npm run teaching-agent:dev` 成功，API 监听 `http://localhost:4317`，前端监听 `http://localhost:5174`。
- API 验证：
  - `GET /api/session` 返回 `teaching-session`、工具列表和 session header。
  - `POST /api/reset` 成功重置会话。
  - `POST /api/prompt` 输入“列出工作区文件”，返回 user、assistant toolCall、toolResult、assistant final，JSONL entries 正常追加。
- 浏览器验证：
  - 使用 Playwright CLI 打开 `http://localhost:5174/`。
  - 桌面视口可见聊天区、工具调用、工具列表和 Event Timeline。
  - 输入“读取 agent-notes.md”并提交，页面展示 `read_file` tool call、`tool:read_file` 工具结果和最终 assistant 回答。
  - 切换到 390px 宽度后页面无横向溢出，`documentElement.scrollWidth === clientWidth`。
  - 浏览器 console error 为 0。
- 读者路径抽查：
  - `docs/index.md` 能跳转到学习路线、核心概念、最终项目、联系赞助。
  - `docs/project/build-00-roadmap.md` 保留从空目录开始的跟做入口。
  - `docs/project/testing.md`、`docs/source/advanced-compaction.md`、`docs/project/extend.md` 已纳入 sidebar 和相关页面跳转。
  - `docs/reference/sources.md` 保留官方来源和最近核对记录。
- 清理：
  - 已关闭 Playwright browser。
  - 已停止教学版 dev server。
  - 已删除 `docs/.vitepress/dist/`、`docs/.vitepress/cache/`、`examples/teaching-agent/dist/`、`examples/teaching-agent/.teaching-agent/`、`.playwright-cli/`、`output/`。
  - 使用 `rg` 确认仓库中没有临时 API Key。

### 27. 总回顾与入口计划收口

- 按用户要求做整体回顾，重点检查：
  - `specs/PLAN.md` 是否还有未完成状态或会误导维护者的旧计划。
  - README、Quick Start、联系赞助、Demo、最终项目、测试章节和资料来源是否互相一致。
  - 二维码资源是否同时存在于根目录 `public/` 和 VitePress `docs/public/`。
  - 仓库中是否包含临时 API Key 或测试 endpoint。
- 发现并修复：
  - README 的教学版 Agent 检查命令缺少新增的 `npm run teaching-agent:test`。
  - Quick Start 缺少提交前推荐的 test/typecheck/build 检查命令。
  - `specs/PLAN.md` 顶部信息架构没有同步新增源码页、Demo 5、从零实现分步教程和测试章节。
  - `specs/PLAN.md` 末尾早期“内容补强收口计划”未标记为历史归档，容易被误读成待执行计划。
- 事实与资源核对：
  - `git remote -v` 确认为 `cellinlab/how-pi-agent-works`，与 VitePress edit link 一致。
  - 根目录 `public/` 与 `docs/public/` 均包含联系与赞助二维码资源。
  - `rg` 未发现临时 API Key。
- 验证：
  - `npm run docs:build` 成功。
  - `npm run teaching-agent:test` 成功，7 个测试通过。
  - `git diff --check` 成功。

### 28. 模型接口与工具权限 hook

- 新增 `examples/teaching-agent/src/server/agent/model.ts`：
  - 抽出 `TeachingModel` 和 `CompleteInput`。
  - `runAgentLoop()` 不再硬编码 `MockModel` 类型。
- 更新 `MockModel`：
  - 实现 `TeachingModel`。
  - 当用户输入包含 `secret` 或 `秘密` 并请求写笔记时，会生成 `secret-note.md`，用于演示权限拦截。
- 更新 `runAgentLoop()`：
  - 新增 `beforeToolCall` hook。
  - 支持 `allow`、`block`、`rewrite` 三类决策。
  - block 时不会执行工具，会生成 `isError: true` 的 `toolResult`。
  - rewrite 时会用新参数执行工具。
  - 新增 `tool_permission` 事件，供前端 Event Timeline 展示。
- 更新默认后端策略：
  - `write_note` 文件名包含 `secret` 或 `秘密` 时 block。
  - `list_files` 缺少 `path` 时 rewrite 为 `"."`。
- 更新前端和文档：
  - Event Timeline 展示 `tool_permission`。
  - 后端实现、测试章节、Step 2 和扩展方向页同步说明 `TeachingModel` 与 `beforeToolCall`。
- 测试：
  - 新增 block 用例，确认工具未执行且返回错误 toolResult。
  - 新增 rewrite 用例，确认 registry 收到改写后的参数。
- 验证：
  - `npm run teaching-agent:test` 成功，9 个测试通过。
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run teaching-agent:build` 成功。
  - `npm run docs:build` 成功。
  - `git diff --check` 成功。

### 29. SSE 流式事件 API 与前端增量 UI

- 后端新增流式 run API：
  - `POST /api/runs` 创建 run，返回 `runId`。
  - `GET /api/runs/:runId/events` 通过 SSE 推送事件。
  - `POST /api/prompt` 保留为一次性返回兼容接口。
- 后端执行链路调整：
  - 抽出 `executePrompt()`，统一处理用户消息、compaction、Agent Loop、持久化。
  - run record 会缓存已经发生的事件，浏览器连接后先回放，再继续接收新事件。
  - run 结束时发送 `run_done`，错误时发送 `run_error`。
  - 增加简单 active run guard，避免同一教学会话并发写 session。
- 前端改为默认使用 SSE：
  - 提交 prompt 后先请求 `/api/runs`。
  - 再使用 `EventSource` 订阅 `/api/runs/:runId/events`。
  - 根据 `message_start`、`message_update`、`message_end` 增量更新聊天区。
  - 根据所有 AgentEvent 增量更新 Event Timeline。
  - 收到 `run_done` 后用完整 session 对齐最终状态。
- 文档同步：
  - 更新后端 API 表。
  - 更新前端状态模型与 SSE 时序图。
  - 更新扩展方向页，将 SSE 和增量 UI 标记为已实现。
- 验证：
  - `npm run teaching-agent:test` 成功，9 个测试通过。
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run teaching-agent:build` 成功。
  - `npm run docs:build` 成功。
  - 启动 `npm run teaching-agent:dev` 后，用 curl 验证 `/api/runs` 与 SSE 事件流，确认包含 `tool_permission`、`agent_end` 和 `run_done`。

### 30. 最小会话树 UI 与 branch endpoint

- 后端会话能力：
  - `JsonlSessionStore` 新增 `getLeafId()`。
  - `JsonlSessionStore` 新增 `switchLeaf(leafId)`，允许切换到已有 entry。
  - `SessionResponse` 新增 `leafId`。
  - 新增 `POST /api/branch`，用于切换当前 leaf。
  - 新增 `branch_switch` event，方便 Event Timeline 展示分支切换。
- 前端能力：
  - 侧栏新增 Session Tree 区域。
  - 前端按 `entries[].parentId` 构建树。
  - 当前 leaf 高亮显示。
  - 点击节点会调用 `/api/branch` 并刷新当前上下文。
- 文档同步：
  - 更新后端 API 表。
  - 更新前端实现页，解释 Session Tree 为什么存在、如何调用 `/api/branch`。
  - 更新 Step 4，说明 `switchLeaf()` 与 branch endpoint 可在主链路跑通后补。
  - 更新扩展方向页，将最小会话树 UI 标记为已实现。
- 验证：
  - `npm run teaching-agent:test` 成功，9 个测试通过。
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run teaching-agent:build` 成功。
  - `npm run docs:build` 成功。
  - 启动 `npm run teaching-agent:dev` 后，用 curl 验证 `/api/branch` 可将 `leafId` 切回 `entry_1`，返回上下文只包含该 leaf 路径，并记录 `branch_switch` event。

### 31. 第三轮最终验证

- 文档与 Demo：
  - `npm run docs:build` 成功。
  - `npm run demo:01` 成功。
  - `npm run demo:02` 成功。
  - `npm run demo:03` 成功。
  - `npm run demo:04` 成功。
  - `npm run demo:05` 在未配置环境变量时按预期跳过，退出成功。
- 教学版 Agent：
  - `npm run teaching-agent:test` 成功，9 个测试通过。
  - `npm run teaching-agent:typecheck` 成功。
  - `npm run teaching-agent:build` 成功。
- 浏览器验证：
  - 启动 `npm run teaching-agent:dev` 成功。
  - Playwright 打开 `http://localhost:5174/` 成功。
  - 输入“写一条 secret 笔记”，SSE 流式完成后页面展示：
    - `write_note` tool call。
    - `tool:write_note` 错误工具结果。
    - `tool_permission block: write_note` 时间线事件。
    - Session Tree 中的 `entry_1` 到 `entry_4`。
  - 点击 Session Tree 的 `entry_1` 后，聊天区只保留当前 leaf 路径上的 user 消息，Event Timeline 出现 `branch_switch: entry_1`。
  - 390px 移动视口无横向溢出，`documentElement.scrollWidth === clientWidth`。
  - 浏览器 console error 为 0。
- 清理：
  - 已关闭 Playwright browser。
  - 已停止教学版 dev server。
  - 已删除 `docs/.vitepress/dist/`、`docs/.vitepress/cache/`、`examples/teaching-agent/dist/`、`examples/teaching-agent/.teaching-agent/`、`.playwright-cli/`、`output/`。
  - 使用 `rg` 确认仓库中没有临时 API Key。

### 32. 文档一致性复查收口

- 用户询问是否还有未完成任务后，重新检查：
  - `git status --short`
  - `specs/PLAN.md` 进行中/待开始状态
  - `TODO` / `FIXME` / 临时 API Key / 测试 endpoint
  - 构建、会话、Playwright 临时产物
- 发现旧表述并修复：
  - `docs/project/extend.md` 仍把 SSE 写成下一步计划。
  - `docs/project/build-06-frontend.md` 仍说教学版没有 streaming UI。
  - `docs/project/overview.md` 的请求链路仍只画 `/api/prompt`。
- 修复后状态：
  - 概览页、Step 6 和扩展页都与当前实现一致：浏览器默认 `/api/runs` + SSE，`/api/prompt` 保留为 curl/跟做最小版调试入口。
- 验证：
  - `npm run docs:build` 成功。
  - `git diff --check` 成功。
