# Full Acceptance Content Admin Formal Content Workflow Plan

- Task id: `full-acceptance-content-admin-formal-content-workflow-2026-06-29`
- Branch: `codex/full-acceptance-content-admin-workflow-20260629`
- Plan status: blocked evidence captured
- Date: `2026-06-29`

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Prior content_admin AI detail and formal-content read-only evidence.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`

## Runtime Boundary

- Browser: localhost/127.0.0.1 only, in-app browser, no screenshots, no traces, no raw DOM evidence.
- Session: safe test-owned `content_admin` local session switching. Credential/session/token/cookie/localStorage or
  Authorization header values must never be recorded.
- Mutation: app-normal local UI/API mutations for test-owned acceptance data only where visible UI provides the workflow.
- DB: no direct DB connection/read/write, raw rows, schema, migration, or seed.
- AI/Provider: no Provider call, no Provider configuration, no prompt/payload/raw AI IO.
- Source/test/dependency: no source, test, package, lockfile, schema, migration, or seed changes in this task.

## Execution Steps

1. Establish or reuse safe local `content_admin` session without sensitive evidence: completed.
2. Verify formal content routes and workflow affordances with redacted counts: completed.
3. Exercise minimal app-normal test-owned workflow only when the UI safely provides it: blocked before save/mutation
   because safe cleanup/delete and test-owned target proof were not visible.
4. Verify AI draft review/adoption boundary without submitting AI generation or recording content: blocked because
   adopt/reject controls are visible but disabled with follow-up-task markers.
5. Record redacted evidence and closeout validation: in progress.

## Outcome

Close this task as blocked evidence and continue through a Stage C source/test repair task. This task does not modify
source, tests, DB schema, migrations, seeds, dependencies, Provider configuration, or generated content.

## Stop Conditions

- Any request for Provider execution, prompt/payload/raw AI IO, or Provider config.
- Any need for direct DB write/read, schema/migration/seed, dependency, or source/test changes.
- Any unavoidable raw content, credential, session, raw DOM, screenshot, trace, PII, or internal-id evidence.
- Staging/prod/deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.
