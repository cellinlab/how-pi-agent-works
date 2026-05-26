# 测试：把 Agent 当工程系统保护起来

能跑通一个 Agent 页面只是第一步。真正写工程代码时，你要证明几个边界不会被以后改坏：

1. 模型要求调用工具时，loop 会执行工具并继续下一轮。
2. 工具出错时，不会直接让进程崩掉，而是变成 `isError: true` 的 `toolResult`。
3. session 能从当前 `leafId` 重建上下文，而不是把兄弟分支也塞进去。
4. 文件工具只能访问安全工作区。
5. 模型一直调用工具时，最大轮次能把循环停住。
6. 工具权限 hook 能阻止危险工具调用，也能在执行前改写参数。

本项目用 Node 内置 `node:test` 加 `tsx` 跑 TypeScript 测试，不额外引入 Jest/Vitest。对本科生读者来说，这样更容易看清测试本身在保护什么。

## 运行命令

```bash
npm run teaching-agent:test
```

预期输出里会看到 9 个测试通过。不同 Node 版本的 TAP 输出格式可能略有不同，但最终应该包含 `fail 0`。

## 测试文件

```text
examples/teaching-agent/src/server/agent/
├── loop.test.ts
├── sessionStore.test.ts
└── tools.test.ts
```

| 文件 | 覆盖重点 | 为什么重要 |
| --- | --- | --- |
| `loop.test.ts` | tool call、未知工具、最大轮次、权限 hook | Agent Loop 是最容易被改坏的核心闭环 |
| `sessionStore.test.ts` | leaf 路径、compaction 恢复 | 会话不是普通数组，压缩后也要能重建上下文 |
| `tools.test.ts` | 安全工作区、路径越界 | 工具有副作用，必须先测边界 |

## Loop 测试：工具调用必须继续下一轮

关键断言不是“模型返回了 tool call”，而是完整链路：

```ts
const result = await runAgentLoop({
  systemPrompt: "You are a teaching agent.",
  messages: [createUserMessage("列出工作区文件")],
  tools: toolRegistry.definitions(),
  model: new MockModel(),
  toolRegistry,
});

assert.equal(result.newMessages.length, 3);
assert.equal(result.newMessages[0].role, "assistant");
assert.equal(result.newMessages[1].role, "toolResult");
assert.equal(result.newMessages[2].role, "assistant");
```

这说明 loop 做到了：

1. assistant 先发起 `toolCall`。
2. registry 执行工具。
3. loop 把 `toolResult` 放回上下文。
4. 模型基于工具结果给出最终回答。

如果以后有人把“工具结果回写上下文”删掉，这个测试会立刻失败。

## 错误工具：失败也要变成消息

真实 Agent 不能因为某个工具不存在就崩溃。教学版的策略是把异常包成 tool result：

```ts
const toolResult = result.newMessages.find(
  (message): message is ToolResultMessage => message.role === "toolResult",
);

assert.equal(toolResult.isError, true);
assert.match(messageText(toolResult), /Tool not found: list_files/);
```

这和 Pi 的设计思路一致：工具失败也是上下文的一部分。模型下一轮可以解释失败原因、换工具，或者请求用户补充信息。

## 最大轮次：防止无限 tool call

模型有时会进入“工具调用 -> 工具结果 -> 继续调用同一个工具”的循环。教学版用 `maxTurns` 做硬保护：

```ts
const result = await runAgentLoop({
  messages: [createUserMessage("一直调用工具")],
  model: loopingModel,
  toolRegistry,
  tools: toolRegistry.definitions(),
  maxTurns: 1,
});

const last = result.newMessages.at(-1);
assert.equal(last?.role, "assistant");
assert.equal(last.errorMessage, "max_turns_exceeded");
```

这里的重点不是 `1` 这个数字，而是系统必须有一个明确退出条件。生产版还会叠加超时、预算、用户中断和工具权限策略。

## 权限 hook：工具不是模型说了就执行

`beforeToolCall` 保护的是“模型建议”和“本地执行”之间的边界。测试里覆盖两件事：

```ts
beforeToolCall(call) {
  return { action: "block", reason: `blocked ${call.name}` };
}
```

被 block 的工具不会执行，而是变成 `isError: true` 的 tool result。rewrite 测试则确认参数会在进入 registry 前被替换：

```ts
beforeToolCall() {
  return { action: "rewrite", args: { path: "." }, reason: "default path" };
}
```

这和 Pi 的真实扩展 hook 思路一致：工具有副作用，运行时必须保留确认、拦截和改写的机会。

## Session 测试：从 leaf 重建上下文

session tree 里会有兄弟分支。当前 leaf 是 `u3` 时，上下文应该是 `u1 -> a1 -> u3`，不能把 `u2` 也带进去。

```text
u1 -> a1 -> u2
       └-> u3  current leaf
```

测试会手写一份 JSONL session，然后调用：

```ts
const store = new JsonlSessionStore(filePath, root);
const context = store.buildContext();

assert.deepEqual(context.map(messageText), ["root", "base", "branch b"]);
```

这个用例能防止一个常见错误：把 JSONL 文件里所有 message 线性读出来，误以为那就是当前上下文。

## Tool 测试：路径越界必须拦截

`read_file` 和 `write_note` 都是有副作用或读文件能力的工具。哪怕教学版只读本地临时目录，也要测这个边界：

```ts
await assert.rejects(
  () => registry.execute("read_file", { path: "../secret.txt" }),
  /Path escapes workspace/,
);
```

这条测试保护的是工具系统最基本的安全假设：模型给出的参数不能绕过工作区边界。

## API 和前端怎么继续测

本轮只加入最小单元测试，因为它们运行快、定位准。后续可以继续补两类测试：

| 层 | 推荐测法 | 关键断言 |
| --- | --- | --- |
| API 集成测试 | 启动 Express app 或抽出 handler | `POST /api/prompt` 会持久化 user + newMessages |
| 前端 smoke test | Playwright 打开 `http://localhost:5174` | 聊天区、工具调用、事件时间线在桌面和移动视口都可见 |

一个实用习惯是：单元测试保护协议和边界，浏览器测试保护用户路径。不要试图用浏览器测试覆盖所有 loop 细节，那会慢且难定位。

## 常见测试误区

| 误区 | 后果 | 更好的做法 |
| --- | --- | --- |
| 只测最终文本 | 工具调用链路被破坏也可能看不出来 | 同时断言 `assistant -> toolResult -> assistant` |
| 让测试依赖真实模型 | 不稳定、慢、费用不可控 | 单元测试用 `MockModel`，真实模型放 Demo 5 |
| 不测错误工具 | 工具异常会变成未处理 promise | 断言 `isError: true` |
| 不测权限 hook | 危险工具调用可能绕过后端策略 | 断言工具未执行且生成错误 toolResult |
| 把 session 当数组测 | 分支和压缩场景会漏测 | 手写 tree-shaped JSONL |
| 不清理临时目录 | 本地结果互相污染 | 使用 `t.after(() => rm(...))` |

## 小练习

给 `JsonlSessionStore.compactIfNeeded()` 再加一个测试：先写 8 条消息触发压缩，再追加一条新用户消息，断言 `buildContext()` 输出顺序是“summary -> kept messages -> new message”。这个练习能帮你确认 compaction entry 之后的消息没有被漏掉。
