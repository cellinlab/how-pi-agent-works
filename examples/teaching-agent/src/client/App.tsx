import { ArrowUp, FileText, Hammer, RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type {
  AgentEvent,
  AgentMessage,
  CreateRunResponse,
  RunStreamEvent,
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

const STREAM_EVENT_TYPES = [
  "agent_start",
  "agent_end",
  "turn_start",
  "turn_end",
  "message_start",
  "message_update",
  "message_end",
  "tool_execution_start",
  "tool_execution_end",
  "tool_permission",
  "compaction",
  "run_done",
  "run_error",
] as const;

export function App() {
  const [session, setSession] = useState<SessionResponse>(EMPTY_SESSION);
  const [input, setInput] = useState("列出工作区文件");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    void refresh();
    return () => closeRunStream();
  }, []);

  async function refresh() {
    setError("");
    const response = await fetch("/api/session");
    setSession(await response.json());
  }

  async function reset() {
    closeRunStream();
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
      closeRunStream();
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Request failed");
      }
      const payload = (await response.json()) as CreateRunResponse;
      setInput("");
      openRunStream(payload.runId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  }

  function openRunStream(runId: string) {
    const source = new EventSource(`/api/runs/${runId}/events`);
    eventSourceRef.current = source;
    let finished = false;
    const handleEvent = (message: MessageEvent<string>) => {
      const event = JSON.parse(message.data) as RunStreamEvent;
      if (event.type === "run_done") {
        finished = true;
        setSession(event.session);
        setIsLoading(false);
        closeRunStream(source);
        return;
      }
      if (event.type === "run_error") {
        finished = true;
        setError(event.error);
        setSession(event.session);
        setIsLoading(false);
        closeRunStream(source);
        return;
      }
      setSession((current) => applyStreamEvent(current, event));
    };

    for (const eventType of STREAM_EVENT_TYPES) {
      source.addEventListener(eventType, handleEvent as EventListener);
    }
    source.onerror = () => {
      if (!finished) {
        setError("事件流连接中断，请刷新会话确认结果。");
        setIsLoading(false);
      }
      closeRunStream(source);
    };
  }

  function closeRunStream(source = eventSourceRef.current) {
    source?.close();
    if (!source || eventSourceRef.current === source) {
      eventSourceRef.current = null;
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

function applyStreamEvent(session: SessionResponse, event: AgentEvent): SessionResponse {
  return {
    ...session,
    events: [...session.events, event],
    messages: applyMessageEvent(session.messages, event),
  };
}

function applyMessageEvent(messages: AgentMessage[], event: AgentEvent): AgentMessage[] {
  if (event.type === "message_start") {
    return appendMessageIfMissing(messages, event.message);
  }
  if (event.type === "message_update" || event.type === "message_end") {
    return replaceMessage(messages, event.message);
  }
  return messages;
}

function appendMessageIfMissing(messages: AgentMessage[], next: AgentMessage): AgentMessage[] {
  const key = messageKey(next);
  if (messages.some((message) => messageKey(message) === key)) {
    return replaceMessage(messages, next);
  }
  return [...messages, next];
}

function replaceMessage(messages: AgentMessage[], next: AgentMessage): AgentMessage[] {
  const key = messageKey(next);
  const index = messages.findIndex((message) => messageKey(message) === key);
  if (index === -1) return [...messages, next];
  return messages.map((message, currentIndex) => (currentIndex === index ? next : message));
}

function messageKey(message: AgentMessage): string {
  if (message.role === "toolResult") return `tool:${message.toolCallId}`;
  if (message.role === "user") return `user:${message.timestamp}:${messageText(message)}`;
  const toolCallIds = message.content
    .filter((block): block is ToolCallContent => block.type === "toolCall")
    .map((block) => block.id)
    .join(",");
  if (toolCallIds) return `assistant:tool:${toolCallIds}`;
  return `assistant:text:${message.timestamp}:${messageText(message).slice(0, 80)}`;
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

function messageText(message: AgentMessage): string {
  const parts: string[] = [];
  for (const block of message.content) {
    if (block.type === "text") {
      parts.push(block.text);
    }
  }
  return parts.join("\n");
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
      case "tool_permission":
        return `tool_permission ${event.action}: ${event.toolName}${event.reason ? ` (${event.reason})` : ""}`;
      case "agent_end":
        return `agent_end: ${event.messages.length} new messages`;
      case "compaction":
        return `compaction: ${event.tokensBefore} approx tokens`;
      default:
        return event.type;
    }
  });
}
