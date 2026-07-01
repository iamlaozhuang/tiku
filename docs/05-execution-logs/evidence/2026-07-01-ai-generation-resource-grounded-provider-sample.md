# AI Generation Resource-Grounded Provider Sample Evidence

## Redaction Boundary

- Allowed: task ids, branch, role labels, route labels, workflow labels, pass/fail/blocked/not_applicable status, scope labels, aggregate resource counts, evidence status, citation counts, duration buckets, validation command names, commit/merge/push/cleanup summaries.
- Forbidden: credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database connection strings, raw DB rows, internal auto ids, PII, raw prompts, Provider payloads, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, full question/paper/material/resource/chunk content.

## Initial State

- Branch: `codex/ai-generation-resource-grounded-provider-sample`
- Task id: `ai-generation-resource-grounded-provider-sample-2026-07-01`
- Depends on: `ai-generation-post-grounding-provider-matrix-rerun-2026-07-01`
- Provider submit cap: `8`
- Status: in progress.

## Resource Baseline

| Item                                       | Result | Summary                                                                                                                                  |
| ------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime upload catalog                     | pass   | Initial preferred scope had `3` resources; only `1` was already `rag_ready`.                                                             |
| Fixture package metadata                   | pass   | Prepared package contained owner-facing material for the preferred scope; only aggregate file counts were inspected.                     |
| Existing draft publish / vector rebuild    | pass   | Two existing local draft resources were published/rebuilt; preferred-scope chunks increased but remained weak for target queries.        |
| Minimal fixture conversion                 | pass   | Four preferred-scope document assets were converted to runtime-only Markdown; no source text was recorded.                               |
| Resource import / publish / vector rebuild | pass   | Four converted resources were imported, published, and rebuilt; all reached `rag_ready`.                                                 |
| Query term reinforcement                   | pass   | Runtime-only metadata keywords were added to converted resources to match current route query terms without relaxing the retrieval gate. |
| Grounding retrieval after import           | pass   | Preferred-scope default AI 出题 and AI 组卷 route queries reached `evidenceStatus=sufficient` with `citationCount=3`.                    |

## Cross-Role / Cross-UI Scan Addendum

| Scan Item                         | Result | Summary                                                                                                                                                                        |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product AI entry surfaces         | pass   | Static scan found shared admin entry surfaces for content and organization AI 出题/AI 组卷, plus shared student AI entry surface for personal and organization employee flows. |
| Governance/debug wording in AI UI | mixed  | Ordinary AI generation pages no longer showed `本地合约` or `已脱敏`; admin generated-content badge still uses governance-style wording `不持久化正文`.                        |
| Student AI history/detail labels  | fail   | Static scan found technical labels such as `evidenceStatus`, `citationCount`, and `formalAdoptionStatus` rendered in student AI history/detail surfaces.                       |
| Ops audit surfaces                | pass   | Ops audit pages intentionally expose redaction/audit labels in an audit context; they are not counted as ordinary paid-user/product surfaces.                                  |

## Provider Sample Matrix

| Role                        | Route / flow           | AI 出题 | AI 组卷 | Notes                                                                                                                                                                                                                         |
| --------------------------- | ---------------------- | ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_admin`             | content AI routes      | fail    | fail    | AI 出题 executed Provider and produced a parsed `10/10` structured preview, but the immediate summary still showed `资料不足`. AI 组卷 showed Provider executed but no visible structured preview and also showed `资料不足`. |
| `personal_advanced_student` | `/ai-generation`       | blocked | blocked | Blocked from rerun in this task because the shared evidence/persistence mismatch must be fixed first to avoid recording misleading product results.                                                                           |
| `org_advanced_employee`     | `/ai-generation`       | blocked | blocked | Same blocker as student route; route remains in the cross-role follow-up matrix.                                                                                                                                              |
| `org_advanced_admin`        | organization AI routes | blocked | blocked | Same shared admin entry surface, but organization-specific rerun is blocked until the stale-result/idempotency issue is repaired.                                                                                             |

## Findings Captured For Follow-Up

| Finding                     | Severity | Safe root-cause summary                                                                                                                                                                                                                                    |
| --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN-AI-IDEMPOTENCY-01`   | P1       | Admin AI task/result public ids and idempotency keys are deterministic by workspace, generation kind, and actor. `createOrReuse` can reuse a stale draft result from an earlier insufficient-grounding run even after a later Provider execution succeeds. |
| `ADMIN-AI-EVIDENCE-01`      | P1       | Content admin AI 出题 can execute Provider and parse `10/10` drafts, while the immediate product summary still says `资料不足` because the returned generated result can be stale/reused.                                                                  |
| `ADMIN-AI-PAPER-VISIBLE-01` | P1       | Content admin AI 组卷 can show `模型服务=已执行` and a result reference while no visible structured paper preview is shown.                                                                                                                                |
| `PRODUCT-UI-GOVERNANCE-01`  | P2       | Ordinary AI generation surfaces no longer showed `本地合约` or `已脱敏`, but still contain governance-style wording such as `不持久化正文`; student history/detail surfaces expose technical labels.                                                       |
| `RAG-QUERY-TOKENIZATION-01` | P2       | Local Chinese retrieval depends heavily on exact query-token overlap; runtime keyword reinforcement was needed for current owner preview without lowering the sufficient-evidence gate.                                                                    |

## Validation Log

- `npm.cmd exec -- prettier --check --ignore-unknown <changed docs/state>`: passed after formatting the evidence Markdown.
- `git diff --check`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: initially failed on a generated `.next/dev/types` cache file after dev-server interruption; the localhost listener was stopped, `.next` was verified inside the workspace and removed, then `typecheck` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-resource-grounded-provider-sample-2026-07-01`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-resource-grounded-provider-sample-2026-07-01 -SkipRemoteAheadCheck`: passed.

## 脱敏检查

- Passed for recorded evidence: no credentials, session material, `.env*`, Provider payload, prompt, raw AI input/output, generated正文, raw DOM, screenshot, DB raw row, internal id, PII, or full resource/chunk content recorded.
