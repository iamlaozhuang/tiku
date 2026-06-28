# Owner-Facing Local Experience Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` if this plan is resumed task-by-task. This plan is the task-scoped source of truth for execution; chat memory must not expand scope.

**Goal:** Complete a redacted owner-facing local experience validation and small deterministic repair batch for eight role labels without crossing blocked gates.

**Architecture:** Validation stays local to `localhost` / `127.0.0.1` and follows the existing Next.js monolith boundaries. Any source repair must preserve the ADR-002 layering (`route handlers / server actions -> service -> repository -> model`) and Tiku naming contracts.

**Tech Stack:** Next.js / React / TypeScript, existing Vitest unit tests, existing local Browser/Playwright-capable runtime, local Docker/dev DB only when needed and approved by this task.

---

## Task Identity

- Task id: `owner-facing-local-experience-batch-2026-06-28`
- Branch: `codex/owner-facing-local-experience-20260628`
- Task kind: `local_experience_batch`
- Execution profile: `local_full_flow`
- Experience batch label: `owner_facing_local_experience_batch`
- Created at: `2026-06-28T11:20:10-07:00`
- Owner approval source: current user prompt in this Codex thread.

## Startup Read Confirmation

Read before this plan:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-post-provider-rollup-evidence.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-blocked-gate-supersession-triage.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-role-gap-capture-scope.md`

Git startup facts:

- Start branch before task branch: `master`
- `master` SHA: `54f153b8971830ab1aca892c1b4d55319740e097`
- `origin/master` SHA: `54f153b8971830ab1aca892c1b4d55319740e097`
- Startup status: clean `master...origin/master`
- New task branch: `codex/owner-facing-local-experience-20260628`

Queue decision:

- Active queue had no executable `pending` task.
- The only non-terminal task was blocked staging work: `layer-3-staging-pre-release-redacted-execution-after-target-materialization-2026-06-27`.
- The user explicitly authorized creating and materializing this local owner-facing experience batch when no pending task exists.

## Goal And Role Coverage

The batch covers these role labels:

- `org_advanced_admin`
- `org_standard_admin`
- `org_advanced_employee`
- `org_standard_employee`
- `ops_admin`
- `content_admin`
- `personal_advanced_student`
- `personal_standard_student`

Primary walkthrough order:

1. Start as `org_advanced_admin` at `http://localhost:3000/organization/organization-analytics`.
2. Validate organization analytics, organization training, organization `AI出题`, organization `AI组卷`, multi-`profession` / multi-`level` / multi-`subject` authorization scope, Chinese UI, and Loading/Empty/Error/Permission states.
3. Validate standard organization admin unavailable/denied states for advanced analytics and AI surfaces.
4. Validate advanced and standard employee learning/training/AI boundaries.
5. Validate `ops_admin` authorization, employee import/template, redacted logs, and ordinary prompt-template permission gap.
6. Validate `content_admin` formal content and content AI draft/review boundaries.
7. Validate personal advanced and standard learner AI/standard learning boundaries.
8. Record cross-role Chinese UI and interaction gaps.

Do not repeat the prior six-role route smoke or claim route reachability as product acceptance. Prior evidence already records 18/18 local route checks and zero route console errors.

## Allowed Files

Writes are allowed only to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/acceptance/2026-06-28-owner-facing-local-experience-batch.md`
- `src/app/**`
- `src/components/**`
- `src/features/**`
- `src/hooks/**`
- `src/lib/**`
- `src/server/**`
- `tests/unit/**`

If a needed repair falls outside these paths, stop and record a blocker instead of expanding scope from chat memory.

## Blocked Files And Actions

Blocked writes:

- `.env*`
- `package.json`
- `package-lock.yaml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `src/db/schema/**`
- `drizzle/**`
- `migrations/**`
- `seed/**`
- `scripts/**`
- `e2e/**`
- `playwright-report/**`
- `test-results/**`
- `.next/**`
- `docs/04-agent-system/state/archive/**`
- `docs/04-agent-system/state/task-history-index.yaml`
- `D:/tiku-local-private/**`
- `D:\tiku-local-private\**`

Blocked actions:

- No schema, migration, seed, `drizzle-kit push`, destructive DB operation, or unmarked DB data mutation.
- No dependency add/remove/upgrade and no package or lockfile change.
- No `.env*` read, display, modification, or evidence capture.
- No Provider key, endpoint, `model_config`, fallback config, secret, token, cookie, session, localStorage, Authorization header, connection string, or DB URL read/display/record.
- No Provider configuration, Cost Calibration, pricing, quota default decision, staging/prod/cloud/deploy, payment, OCR, export, external-service, PR, or force push.
- No release readiness, production readiness, final acceptance Pass, or full MVP completion claim.

## Local Private Resource Boundary

Read-only local resources allowed by this task:

- `D:\tiku-local-private\acceptance`
- `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated`

Allowed use:

- Credentials under `D:\tiku-local-private\acceptance` may be read only as localhost login inputs.
- Fixture materials, papers, answer keys, synthetic questions, employee import templates/samples, `authorization-matrix.yaml`, `expected-outcomes.md`, and `redaction-policy.md` may be used for local experience validation.

Evidence may record only resource package path, coverage labels, file counts, `profession` / `level` / `subject` labels, status, and redacted conclusions. It must not record complete question, answer, paper, material, resource, or `chunk` content.

## DB Boundary

Allowed DB actions:

- Local Docker/dev DB status checks.
- Local DB health checks.
- Read-only aggregate diagnostics for local role, `authorization`, employee, organization training, AI task, and log support.
- Test-owned fixture data create/update/delete through localhost product UI/API.
- Direct SQL write or cleanup only when all conditions are true:
  - target is local dev DB only;
  - data is this task's test-owned fixture data;
  - each identifiable fixture record uses marker `owner_facing_20260628` or an equivalent traceable business label;
  - no non-task-marked data is modified, deleted, or overwritten;
  - raw SQL result rows are not output;
  - evidence records only counts, labels, states, failure classes, and redacted conclusions.

DB stop conditions:

- If `.env*` must be read to access DB, stop.
- If reset/drop/truncate/destructive operation is required, stop.
- If schema/migration/drizzle changes are required, stop.
- If staging/prod/cloud/customer DB access is required, stop.

## AI / Provider Boundary

Allowed AI actions:

- Use already configured localhost product UI/API AI entries for `AI出题` and `AI组卷` experience validation.
- First batch total AI calls: at most 30.
- Each AI entry may retry at most once after failure.

Blocked AI actions:

- Do not read, display, copy, modify, or commit Provider key, endpoint, `model_config`, fallback config, `.env*`, secret, token, or API key.
- Do not perform Cost Calibration, cost measurement, price measurement, quota default decision, or Provider configuration change.
- Do not record prompts, Provider payloads, raw AI inputs, raw AI outputs, complete generated questions, or complete generated papers.

AI evidence may record only entry label, role, success/failure, failure class, retry count, redacted summary, and whether permission/experience matched expectation.

## Account And Credential Boundary

- Credentials from `D:\tiku-local-private\acceptance` are input-only for localhost login.
- Do not output, record, copy, commit, or write to evidence any account password, cookie, token, session, localStorage, Authorization header, secret, DB URL, API key, or connection string.
- Do not read, display, modify, or commit `.env*`.
- If `.env*` access becomes necessary, stop and report blocker.

## Evidence Redaction Rules

Evidence must not include:

- credentials, connection strings, secrets, tokens, cookies, localStorage, Authorization headers;
- raw DB rows, internal ids, email, phone, plaintext `redeem_code`;
- raw DOM, screenshots, traces, HTML reports;
- Provider payload, prompt, raw AI input, raw AI output;
- employee subjective answers;
- complete `question`, `paper`, `material`, `resource`, or `chunk` content.

Evidence may include:

- role labels, route/page/workflow labels, state labels, counts, pass/fail, failure classes;
- `gapId`, severity, fix class, redacted expected/observed summaries;
- fixture package path, safe coverage labels, file counts, and redacted conclusions;
- validation commands and summarized pass/fail output.

## Gap Capture Format

Use one row per gap:

| Field     | Rule                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `gapId`   | Stable id such as `ORG-ADV-ANALYTICS-001`                                                                                    |
| Role      | One of the eight role labels in this plan                                                                                    |
| Surface   | Page/workflow label, not secret URL or internal id                                                                           |
| Expected  | Requirement summary from the owner-facing traceability scope                                                                 |
| Observed  | Redacted behavior summary                                                                                                    |
| Severity  | `critical`, `major`, `minor`, or `polish`                                                                                    |
| Fix class | `copy`, `navigation`, `empty_state`, `permission`, `visible_ui_state`, `data_contract`, `source_required`, or `blocked_gate` |
| Action    | `fixed`, `not_fixed`, or `blocked` with redacted reason                                                                      |

Prioritize fixes that are small and deterministic: copy, navigation, empty state, permission copy/state, visible UI state, and obvious data contract display. Do not do large refactors.

## TDD Repair Rule

For any production source behavior change:

1. Add or update a focused unit test that captures the expected behavior.
2. Run the focused test and record RED failure.
3. Implement the smallest source change.
4. Run the focused test and record GREEN pass.
5. Run lint/typecheck and closeout gates.

Copy-only documentation/state updates do not require production-code TDD, but source UI/permission/data-contract repairs do.

## Execution Steps

- [ ] Verify this task exists in `task-queue.yaml` and `project-state.yaml`.
- [ ] Create or confirm evidence and audit review files for this batch.
- [ ] Confirm local service status without reading `.env*`.
- [ ] Use Browser path first if available; otherwise record Browser-path blocker and use approved Playwright fallback.
- [ ] Execute owner-facing local walkthrough in the role order above.
- [ ] Record a redacted gap list with severity and fix class.
- [ ] Repair only small deterministic gaps inside `allowedFiles`.
- [ ] Run focused RED/GREEN unit checks for each source behavior fix.
- [ ] Run final validation commands and record results in evidence.
- [ ] Self-review evidence redaction, allowed/blocked files, and blocked gates.
- [ ] Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch only if validation passes and closeout policy remains satisfied.

## Validation Commands

Required final commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-28-owner-facing-local-experience-batch.md docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md docs/05-execution-logs/audits-reviews/2026-06-28-owner-facing-local-experience-batch.md docs/05-execution-logs/acceptance/2026-06-28-owner-facing-local-experience-batch.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-28-owner-facing-local-experience-batch.md docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md docs/05-execution-logs/audits-reviews/2026-06-28-owner-facing-local-experience-batch.md docs/05-execution-logs/acceptance/2026-06-28-owner-facing-local-experience-batch.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId owner-facing-local-experience-batch-2026-06-28
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId owner-facing-local-experience-batch-2026-06-28 -SkipRemoteAheadCheck
```

If source fixes touch another existing focused unit surface, add the exact focused unit command to evidence before broad gates.

## Closeout Policy

The current user approved:

- local task-scoped commit;
- fast-forward merge into `master`;
- push to `origin/master`;
- deletion of merged short branch.

Closeout remains blocked if:

- validation fails;
- changed files exceed `allowedFiles` or touch `blockedFiles`;
- sensitive data would be recorded;
- schema/migration/dependency/env/provider configuration/destructive DB/staging/prod/deploy/payment/external-service work becomes necessary;
- PR or force push is needed.

## Final Response Requirements

The final handoff must include:

- commit SHA;
- validation summary;
- gap capture and fix summary;
- residual blocked gates;
- next step recommendation;
- brief code taste compliance checklist.
