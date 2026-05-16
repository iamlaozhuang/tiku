# Phase 1 Formatting Gate Decision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after human approval is recorded. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 决定 Tiku Phase 1 的格式化门禁方案，满足 Tailwind 类名排序十诫，并先准备依赖审批材料，不直接安装依赖。

**Architecture:** 格式化门禁分两层：`prettier --check` 作为全量 CI/本地检查，`lint-staged` 作为 pre-commit 的增量格式化入口。Tailwind 类名排序由 Tailwind Labs 官方 Prettier 插件承担，避免自建排序规则。

**Tech Stack:** Next.js, TypeScript, Tailwind CSS 4, Prettier, prettier-plugin-tailwindcss, lint-staged, Husky.

---

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`

## 官方依据

- Prettier 官方安装文档建议安装本地 devDependency，并使用 `.prettierignore` 控制忽略范围。
- Prettier CLI 文档区分 `--write` 与 `--check`，后者适合作为 CI/门禁检查。
- Tailwind Labs `prettier-plugin-tailwindcss` 用于按官方推荐顺序自动排序 Tailwind class。
- Prettier pre-commit 文档推荐 Husky + lint-staged 处理 staged 文件，尤其适用于部分暂存场景。
- lint-staged 官方文档说明它会只对 staged 文件运行配置任务。
- Husky 官方文档建议使用 `.husky/` 中的 Git hook 文件管理本地 hook。

## 当前状态

- `package.json` 目前没有 `format` / `format:check` / `lint-staged` 脚本。
- `.husky/pre-commit` 已存在，但只委托到 `.husky/_/h`。
- `.husky/_/h` 当前实际会运行项目的 lint/typecheck hook 链。
- `phase-1-test-tooling-decision` 已让 `Invoke-QualityGate.ps1` 识别并运行 `test` script。
- 十诫第 4 条仍缺格式化工具保障：Tailwind 类名排序尚未自动执行。

## 决策

### 选择 Prettier 作为格式化器

用途：

- TypeScript / TSX / CSS / JSON / Markdown / YAML 文档格式化。
- 全量检查命令：`npm.cmd run format:check`。
- 手动修复命令：`npm.cmd run format`。

原因：

- Prettier 是格式化职责的事实标准，和 ESLint 分工清晰。
- 本项目已有 ESLint 9，不需要用 ESLint 承担通用格式化职责。
- Prettier 的 `--check` 能作为非破坏性门禁。

### 选择 prettier-plugin-tailwindcss 作为 Tailwind 类名排序器

用途：

- 自动排序 `className` 中 Tailwind class。
- 配置 `tailwindFunctions: ["cn", "clsx", "cva"]`，覆盖项目现有 `cn` helper 和常见 class 组合函数。

原因：

- 十诫明确要求 Tailwind 类名符合官方逻辑排序规则。
- 该插件由 Tailwind Labs 维护，避免项目自建排序规则。
- 可以和 Prettier 同一条命令运行，不额外增加开发者认知负担。

### 选择 lint-staged 作为 pre-commit 增量入口

用途：

- 只格式化 staged 文件，避免每次提交重写全仓文件。
- 与现有 Husky hook 链结合。

原因：

- 格式化全仓适合手动命令，不适合每次 pre-commit 自动执行。
- lint-staged 能保留用户的部分暂存工作流。

### 继续声明 Husky 为 devDependency

用途：

- 明确 `.husky/` hook 文件的维护工具来源。
- 便于后续环境重新安装后恢复 hook 维护能力。

原因：

- 当前仓库已有 `.husky/` 文件，但 `package.json` 未声明 `husky`，工具来源不透明。
- 将其列为 devDependency 是工具链完整性修复，不引入运行时影响。

## 拟审批依赖清单

> 当前记录为审批材料。`human approval: pending`。在获得明确人工批准前，禁止修改 `package.json`、`pnpm-lock.yaml` 或安装依赖。

| Package name | Version range | Change type | Purpose | Import boundary | Alternative considered | Rejection reason | Abandonment risk | Security or maintenance risk | Bundle or runtime impact | Validation command | Human approval evidence |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| `prettier` | `^3.8.3` | add devDependency | 全仓格式化与 `format:check` 门禁 | 仅 CLI、`.prettierrc.json`、`.prettierignore` | Biome formatter | Biome 会重叠 lint/format 策略并扩大迁移范围；Phase 1 只需格式化门禁 | 低 | 仅开发依赖，需避免格式化大规模无关文件 | 不进入生产 bundle | `npm.cmd run format:check` | human approval: pending |
| `prettier-plugin-tailwindcss` | `^0.8.0` | add devDependency | Tailwind class 官方排序 | 仅 Prettier plugin 配置 | eslint-plugin-tailwindcss | ESLint 插件更偏规则检查；十诫需要官方排序，Prettier 插件更直接 | 低 | 仅开发依赖，需关注 Tailwind/Prettier peer 兼容 | 不进入生产 bundle | `npm.cmd run format:check` | human approval: pending |
| `lint-staged` | `^17.0.4` | add devDependency | pre-commit 只处理 staged 文件 | 仅 package script 和 lint-staged 配置 | 每次 pre-commit 全仓 `prettier --write .` | 全仓写入会制造无关 diff，影响并行任务 | 低 | 仅开发依赖，需避免配置命令产生循环暂存问题 | 不进入生产 bundle | `npm.cmd run lint-staged -- --help` | human approval: pending |
| `husky` | `^9.1.7` | add devDependency | 声明现有 `.husky/` hook 工具来源 | 仅 Git hook 管理 | 保留 hook 文件但不声明依赖 | 工具来源不透明，新环境维护成本高 | 低 | 仅开发依赖，hook 命令必须保持可审计 | 不进入生产 bundle | `npm.cmd run prepare` | human approval: pending |

## 后续落地文件边界

获得 human approval 后，后续实施任务才允许修改：

- `package.json`
- `pnpm-lock.yaml`
- `.prettierrc.json`
- `.prettierignore`
- `.husky/pre-commit`
- `docs/05-execution-logs/evidence/2026-05-16-phase-1-formatting-gate-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

当前任务不修改 package、lockfile、源码或 hook 文件。

## 推荐配置

审批通过后添加脚本：

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint-staged": "lint-staged",
    "prepare": "husky"
  }
}
```

审批通过后创建 `.prettierrc.json`：

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn", "clsx", "cva"]
}
```

审批通过后创建 `.prettierignore`：

```text
node_modules
.next
out
build
coverage
playwright-report
test-results
.worktrees
.agent
.omx
archive
pnpm-lock.yaml
```

审批通过后建议的 `lint-staged` 配置：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,mjs,cjs,json,css,md,yml,yaml}": "prettier --write --ignore-unknown",
    "*.{js,jsx,ts,tsx,mjs,cjs}": "eslint --fix"
  }
}
```

审批通过后建议 `.husky/pre-commit` 执行顺序：

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/h"

npm run lint-staged
npm run lint
npm run typecheck
```

不在 pre-commit 默认运行 Playwright E2E，避免每次提交启动浏览器；完整 `test` 继续由 `Invoke-QualityGate.ps1` 执行。

## 实施任务拆分

### Task 1: 审批确认

**Files:**
- Modify: `docs/05-execution-logs/task-plans/2026-05-16-phase-1-formatting-gate-decision.md`
- Modify: `docs/05-execution-logs/evidence/2026-05-16-phase-1-formatting-gate-decision.md`

- [ ] **Step 1: 等待人工审批**

需要用户明确回复同意引入上表 devDependencies。审批证据必须包含 `human approval` 字样。

- [ ] **Step 2: 若审批被拒绝，记录替代路线**

保留当前 lint/typecheck/test 门禁，不修改 package 文件；十诫第 4 条继续标记为工具门禁缺失。

### Task 2: 依赖与配置落地

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `.husky/pre-commit`

- [ ] **Step 1: 安装已批准依赖**

Run after approval:

```powershell
corepack pnpm@10 add -D prettier prettier-plugin-tailwindcss lint-staged husky
```

Expected: `package.json` and `pnpm-lock.yaml` change only for approved devDependencies.

- [ ] **Step 2: 添加格式化脚本与 lint-staged 配置**

Modify `package.json` using the script and `lint-staged` snippets from this plan.

- [ ] **Step 3: 添加 Prettier 配置**

Create `.prettierrc.json` and `.prettierignore` using the exact snippets from this plan.

- [ ] **Step 4: 更新 pre-commit hook**

Modify `.husky/pre-commit` using the exact snippet from this plan.

### Task 3: 验证门禁

**Files:**
- Modify: `docs/05-execution-logs/evidence/2026-05-16-phase-1-formatting-gate-decision.md`

- [ ] **Step 1: 运行格式化检查**

Run:

```powershell
npm.cmd run format:check
```

Expected: Pass, or report exact files needing one-time formatting.

- [ ] **Step 2: 运行完整质量门禁**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Expected: lint、typecheck、test 均通过。

- [ ] **Step 3: 运行 hook smoke test**

Run:

```powershell
& 'C:\Program Files\Git\bin\sh.exe' '.husky/_/pre-commit'
```

Expected: lint-staged 在无 staged 文件时正常退出；lint 和 typecheck 通过。

## 风险防御

- 不在审批前修改 package 或 lockfile。
- 不默认在 pre-commit 运行 E2E，避免浏览器启动影响提交体验。
- `.prettierignore` 排除构建产物、worktree、agent 缓存和 lockfile，避免格式化污染。
- Prettier 首次落地可能发现历史文件格式差异；若差异较大，应独立记录一次格式化变更，不混入业务代码。
- Tailwind 排序覆盖 `className` 和 `cn`/`clsx`/`cva`，但不承诺识别任意动态字符串。

## 当前状态

- Formatting gate decision: recommended.
- Dependency installation: not started.
- `human approval`: pending.
- Package and lockfile changes: none.
