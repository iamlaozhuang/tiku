# Phase 20 Fix RA-05-06 Vector Rebuild Stale Marker Evidence

## Summary

- Result: pass.
- Scope: implementation/local_verification.
- Changed surfaces: local deterministic RAG retrieval, local resource vector snapshot lifecycle, AI/RAG DTO types, unit tests, task plan, task queue, project state.
- Gates: task claim readiness pass; RED test observed; targeted unit pass; full unit pass; typecheck pass; e2e pass after local dev server restart; readiness pass; naming pass; quality gate pass; git diff check pass.
- Forbidden scope (`forbiddenScope`): no env read/write, no dependency/package/lockfile change, no schema/migration/drizzle change, no staging/prod/cloud/deploy, no real provider/vector cloud call, no destructive data operation, no `drizzle-kit push`.
- Residual gaps (`residualGaps`): real vector provider/cloud atomic switch remains blocked by `real-provider-staging-redaction` and `deploy-and-cloud-change`; this task covers local deterministic/mock semantics only.

## Human Approval

User approved `phase-20-fix-ra-05-06-vector-rebuild-stale-marker` local implementation on 2026-05-29. Approved risk included `external_service_config`, bounded strictly to local deterministic/mock RAG runtime and resource lifecycle evidence. Real provider, vector cloud, staging/prod/cloud/external service configuration, dependency changes, env/secret changes, schema/migration changes, deployment, destructive data operations, and `drizzle-kit push` remain blocked.

## Implementation Evidence

- Added local active chunk snapshots for local resource catalog entries.
- Successful local rebuild writes the next active snapshot only after chunking succeeds, giving the local runtime an atomic switch point.
- Editing a local `rag_ready` resource with an existing active snapshot preserves the old active snapshot, keeps the resource retrieval-eligible, and marks vector state stale.
- Failed local rebuild preserves the previous active snapshot when one exists and keeps citations stale rather than clearing the last usable local evidence.
- Local retrieval now emits redaction-safe stale markers through `isStale`, `staleCitationCount`, and `staleResourcePublicIds`.
- External DTO fields are additive and optional for compatibility; actual local retrieval results include the stale marker fields.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- tests/unit/phase-20-ra-05-06-vector-rebuild-stale-marker.test.ts`
- RED result: fail as expected.
- RED failure 1: stale retrieval returned no old citation after editing a `rag_ready` local resource.
- RED failure 2: failed local rebuild did not preserve a stale active snapshot for retrieval.
- GREEN command: `npm.cmd run test:unit -- tests/unit/phase-20-ra-05-06-vector-rebuild-stale-marker.test.ts`
- GREEN result: pass, 1 test file passed, 2 tests passed.

## Validation Commands

| Command                                                                                                                                                                | Result                              | Evidence                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-05-06-vector-rebuild-stale-marker` | pass                                | task claim readiness passed                                                                                                                       |
| `npm.cmd run test:unit -- tests/unit/phase-20-ra-05-06-vector-rebuild-stale-marker.test.ts`                                                                            | pass                                | 1 test file passed, 2 tests passed                                                                                                                |
| `npm.cmd run test:unit -- src/rag/retrieval.test.ts src/rag/chunking.test.ts`                                                                                          | pass                                | 2 test files passed, 7 tests passed                                                                                                               |
| `npm.cmd run test:unit -- tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`            | pass                                | 2 test files passed, 8 tests passed                                                                                                               |
| `npm.cmd run typecheck`                                                                                                                                                | pass after sandbox escalation       | first sandbox run failed with EPERM opening TypeScript executable under `node_modules`; escalated rerun passed with `tsc --noEmit`                |
| `npm.cmd run test:unit`                                                                                                                                                | pass                                | 136 test files passed, 578 tests passed                                                                                                           |
| `npm.cmd run test:e2e`                                                                                                                                                 | pass after local dev server restart | first run failed because Playwright reused stale localhost:3000 dev server state; after stopping local Node process `2656`, rerun passed 25/25    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                         | pass                                | readiness files, scripts, npm gates, and skill paths passed                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                    | pass                                | inventory completed on task branch                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                            | pass                                | naming convention scan completed                                                                                                                  |
| `git diff --check`                                                                                                                                                     | pass                                | no whitespace errors                                                                                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                | pass after formatting               | first run failed only on Prettier formatting for the new test file; formatted the file, rerun passed lint, typecheck, test:unit, and format:check |

## Security Review

- Task id: `phase-20-fix-ra-05-06-vector-rebuild-stale-marker`
- Branch: `codex/phase-20-fix-ra-05-06-vector-rebuild-stale-marker`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-29
- Files reviewed:
  - `src/rag/retrieval.ts`
  - `src/server/contracts/ai-rag-contract.ts`
  - `src/server/services/rag-retrieval-service.ts`
  - `src/server/services/rag-resource-knowledge-runtime.ts`
  - `tests/unit/phase-20-ra-05-06-vector-rebuild-stale-marker.test.ts`
- Risk types reviewed: `rag_runtime`, `resource_lifecycle`, `external_service_config`, `local_human_verification`, `evidence_integrity`.
- Abuse cases considered:
  - stale local citations appearing without an explicit marker;
  - failed rebuild clearing the last usable local evidence;
  - stale marker exposing raw provider/vector storage internals;
  - real provider/vector cloud behavior being implied by local mock evidence.
- Data exposure review: stale marker fields expose only booleans/counts/public ids already present in citation metadata. Evidence avoids raw full resource content, secrets, provider payloads, tokens, and environment values.
- Authorization boundary review: retrieval still filters by `authorizedResourcePublicIds`, profession, level, and `rag_ready` status before citations are returned.
- API contract review: additive DTO fields are camelCase and optional for compatibility; no response envelope changes.
- Test coverage and accepted gaps: unit tests cover local old-snapshot preservation, stale markers, successful atomic switch, and failed rebuild preservation. Real vector provider/cloud atomicity remains blocked and unclaimed.
- Verdict: `APPROVE`.

## Git Closeout

- branch: `codex/phase-20-fix-ra-05-06-vector-rebuild-stale-marker`
- base: `master`
- changed files before implementation commit: pending
- implementation commit: pending
- merge: pending
- push: pending
- cleanup: pending
