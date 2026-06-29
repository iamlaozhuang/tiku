# Security DB Schema Migration Risk Inventory Plan

> **For agentic workers:** execute this plan under the repository Module Run v2 queue discipline. Do not run a DB
> connection, migration, seed, schema change, browser runtime, Provider call, dependency change, release readiness, final
> Pass, or Cost Calibration.

**Goal:** Produce a source-read-only DB/schema/migration risk inventory and split any actionable findings into future
scoped tasks without changing source, tests, DB schema, migration files, dependencies, runtime configuration, or release
state.

**Architecture:** The task follows ADR-001, ADR-002, ADR-004, ADR-005, ADR-006, and ADR-007. Drizzle ORM and migration
tooling are dependency facts only; they do not authorize DB connection, schema migration, `drizzle-kit push`, seed,
destructive SQL, raw row inspection, staging/prod/cloud work, release readiness, final Pass, or Cost Calibration.

**Tech Stack:** TypeScript schema/repository files, Drizzle config and generated migration file inventory, Markdown/YAML
governance artifacts, scoped Prettier, Git diff checks, and Module Run v2 PowerShell governance scripts.

---

- Task id: `security-db-schema-migration-risk-inventory-2026-06-29`
- Branch: `codex/security-db-schema-migration-inventory-20260629`
- Status: `in_progress_materialized`
- Planned at: `2026-06-29T11:43:22-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-ai-provider-boundary-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-ai-provider-boundary-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-provider-boundary-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-ai-provider-boundary-inventory.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-schema-migration-risk-inventory.md`

## Read-Only Source Surfaces

- `src/db/schema/**`
- `drizzle/**`
- `migrations/**`
- `src/server/repositories/**`
- `tests/unit/*repository*`
- `drizzle.config.ts`

## Blocked Actions

- No DB connection, raw row access, schema migration, migration execution, seed, mutation, direct data read/write,
  `drizzle-kit push`, destructive SQL, drop/truncate/reset, or drift command against a live database.
- No source, test, schema, migration, seed, script, package, lockfile, or dependency modification.
- No env, secret, connection string, account login, private fixture read, credential, cookie, token, session,
  localStorage, Authorization header, database URL, or Provider key access/evidence.
- No Provider/AI call, Provider/model configuration, prompt capture, Provider payload capture, raw AI input/output, quota
  decision, or Cost Calibration.
- No browser runtime, dev server, raw DOM, screenshot, trace, HTML report, PR, force-push, staging/prod/cloud/deploy,
  release readiness, or final Pass.

## Evidence Redaction

Allowed evidence is limited to file paths, module labels, schema area labels, migration labels, repository area labels,
risk category, severity, status, counts, follow-up task ids, validation command names, commit/branch/merge/push/cleanup
status, and redacted summaries.

Forbidden evidence includes credentials, secrets, connection strings, DB URLs, raw DB rows, internal IDs, PII, email,
phone, plaintext redeem_code, raw DOM, screenshots, traces, Provider payloads, prompt text, raw AI input/output, complete
question/paper/material/resource/chunk content, env file contents, raw exception payloads/stacks, destructive SQL output,
and live DB command output.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**

  Confirmed `master` and `origin/master` are aligned at `9545b98d2d7129c45222327e83a8701fb6177794` before branch
  creation.

- [x] **Step 2: Create short branch**

  Branch: `codex/security-db-schema-migration-inventory-20260629`.

- [x] **Step 3: Materialize current task boundaries**

  Files: `project-state.yaml`, `task-queue.yaml`, and this task plan.

- [x] **Step 4: Build read-only DB/schema/migration surface index**

  Use `rg --files` and count-only commands over scoped surfaces. Record only file paths, directories, and count summaries.

- [x] **Step 5: Inspect DB/schema/migration risk paths**

  Read selected schema, generated migration, repository, and repository-test files after materialization. Classify risks
  around migration drift, destructive migration patterns, raw SQL/query construction, N+1-prone repository patterns,
  internal ID exposure boundaries, sensitive field storage, and redaction expectations. Do not run DB commands or record
  raw data.

- [x] **Step 6: Produce inventory matrix and future task split**

  Update traceability with finding rows, severity, status, owner surface, and future task candidates. Do not fix source,
  tests, schema, or migrations.

- [x] **Step 7: Write evidence, audit review, and acceptance**

  Record validation commands, pass/fail status, counts, non-actions, Cost Calibration blocked, next candidate, and
  redaction confirmation.

- [ ] **Step 8: Validate and close out**

  Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push checks. If they pass,
  commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-db-schema-migration-risk-inventory.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-schema-migration-risk-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-db-schema-migration-risk-inventory.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-db-schema-migration-risk-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-db-schema-migration-risk-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-db-schema-migration-risk-inventory-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread goal continuation after validation passes.
- Fast-forward merge to `master`: approved by active thread goal continuation after validation passes.
- Push `origin/master`: approved by active thread goal continuation after validation passes.
- Cleanup short branch: approved by active thread goal continuation after merge and push.
