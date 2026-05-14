# 开源选型终审报告 (Final Selection Audit)

> **日期**: 2026-05-14
> **评估轮次**: 第 8 轮 (终审 — 自我批判与深度复核)
> **目标**: 针对前 7 轮调研的所有候选项进行实地复核、逆向推演和偏见排查，输出可落地的最终选型建议。

---

## 0. 本轮审计发现的三个重大认知偏差

> [!CAUTION]
> 以下三个问题如果不被纠正，将直接导致项目在 3-6 个月后产生**技术债和被迫重构**。

### 偏差 1：Auth.js 已不是最优选择 — Better Auth 才是
- **事实**: 2025 年 9 月，Auth.js (NextAuth) 的核心开发团队**已正式加入 Better Auth 项目**。Auth.js 将仅维持安全补丁，不再有新功能开发。
- **Better Auth 数据**: ⭐ **28,300 Stars** | 6,820 commits | 925 releases | MIT 协议 | 100% TypeScript。
- **对 Tiku 的关键意义**: Better Auth **原生内置了多租户 (Organizations) 插件**。这意味着我们的"省/市/区三级烟草企业层级 + RBAC"需求，不再需要从零手写，直接启用它的 `organization` 插件即可。此外它还内置了 2FA、Passkeys、用户模拟等企业级功能。
- **结论**: 对于新项目，**必须选择 Better Auth 替代 Auth.js**。

### 偏差 2：Prisma 不再是唯一最优 ORM — Drizzle 值得认真考虑
- **事实**: Vercel 官方的 `ai-sdk-rag-starter` 使用的 ORM 是 **Drizzle 而非 Prisma**。2025/2026 年的社区趋势已明确转向 Drizzle。
- **关键差异**: Drizzle 是 SQL-first 设计，bundle size 仅 ~7-8KB（Prisma 虽然在 v7 大幅改进但仍远大于此）。在 Serverless 部署场景下，Drizzle 的冷启动速度**显著优于 Prisma**。
- **对 Tiku 的关键意义**: 如果您的项目未来考虑 Vercel 等 Serverless 部署，Drizzle 将节省显著的冷启动时间和内存开销。但如果您选择传统 VPS 部署（如阿里云 ECS），两者差异可忽略。且 Prisma 的迁移工具和 Studio 可视化更成熟。
- **结论**: **两者都可行**，需要根据部署策略决定。建议在本报告末尾做出最终建议。

### 偏差 3：`next-saas-stripe-starter` 虽然优秀，但它绑定的是 Auth.js — 存在隐性迁移成本
- **事实**: 该脚手架的认证层深度耦合了 Auth.js v5。如果我们决定采用 Better Auth（如偏差 1 建议），则该脚手架的 auth 相关代码（`auth.ts`, `auth.config.ts`, middleware, session 逻辑）**需要全部重写**。
- **实际改造量**: 虽然布局和 UI 组件仍可保留，但认证模块的重写大约需要 3-5 天，且有引入 Bug 的风险。
- **备选发现**: 搜索发现 `zexahq/better-auth-starter` 是一个干净的 Better Auth + Drizzle + PostgreSQL 的基础脚手架。虽然 Star 数远不及前者，但如果选用 Better Auth，它反而是一个"零摩擦"的起点。
- **结论**: 脚手架的选择必须与认证库的选择**联动决策**。

---

## 1. 候选项目实地复核数据表 (截至 2026-05-14)

| 项目 | ⭐ Stars | Commits | 最新 Release | 协议 | 语言 | 判定 |
|---|---|---|---|---|---|---|
| `better-auth/better-auth` | **28,300** | 6,820 | 2026-05-12 (v1.6.11) | MIT | 100% TS | ✅ **强烈推荐** |
| `mickasmt/next-saas-stripe-starter` | 3,000 | 177 | 2024-06-26 (v1.0.0) | MIT | 81% TS | ⚠️ 附条件推荐 |
| `vercel/ai-sdk-rag-starter` | 266 | **3** | 无 | 无明确 | 79% TS | 📖 仅参考模式 |
| `ECarry/quiz-online-nextjs` | **5** | 116 | 无 | MIT | 99% TS | 📖 仅参考 Schema |
| `bonartm/quizdown-js` | 122 | 257 | 2022-09-07 | MIT | Svelte | ❌ **已归档，放弃** |

---

## 2. 重新审视您的 5 项核心要求

### 要求 a: 技术栈统一
| 组件层 | 第 6 轮建议 | ✅ 终审修订 | 修订原因 |
|---|---|---|---|
| 认证 | Auth.js v5 | **Better Auth** | Auth.js 已进入维护模式；Better Auth 原生多租户 |
| ORM | Prisma | **Drizzle ORM** | Serverless 场景更优；与 Better Auth 官方适配器对齐 |
| AI SDK | Vercel AI SDK | Vercel AI SDK *(不变)* | — |
| UI | shadcn/ui + Tailwind | shadcn/ui + Tailwind *(不变)* | — |
| 数据库 | PostgreSQL + pgvector | PostgreSQL + pgvector *(不变)* | — |
| 语言 | 100% TypeScript | 100% TypeScript *(不变)* | — |

### 要求 b: 易于后续扩展
- Better Auth 的 **插件架构** 允许后续无痛添加 SSO、API Key 管理、Passkeys 等企业级功能，无需重构核心认证代码。
- Drizzle 的 SQL-first 设计意味着**任何 PostgreSQL 原生特性**（如行级安全 RLS、分区表）都能直接使用，不会被 ORM 抽象层阻断。

### 要求 c: 易于运维维护
- Better Auth 是**纯 TypeScript 库**，不是独立服务，零部署开销。
- Drizzle 没有外部二进制依赖（不像 Prisma 早期需要 Rust 引擎），**升级和迁移都是标准 npm 操作**。

### 要求 d: 降低资源消耗
- Drizzle 的 bundle size (~7KB) 对比 Prisma 的显著减小，直接降低 Serverless 函数的内存占用和冷启动时间。
- pgvector 同库同表，无需额外的向量数据库服务器（如 Pinecone/Qdrant）。

### 要求 e: 缩短开发工作量
- Better Auth 原生的 `organization` + `rbac` + `admin` 插件，可直接省去我们手写企业层级权限代码的工作量（预计节省 **1-2 周**）。
- Vercel AI SDK 的 `streamText` + Tool Calling 让 AI 评分功能的开发简化为几个函数调用。

### 要求 f: 对用户友好
- Better Auth 原生支持 Magic Link（免密登录）和 Passkeys（指纹/面容），可在后续版本中一行代码启用，**极大提升中老年烟草学员的登录体验**。

---

## 3. Vercel AI SDK 对国产大模型的兼容性验证

> [!IMPORTANT]
> Tiku 在国内部署，大概率需要对接国产大模型（通义千问、智谱 GLM、百度文心等）。这一点在前 7 轮中完全被忽略了。

| 国产模型 | Vercel AI SDK 对接方式 | 可用性 |
|---|---|---|
| 通义千问 (Qwen) | 官方包 `@ai-sdk/alibaba` | ✅ 官方支持 |
| 智谱 AI (GLM) | 社区包 `zhipu-ai-provider` | ✅ 社区维护 |
| 百度文心 (Ernie) | 通用包 `@ai-sdk/openai-compatible` | ✅ 兼容模式 |

**结论**: Vercel AI SDK 通过官方包 + `openai-compatible` 兼容层，可以覆盖所有主流国产大模型。**前述"干掉 LiteLLM"的决策依然成立**。

---

## 4. Serverless 部署的已知风险与防御预案

> [!WARNING]
> 如果采用 Vercel / 阿里云函数计算等 Serverless 部署，pgvector + 数据库连接池需要特别防御。

| 风险 | 影响 | 防御措施 |
|---|---|---|
| 数据库连接耗尽 | 并发高峰时数百个 Serverless 实例同时建连，打爆 PG 连接上限 | **强制使用连接池代理**（PgBouncer 或云数据库内置 Pooler） |
| pgvector 索引驱逐 | 向量索引被挤出内存导致检索延迟飙升 | 确保数据库实例 RAM ≥ 索引大小的 2 倍；优先用 **HNSW 索引** |
| 冷启动延迟 | 首次请求初始化慢 | 数据库客户端在模块顶层初始化；选择 Drizzle (极小 bundle) |

---

## 5. 最终选型建议 (The Final Stack)

```
┌─────────────────────────────────────────────────┐
│  Tiku 最终技术架构 (2026-05-14 终审版)           │
│  100% TypeScript · 1 个数据库 · 0 个微服务       │
├─────────────────────────────────────────────────┤
│                                                 │
│  框架:       Next.js 15 (App Router)            │
│  认证:       Better Auth v1.6+                  │
│              ├── organization 插件 (多租户)      │
│              ├── admin 插件 (后台管理)            │
│              └── rbac 插件 (角色权限)             │
│  ORM:        Drizzle ORM + drizzle-kit          │
│  AI:         Vercel AI SDK                      │
│              ├── @ai-sdk/alibaba (通义千问)      │
│              ├── @ai-sdk/openai-compatible       │
│              └── @langchain/textsplitters (切块)  │
│  UI:         shadcn/ui + Tailwind CSS            │
│  富文本渲染:  react-markdown + rehype-katex       │
│  数据库:     PostgreSQL + pgvector               │
│                                                 │
│  脚手架策略:  create-t3-app (底座) 或             │
│              zexahq/better-auth-starter (参考)    │
│              + 手动集成各模块                     │
└─────────────────────────────────────────────────┘
```

### 与第 6 轮建议的关键差异

| 维度 | 第 6 轮 | 终审版 | 改变原因 |
|---|---|---|---|
| 认证 | Auth.js v5 | **Better Auth** | Auth.js 已停止功能开发；Better Auth 原生多租户 |
| ORM | Prisma | **Drizzle** | 更小 bundle、更快冷启动、与 Better Auth 官方适配 |
| 脚手架 | Fork `next-saas-stripe-starter` | **create-t3-app 或手动搭建** | 原脚手架深度绑定 Auth.js，迁移成本超过重建成本 |
| 国产LLM | 未考虑 | **已验证兼容** | 补上了前 7 轮的重大盲区 |

---

## 6. 关于 Prisma vs Drizzle 的最终判断

两者都是优秀的 TypeScript ORM，最终选择取决于**部署策略**：

| 场景 | 推荐 | 理由 |
|---|---|---|
| Vercel / Serverless 部署 | **Drizzle** | 极小 bundle、无需 generate 步骤、冷启动快 |
| 传统 VPS (阿里云 ECS) | **两者均可** | 性能差异可忽略；Prisma 的 Studio 和迁移工具更友好 |
| 团队 SQL 经验丰富 | **Drizzle** | SQL-first 设计更直观 |
| 团队偏好高抽象 | Prisma | schema-first DSL 学习曲线低 |

**本报告的最终建议**: 鉴于 Better Auth 官方提供了 `@better-auth/drizzle-adapter` 且 Vercel AI SDK 的 RAG 模板也使用 Drizzle，为保持生态的**最大一致性**，推荐选择 **Drizzle ORM**。

---

## 7. 风险声明

1. **Better Auth 尚年轻**: 虽然 28k Stars 和 6800+ commits 表明社区活跃，但它仍是 v1.x 阶段。需要密切关注其 breaking changes。
2. **Drizzle 生态不如 Prisma 丰富**: Prisma 有 Studio、Accelerate、Pulse 等商业化工具。Drizzle 更精简，但第三方教程和案例较少。
3. **脚手架从头搭建**: 放弃 Fork 成熟脚手架意味着第一周的基建工作量会增加。但换来的是零技术债和完全的架构掌控力。
