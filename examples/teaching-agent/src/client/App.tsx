import { ArrowUp, FileText, Hammer, RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type {
  AgentEvent,
  AgentMessage,
  SessionResponse,
  TextContent,
  ToolCallContent,
  ToolDefinition,
} from "../shared/protocol";

const EMPTY_SESSION: SessionResponse = {
  sessionId: "",
  messages: [],
  events: [],
  tools: [],
  entries: [],
};

export function App() {
  const [session, setSession] = useState<SessionResponse>(EMPTY_SESSION);
  const [input, setInput] = useState("列出工作区文件");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setError("");
    const response = await fetch("/api/session");
    setSession(await response.json());
  }

  async function reset() {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/reset", { method: "POST" });
      setSession(await response.json());
    } finally {
      setIsLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Request failed");
      }
      setSession(await response.json());
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }

  const eventGroups = useMemo(() => summarizeEvents(session.events), [session.events]);

  return (
    <main className="app-shell">
      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyeline">Pi-style teaching runtime</p>
            <h1>Teaching Agent</h1>
          </div>
          <div className="toolbar">
            <button type="button" className="icon-button" aria-label="刷新会话" onClick={refresh} disabled={isLoading}>
              <RefreshCw size={18} />
            </button>
            <button type="button" className="icon-button" aria-label="重置会话" onClick={reset} disabled={isLoading}>
              <RotateCcw size={18} />
            </button>
          </div>
        </header>

        <div className="chat-list">
          {session.messages.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={28} />
              <p>输入一个目标，观察模型如何决定直接回答或调用工具。</p>
            </div>
          ) : (
            session.messages.map((message, index) => <MessageCard key={`${message.timestamp}-${index}`} message={message} />)
          )}
        </div>

        <form className="composer" onSubmit={submit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="试试：读取 agent-notes.md"
            disabled={isLoading}
          />
          <button type="submit" className="send-button" aria-label="发送" disabled={isLoading || !input.trim()}>
            <ArrowUp size={18} />
          </button>
        </form>
        {error ? <p className="error-line">{error}</p> : null}
      </section>

      <aside className="side-panel">
        <section className="panel-section">
          <h2>Tools</h2>
          <div className="tool-list">
            {session.tools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </section>

        <section className="panel-section">
          <h2>Event Timeline</h2>
          <div className="event-list">
            {eventGroups.map((event, index) => (
              <div key={`${event}-${index}`} className="event-row">
                {event}
              </div>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}

function MessageCard({ message }: { message: AgentMessage }) {
  return (
    <article className={`message-card message-${message.role}`}>
      <div className="message-role">{roleLabel(message)}</div>
      <div className="message-body">
        {message.role === "assistant" ? (
          message.content.map((block, index) =>
            block.type === "toolCall" ? (
              <ToolCallBlock key={index} block={block} />
            ) : (
              <p key={index}>{block.text}</p>
            ),
          )
        ) : (
          message.content.map((block, index) => <p key={index}>{(block as TextContent).text}</p>)
        )}
      </div>
    </article>
  );
}

function ToolCallBlock({ block }: { block: ToolCallContent }) {
  return (
    <div className="tool-call-block">
      <Hammer size={16} />
      <span>{block.name}</span>
      <code>{JSON.stringify(block.arguments)}</code>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="tool-card">
      <FileText size={16} />
      <div>
        <strong>{tool.name}</strong>
        <p>{tool.description}</p>
      </div>
    </div>
  );
}

function roleLabel(message: AgentMessage): string {
  if (message.role === "toolResult") return `tool:${message.toolName}`;
  return message.role;
}

function summarizeEvents(events: AgentEvent[]): string[] {
  return events.slice(-80).map((event) => {
    switch (event.type) {
      case "turn_start":
        return `turn ${event.turn} start`;
      case "turn_end":
        return `turn ${event.turn} end`;
      case "message_start":
      case "message_end":
        return `${event.type}: ${event.message.role}`;
      case "message_update":
        return `message_update: ${event.delta.slice(0, 48)}`;
      case "tool_execution_start":
        return `tool_start: ${event.toolName}`;
      case "tool_execution_end":
        return `tool_end: ${event.toolName}${event.isError ? " error" : ""}`;
      case "agent_end":
        return `agent_end: ${event.messages.length} new messages`;
      case "compaction":
        return `compaction: ${event.tokensBefore} approx tokens`;
      default:
        return event.type;
    }
  });
}
