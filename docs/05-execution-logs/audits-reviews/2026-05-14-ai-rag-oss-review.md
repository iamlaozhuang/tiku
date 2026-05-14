# AI 智能化与知识检索层 (RAG & AI Scoring) 开源候选评估报告

> **日期**: 2026-05-14
> **评估轮次**: 第 4 轮
> **覆盖模块**: AI 评分与讲解 (AI Assessment) / RAG 与知识库 (RAG & Knowledge Base)

## 1. 大模型网关与 Prompt 模板库 (LLM Gateway & Prompt Management)

Tiku 系统需要接入多模型（支持不同供应商如阿里云、文心一言等进行 AI 评分与讲解），并且需要将复杂的 Prompt（主观题评分标准设定）从代码库中抽离，实现在线模板管理。

### 推荐组合：LiteLLM + Langfuse
- **LiteLLM (AI 网关层)**
  - **技术栈**：Python / Node.js
  - **核心优势**：绝对的行业标准，提供统一的、兼容 OpenAI 格式的 API，可以无缝切换 100+ 不同的模型提供商。这对于 Tiku 未来切换廉价的大模型或私有化部署模型（如 Ollama）至关重要。
- **Langfuse (Prompt 与可观测性层)**
  - **技术栈**：Next.js + Prisma + PostgreSQL
  - **核心优势**：
    - 绝佳的可观测性：详细记录每一次 AI 调用的 Token 消耗和延迟。满足需求文档中“AI 调用流控与日志追踪”的要求。
    - **Prompt 管理**：完美支持线上构建包含 `{{question}}`, `{{student_answer}}` 等变量的 Prompt 模板，并且支持按版本下发，无需重部署系统即可优化 AI 评分策略。
- **二开适配度**：Langfuse 本身也是基于 Next.js 的开源项目，其技术栈与 Tiku 完美契合，可以直接采用 Docker 容器化私有部署，侵入性低。

---

## 2. RAG 文档解析与 Markdown 分块 (Chunking)

我们的需求明确指出了 `Markdown 知识库不支持版本管理，但命中检索要有证据溯源 (Citation)`。这就要求我们的分块策略必须极其聪明，不能破坏 Markdown 原有的层级和语义。

### 候选一：LangChain 的 `MarkdownHeaderTextSplitter` (Python 侧首选)
- **核心机制**：这并不是一个独立项目，而是 LangChain 框架中的神级组件。它能够精确识别 `#`, `##` 等 Markdown 标题。
- **匹配度**：切分时，它会将上级标题作为 Metadata 注入到每一个切出来的 Chunk 中。这样在后续大模型回答时，能够精确引用到“原版培训教材的哪个章节”，直接解决“证据溯源”难题。

### 候选二：Unstructured.io (大规模复杂文档处理)
- **核心优势**：如果是除了纯 Markdown 外，还要处理极其复杂的 PDF、Word 讲义，Unstructured 提供了开源的解析引擎。
- **局限性**：比较重，针对纯粹的 Markdown 知识库属于杀鸡用牛刀。

### 候选三：LangChainGo (Go 语言备选)
- **核心优势**：如果我们的后端最终完全摒弃 Python 而使用 Golang，可以考虑使用 tmC/langchaingo 中的文本切分工具。
- **局限性**：Go 在 RAG 领域的库远不如 Python 丰富，处理特殊嵌套的 Markdown 时效果不及 Python 版本的 LangChain。

---

## 3. 架构落地建议 (AI & RAG)

综合来看，Tiku 在 AI 与 RAG 层的技术栈**必须引入 Python 微服务或强依赖第三方容器**：
1. **模型调用与路由**：部署一套独立的 `LiteLLM` 代理网关，并外接自建的 `Langfuse` 服务来管理 Prompt 模板。我们的核心业务代码只需集成 Langfuse SDK 即可。
2. **知识库注入 (Ingestion)**：建立一个小型的 Python 服务节点，专门负责接收从后台上传的 Markdown 素材，调用 `LangChain` 的 `MarkdownHeaderTextSplitter` 结合 `RecursiveCharacterTextSplitter` 进行分块。
3. **向量检索**：将分好块的数据连同标题 Metadata 写入向量数据库（后续可选用 pgvector 插件附加在我们的关系型数据库中，降低运维成本）。

## 📝 下一步行动
1. 更新 `task.md` 状态，所有 4 轮评估全部结束。
2. 依据各轮评估结论，在 `docs/02-architecture/adr/` 或 `docs/05-execution-logs/task-plans/` 给出最终的整体阶段总结，等待用户验收。

---

## 🟣 补充调研：长尾与垂直领域替代方案 (第 5 轮)

### 1. 向量数据库选型与运维成本考量 (pgvector vs Qdrant)
- **pgvector**：PostgreSQL 的原生插件。
  - **优势**：运维成本极低（Zero Infrastructure Sprawl）。由于 Tiku 题库本身极可能采用 PostgreSQL，直接开启插件即可拥有向量能力，且业务数据与向量数据同库，可以执行极高效的混合查询（Hybrid Search，如：在某大类题库内搜索某知识点）。
- **Qdrant / Chroma**：专业的向量数据库。
  - **劣势**：引入额外的基础设施（容器或云服务），对于 Tiku 前期的 MVP 阶段属于过度设计（Over-engineering），会加重私有化部署时的实施难度。
- **推荐**：毫不犹豫选择 **pgvector** 作为 RAG 的存储层。

### 2. Prompt 测试与回归框架 (Promptfoo)
- **挑战**：当我们在 Langfuse 中修改了“主观题 AI 评分”的 Prompt 模板后，如何保证修改不会导致评分标准“开倒车”（Regression）？
- **对策 (Promptfoo)**：补充调研发现，**Promptfoo** 是目前最顶级的开源 LLM 评估框架。我们可以编写一套测试用例集（标准试题、标准满分答案、学生错误答案及预期得分）。每次修改 Prompt 后，运行 Promptfoo 脚本，它会自动批量调用 LiteLLM 网关进行测试，并输出通过率报告。强烈建议在 Tiku 的 CI/CD 流程中引入它。
## 🟢 补充调研：基于极简全栈架构的开箱即用脚手架 (第 7 轮)

如果我们要干掉 Python 微服务，只用一台 Next.js Serverless 跑完全部的 RAG 检索引擎和多模型网关，Vercel 官方及其社区开源的以下脚手架是不可替代的参考基座：

### 推荐仓库 1：`vercel/ai-sdk-rag-starter`
- **链接**：[Github](https://github.com/vercel/ai-sdk-rag-starter)
- **技术匹配度**：完美（Next.js 14 App Router + Vercel AI SDK + PostgreSQL pgvector + Drizzle ORM + Shadcn UI）。
- **二开价值**：**这就是我们想要的“终极单体架构”的具体实现！** 官方出品，代码质量极高。它已经把 `streamText`、工具调用（Tool Calling）、如何把文本切块丢进 `pgvector` 并进行余弦相似度检索的逻辑全部用纯 TypeScript 实现了。我们完全可以直接克隆这个仓库的底层 AI 逻辑，合并到我们的 SaaS 主脚手架中。

### Vercel AI SDK 原生多模型容灾
- 不需要再寻找第三方的 LiteLLM 仓库。在上述模板中，直接使用 Vercel AI SDK 的 `providerOptions: { gateway: { models: ['anthropic', 'google'] } }` 配置，即可在前端代码中实现自动降级和重试，零中间件开销。
