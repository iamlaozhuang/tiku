# AI generation grounded result adoption closure repair evidence

## Scope

- Task id: `ai-generation-grounded-result-adoption-closure-repair-2026-07-02`
- Branch: `codex/ai-generation-grounded-result-adoption-closure`
- Evidence mode: redacted status, route, workflow, and validation summaries only.

## Red Test Evidence

- Added failing assertions first for:
  - admin generated result persistence must be blocked when grounding evidence is insufficient.
  - admin generated result persistence must be blocked when structured preview parsing fails for the requested kind.
  - content-admin adoption must not send a locally fabricated reviewed draft payload.
  - content-admin adoption must be disabled for ungrounded generated results.
- Observed expected red run before implementation:
  - `src/server/services/route-integrated-provider-execution-service.test.ts`: 1 failing assertion.
  - `src/server/services/admin-ai-generation-local-contract-route.test.ts`: 2 failing assertions.
  - `tests/unit/admin-ai-generation-entry-surface.test.ts`: 2 failing assertions.

## Validation Evidence

- `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: pass, 3 files / 54 tests.
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: pass, 4 files / 59 tests.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown <changed-files>`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-grounded-result-adoption-closure-repair-2026-07-02`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-grounded-result-adoption-closure-repair-2026-07-02 -SkipRemoteAheadCheck`
  - First run: blocked by stale recorded master/origin SHA in task state.
  - Follow-up: updated only the current task repository baseline to the actual local master/origin SHA, reran, result pass.

## Result Summary

- Shared route-integrated Provider helper now requires sufficient evidence, citation count, parsed structured preview, and expected draft kind before a generated result is acceptable for draft persistence.
- Admin AI generation local contract route now rejects unacceptable generated output before task/result persistence.
- Content admin UI no longer submits a fabricated reviewed draft payload.
- Content admin adoption action is disabled when the generated result is not grounded.

## Sensitive Evidence Check

- No credentials, cookie, token, localStorage, Authorization header, `.env*` content, DB raw row, internal numeric id, PII, Provider payload, prompt, raw AI output, or complete generated content is recorded here.
- No browser trace, screenshot, raw DOM, full generated question, full paper, material, resource, or chunk content is recorded here.
