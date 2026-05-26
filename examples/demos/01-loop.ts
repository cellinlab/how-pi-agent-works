type Role = "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};

type AgentEvent =
  | { type: "agent_start" }
  | { type: "message_start"; role: Role }
  | { type: "message_update"; role: "assistant"; delta: string }
  | { type: "message_end"; role: Role }
  | { type: "agent_end"; messages: Message[] };

type Emit = (event: AgentEvent) => void;

class TinyModel {
  async complete(messages: Message[], emit: Emit): Promise<Message> {
    const userText = messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join("\n");
    const answer = `Agent Loop 会反复执行：读取上下文 -> 请求模型 -> 处理结果 -> 更新上下文。用户刚才说：${userText}`;

    emit({ type: "message_start", role: "assistant" });
    for (const word of answer.split("")) {
      emit({ type: "message_update", role: "assistant", delta: word });
      await sleep(4);
    }
    emit({ type: "message_end", role: "assistant" });

    return { role: "assistant", content: answer };
  }
}

async function runAgentLoop(input: string): Promise<Message[]> {
  const events: AgentEvent[] = [];
  const emit: Emit = (event) => {
    events.push(event);
    printEvent(event);
  };

  const messages: Message[] = [{ role: "user", content: input }];
  const model = new TinyModel();

  emit({ type: "agent_start" });
  emit({ type: "message_start", role: "user" });
  emit({ type: "message_end", role: "user" });

  const assistant = await model.complete(messages, emit);
  messages.push(assistant);

  emit({ type: "agent_end", messages });
  return messages;
}

function printEvent(event: AgentEvent): void {
  switch (event.type) {
    case "message_start":
    case "message_end":
      console.log(`event: ${event.type} ${event.role}`);
      break;
    case "message_update":
      process.stdout.write(event.delta);
      break;
    case "agent_end":
      console.log(`\nevent: agent_end (${event.messages.length} messages)`);
      break;
    default:
      console.log(`event: ${event.type}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await runAgentLoop("请用一句话解释 Agent Loop。");
