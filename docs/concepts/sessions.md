# 会话、树与分支

会话不是聊天记录的简单数组。对 coding agent 来说，会话承担了三个职责：

1. 保存历史，支持继续工作。
2. 支持从早期节点重新探索另一条路径。
3. 为上下文构建、压缩和导出提供结构化材料。

Pi 使用 JSONL 文件保存会话，并用 `id` / `parentId` 把条目组织成树。

## 为什么是 JSONL

JSONL 的每一行都是一个独立 JSON 对象。

```json
{"type":"session","version":3,"id":"s1","cwd":"/project"}
{"type":"message","id":"a1","parentId":null,"message":{"role":"user","content":"修 README"}}
{"type":"message","id":"a2","parentId":"a1","message":{"role":"assistant","content":[]}}
```

::: tip 真实 Pi 与教学版的版本号
Pi 官方 Session Format 文档说明当前 session header 会迁移到 `version: 3`：v1 是早期线性 entry，v2 引入 `id` / `parentId` 树结构，v3 统一了扩展消息命名。本教程的教学版协议故意使用 `version: 1`，只是表示“教学版文件格式第 1 版”，不是在复刻 Pi 的真实版本号。

两者的学习主线是一致的：稳定 `id`、`parentId`、当前 `leafId`，以及通过 JSONL append 保存历史。
:::

它的好处是：

| 优点 | 解释 |
| --- | --- |
| 追加写简单 | 每产生一个条目就 append 一行 |
| 崩溃恢复友好 | 已写入的行仍可解析 |
| 适合长会话 | 不必每次重写整个大 JSON |
| 便于外部工具处理 | `rg`、脚本、日志工具都能扫 |

## 树结构

```mermaid
flowchart TD
  A["u1: 初始问题"] --> B["a1: 方案 A"]
  B --> C["u2: 继续方案 A"]
  C --> D["a2: A 的结果"]
  B --> E["u3: 改走方案 B"]
  E --> F["a3: B 的结果"]
```

如果当前 leaf 是 `D`，上下文就是 `A -> B -> C -> D`。当你跳回 `B` 并提交新用户消息，就产生 `E -> F` 这条新分支。旧分支不会丢。

## leaf 的意义

`leafId` 是当前会话视角的末端。构建上下文时，不是把文件里所有条目都发给模型，而是从 leaf 一路沿 `parentId` 回溯到根，再反转成顺序。

```ts
function buildContext(leaf: Entry, byId: Map<string, Entry>) {
  const path: Entry[] = [];
  let current: Entry | undefined = leaf;
  while (current) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path.flatMap(entryToMessage);
}
```

## 分支时用户消息怎么处理

Pi 的 `/tree` 有一个很妙的交互：如果你选中一条用户消息，它不是把 leaf 移到这条消息，而是移到它的父节点，并把这条用户消息放回编辑器。

这样你可以改写原问题，然后重新提交，形成一条新分支。

```mermaid
flowchart LR
  A["选中 user message"] --> B["leaf = parentId"]
  B --> C["用户消息文本回填到编辑器"]
  C --> D["编辑后重新提交"]
  D --> E["产生新分支"]
```

## 分支摘要

当你从一条长分支切到另一条分支时，有时不想完全丢掉离开分支上的重要发现。Pi 支持 branch summary：把离开的分支总结成一个条目，附着到新位置。

这不是普通压缩，而是“跨分支携带经验”。

## Session entry 不只保存消息

Pi 的 session file 里不只有 `message`。它还会记录模型切换、thinking level、compaction、branch summary、自定义扩展条目和 session 名称等。这样恢复会话时，系统不只是恢复聊天文本，而是恢复“当时的运行上下文”。

| entry 类型 | 为什么要保存 |
| --- | --- |
| `message` | 构造后续 LLM 上下文 |
| `model_change` | 恢复时知道上一轮用的 provider/model |
| `thinking_level_change` | 恢复 reasoning 设置 |
| `compaction` | 长会话用摘要替代旧消息 |
| `branch_summary` | 分支跳转后携带离开分支的经验 |
| `custom` / `custom_message` | 扩展持久化自己的状态或注入上下文 |

教学版只实现 `message` 和最小 `compaction`，但类型上保留了继续扩展的空间。

## 常见误区

| 误区 | 后果 | 修正 |
| --- | --- | --- |
| 用数组下标表示历史位置 | 删除、压缩、分支后引用会错 | 用稳定 `id` 和 `parentId` |
| 切分支时删除旧分支 | 失去探索记录，无法回滚 | 保留旧 entry，只移动 leaf |
| 压缩后把旧消息全删掉 | 以后无法审计和重新构建分支 | 追加 compaction entry，不破坏原始历史 |
| 只保存 assistant 最终文本 | 工具结果和错误丢失 | 用户、助手、工具结果都作为消息保存 |

## 教学版保留什么

我们的教学版会保留：

| 能力 | 保留程度 |
| --- | --- |
| JSONL append | 保留 |
| `id` / `parentId` | 保留 |
| `leafId` | 保留 |
| 从 leaf 构建上下文 | 保留 |
| branch summary | 作为扩展练习 |
| 完整 TUI tree selector | 不实现，只用 API/日志展示 |

## 小练习

运行：

```bash
npm run demo:03
```

观察输出里的两条分支。然后把 Demo 改成三条分支，试着预测每个 leaf 对应的上下文路径。
