import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { appendFile, rm } from "node:fs/promises";
import { dirname } from "node:path";
import type { AgentMessage, SessionEntry } from "../../shared/protocol";
import { isTextContent, text } from "./message";

type MessageEntry = Extract<SessionEntry, { type: "message" }>;
type CompactionEntry = Extract<SessionEntry, { type: "compaction" }>;

export class JsonlSessionStore {
  private readonly sessionId = "teaching-session";
  private readonly entries: SessionEntry[] = [];
  private byId = new Map<string, SessionEntry>();
  private leafId: string | null = null;
  private counter = 0;

  constructor(
    private readonly filePath: string,
    private readonly cwd: string,
  ) {
    this.loadOrCreate();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getEntries(): SessionEntry[] {
    return [...this.entries];
  }

  async reset(): Promise<void> {
    if (existsSync(this.filePath)) {
      await rm(this.filePath);
    }
    this.entries.length = 0;
    this.byId = new Map();
    this.leafId = null;
    this.counter = 0;
    this.writeHeader();
  }

  async appendMessage(message: AgentMessage): Promise<string> {
    const id = this.nextId();
    const entry: MessageEntry = {
      type: "message",
      id,
      parentId: this.leafId,
      timestamp: new Date().toISOString(),
      message,
    };
    await this.appendEntry(entry);
    this.leafId = id;
    return id;
  }

  async compactIfNeeded(maxApproxTokens: number, keepRecentMessages: number): Promise<CompactionEntry | undefined> {
    const path = this.pathToLeaf();
    const messageEntries = path.filter((entry): entry is MessageEntry => entry.type === "message");
    const currentContext = this.buildContext();
    const tokensBefore = estimateTokens(currentContext);
    if (tokensBefore <= maxApproxTokens || messageEntries.length <= keepRecentMessages) {
      return undefined;
    }

    const kept = messageEntries.slice(-keepRecentMessages);
    const summarized = messageEntries.slice(0, -keepRecentMessages);
    const summary = summarizeEntries(summarized);
    const firstKeptEntryId = kept[0]?.id;
    if (!firstKeptEntryId) return undefined;

    const entry: CompactionEntry = {
      type: "compaction",
      id: this.nextId(),
      parentId: this.leafId,
      timestamp: new Date().toISOString(),
      summary,
      firstKeptEntryId,
      tokensBefore,
    };
    await this.appendEntry(entry);
    this.leafId = entry.id;
    return entry;
  }

  buildContext(): AgentMessage[] {
    const path = this.pathToLeaf();
    const latestCompactionIndex = findLastIndex(path, (entry) => entry.type === "compaction");
    if (latestCompactionIndex === -1) {
      return path.flatMap(entryToMessage);
    }

    const compaction = path[latestCompactionIndex] as CompactionEntry;
    const messages: AgentMessage[] = [
      {
        role: "user",
        content: [
          text(
            `以下是旧上下文摘要。后续回答必须参考它，但最近消息优先级更高。\n\n${compaction.summary}`,
          ),
        ],
        timestamp: new Date(compaction.timestamp).getTime(),
      },
    ];

    let foundFirstKept = false;
    for (let i = 0; i < latestCompactionIndex; i++) {
      const entry = path[i];
      if (entry.id === compaction.firstKeptEntryId) {
        foundFirstKept = true;
      }
      if (foundFirstKept) {
        messages.push(...entryToMessage(entry));
      }
    }

    for (let i = latestCompactionIndex + 1; i < path.length; i++) {
      messages.push(...entryToMessage(path[i]));
    }

    return messages;
  }

  private loadOrCreate(): void {
    if (!existsSync(this.filePath)) {
      this.writeHeader();
      return;
    }

    const lines = readFileSync(this.filePath, "utf8").split("\n").filter(Boolean);
    for (const line of lines) {
      const entry = JSON.parse(line) as SessionEntry;
      this.entries.push(entry);
      if (entry.type !== "session") {
        this.byId.set(entry.id, entry);
        this.leafId = entry.id;
        this.counter = Math.max(this.counter, Number(entry.id.replace("entry_", "")) || 0);
      }
    }

    if (!this.entries.some((entry) => entry.type === "session")) {
      this.entries.length = 0;
      this.writeHeader();
    }
  }

  private writeHeader(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const header: SessionEntry = {
      type: "session",
      version: 1,
      id: this.sessionId,
      timestamp: new Date().toISOString(),
      cwd: this.cwd,
    };
    this.entries.push(header);
    writeFileSync(this.filePath, `${JSON.stringify(header)}\n`, "utf8");
  }

  private async appendEntry(entry: SessionEntry): Promise<void> {
    this.entries.push(entry);
    if (entry.type !== "session") {
      this.byId.set(entry.id, entry);
    }
    await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
  }

  private pathToLeaf(): SessionEntry[] {
    if (!this.leafId) return [];
    const path: SessionEntry[] = [];
    let current = this.byId.get(this.leafId);
    while (current) {
      path.unshift(current);
      current = "parentId" in current && current.parentId ? this.byId.get(current.parentId) : undefined;
    }
    return path;
  }

  private nextId(): string {
    this.counter += 1;
    return `entry_${this.counter}`;
  }
}

function entryToMessage(entry: SessionEntry): AgentMessage[] {
  if (entry.type !== "message") return [];
  return [entry.message];
}

function summarizeEntries(entries: MessageEntry[]): string {
  return entries
    .map((entry) => {
      const content = extractText(entry.message);
      return `${entry.message.role}: ${content}`;
    })
    .join("\n");
}

function estimateTokens(messages: AgentMessage[]): number {
  return messages.reduce((sum, message) => {
    const content = extractText(message);
    return sum + Math.ceil(content.length / 2);
  }, 0);
}

function extractText(message: AgentMessage): string {
  const parts: string[] = [];
  for (const block of message.content) {
    if (isTextContent(block)) {
      parts.push(block.text);
    }
  }
  return parts.join("\n");
}

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index--) {
    if (predicate(items[index])) return index;
  }
  return -1;
}
