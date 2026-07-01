# Evidence: AI generation post-repair localhost rerun

## Scope

- Task id: `ai-generation-post-repair-localhost-rerun-2026-07-01`
- Branch: `codex/ai-generation-post-repair-localhost-rerun`
- Execution type: local dev-server, in-app browser, role matrix, and bounded Provider owner-preview sample with docs/state/evidence only.
- Source/test/dependency/schema/migration/seed/staging/prod/deploy/e2e automation/Cost Calibration/release readiness/final Pass are out of scope.

## Redaction Boundary

This evidence records only role labels, route labels, workflow labels, pass/fail/blocked status, safe counts, duration buckets, citation counts, evidence status, command names, and validation summaries. It must not include credentials, tokens, sessions, cookies, Authorization headers, `.env*`, database URLs, raw DB rows, internal numeric ids, PII, plaintext card codes, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## Runtime Setup

- Local dev server: started on `127.0.0.1:3000`; homepage returned HTTP 200.
- In-app browser: opened a fresh localhost tab after the previous stale connection-failed tab.
- Credential handling: local role credentials were read into memory for localhost login only; no account, password, token, cookie, session, localStorage, or `.env*` value was printed or recorded.
- Provider sample: skipped because browser rerun found a product UI defect before the real Provider gate.

## Static Entry Inventory

- Source scan command: `rg -n "AI出题|AI组卷|ai-question-generation|ai-paper-generation|/ai-generation" src\app src\components src\features -g "*.tsx" -g "*.ts"`.
- Confirmed route families:
  - content operation: `/content/ai-question-generation`, `/content/ai-paper-generation`.
  - organization admin: `/organization/ai-question-generation`, `/organization/ai-paper-generation`.
  - learner/employee advanced AI training: `/ai-generation`.
  - entry navigation: student home AI training link, content admin dashboard links, organization portal/dashboard links.
- Cross-surface defect classes now mandatory for each exercised surface:
  - resource-package/RAG grounding: generic history, generic logistics, or unrelated model output is fail unless the UI blocks due insufficient evidence.
  - debug/governance wording leakage: local-contract, redaction, raw enum/field/schema/provider/prompt/payload wording is fail on ordinary user/operator surfaces.

## Cross-Surface Inventory

| Surface group                | Roles covered                | AI 出题 | AI 组卷 | Grounding check | Debug wording check | Status |
| ---------------------------- | ---------------------------- | ------- | ------- | --------------- | ------------------- | ------ |
| Content operation routes     | `content_admin`              | fail    | fail    | partial         | fail                | fail   |
| Organization admin routes    | `org_advanced_admin`         | fail    | fail    | partial         | fail                | fail   |
| Learner advanced route       | `personal_advanced_student`  | pass    | pass    | partial         | pass                | pass   |
| Organization employee route  | `org_advanced_employee`      | pass    | pass    | partial         | pass                | pass   |
| Standard/no-entitlement view | `org_standard_admin` sampled | n/a     | n/a     | n/a             | pass                | pass   |

## Matrix Results

| Role                        | Route family           | AI 出题 | AI 组卷 | Evidence summary                                                                                                                                                                                                                         |
| --------------------------- | ---------------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_admin`             | content AI routes      | fail    | fail    | Routes reachable; AI actions visible; level options show 1-5 wording; history separation and pagination present; ordinary UI still shows a redacted local-contract summary phrase in generated-content/history surfaces.                 |
| `org_advanced_admin`        | organization AI routes | fail    | fail    | Routes reachable from advanced organization workspace; AI actions visible; level options show 1-5 wording; history separation and pagination present; same backend shared AI surface exposes the redacted local-contract summary phrase. |
| `personal_advanced_student` | `/ai-generation`       | pass    | pass    | Login and route access passed; AI 出题/AI 组卷 buttons enabled; no local-contract, redaction, raw enum/field, Provider, prompt, or payload wording found on the ordinary learner UI.                                                     |
| `org_advanced_employee`     | `/ai-generation`       | pass    | pass    | Login and route access passed; AI 出题/AI 组卷 buttons enabled; no local-contract, redaction, raw enum/field, Provider, prompt, or payload wording found on the ordinary employee UI.                                                    |

## Findings

- P1 `admin_ai_generation_visible_content_debug_summary_leak`: content admin and organization advanced admin AI 出题/AI 组卷 pages render a redacted local-contract summary phrase as ordinary generated content/history text. This is not appropriate for operators or administrators and confirms the cross-surface UI wording defect.
- P1 suspected root cause: `src/server/services/admin-ai-generation-local-contract-route.ts` persists `contentPreviewMasked` with a local-contract summary phrase, and `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx` renders generated-result preview/history content without converting that diagnostic summary into product wording or hiding it from ordinary UI.
- RAG/grounding static check: admin and personal route-integrated Provider services now contain an insufficient-grounding gate and instructions that constrain generation to retrieved evidence, including an explicit no-out-of-material history/generic-industry rule. Browser Provider sampling remains blocked until the UI wording defect is fixed.
- Level wording check: content and organization admin pages no longer show `高级工`/`中级工`/`技师`; sampled selects showed 1-5 level wording.
- Standard boundary sample: `org_standard_admin` direct organization AI routes were unavailable and did not expose generation controls or technical wording.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown <changed docs/state>`: pass.
- `git diff --check`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-repair-localhost-rerun-2026-07-01`: pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-repair-localhost-rerun-2026-07-01 -SkipRemoteAheadCheck`: pass.

## Closeout

- Current rerun stops with findings. Next required task: source/test repair for shared admin AI generation visible-content/history wording, then rerun localhost matrix and bounded Provider sample.
