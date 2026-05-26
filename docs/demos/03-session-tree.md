# Demo 3：JSONL 会话树

这个 Demo 展示会话为什么要用树，而不是简单数组。

## 学习目标

跑完这一节，你应该能说清楚：为什么 session entry 需要稳定 `id`，为什么 `parentId` 可以表达分支，以及 `leafId` 如何决定模型能看到哪条历史路径。

## 运行

```bash
npm run demo:03
```

Demo 会创建一条主线，再从中间节点分出另一条分支，最后分别打印两个 leaf 的上下文路径。

## 你会看到什么

```text
leaf A context:
user: 我想实现一个 Agent。
assistant: 可以从 Agent Loop 开始。
user: 选择方案 A
assistant: A 的结果

leaf B context:
user: 我想实现一个 Agent。
assistant: 可以从 Agent Loop 开始。
user: 选择方案 B
assistant: B 的结果
```

实际输出会包含更完整的节点 ID。

## 核心机制

每个 entry 都有：

```ts
type SessionEntry = {
  id: string;
  parentId: string | null;
  type: "message";
  message: Message;
};
```

追加新消息时，它的 `parentId` 指向当前 `leafId`，然后自己成为新的 leaf。

```ts
append(message) {
  const entry = { id: nextId(), parentId: this.leafId, message };
  this.entries.push(entry);
  this.leafId = entry.id;
}
```

## 对应最终项目

最终项目的 `JsonlSessionStore` 把这个内存树改成 JSONL append：每条 message entry 都会写入 `.teaching-agent/session.jsonl`，但构建上下文时仍然是从 `leafId` 沿 `parentId` 回溯。

## 改造练习

把 Demo 中的 `branchTo(rootAssistantId)` 改成 `branchTo(rootUserId)`，观察上下文路径如何变化。你会直观看到 leaf 位置对上下文构建的影响。
