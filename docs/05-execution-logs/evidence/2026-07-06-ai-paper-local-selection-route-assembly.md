# 2026-07-06 AI paper local selection route assembly evidence

## Scope

- Task ID: `ai-paper-local-selection-route-assembly-2026-07-06`
- Branch: `codex/ai-paper-local-selection-route-assembly-2026-07-06`
- Scope type: local source + focused unit tests + redacted docs/state evidence.
- Runtime boundaries:
  - Provider call executed: no.
  - Env/secret read or write: no.
  - DB runtime / mutation: no.
  - Browser/dev server: no.
  - Staging/prod/deploy: no.
  - Cost Calibration: no.
  - Dependency/package/lockfile/schema/migration/seed change: no.

## Requirement Mapping Result

- Recontract SSOT: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Implemented package: service-level bridge from route-integrated AI组卷 plan preview to local formal-source selection.
- Covered decisions:
  - AI组卷 assembled questions come from local eligible formal sources, not Provider-generated final question bodies.
  - Route generation parameters remain the trusted profession, level, and subject scope for local assembly.
  - Personal advanced learner assembly uses platform formal sources only.
  - Organization advanced admin assembly can use platform formal sources plus same-organization enterprise training snapshots.
  - Failed structured preview or nested Provider question content is rejected before local selection.
  - Insufficient formal sources return a typed insufficiency result instead of inventing missing questions.
- Not covered by this package:
  - DB repository/runtime source retrieval.
  - Provider execution.
  - Formal paper persistence or content-admin paper draft adoption.
  - Learner/employee preview UI, organization admin UI, or content-admin UI.
  - Browser role matrix, DB-backed runtime acceptance, staging/prod/deploy, release readiness, or Cost Calibration.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- src/server/services/ai-paper-route-assembly-service.test.ts`
- RED result: failed before implementation because `src/server/services/ai-paper-route-assembly-service.ts` did not exist.
- GREEN command: `npm.cmd run test:unit -- src/server/services/ai-paper-route-assembly-service.test.ts`
- GREEN result: passed, 1 file, 4 tests.
- Combined focused command: `npm.cmd run test:unit -- src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts`
- Combined focused result: passed, 4 files, 45 tests.

## Validation Results

| Command                                                                                                                                                                            | Result       | Redacted summary                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                                 | pass         | no whitespace errors                                             |
| `npm.cmd run typecheck`                                                                                                                                                            | pass         | TypeScript check completed                                       |
| `npm.cmd run lint`                                                                                                                                                                 | pass         | ESLint completed                                                 |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped files>`                                                                                                                 | initial_fail | two new TS files needed formatting                               |
| `npm.cmd exec -- prettier --write --ignore-unknown <new TS files>`                                                                                                                 | pass         | scoped formatting completed                                      |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped files>`                                                                                                                 | pass         | scoped formatting check completed                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-local-selection-route-assembly-2026-07-06` | pass         | scope scan, sensitive evidence scan, and terminology scan passed |

## Source Contract Evidence

Implemented source-level contract changes:

- Added a pure service that accepts route-integrated AI组卷 visible plan output and already resolved selectable question candidates.
- Normalizes `judge` to the internal `true_false` question type.
- Uses route generation parameters as the scope truth for profession, level, and subject.
- Reuses the existing plan validation and local selection service.
- Returns safe assembly, insufficiency, or rejection categories without exposing generated content.

## Non-Claims

- No local DB-backed source retrieval runtime was executed.
- No Provider-enabled sample was executed.
- No browser or role matrix acceptance was executed.
- No formal paper draft, learner session, or enterprise training persistence was claimed.
- No release readiness, production usability, staging, production, deploy, final Pass, or Cost Calibration is claimed.

## Redaction Confirmation

No credential, session, cookie, token, env value, DB URL, DB row, internal id, Provider payload, raw prompt, raw AI output, full material, full question, full answer, full paper, screenshot, DOM, trace, private fixture value, employee raw answer, or plaintext `redeem_code` is recorded.
