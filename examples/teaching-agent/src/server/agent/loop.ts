import type {
  AgentEvent,
  AgentMessage,
  AssistantMessage,
  ToolCallContent,
  ToolDefinition,
  ToolResultMessage,
} from "../../shared/protocol";
import { MockModel } from "./mockModel";
import { text } from "./message";
import type { ToolRegistry } from "./tools";

type RunAgentLoopOptions = {
  systemPrompt: string;
  messages: AgentMessage[];
  tools: ToolDefinition[];
  model: MockModel;
  toolRegistry: ToolRegistry;
  maxTurns?: number;
  onEvent?: (event: AgentEvent) => void;
};

export async function runAgentLoop(options: RunAgentLoopOptions): Promise<{
  newMessages: AgentMessage[];
  events: AgentEvent[];
}> {
  const events: AgentEvent[] = [];
  const emit = (event: AgentEvent): void => {
    events.push(event);
    options.onEvent?.(event);
  };
  const context = [...options.messages];
  const newMessages: AgentMessage[] = [];
  const maxTurns = options.maxTurns ?? 6;

  emit({ type: "agent_start" });

  for (let turn = 1; turn <= maxTurns; turn++) {
    emit({ type: "turn_start", turn });

    const assistant = await options.model.complete({
      systemPrompt: options.systemPrompt,
      messages: context,
      tools: options.tools,
    });
    context.push(assistant);
    newMessages.push(assistant);
    emitMessageLifecycle(assistant, emit);

    if (assistant.stopReason === "error" || assistant.stopReason === "aborted") {
      emit({ type: "turn_end", turn, message: assistant, toolResults: [] });
      emit({ type: "agent_end", messages: newMessages });
      return { newMessages, events };
    }

    const toolCalls = assistant.content.filter((block): block is ToolCallContent => block.type === "toolCall");
    if (toolCalls.length === 0) {
      emit({ type: "turn_end", turn, message: assistant, toolResults: [] });
      emit({ type: "agent_end", messages: newMessages });
      return { newMessages, events };
    }

    const toolResults: ToolResultMessage[] = [];
    for (const toolCall of toolCalls) {
      emit({
        type: "tool_execution_start",
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        args: toolCall.arguments,
      });
      const toolResult = await executeToolCall(toolCall, options.toolRegistry);
      toolResults.push(toolResult);
      context.push(toolResult);
      newMessages.push(toolResult);
      emit({
        type: "tool_execution_end",
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        result: {
          content: toolResult.content,
          details: toolResult.details,
        },
        isError: toolResult.isError,
      });
      emitMessageLifecycle(toolResult, emit);
    }

    emit({ type: "turn_end", turn, message: assistant, toolResults });
  }

  const guardrail = createLoopGuardrailMessage(maxTurns);
  newMessages.push(guardrail);
  emitMessageLifecycle(guardrail, emit);
  emit({ type: "agent_end", messages: newMessages });
  return { newMessages, events };
}

async function executeToolCall(
  toolCall: ToolCallContent,
  toolRegistry: ToolRegistry,
): Promise<ToolResultMessage> {
  try {
    const result = await toolRegistry.execute(toolCall.name, toolCall.arguments);
    return {
      role: "toolResult",
      toolCallId: toolCall.id,
      toolName: toolCall.name,
      content: result.content,
      details: result.details,
      isError: false,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      role: "toolResult",
      toolCallId: toolCall.id,
      toolName: toolCall.name,
      content: [text(error instanceof Error ? error.message : String(error))],
      isError: true,
      timestamp: Date.now(),
    };
  }
}

function emitMessageLifecycle(message: AgentMessage, emit: (event: AgentEvent) => void): void {
  emit({ type: "message_start", message });
  if (message.role === "assistant") {
    for (const block of message.content) {
      if (block.type === "text") {
        emit({ type: "message_update", message, delta: block.text });
      }
    }
  }
  emit({ type: "message_end", message });
}

function createLoopGuardrailMessage(maxTurns: number): AssistantMessage {
  return {
    role: "assistant",
    content: [text(`教学版 Agent 已达到最大轮次 ${maxTurns}，为避免无限循环已停止。`)],
    stopReason: "error",
    usage: { input: 0, output: 0, totalTokens: 0 },
    timestamp: Date.now(),
    errorMessage: "max_turns_exceeded",
  };
}
