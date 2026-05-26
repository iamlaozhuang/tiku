# Phase 12 Model Config Local Mock Runtime Evidence

## Task

- TaskId: `phase-12-model-config-local-mock-runtime`
- Branch: `codex/phase-12-model-config-local-mock-runtime`
- StartedAt: `2026-05-26`

## Initial Recovery

- Starting point: `master == origin/master == 2e65b83`
- Worktree was clean before branch creation.
- Queue dependency `phase-12-model-config-admin-ui` was closed.

## RED/GREEN Log

- RED: `npm.cmd run test:unit -- tests/unit/phase-12-model-config-local-mock-runtime.test.ts`
  - Result: failed as expected.
  - Failure summary: resolver selection lacked `redactedModelConfigMetadata`; helper `createRedactedModelConfigRuntimeSnapshot` did not exist.
- GREEN: `npm.cmd run test:unit -- tests/unit/phase-12-model-config-local-mock-runtime.test.ts`
  - First green attempt exposed raw provider payload passthrough in the mock runtime redaction snapshot.
  - Final result: pass, 1 file, 2 tests.
- Regression: `npm.cmd run test:unit -- tests/unit/phase-12-model-config-local-mock-runtime.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/phase-11-model-config-fallback-runtime.test.ts tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-9-ai-knowledge-model-config-runtime.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts tests/unit/phase-11-ai-call-log-visibility-fix.test.ts tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts`
  - Result: pass, 10 files, 34 tests.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-model-config-local-mock-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-local-mock-runtime.md`
- `src/server/services/model-config-runtime.ts`
- `src/server/services/ai-mock-provider-runtime.ts`
- `src/server/services/ai-scoring-service.ts`
- `src/server/services/ai-explanation-hint-service.ts`
- `src/server/services/knowledge-recommendation-service.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- `tests/unit/phase-12-model-config-local-mock-runtime.test.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`

## Implementation Notes

- Added `createRedactedModelConfigRuntimeSnapshot` for service-level model_config metadata.
- Resolver selections now expose `redactedModelConfigMetadata` with public IDs, provider key/display name, function type, model name, fallback public ID, prompt template key/version, static `redacted_metadata` policy, and `local_mock` provider mode.
- AI scoring, explanation, hint, knowledge recommendation, and learning suggestion mock runtime now include redaction-safe model_config metadata in `requestRedactedSnapshot.modelConfig`.
- Provider request/response/error payloads in scoring, explanation, hint, and learning suggestion mock runtime are wrapped under redaction-sensitive keys before snapshotting so raw provider payloads are hashed.
- Added a non-destructive legacy-column fallback query for `listModelConfigs` so local E2E can still read existing dev databases that have not applied the Phase 12 schema migration.
- Updated role-based E2E sensitive checks to allow redaction-safe field names like `secretStatus` while still rejecting raw secret-bearing fields.

## Validation Results

- `npm.cmd run test:unit -- tests/unit/*ai* tests/unit/*model* src/server/services/*ai*test.ts src/server/services/*model*test.ts`
  - Result: failed on Windows because the glob was passed literally and Vitest found no matching files.
  - Follow-up: ran explicit equivalent files below.
- `npm.cmd run test:unit -- tests/unit/phase-12-model-config-local-mock-runtime.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/phase-11-model-config-fallback-runtime.test.ts tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-9-ai-knowledge-model-config-runtime.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts tests/unit/phase-11-ai-call-log-visibility-fix.test.ts tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts`
  - Result: pass, 10 files, 34 tests.
- `npm.cmd run test:e2e`
  - First run: failed because the existing local dev database lacked Phase 12 added columns used by model_config admin reads.
  - Second run: failed because E2E sensitive-term guard treated redaction-safe field name `secretStatus` as a raw secret leak.
  - Final result: pass, 15 Chromium tests.
- `npm.cmd run build`
  - First run: failed on a type error from an accidental provider-list fallback return type.
  - Final result: pass.
  - Note: Next.js printed its standard environment-file presence line. No environment values were inspected, recorded, or modified.
- `npm.cmd run lint`
  - First run: sandbox EPERM reading local `node_modules`.
  - Escalated local dev rerun: pass.
- `npm.cmd run typecheck`
  - First run: sandbox EPERM reading local `node_modules`.
  - Escalated local dev rerun: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: inventory pass before commit; showed only this task's uncommitted files.
- `git diff --check`
  - Result: pass.

## Forbidden Scope Self-Check

- `.env.local` read/modify/output: not manually read, modified, or output; `next build` printed the environment file presence line but no values.
- `.env.example` read/modify/output: not touched.
- package/lockfile changes: none.
- schema/migration changes: none.
- real provider/cloud/staging/prod/deploy access: none.
- raw secret/token/Authorization/database URL/provider payload/prompt/answer/model response evidence: none.
- Tests use synthetic placeholder raw strings only and assert they are absent from persisted AI call log drafts.

## 品味合规自检 Checklist

- 命名规范：新增 helper 和 DTO 使用 `modelConfig`/`provider`/`promptTemplate` camelCase 字段，业务术语保持 `model_config` / `ai_call_log` / `prompt_template`。
- API envelope：未新增 API route；repository legacy fallback 仍返回既有 paginated DTO shape。
- Secret redaction：不存储真实 secret，不输出 `apiKey`/`secretValue`/`providerSecret`；E2E 仅允许 redaction-safe `secretStatus` 字段名。
- Provider payload redaction：mock/scoring/explanation/hint provider payload 先包入 sensitive keys 再 redaction，避免 raw payload 透传。
- AI call log：request snapshot 只新增 redaction-safe model_config metadata，不记录 raw prompt、raw answer、raw model response 或 raw provider payload。
- Local runtime：继续使用 local mock/deterministic provider，未连接真实 provider。
- 数据库安全：未新增 migration，legacy fallback 为只读 SELECT，无 DROP/DELETE/TRUNCATE/数据重写。
- 依赖安全：未修改 package/lockfile，未新增、升级或删除依赖。
- 环境边界：未连接 provider/cloud/staging/prod，未部署，未记录任何 secret/env value。

## Post-Merge Evidence

- Merge target: `master`
- Source branch: `codex/phase-12-model-config-local-mock-runtime`
- Feature commit: `e146e84 feat(ai): add local mock model config metadata`
- Initial merge commit before evidence amend: `5422e77 merge: add phase 12 local mock model config runtime`
- Master verification:
  - `npm.cmd run test:unit -- tests/unit/phase-12-model-config-local-mock-runtime.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/phase-11-model-config-fallback-runtime.test.ts tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-9-ai-knowledge-model-config-runtime.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts tests/unit/phase-11-ai-call-log-visibility-fix.test.ts tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts`: pass, 10 files, 34 tests.
  - `npm.cmd run test:e2e`: pass, 15 Chromium tests.
  - `npm.cmd run build`: pass. Next.js printed the standard environment-file presence line; no values were inspected, recorded, or modified.
  - `npm.cmd run lint`: sandbox EPERM first, escalated local dev rerun pass.
  - `npm.cmd run typecheck`: sandbox EPERM first, escalated local dev rerun pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; master ahead of `origin/master` by feature + merge commits before push.
  - `git diff --check`: pass.
- Post-merge forbidden scope check:
  - No package/lockfile/schema/migration changes.
  - No provider/cloud/staging/prod/deploy access.
  - No secret/env value, raw provider payload, raw prompt, raw answer, or raw model response recorded in evidence.
