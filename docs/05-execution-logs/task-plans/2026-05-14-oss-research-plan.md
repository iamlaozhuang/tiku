# Tiku 项目开源技术选型深度调研执行方案

基于 Tiku 项目的核心架构需求，并结合技能库中的高效工具（`oss-hunter`, `deep-research`, `search-specialist`, `repo-scan` 等），特制定本多轮次深度调研计划。由于本次调研的最终目的是**评估是否适合引入到项目中进行改造（二次开发）或借鉴架构**，我们将对候选项目不仅看表面 Star 数，更会深入看技术栈匹配度、代码结构和开源协议。

---

## 🛠️ 核心机制设定

### 1. 技能调度与协作机制
在每一轮调研中，将强制组合使用以下技能：
- **阶段一：广泛发现** 👉 使用 **`search-specialist`** + **`oss-hunter`**。利用 `oss-hunter` 的发现机制结合精细化 Query，在 GitHub 和全网寻找满足技术栈（React/Next.js/TS/Go/Python）的优质项目。
- **阶段二：深度解剖** 👉 使用 **`repo-scan`** + **`deep-research`**。针对初筛进入候选名单的仓库，深度阅读其 `README`、架构文档及核心代码目录，评估其拓展性、代码规范、以及二开的改造成本。
- **阶段三：决策生成** 👉 使用 **`comprehensive-research-agent`**。汇总所有收集到的信息，输出结构化的横向对比与采纳建议报告。

### 2. 任务追踪与规范文档机制
严格遵守 `docs/03-standards/doc-management.md` 目录规范，绝不擅自新建根目录或破坏序号体系：
- **任务追踪**：通过 `task.md` 建立细粒度 CheckList，精确把控每一轮次的完成度。
- **执行方案留存**：
  - 在 `docs/05-execution-logs/task-plans/` 目录下创建带有日期的方案：`2026-05-14-oss-research-plan.md`（即本文件）。
- **调研报告与决策归档**：
  - 各轮次的具体开源候选项目评审报告，存放至 `docs/05-execution-logs/audits-reviews/` 目录（例如：`2026-05-14-auth-oss-review.md`）。
  - 若经过评审决定引入某开源项目进行二开，则需正式在 `docs/02-architecture/adr/` 下沉淀架构决策记录（如 `2026-05-14-adopt-casdoor-for-auth.md`）。

---

## 📅 多轮次调研执行计划 (前 6 轮已完成，新增极致对齐轮次)

*(前 6 轮调研我们得出“Pure Next.js + Postgres”是最符合 5 项要求的理论路线。本轮我们将回到 GitHub 泥瓦匠视角，去寻找真实存在、符合这套理论路线的优秀开源仓库)*

### 🟢 第 7 轮：基于极简全栈路线的 Github 模板与脚手架地毯式搜索 (Unified Boilerplates Research)
**目的**：完全基于用户提出的 5 项硬性指标（统一栈、好维护、低开销、缩短工期、体验好），搜寻能够“开箱即用”或“二开侵入极小”的 Github 全栈级开源模板，并将其**追加补充**到已有的 4 份评审文档中。

**本轮定向搜索重点**：
1. **统一认证与基建 (Auth/Admin)**：
   - 寻找 `Next.js 14+` + `Auth.js (NextAuth)` + `Prisma/Drizzle` + `Shadcn` 集成于一体的顶级 SaaS 脚手架。它们能极大缩短我们在认证与多租户隔离上的手搓时间。
2. **核心业务与题库 (Quiz/Exam Engine)**：
   - 搜寻基于 Prisma 的全栈问答或测试开源系统，重点看它们是如何在 ORM 层处理题目关联的。
3. **AI 智能化与 RAG (AI & Vector)**：
   - 搜寻由 Vercel 官方或社区维护的基于 `Vercel AI SDK` 的开源 RAG 模板，验证将其融入极简架构的改造成本。
4. **移动答题端 (Student UI)**：
   - 搜寻完全适配 Next.js App Router 且对 Mobile H5 体验友好的 Markdown / KaTeX 渲染模板代码。

---

## 🔒 风险防御与二开门禁原则
在调研评估过程中，我们将严格执行以下“二开评估门禁”：
1. **协议安全**：严格排查 GPL 等可能影响商业化的开源协议，优先推荐 MIT、Apache 2.0 等宽松协议。
2. **技术栈匹配**：强制向项目既定架构规范靠拢（严禁无关的技术栈）。
3. **架构侵入性**：重点评估候选项目是作为“依赖库 (Library)”引入，还是作为“脚手架 (Boilerplate)”二开。
