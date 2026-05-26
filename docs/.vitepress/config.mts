import { Buffer } from "node:buffer";
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Pi Agent 原理与实现",
  description: "从零到一实现一个 AI Agent 的中文渐进式教程",
  lang: "zh-CN",
  cleanUrls: true,
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }]],
  markdown: {
    lineNumbers: true,
    config(md) {
      const defaultFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const info = token.info.trim();
        if (info === "mermaid") {
          const diagram = Buffer.from(token.content, "utf8").toString("base64");
          return `<Mermaid diagram="${diagram}" />`;
        }
        return defaultFence
          ? defaultFence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      };
    }
  },
  themeConfig: {
    logo: "/logo.svg",
    search: {
      provider: "local"
    },
    nav: [
      { text: "学习路线", link: "/quick-start" },
      { text: "核心原理", link: "/concepts/what-is-agent" },
      { text: "最终项目", link: "/project/overview" },
      { text: "联系赞助", link: "/contact" },
      { text: "来源", link: "/reference/sources" }
    ],
    sidebar: [
      {
        text: "开始",
        items: [
          { text: "课程首页", link: "/" },
          { text: "运行与学习路线", link: "/quick-start" },
          { text: "联系与赞助", link: "/contact" }
        ]
      },
      {
        text: "第一部分：核心概念",
        collapsed: false,
        items: [
          { text: "Agent 到底是什么", link: "/concepts/what-is-agent" },
          { text: "Pi 的总体架构", link: "/concepts/pi-architecture" },
          { text: "消息、流式事件与状态", link: "/concepts/message-and-stream" },
          { text: "工具调用机制", link: "/concepts/tools" },
          { text: "会话、树与分支", link: "/concepts/sessions" },
          { text: "上下文、技能与压缩", link: "/concepts/context" }
        ]
      },
      {
        text: "第二部分：源码拆解",
        collapsed: false,
        items: [
          { text: "源码阅读地图", link: "/source/source-map" },
          { text: "pi-ai 模型协议层", link: "/source/model-protocol" },
          { text: "Agent Loop 主循环", link: "/source/agent-loop" },
          { text: "工具、扩展与资源加载", link: "/source/tools-extensions" },
          { text: "AgentSession 运行层", link: "/source/agent-session" },
          { text: "会话格式与压缩链路", link: "/source/session-compaction" },
          { text: "进阶压缩边界", link: "/source/advanced-compaction" }
        ]
      },
      {
        text: "第三部分：渐进式 Demo",
        collapsed: false,
        items: [
          { text: "Demo 1：最小 Agent 循环", link: "/demos/01-loop" },
          { text: "Demo 2：工具定义与执行", link: "/demos/02-tools" },
          { text: "Demo 3：JSONL 会话树", link: "/demos/03-session-tree" },
          { text: "Demo 4：上下文压缩", link: "/demos/04-compaction" },
          { text: "Demo 5：真模型烟测", link: "/demos/05-real-model" }
        ]
      },
      {
        text: "第四部分：教学版目标项目",
        collapsed: false,
        items: [
          { text: "项目总览", link: "/project/overview" },
          { text: "Demo 到项目的映射", link: "/project/code-map" },
          { text: "从零实现路线", link: "/project/build-00-roadmap" },
          { text: "Step 1：共享协议", link: "/project/build-01-protocol" },
          { text: "Step 2：Loop 与 MockModel", link: "/project/build-02-loop-model" },
          { text: "Step 3：工具系统", link: "/project/build-03-tools" },
          { text: "Step 4：JSONL 会话", link: "/project/build-04-session-store" },
          { text: "Step 5：Express API", link: "/project/build-05-api" },
          { text: "Step 6：React 前端", link: "/project/build-06-frontend" },
          { text: "Step 7：调试与验收", link: "/project/build-07-debug" },
          { text: "测试章节", link: "/project/testing" },
          { text: "可选：真实模型 Demo", link: "/project/build-08-real-model" },
          { text: "后端实现", link: "/project/backend" },
          { text: "前端实现", link: "/project/frontend" },
          { text: "运行与调试", link: "/project/run" },
          { text: "扩展方向", link: "/project/extend" }
        ]
      },
      {
        text: "参考",
        items: [
          { text: "常见错误", link: "/reference/pitfalls" },
          { text: "资料来源", link: "/reference/sources" }
        ]
      }
    ],
    outline: {
      level: [2, 3],
      label: "本页目录"
    },
    docFooter: {
      prev: "上一节",
      next: "下一节"
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/cellinlab/how-pi-agent-works" },
      { icon: "x", link: "https://x.com/cellinlab" }
    ],
    editLink: {
      pattern: "https://github.com/cellinlab/how-pi-agent-works/edit/main/docs/:path",
      text: "编辑此页"
    }
  }
});
