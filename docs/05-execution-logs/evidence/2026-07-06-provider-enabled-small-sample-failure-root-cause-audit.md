# 2026-07-06 Provider-Enabled Small-Sample Failure Root-Cause Audit Evidence

## Scope

- Task: `provider-enabled-small-sample-failure-root-cause-audit-2026-07-06`
- Branch: `codex/provider-enabled-small-sample-failure-root-cause-audit-2026-07-06`
- Base: `master` / `origin/master` at `82414a8c7`
- Purpose: explain the current local Provider-enabled content-admin small-sample failure without recording sensitive artifacts or making release claims.
- Boundary: local only; no staging/prod/deploy/env mutation/secret mutation/destructive DB/Cost Calibration. Provider execution was bounded to the approved local small-sample root-cause probes.

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
- Latest 2026-07-06 local adversarial acceptance, AI runtime residual, AI generation runtime acceptance, 0704 grounding replay, admin observability, and Provider-disabled replay evidence/audits.

## Source Gates

| Command                                                                                                                                                                                                                                        | Result                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `npm.cmd run lint`                                                                                                                                                                                                                             | pass                                                                        |
| `npm.cmd run typecheck`                                                                                                                                                                                                                        | pass                                                                        |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts` | pass; 3 files / 66 tests                                                    |
| temporary service probe under `.runtime/`                                                                                                                                                                                                      | not collected by Vitest; no Provider call                                   |
| temporary service probe under `src/server/services/` with Vitest test env                                                                                                                                                                      | pass; grounding sufficient, credential absent in test env, no Provider call |
| temporary service probe with unresolved root `@next/env` import                                                                                                                                                                                | harness import failure before tests; no Provider call                       |
| temporary service probe with Next development env semantics                                                                                                                                                                                    | pass; 1 file / 1 test; Provider call executed                               |

Temporary probe files were removed before commit.

## Root-Cause Probe Aggregate

Probe target: content-admin `AI出题`, frontend-equivalent default question count `10`, local grounding parameters, development env semantics.

Redacted aggregate result:

- Owner-preview control enabled: true.
- Provider metadata label: `alibaba-qwen`, `qwen3.7-max`, host alias `dashscope.aliyuncs.com`.
- Credential present: true.
- Grounding evidence: `sufficient`, citation count `3`, chunk text recorded false.
- Provider call attempt allowed: true.
- Provider call executed: true.
- Provider configuration read: true.
- Env secret accessed: true, value not recorded.
- Execution request count: `1`.
- Execution result status: `fail`.
- Failure category: `provider_error`.
- Duration bucket: `gte_60s`.
- Provider error summary: HTTP status `null`, provider error code `null`.
- Usage summary present: false.
- Visible generated content present: false.
- Structured preview present: false.
- Prompt content recorded: false.
- Provider request payload recorded: false.
- AI output content recorded: false.
- Full question/material content recorded: false.
- Cost Calibration executed: false.

Interpretation: the current failure is after grounding and credential gates. It is not caused by missing local grounding, missing credential, standard-role authorization, no-Provider fallback, or structured-preview parsing. The failure occurs in the Provider execution layer before any visible generated content exists.

## Localhost Route Corroboration

A temporary `next dev` server was started on localhost port `3104`. Next reported `.env.local` as loaded.

Observed non-sensitive route timing:

- `POST /api/v1/local-acceptance-sessions`: HTTP `200`.
- `GET /api/v1/content-ai-generation-requests?generationKind=question&page=1&pageSize=10`: HTTP `200`.
- `POST /api/v1/content-ai-generation-requests`: HTTP `200`, application time bucket `60s`.
- Follow-up history GET: HTTP `200`.

Caveat: the route wrapper failed to print its final redacted response aggregate, so the route run is used only to corroborate that the localhost route reached a 60s Provider execution path. The service-level probe above is the clean root-cause evidence.

## Comparison With Earlier Provider Pass Evidence

`docs/05-execution-logs/evidence/2026-07-06-ai-generation-runtime-acceptance.md` remains evidence for bounded Provider success at much smaller counts:

- AI出题 samples requested/observed `1`.
- AI组卷 samples recognized question count `2`.

That evidence does not support extrapolating Provider success to the content-admin frontend-equivalent default `questionCount=10`. This audit found the 10-question path fails at Provider execution after sufficient grounding and credential access.

## Classification

- source/unit: pass.
- DB-backed runtime: not tested for full acceptance; localhost route history endpoints were touched only as route corroboration.
- browser: not tested.
- Provider-disabled: not tested in this task; latest separate replay remains the current Provider-disabled evidence.
- Provider-enabled small sample: blocked for successful generation at content-admin 10-question default; pass for root-cause localization to Provider execution failure.
- release readiness: not claimed.
- production usability: not claimed.
- staging: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.

## Non-Claims

- No Provider-enabled success claim for frontend-equivalent default 10-question generation.
- No claim that all Provider paths fail; prior smaller-count pass evidence is not invalidated.
- No claim that the failure is a confirmed product source bug.
- No release readiness, final Pass, production usability, staging/prod, deploy, or Cost Calibration claim.

## Final Validation

| Command                                                                                                                                                                                                                                        | Result                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `npm.cmd run lint`                                                                                                                                                                                                                             | pass                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                                                        | pass                                                      |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts` | pass; 3 files / 66 tests                                  |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs/state files>`                                                                                                                                                                  | pass                                                      |
| `git diff --check`                                                                                                                                                                                                                             | pass                                                      |
| `scripts/agent-system/Get-TikuNextAction.ps1`                                                                                                                                                                                                  | pass; no pending task                                     |
| `scripts/agent-system/Get-TikuProjectStatus.ps1`                                                                                                                                                                                               | pass; queue clean                                         |
| `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`                                                                                                                                                                              | pass; 30 terminal / 1 nonterminal, threshold not exceeded |
| `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-enabled-small-sample-failure-root-cause-audit-2026-07-06`                                                                                                        | pass                                                      |
| `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId provider-enabled-small-sample-failure-root-cause-audit-2026-07-06 -SkipRemoteAheadCheck`                                                                                    | pass                                                      |

Temporary artifacts:

- Temporary source probe removed before commit.
- Temporary `.runtime/provider-enabled-root-cause-audit` logs removed after verification.
