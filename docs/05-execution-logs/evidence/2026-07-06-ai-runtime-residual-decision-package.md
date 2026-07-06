# 2026-07-06 AI Runtime Residual Decision Package Evidence

## Scope

- Task ID: `ai-runtime-residual-decision-package-2026-07-06`
- Branch: `codex/ai-runtime-residual-decision-package-2026-07-06`
- Result: `pass_ai_runtime_residual_decision_package_recorded`
- Mode: docs/evidence decision package only; no runtime rerun.

## Redaction

This evidence records document paths, role labels, aggregate status labels, command names, and decision summaries only. It
does not record credentials, sessions, cookies, tokens, env values, connection strings, raw DB rows, internal ids, PII,
plaintext `redeem_code`, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk
content, screenshots, traces, DOM dumps, or private fixture values.

## Current Evidence Split

| Area                          | Current status                                                                             | Evidence basis                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source/unit baseline          | passed in latest recorded AI implementation closeout; this package did not rerun full unit | `2026-07-06-content-admin-history-adoption-loop.md` records full unit `333 files / 1661 tests`; learner/org/content task evidence records focused and full-unit gates. |
| DB-backed runtime             | passed for local 0704 DB after exact reviewed non-destructive migration pair               | `2026-07-06-ai-generation-runtime-acceptance.md`.                                                                                                                      |
| Browser role matrix           | passed after later personal-standard fixture supplement                                    | Runtime acceptance covered six roles; `2026-07-06-personal-standard-student-fixture-acceptance.md` supersedes the personal standard fixture gap.                       |
| Provider disabled             | passed as controlled business failure category                                             | Runtime acceptance records `missing_provider_credential` instead of generic failure.                                                                                   |
| Provider enabled small sample | passed for personal, organization, and content AI出题 / AI组卷                             | Runtime acceptance records sufficient grounding, parsed structured previews, and requested/observed counts without raw Provider output.                                |
| Learner AI training loop      | passed local closed loop                                                                   | Generation result to learning session, answer, progress, feedback, and statistics path recorded.                                                                       |
| Organization AI training loop | passed local closed loop                                                                   | Generation result to organization training draft, publish, employee answer, readonly summary, and organization statistics recorded.                                    |
| Content-admin loop            | passed governed adoption/rejection boundary                                                | Generated/history result can be adopted into formal draft or rejected; direct publish remains blocked.                                                                 |

## Superseded Gap

The low-risk gap in `2026-07-06-ai-generation-runtime-acceptance.md` for `personal_standard_student` is superseded by
`2026-07-06-personal-standard-student-fixture-acceptance.md`:

- learner home hides `AI训练`;
- direct AI page is unavailable and action-disabled;
- standard authorization contexts expose no AI出题 / AI组卷 capability;
- direct backend POST is rejected with business code `403057`;
- Provider bridge is not reached.

## Remaining Decisions And Non-Claims

| Topic                          | Current decision                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| Release readiness / final Pass | Not claimed. Needs a separate owner-approved release evidence review.                        |
| Production usability           | Not claimed. Local 0704 DB and localhost evidence do not prove production behavior.          |
| Staging/prod                   | Still blocked without a concrete isolated staging target and fresh execution approval.       |
| Cost Calibration               | Still blocked pending fresh explicit approval.                                               |
| Provider confidence            | Small sample passed; it is not broad model quality, latency, quota, or cost evidence.        |
| Formal content writes          | Only explicit draft adoption is proven; direct formal publish remains blocked.               |
| Evidence sensitivity           | Raw prompt, raw AI output, Provider payload, raw DB rows, and full content remain forbidden. |

## Recommended Next Decision

The AI出题 / AI组卷 local runtime acceptance can be treated as locally closed for the 0704 DB/browser/provider-small-sample
scope. The next work should not be another source repair unless fresh current evidence shows a regression.

Recommended owner decisions:

1. Keep AI runtime acceptance closed locally and stop short of release/final/production claims.
2. If release evidence is desired, create a separate staging target and release-readiness approval package before any execution.
3. If cost/quota evidence is desired, create a separate Cost Calibration approval package; do not fold it into runtime acceptance.
4. If mechanism noise is the priority, run a later archive batch because the active queue is again above the terminal batch threshold.

## Validation

| Command                                                                                                                     | Result |
| --------------------------------------------------------------------------------------------------------------------------- | ------ |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` | pass.  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                  | pass.  |
| `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs/state files>`                                               | pass.  |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs/state files>`                                               | pass.  |
| `git diff --check`                                                                                                          | pass.  |
| `npm.cmd run typecheck`                                                                                                     | pass.  |
| `npm.cmd run lint`                                                                                                          | pass.  |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-runtime-residual-decision-package-2026-07-06`                            | pass.  |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-runtime-residual-decision-package-2026-07-06 -SkipRemoteAheadCheck`        | pass.  |

## Boundary Confirmation

- Runtime DB connection, DB mutation, migration, seed, or destructive operation executed: false.
- Provider call/configuration read/write executed: false.
- Browser/dev server/e2e executed: false.
- Source/test/schema/dependency/lockfile changed: false.
- Staging/prod/deploy/payment/Cost Calibration executed: false.
- Release readiness, final Pass, production usability, staging readiness claimed: false.
