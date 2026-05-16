# ADR-001: Tiku 项目技术栈选型决策

> **状态**: ✅ 已决策 (Accepted)
> **决策日期**: 2026-05-14
> **决策者**: 项目负责人 + AI 技术顾问
> **调研依据**: 8 轮开源调研 (详见 `docs/05-execution-logs/audits-reviews/2026-05-14-*.md`)

---

## 1. 决策背景

Tiku（题库系统）是面向中国烟草行业的职业技能考试平台，包含管理后台（出卷/组卷/企业管理）、学员端（答题/练习/模考）、以及 AI 智能化模块（主观题评分/知识库 RAG 检索/学习建议）。

项目有以下不可妥协的约束条件：

1. **技术栈必须统一**，不允许多语言混合开发
2. **必须易于扩展**，不会因技术选型产生阻塞
3. **必须易于运维**，不留技术债，不引入额外风险
4. **必须极大降低资源消耗**，包括服务器、带宽和算力
5. **必须极大缩短开发工作量**
6. **必须对终端用户友好**

---

## 2. 决策结论总览

### 2.1 技术架构全景

```
┌─────────────────────────────────────────────────┐
│  Tiku 技术栈 (100% TypeScript · 单体架构)        │
├─────────────────────────────────────────────────┤
│                                                 │
│  运行框架:    Next.js 15 (App Router)            │
│  认证授权:    Better Auth v1.6+                  │
│  数据库 ORM:  Drizzle ORM + drizzle-kit          │
│  AI 集成:    Vercel AI SDK                       │
│  UI 组件:    shadcn/ui + Tailwind CSS            │
│  富文本渲染:  react-markdown + rehype-katex       │
│  数据库:     PostgreSQL 16+ (含 pgvector 插件)    │
│  包管理:     pnpm                                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.2 选型速查表

| 技术层        | 选定方案               | npm 包名                                          | 版本要求 | 协议       |
| ------------- | ---------------------- | ------------------------------------------------- | -------- | ---------- |
| 框架          | Next.js                | `next`                                            | ≥ 15.x   | MIT        |
| 认证          | Better Auth            | `better-auth`                                     | ≥ 1.6.x  | MIT        |
| ORM           | Drizzle ORM            | `drizzle-orm` + `drizzle-kit`                     | ≥ 0.36.x | Apache-2.0 |
| AI SDK        | Vercel AI SDK          | `ai` + `@ai-sdk/alibaba`                          | ≥ 4.x    | Apache-2.0 |
| 文本切块      | LangChain.js Splitters | `@langchain/textsplitters`                        | ≥ 0.1.x  | MIT        |
| UI 组件       | shadcn/ui              | CLI 安装 (非 npm 包)                              | latest   | MIT        |
| CSS           | Tailwind CSS           | `tailwindcss`                                     | ≥ 4.x    | MIT        |
| Markdown 渲染 | react-markdown         | `react-markdown` + `rehype-katex` + `remark-math` | latest   | MIT        |
| 向量检索      | pgvector               | PostgreSQL 插件                                   | ≥ 0.7.x  | PostgreSQL |
| 数据库        | PostgreSQL             | 服务端安装                                        | ≥ 16.x   | PostgreSQL |

---

## 3. 逐项选型理由

### 3.1 运行框架: Next.js 15

**选型理由**:

- App Router 架构同时提供 SSR、SSG、ISR 和 Server Actions，一个框架覆盖前后端
- Server Actions 直接替代独立 API 层，减少代码量
- 原生支持 React Server Components，降低客户端 JS 体积
- Vercel AI SDK 的最佳适配目标框架

**引入方式**:

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**注意事项**:

- 必须使用 App Router (`/app` 目录)，不使用 Pages Router
- 路由分组应按 `(admin)` / `(student)` / `(auth)` 组织
- 严禁在客户端组件中直接导入 Server-only 模块

---

### 3.2 认证授权: Better Auth

**选型理由**:

- Auth.js (NextAuth) 核心开发团队已于 2025 年 9 月加入 Better Auth，Auth.js 进入仅安全补丁的维护模式
- Better Auth: **28,300 Stars** | 6,820 commits | 925 releases | 100% TypeScript | MIT 协议
- **原生内置 `organization` 插件**：直接映射 Tiku 的"省/市/区三级烟草企业层级"需求
- 原生内置 `rbac` 插件：声明式角色权限控制
- 原生内置 `admin` 插件：用户管理 API
- 内置 2FA、Passkeys、Magic Link 等企业级功能
- 官方提供 `@better-auth/drizzle-adapter`，与 Drizzle ORM 无缝集成

**被淘汰方案及原因**:
| 方案 | 淘汰原因 |
|---|---|
| Auth.js v5 | 核心团队已离开，不再有新功能开发 |
| Logto / Casdoor | 独立部署服务，增加运维成本和服务器开销 |
| Clerk / Auth0 | SaaS 付费服务，国内延迟高且有数据出境风险 |

**引入方式**:

```bash
pnpm add better-auth @better-auth/drizzle-adapter
```

**核心配置示例**:

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { organization, rbac, admin } from "better-auth/plugins";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    organization(), // 多租户：省/市/区企业层级
    rbac(), // 角色权限：admin / employee / student
    admin(), // 用户管理 API
  ],
});
```

**注意事项**:

- Better Auth 处于 v1.x 阶段，需密切关注 breaking changes
- 使用 `npx @better-auth/cli generate` 自动生成 Drizzle schema
- Session 策略建议使用 `database` 模式（非 JWT），以支持即时吊销
- 密码哈希默认使用 Argon2，生产环境需确认 Node.js 版本支持

---

### 3.3 数据库 ORM: Drizzle ORM

**选型理由**:

- SQL-first 设计，TypeScript 类型安全，无外部二进制依赖
- Bundle size 仅 ~7-8KB，Serverless 冷启动极快
- 无需 `generate` 步骤（不像 Prisma 每次改 schema 需要 `prisma generate`）
- Vercel 官方 RAG 模板 (`ai-sdk-rag-starter`) 选用的 ORM
- Better Auth 官方适配器 (`@better-auth/drizzle-adapter`) 的目标 ORM

**被淘汰方案及原因**:
| 方案 | 淘汰原因 |
|---|---|
| Prisma | Bundle 较大；Better Auth 和 Vercel 官方模板已转向 Drizzle |
| TypeORM | 社区活跃度下降，TypeScript 类型推断不如 Drizzle |
| Knex.js | 仅 Query Builder，无 Schema 管理和迁移工具 |

**引入方式**:

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

**核心配置示例**:

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**注意事项**:

- Schema 定义采用 TypeScript 文件（非 DSL），按业务模块拆分至 `src/db/schema/` 目录
- 使用 `drizzle-kit push` 开发阶段快速同步；`drizzle-kit generate` + `drizzle-kit migrate` 生产阶段正式迁移
- 数据库连接实例必须在模块顶层初始化（避免 Serverless 重复建连）
- 生产环境**必须**配置连接池代理（PgBouncer 或云数据库内置 Pooler）
- Drizzle 不提供类似 Prisma Studio 的可视化工具，开发阶段可用 pgAdmin 或 DBeaver 替代

---

### 3.4 AI 集成: Vercel AI SDK

**选型理由**:

- Vercel 官方出品，与 Next.js 深度集成
- 统一的 `streamText` / `generateText` API 覆盖所有大模型
- 原生支持 Tool Calling（工具调用），可实现 AI 自动查知识库后再评分
- 内置流式响应 UI 钩子 (`useChat`, `useCompletion`)
- 通过 Provider 架构支持多模型自动容灾降级

**国产大模型对接验证**:
| 模型 | npm 包 | 对接方式 |
|---|---|---|
| 通义千问 (Qwen) | `@ai-sdk/alibaba` | 官方 Provider |
| 智谱 AI (GLM) | `zhipu-ai-provider` | 社区 Provider |
| 百度文心 (Ernie) | `@ai-sdk/openai-compatible` | OpenAI 兼容模式 |
| OpenAI / Anthropic | `@ai-sdk/openai` / `@ai-sdk/anthropic` | 官方 Provider |

**引入方式**:

```bash
pnpm add ai @ai-sdk/alibaba @ai-sdk/openai-compatible
pnpm add @langchain/textsplitters  # 知识库文本切块
```

**注意事项**:

- AI 评分的 Prompt 模板应存放在 `src/ai/prompts/` 目录，便于版本管理和 A/B 测试
- 流式响应需在 Route Handler (`app/api/`) 中使用，不能在 Server Actions 中使用
- 大模型 API Key **严禁**写在客户端代码中，必须通过环境变量注入
- 建议后续引入 Promptfoo 做 Prompt 回归测试

---

### 3.5 UI 组件: shadcn/ui + Tailwind CSS

**选型理由**:

- shadcn/ui 不是一个 npm 依赖，而是直接复制到项目中的源码组件——**完全可控，可深度定制**
- 基于 Radix UI 原语，无障碍访问 (a11y) 开箱即用
- 与 Tailwind CSS 原生配合，遵循 Design Tokens 驱动的主题系统
- 社区组件丰富：Table、Form、Dialog、Drawer、Command 等管理后台常用组件齐全

**引入方式**:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog form input table
```

**注意事项**:

- 组件源码在 `src/components/ui/` 目录中，修改不影响上游
- 主题色通过 CSS Variables 定义在 `globals.css` 中，遵循项目已有的 Design Tokens 规范
- 按需添加组件，不要一次性全部安装

---

### 3.6 学员端富文本渲染: react-markdown + rehype-katex

**选型理由**:

- react-markdown: npm 周下载量 **300 万+**，React 生态最成熟的 Markdown 渲染器
- rehype-katex + remark-math: 支持 LaTeX 数学公式渲染，覆盖高难度理论题目
- 纯 React 组件，可直接嵌入 Next.js 页面

**被淘汰方案及原因**:
| 方案 | 淘汰原因 |
|---|---|
| quizdown-js | 2025-11 已归档 (Archived)；基于 Svelte 非 React；作者声明为"玩具项目" |
| marked.js | 仅 Markdown→HTML 转换，无 React 组件封装，需手动处理 XSS |

**引入方式**:

```bash
pnpm add react-markdown remark-math rehype-katex remark-gfm
pnpm add katex  # KaTeX CSS 样式
```

**注意事项**:

- 需在全局样式中导入 KaTeX CSS: `import 'katex/dist/katex.min.css'`
- 代码高亮可选配 `rehype-highlight` 或 `rehype-prism-plus`
- 自定义 Markdown 组件映射以匹配 Tiku 品牌设计规范

---

### 3.7 数据库: PostgreSQL + pgvector

**选型理由**:

- 业务数据、认证 Session、向量索引三合一，**仅需一个数据库实例**
- pgvector 支持 HNSW 和 IVFFlat 索引，余弦相似度检索性能满足知识库 RAG 需求
- 国内各大云厂商（阿里云、腾讯云、华为云）均原生支持 PostgreSQL + pgvector

**引入方式**:

- 服务端: 安装 PostgreSQL 16+ 并启用 pgvector 插件

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

- 应用端:

```bash
pnpm add postgres  # Drizzle 推荐的 PostgreSQL 驱动
```

**注意事项**:

- 向量维度应与所选 Embedding 模型一致（如通义千问 Embedding 默认 1536 维）
- 生产环境优先使用 **HNSW 索引**（而非 IVFFlat），检索精度和速度更优
- 数据库 RAM 应 ≥ 向量索引大小的 2 倍，防止索引被驱逐出内存
- 连接字符串必须使用 Pooler URL（如阿里云 RDS 的连接池地址），防止 Serverless 并发打爆连接

---

## 4. 被明确排除的技术方案汇总

| 方案            | 类别        | 排除原因                                         | 调研轮次  |
| --------------- | ----------- | ------------------------------------------------ | --------- |
| Logto / ZITADEL | 认证        | 独立部署微服务，增加运维和服务器成本             | 第 1-2 轮 |
| Auth.js v5      | 认证        | 核心团队已加入 Better Auth；不再有新功能         | 第 8 轮   |
| Prisma          | ORM         | Bundle 大；Better Auth/Vercel 官方均转向 Drizzle | 第 8 轮   |
| Directus        | CMS         | 独立 Node 服务，增加部署开销                     | 第 4 轮   |
| LiteLLM         | AI 网关     | Python 服务，破坏技术栈统一性                    | 第 6 轮   |
| Moodle          | 考试引擎    | PHP 技术栈，与 TypeScript 完全不兼容             | 第 2 轮   |
| quizdown-js     | 前端组件    | 已归档，基于 Svelte，作者声明非生产项目          | 第 8 轮   |
| Taro            | 跨端框架    | MVP 阶段暂缓小程序；纯 H5 方案优先               | 第 3 轮   |
| Langfuse        | AI 可观测性 | 独立部署服务，MVP 阶段过早引入                   | 第 4 轮   |

---

## 5. 脚手架与项目初始化策略

**决策**: 不 Fork 任何现有脚手架，**从 `create-next-app` 空白项目开始，手动集成各模块**。

**理由**:

- `next-saas-stripe-starter` (3k Stars) 深度绑定 Auth.js v5，迁移至 Better Auth 的重写成本 ≈ 重建成本
- `create-t3-app` 使用 tRPC 作为 API 层，但 Tiku 使用 Server Actions，两者哲学冲突
- 手动集成虽然第一周基建工作量增加 2-3 天，但换来**零技术债、零外部耦合**

**可参考的开源仓库** (仅借鉴架构模式，不直接 Fork):
| 仓库 | 参考价值 |
|---|---|
| `zexahq/better-auth-starter` | Better Auth + Drizzle 的集成模式 |
| `vercel/ai-sdk-rag-starter` | Vercel AI SDK + pgvector 的 RAG 实现模式 |
| `mickasmt/next-saas-stripe-starter` | Admin Panel 的 UI 布局和路由守卫模式 |

---

## 6. 风险登记表

| #   | 风险                                   | 等级 | 缓解措施                                      |
| --- | -------------------------------------- | ---- | --------------------------------------------- |
| R1  | Better Auth v1.x 存在 breaking changes | 中   | 锁定具体版本；关注 GitHub Releases 和 Discord |
| R2  | Drizzle 生态不如 Prisma 丰富           | 低   | 核心功能完备；开发阶段用 pgAdmin 补充可视化   |
| R3  | Serverless 冷启动影响首屏速度          | 中   | 选用 Drizzle (极小 bundle)；数据库连接池代理  |
| R4  | 国产大模型 API 稳定性不确定            | 中   | Vercel AI SDK 原生 fallback；配置多模型容灾链 |
| R5  | pgvector 索引内存驱逐                  | 低   | HNSW 索引 + 充足 RAM；监控索引命中率          |

---

## 7. 关联文档

- 调研计划: [2026-05-14-oss-research-plan.md](file:///f:/tiku/docs/05-execution-logs/task-plans/2026-05-14-oss-research-plan.md)
- 基础设施调研: [2026-05-14-infra-oss-review.md](file:///f:/tiku/docs/05-execution-logs/audits-reviews/2026-05-14-infra-oss-review.md)
- 考试引擎调研: [2026-05-14-exam-engine-oss-review.md](file:///f:/tiku/docs/05-execution-logs/audits-reviews/2026-05-14-exam-engine-oss-review.md)
- 学员端调研: [2026-05-14-student-ui-oss-review.md](file:///f:/tiku/docs/05-execution-logs/audits-reviews/2026-05-14-student-ui-oss-review.md)
- AI/RAG 调研: [2026-05-14-ai-rag-oss-review.md](file:///f:/tiku/docs/05-execution-logs/audits-reviews/2026-05-14-ai-rag-oss-review.md)
- 架构收敛审计: [2026-05-14-architecture-unification-audit.md](file:///f:/tiku/docs/05-execution-logs/audits-reviews/2026-05-14-architecture-unification-audit.md)
- 终审报告: [2026-05-14-final-selection-audit.md](file:///f:/tiku/docs/05-execution-logs/audits-reviews/2026-05-14-final-selection-audit.md)
- 术语表: [glossary.yaml](file:///f:/tiku/docs/03-standards/glossary.yaml)
