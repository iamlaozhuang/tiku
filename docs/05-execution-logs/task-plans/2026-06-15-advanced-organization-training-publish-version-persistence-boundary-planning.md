# Advanced Organization Training Publish Version Persistence Boundary Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the persistence boundary and next approval steps for organization training publish-version storage without implementing repository, route, schema, mapper, UI, DB, or runtime behavior.

**Architecture:** Preserve ADR-002 layering: route/server action adapters call services, services call repositories, repositories own database access, mappers convert rows to DTOs, and schema remains only under `src/db/schema/`. Current service code already writes an internal `OrganizationTrainingPublishedVersionWrite` object; this planning task decides how future tasks should persist it without exposing internal authorization lineage through the public DTO.

**Tech Stack:** Markdown/YAML project state, existing TypeScript service/contract/model/validator context as readonly inputs, Module Run v2 closeout scripts, no new dependency.

---

## Required Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-authorization-lineage-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-authorization-lineage-readonly-recheck.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`

## File Structure

- Modify: `docs/04-agent-system/state/project-state.yaml`
  - Mark this planning task as current closed task.
  - Point handoff to the next schema/repository/route inventory task.
- Modify: `docs/04-agent-system/state/task-queue.yaml`
  - Close `advanced-organization-training-publish-version-persistence-boundary-planning`.
  - Seed `advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit`.
- Create: `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
  - Record this docs-only execution plan.
- Create: `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
  - Record planning conclusions, validation results, and redaction boundaries.
- Create: `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
  - Record audit decision and next `needs_recheck`.

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

  Expected: clean worktree, `HEAD == master == origin/master`, and no local or remote `codex/*`.

- [x] **Step 2: Create short branch**

  Run:

  ```powershell
  git switch -c codex/advanced-organization-training-publish-version-persistence-boundary-planning
  ```

  Expected: branch created from `master` at `e80753c58b31874057c57e94ab40bc2a7405b70b`.

- [x] **Step 3: Read required context**

  Confirm:
  - `CAP-ADV-ORG-TRAINING-CONTENT` covers isolated organization training draft/publish/version behavior.
  - ADR-002 keeps route/server action, service, repository, mapper, and schema ownership separate.
  - `OrganizationTrainingPublishedVersionWrite` is the future repository write contract input.
  - `OrganizationTrainingPublishedVersionDto` is the public DTO and excludes authorization lineage.
  - Current task is blocked from reading/modifying schema/repository/route/mappers, so it must not assert current storage file contents.

- [x] **Step 4: Define persistence boundary decomposition**

  Record in evidence:
  - Current service write boundary.
  - Future schema inventory boundary.
  - Future repository + mapper TDD boundary.
  - Future route adapter boundary.
  - Future service wiring boundary, if the injected store needs runtime construction.
  - Public DTO non-exposure boundary.

- [x] **Step 5: Seed next readonly inventory task**

  Add `advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit` as pending.

  Expected: the next task may inspect schema/repository/mapper/route files as readonly context, but cannot modify product source, schema, migration, DB, provider, package, lockfile, e2e, dev server, formal write, PR, or force push.

- [x] **Step 6: Write evidence and audit**

  Record planning decision:
  - No durable persistence is claimed.
  - Schema/migration remains blocked until a separate task records exact allowed files, approval, local capability gates, and rollback/recovery boundaries.
  - If the inventory task finds no suitable storage, the first implementation task must be schema/migration; otherwise, the first implementation task may be repository/mapper TDD.

- [x] **Step 7: Run local validation**

  Run:

  ```powershell
  npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
  git diff --check
  npm.cmd run lint
  npm.cmd run typecheck
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-boundary-planning
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-boundary-planning
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-boundary-planning
  ```

  Expected: all pass. The pre-push readiness command runs after local commit.

- [ ] **Step 8: Commit, merge, push, and clean up**

  Run after validation:

  ```powershell
  git add docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md
  git commit -m "chore(org-training): plan publish version persistence boundary"
  git switch master
  git merge --ff-only codex/advanced-organization-training-publish-version-persistence-boundary-planning
  git push origin master
  git branch -d codex/advanced-organization-training-publish-version-persistence-boundary-planning
  git fetch --prune origin
  ```

  Expected: `master` and `origin/master` advance by one docs-only commit, worktree clean, and no local/remote `codex/*` branch remains.

## Risk Defense

- This task does not implement repository, schema, route, mapper, UI, DB access, or product runtime behavior.
- This task does not read or modify `.env*`.
- This task does not access DB, row/private data, provider/model, quota/cost, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, package, lockfile, dependency, or formal target write behavior.
- This task treats schema/migration as a separate approval boundary and does not claim storage completion.
- This task records only field names and redacted planning conclusions, not public identifier value lists or private data.

## Self-Review

- Spec coverage: covers repository/schema/route persistence boundary, schema approval requirements, public DTO non-exposure, blocked gates, and validation matrix.
- Placeholder scan: no `TBD`, `TODO`, or unresolved implementation placeholders are present.
- Boundary consistency: names follow project terminology for `organization`, `authorization`, `org_auth`, `publicId`, `repository`, `schema`, `route`, `mapper`, and `formal target write`.
