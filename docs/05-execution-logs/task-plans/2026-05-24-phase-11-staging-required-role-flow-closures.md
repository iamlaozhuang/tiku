# Phase 11 Staging Required Role Flow Closures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make "system ops" and "content ops" explicit required local validation roles for staging entry, then discover, record, analyze, and fix local dev role-flow blockers without touching staging/prod.

**Architecture:** Keep this task inside the existing Next.js admin frontend and test surfaces. Reuse current admin ops and content ops components; do not add dependencies, schema, migrations, scripts, packages, lockfiles, secrets, or environment files.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Playwright, existing shadcn/Tailwind UI.

---

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Boundaries

- No direct development on `master`.
- No `.env.local` read or output.
- No staging/prod connection.
- No deployment or cloud resource change.
- No package, lockfile, dependency, schema, migration, or script change.
- Evidence must not include secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, complete paper/material/OCR content, or private customer-like data.

## Required Staging Role Experience Arrangement

### System Ops

Required local dev validation path:

1. Open admin ops entry and confirm system ops can discover user, organization, org auth, and redeem code operations.
2. Open `/ops/redeem-codes` and verify the role can discover how to generate a redeem code from the redeem code management context.
3. Open `/ops/organizations` and verify the role can discover how to create or request a new org auth from the enterprise authorization context.
4. Verify unavailable or blocked actions explain the reason, owner, and next safe action.

Known hypothesis from user feedback:

- P1: redeem code generation is not discoverable from the redeem code page.
- P1: adding enterprise authorization is not discoverable from the organization page.

### Content Ops

Required local dev validation path:

1. Open content questions, materials, papers, and knowledge nodes.
2. Verify question, material, and paper actions either complete locally or show explicit closed-loop status with reason and next owner.
3. Verify knowledge node operations remain usable as the write-capable content ops path.
4. Verify content ops has a staging acceptance checklist that separates read/filter validation from write-capable validation.

Known hypothesis from prior Phase 11 work:

- P2: content ops has improved action closures, but staging-required role guidance may still be implicit rather than a clear validation arrangement.

## Planned Files

- Modify `docs/04-agent-system/state/task-queue.yaml`: task registration and status.
- Modify `docs/04-agent-system/state/project-state.yaml`: current task and handoff.
- Create `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-required-role-flow-closures.md`: this plan.
- Create `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-required-role-flow-closures.md`: findings, severity, analysis, and staging decision.
- Create `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-required-role-flow-closures.md`: sanitized command and browser verification evidence.
- Modify `tests/unit/admin-user-org-auth-ops-baseline.test.ts`: system ops discoverability tests.
- Modify `tests/unit/admin-content-knowledge-ops-baseline.test.ts`: content ops required-role validation tests.
- Modify or create `e2e/staging-required-role-flows.spec.ts`: browser-level local role-flow checks.
- Modify existing files under `src/app/(admin)/ops/**`, `src/app/(admin)/content/**`, and `src/features/admin/**` only as required by failing tests.

## Task 1: Claim Gate

- [ ] **Step 1: Run task claim readiness**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-required-role-flow-closures
```

Expected: PASS for branch, state, queue, plan, allowedFiles, and blockedFiles.

## Task 2: System Ops RED Tests

- [ ] **Step 1: Add failing unit tests**

Add tests that assert:

- `/ops/redeem-codes` context exposes a "generate redeem code" action or a clear action route.
- `/ops/organizations` context exposes a "new org auth" action or a clear action route.

- [ ] **Step 2: Verify RED**

Run:

```powershell
npm.cmd run test:unit -- --run tests/unit/admin-user-org-auth-ops-baseline.test.ts
```

Expected: FAIL because the required system ops entry points are missing or implicit.

## Task 3: System Ops GREEN Implementation

- [ ] **Step 1: Implement minimal system ops fixes**

Reuse existing org auth and redeem code UI patterns. Add discoverable, non-secret actions in the relevant ops pages without changing backend schema or dependencies.

- [ ] **Step 2: Verify GREEN**

Run:

```powershell
npm.cmd run test:unit -- --run tests/unit/admin-user-org-auth-ops-baseline.test.ts
```

Expected: PASS.

## Task 4: Content Ops RED Tests

- [ ] **Step 1: Add failing unit tests**

Add tests that assert content ops displays an explicit staging-required role validation arrangement:

- knowledge node write path is named as the write-capable validation path;
- question/material/paper paths identify read/filter validation and explicit unavailable-write status;
- no user is left without a next action.

- [ ] **Step 2: Verify RED**

Run:

```powershell
npm.cmd run test:unit -- --run tests/unit/admin-content-knowledge-ops-baseline.test.ts
```

Expected: FAIL because the required content ops staging validation arrangement is not explicit enough.

## Task 5: Content Ops GREEN Implementation

- [ ] **Step 1: Implement minimal content ops fixes**

Add or refine existing content ops role guidance and action closures. Do not implement new database-backed content authoring if it requires schema, migration, dependency, or API changes outside allowed files.

- [ ] **Step 2: Verify GREEN**

Run:

```powershell
npm.cmd run test:unit -- --run tests/unit/admin-content-knowledge-ops-baseline.test.ts
```

Expected: PASS.

## Task 6: Browser Role-Flow Verification

- [ ] **Step 1: Add e2e coverage**

Add a local Playwright spec tagged with "staging required role flows" that visits the system ops and content ops pages and verifies the required entry points are visible.

- [ ] **Step 2: Run e2e**

Run:

```powershell
npm.cmd run test:e2e -- --grep "staging required role flows"
```

Expected: PASS in local dev.

## Task 7: Findings, Evidence, and Gates

- [ ] **Step 1: Write audit review**

Record all discovered issues with P0/P1/P2/P3 severity, root cause, fix status, residual risk, and `stagingDecision`.

- [ ] **Step 2: Run required validation**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-required-role-flow-closures
docker compose ps
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

- [ ] **Step 3: Write evidence**

Record sanitized command results and the local-only boundary.

## Task 8: Close, Commit, Merge, Push

- [ ] **Step 1: Close state**

Update `project-state.yaml` and `task-queue.yaml` to `closed` after evidence is complete.

- [ ] **Step 2: Commit**

Commit this task as one reviewable commit.

- [ ] **Step 3: Merge and push**

Switch to `master`, merge the task branch, run necessary master gates, push `origin/master`, and delete the merged short-lived branch.

## Self-Review

- Spec coverage: covers system ops and content ops as staging-required roles; includes planning, issue discovery, recording, analysis, fix, evidence, and git closeout.
- Placeholder scan: no TBD/TODO/fill-in-later placeholders.
- Type consistency: uses existing project terms `redeem_code`, `org_auth`, `content`, `system ops`, and `staging`.
