# 2026-07-06 AI Generation DB-backed Local Runtime Replay Evidence

## Scope

- Task id: `ai-generation-db-backed-local-runtime-replay-2026-07-06`
- Branch: `codex/ai-generation-db-backed-local-runtime-replay-2026-07-06`
- Approval boundary: user approved DB-backed local runtime replay only.
- Runtime scope: localhost and configured local DB through existing app repositories.
- Execution mode: controlled local executor through existing dependency-injection seams; no external Provider call.

## Redaction

This evidence records document paths, role labels, route/workflow labels, command statuses, aggregate counts, stage statuses, and safe error categories only.

It does not record credentials, sessions, cookies, tokens, headers, env values, DB URLs, raw DB rows, internal ids, PII, Provider payloads, raw prompts, raw AI output, full question, answer text, full paper, material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.

## Read Gate Result

- `AGENTS.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read.
- `docs/04-agent-system/state/task-queue.yaml`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/02-architecture/adr/*.md`: read.
- Advanced edition, authorization, ADR-007, and AI generation traceability overlays through `2026-07-06-ai-generation-recontract-requirements-materialization.md`: read.
- Latest AI generation final rollup, DB/Provider next decision, runtime residual, and related local evidence: read.

## Branch And Workspace

| Check                                         | Result                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| Starting branch                               | `codex/ai-generation-db-backed-local-runtime-replay-2026-07-06`                   |
| Base commit                                   | `8c676dd85` stacked on `codex/ai-generation-db-provider-next-decision-2026-07-06` |
| `master` / `origin/master`                    | `0fee47881`                                                                       |
| Source/test/package/schema files after replay | unchanged                                                                         |
| Temporary harness                             | created, executed, then removed before closeout                                   |

## Health Gates

| Command                                                                                                                          | Result                   |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npm.cmd run lint`                                                                                                               | pass                     |
| `npm.cmd run typecheck`                                                                                                          | pass                     |
| localhost `/login` HTTP check                                                                                                    | pass, status 200         |
| focused Vitest: admin AI generation route, personal request route, learning session route, paper assembly, paper source resolver | pass, 5 files / 83 tests |

## Mechanism Diagnostics

| Diagnostic                                   | Result                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `Get-TikuNextAction.ps1`                     | pass; current task active; recommended closeout for current task         |
| `Get-TikuProjectStatus.ps1`                  | pass; current task active; queue clean; Cost Calibration remains blocked |
| `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` | pass; terminal active queue at threshold; no self-repair candidate       |

## DB-backed Runtime Replay Method

- Used current local DB through real repository factories.
- Used controlled local executor for route-integrated AI output; no external Provider call, no Provider payload, no raw prompt, no raw AI output.
- Replay question count: small bounded count of 1 to avoid conflating DB wiring with default-count or Provider behavior.
- Platform formal source probe found an available source scope with aggregate count `5`; no question ids or content recorded.
- No schema migration, seed, destructive DB operation, env/secret readout, staging/prod/deploy, or Cost Calibration was executed.

## Replay Results

| Role                        | AI出题 result persistence | AI组卷 result persistence                           | Learning/session handoff | Safe blocked category                                                                            |
| --------------------------- | ------------------------- | --------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
| `personal_advanced_student` | pass                      | pass; assembled 1 selected platform formal question | blocked                  | `saveSession:db_schema_relation_missing`                                                         |
| `org_advanced_employee`     | pass                      | blocked                                             | blocked                  | `listEmployeeVisibleVersions:db_schema_column_missing`; `saveSession:db_schema_relation_missing` |
| `org_advanced_admin`        | pass                      | blocked                                             | not applicable           | `listAdminLifecycleVersions:db_schema_column_missing`                                            |
| `content_admin`             | pass                      | pass                                                | not applicable           | none                                                                                             |

## Adversarial Findings

| Question                                                          | Finding                                                                                                                         | Classification |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Can current local DB-backed runtime be called pass?               | No. Two role families still hit local DB schema blockers.                                                                       | partial        |
| Is AI出题 DB result persistence healthy in the controlled replay? | Yes for all four replayed roles.                                                                                                | pass           |
| Is AI组卷 DB result persistence healthy for all roles?            | No. Personal and content paths passed; organization employee/admin paths were blocked by organization training schema mismatch. | partial        |
| Can learner learning-session handoff be claimed?                  | No. The local DB lacks the required learning-session relation for the replay path.                                              | blocked        |
| Did this prove Provider-enabled behavior?                         | No. The executor was local and controlled.                                                                                      | not tested     |
| Did this prove default-count behavior?                            | No. The count was deliberately bounded to 1.                                                                                    | not tested     |
| Did this authorize schema migration or seed?                      | No. Schema/seed/migration remain separate approval-gated work.                                                                  | boundary held  |

## Conclusion Matrix

| Dimension                     | Classification                                |
| ----------------------------- | --------------------------------------------- |
| source/unit                   | pass                                          |
| DB-backed runtime             | partial                                       |
| browser                       | not tested; localhost availability only       |
| Provider-disabled             | not tested in this task                       |
| Provider-enabled small sample | not tested / requires separate fresh approval |
| release readiness             | not claimed                                   |
| production usability          | not claimed                                   |
| staging                       | not executed / requires fresh approval        |
| Cost Calibration              | not executed / requires fresh approval        |

## Non-Claims

- No Provider-enabled pass.
- No Provider-disabled replay pass.
- No browser role-matrix pass beyond prior evidence.
- No default-count, latency, cost, quota, model quality, release, production, staging/prod, deploy, or Cost Calibration claim.
- No source defect is fixed in this task.

## Validation Commands

| Command                                          | Result                                                    |
| ------------------------------------------------ | --------------------------------------------------------- |
| temporary DB-backed local runtime replay harness | pass as replay harness; product result classified partial |
| `npm.cmd run lint`                               | pass                                                      |
| `npm.cmd run typecheck`                          | pass                                                      |
| focused Vitest command                           | pass                                                      |
| `git diff --check`                               | pending closeout                                          |
| scoped Prettier check                            | pending closeout                                          |
| Module Run v2 pre-commit hardening               | pending closeout                                          |
