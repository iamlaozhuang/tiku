# Full Acceptance Post Employee AI Actions Completion Audit Plan

- Task id: `full-acceptance-post-employee-ai-actions-completion-audit-2026-06-29`
- Branch: `codex/post-employee-ai-completion-audit-20260629`
- Status: in_progress
- Planned at: `2026-06-29T05:18:00-07:00`

## Objective

Perform a docs/state-only completion audit after the `org_advanced_employee` AI action rerun and determine whether the
durable local goal, `full acceptance matrix + full unit baseline repair`, has reached local completion standard.

This task must not claim final Pass, release readiness, or Cost Calibration.

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-completion-audit-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-employee-ai-actions-rerun.md`
- Related redacted task-plan, audit-review, acceptance, and traceability docs needed to prove checklist coverage.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-post-employee-ai-actions-completion-audit.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-post-employee-ai-actions-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-post-employee-ai-actions-completion-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-post-employee-ai-actions-completion-audit.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-post-employee-ai-actions-completion-audit.md`

## Read-Only Allowed Files

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/**`
- `docs/04-agent-system/sop/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`
- `package.json`

## Blocked Files And Actions

- `.env*`
- `package.json`
- `package-lock.yaml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `src/**`
- `tests/**`
- `src/db/schema/**`
- `drizzle/**`
- `migrations/**`
- `seed/**`
- `scripts/**`
- `e2e/**`
- `playwright-report/**`
- `test-results/**`
- `.next/**`
- `D:/tiku-local-private/**`
- `D:\tiku-local-private\**`

## Boundaries

- Browser/runtime: no browser, runtime, raw DOM, screenshot, or trace execution.
- DB: no DB access, read, write, schema, migration, seed, raw row, or connection-string evidence.
- AI/Provider: no Provider execution, Provider configuration, prompt payload, or raw AI input/output.
- Credential/session: no credentials, cookies, tokens, sessions, localStorage, Authorization headers, email, phone,
  plaintext `redeem_code`, or internal ids.
- Source/test/dependency: no source, test, dependency, package, lockfile, schema, migration, seed, or script change.

## Evidence Redaction

Allowed evidence is limited to role, route, workflow, status, count, test-count, commit, and task summary. Forbidden
evidence includes credentials, sessions, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, Provider payloads,
prompts, raw AI IO, and complete `question`, `paper`, `material`, `resource`, or `chunk` content.

## Execution Plan

1. Reconcile the mandatory owner-facing role checklist against current redacted evidence and acceptance logs.
2. Verify the latest full unit baseline evidence remains green by docs/state proof only.
3. Decide whether the durable local goal is complete within the approved local scope.
4. Record explicit blocked gates for final Pass, release readiness, Cost Calibration, Provider execution, DB work,
   staging/prod/deploy, PR, and force-push.
5. Run scoped formatting, diff, and Module Run v2 governance gates.

## Closeout Policy

- Local commit: approved by current docs/state completion audit request and inherited staged local closeout approval.
- Fast-forward merge to `master`: approved for this task after validation passes.
- Push: approved to `origin/master` after validation passes.
- Cleanup: delete the short branch after successful fast-forward merge and push.
