# Evidence: phase-9-ai-knowledge-model-config-runtime

## Metadata

- Task id: `phase-9-ai-knowledge-model-config-runtime`
- Branch: `codex/phase-9-ai-knowledge-model-config-runtime`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-ai-knowledge-model-config-runtime-security-review.md`

## Scope

Allowed files followed:

- task plan, evidence, and security review
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/questions/**`
- `src/server/contracts/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `tests/unit/**`
- agent state files

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Summary

- Added `POST /api/v1/questions/{publicId}/recommend-knowledge-nodes`.
- Added a local deterministic `kn_recommendation` runner using the existing recommendation service and redaction path.
- Recommendation responses return pending-confirmation candidates with public knowledge-node identifiers, confidence, source, and model/prompt version metadata.
- Recommendation runtime writes `ai_call_log` drafts through `appendAiCallLog` with raw question, answer, prompt, provider request, provider response, and citations redacted.
- Recommendation runtime writes `audit_log` entries for `question.recommend_knowledge_nodes`.
- Wired `POST /api/v1/model-configs/{publicId}/enable` and `/disable` to authenticated runtime handlers instead of unavailable placeholders.
- Model config mutation requires `super_admin`, updates by `publicId`, and writes redacted `audit_log` entries for success, missing resource, and known-actor permission denial.

## Scope Conflict Handling

- The requirements mention asynchronous first-save recommendation and writing question knowledge-node bindings.
- The task queue blocks schema/migration changes, and the current schema does not include a question-to-knowledge-node recommendation or binding table.
- This task therefore implements the action runtime, returns candidates for confirmation, and records `audit_log`/`ai_call_log`. Persistence of recommendation candidates and async queue execution remain deferred.

## TDD Notes

- RED: `npm.cmd run test:unit -- tests/unit/phase-9-ai-knowledge-model-config-runtime.test.ts`
  - Failed with missing `handlers.questions.recommendKnowledgeNodes.POST`.
  - Failed with missing `handlers.modelConfigs.enable.POST`.
  - Failed with missing `handlers.modelConfigs.disable.POST`.
- GREEN: same focused command passed with `3` tests.
- Focused regression passed with `4` files and `14` tests:
  - `tests/unit/phase-9-ai-knowledge-model-config-runtime.test.ts`
  - `tests/unit/phase-9-content-question-material-runtime.test.ts`
  - `tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts`
  - `src/server/services/knowledge-recommendation-service.test.ts`

## Boundary Notes

- No dependency, lockfile, schema, migration, `.env.example`, real provider, production resource, deploy, or PR change.
- No raw prompt, raw question stem, raw standard answer, raw model output, API key, secret, password, session token, or numeric internal id is returned in DTOs.
- Model config enable/disable does not expose provider credentials and only accepts external `publicId`.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-ai-knowledge-model-config-runtime
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results so far:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-ai-knowledge-model-config-runtime`: pass.
- `npm.cmd run test:unit`: pass, `100` files and `366` tests passed.
- `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `100` files and `366` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass. Next.js compiled successfully and included `/api/v1/questions/[publicId]/recommend-knowledge-nodes`.
- `Test-NamingConventions.ps1`: pass; banned terms absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; branch has no upstream and changes are task scoped.

## Residual Risk

- Async queue behavior, first-save automatic trigger, and persisted question knowledge-node recommendation/binding state require a later task with approved schema and queue scope.
