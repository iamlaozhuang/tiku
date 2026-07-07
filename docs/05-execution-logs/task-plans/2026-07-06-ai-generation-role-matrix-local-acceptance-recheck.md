# 2026-07-06 AI Generation Role Matrix Local Acceptance Recheck Plan

## Metadata

- Task id: `ai-generation-role-matrix-local-acceptance-recheck-2026-07-06`
- Branch: `codex/ai-generation-role-matrix-local-acceptance-recheck-2026-07-06`
- Parent goal: `ai-generation-recontract-local-repair-goal-2026-07-06`
- Package: recontract package 6, role matrix and local acceptance recheck
- Scope: local source/unit role-matrix recheck, Provider-disabled clarity checks, and narrow localhost browser denial smoke when non-sensitive.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest 2026-07-06 AI组卷 backend, route, learning-session, UI, quantity, and degradation evidence.

## Requirement Mapping Result

This task checks the current local implementation against recontract package 6:

- standard roles must remain denied, hidden, upgrade-guided, or unavailable for advanced AI generation;
- `personal_advanced_student`, `org_advanced_employee`, `org_advanced_admin`, and `content_admin` must have local source/unit evidence for their approved AI出题 / AI组卷 entry or route contracts;
- Provider-disabled states must use clear business categories and must not persist generated results or expose Provider internals;
- AI组卷 must remain plan-and-select, using role-allowed formal question sources instead of Provider-generated final questions;
- Provider-enabled samples, staging/prod, deploy, production usability, release readiness, and Cost Calibration remain outside this task.

## Execution Strategy

1. Verify Git and branch state is clean and stacked on the current package 5 HEAD.
2. Run focused source/unit role-matrix checks covering:
   - learner home advanced AI entry visibility and standard denial;
   - learner/employee AI训练 UI tabs, quantity, source labels, and Provider-disabled rendering;
   - personal/employee local request route standard rejection and advanced route ownership;
   - admin AI entry surfaces for content admin, organization advanced admin, and organization standard admin denial;
   - admin local route Provider-disabled and standard-admin direct access denial;
   - backend workspace role guard service-computed advanced capability checks.
3. Run narrow browser smoke only where no real credentials, screenshots, raw DOM, Provider call, DB mutation, or trace artifacts are needed.
4. Run static gates: `git diff --check`, `npm.cmd run typecheck`, `npm.cmd run lint`, scoped Prettier check, and Module Run v2 pre-commit hardening.
5. Write redacted evidence and adversarial audit with explicit conclusion buckets.

## Boundary

- No dependency, package, or lockfile changes.
- No schema, migration, seed, or destructive database operation.
- No direct DB runtime inspection.
- No Provider-enabled execution.
- No Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, screenshot, trace, raw DOM, credential, session, cookie, token, env value, DB URL, DB row, internal id, PII, employee raw answer, or plaintext `redeem_code` in evidence.
- No staging, production, deploy, release-readiness, production-usability, final Pass, or Cost Calibration claim.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/personal-ai-generation-request-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts`
- `npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --reporter=line --trace=off`
- `git diff --check`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md docs/05-execution-logs/evidence/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-role-matrix-local-acceptance-recheck-2026-07-06`

## Risk Controls

- Treat old 0704 runtime evidence as baseline only, not proof for the new plan-and-select contract.
- Mark DB-backed runtime as not executed unless this task runs an approved local DB runtime flow.
- Mark Provider-enabled small sample as not executed / requires separate bounded approval.
- If focused source/unit or synthetic browser smoke finds a current source defect, stop this recheck and create a separate short fix branch.
