type Message = {
  role: "user" | "assistant";
  text: string;
};

type SessionEntry = {
  id: string;
  parentId: string | null;
  type: "message";
  message: Message;
};

class SessionTree {
  private counter = 0;
  private entries: SessionEntry[] = [];
  private byId = new Map<string, SessionEntry>();
  private leafId: string | null = null;

  append(message: Message): string {
    // 新 entry 总是挂在当前 leaf 后面，然后自己成为新的 leaf。
    const entry: SessionEntry = {
      id: `entry_${++this.counter}`,
      parentId: this.leafId,
      type: "message",
      message,
    };
    this.entries.push(entry);
    this.byId.set(entry.id, entry);
    this.leafId = entry.id;
    return entry.id;
  }

  branchTo(entryId: string | null): void {
    if (entryId !== null && !this.byId.has(entryId)) {
      throw new Error(`Unknown entry: ${entryId}`);
    }
    this.leafId = entryId;
  }

  contextFrom(leafId: string | null = this.leafId): SessionEntry[] {
    // 构建上下文时只取 leaf 到 root 的路径，不取整个文件。
    const path: SessionEntry[] = [];
    let current = leafId ? this.byId.get(leafId) : undefined;
    while (current) {
      path.unshift(current);
      current = current.parentId ? this.byId.get(current.parentId) : undefined;
    }
    return path;
  }

  getLeafId(): string | null {
    return this.leafId;
  }
}

const tree = new SessionTree();

const rootUserId = tree.append({ role: "user", text: "我想实现一个 Agent。" });
const rootAssistantId = tree.append({ role: "assistant", text: "可以从 Agent Loop 开始。" });

tree.append({ role: "user", text: "选择方案 A：先做工具调用。" });
const leafA = tree.append({ role: "assistant", text: "A 的结果：工具调用跑通了。" });

tree.branchTo(rootAssistantId);
tree.append({ role: "user", text: "选择方案 B：先做会话树。" });
const leafB = tree.append({ role: "assistant", text: "B 的结果：会话树跑通了。" });

printContext("leaf A context", tree.contextFrom(leafA));
printContext("leaf B context", tree.contextFrom(leafB));
console.log(`current leaf: ${tree.getLeafId()}`);
console.log(`root user id: ${rootUserId}`);

function printContext(title: string, entries: SessionEntry[]): void {
  console.log(`\n${title}`);
  for (const entry of entries) {
    console.log(`${entry.id} <- ${entry.parentId ?? "root"} | ${entry.message.role}: ${entry.message.text}`);
  }
}
