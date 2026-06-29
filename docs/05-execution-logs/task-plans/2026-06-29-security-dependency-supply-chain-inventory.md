# Security Dependency Supply Chain Inventory Plan

> **For agentic workers:** execute this plan under the repository Module Run v2 queue discipline. Do not install, update,
> remove, audit-fix, or otherwise modify dependencies. Do not run network advisory lookup unless a future task explicitly
> materializes that scope.

**Goal:** Produce an offline dependency and supply-chain risk inventory from the current repository dependency manifests,
ADR-006, and dependency governance docs. Split actionable follow-ups into future scoped tasks without modifying source,
tests, package manifests, lockfiles, runtime configuration, Provider configuration, release state, or deployment state.

**Architecture:** This task follows ADR-001 and ADR-006 for dependency baseline interpretation and
`docs/04-agent-system/sop/dependency-introduction-gate.md` plus `docs/03-standards/open-source-introduction.md` for
dependency-change governance. Installed AI SDK packages remain dependency facts only; they do not approve Provider
execution or configuration.

**Tech Stack:** `package.json`, `pnpm-lock.yaml`, ADR/SOP Markdown, YAML governance artifacts, scoped Prettier, Git diff
checks, and Module Run v2 PowerShell governance scripts.

---

- Task id: `security-dependency-supply-chain-inventory-2026-06-29`
- Branch: `codex/security-dependency-supply-chain-inventory-20260629`
- Status: `closed`
- Planned at: `2026-06-29T11:58:03-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-db-schema-migration-risk-inventory.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-supply-chain-inventory.md`

## Read-Only Source Surfaces

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `package-lock.yaml`
- `pnpm-workspace.yaml`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/03-standards/open-source-introduction.md`

## Blocked Actions

- No `package.json`, `package-lock.json`, `package-lock.yaml`, `pnpm-lock.yaml`, dependency, script, source, test, or
  runtime configuration modification.
- No `npm install`, `pnpm install`, `npm update`, `pnpm update`, `npm audit fix`, `pnpm audit --fix`, dependency
  add/remove/upgrade/downgrade, or lockfile regeneration.
- No network audit, public advisory lookup, registry metadata lookup, GitHub advisory lookup, CVE/GHSA lookup, or package
  download in this task.
- No DB connection, raw row access, schema migration, seed, `drizzle-kit push`, Provider/AI call, Provider/model
  configuration, prompt capture, browser runtime, dev server, raw DOM, screenshot, trace, PR, force-push,
  staging/prod/cloud/deploy, release readiness, final Pass, or Cost Calibration.
- No env, secret, connection string, account login, credential, cookie, token, session, localStorage, Authorization
  header, Provider key, or private fixture access/evidence.

## Evidence Redaction

Allowed evidence is limited to package names, dependency area labels, manifest/lockfile presence, direct/transitive count
summaries, dependency gate status, risk category, severity, status, follow-up task ids, validation command names,
commit/branch/merge/push/cleanup status, and redacted summaries.

Forbidden evidence includes credentials, secrets, connection strings, registry tokens, auth headers, raw install logs
with tokenized URLs, private registry URLs, raw advisory payloads, Provider payloads, prompt text, raw AI input/output,
raw DB rows, internal IDs, PII, email, phone, plaintext redeem_code, raw DOM, screenshots, traces, complete
question/paper/material/resource/chunk content, env file contents, raw exception payloads/stacks, and live DB command
output.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**

  Confirmed `master` and `origin/master` are aligned at `208a4e117523a6e1fb8437529b9b5c5eda0e8769` before branch
  creation.

- [x] **Step 2: Create short branch**

  Branch: `codex/security-dependency-supply-chain-inventory-20260629`.

- [x] **Step 3: Materialize current task boundaries**

  Files: `project-state.yaml`, `task-queue.yaml`, and this task plan.

- [x] **Step 4: Build offline dependency surface index**

  Read manifests and lockfiles after materialization. Record only package names, counts, lockfile presence, and dependency
  area summaries.

- [x] **Step 5: Classify dependency and supply-chain risks**

  Compare installed baseline with ADR-006 and dependency governance. Classify dependency drift, deferred dependency
  gates, Provider package boundary, install-script risk, lockfile health, package-manager consistency, and future
  advisory lookup needs.

- [x] **Step 6: Produce inventory matrix and future task split**

  Update traceability with finding rows, severity, status, owner surface, and future task candidates. Do not change
  dependencies.

- [x] **Step 7: Write evidence, audit review, and acceptance**

  Record validation commands, pass/fail status, counts, non-actions, Cost Calibration blocked, next candidate, and
  redaction confirmation.

- [x] **Step 8: Validate and close out**

  Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push checks. If they pass,
  commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-dependency-supply-chain-inventory.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-supply-chain-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-dependency-supply-chain-inventory.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dependency-supply-chain-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dependency-supply-chain-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dependency-supply-chain-inventory-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread goal continuation after validation passes.
- Fast-forward merge to `master`: approved by active thread goal continuation after validation passes.
- Push `origin/master`: approved by active thread goal continuation after validation passes.
- Cleanup short branch: approved by active thread goal continuation after merge and push.
