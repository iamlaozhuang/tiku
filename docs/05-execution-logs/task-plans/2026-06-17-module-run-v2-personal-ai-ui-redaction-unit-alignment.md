# Module Run v2 Personal AI UI Redaction Unit Alignment

- Task id: `module-run-v2-personal-ai-ui-redaction-unit-alignment`
- Branch: `codex/personal-ai-ui-redaction-unit-alignment`
- Date: 2026-06-17
- Execution profile: `local_unit_tdd`
- Evidence mode: `full`
- Validation policy: `local_unit`

## Approval And Scope

The current 2026-06-17 user prompt approves executing the next recommended work after the personal AI local UI/browser planning reconciliation. Scope is limited to a narrow local-unit TDD alignment of the legacy personal AI UI unit test with the current redaction policy.

Allowed write surfaces:

- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-module-run-v2-personal-ai-ui-redaction-unit-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-17-module-run-v2-personal-ai-ui-redaction-unit-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-module-run-v2-personal-ai-ui-redaction-unit-alignment.md`

Read-only context:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.test.ts`

Blocked surfaces remain unchanged: `.env*`, secret/provider payloads, provider/model calls, schema/drizzle/migrations, dependency/package/lockfile changes, staging/prod/cloud/deploy/payment/external-service, Browser/dev server/Playwright/e2e, PR, force-push, and Cost Calibration Gate.

## TDD Plan

1. RED: run the legacy personal AI UI unit test and confirm the existing redaction-policy mismatch fails without recording sensitive fixture values or public identifier lists.
2. GREEN: update only the legacy unit test assertions/helpers so they verify the current redacted identifier policy instead of visible raw identifiers.
3. Validate focused unit coverage, lint, typecheck, formatting, diff, Module Run v2 hardening, closeout readiness, and pre-push readiness.
4. Write redacted evidence and audit, then close the task through local commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup if all gates pass.

## Risks And Controls

- This task does not claim L5 local full-flow/browser closure.
- Evidence must summarize test outcomes only; it must not include raw DOM dumps, fixture public identifiers, row data, provider payloads, raw prompts, or raw answers.
- Production code changes are out of scope unless RED shows the current implementation violates the already approved redaction policy. If that happens, stop and report rather than widening scope.
