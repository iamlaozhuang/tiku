# Phase 1 Test Tooling Decision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after human approval is recorded. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 决定 Tiku Phase 1 的测试工具栈，并准备依赖引入审批材料，先不修改 `package.json` 或 lockfile。

**Architecture:** 测试分层沿用 `docs/03-standards/testing-tdd.md`：纯逻辑、mappers、contracts、validators 和 service 使用单元测试；Client Component 使用 DOM 组件测试；异步 Server Component 和关键用户流上移到浏览器 E2E。该决策只建立工具边界和审批记录，不引入依赖。

**Tech Stack:** Next.js App Router, TypeScript, Vitest, React Testing Library, jsdom, Playwright.

---

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## 官方依据

- Next.js 官方 Testing 指南：区分 unit、component、integration、E2E，并提示异步 Server Component 优先使用 E2E。
- Next.js 官方 Vitest 指南：建议 Vitest + React Testing Library，并列出 `vitest`、`@vitejs/plugin-react`、`jsdom`、`@testing-library/react`、`@testing-library/dom`、`vite-tsconfig-paths`。
- Next.js 官方 Playwright 指南：建议 Playwright 做 E2E，生产构建或 `webServer` 启动应用后测试。
- Vitest 官方指南：DOM 环境需要单独安装 `jsdom` 或 `happy-dom`，coverage 可由 Vitest 命令扩展。
- Playwright 官方文档：Playwright Test 包含 runner、assertions、isolation、parallelization 和报告能力；支持 Chromium、Firefox、WebKit。

## 决策

### 单元测试

选择 `vitest`。

用途：

- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- 纯函数和无浏览器依赖的 service 逻辑

原因：

- 与 TypeScript 项目集成成本低。
- Next.js 官方提供 App Router 项目的 Vitest 指南。
- 可先覆盖纯业务逻辑，不需要数据库或浏览器。

### 组件测试

选择 `@testing-library/react` + `@testing-library/dom` + `@testing-library/jest-dom` + `jsdom`。

用途：

- Client Component 的渲染、空状态、错误状态、交互回调。
- 不测试异步 Server Component 的完整渲染路径；该类行为交给 Playwright。

原因：

- Testing Library 鼓励从用户可见行为断言组件。
- `@testing-library/jest-dom` 提供 DOM matcher，便于表达 Loading、Empty、Error 状态。
- `jsdom` 是 Next.js 官方 Vitest 示例使用的 DOM 环境。

### E2E 测试

选择 `@playwright/test`。

用途：

- 登录、管理后台 shell、学员首页、模拟考试提交、报告查看等关键用户路径。
- 异步 Server Component、Route Handler、Server Actions 和浏览器交互组合路径。
- 工作场所桌面 Web 兼容基线，默认先跑 Chromium，后续按风险扩展到 Microsoft Edge channel 或 WebKit/Firefox。

原因：

- Next.js 官方 Playwright 指南覆盖 E2E 场景。
- Playwright 可启动本地 Web server 并使用浏览器断言真实用户流。
- ADR-003 要求优先保障现代 Chromium 和 Microsoft Edge 桌面浏览器。

## 拟审批依赖清单

> 当前记录为审批材料。`human approval: approve phase-1-test-tooling-decision devDependencies`。依赖安装已获用户明确授权。

| Package name | Version range | Change type | Purpose | Import boundary | Alternative considered | Rejection reason | Abandonment risk | Security or maintenance risk | Bundle or runtime impact | Validation command | Human approval evidence |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| `vitest` | `^4.1.6` | add devDependency | 单元测试 runner 和 assertion | 仅测试文件、`vitest.config.mts`、测试 setup | Jest | Jest 可用但配置更重；Phase 1 更需要快速覆盖 TS 纯逻辑 | 低，生态活跃 | 仅开发依赖，关注 runner 配置和 snapshot 滥用 | 不进入生产 bundle | `npm.cmd run test:unit` | human approval: approve phase-1-test-tooling-decision devDependencies |
| `@vitejs/plugin-react` | `^6.0.2` | add devDependency | Vitest 下转换 React/TSX | 仅 `vitest.config.mts` | 仅依赖 Next/SWC | Next 官方 Vitest 手动配置要求该插件 | 低 | 仅开发依赖 | 不进入生产 bundle | `npm.cmd run test:unit` | human approval: approve phase-1-test-tooling-decision devDependencies |
| `jsdom` | `^29.1.1` | add devDependency | DOM 测试环境 | 仅 Vitest test environment | `happy-dom` | Next 官方示例使用 `jsdom`；兼容行为更接近浏览器 DOM | 低到中，依赖面较大 | 仅开发依赖，需关注 transitive CVE | 不进入生产 bundle；本地测试较慢 | `npm.cmd run test:unit` | human approval: approve phase-1-test-tooling-decision devDependencies |
| `@testing-library/react` | `^16.3.2` | add devDependency | React 组件行为测试 | 仅组件测试文件 | Enzyme | Enzyme 与现代 React 生态不匹配 | 低 | 仅开发依赖 | 不进入生产 bundle | `npm.cmd run test:unit` | human approval: approve phase-1-test-tooling-decision devDependencies |
| `@testing-library/dom` | `^10.4.1` | add devDependency | DOM query 基础能力 | 仅测试文件和 Testing Library 间接边界 | 直接 DOM selector | 直接 selector 容易锁死实现细节 | 低 | 仅开发依赖 | 不进入生产 bundle | `npm.cmd run test:unit` | human approval: approve phase-1-test-tooling-decision devDependencies |
| `@testing-library/jest-dom` | `^6.9.1` | add devDependency | DOM matcher | 仅 `vitest.setup.ts` | 手写 DOM assertion | 可读性和失败信息较差 | 低 | 仅开发依赖 | 不进入生产 bundle | `npm.cmd run test:unit` | human approval: approve phase-1-test-tooling-decision devDependencies |
| `@playwright/test` | `^1.60.0` | add devDependency | E2E runner、browser assertions、reporter | 仅 `playwright.config.ts` 和 `e2e/**/*.spec.ts` | Cypress | Cypress 也可行，但本项目优先桌面浏览器真实路径和 Playwright 官方 Next.js 指南 | 低 | 浏览器二进制下载和 CI 缓存需控制 | 不进入生产 bundle；增加本地/CI 下载体积 | `npm.cmd run test:e2e -- --project=chromium` | human approval: approve phase-1-test-tooling-decision devDependencies |

## 后续落地文件边界

获得 human approval 后，后续实施任务才允许修改：

- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.mts`
- `vitest.setup.ts`
- `playwright.config.ts`
- `src/**/*.test.ts`
- `src/**/*.test.tsx`
- `e2e/**/*.spec.ts`
- `docs/05-execution-logs/evidence/*.md`

当前任务不修改以上 package 和源码文件。

## 推荐脚本

审批通过后再添加：

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 实施任务拆分

### Task 1: 审批确认

**Files:**
- Modify: `docs/05-execution-logs/task-plans/2026-05-16-phase-1-test-tooling-decision.md`
- Modify: `docs/05-execution-logs/evidence/2026-05-16-phase-1-test-tooling-decision.md`

- [x] **Step 1: 等待人工审批**

用户已明确要求“按方案进入依赖安装与测试配置落地”。记录为：`human approval: approve phase-1-test-tooling-decision devDependencies`。

- [ ] **Step 2: 若审批被拒绝，记录替代路线**

保留 `lint: pass/fail`、`typecheck: pass/fail`、`test: missing` 状态，不修改 package 文件。

### Task 2: 依赖与配置落地

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `vitest.config.mts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: 安装已批准依赖**

Run after approval:

```powershell
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @playwright/test
```

Expected: `package.json` and `pnpm-lock.yaml` change only for approved devDependencies.

- [ ] **Step 2: 添加 Vitest 配置**

Create `vitest.config.mts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**"],
    include: ["tests/unit/**/*.test.ts", "src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

- [ ] **Step 3: 添加 Testing Library setup**

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: 添加 Playwright 配置**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm.cmd run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### Task 3: 冒烟测试与门禁

**Files:**
- Create: `src/server/contracts/api-response.test.ts`
- Create: `e2e/home.spec.ts`
- Modify: `docs/05-execution-logs/evidence/2026-05-16-phase-1-test-tooling-decision.md`

- [ ] **Step 1: 添加最小单元测试**

首个测试应覆盖标准 API 响应 helper 或 contract，不新增业务范围。

- [ ] **Step 2: 添加最小 E2E 冒烟测试**

首个 E2E 只验证首页或已存在公开页面可打开，不绑定未实现业务。

- [ ] **Step 3: 运行验证命令**

Run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:e2e -- --project=chromium
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Expected: lint、typecheck、unit、chromium E2E 均通过；evidence 文件记录完整输出。

## 风险防御

- 不测试异步 Server Component 的内部实现，避免工具不支持导致脆弱测试。
- Playwright 默认只启用 Chromium，符合 ADR-003 的工作场所桌面优先策略；跨浏览器矩阵等关键流程出现后再扩大。
- `@playwright/test` 浏览器下载体积较大，后续 CI 需缓存浏览器目录。
- `jsdom` 不能替代真实浏览器行为，组件测试只覆盖 DOM 级交互，不覆盖布局、导航和 Server Component。
- 禁止 snapshot 滥用；仅在契约稳定且审查成本低时使用。

## 当前状态

- Tooling decision: approved.
- Dependency installation: complete.
- `human approval`: approve phase-1-test-tooling-decision devDependencies.
- `test` script: available and verified.
