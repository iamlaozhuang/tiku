# UI UX Detail Small Repair Candidate Plan

- Task id: `ui-ux-detail-small-repair-candidate-2026-06-30`
- Branch: `codex/ui-ux-detail-small-recheck-20260630`
- Mode: local static recheck plus minimal root entry UI source/test repair if confirmed.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest auth role boundary closeout task plan, evidence, audit, and acceptance.
- Prior UI/UX inventory and follow-up evidence:
  - `docs/05-execution-logs/evidence/2026-06-29-detail-ui-ux-token-state-inventory.md`
  - `docs/05-execution-logs/evidence/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
  - `docs/05-execution-logs/evidence/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md`

## Goal

Recheck the low-risk UI/UX token and interaction candidate on the root entry page. If confirmed, minimally replace direct
`hover:bg-green-50` entry-link hover styling with token-backed `hover:bg-muted`, add approved active press feedback, and
add focused unit coverage.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-ui-ux-detail-small-repair-candidate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-ui-ux-detail-small-repair-candidate.md`
- `docs/05-execution-logs/evidence/2026-06-30-ui-ux-detail-small-repair-candidate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-ui-ux-detail-small-repair-candidate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-ui-ux-detail-small-repair-candidate.md`
- `src/app/page.tsx`
- `tests/unit/root-page-ui.test.ts`

## Read-Only Scope

- `src/app/(dev)/design-system/page.tsx` only for current static comparison; it is not writable in this task.
- Prior UI/UX inventory and follow-up task documents listed above.
- Existing focused UI test conventions under `tests/unit/`.

## Blocked Files And Actions

- No writes outside the allowed files.
- No design token, package, lockfile, dependency, script, DB, schema, migration, seed, e2e, browser output, archive, or
  local private input changes.
- No DB connection, raw row read, mutation, schema, migration, seed, or `drizzle-kit push`.
- No Provider/AI call, Provider configuration, model config read/write, prompt payload, or raw AI I/O.
- No browser/dev-server/e2e/raw DOM/screenshot/trace.
- No credential, cookie, token, session, localStorage, Authorization header, env, secret, or connection string access or
  evidence.
- No staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, force-push, or unauthorized
  dependency change.

## Evidence Redaction

Allowed evidence is limited to task ids, file paths, UI surface labels, class-pattern labels, risk category, severity,
status, counts, validation commands, commit/branch/merge/push/cleanup summaries, and redacted expected/observed summaries.

Forbidden evidence includes credentials, tokens, sessions, cookies, Authorization headers, env or connection strings, raw
DB rows, internal ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces,
raw exception payloads or stack traces, and complete business content.

## Plan

1. Confirm current task boundaries are materialized in state, queue, and this plan.
2. Recheck `src/app/page.tsx` for direct Tailwind hue hover classes and missing active press feedback.
3. Add a focused unit test proving root entry links avoid `hover:bg-green-50` and carry `active:scale-[0.98]`.
4. Apply the smallest source change to `src/app/page.tsx` only.
5. Run focused unit, typecheck, lint, scoped formatting, diff, blocked-path diff, and Module Run v2 gates.
6. Write redacted traceability, evidence, audit, and acceptance docs.
7. If validation passes, commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Validation Commands

```powershell
rg -n "ui-ux-detail-small-repair-candidate-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-ui-ux-detail-small-repair-candidate.md
rg -n "hover:bg-green-50|active:scale-\[0\.98\]|transition-transform|transition-colors" src/app/page.tsx tests/unit/root-page-ui.test.ts
npx.cmd vitest run tests/unit/root-page-ui.test.ts
npm.cmd run typecheck
npm.cmd run lint
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/task-plans/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/evidence/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-ui-ux-detail-small-repair-candidate.md src/app/page.tsx tests/unit/root-page-ui.test.ts
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/task-plans/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/evidence/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-ui-ux-detail-small-repair-candidate.md docs/05-execution-logs/acceptance/2026-06-30-ui-ux-detail-small-repair-candidate.md src/app/page.tsx tests/unit/root-page-ui.test.ts
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ui-ux-detail-small-repair-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ui-ux-detail-small-repair-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ui-ux-detail-small-repair-candidate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the
merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630`.

PR creation and force-push remain forbidden.
