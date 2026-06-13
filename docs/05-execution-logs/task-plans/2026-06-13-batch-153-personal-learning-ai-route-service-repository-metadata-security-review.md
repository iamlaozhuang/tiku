# Batch 153 Security Review Plan

> **For agentic workers:** REQUIRED PROJECT RULES: read `AGENTS.md`,
> `docs/03-standards/code-taste-ten-commandments.md`, all ADRs under `docs/02-architecture/adr/`, project state,
> task queue, and recent evidence/audits before editing.

**Goal:** Review whether route/service/repository metadata ownership is closed after batch-152.

**Architecture:** This is a docs-only/read-only security review. It reviews the batch-152 diff and supporting
route/service/repository/mapper files without editing product code, then records findings, evidence, and blocked
remainders.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, Vitest, Module Run v2 governance scripts.

---

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-153-personal-learning-ai-route-service-repository-metadata-security-review.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-153-personal-learning-ai-route-service-repository-metadata-security-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-153-personal-learning-ai-route-service-repository-metadata-security-review.md`

Blocked files and actions:

- No product source edits, tests/e2e edits, schema/migration, dependency/package/lockfile changes, env/secret work,
  provider calls, local provider sandbox, generated-content writes, formal content adoption, deploy, payment,
  external-service, PR, force-push, or Cost Calibration work.

## Review Steps

### Task 1: Baseline and Inputs

- [x] **Step 1: Run pre-edit readiness**

Run:
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

Expected: clean short branch from `master`.

- [x] **Step 2: Review batch-152 diff**

Run:

```powershell
git show --stat --oneline 4d3f85ed
git show --format= -- src/server/repositories/personal-ai-generation-request-repository.ts src/server/repositories/personal-ai-generation-request-repository.test.ts
```

Expected: review is limited to changed repository hardening and supporting tests.

### Task 2: Boundary Review

- [x] **Step 1: Review route ownership controls**

Confirm `createRequestInputWithUserContext` binds actor/owner/quota owner to the resolved session user and
`createServerOwnedLocalBrowserRequestInput` clears pending result/evidence/reference metadata before persistence.

- [x] **Step 2: Review repository persistence controls**

Confirm `createOrReuseRequest` checks owner-scoped idempotency first, preserves reused repository-owned rows, and forces
server-owned pending metadata before new insert.

- [x] **Step 3: Review DTO redaction controls**

Confirm mapper/history/local browser output exposes public ids, status, evidence summary, citation count, and redaction
status without internal ids, raw provider payloads, generated content, secrets, or tokens.

### Task 3: Evidence and Validation

- [x] **Step 1: Record evidence and audit**

Create batch-153 evidence and audit files with `RED:` and `GREEN:` anchors, findings, and blocked remainders.

- [ ] **Step 2: Run declared validation commands**

Run:

```powershell
git diff --check
Select-String -Path docs/05-execution-logs/evidence/2026-06-13-batch-153-personal-learning-ai-route-service-repository-metadata-security-review.md,docs/05-execution-logs/audits-reviews/2026-06-13-batch-153-personal-learning-ai-route-service-repository-metadata-security-review.md -Pattern 'route/service/repository','server-owned pending metadata','public ids only','Cost Calibration Gate remains blocked'
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-153-personal-learning-ai-route-service-repository-metadata-security-review
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-153-personal-learning-ai-route-service-repository-metadata-security-review
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-153-personal-learning-ai-route-service-repository-metadata-security-review
```

Expected: all pass.

## Risk Controls

- The full Codex Security diff-scan artifact workflow is not used because it would write outside batch-153 allowedFiles.
- Product source review remains read-only and scoped to route/service/repository metadata ownership.
- Provider/env/dependency/schema/e2e/deploy/payment/external-service and Cost Calibration surfaces remain blocked.
