# 2026-07-06 Provider Count Timeout Observability Audit Evidence

## Scope

- Task: `provider-count-timeout-observability-audit-2026-07-06`
- Branch: `codex/provider-count-timeout-observability-audit-2026-07-06`
- Base: `master` / `origin/master` at `8175c5987`
- Purpose: compare local Provider-enabled content-admin AI出题 behavior for a tiny request and the frontend-equivalent default request.
- Boundary: local bounded Provider observation only. No staging/prod/deploy/env mutation/secret mutation/destructive DB/schema/migration/seed/dependency/Cost Calibration.

## Redaction

No credentials, sessions, cookies, tokens, env values, DB URL, raw DB rows, internal ids, Provider payload, raw prompt, raw AI output, complete question, complete paper, complete material, resource text, chunk text, screenshot, DOM dump, trace, or private fixture value is recorded.

## Read Gate

Read before execution:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- Latest 2026-07-06 learner, organization, content-admin, runtime acceptance, personal standard fixture, Provider-disabled replay, Provider-enabled root-cause audit, residual decision, and queue slimming evidence.

## Source Gates

| Command                                                                                                                                                                                                                                        | Result                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npm.cmd run lint`                                                                                                                                                                                                                             | pass                     |
| `npm.cmd run typecheck`                                                                                                                                                                                                                        | pass                     |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts` | pass; 3 files / 66 tests |

## Provider Count Timeout Probe

Temporary probe file:

- Added only for execution under `src/server/services/provider-count-timeout-observability.temp.test.ts`.
- Removed before commit.
- Ran with local Next development env semantics through `node --env-file=.env.local .\node_modules\vitest\vitest.mjs ...`.
- Provider calls were bounded to two total attempts, max one request per probe, zero retries, default route-integrated timeout.

Redacted aggregate result:

| Probe              | Requested count | Grounding      | Credential | Provider call | Result | Duration bucket | Structured preview      | Usage summary | Error status/code |
| ------------------ | --------------- | -------------- | ---------- | ------------- | ------ | --------------- | ----------------------- | ------------- | ----------------- |
| `tiny_count_1`     | 1               | sufficient / 3 | present    | executed      | pass   | `30_to_60s`     | question set parsed / 1 | present       | null / null       |
| `default_count_10` | 10              | sufficient / 3 | present    | executed      | fail   | `gte_60s`       | none                    | absent        | null / null       |

Additional probe facts:

- Owner-preview control enabled: true.
- Provider configuration read: true.
- Env secret accessed: true, value not recorded.
- Provider call attempt count: 2.
- Tiny request visible generated content present: true, raw content recorded false.
- Default request visible generated content present: false.
- Default request failure category: `provider_error`.
- Sensitive marker found in aggregate: false.
- Raw Provider artifact recorded: false.
- Cost Calibration executed: false.

## Interpretation

The current failure is count-sensitive under the same content-admin owner-preview path, same grounding status, and same credential availability:

- Count `1` can complete and parse a structured question-set preview.
- Count `10` reaches Provider execution and fails after the `gte_60s` bucket with no generated content, no structured preview, no usage summary, and no HTTP status/provider code.

This supports a timeout-like or Provider execution capacity/latency classification for the default-count path. It does not prove a product source defect because the same route-integrated execution path succeeds at count `1`.

## Classification

- source/unit: pass.
- DB-backed runtime: not tested.
- browser: not tested.
- Provider-disabled: not tested.
- Provider-enabled small sample: partial; count `1` pass, default count `10` blocked.
- release readiness: not claimed.
- production usability: not claimed.
- staging: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.

## Non-Claims

- No success claim for content-admin default 10-question Provider-enabled generation.
- No claim that all Provider paths fail.
- No Cost Calibration or latency/cost measurement claim.
- No release readiness, final Pass, production usability, staging/prod, or deploy claim.
- No product source fix was made or proven necessary in this task.

## Final Validation

| Command                                                                                                                                                                                                                                        | Result                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `npm.cmd run lint`                                                                                                                                                                                                                             | pass                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                                                        | pass                                                      |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts` | pass; 3 files / 66 tests                                  |
| temporary Provider count/timeout observability probe through Vitest with local env semantics                                                                                                                                                   | pass; 1 file / 1 test                                     |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs/state files>`                                                                                                                                                                  | pass                                                      |
| `git diff --check`                                                                                                                                                                                                                             | pass                                                      |
| blocked path diff guard                                                                                                                                                                                                                        | pass; no output                                           |
| `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-count-timeout-observability-audit-2026-07-06`                                                                                                                    | pass                                                      |
| `scripts/agent-system/Get-TikuNextAction.ps1`                                                                                                                                                                                                  | pass; no pending task                                     |
| `scripts/agent-system/Get-TikuProjectStatus.ps1`                                                                                                                                                                                               | pass; idle / wait for instruction                         |
| `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`                                                                                                                                                                              | pass; 30 terminal / 1 nonterminal, threshold not exceeded |

Temporary artifacts:

- Temporary source probe removed before commit.
- No `.runtime` evidence artifact was created.

Closeout boundary:

- Local branch commit is approved by the current task request.
- Merge, push, and branch cleanup remain unapproved and require fresh approval.
