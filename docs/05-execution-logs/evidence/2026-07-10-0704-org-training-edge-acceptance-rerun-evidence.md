# 2026-07-10 0704 Organization Training Edge Acceptance Rerun Evidence

## Scope

- taskId: `0704-org-training-edge-acceptance-rerun-2026-07-10`
- branch: `codex/0704-org-training-edge-acceptance-rerun`
- mode: validation-only source/test rerun after deadline repair
- repair dependency: `0704-org-training-deadline-answerability-fix-2026-07-10`

## Readiness

- Private credential index preflight: pass, metadata-only, core role labels count 9.
- Credential values output: none.
- Browser/dev-server login: not executed.
- Direct DB connection/mutation/migration execution: not executed.
- Provider, staging, prod, deploy, env/secret, Cost Calibration: not executed.
- Screenshots/raw DOM/session/cookie/token/localStorage capture: not executed.

## Source Marker Rerun

- Source categories: platform paper snapshot, organization AI result, and manual grouping markers remain present.
- First-release `mock_exam` source denial markers remain present in validator/service/tests.
- Evidence gating markers remain present for `none` publish block and `weak` confirmation.
- Published version immutability/copy/takedown markers remain present.
- Duplicate-submit blocking remains present.
- Formal-domain write policy blocks `practice`, `mock_exam`, formal answer record, `exam_report`, and `mistake_book`.
- Deadline repair markers are present:
  - publish input carries optional `answerDeadlineAt`;
  - schema/repository/mapper persist and return `answer_deadline_at`;
  - employee visible list excludes expired deadline versions;
  - employee draft save and submit block with `answer_deadline_expired`.
- Admin raw employee-answer and learner AI raw-result exposure markers remain blocked/redacted.

## Validation Commands

- `corepack pnpm@10.26.1 vitest run src/db/schema/organization-training.test.ts src/server/validators/organization-training.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts`
  - Result: pass.
  - Count: 13 files, 251 tests.
- `corepack pnpm@10.26.1 lint`
  - Result: pass.
- `corepack pnpm@10.26.1 typecheck`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-training-edge-acceptance-rerun-2026-07-10`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-training-edge-acceptance-rerun-2026-07-10 -SkipRemoteAheadCheck`
  - Result: pass.

## Acceptance Result

- Result: closed after repair rerun.
- Continue condition: next serial task may proceed to `0704-org-analytics-acceptance-2026-07-10` after commit, merge,
  push, and branch cleanup.

## Sensitive Information Review

- No account, password, credential, plaintext `redeem_code`, cookie, session, token, env value, DB URL, DB row, internal id,
  Provider payload, raw prompt, raw AI output/input, full question, paper, material, resource chunk, or employee raw answer
  is recorded in this evidence.
- No screenshot, trace, raw DOM dump, private credential file content, product session material, or database content is
  committed.
