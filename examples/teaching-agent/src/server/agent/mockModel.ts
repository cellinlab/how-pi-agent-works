import type { AssistantMessage, ToolResultMessage } from "../../shared/protocol";
import { createAssistantMessage, messageText, text } from "./message";
import type { CompleteInput, TeachingModel } from "./model";

export class MockModel implements TeachingModel {
  async complete(input: CompleteInput): Promise<AssistantMessage> {
    const last = input.messages[input.messages.length - 1];
    if (!last) {
      return createAssistantMessage([text("还没有上下文。")]);
    }

    if (last.role === "toolResult") {
      return this.answerFromTool(last);
    }

    if (last.role !== "user") {
      return createAssistantMessage([text("当前没有新的用户目标，我会等待下一条输入。")]);
    }

    const userText = messageText(last).toLowerCase();
    if (this.includesAny(userText, ["列出", "文件列表", "list", "files"])) {
      return createAssistantMessage(
        [
          {
            type: "toolCall",
            id: `call_${Date.now()}_list`,
            name: "list_files",
            arguments: { path: "." },
          },
        ],
        "toolUse",
      );
    }

    if (this.includesAny(userText, ["读取", "read", "打开", "查看"])) {
      return createAssistantMessage(
        [
          {
            type: "toolCall",
            id: `call_${Date.now()}_read`,
            name: "read_file",
            arguments: { path: this.pickFile(userText) },
          },
        ],
        "toolUse",
      );
    }

    if (this.includesAny(userText, ["写", "笔记", "note", "保存"])) {
      const fileName = this.includesAny(userText, ["secret", "秘密"]) ? "secret-note.md" : "agent-loop-note.md";
      return createAssistantMessage(
        [
          {
            type: "toolCall",
            id: `call_${Date.now()}_write`,
            name: "write_note",
            arguments: {
              fileName,
              content:
                "Agent Loop = context -> model -> tool execution -> tool result -> next model request.",
            },
          },
        ],
        "toolUse",
      );
    }

    return createAssistantMessage([
      text(
        "教学版 Agent 收到你的问题。当前 MockModel 会在你提到“列出文件”“读取文件”“写笔记”时调用工具；其他问题会直接回答。",
      ),
    ]);
  }

  private answerFromTool(toolResult: ToolResultMessage): AssistantMessage {
    const output = messageText(toolResult);
    if (toolResult.isError) {
      return createAssistantMessage([text(`工具 ${toolResult.toolName} 执行失败：${output}`)], "stop");
    }
    if (toolResult.toolName === "list_files") {
      return createAssistantMessage([text(`我已经列出工作区文件：\n${output}`)]);
    }
    if (toolResult.toolName === "read_file") {
      return createAssistantMessage([text(`我读取到了文件内容。关键内容如下：\n${output}`)]);
    }
    if (toolResult.toolName === "write_note") {
      return createAssistantMessage([text(`笔记已经写入：${output}`)]);
    }
    return createAssistantMessage([text(`工具结果：${output}`)]);
  }

  private includesAny(input: string, keywords: string[]): boolean {
    return keywords.some((keyword) => input.includes(keyword));
  }

  private pickFile(input: string): string {
    if (input.includes("agent")) return "agent-notes.md";
    if (input.includes("package")) return "package.json";
    return "README.md";
  }
}
