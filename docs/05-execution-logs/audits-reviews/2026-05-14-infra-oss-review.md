# 基础设施层 (Auth & Admin Portal) 开源候选评估报告

> **日期**: 2026-05-14
> **评估轮次**: 第 1 轮
> **覆盖模块**: 统一认证与授权引流 (User Auth & Entitlement) / 管理后台与运维 (Admin Portal & Ops)

## 1. 认证与授权 (Auth & RBAC)

Tiku 项目的首期与未来核心需求包含了：统一手机号账号、卡密核销（Redeem Code）、多级企业组织树（省/市/区）以及复杂的内容授权并集计算。我们需要考察支持 Multi-tenant（多租户）和细粒度 RBAC 的身份系统。

### 候选一：Logto (推荐用于现代 SaaS)

- **技术栈**：Node.js / TS (深度集成 Next.js)
- **开源协议**：Apache 2.0 (开放核心)
- **核心优势**：
  - **极佳的开发者体验**：拥有针对 Next.js (App Router/Server Actions) 的官方专属 SDK (`@logto/next`)，集成成本极低。
  - **开箱即用的多租户**：原生支持 B2B SaaS 的“组织 (Organization)”模型，组织内拥有独立的 RBAC 角色体系（完美契合本项目“企业组织树”的需求）。
- **二开适配度**：Logto 本身提供 Webhook，可以通过它将“卡密核销”和“复杂授权并集”逻辑无缝下发到我们的 Go/Node 后端处理，侵入性低，作为外部依赖（IDP）集成。

### 候选二：ZITADEL (推荐用于云原生/大规模)

- **技术栈**：Go
- **开源协议**：Apache 2.0
- **核心优势**：
  - **原生 Go 实现**：极其适合微服务或需要极高并发的基础设施。
  - **B2B 授权委托**：ZITADEL 拥有最强的 B2B 隔离，甚至支持“Project Grants”（A 企业授权 B 企业使用其资源），这对复杂的烟草企业层级管控可能非常有帮助。
- **二开适配度**：同样作为外部 IDP 引入。其内置的 Actions (脚本) 可以在 Token 颁发时动态注入业务权限声明。

### 候选三：Casdoor (适合复杂异构系统)

- **技术栈**：Go 后端 + React 前端
- **开源协议**：Apache 2.0
- **核心优势**：基于强大的 `Casbin` 权限引擎，不仅支持 RBAC，还能做 ABAC（基于属性的访问控制）。
- **局限性**：集成 Next.js 时不如 Logto 原生，且其自带的 UI 偏重传统企业级系统，学习 Casbin 的 policy 语法有一定门槛。

### 🔍 决议建议 (Auth)：

推荐选择 **Logto** 作为基础 IDP，原因在于其极致的 Next.js SDK 契合度与天然的“组织（企业）”RBAC 支持。复杂的卡密（Redeem Code）核销逻辑不应该侵入 IDP，而应该在我们自己的业务后端实现，随后通过 API 调用 IDP 为用户赋予相应的角色/组。

---

## 2. 中后台框架 (Admin Portal)

Tiku 管理后台分为“内容后台”与“运营后台”，需要极好的组件化体系、完善的数据表格和权限路由。由于技术栈限制为 React/Next.js/TS。

### 候选一：Next.js Shadcn Dashboard Starter (Kiranism)

- **技术栈**：Next.js 16 (App Router) + TypeScript + Tailwind CSS + `shadcn/ui`
- **开源协议**：MIT
- **核心优势**：
  - **完全控制权**：基于 `shadcn/ui`，所有组件代码都复制在本地（而非 npm 安装黑盒）。开发者拥有绝对的修改权。
  - **现代化生态**：集成 TanStack Table，对于后续复杂的“题目列表”、“卡密列表”的数据展示和分页查询性能极佳。
- **二开适配度**：非常高。MIT 协议无任何商业化障碍，且 App Router 契合当下最新的 Next.js 标准。

### 候选二：TailAdmin (Next.js 版本)

- **技术栈**：Next.js 16 + Tailwind CSS
- **开源协议**：MIT
- **核心优势**：
  - 提供极其丰富的现成页面（包含 SaaS, CRM 面板的现成组件），拿来即用。
  - 布局更为传统、扎实，适合不需要过于前卫设计的企业级管理后台。
- **局限性**：相比 shadcn 模式，它的组件可定制粒度略逊一筹。

### 候选三：Ant Design Pro 的 Next.js 社区复刻版 (`next-ant-design-pro`)

- **技术栈**：Next.js + Ant Design
- **核心优势**：中国开发者最熟悉的中后台布局。
- **局限性**：Ant Design Pro 官方深度绑定 UmiJS，社区的 Next.js 移植版更新频率与稳定性参差不齐。在最新的 App Router 模式下，基于 CSS-in-JS 的 Ant Design 有时会带来渲染性能或 hydration 报错的问题。

### 🔍 决议建议 (Admin Portal)：

强烈推荐采用 **Next.js Shadcn Dashboard Starter**。它彻底摆脱了传统 Ant Design Pro 的底层黑盒限制，组件精美、性能极高，同时完全符合中国团队使用 React + TypeScript 的开发习惯。

---

## 📝 下一步行动

1. 更新 `task.md` 状态，第一轮评估完毕。
2. 开启第 2 轮调研（考试引擎与题库设计）。

---

## 🟣 补充调研：长尾与垂直领域替代方案 (第 5 轮)

### 1. 细粒度权限引擎 (Cerbos vs Casbin)

如果在 Tiku 架构中我们倾向于“自研认证网关”或使用极为轻量的 `Auth.js`，而非引入完整的 Logto，我们需要一个纯粹的权限管理引擎：

- **Cerbos**：采用 Policy-as-Code（YAML）的解耦架构。运行为独立微服务，前端/后端通过 API 询问“用户 A 是否能操作资源 B”。非常适合现代云原生微服务，能和 Next.js 完美结合。
- **Casbin**：基于代码库内嵌（Library）的权限引擎。不需要额外部署微服务，直接在 Node.js 或 Go 项目中引入即可。
- **推荐**：对于 Tiku 这个量级的业务，如果不采用 Logto，可以直接在服务端引入 **Casbin** 进行本地计算，减少网络开销；如果未来业务拆分极细，**Cerbos** 会是更好的企业级隔离方案。

### 2. Headless 后台管理框架 (Refine)

- **Refine**：这是一个极具潜力的 Headless React 框架，专做内部工具和管理后台。
- **优势**：它不强制绑定任何一套 UI 组件库（虽然它官方深度支持 Ant Design、Material UI 和 Tailwind），而是提供一整套标准的“数据抓取、权限验证、状态管理”的 Hook 逻辑。
- **推荐场景**：如果我们决定自己手写极为定制化的组件，而不是使用现成的 Shadcn Dashboard 模板，引入 **Refine** 作为底层数据路由与权限引擎将极大提高后台开发效率。它内置的 `accessControlProvider` 能完美衔接 Cerbos 或 Casbin。

## 🟢 补充调研：基于极简全栈架构的开箱即用脚手架 (第 7 轮)

在确立了“纯 Next.js + Prisma”的极简收敛路线后，我们为您定向发掘了以下在 Github 上高度活跃且能够开箱即用的 SaaS 脚手架代码库，可极大缩减您手搓底层逻辑的时间：

### 推荐仓库 1：`mickasmt/next-saas-stripe-starter`

- **链接**：[Github](https://github.com/mickasmt/next-saas-stripe-starter)
- **极简架构匹配度**：完美。它不仅包含了 Next.js 14, Auth.js v5, Prisma, 甚至连我们指定的 `shadcn/ui` 都已经预装并写好了各类 Admin 组件。
- **引入建议**：它内置了用户角色（User Roles）的 Prisma 模型和权限隔离路由。建议您可以直接基于此库做初始化，将里面的 Stripe 支付换成您的卡密核销代码即可。

### 推荐仓库 2：`pdovhomilja/nextsaastemplate`

- **链接**：[Github](https://github.com/pdovhomilja/nextsaastemplate)
- **引入建议**：相较于上一个库，这个模板更纯粹（剔除了一些过度设计的支付功能），专心做 Auth.js + Prisma + Shadcn，是极好的二次开发地基。
