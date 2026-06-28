# Local Full Loop Baseline Accounts Auth DB Plan

## Task

- Task id: `local-full-loop-baseline-accounts-auth-db-2026-06-28`
- Branch: `codex/local-full-loop-baseline-20260628`
- Task kind: `implementation`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Approval: current user fresh approval on 2026-06-28 for local full-loop acceleration, including local Docker dev DB,
  local schema/migration/seed/fixture, localhost/127.0.0.1 validation, focused unit/e2e tests, redacted evidence, local
  commit, fast-forward merge to `master`, push to `origin/master`, and short branch cleanup.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`

## Requirement Decision Map

| Decision area       | Active rule for this task                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roles               | Local baseline must cover `student`, `content_admin`, `ops_admin`, `org_standard_admin`, `org_advanced_admin`, and `employee`.                                                      |
| DB target           | Local Docker/dev DB only. No staging/prod or shared destructive DB.                                                                                                                 |
| Credentials         | Dev seed credentials may be used for local login/API validation, but values must not be recorded in evidence. Private acceptance credentials may only be read input-only if needed. |
| Authorization       | Session payload and authorization surfaces must use public identifiers and camelCase API fields, with no internal `id`.                                                             |
| Organization admins | Standard and advanced organization admins must remain edition-aware and organization scoped.                                                                                        |
| Content/ops admins  | `content_admin` and `ops_admin` must be distinct local role accounts, not inferred from `super_admin`.                                                                              |
| Employee            | Employee local account must be login-capable for later organization training/analytics validation.                                                                                  |
| Cost Calibration    | Cost Calibration Gate remains blocked. No pricing, quota default, release readiness, or final Pass decision.                                                                        |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-test-owned-db-schema-alignment-execution.md`

These logs establish queue and DB-schema baseline history only. The current task must produce fresh local validation
evidence.

## Conflict Check

Existing `src/db/dev-seed.ts` provides local student, super admin, organization standard admin, organization advanced
admin, and employee data, but the inspected seed dataset does not provide distinct login-capable `content_admin`,
`ops_admin`, or employee auth accounts. This conflicts with the sprint's required local full-loop baseline, so this task
will use TDD to add deterministic local seed coverage and a DB-backed localhost API e2e smoke.

## Allowed Scope

- Update task/state/traceability/evidence/audit/acceptance documents for this task.
- Add or update focused tests for local seed account coverage.
- Update `src/db/dev-seed.ts` and its focused tests if the failing test proves missing role/account baseline.
- Add a scoped local e2e smoke that logs in via localhost API and records only redacted role/status summaries.
- Run local dev DB seed and focused local e2e against `127.0.0.1`.
- Run scoped Prettier, lint, typecheck, `git diff --check`, `Get-TikuProjectStatus`, and Module Run v2 gates.
- Commit locally, fast-forward merge to `master`, push `origin/master`, and clean up the short branch after gates pass.

## Blocked Scope

- No package, lockfile, or `.env*` changes.
- No dependency introduction.
- No staging/prod/cloud/deploy.
- No Provider call, Provider configuration, Provider payload evidence, prompt evidence, raw AI output, pricing, quota
  default, or Cost Calibration.
- No payment, OCR, export, or external-service action.
- No PR and no force push.
- No `drizzle-kit push`.
- No shared or production-like destructive DB action.
- No evidence containing credentials, connection strings, secrets, tokens, cookies, localStorage, Authorization headers,
  raw DB rows, internal ids, user email or phone, plaintext `redeem_code`, raw DOM, screenshots, traces, Provider
  payloads, prompts, raw AI output, employee subjective answers, or complete `question`/`paper` content.

## TDD Plan

1. RED: update focused seed tests to require deterministic local seed coverage for `content_admin`, `ops_admin`, and a
   login-capable `employee` account, then run `npm.cmd run test:unit -- src/db/dev-seed.test.ts` and observe the expected
   failure.
2. GREEN: minimally update `src/db/dev-seed.ts` with deterministic public identifiers, auth users/accounts, admin rows,
   and employee auth linkage.
3. GREEN verification: rerun `npm.cmd run test:unit -- src/db/dev-seed.test.ts`.
4. Add a focused e2e smoke for six-role local session baseline, then run it against the local dev server/DB.
5. If runtime smoke exposes a real issue, write a failing focused test before implementation repair.

## Validation Commands

- `npm.cmd run test:unit -- src/db/dev-seed.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- `npm.cmd run test:e2e -- e2e/local-full-loop-baseline-accounts-auth-db.spec.ts`
- `npm.cmd run test:e2e -- e2e/edition-aware-authorization-db-backed-local-flow.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-baseline-accounts-auth-db-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-baseline-accounts-auth-db-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- Any step requires package/lockfile or `.env*` modification.
- Local DB target cannot be verified as local/dev.
- Seed validation requires destructive shared/prod DB work.
- Evidence would require credential values, raw tokens, raw DB rows, internal ids, screenshots, traces, raw DOM, prompt,
  Provider payload, or raw AI output.
- A repair expands into Provider, Cost Calibration, payment, OCR/export, staging/prod/deploy, PR, or force push.
