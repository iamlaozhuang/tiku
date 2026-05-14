# 核心业务逻辑层 (题库与考试引擎) 开源候选评估报告

> **日期**: 2026-05-14
> **评估轮次**: 第 2 轮
> **覆盖模块**: 题库、试卷与内容管理 (Question Bank & Exam Paper)

## 1. 复杂题库与答题引擎挑战分析

Tiku 项目的题库需求远超普通的“单选/多选/判断”在线测试。根据 `docs/01-requirements/modules/02-question-paper.md` 的规范，我们需要支持：
1. **嵌套层级**：试卷 -> 大题/模块 (Paper Section) -> 材料题组 (Question Group) -> 子题 (Question)。
2. **防篡改与状态机**：试卷发布后的快照锁定，草稿快照不能随母题修改自动同步。
3. **主客观混合**：客观题包含标准答案与解析，主观题包含评分点（Scoring Point）与 AI 维度设计。

这导致市面上绝大多数由个人开发的开源 React/Next.js 考试系统（如简单的 Quiz App 模板）在数据 Schema 设计上无法满足我们的业务深度。

---

## 2. 候选方案评估

### 候选一：SurveyJS (推荐作为前端 Schema 与渲染引擎基座)
- **技术栈**：Vanilla JS 核心 + React 原生绑定 + TypeScript
- **开源协议**：MIT (基础版开源，高级 Creator 收费)
- **核心优势**：
  - **JSON 驱动**：使用高度结构化的 JSON Schema 描述所有的题目、条件逻辑和验证规则。这极其契合我们需要将试卷“快照化（Snapshot）”并静态存储的要求。
  - **嵌套能力**：原生支持 `Panel` 和 `Panel Dynamic`，可以很容易地映射为我们的“材料题组”和“大题模块”。
- **二开适配度**：我们可以将 SurveyJS 作为纯净的前端渲染引擎，后端（Golang/Node）基于其 JSON Schema 格式构建题库实体（Entity），从而极大节省手写前端复杂嵌套表单和验证逻辑的时间。

### 候选二：LearnHouse (适合借鉴整体架构)
- **技术栈**：Next.js, React, TypeScript, Python (Backend)
- **开源协议**：AGPL (需极其谨慎)
- **核心优势**：这是一个新兴的现代化开源 LMS（学习管理系统），它的作业和测试模块架构非常现代，包含倒计时、进度保存等。
- **局限性**：由于是 AGPL 协议，我们**绝对不能**直接将其代码混入我们的商业化项目。
- **二开适配度**：零侵入（不可用）。但可以作为架构设计的优秀参考对象（尤其是其 Next.js App Router 下的状态流转设计）。

### 候选三：OEMS (Online Exam Management System)
- **技术栈**：Next.js, TypeScript, PostgreSQL (Prisma)
- **开源协议**：MIT
- **核心优势**：专门为考试设计的开源系统，包含了题目上传、考试组卷、防作弊的基础逻辑。它的数据库设计利用 Prisma ORM，相对规范。
- **局限性**：它的 Schema 还是偏扁平化（单层题目），没有“材料阅读题嵌套子题”的复杂数据结构。
- **二开适配度**：中等。可以提取其在 Next.js 下防止刷新丢失考试状态（Session/LocalStorage 同步）以及倒计时防作弊的 Hook 源码作为借鉴。

---

## 3. 架构落地建议 (题库引擎)

由于缺乏完全满足中国特色职业技能鉴定考试“超级复杂嵌套结构”的纯开源现成产品（Moodle 虽然支持，但其 PHP 架构被我们淘汰），我们建议采取 **自研后端 Schema + 开源前端渲染器** 的折中路线：

1. **后端 (数据库设计)**：必须自研。采用关系型数据库（PostgreSQL），严格按照 Tiku 规范建立 `paper`, `paper_section`, `question_group`, `question` 等表结构，使用 JSONB 字段存储试卷快照。
2. **前端 (答题交互)**：借鉴或引入 **SurveyJS** 的开源 Core。将其强大的 JSON Schema 渲染能力进行二次封装，适配为 Mobile-first 界面。
3. **状态同步**：剥离 **OEMS** 开源库中的考试心跳保活（Heartbeat）和状态持久化 Hooks，加入到我们的项目中。

---

## 📝 下一步行动
1. 更新 `task.md` 状态，第 2 轮评估完毕。
2. 开启第 3 轮调研（Student Experience / 答题卡交互与富文本渲染）。

---

## 🟣 补充调研：长尾与垂直领域替代方案 (第 5 轮)

### 降维打击思路：Headless CMS 替代自研 Schema (Strapi vs Directus)
由于市面上很难找到能完美承载“试卷 -> 模块 -> 题组 -> 子题”四级嵌套，还要管理复杂属性的开源考试库，我们在第 5 轮特意调研了 Headless CMS（无头内容管理系统），看是否能用它们来“拼装”题库后端。

- **Strapi**：基于 Node.js，Schema 定义在代码（文件）中。对于富文本和嵌套层级支持极好（比如利用其 Dynamic Zones 功能可以轻松拼装主观题和客观题混合的模块）。但它是 API 驱动，数据库关系构建较弱。
- **Directus**：基于 Node.js，Database-First 架构。它可以直接连接到我们干净的 PostgreSQL 数据库，并立刻生成可视化 Admin UI 和 GraphQL/REST API。极其适合处理极其复杂的外键关系（例如题目打标签、关联多个知识点）。
- **结论与推荐**：如果团队后端资源紧张，不想手写繁琐的题库 CRUD 接口，可以引入 **Directus**。我们只需在 PostgreSQL 里建好 Tiku 规范要求的 `paper_section`, `question_group` 等表结构，Directus 会立刻为我们生成一套完美的题库录入后台和给前端（答题端）拉取试卷的 API。
## 🟢 补充调研：基于极简全栈架构的开箱即用脚手架 (第 7 轮)

如果您决定彻底抛弃 PHP 的 Moodle 和独立的 Node CMS，坚持使用 **Next.js + Prisma** 构建全栈大单体，我们从 Github 为您定向挖掘了以下优秀的同技术栈题库模板，可以扒取它们在 Prisma 中的 Schema 关联设计：

### 推荐仓库 1：`ECarry/quiz-online-nextjs`
- **链接**：[Github](https://github.com/ECarry/quiz-online-nextjs)
- **技术匹配度**：极高（Next.js + Prisma + MongoDB/Postgres + AuthJS v5 + Shadcn UI）。
- **二开价值**：虽然它本身也是一个扁平单层题目的系统，但这是**目前市面上全栈技术极其标准的 Quiz 模板**。它已经把 AuthJS 与 Prisma 的联动，以及基础的答题、交卷计分逻辑全部写好了，非常适合以此为底座，去修改 Prisma Schema 来实现我们的“嵌套模块大题”逻辑。

### 推荐仓库 2：`MyNameIsCarsten/nextjs-quiz`
- **链接**：[Github](https://github.com/MyNameIsCarsten/nextjs-quiz)
- **二开价值**：包含题目管理、答案追踪等功能。它的 Prisma ORM 实体关系编写得非常清晰。可以扒取其数据库 Schema 的定义源码，供我们重写 Tiku 表结构时借鉴。
