# 2026-07-06 0704 Local Acceptance Baseline Inventory And Grounding Root-Cause Audit Evidence

- Task id: `0704-local-acceptance-baseline-grounding-root-cause-audit-2026-07-06`
- Branch: `codex/0704-baseline-grounding-audit-2026-07-06`
- Evidence mode: redacted aggregate/status evidence only.
- Non-scope executed: no source repair, no dependency change, no env/secret change, no Provider call, no browser rerun, no staging/prod/deploy, no Cost Calibration, no destructive DB operation.

## Redaction Boundary

Not recorded: credentials, sessions, cookies, tokens, Authorization headers, `.env*` values, DB URLs, raw DB rows, internal ids, PII, phone/email/password, plaintext `redeem_code`, Provider payloads, raw prompts, raw AI output, full generated content, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, or private fixture values.

## Read Gate

Completed before conclusion:

- `AGENTS.md`
- `project-state.yaml` and `task-queue.yaml` recovery/current queue sections
- Code taste commandments
- ADR-001 through ADR-007
- Standard and advanced requirement indexes
- Edition-aware authorization requirements
- AI generation SSOT, Stage4 baseline, and closed-loop target traceability docs
- Latest 2026-07-06 local adversarial recheck, AI runtime acceptance, learner, organization, content admin, personal standard fixture, residual decision, and active queue evidence
- Historical grounding evidence needed only to compare current local material state with earlier grounding-passed runs

## Baseline Evidence Split

| Evidence source                                   | Local reading                                                                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2026-07-06-ai-generation-runtime-acceptance`     | Earlier 0704 runtime pass recorded sufficient grounding, parsed structured previews, and Provider small samples for personal, organization, content. |
| `2026-07-06-local-adversarial-acceptance-recheck` | Fresh current localhost generation stopped at `insufficient_grounding_evidence` / `409015`; Provider was not executed.                               |
| `2026-07-06-ai-runtime-residual-decision-package` | It treated prior local runtime acceptance as locally closed but did not claim release, prod, staging, Provider breadth, or Cost Calibration.         |

Conclusion from comparison: old pass evidence is a baseline, but it is not self-contained replay evidence for the current local material state.

## Source Mechanism Inventory

| Mechanism                        | Aggregate finding                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Default local upload root        | Runtime resource storage root resolves from process cwd to `.runtime/uploads`.                                                              |
| Owner-preview grounding resolver | Fresh AI 出题 / AI 组卷 grounding uses `buildLocalResourceRagRetrievalResult` against that local upload root.                               |
| Local resource retrieval source  | Retrieval reads the local `dev/resource/catalog.json` catalog and filters `rag_ready` resources.                                            |
| DB resource repository           | Content resource routes can use DB repositories, but the owner-preview fresh Provider grounding path above does not use DB `resource` rows. |
| Provider gate                    | Provider credential read and model call occur only after grounding is `sufficient` with positive citations.                                 |
| Insufficient grounding behavior  | `none` or missing citations blocks before credential read and before Provider call.                                                         |

## Local Artifact Inventory

| Item                              | Result                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `.runtime/uploads` present        | false                                                                           |
| Local resource catalog present    | false                                                                           |
| Local upload file count           | `0`                                                                             |
| Private 0704 pack present         | true                                                                            |
| Private 0704 pack aggregate shape | `7` top-level directories, `13` files, extensions: `.csv=4`, `.json=8`, `.md=1` |
| Private `catalog.json` count      | `0`                                                                             |

No private fixture contents, file values, or raw material text were opened or recorded.

## 0704 DB Aggregate Inventory

Read-only aggregate probe used the local 0704 target label and validated loopback host before connection. It did not output connection values or raw rows.

| Table / area                                                     | Aggregate result                            |
| ---------------------------------------------------------------- | ------------------------------------------- |
| Target DB label matched 0704                                     | true                                        |
| DB host classified local loopback                                | true                                        |
| `resource` total                                                 | `0`                                         |
| `resource.rag_ready` with Markdown                               | `0`                                         |
| `resource.rag_ready` with object path                            | `0`                                         |
| `ai_generation_task` total                                       | `17`                                        |
| `ai_generation_task` status                                      | `pending=10`, `succeeded=7`                 |
| `ai_generation_task` evidence                                    | `sufficient=10`, `none=7`                   |
| `ai_generation_task` citation count positive                     | `10`                                        |
| `personal_ai_generation_result` total                            | `3`                                         |
| `personal_ai_generation_result` evidence                         | `sufficient=3`                              |
| `admin_ai_generation_result` total                               | `7`                                         |
| `admin_ai_generation_result` evidence                            | `sufficient=7`                              |
| `admin_ai_generation_task_metadata` Provider succeeded aggregate | `7` rows with `provider_call_executed=true` |

Interpretation: the 0704 DB contains sufficient-evidence AI history/result snapshots, but it does not contain current RAG `resource` rows. Fresh generation grounding is therefore not reproducible from DB aggregates alone.

## Root-Cause Ranking

| Rank | Cause candidate                                                                                                | Confidence | Evidence                                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Current checkout/process has no materialized `.runtime/uploads/dev/resource/catalog.json`.                     | high       | Local upload path absent; retrieval source requires that catalog; fresh grounding returned `none`.                                         |
| 2    | 0704 DB history contains sufficient result snapshots but not reusable fresh RAG resource inventory.            | high       | DB `resource` total is `0`; AI result/task sufficient counts are positive.                                                                 |
| 3    | Earlier Provider-pass evidence depended on non-versioned local runtime material state that is not present now. | high       | Historical resource-grounded sample recorded runtime upload catalog and imported `rag_ready` resources; current catalog/file count is `0`. |
| 4    | Source grounding gate is broken.                                                                               | not proven | Current code blocks before Provider when grounding is absent, which matches the safety requirement.                                        |

## Decision

- Current local evidence should be graded as: baseline inventory `pass`, grounding reproducibility `blocked_by_missing_local_resource_materialization`, source bug `not_proven`.
- Do not open a source fix from this audit.
- Do not downgrade the grounding threshold to force Provider execution.
- Next actionable step is a separate local-only grounding materialization/provisioning task, with fresh approval if it needs private fixture content reads or `.runtime/uploads` writes.

## Non-Claims

- No release readiness.
- No final Pass.
- No production usability.
- No staging/prod execution.
- No Cost Calibration.
- No Provider execution or Provider-enabled small-sample rerun in this task.

## Validation

| Command                                                                                                               | Result                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Scoped Prettier write                                                                                                 | pass                                                                                                    |
| Scoped Prettier check                                                                                                 | pass                                                                                                    |
| `git diff --check`                                                                                                    | pass                                                                                                    |
| `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`                                                                          | pass; active queue remained `31` total, `30` terminal, `1` blocked/non-terminal; threshold not exceeded |
| `Get-TikuProjectStatus.ps1`                                                                                           | pass; `idle_no_pending_task`; Cost Calibration remains blocked                                          |
| `Get-TikuNextAction.ps1`                                                                                              | pass; no pending executable task                                                                        |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-local-acceptance-baseline-grounding-root-cause-audit-2026-07-06` | pass; `5` task files scanned                                                                            |
