import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { messageText } from "./message";
import { createToolRegistry } from "./tools";

test("list_files and read_file operate inside the safe workspace", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "teaching-tools-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "src"));
  await writeFile(join(root, "README.md"), "hello agent", "utf8");
  await writeFile(join(root, "src", "app.ts"), "export const ok = true;", "utf8");

  const registry = createToolRegistry(root);
  const listResult = await registry.execute("list_files", { path: "." });
  assert.match(messageText(listResult), /README\.md/);
  assert.match(messageText(listResult), /src\/app\.ts/);

  const readResult = await registry.execute("read_file", { path: "README.md" });
  assert.equal(messageText(readResult), "hello agent");
});

test("read_file rejects paths that escape the workspace", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "teaching-tools-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const registry = createToolRegistry(root);

  await assert.rejects(
    () => registry.execute("read_file", { path: "../secret.txt" }),
    /Path escapes workspace: \.\.\/secret\.txt/,
  );
});
