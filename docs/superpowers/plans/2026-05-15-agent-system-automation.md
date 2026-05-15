# Agent System Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 0 architecture freeze and automation control layer for cross-session, standards-driven Tiku project automation.

**Architecture:** The automation layer is document-first and state-driven. ADRs freeze runtime architecture, SOPs define agent behavior, YAML files hold project and task cursors, and PowerShell scripts inspect state, generate templates, update queue status, create failure reports, and run available local quality gates.

**Tech Stack:** Markdown ADR/SOP files, YAML state files, PowerShell scripts, Next.js/TypeScript project gates, Git, Prettier, existing `package.json` scripts.

---

## File Structure

- Create: `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
  - Runtime architecture, multi-client boundary, REST API contract.
- Create: `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
  - Workplace desktop Web compatibility boundary.
- Create: `docs/02-architecture/interfaces/global-db-api-skeleton.md`
  - Global entity, ID, API, and cross-module consistency skeleton.
- Create: `docs/04-agent-system/sop/automation-loop.md`
  - Cross-session automation loop SOP.
- Create: `docs/04-agent-system/sop/skill-dispatch-matrix.md`
  - Skill usage matrix.
- Create: `docs/04-agent-system/sop/dependency-introduction-gate.md`
  - Dependency approval SOP.
- Create: `docs/04-agent-system/state/project-state.yaml`
  - Project-level state cursor.
- Create: `docs/04-agent-system/state/task-queue.yaml`
  - Task queue and retry registry.
- Create: `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
  - MVP phase roadmap.
- Create: `scripts/agent-system/Read-ProjectState.ps1`
  - Reads and prints the current project state.
- Create: `scripts/agent-system/Test-AgentSystemReadiness.ps1`
  - Checks required files, quality scripts, ignore boundaries, and installed skills.
- Create: `scripts/agent-system/New-TaskPlan.ps1`
  - Generates a task plan template from a task id.
- Create: `scripts/agent-system/Update-TaskStatus.ps1`
  - Updates task queue status.
- Create: `scripts/agent-system/New-FailureReport.ps1`
  - Creates failure reports for blocked tasks.
- Create: `scripts/agent-system/Invoke-QualityGate.ps1`
  - Runs available local quality gates and reports missing gates.
- Modify: `package.json`
  - Add `typecheck`; add test scripts only after test tooling is selected.
- Modify: `.husky/pre-commit`
  - Add typecheck gate once `typecheck` exists.
- Modify: `tsconfig.json`
  - Exclude agent/tooling/documentation areas from TypeScript scanning.
- Modify: `eslint.config.mjs`
  - Ignore agent/tooling/documentation areas that are not source code.

## Task 1: Runtime Architecture ADR

**Files:**

- Create: `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`

- [ ] **Step 1: Write ADR-002**

  Required content:
  - Title: `ADR-002: Runtime Architecture and Multi-Client Contract`
  - Status: `Accepted`
  - Date: `2026-05-15`
  - Related ADR: `adr-001-tech-stack-selection.md`
  - Context: Tiku is a Next.js and TypeScript monolith; Web is first client; future WeChat Mini Program needs a stable REST API boundary; Server Actions alone are insufficient for non-Web clients.
  - Decision: use `api/actions -> service -> repository -> model`.
  - Rules:
    - `src/app/api/v1/*` exposes REST route handlers for external clients.
    - Server Actions may be used by Web interactions only as thin wrappers.
    - Business logic belongs in `src/server/services`.
    - Database access belongs in `src/server/repositories`.
    - Drizzle schema and database model definitions belong in `src/server/models`.
    - Shared validation and DTO mapping stay server-side.
  - API contract:
    - API paths use `/api/v1/`.
    - Paths use kebab-case plural nouns.
    - JSON fields use camelCase.
    - Responses use `{ code, message, data, pagination? }`.
    - Optional fields return `null`.
    - Empty lists return `[]`.
    - Pagination uses `page`, `pageSize`, `sortBy`, and `sortOrder`.
    - External URLs do not expose auto-increment primary keys.
  - Consequences:
    - Web and mini program clients share services.
    - API and Server Actions remain thin shells.
    - More files are required than pure Server Actions, but future multi-client work is protected.

- [ ] **Step 2: Validate ADR-002 exists**

  Run:

  ```powershell
  Test-Path 'docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md'
  ```

  Expected: `True`

- [ ] **Step 3: Check for conflicting API wording**

  Run:

  ```powershell
  Select-String -Path 'docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md' -Pattern 'Server Actions only|no REST|without API'
  ```

  Expected: no matches.

- [ ] **Step 4: Commit ADR-002**

  Run:

  ```powershell
  git add -- docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md
  git commit -m "docs(architecture): add multi-client runtime adr"
  ```

## Task 2: Workplace Desktop Compatibility ADR

**Files:**

- Create: `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`

- [ ] **Step 1: Write ADR-003**

  Required content:
  - Title: `ADR-003: Workplace Desktop Web Compatibility`
  - Status: `Accepted`
  - Date: `2026-05-15`
  - Context: users may access Tiku from workplace desktop computers inside tobacco organizations; current scope does not require strict Xinchuang certification.
  - Decision: target workplace desktop Web compatibility, not strict Xinchuang certification.
  - The project will:
    - Prioritize reliable access from ordinary workplace desktop browsers.
    - Keep pages efficient for lower-spec office machines.
    - Avoid unnecessary browser experimental APIs.
    - Avoid frontend designs that require heavy GPU or animation workloads.
    - Preserve a deployable Web architecture for private or internal networks.
  - The project will not:
    - Require domestic database certification in MVP.
    - Require domestic OS or CPU certification in MVP.
    - Replace PostgreSQL solely for Xinchuang labeling.
    - Claim procurement compliance without customer-specific review.
  - Consequences:
    - Product needs and maintainability stay primary.
    - Browser compatibility and performance are quality concerns.
    - Strict compliance, if requested by a customer, gets a separate ADR.

- [ ] **Step 2: Validate ADR-003 exists**

  Run:

  ```powershell
  Test-Path 'docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md'
  ```

  Expected: `True`

- [ ] **Step 3: Check for overclaiming compliance**

  Run:

  ```powershell
  Select-String -Path 'docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md' -Pattern 'certified|已认证|完全符合|采购合规'
  ```

  Expected: no claims that Tiku is already certified or procurement-compliant.

- [ ] **Step 4: Commit ADR-003**

  Run:

  ```powershell
  git add -- docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md
  git commit -m "docs(architecture): add workplace desktop compatibility adr"
  ```

## Task 3: Global DB/API Skeleton

**Files:**

- Create directory: `docs/02-architecture/interfaces`
- Create: `docs/02-architecture/interfaces/global-db-api-skeleton.md`

- [ ] **Step 1: Create interfaces directory**

  Run:

  ```powershell
  New-Item -ItemType Directory -Force -Path 'docs\02-architecture\interfaces'
  ```

  Expected: directory exists.

- [ ] **Step 2: Write global skeleton**

  Required content:
  - Title: `Global DB/API Skeleton`
  - Status: `Draft for Phase 0`
  - Purpose: define the global data and API skeleton before module-level implementation.
  - Core entities:
    - `user`, `student`, `admin`, `organization`, `employee`
    - `redeem_code`, `authorization`, `personal_auth`, `org_auth`
    - `profession`, `level`, `subject`
    - `question`, `question_option`, `material`, `question_group`
    - `paper`, `paper_section`, `paper_asset`
    - `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`
    - `knowledge_node`, `knowledge_base`, `resource`, `chunk`, `embedding`, `citation`
    - `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`
    - `model_provider`, `model_config`, `prompt_template`
    - `audit_log`, `ai_call_log`
  - ID strategy:
    - internal database primary key is `id`
    - external API route identifiers use `public_id` in DB and `publicId` in JSON
    - external URLs do not expose internal `id`
  - API response examples:
    - success: `{ "code": 0, "message": "ok", "data": {} }`
    - paginated success includes `pagination`
    - error: `{ "code": 400001, "message": "Invalid request.", "data": null }`
  - Cross-module rules:
    - published papers are immutable
    - published paper questions use snapshots
    - mock exam reports store snapshots
    - repeated AI scoring is idempotent
    - RAG citations are not fabricated
    - critical admin operations write audit logs
  - Module design order:
    - `user-auth`
    - `question-paper`
    - `student-experience`
    - `ai-scoring`
    - `rag-knowledge`
    - `admin-ops`

- [ ] **Step 3: Validate terminology**

  Run:

  ```powershell
  Select-String -Path 'docs\02-architecture\interfaces\global-db-api-skeleton.md' -Pattern 'license|exam_paper'
  ```

  Expected: no matches.

- [ ] **Step 4: Commit global skeleton**

  Run:

  ```powershell
  git add -- docs/02-architecture/interfaces/global-db-api-skeleton.md
  git commit -m "docs(architecture): add global db api skeleton"
  ```

## Task 4: Automation SOP Documents

**Files:**

- Create: `docs/04-agent-system/sop/automation-loop.md`
- Create: `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- Create: `docs/04-agent-system/sop/dependency-introduction-gate.md`

- [ ] **Step 1: Write automation-loop.md**

  Required content:
  - Startup read order:
    - `AGENTS.md`
    - `docs/03-standards/code-taste-ten-commandments.md`
    - `docs/02-architecture/adr/`
    - `docs/04-agent-system/state/project-state.yaml`
    - `docs/04-agent-system/state/task-queue.yaml`
  - Readiness command: `.\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Task claiming rules:
    - task status is `pending`
    - dependencies are `done`
    - high-risk items have approval
    - branch is not `main` or `master`
  - Execution sequence:
    - generate or update task plan
    - perform scoped edit
    - run available gates
    - write evidence
    - commit successful work
    - update queue and project state
  - Failure fuse:
    - maximum three failures per task
    - mark blocked on third failure
    - write failure report
    - stop loop

- [ ] **Step 2: Write skill-dispatch-matrix.md**

  Required content:
  - Immediate skills:
    - `superpowers:brainstorming`
    - `superpowers:writing-plans`
    - `superpowers:executing-plans`
    - `superpowers:test-driven-development`
    - `superpowers:systematic-debugging`
    - `superpowers:verification-before-completion`
    - `superpowers:requesting-code-review`
  - Installed skills requiring Codex restart:
    - `ralplan`, `ralph`, `autopilot`, `code-review`, `code-simplifier`
    - `drizzle-orm-expert`, `postgresql`, `postgres-best-practices`
    - `nextjs-app-router-patterns`, `nextjs-best-practices`, `react-nextjs-development`
    - `shadcn`, `tailwind-design-system`, `tailwind-patterns`
    - `vercel-ai-sdk-expert`, `rag-engineer`, `rag-implementation`
    - `playwright-skill`, `webapp-testing`, `e2e-testing`
    - `tdd-orchestrator`, `tdd-workflow`, `testing-patterns`
  - Dispatch rules:
    - architecture planning uses brainstorming/writing plans/ralplan/design
    - DB uses Drizzle/Postgres skills
    - auth uses auth implementation patterns
    - UI uses shadcn/Tailwind/React/Next.js skills
    - AI/RAG uses Vercel AI SDK and RAG skills
    - cleanup uses code-simplifier followed by gates
    - autonomous loop uses `ralplan -> ralph -> code-review`
    - `autopilot` is reserved for a stronger mechanism version

- [ ] **Step 3: Write dependency-introduction-gate.md**

  Required content:
  - Adding, removing, or upgrading a dependency requires human approval.
  - Every dependency plan records package name, version range, purpose, import boundary, alternative considered, abandonment risk, and validation command.
  - Business-contract dependencies are wrapped behind project-owned modules.
  - Third-party naming stays inside adapters; project-facing names follow `glossary.yaml`.

- [ ] **Step 4: Validate SOP files exist**

  Run:

  ```powershell
  Test-Path 'docs\04-agent-system\sop\automation-loop.md'
  Test-Path 'docs\04-agent-system\sop\skill-dispatch-matrix.md'
  Test-Path 'docs\04-agent-system\sop\dependency-introduction-gate.md'
  ```

  Expected: three `True` lines.

- [ ] **Step 5: Commit SOP files**

  Run:

  ```powershell
  git add -- docs/04-agent-system/sop/automation-loop.md docs/04-agent-system/sop/skill-dispatch-matrix.md docs/04-agent-system/sop/dependency-introduction-gate.md
  git commit -m "docs(agent): add automation sops"
  ```

## Task 5: State, Queue, and Roadmap

**Files:**

- Create: `docs/04-agent-system/state/project-state.yaml`
- Create: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/04-agent-system/milestones-goals/mvp-roadmap.md`

- [ ] **Step 1: Create state directory**

  Run:

  ```powershell
  New-Item -ItemType Directory -Force -Path 'docs\04-agent-system\state'
  ```

  Expected: directory exists.

- [ ] **Step 2: Write project-state.yaml**

  Required top-level keys:
  - `schemaVersion: 1`
  - `project`
    - `name: tiku`
    - `currentPhase: phase-0-architecture-freeze`
    - `updatedAt`
  - `architecture`
    - required files for ADR-002, ADR-003, and global DB/API skeleton
  - `automation`
    - `mode: semi_auto`
    - `gitBoundary: draft_pr`
    - `approvalPolicy: high_risk_only`
    - `maxRetryPerTask: 3`
    - branch policy with protected `main` and `master`
  - `taskSource`
    - `requirementsPath: docs/01-requirements/stories`
    - `queueStrategy: story_to_verifiable_units`
  - `taskRegistry`
    - path to `task-queue.yaml`
  - `currentTask`
    - idle values for id, status, sourceStory, planPath, evidencePath, branch, commitSha, prUrl, retryCount, lastFailurePath
  - `qualityGates`
    - desired gates: lint, typecheck, test, build_when_relevant
    - available gates: lint
  - `riskGates`
    - high-risk approval list
  - `skills`
    - dispatch matrix path
  - `handoff`
    - `nextRecommendedAction: complete_phase_0_architecture_freeze`

- [ ] **Step 3: Write task-queue.yaml**

  Required initial tasks:
  - `phase-0-adr-runtime-architecture`
  - `phase-0-adr-workplace-desktop`
  - `phase-0-global-db-api-skeleton`
  - `phase-0-automation-sops`
  - `phase-0-state-and-roadmap`
  - `phase-0-script-skeleton`
  - `phase-0-local-gates`
  - `phase-0-evidence`

  Each task includes:
  - `id`
  - `title`
  - `phase`
  - `sourceStory`
  - `dependencies`
  - `allowedFiles`
  - `blockedFiles`
  - `riskTypes`
  - `validationCommands`
  - `evidencePath`
  - `status: pending`
  - `retryCount: 0`

- [ ] **Step 4: Write mvp-roadmap.md**

  Required phases:
  - Phase 0: architecture freeze
  - Phase 1: foundation
  - Phase 2: user auth
  - Phase 3: question paper
  - Phase 4: student experience
  - Phase 5: AI/RAG
  - Phase 6: admin ops

  Each phase lists its primary deliverables and dependency on prior phases.

- [ ] **Step 5: Validate state and roadmap files exist**

  Run:

  ```powershell
  Test-Path 'docs\04-agent-system\state\project-state.yaml'
  Test-Path 'docs\04-agent-system\state\task-queue.yaml'
  Test-Path 'docs\04-agent-system\milestones-goals\mvp-roadmap.md'
  ```

  Expected: three `True` lines.

- [ ] **Step 6: Commit state and roadmap files**

  Run:

  ```powershell
  git add -- docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/milestones-goals/mvp-roadmap.md
  git commit -m "docs(agent): add automation state and roadmap"
  ```

## Task 6: PowerShell Script Skeleton

**Files:**

- Create directory: `scripts/agent-system`
- Create: `scripts/agent-system/Read-ProjectState.ps1`
- Create: `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- Create: `scripts/agent-system/New-TaskPlan.ps1`
- Create: `scripts/agent-system/Update-TaskStatus.ps1`
- Create: `scripts/agent-system/New-FailureReport.ps1`
- Create: `scripts/agent-system/Invoke-QualityGate.ps1`

- [ ] **Step 1: Create script directory**

  Run:

  ```powershell
  New-Item -ItemType Directory -Force -Path 'scripts\agent-system'
  ```

  Expected: directory exists.

- [ ] **Step 2: Create Read-ProjectState.ps1**

  Required behavior:
  - Set `$ErrorActionPreference = "Stop"`.
  - Read `docs\04-agent-system\state\project-state.yaml`.
  - Throw if the file is missing.
  - Print the state path.
  - Print current phase.
  - Print current task id.
  - Print next recommended action.

- [ ] **Step 3: Create Test-AgentSystemReadiness.ps1**

  Required behavior:
  - Set `$ErrorActionPreference = "Stop"`.
  - Check required ADR, skeleton, SOP, state, and queue files.
  - Check `package.json` for `lint`, `typecheck`, and `test` scripts.
  - Check installed skills under `C:\Users\laozhuang\.codex\skills`.
  - Print that newly installed skills require restarting Codex.

- [ ] **Step 4: Create New-TaskPlan.ps1**

  Required behavior:
  - Accept mandatory `$TaskId`.
  - Generate `docs\05-execution-logs\task-plans\YYYY-MM-DD-$TaskId.md`.
  - Throw if the target plan exists.
  - Write a plan with read standards, scope, risk gate, validation commands, and evidence section.
  - Print the created path.

- [ ] **Step 5: Create Update-TaskStatus.ps1**

  Required behavior:
  - Accept mandatory `$TaskId`.
  - Accept `$Status` with values `pending`, `in_progress`, `blocked`, `done`.
  - Read `docs\04-agent-system\state\task-queue.yaml`.
  - Find the matching task id.
  - Update only that task's `status` line.
  - Print the updated task id and status.

- [ ] **Step 6: Create New-FailureReport.ps1**

  Required behavior:
  - Accept mandatory `$TaskId`.
  - Accept mandatory `$Reason`.
  - Create `docs\06-issue-tracking\bug-reports\YYYY-MM-DD-$TaskId.md`.
  - Include reason, required human decision, and related state paths.
  - Print the created path.

- [ ] **Step 7: Create Invoke-QualityGate.ps1**

  Required behavior:
  - Read `package.json`.
  - For `lint`, `typecheck`, and `test`, run the script only if it exists.
  - Print `MISSING npm script: <name>` for missing scripts.
  - Use `npm.cmd run <name>` so it works in the current Windows shell.

- [ ] **Step 8: Validate scripts parse**

  Run:

  ```powershell
  Get-ChildItem -Path 'scripts\agent-system' -Filter '*.ps1' | ForEach-Object {
    $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $_.FullName -Raw), [ref]$null)
    Write-Output "Parsed $($_.Name)"
  }
  ```

  Expected: each script prints `Parsed <name>`.

- [ ] **Step 9: Commit scripts**

  Run:

  ```powershell
  git add -- scripts/agent-system
  git commit -m "feat(agent): add automation script skeleton"
  ```

## Task 7: Local Gate Configuration

**Files:**

- Modify: `package.json`
- Modify: `.husky/pre-commit`
- Modify: `tsconfig.json`
- Modify: `eslint.config.mjs`

- [ ] **Step 1: Add typecheck script**

  In `package.json`, add:

  ```json
  "typecheck": "tsc --noEmit"
  ```

  Keep existing scripts intact.

- [ ] **Step 2: Defer test script until test tooling is selected**

  Do not add `test` or `test:e2e` scripts in this task unless test dependencies have been approved and installed.

- [ ] **Step 3: Update pre-commit hook**

  Modify `.husky/pre-commit` to run:

  ```sh
  pnpm exec lint-staged
  pnpm run typecheck
  ```

  If the hook fails because `pnpm` is unavailable in Git hook context, stop and record the failure before changing package manager policy.

- [ ] **Step 4: Update tsconfig exclude**

  Add these exclude entries while preserving existing entries:

  ```json
  ".agent",
  ".omx",
  "archive",
  "docs/05-execution-logs",
  "docs/06-issue-tracking"
  ```

- [ ] **Step 5: Update eslint ignores**

  Add these entries to `globalIgnores`:

  ```typescript
  ".agent/**",
  ".omx/**",
  "archive/**",
  "docs/05-execution-logs/**",
  "docs/06-issue-tracking/**",
  ```

- [ ] **Step 6: Run typecheck**

  Run:

  ```powershell
  npm.cmd run typecheck
  ```

  Expected: TypeScript check passes.

- [ ] **Step 7: Run lint**

  Run:

  ```powershell
  npm.cmd run lint
  ```

  Expected: ESLint passes or reports only pre-existing issues. If pre-existing issues appear, record them and keep the gate honest.

- [ ] **Step 8: Commit gate configuration**

  Run:

  ```powershell
  git add -- package.json .husky/pre-commit tsconfig.json eslint.config.mjs
  git commit -m "chore(agent): tighten local automation gates"
  ```

## Task 8: Final Validation and Evidence

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-15-phase-0-agent-system.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] **Step 1: Run readiness check**

  Run:

  ```powershell
  .\scripts\agent-system\Test-AgentSystemReadiness.ps1
  ```

  Expected: required files print `OK file`. A missing `test` script is acceptable until test tooling is selected.

- [ ] **Step 2: Run quality gate script**

  Run:

  ```powershell
  .\scripts\agent-system\Invoke-QualityGate.ps1
  ```

  Expected: existing scripts run; missing scripts are reported explicitly.

- [ ] **Step 3: Create evidence document**

  Required content:
  - Title: `Evidence: Phase 0 Agent System`
  - Date: `2026-05-15`
  - Files created summary.
  - Commands run.
  - Command outputs.
  - Any missing gates.
  - Next recommended action.

- [ ] **Step 4: Update project state**

  In `docs/04-agent-system/state/project-state.yaml`:
  - Set `architecture.status` to `complete`.
  - Set each `requiredBeforeAutomation` item to `complete`.
  - Set `handoff.lastSummaryPath` to `docs/05-execution-logs/evidence/2026-05-15-phase-0-agent-system.md`.
  - Set `handoff.nextRecommendedAction` to `start_phase_1_foundation`.

- [ ] **Step 5: Update task queue statuses**

  In `docs/04-agent-system/state/task-queue.yaml`, set completed Phase 0 task statuses to `done`.

- [ ] **Step 6: Commit evidence and state**

  Run:

  ```powershell
  git add -- docs/05-execution-logs/evidence/2026-05-15-phase-0-agent-system.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
  git commit -m "docs(agent): record phase 0 automation evidence"
  ```

## Self-Review Checklist

- Spec coverage: This plan covers ADR-002, ADR-003, global DB/API skeleton, SOPs, state files, queue files, roadmap, script skeleton, local gate planning, validation, and evidence.
- Incomplete marker scan: The plan avoids incomplete sections and vague deferred-work steps.
- Type consistency: File paths and task IDs are consistent across state, queue, scripts, and evidence.
- Risk gates: Dependency additions, migrations, permission changes, destructive actions, deployment, and PR merge remain approval-gated.
- Verification: Each task has a validation command and commit step.
