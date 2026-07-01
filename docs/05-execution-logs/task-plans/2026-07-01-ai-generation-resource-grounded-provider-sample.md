# AI Generation Resource-Grounded Provider Sample

## Task

- Task id: `ai-generation-resource-grounded-provider-sample-2026-07-01`
- Branch: `codex/ai-generation-resource-grounded-provider-sample`
- Goal: create a local resource / RAG baseline strong enough for grounded AI 出题 / AI 组卷, then rerun bounded real Provider samples without relaxing the grounding gate.
- Depends on: `ai-generation-post-grounding-provider-matrix-rerun-2026-07-01`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADR files under `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Prior evidence:
  - `docs/05-execution-logs/evidence/2026-07-01-ai-generation-post-grounding-provider-rerun.md`

## Boundaries

- Localhost owner-preview only.
- Runtime resource writes are limited to `.runtime/uploads/dev/resource/**`.
- Prepared D drive owner-facing fixture package may be read only for selecting/importing a small resource baseline.
- Agent may read local private role credentials only to input them into localhost login screens.
- Do not output, save, or commit credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database connection strings, raw DB rows, internal auto ids, PII, raw prompts, Provider payloads, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.
- No source, test, package, lockfile, dependency, schema, migration, seed, staging, prod, cloud, deploy, PR, force-push, release-readiness, final Pass, or Cost Calibration changes.

## Implementation Plan

1. Inventory current local runtime resource catalog using aggregate counts only.
2. Inspect the prepared fixture package using only metadata-safe counts and scope labels.
3. Prefer existing localhost resource management APIs/UI to import, publish, and rebuild vectors for a minimal `marketing` level 3 baseline.
4. If `marketing` level 3 cannot reach `sufficient`, try the `monopoly` level 3 fallback only within the same redaction and runtime boundaries.
5. Confirm grounding with service-level retrieval summaries: `evidenceStatus`, citation count, and scope label only.
6. Only after `sufficient`, rerun bounded Provider samples through localhost UI:
   - content admin AI 出题 and AI 组卷 first;
   - then eligible advanced student/employee/admin flows if the same scope can be selected or is the route default.
7. Record pass / fail / blocked / not_applicable results with safe status labels and duration buckets.

## Exit Criteria

- At least one scoped route-integrated generation query reaches `evidenceStatus=sufficient`, or the task closes as blocked with the exact safe reason category.
- Real Provider calls are made only after sufficient grounding.
- Evidence records no raw resource/chunk/provider/generated text.
- If fresh AI 组卷 succeeds, evidence records only safe structure signals such as `paper_section count present` and `question type distribution present`.
- No ordinary UI exposes internal governance wording during the rerun.

## Exit Note

- This task may close after recording a sufficient local resource baseline and bounded Provider samples.
- Full cross-role Provider rerun should not continue under this task if stale task/result reuse is confirmed, because it would create misleading evidence and unnecessary Provider calls.
- Follow-up source repair must cover deterministic admin task/result identity, generated-result refresh semantics, student/admin business-language UI labels, and then rerun the role matrix.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-resource-grounded-provider-sample.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-resource-grounded-provider-sample.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-resource-grounded-provider-sample.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-resource-grounded-provider-sample-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-resource-grounded-provider-sample-2026-07-01 -SkipRemoteAheadCheck`
