# Content Organization AI Generation Admin Local Contract Loop Source Repair Plan

Task id: `content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26`

Branch: `codex/content-org-ai-local-loop-20260626`

Task kind: `implementation`

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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Content admin AI generation is a platform content operations capability, not unlocked by learner `personal_auth` or
  `org_auth`.
- Organization AI generation is available to `org_advanced_admin` under valid organization context and unavailable to
  `org_standard_admin`.
- Edition-aware authorization remains service-computed and role-scoped; this task does not change the authorization
  source of truth or create new learner entitlement paths.
- AI generated content remains separated from formal `question` and `paper` records until a later governed adoption
  workflow is approved.
- Provider execution, Provider configuration, `.env*` access, Cost Calibration, schema/migration, DB writes, browser/e2e,
  staging/prod, payment, external service, and MVP final Pass are blocked in this task.

## Requirement Mapping

- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`: local request contracts must expose task state,
  redacted failure categories, and summary-only evidence without raw prompt, Provider payload, secret, token, or raw AI
  output.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: organization advanced admin can
  request AI question and AI `paper` generation; organization standard admin cannot.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`: role and edition decisions stay
  derived from server-side authorization context; client UI state is not accepted as authority.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`: content admin output
  lands in an isolated review domain; organization admin output is organization-owned; neither directly writes formal
  `question` or `paper`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`: content admins require
  discoverable `AI出题`/`AI组卷` entries and organization advanced admins require organization backend AI entries.

- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`: this repair covers content admin and
  organization advanced admin local AI generation request loops while preserving organization standard admin denial.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md`

These files are used as scope and historical evidence only. They do not replace requirement SSOT.

## Conflict Check

No conflict found for the local contract loop scope. The requirements call for usable content/org admin AI generation
entrypoints, while the prior plan explicitly selected a no-Provider, no-DB, no-schema first source task. Full product
completion still requires later persistence, Provider, Cost, and formal-adoption gate decisions.

## Allowed Scope

- Add server-owned local contract DTOs and route handlers for content and organization admin AI generation requests.
- Extend the shared AI task request policy only as needed to represent content admin platform-role capability.
- Add POST API route wiring under `/api/v1/content-ai-generation-requests` and
  `/api/v1/organization-ai-generation-requests`.
- Add UI submit controls and redacted result summaries to the existing admin AI generation entry page.
- Add focused unit tests and update existing focused static/UI tests.
- Update task plan, evidence, audit review, queue, and project state.

## Blocked Scope

- No `.env*`, credential, token, password, Authorization header, Provider payload, raw prompt, or raw model output
  evidence.
- No real Provider/model calls or Provider configuration changes.
- No Cost Calibration.
- No DB connection, seed, account mutation, schema, migration, or `drizzle` change.
- No formal `question` or `paper` writes.
- No browser/e2e/dev-server runtime.
- No package/lockfile/dependency change.
- No staging/prod/cloud/deploy/payment/external-service/PR/force-push work.
- No MVP final Pass claim.

## Implementation Plan

1. Add RED tests for shared policy support of content admin platform-owned local requests.
2. Add RED route tests for content admin accepted request, organization advanced admin accepted request, and
   organization standard admin denial.
3. Add RED UI tests for submit controls, POST request wiring, redacted summary rendering, and standard admin no-submit
   state.
4. Implement the smallest server contract and route code to pass tests.
5. Add route files and update the admin AI entry page plus `fetchAdminApi` optional POST support.
6. Run focused unit tests, then lint, typecheck, scoped Prettier, diff check, Module Run v2 hardening, and pre-push
   readiness.
7. Write evidence and audit review with redacted command summaries.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch under the recorded
   closeout policy.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any implementation path requires DB/schema/migration, seed, account mutation, `.env*`, Provider execution,
  Provider configuration, Cost Calibration, browser/e2e runtime, package/lockfile changes, staging/prod, payment,
  external-service, PR, force push, or formal content writes.
- Evidence would need to include sensitive data, raw generated content, prompt, Provider payload, secret, token,
  database URL, Authorization header, or raw DB rows.
- Focused validation fails three times for the same blocker.
