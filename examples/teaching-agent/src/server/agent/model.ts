import type { AgentMessage, AssistantMessage, ToolDefinition } from "../../shared/protocol";

export type CompleteInput = {
  systemPrompt: string;
  messages: AgentMessage[];
  tools: ToolDefinition[];
  signal?: AbortSignal;
};

export interface TeachingModel {
  complete(input: CompleteInput): Promise<AssistantMessage>;
}
