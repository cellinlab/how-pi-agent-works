type Message = {
  role: "user" | "assistant" | "toolResult";
  text: string;
};

type CompactedContext = {
  summary: string;
  keptMessages: Message[];
  tokensBefore: number;
};

const messages: Message[] = [
  { role: "user", text: "请检查 README。" },
  { role: "assistant", text: "我需要先读取 README。" },
  { role: "toolResult", text: "README 包含安装命令和项目介绍。" },
  { role: "user", text: "再确认 package.json。" },
  { role: "assistant", text: "我会读取 package.json。" },
  { role: "toolResult", text: "package.json 中有 docs:dev 和 demo 脚本。" },
  { role: "user", text: "现在总结 Agent Loop。" },
  { role: "assistant", text: "Agent Loop 是上下文、模型、工具结果之间的闭环。" },
];

const compacted = compactMessages(messages, 2);

console.log("tokensBefore:", compacted.tokensBefore);
console.log("\nsummary:");
console.log(compacted.summary);
console.log("\nwhat the model sees next:");
for (const message of materializeContext(compacted)) {
  console.log(`${message.role}: ${message.text}`);
}

function compactMessages(input: Message[], keepRecentCount: number): CompactedContext {
  // 压缩不是删除全部旧消息，而是“摘要旧消息 + 保留最近消息”。
  const keptMessages = input.slice(-keepRecentCount);
  const summarized = input.slice(0, -keepRecentCount);
  const tokensBefore = estimateTokens(input);
  const summary = summarize(summarized);
  return { summary, keptMessages, tokensBefore };
}

function materializeContext(compacted: CompactedContext): Message[] {
  return [
    {
      role: "user",
      text: `以下是旧上下文摘要，请在后续回答中参考：\n${compacted.summary}`,
    },
    ...compacted.keptMessages,
  ];
}

function summarize(input: Message[]): string {
  const byRole = input.map((message) => `${message.role}: ${message.text}`).join(" / ");
  return `旧消息共 ${input.length} 条。关键脉络：${byRole}`;
}

function estimateTokens(input: Message[]): number {
  return input.reduce((sum, message) => sum + Math.ceil(message.text.length / 2), 0);
}
