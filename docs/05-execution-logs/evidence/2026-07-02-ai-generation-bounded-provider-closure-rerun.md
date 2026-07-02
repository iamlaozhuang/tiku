# AI generation bounded Provider closure rerun evidence

## Task

- Task id: `ai-generation-bounded-provider-closure-rerun-2026-07-02`
- Branch: `codex/ai-generation-bounded-provider-closure-rerun`
- Scope: bounded localhost Provider rerun for fresh AI出题 / AI组卷 current-result closure after application-state repair.

## Redaction Boundary

- Evidence records only role labels, route labels, status counts, duration buckets, failure categories, command names, and validation summaries.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, or full generated/resource/question/paper/material/chunk content.

## Execution Log

- Localhost server check: pass, existing server returned HTTP 200.
- Bounded Provider UI submit count: 4 total, 0 retries.
- Submitted routes:
  - `content_admin` `/content/ai-question-generation`: clicked once, duration bucket `<20s`, technical wording leak count 0, no raw generated text recorded.
  - `content_admin` `/content/ai-paper-generation`: clicked once, duration bucket `<20s`, technical wording leak count 0, no raw generated text recorded.
  - `personal_advanced_student` `/ai-generation` AI出题: clicked once, duration bucket `<20s`, technical wording leak count 0, no raw generated text recorded.
  - `personal_advanced_student` `/ai-generation` AI组卷: clicked once, duration bucket `<20s`, technical wording leak count 0, no raw generated text recorded.
- Post-wait read-only scan:
  - Content admin AI组卷 showed increased sufficient/adoptable status counts with technical wording leak count 0.
  - Content admin AI出题 did not show a settled fresh-count change within the sampled wait window.
  - Personal advanced learner kept start-practice enabled count 0 and start-practice disabled count 1 after fresh submits.
  - Personal advanced learner showed retry enabled count 1 while the sampled current state still looked non-usable/pending.
- Provider call executed: bounded localhost UI submits only.
- Env file read or modified: false.
- Direct database connection or mutation: false.
- Source/test changed: false.
- Sensitive evidence captured: false.

## Findings

- P1 follow-up: learner AI page can enable `重试生成` immediately after a fresh submit while current generated practice is still not usable. This risks duplicate submissions and should be repaired so retry is available only after a terminal failed or insufficient current result.
- Observation: content admin AI出题 fresh sample did not visibly settle within the sampled wait window; keep this in the next rerun matrix after retry-state repair.

## Validation

- Formatting:
  - Command: `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`
  - Result: pass after scoped task-plan formatting.
- Diff check:
  - Command: `git diff --check`
  - Result: pass.
- Module Run v2 pre-commit hardening:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-bounded-provider-closure-rerun-2026-07-02`
  - Result: pass.
- Module Run v2 pre-push readiness:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-bounded-provider-closure-rerun-2026-07-02 -SkipRemoteAheadCheck`
  - Result: pass.
