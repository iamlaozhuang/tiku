# Phase 12 Model Config Server Runtime Evidence

## Task

- TaskId: `phase-12-model-config-server-runtime`
- Branch: `codex/phase-12-model-config-server-runtime`
- StartedAt: `2026-05-26`

## Initial Recovery

- Current branch: `codex/phase-12-model-config-server-runtime`
- Starting commit: `09b2e55`
- `master` and `origin/master` were aligned at task start.
- Worktree was clean before task plan/evidence/state updates.

## Planned Change Scope

- Server contract, validator, repository, service, API route, and unit-test changes only.
- No schema, migration, dependency, lockfile, env, staging, prod, cloud, provider, deployment, or destructive data work.

## RED/GREEN Log

- RED: `npm.cmd run test:unit -- tests/unit/phase-12-model-config-server-runtime.test.ts`
  - Result: failed as expected.
  - Failure summary: `modelProviders.POST`, `modelConfigs.POST`, `modelConfigs.reorderFallback.POST`, and `promptTemplates.POST` were missing.
- GREEN: `npm.cmd run test:unit -- tests/unit/phase-12-model-config-server-runtime.test.ts src/server/validators/ai-rag.test.ts`
  - Result: passed.
  - Summary: 2 files, 7 tests passed.
- Regression: `npm.cmd run test:unit -- tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/phase-11-model-config-fallback-runtime.test.ts tests/unit/phase-9-ai-knowledge-model-config-runtime.test.ts src/server/validators/ai-rag.test.ts`
  - Result: passed.
  - Summary: 4 files, 14 tests passed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-model-config-server-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-server-runtime.md`
- `src/app/api/v1/model-configs/route.ts`
- `src/app/api/v1/model-configs/[publicId]/route.ts`
- `src/app/api/v1/model-configs/reorder-fallback/route.ts`
- `src/app/api/v1/model-providers/route.ts`
- `src/app/api/v1/model-providers/[publicId]/route.ts`
- `src/app/api/v1/model-providers/[publicId]/enable/route.ts`
- `src/app/api/v1/model-providers/[publicId]/disable/route.ts`
- `src/app/api/v1/prompt-templates/route.ts`
- `src/app/api/v1/prompt-templates/[publicId]/route.ts`
- `src/app/api/v1/prompt-templates/[publicId]/enable/route.ts`
- `src/app/api/v1/prompt-templates/[publicId]/disable/route.ts`
- `src/server/contracts/admin-ai-audit-log-ops-contract.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- `src/server/services/admin-ai-audit-log-ops-service.ts`
- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/validators/ai-rag.ts`
- `src/server/validators/ai-rag.test.ts`
- `tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts`
- `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`
- `tests/unit/phase-12-model-config-server-runtime.test.ts`

## Implementation Notes

- Added redaction-safe DTO fields for provider secret status, masked secret display, model config status, fallback priority, snapshot policy, and prompt template body metadata.
- Added server runtime handlers for model provider list/create/update/enable/disable, model config create/update/reorder fallback, and prompt template list/create/update/enable/disable.
- Added API route exports under `/api/v1/model-providers`, `/api/v1/model-configs`, and `/api/v1/prompt-templates`.
- Added validator normalization so short-lived secret input is converted to last-four and masked metadata only.
- Added repository contracts and conservative Postgres methods without schema changes or destructive data operations.

## Validation Results

- `npm.cmd run test:unit -- tests/unit/*model* src/server/services/*model*test.ts src/server/services/*prompt*test.ts`
  - Result: failed on Windows because the glob was passed literally and Vitest found no matching files.
  - Follow-up: ran explicit equivalent files below.
- `npm.cmd run test:unit -- tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/phase-11-model-config-fallback-runtime.test.ts tests/unit/phase-9-ai-knowledge-model-config-runtime.test.ts src/server/validators/ai-rag.test.ts`
  - Result: pass, 4 files, 14 tests.
- `npm.cmd run lint`
  - First run: sandbox EPERM reading local `node_modules`.
  - Escalated local dev rerun: pass.
- `npm.cmd run typecheck`
  - First run: sandbox EPERM reading local `node_modules`.
  - Escalated local dev rerun after fixes: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: inventory pass before commit; showed only this task's uncommitted files.
- `git diff --check`
  - Result: pass.

## Forbidden Scope Self-Check

- `.env.local` read/modify/output: not touched.
- `.env.example` read/modify/output: not touched.
- package/lockfile changes: none.
- schema/migration changes: none.
- real provider/cloud/staging/prod/deploy access: none.
- raw secret/token/Authorization/database URL/provider payload/prompt/answer/model response evidence: none.
- Tests use synthetic placeholder inputs only and assert they are not returned or audited.

## 品味合规自检 Checklist

- 命名规范：API route 使用 kebab-case 复数名词，JSON DTO 使用 camelCase，业务术语使用 `model_provider` / `model_config` / `prompt_template`。
- API envelope：新增 runtime handler 均返回 `{ code, message, data, pagination? }`。
- Secret redaction：服务端只返回 `secretStatus` / `maskedSecret` / last-four 派生元数据，不返回输入 secret。
- Prompt redaction：prompt template 管理接口只返回 digest 与 masked preview，不返回 raw prompt body。
- 审计日志：mutation audit 使用固定 redacted metadata summary，不记录 request body、Authorization、secret、raw prompt 或 provider payload。
- 数据库安全：未新增 migration，repository SQL 无 DROP/DELETE/TRUNCATE/数据重写。
- 依赖安全：未修改 package/lockfile，未新增、升级或删除依赖。
- 环境边界：未读取或修改 `.env.local` / `.env.example`，未连接 provider/cloud/staging/prod，未部署。
