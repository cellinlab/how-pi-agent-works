import express from "express";
import type { Response } from "express";
import { resolve } from "node:path";
import type { AgentEvent, CreateRunResponse, RunStreamEvent, SessionResponse } from "../shared/protocol";
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
const runs = new Map<string, RunRecord>();
let activeRun: Promise<void> | undefined;

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
  runs.clear();
  res.json(createResponse());
});

app.post("/api/prompt", async (req, res) => {
  const input = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!input) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (activeRun) {
    res.status(409).json({ error: "another run is already active" });
    return;
  }

  activeRun = executePrompt(input).finally(() => {
    activeRun = undefined;
  });
  await activeRun;
  res.json(createResponse());
});

app.post("/api/runs", (req, res) => {
  const input = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!input) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (activeRun) {
    res.status(409).json({ error: "another run is already active" });
    return;
  }

  const run = createRunRecord();
  runs.set(run.id, run);
  activeRun = executePrompt(input, (event) => emitRunEvent(run, event))
    .then(() => {
      emitRunEvent(run, { type: "run_done", session: createResponse() });
    })
    .catch((error) => {
      emitRunEvent(run, {
        type: "run_error",
        error: error instanceof Error ? error.message : String(error),
        session: createResponse(),
      });
    })
    .finally(() => {
      run.done = true;
      closeRunClients(run);
      activeRun = undefined;
    });

  const payload: CreateRunResponse = { runId: run.id };
  res.json(payload);
});

app.get("/api/runs/:runId/events", (req, res) => {
  const run = runs.get(req.params.runId);
  if (!run) {
    res.status(404).json({ error: "run not found" });
    return;
  }

  prepareSseResponse(res);
  run.clients.add(res);
  for (const event of run.events) {
    writeSseEvent(res, event);
  }

  if (run.done) {
    res.end();
    return;
  }

  req.on("close", () => {
    run.clients.delete(res);
  });
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

async function executePrompt(input: string, onEvent?: (event: AgentEvent) => void): Promise<void> {
  const emit = (event: AgentEvent): void => {
    eventLog.push(event);
    onEvent?.(event);
  };

  const userMessage = createUserMessage(input);
  await store.appendMessage(userMessage);
  emit({ type: "message_start", message: userMessage });
  emit({ type: "message_end", message: userMessage });

  const compaction = await store.compactIfNeeded(1200, 8);
  if (compaction) {
    emit({
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
    onEvent: emit,
  });

  for (const message of result.newMessages) {
    await store.appendMessage(message);
  }
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

type RunRecord = {
  id: string;
  events: RunStreamEvent[];
  clients: Set<Response>;
  done: boolean;
};

function createRunRecord(): RunRecord {
  return {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    events: [],
    clients: new Set(),
    done: false,
  };
}

function emitRunEvent(run: RunRecord, event: RunStreamEvent): void {
  run.events.push(event);
  for (const client of run.clients) {
    writeSseEvent(client, event);
  }
}

function prepareSseResponse(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}

function writeSseEvent(res: Response, event: RunStreamEvent): void {
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function closeRunClients(run: RunRecord): void {
  for (const client of run.clients) {
    client.end();
  }
  run.clients.clear();
}
