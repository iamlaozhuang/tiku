# 2026-07-02 AI Generation Post Runtime Resource Provider Rerun Evidence

## Scope

- Task id: `ai-generation-post-runtime-resource-provider-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-runtime-resource-provider-rerun`
- Evidence mode: sanitized role/workflow status only.
- Sensitive evidence policy: no credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, raw prompt, Provider payload, raw AI output, generated question/paper content, or full resource/material/chunk content.

## Preflight

- Current branch created: pass.
- Task plan created: pass.
- Project state/task queue materialized: pass.
- Localhost check: pass, `http://localhost:3000` returned HTTP 200.
- Runtime RAG aggregate:

```text
runtimeResourceRows=25
marketing|3|rag_ready resourceCount=11 chunkCount=144
marketing|all|rag_ready resourceCount=13 chunkCount=298
monopoly|all|rag_ready resourceCount=1 chunkCount=77
ragReadyWithoutRetrievableContent=0
```

## Credential Handling

- Local test credential file was loaded in memory only.
- Role labels present: 8.
- Credential values were not printed, recorded, committed, or written to evidence.
- Browser storage, cookie, token, session, localStorage, and Authorization header were not inspected or recorded.

## Browser Sample Results

| Role          | Route                             | Workflow | Parameters          | Result          | Evidence | UI wording | Notes                                                                  |
| ------------- | --------------------------------- | -------- | ------------------- | --------------- | -------- | ---------- | ---------------------------------------------------------------------- |
| content_admin | `/content/ai-question-generation` | AI 出题  | marketing / level 3 | fail_or_blocked | max 0    | fail       | Submitted once; after wait, page still showed submit/insufficient mix. |
| content_admin | `/content/ai-paper-generation`    | AI 组卷  | marketing / level 3 | fail_or_blocked | max 0    | fail       | Submitted once; after wait, page still showed submit/insufficient mix. |

## Findings

- `P1` Resource grounding remains ineffective in visible local owner-preview flow even after runtime resource import. The sampled marketing level 3 flows still surfaced evidence count `0` and insufficient-resource wording.
- `P1` Ordinary AI UI still shows technical product wording signal: `合同已就绪`. This is not the earlier `本地合约/已脱敏` leak, but it is still unsuitable ordinary-operator wording.
- `P1` Static source inspection indicates the likely root cause is query/resource token mismatch rather than missing runtime resources. The runtime import created available chunks, but the local retrieval score can still stay below sufficient threshold when the Provider grounding query does not match resource chunk tokens closely enough.
- `P2` Legacy level labels were not reproduced. The sampled pages showed `1级` through `5级`, not `高级工/中级工/技师`.
- `P2` No obvious off-domain generated output was recorded. No generated text was recorded by policy.
- `Blocked` Logistics remains blocked by missing local package coverage and must not be treated as passed.

## Provider Boundary

- UI submit attempts: 2.
- Provider completion: not accepted as proven.
- Raw prompt, Provider payload, raw AI output, and generated content: not recorded.
- Further Provider attempts were stopped after the shared grounding/UI blockers reproduced.

## Validation

- Pending before closeout:
  - `npm.cmd run typecheck`
  - `git diff --check`
  - scoped Prettier check
  - Module Run v2 pre-commit / pre-push gates

## Next Task

- Recommended next task: `ai-generation-grounding-query-and-contract-wording-repair-2026-07-02`.
- Scope: source/test repair to align grounding query tokens with runtime RAG chunks and replace ordinary UI `合同已就绪` wording with business-language copy across AI 出题 / AI组卷 shared surfaces.
