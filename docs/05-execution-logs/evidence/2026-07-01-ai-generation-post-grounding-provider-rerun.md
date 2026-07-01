# AI Generation Post-Grounding Provider Matrix Rerun Evidence

## Redaction Boundary

- Allowed: task ids, branch, role labels, route labels, workflow labels, pass/fail/blocked/not_applicable status, safe count labels, duration buckets, validation command names, commit/merge/push/cleanup summaries.
- Forbidden: credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database connection strings, raw DB rows, internal auto ids, PII, raw prompts, Provider payloads, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, full question/paper/material/resource/chunk content.

## Initial State

- Branch: `codex/ai-generation-post-grounding-provider-rerun`
- Task id: `ai-generation-post-grounding-provider-matrix-rerun-2026-07-01`
- Depends on: `ai-generation-grounding-product-ui-repair-2026-07-01`
- Provider submit cap: `8`
- Status: in progress.

## Preflight

| Item                     | Result                      | Summary                                                                                                                                                                                                                                                                       |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch                   | pass                        | Running on `codex/ai-generation-post-grounding-provider-rerun`.                                                                                                                                                                                                               |
| Localhost                | pass                        | `http://localhost:3000/` returned 200.                                                                                                                                                                                                                                        |
| Browser connection       | pass                        | In-app browser loaded localhost and role login flows.                                                                                                                                                                                                                         |
| Product-copy static scan | pass_with_findings          | AI 出题 / AI 组卷 surfaces were cross-scanned before walkthrough. Ordinary AI surfaces no longer expose `本地合约` / `已脱敏`; technical fields are mapped to business labels on the checked AI pages. Ops/audit diagnostic surfaces remain out of this ordinary UI scope.    |
| Resource / RAG preflight | blocked_for_provider_sample | Runtime upload catalog has only a small marketing level 3 resource set and one `rag_ready` resource. Service-level retrieval summary returned `weak` for marketing level 3 and `none` for monopoly level 3, so the post-repair grounding gate blocks real Provider execution. |

## Cross-Role Static Scan

| Area                        | Result                     | Summary                                                                                                                                                                                                                |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI surface inventory        | pass                       | Covered student `/ai-generation`, organization AI 出题 / AI 组卷, content AI 出题 / AI 组卷, and ops access checks.                                                                                                    |
| Grounding gate              | pass                       | Shared Provider path requires `evidenceStatus=sufficient`, citation count greater than zero, and citations before Provider credential access/execution.                                                                |
| Resource binding            | blocked                    | Current runtime resources are not strong enough for `sufficient` evidence under the local retrieval contract. This prevents generic/hallucinated generation but also blocks visible real Provider samples.             |
| Ordinary UI governance copy | pass                       | Checked AI product surfaces do not expose `本地合约`, `已脱敏`, raw Provider, prompt, payload, or redaction wording.                                                                                                   |
| Generated-topic drift       | not_reproducible_after_fix | No new generated text was produced because grounding blocked execution. Prior history/logistics drift is consistent with the previous ungrounded generation path and is now prevented when evidence is weak or absent. |

## Matrix Results

| Role                        | Route / flow                     | AI 出题        | AI 组卷        | Notes                                                                                                                                               |
| --------------------------- | -------------------------------- | -------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | `/ai-generation`                 | not_applicable | not_applicable | Login passed. AI buttons visible but disabled. No internal governance wording visible.                                                              |
| `personal_advanced_student` | `/ai-generation`                 | blocked        | blocked        | Submit buttons enabled. Both submit attempts returned insufficient-grounding business path; no internal governance wording visible.                 |
| `org_standard_employee`     | `/ai-generation`                 | not_applicable | not_applicable | Login passed. AI buttons visible but disabled. No internal governance wording visible.                                                              |
| `org_advanced_employee`     | `/ai-generation`                 | blocked        | blocked        | Submit buttons enabled. Both submit attempts returned insufficient-grounding business path; no internal governance wording visible.                 |
| `org_standard_admin`        | organization AI routes           | not_applicable | not_applicable | Organization AI routes show standard-version unavailable state and no submit buttons.                                                               |
| `org_advanced_admin`        | organization AI routes           | blocked        | blocked        | Organization AI submit buttons enabled. Both submit attempts returned insufficient-grounding business path; no internal governance wording visible. |
| `content_admin`             | content AI routes                | blocked        | blocked        | Content AI submit buttons enabled. Both submit attempts returned insufficient-grounding business path; no internal governance wording visible.      |
| `ops_admin`                 | content / organization AI routes | not_applicable | not_applicable | No submit-capable AI buttons on checked content or organization AI routes.                                                                          |

## Recheck Items

| Issue                                           | Status                            | Evidence summary                                                                                                                                                                                                                                                 |
| ----------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CROSS-001` resource / RAG grounding constraint | pass_with_blocked_provider_sample | Weak/absent evidence blocks all eligible-role submit attempts before real Provider output is produced. This prevents generic historical/logistics drift. Real Qwen visible generation remains blocked until resources/knowledge nodes reach sufficient evidence. |
| `CROSS-002` internal governance copy exposure   | pass                              | No ordinary AI product surface exposed `本地合约`, `已脱敏`, raw Provider, prompt, payload, or redaction wording during walkthrough.                                                                                                                             |
| ops admin organization AI submit regression     | pass                              | Ops admin checked on organization/content AI routes; no submit-capable AI buttons were exposed.                                                                                                                                                                  |
| AI 组卷 quantity recognition                    | blocked_by_insufficient_grounding | Fresh AI 组卷 output was not produced because grounding blocked execution. Previous source-level parser repair cannot be runtime re-proven until data evidence is sufficient.                                                                                    |

## Provider Attempt Summary

| Item                     | Result                                      |
| ------------------------ | ------------------------------------------- |
| UI submit attempts       | 8 eligible role/function attempts.          |
| Real Provider executions | 0 confirmed by insufficient-grounding path. |
| Provider cap             | pass, cap was 8 and no retry loop was used. |
| Raw output evidence      | none recorded.                              |

## Findings For Next Task

| Finding       | Severity | Summary                                                                                                                                                                                                                                                                           |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST-RAG-01` | P1       | The grounding repair works, but current local runtime resources are not sufficient for real visible generation. Need a separate scoped data/resource task to import/publish/vectorize enough resource and knowledge-node coverage, then rerun the same 8-attempt Provider matrix. |
| `POST-RAG-02` | P2       | History/list areas still contain old generated summaries from earlier attempts, so page-level keyword scans can see stale signals. Future walkthrough should distinguish fresh result cards from historical records, or clear/import a controlled dataset before UI validation.   |
| `POST-RAG-03` | P2       | AI 组卷 quantity recognition could not be runtime revalidated after the grounding fix because no fresh paper output was generated. Keep it open as blocked-by-data, not passed.                                                                                                   |

## Validation Log

- `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`: pass after formatting evidence document.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-grounding-provider-matrix-rerun-2026-07-01`: pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-grounding-provider-matrix-rerun-2026-07-01 -SkipRemoteAheadCheck`: pass.

##脱敏检查

- Pass: evidence contains only role labels, route labels, statuses, safe counts, validation summaries, and redacted resource availability summaries.
