type TextContent = { type: "text"; text: string };
type ToolCallContent = {
  type: "toolCall";
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

type UserMessage = { role: "user"; content: TextContent[] };
type AssistantMessage = {
  role: "assistant";
  content: Array<TextContent | ToolCallContent>;
  stopReason: "stop" | "toolUse";
};
type ToolResultMessage = {
  role: "toolResult";
  toolCallId: string;
  toolName: string;
  content: TextContent[];
  isError: boolean;
};
type Message = UserMessage | AssistantMessage | ToolResultMessage;

type Tool = {
  name: string;
  description: string;
  execute(args: Record<string, unknown>): Promise<{ content: string }>;
};

const tools: Tool[] = [
  {
    name: "read_note",
    description: "Read a named teaching note.",
    async execute(args) {
      const name = String(args.name ?? "");
      const notes: Record<string, string> = {
        agent: "Agent = loop + tools + state. 工具结果必须回写给模型。",
      };
      return { content: notes[name] ?? `No note named ${name}` };
    },
  },
];

class ToolCallingModel {
  async complete(messages: Message[]): Promise<AssistantMessage> {
    const last = messages[messages.length - 1];
    if (last.role === "user") {
      return {
        role: "assistant",
        stopReason: "toolUse",
        content: [
          {
            type: "toolCall",
            id: "call_read_note",
            name: "read_note",
            arguments: { name: "agent" },
          },
        ],
      };
    }

    const toolResult = messages.findLast((message): message is ToolResultMessage => message.role === "toolResult");
    return {
      role: "assistant",
      stopReason: "stop",
      content: [
        {
          type: "text",
          text: `我已经读取了笔记：${toolResult?.content[0]?.text ?? "没有工具结果"}`,
        },
      ],
    };
  }
}

async function runAgentLoop(messages: Message[]): Promise<Message[]> {
  const model = new ToolCallingModel();

  while (true) {
    const assistant = await model.complete(messages);
    messages.push(assistant);
    printMessage(assistant);

    const toolCalls = assistant.content.filter((block): block is ToolCallContent => block.type === "toolCall");
    if (toolCalls.length === 0) {
      return messages;
    }

    for (const toolCall of toolCalls) {
      console.log(`tool_start: ${toolCall.name} ${JSON.stringify(toolCall.arguments)}`);
      const tool = tools.find((item) => item.name === toolCall.name);
      const result = tool
        ? await tool.execute(toolCall.arguments)
        : { content: `Tool not found: ${toolCall.name}` };
      const toolResult: ToolResultMessage = {
        role: "toolResult",
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        content: [{ type: "text", text: result.content }],
        isError: !tool,
      };
      messages.push(toolResult);
      printMessage(toolResult);
    }
  }
}

function printMessage(message: Message): void {
  if (message.role === "assistant") {
    for (const block of message.content) {
      if (block.type === "text") console.log(`assistant: ${block.text}`);
      if (block.type === "toolCall") console.log(`assistant toolCall: ${block.name}`);
    }
  } else if (message.role === "toolResult") {
    console.log(`tool_result ${message.toolName}: ${message.content[0]?.text}`);
  } else {
    console.log(`user: ${message.content[0]?.text}`);
  }
}

await runAgentLoop([
  {
    role: "user",
    content: [{ type: "text", text: "请读取 agent 笔记，并解释 Agent 是什么。" }],
  },
]);
