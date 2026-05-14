# 极简全栈架构裁剪与收敛审计报告 (Architecture Unification Audit)

> **日期**: 2026-05-14
> **评估轮次**: 第 6 轮 (最终审计)
> **决策动机**: 响应“技术栈统一、极低资源消耗、易于运维、缩短工期”的 5 项核心指标。

## 1. 背景与核心痛点
在前 5 轮调研中，我们提议了一个强大的组合：**Logto (认证) + Directus (题库 CMS) + LiteLLM (大模型网关) + Python微服务 (RAG) + Next.js (主系统)**。
虽然这些组件在各自领域都是王者，但这套架构在落地时会面临严重的灾难：
- **算力灾难**：需要至少部署 4 个不同语言（Node, Go, Python）的 Docker 容器集群，极度吞噬服务器内存和维护带宽。
- **技术栈割裂**：前端写 TS，题库运维写 Go，AI 算法写 Python，开发体验极差，工作量剧增。

因此，本轮我们进行大刀阔斧的“降维打击”，把所有独立中间件**裁剪回代码库本身（Library）**，提出一套 **100% TypeScript + PostgreSQL** 的极简单体架构。

---

## 2. 核心模块重构与组件裁剪清单

### 🔪 裁剪 1：砍掉独立的 IDP 与权限中心 (Logto / Casdoor)
- **原方案**：部署独立的身份验证微服务。
- **极简平替**：**Auth.js v5 (NextAuth)** + **Prisma ORM** + 本地 Role 字段。
- **收敛逻辑**：Auth.js 原生支持将 Session 挂载到 Prisma 数据库，我们可以直接在 `User` 表中拓展 Enum 类型的 `Role` 字段，并在 Next.js 的 Middleware 中通过 `session.user.role` 实现 RBAC 和路由阻断。卡密核销逻辑直接写在 Server Actions 里。**省掉 1 台 Auth 服务器开销。**

### 🔪 裁剪 2：砍掉 Python 的 RAG 切块微服务
- **原方案**：用 Python 起一个 FastAPI 接口，调用 LangChain 切割 Markdown。
- **极简平替**：**@langchain/textsplitters (JS版)**。
- **收敛逻辑**：经过调研，`LangChain.js` 已经原生移植了极其好用的 `MarkdownHeaderTextSplitter`。我们完全可以在 Next.js 的 Server Actions 中，使用纯 TS 将题库/文档按 Markdown 的 `## 标题` 切块，然后直接写入 PostgreSQL。**省掉 1 台 Python 服务器开销。**

### 🔪 裁剪 3：砍掉独立的 AI API 网关 (LiteLLM)
- **原方案**：部署 LiteLLM 容器做大模型负载均衡和多模型容灾。
- **极简平替**：**Vercel AI SDK (Core)**。
- **收敛逻辑**：Vercel 最新版本的 AI SDK 原生支持了类似 Gateway 的特性。在 `streamText` 中配置 `providerOptions: { gateway: { fallback }}`，如果主模型（如百度）挂了，SDK 在当前进程内自动无缝回退到备用模型（如智谱）。**省掉 1 台 API 网关服务器开销。**

### 🔪 裁剪 4：砍掉重型的 Headless CMS (Directus)
- **原方案**：部署独立的 Node/Vue 容器专门给运营人员录入试卷。
- **极简平替**：**Prisma + ZenStack** / 或者基于 **Shadcn UI** 自己手搓 4 个页面的 Admin 表单。
- **收敛逻辑**：试卷的 4 层嵌套虽然复杂，但在 Prisma 的 JSONB 字段和强类型校验下，其实也就是写几个嵌套数组的 CRUD。手搓后台虽然初期累几天，但免去了一生维护 CMS 同步的麻烦。

---

## 3. Tiku 最终统一架构蓝图 (The Ultimate Stack)

经过地狱般的裁剪，我们的技术栈被极致收缩到了以下 **“一库三件套”**，彻底实现了“天下大同”：

1. **唯一编程语言**：TypeScript 
2. **唯一框架引擎**：Next.js (App Router)
   - 包含前端渲染 (React)
   - 包含后端接口 (Server Actions)
   - 包含 AI 对接 (Vercel AI SDK)
3. **唯一数据库**：PostgreSQL
   - 包含业务数据
   - 包含 Auth session
   - 包含向量检索引擎 (`pgvector` 插件)
4. **唯一 UI/样式体系**：Tailwind CSS + `shadcn/ui` 
   - 同一套 Token 辐射至 Web 后台和未来可能的 Taro 小程序。

---

## 4. 结论总结
这套 **Next.js Monolith + Postgres** 的架构完美回应了所有的非功能性要求。它**去除了所有第三方服务依赖**，无需 Kubernetes，前期甚至只需要跑在一个 2 核 4G 的单体云服务器（或 Vercel Serverless）上。它不仅极大缩减了服务器预算，也让单个 Full-Stack TS 工程师能在几天内跑通整个 MVP！
