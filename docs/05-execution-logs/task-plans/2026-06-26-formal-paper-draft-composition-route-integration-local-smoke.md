# Formal paper draft composition route integration local smoke task plan

Task id: `formal-paper-draft-composition-route-integration-local-smoke-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Approval Source

- Predecessor approval package:
  `docs/05-execution-logs/acceptance/2026-06-26-formal-paper-draft-composition-adoption-approval-package.md`
- Predecessor TDD evidence:
  `docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-adapter-tdd.md`

## Requirement Mapping

This task proves the route-level local DB path only: a content admin generated `paper` result can be adopted into a
formal draft `paper` with at least one `paper_section` and one `paper_question`.

The route smoke must use the existing local contract route and formal adoption route handler/service path. It must not
change source, tests, schema, migrations, dependencies, package files, env files, or any production/staging resource.

## Execution Plan

1. Run focused unit tests from the composition TDD task to confirm the adapter/runtime contract still passes.
2. Create a transient repository-root smoke harness, run it with `node_modules\.bin\tsx.cmd`, and remove it immediately
   after execution.
3. The harness will:
   - inject a redacted content admin session into route handlers;
   - execute at most one content paper setup POST with Provider disabled;
   - execute at most one formal adoption POST with a reviewed draft containing one section and one companion question;
   - verify the resulting formal paper draft has at least one `paper_section` and one `paper_question`;
   - record only status/count/public-id-presence states.
4. Update evidence and audit review with capped, redacted results.
5. Run scoped Prettier write/check, `git diff --check`, and Module Run v2 precommit/prepush readiness gates.

## Call Caps

- Sanitized actor lookup: max 1.
- Content paper setup POST: max 1.
- Formal adoption POST: max 1.
- Eligible/source lookup: max 2.
- Companion question draft creation: max 3.
- Paper section rows: max 3.
- Paper question rows: max 3.
- Provider/model calls: 0.
- Formal publish/student-visible content: 0.

## Scope

Allowed:

- Docs/state/evidence/audit updates for this task.
- Focused unit test execution.
- Capped local route smoke through existing route handlers.
- Local DB connection through existing runtime configuration for this approved smoke only.
- Draft-only formal question/paper writes through the approved route/service path.

Blocked:

- Source or test file changes.
- Schema/migration/drizzle changes or execution.
- Direct DB seed, fixture creation, direct raw DB mutation, cleanup delete, or data repair.
- Provider/model calls, Provider credential access, env-file changes, or secret evidence.
- Formal publish, student-visible content, organization-scoped adoption.
- Staging/prod, deployment, payment, external service, release readiness, Cost Calibration, or final Pass.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `node_modules\.bin\tsx.cmd <transient-repo-root-route-smoke-harness>`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md docs/05-execution-logs/audits-reviews/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md docs/05-execution-logs/audits-reviews/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId formal-paper-draft-composition-route-integration-local-smoke-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId formal-paper-draft-composition-route-integration-local-smoke-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- The local route smoke needs more calls than approved caps.
- A source/test/schema/migration/package/env change becomes necessary.
- Direct DB seed, data repair, destructive cleanup, or migration becomes necessary.
- Provider credential, Provider/model call, publish, staging/prod, payment, external service, release readiness, or final
  Pass becomes necessary.
- Evidence would expose raw generated result body, raw reviewed draft, full formal content, raw DB row, DB URL, secret,
  token, cookie, Authorization header, prompt, Provider payload, or credential material.
