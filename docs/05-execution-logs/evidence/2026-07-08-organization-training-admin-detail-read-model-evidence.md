# 2026-07-08 Organization Training Admin Detail Read Model Evidence

## Scope

- Branch: `codex/org-training-admin-detail-read-model`
- Task: organization admin read-only enterprise training detail API/DTO/read model.
- Scope limit: backend admin detail read model and route only.

## TDD

- Red command: `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts --reporter=dot`
- Red result: failed as expected because admin detail read model and `[publicId]` GET route were missing.
- Green command: `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts --reporter=dot`
- Green result: pass, 3 files, 104 tests.

## Validation

- `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts --reporter=dot`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown <touched files>`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-admin-detail-read-model-2026-07-08`: pass.

## Master Post-Merge Validation

- Fast-forward merged `codex/org-training-admin-detail-read-model` into `master`: pass.
- `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts --reporter=dot`: pass, 3 files, 104 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown <touched files>`: pass.
- `git diff --check`: pass.
- Repository checkpoint aligned for pre-push readiness: pending final pre-push rerun.

## Requirement Mapping Result

- `CT-REQ-016`: covered by the admin-only detail read model for enterprise training review.
- `CT-REQ-055`: preserved by the organization-admin context and scope checks before returning detail.
- Organization training domain boundary: the route reads organization training versions only and does not write formal platform question or paper records.
- AI generation boundary: provider payloads, raw prompts, raw AI output, and raw JSON are not returned or recorded.
- Draft fallback: drafts without structured snapshots return an explicit unavailable state instead of fabricated details.

## Boundary Evidence

- DB/schema/migration/seed changed: false.
- Package/lockfile changed: false.
- Provider/prompt/raw AI execution: false.
- Env/secret/session/cookie/localStorage output: false.
- Staging/prod/deploy/Cost Calibration: false.
- Raw DB rows/internal numeric ids/raw Provider payload/raw prompt/raw AI output/full question/paper/material evidence: false.

## Result

- Added an admin-only safe detail DTO/read model.
- Added `GET /api/v1/organization-trainings/{publicId}` thin route.
- Published training detail can return safe question detail, evidence summary, and answer/analysis marked `collapsed_by_default`.
- Draft detail returns an explicit unavailable state with `continue_configuration`; it does not fabricate question content.
- Existing employee-visible version DTO remains redacted for answer/analysis.
