# AI Generation Admin Parameters Runtime Repair Evidence

## Boundary

- Task id: `ai-generation-admin-parameters-runtime-repair-2026-07-01`
- Branch: `codex/ai-generation-admin-parameters-runtime-repair`
- Evidence mode: focused test and static gate output only.
- Sensitive evidence policy: no credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, raw prompt, Provider payload, raw AI output, or full question/paper/material/resource/chunk content.

## Preflight

- Standards read: pass
- Task plan created: pass
- Task queue/status updated: pass
- Source branch active: pass

## Root-Cause Notes

- Finding under investigation: admin AI generation detail controls read `profession` from an undefined generation-parameter object.
- Confirmed root cause category: the page trusted the preserved client parameter-state shape when the active route kind matched. If HMR or a prior render preserved a missing or partial `parameters` object, detail controls and submit payload construction could receive an unsafe parameter object.
- Fix location: parameter resolution source before detail-control rendering and submit payload construction.
- Cross-role carry-forward: resource grounding scan and ordinary UI technical wording scan must be executed in the follow-up owner-preview rerun; this source task only unblocks the admin runtime page.

## RED

- Command: `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
- Result: failed as expected, 2 new tests failed.
- Expected failure: `resolveAdminAiGenerationParameters is not a function`, proving the safe parameter resolver was not implemented before production code changes.

## GREEN

- Command: `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
- Result: pass, 5 tests.
- Fix summary: added a safe parameter resolver that falls back to route defaults when preserved state is missing, partial, wrong-kind, or invalid for required fields. Rendering and submit payload construction now share the same resolved parameter object.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown ...`: pass.
- `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`: pass, 2 files / 21 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1`: pass, 7 scoped files.
- `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`: first run blocked on repository SHA drift in state; after updating state master/originMaster checkpoint to the actual local and remote base SHA, rerun passed.

## Closeout

- Source/test changed: true
- Provider call executed: false
- Env file content read or written: false
- Database mutation executed: false
- Schema/migration/seed executed: false
- Dependency/package/lockfile changed: false
- Staging/prod/cloud/deploy executed: false
- Cost Calibration executed: false
- Release readiness claimed: false
- Final Pass claimed: false
- Next recommended task: `ai-generation-post-admin-parameters-localhost-rerun-2026-07-01`
