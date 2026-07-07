# 2026-07-07 Post-Recontract Local Adversarial Acceptance Consolidation Evidence

## Scope

- Task id: `post-recontract-local-adversarial-acceptance-consolidation-2026-07-07`
- Branch: `codex/post-recontract-local-acceptance-consolidation-2026-07-07`
- Mode: local adversarial evidence consolidation.
- Result: current local evidence supports bounded source/unit pass, bounded DB-backed partial, browser role-matrix partial, Provider-disabled bounded pass, and Provider-enabled bounded small-sample pass.

## Redaction Boundary

This evidence records only document paths, command names, exit status, test counts, role labels, workflow labels, aggregate categories, and conclusion buckets.

Not recorded: credentials, sessions, cookies, tokens, headers, env values, connection strings, DB URLs, raw DB rows, internal ids, PII, phone, email, password, plaintext `redeem_code`, Provider payload, raw prompt, raw AI output, full question, answer, paper, material, resource, chunk content, screenshots, traces, raw DOM, private fixture values, or employee raw answers.

## Read Gate Result

Status: pass.

Read before writing this consolidation:

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
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-final-local-goal-rollup-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-final-local-goal-rollup-audit.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-db-backed-local-runtime-replay.md`
- `docs/05-execution-logs/evidence/2026-07-06-0704-local-db-backed-replay-after-clean-migration-baseline.md`
- `docs/05-execution-logs/evidence/2026-07-06-0704-local-org-enterprise-fixture-materialization-replay.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-credential-backed-role-matrix-replay.md`
- `docs/05-execution-logs/evidence/2026-07-06-post-fix-provider-disabled-localhost-replay.md`
- `docs/05-execution-logs/evidence/2026-07-07-provider-enabled-bounded-smoke.md`

## Current Workspace And Mechanism State

| Check                                          | Result                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| Starting branch before task branch             | `master`                                                          |
| `master` vs `origin/master` before task branch | `0 0`                                                             |
| Task branch                                    | `codex/post-recontract-local-acceptance-consolidation-2026-07-07` |
| Working tree before writes                     | clean                                                             |

Mechanism diagnostics:

| Command                                      | Result                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Get-TikuNextAction.ps1`                     | pass on rerun; no pending task; recommended action `idle_no_pending_task`; Cost Calibration blocked  |
| `Get-TikuProjectStatus.ps1`                  | pass on rerun; project status `idle_no_pending_task`; wait for instruction; Cost Calibration blocked |
| `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` | pass; queue slimming clean; terminal active queue at threshold; no self-repair candidate             |

The first `Get-TikuNextAction.ps1` and `Get-TikuProjectStatus.ps1` attempts used a shorter timeout. `Get-TikuNextAction.ps1` printed a complete diagnostic but exited `124`; both scripts were rerun with longer timeout and exited `0`.

## Fresh Source Gate Evidence

| Command                                   | Result                     |
| ----------------------------------------- | -------------------------- |
| `npm.cmd run lint`                        | pass, exit code `0`        |
| `npm.cmd run typecheck`                   | pass, exit code `0`        |
| `git diff --check`                        | pass, exit code `0`        |
| aggregate AI generation source/unit suite | pass, 20 files / 286 tests |
| scoped Prettier check                     | pass, exit code `0`        |
| Module Run v2 pre-commit hardening        | pass, exit code `0`        |

Aggregate source/unit suite command:

```text
npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts src/server/repositories/organization-training-repository.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts
```

## Evidence Chain Review

### Source / Unit

Current fresh source/unit gate supports `pass` for the recontracted local source contract:

- AI组卷 plan-and-select service contract.
- Source adapters.
- Route assembly and source resolution.
- Provider instruction plan-only contract.
- Admin and personal route contract.
- Personal learning-session handoff contracts.
- Learner, employee, organization admin, and content admin UI contract tests.
- Standard role denial and workspace guard tests.

Unsupported extrapolation:

- Source/unit does not prove DB runtime mutation, browser submission, Provider reliability, staging/prod, release readiness, or production usability.

### DB-Backed Runtime

Combined local DB evidence:

- `2026-07-06-ai-generation-db-backed-local-runtime-replay.md`: initial controlled DB-backed replay was `partial`; AI出题 persisted for four advanced roles, but learner session and organization enterprise-source paths hit local DB materialization blockers.
- `2026-07-06-0704-local-db-backed-replay-after-clean-migration-baseline.md`: configured 0704 schema/journal blocker cleared; personal advanced learner AI组卷 to learning session passed in bounded flow; content admin platform-source assembly passed; organization enterprise-source replay still needed fixture/materialization.
- `2026-07-06-0704-local-org-enterprise-fixture-materialization-replay.md`: non-destructive local 0704 enterprise fixture/materialization replay passed for `org_advanced_employee` and `org_advanced_admin` enterprise-source assembly; employee learning session and organization answer readback passed.

Consolidated classification: `partial`.

Reason: the combined DB evidence proves important bounded local paths, including personal learning session, content platform-source assembly, organization enterprise-source assembly, and employee answer readback. It still does not prove every closed-loop mutation required for broad acceptance, especially content formal draft adopt/reject/review/publish, organization admin training draft publish/statistics as a complete workflow, default 30/80 runtime behavior, or browser-submitted DB flows.

### Browser

Evidence reviewed:

- `2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md`
- `2026-07-06-ai-generation-credential-backed-role-matrix-replay.md`

Supported claims:

- Seven credential-backed roles were replayed on localhost for AI entry/denial.
- Standard personal learner, standard organization employee, and standard organization admin were denied or unavailable.
- Personal advanced learner, organization advanced employee, organization advanced admin, and content admin AI出题 / AI组卷 entry surfaces were visible.
- No screenshots, traces, DOM dumps, raw output, credentials, sessions, or generated content were recorded.

Consolidated classification: `partial`.

Reason: browser role entry/denial matrix is `pass`, but browser generation submission and full browser closed loops were intentionally not executed.

### Provider-Disabled

Evidence reviewed:

- `2026-07-06-post-fix-provider-disabled-localhost-replay.md`
- `2026-07-06-ai-generation-role-matrix-local-acceptance-recheck.md`

Supported claims:

- Content admin and organization advanced admin Provider-disabled localhost requests returned safe redacted rejection with business code `409015`.
- Standard organization admin remained denied with `403011`.
- Provider call execution was false; Provider configuration read was false; env secret access was false; Cost Calibration was false.
- Aggregate history counts did not increase in the bounded admin/content replay.
- Content admin browser mapping showed clear Chinese no-draft wording and a mapped disabled reason instead of only a generic failure.

Consolidated classification: `pass` for bounded Provider-disabled local evidence.

Unsupported extrapolation:

- Not a full seven-role Provider-disabled browser replay.
- Not Provider-enabled evidence.
- Not full closed-loop acceptance.

### Provider-Enabled Small Sample

Evidence reviewed:

- `2026-07-07-provider-enabled-bounded-smoke.md`

Supported claims:

- Fresh approved local Provider-enabled bounded smoke was executed with maximum 4 submit attempts.
- Four attempts passed with sufficient grounding and parsed structured previews.
- Covered bounded samples:
  - `personal_advanced_student` AI出题, requested 1.
  - `personal_advanced_student` AI组卷, requested 30.
  - `org_advanced_admin` AI组卷, requested 30.
  - `content_admin` AI出题, requested 1.
- No Provider payload, raw prompt, raw AI output, full generated content, credentials, env values, DB rows, screenshots, traces, or DOM dumps were recorded.

Consolidated classification: `pass` for bounded small sample.

Unsupported extrapolation:

- Not Cost Calibration.
- Not throughput, retry, reliability, latency, quota, cost, full role matrix, staging/prod, release, or production evidence.
- Does not by itself prove the local DB-backed plan-and-select closed loop for every role.

## Final Conclusion Buckets

| Dimension                     | Conclusion                             |
| ----------------------------- | -------------------------------------- |
| source/unit                   | pass                                   |
| DB-backed runtime             | partial                                |
| browser                       | partial                                |
| Provider-disabled             | pass                                   |
| Provider-enabled small sample | pass                                   |
| release readiness             | not claimed                            |
| production usability          | not claimed                            |
| staging                       | not executed / requires fresh approval |
| Cost Calibration              | not executed / requires fresh approval |

## Explicit Non-Claims

- No release readiness.
- No production usability.
- No staging/prod/deploy/cloud readiness.
- No Cost Calibration execution, measurement, or readiness.
- No broad production/full-data acceptance.
- No full seven-role browser generation-submission pass.
- No full DB-backed closed-loop pass for every role and every post-generation business path.
- No claim that Provider-enabled bounded smoke proves cost, throughput, reliability, or full role coverage.
- No sensitive evidence recorded.
