# Evidence: phase-11-mvp-resource-knowledge-base-publish-index-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-resource-knowledge-base-publish-index-loop`
- Goal: close local resource/knowledge_base publish-index evidence for fixture-safe Markdown publish, indexing readiness, citation source behavior, permission-filtered retrieval, audit logging, and rebuild failure handling.

## Boundary

- Local dev runtime only.
- Fixture/mock-backed resource and RAG behavior only.
- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No secret/env change.
- No real provider, real vector service, real OCR, or object-storage connection.
- No destructive data operation.
- No token, Authorization header, raw payload, raw prompt, raw answer, raw model response, full paper/material/OCR/resource text, raw chunk text, embedding value, object storage secret, or private data recorded.

## Boundary Correction

- Runtime inspection found that resource publish/index behavior is owned by the existing route-handler -> service -> repository/model layering.
- Added `src/server/repositories/**` and `src/server/models/**` to this task's allowed files so the local publish status transition and default repository implementation can be completed.
- No schema, migration, script, dependency, package, lockfile, env/secret, cloud, deployment, staging/prod, object-storage, or real-provider work is approved or performed by this correction.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, staging/prod, deployment, real provider, object storage, major permission model, and destructive data operations.

## AC-to-Runtime Matrix

| Acceptance criterion                                                   | Runtime surface                                            | Current state | Implementation evidence                                                                                                      | Downstream effect                                    | Remaining gap                         | Decision                 |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- | ------------------------ |
| Content ops can publish a resource/knowledge_base Markdown draft       | `/api/v1/resources/{publicId}/publish`, admin resource UI  | implemented   | RED/GREEN test covers publicId route, admin UI publish confirmation, state update to `published`, and redacted audit summary | Resource becomes eligible for manual vector rebuild  | Upload/conversion remains follow-up   | close local publish loop |
| Indexing creates chunk/vector lifecycle without real provider calls    | resource rebuild-vector route, RAG chunking service        | implemented   | RED/GREEN test records `indexing` before final `rag_ready`; full unit tests cover fixture-safe chunk summaries               | RAG can retrieve bounded fixture chunks              | Real vector provider remains gated    | close local index loop   |
| Citation source metadata is redacted and externally safe               | `createRagCitationSourceDtos`, RAG retrieval service       | implemented   | RED/GREEN test verifies external citation source DTO excludes `chunkText` and `textHash`                                     | Student-facing AI references remain source-aware     | none in local fixture scope           | close citation DTO loop  |
| Retrieval is permission-filtered and excludes disabled/unready content | RAG retrieval service                                      | implemented   | Existing and task tests verify authorized ready-only retrieval and no draft/unauthorized text in results/evidence summaries  | Students only receive authorized ready evidence      | Real authorization data remains gated | close local filter loop  |
| Audit and rebuild failure handling are visible without raw text        | audit_log, resource status/error summary runtime, list DTO | implemented   | Publish/rebuild audit tests use redacted summaries; list DTO exposes whitelisted `indexingErrorSummary` only                 | Ops can review lifecycle attempts without data leaks | Full audit coverage task remains      | close local audit slice  |

## Problem Grading

| Severity | Affected role       | Reproduction path or command                     | Expected result                                                                           | Actual result before task                                                                            | Fixed status                 | Residual risk                                                                  | Follow-up       |
| -------- | ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ | --------------- |
| P1       | content ops, admin  | `/ops/resources`, `/api/v1/resources`            | local publish/index lifecycle, status transitions, and rebuild evidence                   | Prior audit says resource/knowledge_base upload, Markdown publish, indexing, and citation incomplete | fixed in local fixture scope | Upload/conversion/download/object-storage remain approval-gated follow-ups     | follow-up tasks |
| P1       | student AI/RAG user | RAG retrieval and citation-consuming AI surfaces | permission-filtered, ready-only retrieval with redacted citation metadata and no raw text | Prior audit says chunk/vector lifecycle and permission-filtered retrieval are incomplete             | fixed in local fixture scope | Real provider/vector/object-storage and full AI-call-log coverage remain gated | follow-up tasks |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master at 8b7dd16.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-resource-knowledge-base-publish-index-loop
Result on branch codex/phase-11-mvp-resource-knowledge-base-publish-index-loop: pass while task status was pending.

npm.cmd run test:unit -- tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts
Result after RED tests: failed as expected.
- publish route failed because handlers.resources.publish.POST was missing.
- citation source DTO failed because createRagCitationSourceDtos was missing.

npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts
Result after UI RED test: failed as expected because the resource row did not expose a `发布 Markdown` action.

npm.cmd run test:unit -- tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts
Result after GREEN implementation: pass, 3 tests.

npm.cmd run test:unit -- tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts src/server/services/rag-retrieval-service.test.ts src/server/services/rag-chunking-service.test.ts
Result after related regression validation: pass, 5 files / 20 tests.

npm.cmd run typecheck
Result: pass.

npm.cmd run test:unit
Result: pass, 112 files / 426 tests.

npm.cmd run build
Result: pass. Build output listed `.env.local` as a Next.js environment source; this task did not read or record `.env.local` contents.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result before commit: pass inventory. It correctly reported uncommitted task files and no staged changes.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: pass. It ran lint, typecheck, test:unit, and format:check.

git diff --check
Result: pass.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                                     | Result  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-resource-knowledge-base-publish-index-loop`, not master/main                                    | Pass    |
| Allowed files        | Runtime edits are under allowed resources/admin/contracts/models/repositories/services/tests/docs roots; boundary correction recorded | Pass    |
| Blocked files        | No package, lockfile, env, schema, migration, script, cloud, deployment, staging/prod file change                                     | Pass    |
| AC-to-runtime matrix | Matrix records implemented local publish/index/citation/retrieval/audit runtime evidence                                              | Pass    |
| Problem grading      | P1 local fixture scope fixed; gated residuals recorded                                                                                | Pass    |
| Validation record    | RED/GREEN, related tests, full unit, build, readiness, naming, quality gate, and diff check recorded                                  | Pass    |
| Evidence hygiene     | No secrets, raw resource text, raw chunks, embeddings, provider payloads, or prohibited data recorded                                 | Pass    |
| Commit               | Ready after evidence/state update                                                                                                     | Pending |
| Merge                | Pending post-commit                                                                                                                   | Pending |
| Push                 | Pending post-merge                                                                                                                    | Pending |
| Cleanup              | Pending post-push                                                                                                                     | Pending |
| Worktree residue     | No worktree-specific residue created                                                                                                  | Pass    |
| stagingDecision      | Local task can close; staging remains blocked by remaining MVP gap tasks and hard gates                                               | Pass    |
| Next step            | Commit, merge to `master`, push, cleanup branch, then claim next queue task                                                           | Pass    |

## stagingDecision

local_task_complete_staging_blocked

## Next Step

Commit this task, merge/push to `master`, clean the short lifecycle branch, then claim `phase-11-mvp-knowledge-node-tree-management-loop` from a clean repository.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunk text, embedding values, object storage secrets, and private data.
