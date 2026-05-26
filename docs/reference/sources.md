# 资料来源

本教程基于 Pi 官方文档、GitHub 源码和本仓库中的教学实现整理。内容经过重新组织，目标是教学，不是逐字源码翻译。

## 官方文档

| 资料 | 用途 |
| --- | --- |
| [Pi Documentation](https://pi.dev/docs/latest) | 总体定位、安装、文档导航 |
| [SDK](https://pi.dev/docs/latest/sdk) | `createAgentSession`、`AgentSession`、事件、SDK 用法 |
| [Sessions](https://pi.dev/docs/latest/sessions) | 会话保存、树导航、分支、命名、fork/clone |
| [Session File Format](https://pi.dev/docs/latest/session-format) | JSONL 格式、entry 类型、`id` / `parentId` 树结构 |
| [Compaction](https://pi.dev/docs/latest/compaction) | 上下文压缩、branch summary、cut point 规则 |
| [Extensions](https://pi.dev/docs/latest/extensions) | 扩展、工具注册、事件 hook、命令、UI 能力 |
| [Skills](https://pi.dev/docs/latest/skills) | 技能发现、按需加载、`SKILL.md` 结构 |

## GitHub 源码

| 源码 | 教程中对应内容 |
| --- | --- |
| [earendil-works/pi](https://github.com/earendil-works/pi) | Pi monorepo 总览 |
| `packages/ai/src/types.ts` | `Message`、`ToolCall`、`AssistantMessageEvent` |
| `packages/ai/src/stream.ts` | `streamSimple()` 统一模型调用入口 |
| `packages/agent/src/types.ts` | `AgentTool`、`AgentEvent`、`AgentLoopConfig` |
| `packages/agent/src/agent-loop.ts` | Agent Loop、工具执行、stream assistant response |
| `packages/agent/src/agent.ts` | Agent 状态、队列、订阅和生命周期 |
| `packages/coding-agent/src/core/agent-session.ts` | session prompt 链路、扩展 hook、压缩、模型管理 |
| `packages/coding-agent/src/core/session-manager.ts` | JSONL 会话、树结构、上下文构建 |
| `packages/coding-agent/src/core/resource-loader.ts` | 扩展、技能、prompt、上下文文件加载 |
| `packages/coding-agent/src/core/system-prompt.ts` | 系统提示词构造 |
| `packages/coding-agent/src/core/tools/` | 内置 read/bash/edit/write/grep/find/ls 工具 |

## 本教程中的实现

| 目录 | 说明 |
| --- | --- |
| `examples/demos/` | 四个渐进式小 Demo |
| `examples/teaching-agent/` | React + Node 教学版目标项目 |

## 阅读建议

先读教程，再读源码。直接从 Pi 源码入口读起，容易被扩展、TUI、模型供应商兼容性淹没。先在教学版里把核心闭环跑通，再回到真实源码，很多“复杂”会变成“必要的工程化边界”。
