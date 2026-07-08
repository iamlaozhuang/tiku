# 2026-07-08 Organization Training Admin Detail Read Model

## Scope

- Branch: `codex/org-training-admin-detail-read-model`
- Goal: add an organization-admin read-only detail API/DTO/read model for enterprise training.
- Primary coverage: published organization training versions.
- Draft behavior: if structured draft snapshots are unavailable, return an explicit unavailable status instead of inventing details.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`

## Requirement Mapping Result

- `CT-REQ-016`: organization admin training management must expose a clear, read-only management loop for published enterprise training.
- `CT-REQ-055`: advanced organization training remains scoped to eligible organization administrators; standard edition and employee boundaries must not expand.
- Organization training module: published enterprise training is an organization-domain training version and must not create or expose formal platform question/paper records.
- AI generation closed-loop baseline: enterprise AI-generated training/paper outputs must remain organization training artifacts, with raw provider/prompt/output excluded from admin-visible detail and evidence.
- Code taste commandments: prefer explicit unavailable states over fake detail, preserve standard API response shape, and avoid leaking implementation identifiers.

## Implementation Plan

1. Add failing route/service tests for admin detail:
   - published detail returns metadata plus safe question detail.
   - answer and analysis are present only as collapsed-by-default fields.
   - raw/internal fields are excluded.
   - draft detail returns `detailAvailability = unavailable` with a continue-configuration action.
   - organization scope is enforced before detail is returned.
2. Add contract types for admin detail DTOs.
3. Add a pure service read model builder.
4. Add route handler wiring and runtime resolver using existing repository `findPublishedVersionByPublicId` and draft list reader.
5. Add App Router GET endpoint under existing public-id route family.
6. Run targeted tests, lint, typecheck, diff/prettier checks, Module Run v2 hardening.
7. Write redacted evidence and audit.
8. Commit, fast-forward merge to `master`, run master gates, push, delete branch, confirm clean alignment.

## Boundaries

- No DB/schema/migration/seed/fixture change.
- No Provider, prompt, raw AI output, env, credential, token, session, cookie, localStorage, staging/prod/deploy, or Cost Calibration work.
- No dependency or package/lockfile change.
- No employee raw answers, internal numeric ids, raw DB rows, raw Provider payload, raw prompt, or full private material in evidence.
- UI changes are explicitly out of this branch and will be handled in `codex/org-training-admin-detail-ui`.

## Validation

- `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts --reporter=dot`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown <touched files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-admin-detail-read-model-2026-07-08`
