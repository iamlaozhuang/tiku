# AI generation post application closure rerun evidence

## Task

- Task id: `ai-generation-post-application-closure-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-application-closure-rerun`
- Scope: localhost owner-preview rerun after application closure and learner mixed-state repair.

## Redaction Boundary

- Evidence records only role labels, route labels, status counts, failure categories, command names, and validation summaries.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, or full generated/resource/question/paper/material/chunk content.

## Execution Log

- Localhost server check:
  - Result: pass, `http://localhost:3000` returned HTTP 200.
- Browser role-surface rerun:
  - `content_admin` `/content/ai-question-generation`: pass sampled shell/history, technical wording leak count 0, worker-level label count 0, numeric level option count 5.
  - `content_admin` `/content/ai-paper-generation`: pass sampled shell/history, technical wording leak count 0, worker-level label count 0, numeric level option count 5.
  - `org_advanced_admin` `/organization/ai-question-generation`: pass sampled shell/history, technical wording leak count 0, organization-private draft next-step present, organization training material cue present, publish edit boundary present, training configuration link count greater than 0, numeric level option count 5.
  - `org_advanced_admin` `/organization/ai-paper-generation`: pass sampled shell/history, technical wording leak count 0, organization-private draft next-step present, organization training material cue present, publish edit boundary present, training configuration link count greater than 0, numeric level option count 5.
  - `personal_advanced_student` `/ai-generation`: pass sampled shell/history, technical wording leak count 0, start-practice enabled count 0, start-practice disabled count 1.
  - `org_advanced_employee` `/ai-generation`: pass sampled shell/history, technical wording leak count 0, start-practice enabled count 0, start-practice disabled count 1.
- Learner insufficient current-result guard:
  - Runtime rerun did not trigger a new Provider call. The sampled learner pages showed no false enabled start-practice action on initial/history state.
  - Current insufficient-result behavior is covered by the immediately preceding source repair focused test: accepted completed result with insufficient evidence disables practice/answer/feedback and leaves retry as the recovery path.
- Provider call executed: false.
- Env file read or modified: false.
- Direct database connection or mutation: false.
- Source/test changed: false.
- Sensitive evidence captured: false.

## Validation

- Formatting:
  - Command: `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`
  - Result: pass after scoped task-plan formatting.
- Diff check:
  - Command: `git diff --check`
  - Result: pass.
- Module Run v2 pre-commit hardening:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-application-closure-rerun-2026-07-02`
  - Result: pass.
- Module Run v2 pre-push readiness:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-application-closure-rerun-2026-07-02 -SkipRemoteAheadCheck`
  - Result: pass.
