# Repair Organization Training Capability Source Boundary Task Plan

## Task

- Task id: `repair-organization-training-capability-source-boundary-2026-06-29`
- Branch: `codex/org-training-capability-repair-20260629`
- Finding id: `unit-b-auth-role-001`
- Goal: require organization training runtime admin context to consume service-computed organization workspace capability
  metadata before training management operations.

## Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest Unit B task plan, evidence, audit, acceptance, and traceability documents

## Fresh Approval

The user approved this task on 2026-06-29: `repair-organization-training-capability-source-boundary-2026-06-29`, limited
to the minimal repair loop for:

- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`

The approval is consumed only after this task materializes the state, queue, task plan, allowed files, blocked files,
runtime boundaries, validation commands, evidence redaction rules, and closeout policy.

## Allowed Files

- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-repair-organization-training-capability-source-boundary.md`

## Blocked Files And Actions

- No `.env*`, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage, or Authorization
  header evidence.
- No `package.json`, lockfile, dependency, package-manager, CLI, SDK, or script change.
- No `src/db/**`, schema, migration, seed, direct DB connection, DB mutation, raw rows, internal IDs, PII, email, phone, or
  plaintext `redeem_code`.
- No Provider/AI call, Provider configuration, model configuration, prompts, payloads, or raw AI input/output.
- No browser runtime, dev server, e2e, raw DOM, screenshots, traces, `playwright-report`, `test-results`, or `.next`.
- No staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, or force-push.

## Implementation Plan

1. Add RED route tests proving an `org_advanced_admin` session with missing or false service-computed organization
   capability metadata is rejected before repository-backed training management operations.
2. Keep existing legitimate advanced organization admin paths green by making the shared test fixture include a valid
   service-computed `org_auth` advanced organization capability.
3. Add the smallest route-level guard in `organization-training-route.ts`, aligned with the existing analytics and
   organization AI generation service-computed capability-source boundary.
4. Run focused tests, lint, typecheck, formatting, diff checks, and Module Run v2 gates.
5. Write redacted evidence, traceability, audit, and acceptance documents before commit closeout.

## Validation Commands

```powershell
npx.cmd vitest run src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-repair-organization-training-capability-source-boundary.md src/server/services/organization-training-route.ts src/server/services/organization-training-route.test.ts
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-repair-organization-training-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-repair-organization-training-capability-source-boundary.md src/server/services/organization-training-route.ts src/server/services/organization-training-route.test.ts
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId repair-organization-training-capability-source-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId repair-organization-training-capability-source-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId repair-organization-training-capability-source-boundary-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

If all validation commands pass, this task is approved for local commit, fast-forward merge to `master`, push to
`origin/master`, and deletion of the merged short branch. The approval source is the current user message authorizing
`repair-organization-training-capability-source-boundary-2026-06-29`.

This task does not approve release readiness, final Pass, Cost Calibration, staging/prod/cloud/deploy, Provider/AI, DB,
dependency, browser, PR, or force-push work.
