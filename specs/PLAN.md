# Pi Agent 教程项目总控计划

## 项目目标

生成一个完整可运行的 VitePress 中文教学站点，主题是「Pi Agent 的原理与实现：从零到一实现一个 AI Agent」。

项目不做简单源码翻译，而是把 Pi 的核心设计拆成适合计算机本科毕业生学习的渐进式课程：

1. 先理解 Agent 的核心概念。
2. 再拆解 Pi 的架构和关键实现链路。
3. 通过多个小 Demo 逐步掌握机制。
4. 最后实现一个 React + Node.js + TypeScript 的教学版 Agent。

## 外部参考

| 来源 | 用途 |
| --- | --- |
| `https://github.com/earendil-works/pi` | Pi monorepo 源码、模块边界、核心实现 |
| `https://pi.dev/docs/latest` | 官方文档入口、定位、使用方式 |
| `https://pi.dev/docs/latest/sdk` | SDK、AgentSession、事件、运行时 API |
| `https://pi.dev/docs/latest/sessions` | 会话、树导航、fork/clone、branch summary |
| `https://pi.dev/docs/latest/session-format` | JSONL 会话格式、entry 类型、树结构 |
| `https://pi.dev/docs/latest/compaction` | 上下文压缩与分支摘要 |
| `https://pi.dev/docs/latest/extensions` | 扩展、工具注册、事件 hook、命令和 UI |
| `https://pi.dev/docs/latest/rpc` | RPC Mode、事件流和外部 UI 集成 |
| `https://pi.dev/docs/latest/skills` | 技能发现、按需加载、`SKILL.md` |

## Pi 核心理解摘要

Pi 的真实系统可以按三层理解：

| 层 | 包 | 核心职责 |
| --- | --- | --- |
| 模型适配层 | `@earendil-works/pi-ai` | 统一多模型供应商、消息协议、工具 schema、流式事件 |
| Agent 内核层 | `@earendil-works/pi-agent-core` | Agent Loop、状态、事件、工具执行、steer/followUp 队列 |
| 产品运行层 | `@earendil-works/pi-coding-agent` | 会话、资源加载、内置工具、扩展、压缩、TUI/RPC/print 模式 |

关键链路：

1. `AgentSession.prompt()` 做 preflight：命令、扩展 input、技能/模板展开、模型认证、压缩检查。
2. `Agent.prompt()` 创建上下文快照并调用 `runAgentLoop()`。
3. `runAgentLoop()` 请求模型，流式产生 assistant message。
4. assistant message 中若包含 `toolCall`，loop 校验参数、执行工具、生成 `toolResult`。
5. `toolResult` 追加回上下文，再发起下一轮模型请求。
6. 没有工具调用、被 abort、或策略要求停止时，发出 `agent_end`。
7. `AgentSession` 订阅事件，在 `message_end` 时写入 `SessionManager` JSONL。
8. 长会话通过 `CompactionEntry` 变成“摘要 + 最近消息”的上下文。

## 教程信息架构

### 开始

- `docs/index.md`：课程首页。
- `docs/quick-start.md`：安装、运行、学习路线。
- `docs/contact.md`：保留原 README 的作者联系方式和赞助二维码。

### 第一部分：核心概念

- `docs/concepts/what-is-agent.md`：Agent 最小定义和闭环。
- `docs/concepts/pi-architecture.md`：Pi 三层架构。
- `docs/concepts/message-and-stream.md`：消息、流式事件、状态机。
- `docs/concepts/tools.md`：工具定义、执行、hook、并行/串行。
- `docs/concepts/sessions.md`：JSONL 会话、树、leaf、分支。
- `docs/concepts/context.md`：资源加载、技能、上下文压缩。

### 第二部分：源码拆解

- `docs/source/source-map.md`：源码阅读地图。
- `docs/source/model-protocol.md`：`pi-ai` 模型协议与 provider adapter。
- `docs/source/agent-loop.md`：`runAgentLoop` 主链路。
- `docs/source/tools-extensions.md`：工具、扩展与资源加载。
- `docs/source/agent-session.md`：`AgentSession` 运行层职责。
- `docs/source/session-compaction.md`：会话格式、分支与压缩链路。
- `docs/source/advanced-compaction.md`：真实 Pi 压缩复杂边界。

### 第三部分：渐进式 Demo

- `docs/demos/01-loop.md` + `examples/demos/01-loop.ts`。
- `docs/demos/02-tools.md` + `examples/demos/02-tools.ts`。
- `docs/demos/03-session-tree.md` + `examples/demos/03-session-tree.ts`。
- `docs/demos/04-compaction.md` + `examples/demos/04-compaction.ts`。
- `docs/demos/05-real-model.md` + `examples/demos/05-openai-compatible.ts`。

### 第四部分：教学版目标项目

- `docs/project/overview.md`：目标项目架构。
- `docs/project/code-map.md`：Demo 到项目的映射。
- `docs/project/build-00-roadmap.md` 到 `docs/project/build-08-real-model.md`：从空目录到可选真模型 adapter 的分步教程。
- `docs/project/testing.md`：测试分层与最小测试套件。
- `docs/project/backend.md`：后端实现讲解。
- `docs/project/frontend.md`：前端实现讲解。
- `docs/project/run.md`：运行与调试。
- `docs/project/extend.md`：扩展方向。
- `examples/teaching-agent/`：React + Node.js + TypeScript 实现。

### 参考

- `docs/reference/pitfalls.md`：常见错误。
- `docs/reference/sources.md`：资料来源。

## 实施阶段

| 阶段 | 状态 | 验收标准 |
| --- | --- | --- |
| 调研 Pi 官方文档与源码 | 已完成 | 明确三层架构、Agent Loop、工具、会话、压缩、扩展 |
| 设计教程结构 | 已完成 | VitePress sidebar/nav 与章节路线确定 |
| 创建教程站点 | 已完成 | VitePress 配置、主题、Mermaid、内容页面齐备 |
| 实现渐进式 Demo | 已完成 | `npm run demo:01` 到 `demo:04` 都能运行，`demo:05` 作为可选真实模型烟测 |
| 实现教学版目标项目 | 已完成 | React 前端 + Node API 可本地启动并完成核心 prompt |
| 验证构建与运行 | 已完成 | `npm run docs:build`、Demo、教学项目 test/typecheck/build 通过 |
| 更新 README | 已完成 | README 指向教程站点、运行方式、联系方式 |
| 内容补强收口 | 已完成 | 模块关系、源码路线、关键章节、Demo 输出、目标项目对照进一步完善 |

## 教学版项目范围控制

必须保留：

- Agent Loop。
- 结构化消息。
- 工具调用和工具结果回写。
- 事件时间线。
- JSONL session entry。
- 最小会话树字段：`id`、`parentId`、`leafId`。
- 简化上下文压缩。
- React 前端可视化。

暂不实现：

- 将教学版目标项目默认接入真实模型供应商；真实模型接入先保留为可选 Demo 和 adapter 教学章节。
- 完整 OAuth/API Key 管理。
- 完整 Pi 扩展系统。
- 复杂 TUI。
- 多 session picker。
- 生产级权限审批 UI。

这些内容放到扩展方向讲解，避免教学项目失控。

## 后续维护规则

1. 每完成一个阶段，在 `specs/LOG.md` 追加记录。
2. 如果新增章节或改变目录，先更新本文件。
3. 如果实现范围改变，必须写明“为什么改变”和“影响哪些验收标准”。
4. 最终交付前，本文件状态必须和实际文件一致。

## 最终内容完成计划

用户已确认继续按计划把教程内容全部补齐。本轮不改变教学版 Agent 的技术范围，只补齐教程作为“可跟做课程”的最后缺口：源码深挖、实现路线、读者练习、调试验证和扩展边界。

### Commit 5：最终阶段计划登记（已完成）

- 更新 `specs/PLAN.md`，新增最终内容完成计划。
- 更新 `specs/LOG.md`，记录本轮开始、资料核对和提交拆分。
- 重新确认工作区干净，不重写已有历史。

### Commit 6：源码深挖与概念闭环（已完成）

- 新增 `pi-ai` 模型协议与 provider 适配讲解。
- 新增工具、扩展、技能和 prompt template 的关系讲解。
- 新增会话格式、分支、压缩和 branch summary 的实现链路讲解。
- 补齐“读源码时应该抓住哪些不变量”的小结，让读者能从官方文档映射到源码。

### Commit 7：从零实现最终项目教程（已完成）

- 新增从空目录开始搭建教学版 Agent 的分步教程。
- 逐步覆盖共享协议、后端 Agent Loop、工具系统、JSONL 会话、React 前端、调试方法。
- 每一步都包含“为什么这一步存在”“关键代码”“运行检查”“小练习”。
- 补强最终项目文档，形成“Demo -> 分步实现 -> 完整项目”的闭环。

### Commit 8：最终验证与交付日志（已完成）

- 运行 `npm run docs:build`。
- 运行 `npm run demo:01` 到 `npm run demo:04`。
- 如果有临时 API Key，运行 `npm run demo:05` 验证 OpenAI-compatible 工具调用链路；密钥不得写入仓库。
- 运行 `npm run teaching-agent:typecheck` 和 `npm run teaching-agent:build`。
- 启动教学版 Agent，验证 API 与浏览器桌面/移动视口。
- 清理临时产物，更新 `specs/LOG.md`，最终确认 `git status --short` 为空。

## 本科生试读反馈完善计划

本轮基于本科生读者反馈继续打磨。目标不是扩大成生产级 Pi 复刻，而是让“从零到一复现一个教学版 Agent”的工程跟做体验更强，并补齐真实 Pi 复杂边界的解释。

### 总原则

1. 先修正会误导读者的内容，再补手把手工程材料。
2. 不破坏现有课程主线：概念 -> 源码 -> Demo -> 教学版项目。
3. 每个阶段先更新 `specs/PLAN.md` 状态，完成后追加 `specs/LOG.md`。
4. 每个阶段单独 commit。
5. 默认教学项目继续用 `MockModel`，真实模型作为 adapter/可选 Demo 展示。

### Commit 9：反馈登记与计划拆分（已完成）

- 记录本科生试读反馈。
- 明确后续阶段、优先级和验收标准。
- 修正 `PLAN.md` 中“真实模型默认接入”的范围描述，避免歧义。

### Commit 10：修正误导性图表与命名不一致（已完成）

- 修正 `docs/project/overview.md` 中“一次请求的后端流程”：
  - 当前图误写为 `AgentLoop -> Store`。
  - 改为 `AgentLoop -->> API: newMessages + events`，再由 `API -> Store: append newMessages`。
- 修正 `docs/project/backend.md` 的 `RunResult` 命名：
  - 文档中写 `messages`。
  - 实际代码返回 `newMessages`。
- 在 `docs/concepts/sessions.md` 增加提示框：
  - 真实 Pi session format 示例可以是 `version: 3`。
  - 教学版协议为了简化使用 `version: 1`。
  - 解释两者差异不影响 `id` / `parentId` / `leafId` 主线。
- 修正 VitePress `editLink.pattern`：
  - 不再指向 `earendil-works/pi`。
  - 方案优先级：如果本教程有远程仓库 URL，则指向本教程仓库；否则关闭 edit link。
- 验收：
  - `npm run docs:build` 通过。
  - Mermaid 专项检查通过。
  - 相关页面不再与真实代码链路冲突。

### Commit 11：把“从零实现”改成可跟做工程手册（已完成）

- 为 `docs/project/build-00-roadmap.md` 补“从空目录开始”的完整脚手架步骤：
  - 初始化 npm workspace。
  - 安装依赖。
  - 创建目录树。
  - 配置 TypeScript、Vite、Express、proxy。
- 为 Step 1 到 Step 7 每页统一补齐：
  - 本节新增/修改文件清单。
  - 可复制的完整代码或局部 diff。
  - 运行命令。
  - 预期输出。
  - 常见报错与排查。
  - 本节完成后的 git checkpoint 建议。
- 新增“跟做版本 vs 完整仓库版本”的说明，避免读者误以为只能复制现成代码。
- 验收：
  - 每个 Step 页面都能回答“我要新建哪些文件、写什么代码、跑什么命令、看到什么结果”。
  - `npm run docs:build` 通过。

### Commit 12：补 provider adapter 与真实模型教学链路（已完成）

- 新增或扩展真实模型 adapter 章节，重点不是 smoke test，而是协议转换：
  - OpenAI-compatible `tool_calls` -> 教学版 `AssistantMessage.content[]`。
  - `tool` message -> 教学版 `ToolResultMessage`。
  - `finish_reason` / provider error -> `stopReason` 和 `errorMessage`。
  - 流式 `delta` 如何拼成 text block / tool call block。
  - abort 时模型请求、工具执行和事件如何收尾。
- 将 Demo 5 从“烟测”扩展成“adapter 阅读与改造练习”：
  - 保持默认无 key 可跳过。
  - 增加 adapter 伪代码和边界表。
- 对照 Pi 官方 SDK 的 `AgentSession` 生命周期、事件订阅和模型状态管理，说明教学版简化在哪里。
- 验收：
  - `npm run demo:05` 无环境变量时仍可跳过。
  - 有环境变量时继续能触发工具调用链路。
  - 不提交任何 API Key。

### Commit 13：补真实 Pi 压缩复杂边界进阶页（已完成）

- 新增“进阶：真实 Pi 为什么压缩更复杂”页面，或扩展 `docs/source/session-compaction.md`。
- 覆盖：
  - `reserveTokens`。
  - `keepRecentTokens`。
  - `firstKeptEntryId`。
  - turn boundary。
  - split turn。
  - 重复压缩。
  - branch summary 与普通 compaction 的区别。
  - 工具输出和文件操作追踪为什么会影响摘要质量。
- 明确“教学版为什么不实现这些复杂边界”，保持本科生学习曲线。
- 验收：
  - 页面中至少包含一张流程图、一张对比表和一个小练习。
  - `npm run docs:build` 通过。

### Commit 14：补测试章节与最小测试套件（已完成）

- 新增 `docs/project/testing.md`。
- 讲解 Agent 项目的测试分层：
  - loop 单元测试。
  - tool registry 测试。
  - session store 测试。
  - API 集成测试。
  - 前端 smoke test。
- 增加最小测试命令和示例用例，优先覆盖：
  - loop 遇到 tool call 会继续下一轮。
  - 工具不存在会变成 `isError` toolResult。
  - session 能从 leaf 重建上下文。
  - 路径越界会被拦截。
  - 最大轮次能阻止无限 tool call。
- 若引入测试框架，优先选轻量方案并保持脚本简单。
- 验收：
  - 新增 `npm run teaching-agent:test` 或等价测试脚本。
  - 测试命令通过。
  - 文档解释测试为什么能保护 Agent 工程边界。

### Commit 15：补三个进阶扩展方向的工程草图（已完成）

- 扩展 `docs/project/extend.md`，把读者更感兴趣的方向变成工程草图：
  - 工具权限模型：`beforeToolCall` / `tool_call` 的确认、拦截、参数改写。
  - 真正流式 UI：SSE 推送 `message_update`、`tool_execution_start/end` 到 React。
  - 会话树 UI：用 `id` / `parentId` / `leafId` 做可点击分支视图。
- 增加 Agent 失败模式专项表：
  - 无限 tool call。
  - 工具输出过长。
  - 模型不调用工具。
  - 工具参数 JSON 错误。
  - provider 超时/断流。
- 验收：
  - 每个方向包含最小接口设计、关键状态、实现步骤和风险提示。
  - `npm run docs:build` 通过。

### Commit 16：二轮最终验证与读者路径检查（已完成）

- 运行：
  - `npm run docs:build`
  - `npm run demo:01`
  - `npm run demo:02`
  - `npm run demo:03`
  - `npm run demo:04`
  - `npm run demo:05`
  - `npm run teaching-agent:typecheck`
  - `npm run teaching-agent:build`
  - 新增测试命令。
- 启动教学版 Agent 做 API 和浏览器验证。
- 做一次“本科生跟做路径”人工检查：
  - 从 quick-start 进入。
  - 跑 Demo。
  - 按 Step 页面从空目录理解实现顺序。
  - 确认最终项目能运行。
- 清理临时产物。
- 更新 `specs/LOG.md`。

## 总回顾收口计划

用户要求继续整体回顾，确认是否还有遗漏。检查结论：功能内容、教程主线、Demo、教学版项目、联系赞助、测试和验证均已覆盖；需要补的是入口文档与总控计划的一致性。

### Commit 17：入口文档与计划一致性收口（已完成）

- 更新 README，把新增测试命令加入教学版 Agent 检查命令。
- 同步 `specs/PLAN.md` 的信息架构：
  - 补齐新增源码页。
  - 补齐 Demo 5。
  - 补齐最终项目分步教程和测试章节。
  - 标记早期“内容补强收口计划”为历史归档，避免被误读为未完成计划。
- 验收：
  - `npm run docs:build` 通过。
  - `npm run teaching-agent:test` 通过。
  - `git diff --check` 通过。

## 第三轮工程增强计划

用户要求继续后续计划实现。本轮把 `docs/project/extend.md` 中的推荐扩展路线逐步落到教学版 Agent 代码里，但仍保持“教学版可理解、可运行”的范围，不追求完整生产级 Pi 复刻。

### Commit 18：模型接口与工具权限 hook（已完成）

- 抽出 `TeachingModel` 接口，让 `MockModel` 不再作为 `runAgentLoop()` 的硬编码类型。
- 在 Agent Loop 中加入 `beforeToolCall` hook，支持：
  - `allow`：直接执行。
  - `block`：生成 `isError: true` 的 `toolResult`。
  - `rewrite`：用改写后的参数执行工具。
- 增加工具权限事件，便于前端 Event Timeline 展示拦截和改写。
- 给测试补覆盖：
  - 被 block 的工具不会执行。
  - rewrite 后执行新参数。
- 更新对应教程说明。
- 验收：
  - `npm run teaching-agent:test` 通过。
  - `npm run teaching-agent:typecheck` 通过。
  - `npm run docs:build` 通过。

### Commit 19：SSE 流式事件 API 与前端增量 UI（已完成）

- 新增 `POST /api/runs` 和 `GET /api/runs/:runId/events`。
- 保留 `POST /api/prompt` 作为一次性返回兼容接口。
- React 前端改为优先使用 SSE：
  - 先创建 run。
  - 再订阅事件流。
  - 根据 `message_start/update/end`、`tool_execution_start/end` 增量刷新 UI。
- 增加运行状态与错误收尾。
- 更新文档与验证。

### Commit 20：最小会话树 UI 与 branch endpoint（已完成）

- 在 `JsonlSessionStore` 中暴露安全的 leaf 切换方法。
- 新增 `POST /api/branch`，允许从已有 entry 继续。
- React 侧栏新增 Session Tree：
  - 按 `id` / `parentId` 构建树。
  - 高亮当前 leaf。
  - 点击节点切换上下文。
- 保持 branch summary 作为文档进阶，不在本阶段实现复杂摘要。
- 更新文档与验证。

### Commit 21：第三轮最终验证（已完成）

- 运行文档、Demo、测试、typecheck、build。
- 启动教学版 Agent，验证：
  - 权限 hook 拦截/改写。
  - SSE 事件流。
  - 会话树点击分支。
  - 桌面与移动视口。
- 清理临时产物，更新 `specs/LOG.md`。

### Commit 22：文档一致性复查收口（已完成）

- 修正第三轮工程增强后遗留的旧文档表述：
  - `docs/project/overview.md` 的“一次请求的后端流程”改为 `/api/runs` + SSE。
  - `docs/project/build-06-frontend.md` 改为四区布局：聊天、Session Tree、工具列表、事件时间线。
  - `docs/project/build-06-frontend.md` 的数据流说明改为 `/api/runs` + `EventSource`，同时保留 `/api/prompt` 作为跟做最小版建议。
  - `docs/project/extend.md` 不再把 SSE 描述为“下一步”，改为已实现的两段式流式 UI。
- 验收：
  - `npm run docs:build` 通过。
  - `git diff --check` 通过。

## Vercel 部署计划

用户要求加上 Vercel 配置并部署。本阶段只部署 VitePress 教程站点，不把教学版 Node API 作为生产后端部署；教学版 Agent 仍作为本地教学项目运行。

### Commit 23：Vercel 配置与部署（已完成）

- 新增 `vercel.json`：
  - build command 使用 `npm run docs:build`。
  - output directory 指向 `docs/.vitepress/dist`。
  - install command 使用 `npm install`。
- 更新 README，补充 Vercel 部署说明。
- 本地验证：
  - `npm run docs:build`。
  - `git diff --check`。
- 部署：
  - 检查 Vercel CLI 登录状态。
  - 若本机已登录/可链接项目，则执行生产部署。
  - 若缺少登录或项目授权，记录阻塞点和下一步命令。

## 站点社媒链接修正计划

用户要求 VitePress 站点中的 GitHub 指向本教程项目地址，并增加 X/Twitter 社媒地址。本阶段只修正站点导航/联系方式，不修改资料来源页面中对 Pi 官方源码仓库的引用。

### Commit 24：VitePress GitHub 与 X 链接修正（已完成）

- 将 VitePress `socialLinks` 的 GitHub 改为 `https://github.com/cellinlab/how-pi-agent-works`。
- 新增 X/Twitter social link：`https://x.com/cellinlab`。
- 在 `docs/contact.md` 和 README 联系方式中补充 X 地址。
- 运行 `npm run docs:build` 验证 VitePress 配置。
- 如构建通过，重新生产部署站点。

## 历史计划：内容补强收口（已完成并归档）

以下计划来自早期内容补强阶段，已经由后续 Commit 1-4 以及 Commit 5-16 逐步完成。保留它是为了追溯任务演进，不再作为待执行计划。

本轮以现有三次提交为基线，不重写历史，不扩大教学版 Agent 的实现边界，只做教程质量、代码讲解、验证记录和分阶段提交。

### Commit 1：计划登记（已完成，历史记录）

- 更新 `specs/PLAN.md`，明确内容补强收口阶段。
- 更新 `specs/LOG.md`，记录本轮开始、约束和提交拆分规则。

### Commit 2：教程正文补强（已完成，历史记录）

- 增加 `pi-ai`、`pi-agent-core`、`pi-coding-agent` 的模块关系图和源码阅读地图。
- 补强 Agent Loop、工具调用、会话树、上下文压缩章节中的“为什么这样设计”和常见误区。
- 保持 VitePress 信息架构稳定，只在确实能降低学习成本时新增页面。

### Commit 3：Demo 与教学项目对照补强（已完成，历史记录）

- 给四个 Demo 源码增加少量教学注释，解释关键转折点。
- 让每个 Demo 文档都包含目标、运行命令、预期输出、关键代码、小练习。
- 增加教学版 Agent 的代码对照说明，让读者知道 Demo 机制如何汇入最终项目。

### Commit 4：验证与日志收口（已完成，历史记录）

- 运行文档、Demo、教学版 Agent 的构建和类型检查。
- 启动教学版 Agent，验证 API 和浏览器交互。
- 清理临时验证产物，不提交 build/cache/session/screenshot。
- 在 `specs/LOG.md` 写入完整验证记录。
