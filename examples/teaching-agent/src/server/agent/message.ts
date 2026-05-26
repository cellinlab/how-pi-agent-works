import type { AssistantMessage, TextContent, ToolCallContent, UserMessage } from "../../shared/protocol";

const EMPTY_USAGE = {
  input: 0,
  output: 0,
  totalTokens: 0,
};

export function text(text: string): TextContent {
  return { type: "text", text };
}

export function createUserMessage(input: string): UserMessage {
  return {
    role: "user",
    content: [text(input)],
    timestamp: Date.now(),
  };
}

export function createAssistantMessage(
  content: AssistantMessage["content"],
  stopReason: AssistantMessage["stopReason"] = "stop",
): AssistantMessage {
  return {
    role: "assistant",
    content,
    stopReason,
    usage: EMPTY_USAGE,
    timestamp: Date.now(),
  };
}

export function messageText(message: { content: Array<TextContent | ToolCallContent> }): string {
  return message.content
    .filter(isTextContent)
    .map((block) => block.text)
    .join("\n");
}

export function isTextContent(block: TextContent | ToolCallContent): block is TextContent {
  return block.type === "text";
}
