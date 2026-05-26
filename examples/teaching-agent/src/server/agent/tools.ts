import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import type { ToolDefinition, ToolResult } from "../../shared/protocol";
import { text } from "./message";

type ToolExecutor = (args: Record<string, unknown>, signal?: AbortSignal) => Promise<ToolResult>;

type RegisteredTool = ToolDefinition & {
  execute: ToolExecutor;
};

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  register(tool: RegisteredTool): void {
    this.tools.set(tool.name, tool);
  }

  definitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(({ name, description, parameters }) => ({
      name,
      description,
      parameters,
    }));
  }

  async execute(name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(args, signal);
  }
}

export function createToolRegistry(workspaceRoot: string): ToolRegistry {
  const registry = new ToolRegistry();

  registry.register({
    name: "list_files",
    description: "List files inside the safe teaching workspace.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative directory path under workspace." },
      },
    },
    async execute(args) {
      const dir = resolveInsideWorkspace(workspaceRoot, stringArg(args.path, "."));
      const entries = await listFiles(dir, workspaceRoot);
      return {
        content: [text(entries.length > 0 ? entries.join("\n") : "(empty)")],
        details: { entries },
      };
    },
  });

  registry.register({
    name: "read_file",
    description: "Read a UTF-8 text file inside the safe teaching workspace.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative file path under workspace." },
      },
      required: ["path"],
    },
    async execute(args) {
      const filePath = resolveInsideWorkspace(workspaceRoot, stringArg(args.path, ""));
      const content = await readFile(filePath, "utf8");
      return {
        content: [text(truncate(content, 1800))],
        details: { path: relative(workspaceRoot, filePath) },
      };
    },
  });

  registry.register({
    name: "write_note",
    description: "Write a markdown note under workspace/notes.",
    parameters: {
      type: "object",
      properties: {
        fileName: { type: "string", description: "Markdown file name." },
        content: { type: "string", description: "Note body." },
      },
      required: ["fileName", "content"],
    },
    async execute(args) {
      const fileName = stringArg(args.fileName, "note.md").replace(/[/\\]/g, "-");
      const notePath = resolveInsideWorkspace(workspaceRoot, `notes/${fileName}`);
      await mkdir(dirname(notePath), { recursive: true });
      await writeFile(notePath, `${stringArg(args.content, "")}\n`, "utf8");
      return {
        content: [text(relative(workspaceRoot, notePath))],
        details: { path: relative(workspaceRoot, notePath) },
      };
    },
  });

  return registry;
}

function stringArg(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function resolveInsideWorkspace(workspaceRoot: string, input: string): string {
  const target = resolve(workspaceRoot, input);
  const root = resolve(workspaceRoot);
  const rel = relative(root, target);
  if (rel.startsWith("..") || rel === "" && input.includes("..")) {
    throw new Error(`Path escapes workspace: ${input}`);
  }
  return target;
}

async function listFiles(dir: string, workspaceRoot: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const dirent of dirents) {
    if (dirent.name.startsWith(".")) continue;
    const absolute = resolve(dir, dirent.name);
    const rel = relative(workspaceRoot, absolute);
    if (dirent.isDirectory()) {
      results.push(`${rel}/`);
      const nested = await listFiles(absolute, workspaceRoot);
      results.push(...nested);
    } else {
      results.push(rel);
    }
  }
  return results.sort();
}

function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max)}\n... [truncated ${input.length - max} chars]`;
}
