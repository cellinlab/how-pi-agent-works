import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { SessionEntry } from "../../shared/protocol";
import { createAssistantMessage, createUserMessage, messageText, text } from "./message";
import { JsonlSessionStore } from "./sessionStore";

test("buildContext follows the current leaf path and ignores sibling branches", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "teaching-session-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const filePath = join(root, "session.jsonl");
  const now = new Date().toISOString();
  const entries: SessionEntry[] = [
    { type: "session", version: 1, id: "teaching-session", timestamp: now, cwd: root },
    { type: "message", id: "u1", parentId: null, timestamp: now, message: createUserMessage("root") },
    {
      type: "message",
      id: "a1",
      parentId: "u1",
      timestamp: now,
      message: createAssistantMessage([text("base")]),
    },
    { type: "message", id: "u2", parentId: "a1", timestamp: now, message: createUserMessage("branch a") },
    { type: "message", id: "u3", parentId: "a1", timestamp: now, message: createUserMessage("branch b") },
  ];
  await writeFile(filePath, `${entries.map((entry) => JSON.stringify(entry)).join("\n")}\n`, "utf8");

  const store = new JsonlSessionStore(filePath, root);
  const context = store.buildContext();

  assert.deepEqual(context.map(messageText), ["root", "base", "branch b"]);

  store.switchLeaf("u2");
  assert.deepEqual(store.buildContext().map(messageText), ["root", "base", "branch a"]);
  assert.equal(store.getLeafId(), "u2");
  assert.throws(() => store.switchLeaf("missing"), /Unknown session entry: missing/);
});

test("compactIfNeeded records firstKeptEntryId and rebuilds summary plus recent messages", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "teaching-compaction-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const store = new JsonlSessionStore(join(root, "session.jsonl"), root);

  for (let index = 1; index <= 6; index++) {
    await store.appendMessage(createUserMessage(`message ${index} ${"x".repeat(40)}`));
  }

  const compaction = await store.compactIfNeeded(20, 2);
  assert.ok(compaction);
  assert.equal(compaction.firstKeptEntryId, "entry_5");
  assert.ok(compaction.tokensBefore > 20);

  const context = store.buildContext();
  assert.equal(context.length, 3);
  assert.match(messageText(context[0]), /旧上下文摘要/);
  assert.match(messageText(context[1]), /message 5/);
  assert.match(messageText(context[2]), /message 6/);
});
