# 2026-07-01 AI 出题 / AI 组卷 P2 历史与体验修复 Evidence

## 范围

- Task id: `ai-generation-p2-history-ux-2026-07-01`
- Branch: `codex/ai-generation-p2-history-ux`
- Issues: OP-02, OP-07, OP-08, OP-09
- Evidence mode: redacted issue / role / route / status / count / validation summary only.

## 边界确认

- Browser/runtime/e2e: not executed.
- Local DB connection/mutation/reset/seed/import: not executed.
- Provider call/config/prompt/payload/raw AI I/O: not executed.
- Environment file read/write: not executed.
- Dependency/package/lockfile change: not executed.
- Schema/migration/seed change: not executed.
- Staging/prod/cloud/deploy/release readiness/final Pass/Cost Calibration: not executed.

## RED 记录

- Focused unit suite first run produced expected RED: 10 failed / 115 passed / 125 total.
- Failure classes: admin visible generated content rendered after history; student active AI history filter missing; admin history route/repository did not pass generation kind and pagination; personal history route/service/repository did not pass task type and pagination.
- No browser, Provider, DB, or environment-file action was executed during RED.

## GREEN 记录

- Implemented history type isolation:
  - Admin history accepts `generationKind=question|paper` with page and pageSize.
  - Personal history accepts `taskType=ai_question_generation|ai_paper_generation` with page and pageSize.
- Implemented newest-first paginated history with repository-level offset/limit and optional total-count support for persisted adapters.
- Moved current visible generated content ahead of history so the operator sees the result near the action area.
- Added UI history filter/order/page indicators and page navigation controls where pagination metadata is returned.
- Focused unit suite after implementation and formatting: 12 test files passed / 130 tests passed.

## 验证记录

- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-request-history-service.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/server/mappers/personal-ai-generation-request-mapper.test.ts` -> passed, 12 files / 130 tests.
- `npm.cmd exec -- prettier --check --ignore-unknown <changed files>` -> passed.
- `npm.cmd run lint` -> passed.
- `npm.cmd run typecheck` -> passed.
- `git diff --check` -> passed.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-p2-history-ux-2026-07-01 -SkipRemoteAheadCheck` -> passed.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-p2-history-ux-2026-07-01` -> passed after allowed-file materialization and audit wording cleanup.

## 脱敏检查

Evidence contains only command names, scope summaries, pass/fail counts, and redacted issue categories. It does not contain secret-bearing runtime material, database raw rows, internal numeric identifiers, PII, raw Provider payloads, prompts, raw AI input/output, or full question/paper/material/resource/chunk content.
