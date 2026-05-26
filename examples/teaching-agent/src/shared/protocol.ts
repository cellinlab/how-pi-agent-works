export type TextContent = {
  type: "text";
  text: string;
};

export type ToolCallContent = {
  type: "toolCall";
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type UserMessage = {
  role: "user";
  content: TextContent[];
  timestamp: number;
};

export type AssistantMessage = {
  role: "assistant";
  content: Array<TextContent | ToolCallContent>;
  stopReason: "stop" | "toolUse" | "error" | "aborted";
  usage: Usage;
  timestamp: number;
  errorMessage?: string;
};

export type ToolResultMessage = {
  role: "toolResult";
  toolCallId: string;
  toolName: string;
  content: TextContent[];
  details?: unknown;
  isError: boolean;
  timestamp: number;
};

export type AgentMessage = UserMessage | AssistantMessage | ToolResultMessage;

export type Usage = {
  input: number;
  output: number;
  totalTokens: number;
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type ToolResult = {
  content: TextContent[];
  details?: unknown;
  terminate?: boolean;
};

export type SessionEntry =
  | {
      type: "session";
      version: 1;
      id: string;
      timestamp: string;
      cwd: string;
    }
  | {
      type: "message";
      id: string;
      parentId: string | null;
      timestamp: string;
      message: AgentMessage;
    }
  | {
      type: "compaction";
      id: string;
      parentId: string | null;
      timestamp: string;
      summary: string;
      firstKeptEntryId: string;
      tokensBefore: number;
    };

export type AgentEvent =
  | { type: "agent_start" }
  | { type: "agent_end"; messages: AgentMessage[] }
  | { type: "turn_start"; turn: number }
  | { type: "turn_end"; turn: number; message: AssistantMessage; toolResults: ToolResultMessage[] }
  | { type: "message_start"; message: AgentMessage }
  | { type: "message_update"; message: AssistantMessage; delta: string }
  | { type: "message_end"; message: AgentMessage }
  | { type: "tool_execution_start"; toolCallId: string; toolName: string; args: Record<string, unknown> }
  | {
      type: "tool_execution_end";
      toolCallId: string;
      toolName: string;
      result: ToolResult;
      isError: boolean;
    }
  | { type: "compaction"; summary: string; tokensBefore: number; firstKeptEntryId: string };

export type SessionResponse = {
  sessionId: string;
  messages: AgentMessage[];
  events: AgentEvent[];
  tools: ToolDefinition[];
  entries: SessionEntry[];
};
