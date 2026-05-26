import express from "express";
import { resolve } from "node:path";
import type { AgentEvent, SessionResponse } from "../shared/protocol";
import type { BeforeToolCall, ToolDecision } from "./agent/loop";
import { runAgentLoop } from "./agent/loop";
import { createUserMessage } from "./agent/message";
import { MockModel } from "./agent/mockModel";
import { JsonlSessionStore } from "./agent/sessionStore";
import { createToolRegistry } from "./agent/tools";

const app = express();
const port = Number(process.env.PORT ?? 4317);
const projectRoot = process.cwd();
const workspaceRoot = resolve(projectRoot, "workspace");
const sessionFile = resolve(projectRoot, ".teaching-agent/session.jsonl");

const store = new JsonlSessionStore(sessionFile, projectRoot);
const model = new MockModel();
const toolRegistry = createToolRegistry(workspaceRoot);
const eventLog: AgentEvent[] = [];

const systemPrompt = [
  "你是 Teaching Agent，一个用于解释 Pi Agent 核心机制的教学版 Agent。",
  "你可以使用工具观察安全工作区，也可以直接回答概念问题。",
  "当工具返回结果后，必须基于工具结果继续回答用户。",
].join("\n");

app.use(express.json({ limit: "1mb" }));

app.get("/api/session", (_req, res) => {
  res.json(createResponse());
});

app.post("/api/reset", async (_req, res) => {
  await store.reset();
  eventLog.length = 0;
  res.json(createResponse());
});

app.post("/api/prompt", async (req, res) => {
  const input = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!input) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const userMessage = createUserMessage(input);
  await store.appendMessage(userMessage);
  eventLog.push({ type: "message_start", message: userMessage });
  eventLog.push({ type: "message_end", message: userMessage });

  const compaction = await store.compactIfNeeded(1200, 8);
  if (compaction) {
    eventLog.push({
      type: "compaction",
      summary: compaction.summary,
      tokensBefore: compaction.tokensBefore,
      firstKeptEntryId: compaction.firstKeptEntryId,
    });
  }

  const result = await runAgentLoop({
    systemPrompt,
    messages: store.buildContext(),
    tools: toolRegistry.definitions(),
    model,
    toolRegistry,
    beforeToolCall,
  });

  for (const message of result.newMessages) {
    await store.appendMessage(message);
  }
  eventLog.push(...result.events);
  res.json(createResponse());
});

app.listen(port, () => {
  console.log(`Teaching Agent API listening on http://localhost:${port}`);
});

function createResponse(): SessionResponse {
  return {
    sessionId: store.getSessionId(),
    messages: store.buildContext(),
    events: [...eventLog],
    tools: toolRegistry.definitions(),
    entries: store.getEntries(),
  };
}

function beforeToolCall(call: Parameters<BeforeToolCall>[0]): ToolDecision {
  if (call.name === "write_note") {
    const fileName = typeof call.arguments.fileName === "string" ? call.arguments.fileName : "";
    if (/secret|秘密/i.test(fileName)) {
      return { action: "block", reason: "教学版权限策略：不允许写入包含 secret/秘密 的笔记文件。" };
    }
  }

  if (call.name === "list_files" && typeof call.arguments.path !== "string") {
    return { action: "rewrite", args: { ...call.arguments, path: "." }, reason: "补齐默认目录参数。" };
  }

  return { action: "allow" };
}
