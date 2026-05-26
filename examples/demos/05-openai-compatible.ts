import { readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";

type ChatMessage =
  | { role: "system" | "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      reasoning_content?: string;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      role: "assistant";
      content?: string | null;
      reasoning_content?: string;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
  }>;
  error?: unknown;
};

const envCheck = validateEnv();
if (!envCheck.ok) {
  printUsage(envCheck.missing);
  process.exit(0);
}

const baseUrl = envCheck.baseUrl.replace(/\/$/, "");
const apiKey = envCheck.apiKey;
const model = process.env.OPENAI_COMPATIBLE_MODEL ?? "mimo-v2.5-pro";
const authHeader = process.env.OPENAI_COMPATIBLE_AUTH_HEADER ?? "authorization";
const workspaceRoot = resolve(process.cwd(), "examples/teaching-agent/workspace");

const tools = [
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List files inside the safe teaching workspace.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative directory path under workspace." },
        },
      },
    },
  },
];

const messages: ChatMessage[] = [
  {
    role: "system",
    content:
      "You are a tiny teaching agent. When a tool is available and useful, call it before answering.",
  },
  {
    role: "user",
    content: "请调用 list_files 工具列出教学工作区文件，然后用中文总结你看到了什么。",
  },
];

console.log("[demo:05] requesting model:", model);
for (let turn = 1; turn <= 4; turn++) {
  const response = await chat(messages);
  const assistant = response.choices?.[0]?.message;
  if (!assistant) {
    throw new Error(`No assistant message returned: ${JSON.stringify(response.error ?? response)}`);
  }

  messages.push({
    role: "assistant",
    content: assistant.content ?? null,
    reasoning_content: assistant.reasoning_content,
    tool_calls: assistant.tool_calls,
  });

  if (!assistant.tool_calls?.length) {
    console.log("[demo:05] final answer:");
    console.log(assistant.content ?? assistant.reasoning_content ?? "(empty)");
    process.exit(0);
  }

  for (const call of assistant.tool_calls) {
    const toolOutput = await executeLocalTool(call.function.name, call.function.arguments);
    messages.push({ role: "tool", tool_call_id: call.id, content: toolOutput });
  }
}

throw new Error("Model kept requesting tools after 4 turns.");

async function chat(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(authHeader, apiKey),
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: "auto",
      max_completion_tokens: 1024,
      temperature: 0,
      top_p: 0.95,
    }),
  });

  const payload = (await response.json()) as ChatCompletionResponse;
  if (!response.ok) {
    throw new Error(`Model request failed ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

function authHeaders(mode: string, key: string): Record<string, string> {
  if (mode.toLowerCase() === "api-key") {
    return { "api-key": key };
  }
  return { Authorization: `Bearer ${key}` };
}

async function executeLocalTool(name: string, rawArguments: string): Promise<string> {
  if (name !== "list_files") {
    return `Unsupported tool: ${name}`;
  }

  const args = safeJsonParse(rawArguments);
  const path = typeof args.path === "string" ? args.path : ".";
  const entries = await listFiles(resolve(workspaceRoot, path));
  const output = entries.length > 0 ? entries.join("\n") : "(empty)";
  console.log("[demo:05] local tool list_files output:");
  console.log(output);
  return output;
}

function validateEnv():
  | { ok: true; baseUrl: string; apiKey: string }
  | { ok: false; missing: string[] } {
  const missing = ["OPENAI_COMPATIBLE_BASE_URL", "OPENAI_COMPATIBLE_API_KEY"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    return { ok: false, missing };
  }
  return {
    ok: true,
    baseUrl: process.env.OPENAI_COMPATIBLE_BASE_URL!,
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY!,
  };
}

function printUsage(missing: string[]): void {
  console.log("[demo:05] skipped optional OpenAI-compatible smoke test.");
  console.log(`[demo:05] missing env: ${missing.join(", ")}`);
  console.log("[demo:05] example:");
  console.log(
    [
      'OPENAI_COMPATIBLE_BASE_URL="https://example.com/v1" \\',
      'OPENAI_COMPATIBLE_API_KEY="your key" \\',
      'OPENAI_COMPATIBLE_MODEL="mimo-v2.5-pro" \\',
      'OPENAI_COMPATIBLE_AUTH_HEADER="api-key" \\',
      "npm run demo:05",
    ].join("\n"),
  );
}

function safeJsonParse(input: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(input) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function listFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const dirent of dirents) {
    if (dirent.name.startsWith(".")) continue;
    const absolute = resolve(dir, dirent.name);
    const rel = relative(workspaceRoot, absolute);
    if (dirent.isDirectory()) {
      results.push(`${rel}/`);
      results.push(...(await listFiles(absolute)));
    } else {
      results.push(rel);
    }
  }
  return results.sort();
}
