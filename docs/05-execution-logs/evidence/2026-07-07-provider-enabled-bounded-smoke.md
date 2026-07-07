# 2026-07-07 Provider-Enabled Bounded Smoke Evidence

## Scope

- Task id: `provider-enabled-bounded-smoke-2026-07-07`
- Branch: `codex/provider-enabled-bounded-smoke-2026-07-07`
- Mode: local-only Provider-enabled bounded smoke.
- Approval boundary: user approved this bounded smoke on 2026-07-07.
- result: pass
- Explicit non-claims: no Cost Calibration, no release readiness, no production usability, no staging/prod/deploy.
- Cost Calibration Gate remains blocked.

## Read Gate

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
- Latest 0704 local grounding, DB-backed replay, organization enterprise fixture materialization, Provider count/timeout, credential-backed role matrix, and final local rollup evidence.

## Redaction Boundary

Recorded only:

- role label;
- workflow label;
- requested count;
- grounding status and citation count;
- credential present/absent category only;
- Provider call executed boolean;
- request count;
- result status and safe failure category;
- duration bucket;
- structured preview kind, parse status, and count fields;
- usage summary presence only;
- redaction status.

Not recorded:

- credential, token, cookie, session, header, env value, connection string, DB URL;
- DB raw row, internal id, private fixture value, employee raw answer, plaintext `redeem_code`;
- Provider payload, raw prompt, raw AI output, full generated question, answer, paper, material, resource, chunk content;
- screenshot, DOM, trace.

## Provider Smoke Command

Command executed with local runtime env-file semantics; env values were not read or recorded.

```powershell
node --env-file=.env.local .\node_modules\vitest\vitest.mjs run src/server/services/provider-enabled-bounded-smoke.temp.test.ts --reporter=dot --silent=false
```

Result:

- exit code: `0`
- test files: `1 passed`
- tests: `1 passed`
- total Provider submit attempts: `4`
- stop reason: `attempt_limit_reached`
- Cost Calibration executed: `false`
- raw Provider artifacts recorded: `false`

## Redacted Aggregate Rows

| role                        | workflow                 | requested count | grounding    | citations | credential category | provider call | request count | result | failure category | duration bucket | structured preview                                                    | usage summary | redaction  |
| --------------------------- | ------------------------ | --------------: | ------------ | --------: | ------------------- | ------------- | ------------: | ------ | ---------------- | --------------- | --------------------------------------------------------------------- | ------------- | ---------- |
| `personal_advanced_student` | `ai_question_generation` |               1 | `sufficient` |         3 | `present`           | true          |             1 | `pass` | null             | `30_to_60s`     | `question_set`, parsed, requested 1, actual 1, draft 1                | present       | `redacted` |
| `personal_advanced_student` | `ai_paper_generation`    |              30 | `sufficient` |         3 | `present`           | true          |             1 | `pass` | null             | `30_to_60s`     | `paper_draft`, parsed, sections 7, questions 30, knowledge coverage 1 | present       | `redacted` |
| `org_advanced_admin`        | `ai_paper_generation`    |              30 | `sufficient` |         3 | `present`           | true          |             1 | `pass` | null             | `30_to_60s`     | `paper_draft`, parsed, sections 4, questions 30, knowledge coverage 1 | present       | `redacted` |
| `content_admin`             | `ai_question_generation` |               1 | `sufficient` |         3 | `present`           | true          |             1 | `pass` | null             | `30_to_60s`     | `question_set`, parsed, requested 1, actual 1, draft 1                | present       | `redacted` |

## Source Gate Results

```powershell
npm.cmd run lint
```

- exit code: `0`

```powershell
npm.cmd run typecheck
```

- exit code: `0`

```powershell
npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts
```

- exit code: `0`
- test files: `3 passed`
- tests: `49 passed`

```powershell
git diff --check
```

- exit code: `0`

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-07-provider-enabled-bounded-smoke.md docs/05-execution-logs/evidence/2026-07-07-provider-enabled-bounded-smoke.md docs/05-execution-logs/audits-reviews/2026-07-07-provider-enabled-bounded-smoke.md
```

- exit code: `0`
- result: all matched files use Prettier code style.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-enabled-bounded-smoke-2026-07-07
```

- exit code: `0`
- result: pre-commit hardening passed.

## Classification

- source/unit: pass
- DB-backed runtime: not tested in this task
- browser: not tested in this task
- Provider-disabled: not tested in this task
- Provider-enabled small sample: pass
- release readiness: not claimed
- production usability: not claimed
- staging: not executed / requires fresh approval
- Cost Calibration: not executed / requires fresh approval

## Notes

- This evidence is a bounded smoke only. It cannot be extrapolated to cost, throughput, retry behavior, full role matrix coverage, staging, production, or release readiness.
- The temporary Provider smoke harness was removed before commit.

## Module Run v2 Closeout Anchors

- Batch range: provider-enabled bounded smoke single-task batch.
- RED: prior Provider-enabled small sample remained unclaimed before fresh approval; provider-count/timeout evidence required a bounded follow-up instead of Cost Calibration.
- GREEN: bounded Provider smoke passed with 4 approved submit attempts, redacted aggregate evidence, and no raw Provider artifacts recorded.
- Commit: `c8603ca15`
- localFullLoopGate: lint, typecheck, focused unit, diff check, scoped Prettier, and Module Run v2 pre-commit hardening recorded above.
- blocked remainder: release readiness, production usability, staging, and Cost Calibration remain blocked / not claimed.
- threadRolloverGate: no thread rollover required by this task.
- nextModuleRunCandidate: `ai-paper-plan-and-select-backend-contract`.
