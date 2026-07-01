# AI Generation Provider Structure Feedback Repair Evidence

## Redaction Boundary

- Evidence allows command names, changed file paths, issue labels, route/workflow labels, role labels, status counts, duration buckets, token counts when visible, failure categories, and validation summaries only.
- Evidence forbids credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, DB raw rows, internal auto ids, PII, raw prompts, Provider payloads, raw AI input/output, and complete generated content.

## Initial State

- Branch: `codex/ai-generation-provider-structure-feedback-repair`
- Source task: `ai-generation-real-provider-sample-2026-07-01`
- Target issues: PROVIDER-001, PROVIDER-002

## Root Cause

- PROVIDER-001: structured preview parse used truncated display content.
- PROVIDER-001: local owner preview max output token limit was too low for 10 structured drafts.
- PROVIDER-001: local owner preview timeout was too short for observed real Provider question generation latency.
- PROVIDER-002: learner visible result content was rendered below detail and practice panels.

## TDD Log

- RED: `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
  - Result: failed as expected.
  - Failure classes: local Qwen output token limit mismatch, structured preview parsing from truncated display text, learner generated-content placement after practice feedback.
- GREEN: same focused unit command.
  - Result: pass.
  - Summary: 4 test files passed, 36 tests passed.
- RED: same focused backend command after adding the local Provider timeout expectation.
  - Result: failed as expected.
  - Failure class: owner preview Qwen execution timeout still matched the old short limit.
- GREEN: same focused unit command after the timeout repair.
  - Result: pass.
  - Summary: 4 test files passed, 36 tests passed.

## Validation Log

- `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`: pass, 4 test files passed, 36 tests passed.
- `npm.cmd exec -- prettier --check --ignore-unknown <changed-files>`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: initial final rerun found the Provider timeout contract still typed as the old literal value; after the contract type repair, rerun pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-structure-feedback-repair-2026-07-01`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-structure-feedback-repair-2026-07-01 -SkipRemoteAheadCheck`: first run blocked on repository SHA checkpoint drift; after checkpoint update, rerun pass.

## Provider Resmoke

- Boundary: localhost only, bounded real Qwen UI submit attempts, no prompt, payload, raw AI output, full generated content, screenshot, trace, raw DOM, storage, credential, token, or `.env*` evidence.
- First post-repair pass found one learner AI 组卷 preview present with safe labels `paper_section 3` and `题量 17`; learner near-action feedback was present.
- First post-repair pass still observed question-generation timeout under the old local timeout limit; that finding drove the timeout repair.
- After timeout repair, personal advanced learner AI 出题 preview was present with safe labels `草稿 10/10` and `待评审 10`; learner near-action feedback was present.
- After timeout repair, content admin AI 出题 preview was present with safe labels `草稿 10/10` and `待评审 10`.
- Result: PROVIDER-001 and PROVIDER-002 pass for the bounded repair resmoke paths. Full eight-role Provider rerun remains a separate optional follow-up, not claimed here.
