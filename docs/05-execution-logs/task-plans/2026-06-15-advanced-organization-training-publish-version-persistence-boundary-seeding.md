# Advanced Organization Training Publish Version Persistence Boundary Seeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed a docs-only pending planning task for organization training publish-version persistence boundaries after the authorization-lineage readonly recheck.

**Architecture:** Preserve ADR-002 layering and keep this task outside product runtime code. The current service-local publish-version write carries authorization lineage, while repository, schema, route, and durable persistence remain unimplemented until a separately approved planning and implementation path exists.

**Tech Stack:** Markdown/YAML project state, Module Run v2 closeout scripts, existing Vitest scoped unit coverage, no new dependency.

---

## Required Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-authorization-lineage-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-authorization-lineage-readonly-recheck.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## File Structure

- Modify: `docs/04-agent-system/state/project-state.yaml`
  - Record this docs-only seeding task as the current closed task.
  - Point handoff to the new pending persistence-boundary planning task.
- Modify: `docs/04-agent-system/state/task-queue.yaml`
  - Append a closed seeding task entry for this task.
  - Append a pending docs-only planning task for the persistence boundary.
- Create: `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
  - Record the execution plan and blocked gates.
- Create: `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
  - Record anchors, findings, validation results, and redaction statement.
- Create: `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
  - Record audit conclusion and needs_recheck.

## Task Steps

- [x] **Step 1: Run repository readiness gate**

  Run:

  ```powershell
  git switch master
  git fetch --prune origin
  git status --short --branch
  git rev-parse HEAD
  git rev-parse master
  git rev-parse origin/master
  git branch --list "codex/*"
  git branch -r --list "origin/codex/*"
  ```

  Expected: worktree clean, `HEAD == master == origin/master`, and no local or remote `codex/*` branch before starting the branch.

- [x] **Step 2: Create short branch**

  Run:

  ```powershell
  git switch -c codex/advanced-organization-training-publish-version-persistence-boundary-seeding
  ```

  Expected: branch created from `master` at `f584b35b2cf16321f49308811838ac9572208ac6`.

- [x] **Step 3: Re-read required governance and boundary files**

  Read the files listed in Required Context. Confirm:
  - ADR-002 layering remains route/server action -> service -> repository -> model.
  - `CAP-ADV-ORG-TRAINING-CONTENT` covers organization training draft/publish/version isolation.
  - The latest readonly recheck closed with `pass_with_persistence_needs_recheck`.
  - `OrganizationTrainingPublishedVersionWrite` carries internal `authorizationSource` and `authorizationPublicId`.
  - `OrganizationTrainingPublishedVersionDto` still omits authorization lineage.
  - Repository/schema/route persistence is not approved by this task.

- [x] **Step 4: Seed the persistence-boundary planning task**

  Update `task-queue.yaml` with:
  - current closed task: `advanced-organization-training-publish-version-persistence-boundary-seeding`.
  - next pending task: `advanced-organization-training-publish-version-persistence-boundary-planning`.
  - planning task allowed files limited to docs/state/task-plan/evidence/audit.
  - blocked files including `.env*`, package/lockfiles, `src/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`, and `e2e/**`.
  - blocked gates preserving implementation, DB, schema/migration, provider/model, dependency, Browser/Playwright/e2e, external service, formal target write, PR, and force push.

- [x] **Step 5: Update project state**

  Update `project-state.yaml` so the handoff recommends:

  ```text
  advanced-organization-training-publish-version-persistence-boundary-planning
  ```

  Expected: durable state does not claim repository/schema/route persistence completion.

- [x] **Step 6: Write evidence and audit**

  Record:
  - branch and baseline SHA.
  - user approval boundary.
  - readonly facts from service/contract/model/validator.
  - seeded planning task and blocked gates.
  - pending validation commands before execution.

- [x] **Step 7: Run local validation**

  Run:

  ```powershell
  npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
  git diff --check
  npm.cmd run lint
  npm.cmd run typecheck
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-boundary-seeding
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-boundary-seeding
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-boundary-seeding
  ```

  Expected: all pass. The pre-push readiness command runs after local commit.

- [ ] **Step 8: Commit, merge, push, and clean up**

  Run after validation:

  ```powershell
  git add docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md
  git commit -m "chore(org-training): seed publish version persistence planning"
  git switch master
  git merge --ff-only codex/advanced-organization-training-publish-version-persistence-boundary-seeding
  git push origin master
  git branch -d codex/advanced-organization-training-publish-version-persistence-boundary-seeding
  git fetch --prune origin
  ```

  Expected: `master` and `origin/master` advance by one docs-only commit, worktree clean, and no local/remote `codex/*` branch remains.

## Risk Defense

- This task does not implement repository, schema, route, mapper, UI, DB access, or product runtime behavior.
- This task does not modify package or lock files and introduces no dependency.
- This task does not read, write, output, or summarize `.env*`.
- This task does not call providers or models and records no provider payload, raw prompt, or raw answer.
- This task does not expose row/private data, employee answers, public identifier value lists, secrets, tokens, cookies, Authorization headers, or database URLs.
- This task does not run a dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment, external-service, PR, or force push flow.

## Self-Review

- Spec coverage: the current task converts the readonly recheck persistence gap into a pending planning task and records blocked gates.
- Placeholder scan: no `TBD`, `TODO`, or unresolved implementation placeholders are present.
- Boundary consistency: names follow the project terminology for `organization`, `org_auth`, `authorization`, `publicId`, `repository`, `schema`, `route`, and `formal target write`.
