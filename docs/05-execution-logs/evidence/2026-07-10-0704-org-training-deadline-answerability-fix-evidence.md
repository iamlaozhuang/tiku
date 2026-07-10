# 2026-07-10 0704 Organization Training Deadline Answerability Fix Evidence

## Scope

- taskId: `0704-org-training-deadline-answerability-fix-2026-07-10`
- branch: `codex/0704-org-training-deadline-answerability-fix`
- mode: targeted source repair with redacted local validation
- trigger category: `missing_answer_deadline_persistence_and_answerability_enforcement`

## Readiness

- Private credential index preflight: pass, metadata-only, core role labels count 9.
- Credential values output: none.
- Browser/dev-server login: not executed.
- Direct DB connection/mutation/migration execution: not executed.
- Provider, staging, prod, deploy, env/secret, Cost Calibration: not executed.
- Screenshots/raw DOM/session/cookie/token/localStorage capture: not executed.

## TDD RED

- Command: `corepack pnpm@10.26.1 vitest run src/server/validators/organization-training.test.ts src/server/services/organization-training-service.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts`
- Result: pass-expected RED.
- Count: 4 files, 7 expected failures, 74 existing passes.
- Failure category: deadline input/write/map/visibility/draft/submit behavior missing.

## Implementation Evidence

- Publish input accepts optional `answerDeadlineAt`.
- Admin publish form sends deadline value when provided and sends null when empty.
- Publish service normalizes deadline and writes it to the published version snapshot.
- Repository persists and maps `answer_deadline_at`.
- Version DTO maps deadline as ISO string or null.
- Employee visible list excludes expired-deadline published versions.
- Employee draft save and submit return `answer_deadline_expired` after deadline.
- Existing takedown, duplicate submit, organization scope, formal-domain write blocking, and redaction behavior remain covered.
- Migration text and Drizzle metadata were created but not executed against any database.

## Validation Commands

- `corepack pnpm@10.26.1 vitest run src/db/schema/organization-training.test.ts src/server/validators/organization-training.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts`
  - Result: pass.
  - Count: 13 files, 251 tests.
- `corepack pnpm@10.26.1 exec prettier --write ...`
  - Result: pass.
- `corepack pnpm@10.26.1 lint`
  - Result: pass.
- `corepack pnpm@10.26.1 typecheck`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-training-deadline-answerability-fix-2026-07-10`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-training-deadline-answerability-fix-2026-07-10 -SkipRemoteAheadCheck`
  - Result: pass after project-state accepted ancestor checkpoint SHA was synchronized to current master/origin-master.

## Sensitive Information Review

- No account, password, credential, plaintext `redeem_code`, cookie, session, token, env value, DB URL, DB row, internal id,
  Provider payload, raw prompt, raw AI output/input, full question, paper, material, resource chunk, or employee raw answer
  is recorded in this evidence.
- No screenshot, trace, raw DOM dump, private credential file content, product session material, or database content is
  committed.

## Result

- Repair result: closed locally, ready for commit/merge/push/cleanup.
- Required follow-up: rerun `0704-org-training-edge-acceptance-rerun-2026-07-10` after this repair is merged and pushed.
