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

- `docs/source/agent-loop.md`：`runAgentLoop` 主链路。
- `docs/source/agent-session.md`：`AgentSession` 运行层职责。

### 第三部分：渐进式 Demo

- `docs/demos/01-loop.md` + `examples/demos/01-loop.ts`。
- `docs/demos/02-tools.md` + `examples/demos/02-tools.ts`。
- `docs/demos/03-session-tree.md` + `examples/demos/03-session-tree.ts`。
- `docs/demos/04-compaction.md` + `examples/demos/04-compaction.ts`。

### 第四部分：教学版目标项目

- `docs/project/overview.md`：目标项目架构。
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
| 验证构建与运行 | 已完成 | `npm run docs:build`、Demo、教学项目 typecheck/build 通过 |
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

- 教学版目标项目默认接入真实模型供应商。
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

## 内容补强收口计划

本轮以现有三次提交为基线，不重写历史，不扩大教学版 Agent 的实现边界，只做教程质量、代码讲解、验证记录和分阶段提交。

### Commit 1：计划登记

- 更新 `specs/PLAN.md`，明确内容补强收口阶段。
- 更新 `specs/LOG.md`，记录本轮开始、约束和提交拆分规则。

### Commit 2：教程正文补强

- 增加 `pi-ai`、`pi-agent-core`、`pi-coding-agent` 的模块关系图和源码阅读地图。
- 补强 Agent Loop、工具调用、会话树、上下文压缩章节中的“为什么这样设计”和常见误区。
- 保持 VitePress 信息架构稳定，只在确实能降低学习成本时新增页面。

### Commit 3：Demo 与教学项目对照补强

- 给四个 Demo 源码增加少量教学注释，解释关键转折点。
- 让每个 Demo 文档都包含目标、运行命令、预期输出、关键代码、小练习。
- 增加教学版 Agent 的代码对照说明，让读者知道 Demo 机制如何汇入最终项目。

### Commit 4：验证与日志收口

- 运行文档、Demo、教学版 Agent 的构建和类型检查。
- 启动教学版 Agent，验证 API 和浏览器交互。
- 清理临时验证产物，不提交 build/cache/session/screenshot。
- 在 `specs/LOG.md` 写入完整验证记录。
