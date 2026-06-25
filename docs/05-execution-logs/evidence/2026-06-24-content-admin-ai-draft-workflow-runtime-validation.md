# Evidence: content-admin-ai-draft-workflow-runtime-validation-2026-06-24

## Task Metadata

- Task id: `content-admin-ai-draft-workflow-runtime-validation-2026-06-24`.
- Branch: `codex/content-admin-ai-draft-runtime-20260624`.
- Task kind: `acceptance_runtime_walkthrough`.
- Execution profile: `local_content_admin_ai_draft_workflow_runtime_validation`.
- Status: closed.
- Result: functional content_admin AI draft workflow pass, Chinese UI language check fail, no final Pass.
- Non-claim: this evidence does not declare standard/advanced MVP final Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.

## Requirement Mapping Result

- R7 and US-06-15 require content backend `AI出题` and `AI组卷` entries that lead to draft/review, not direct formal
  writes.
- The 2026-06-21 and 2026-06-23 AI decisions require isolated draft/review boundaries and redacted evidence.
- This task validates runtime usability and visible boundary only; it does not approve Provider or formal adoption.

## Role Mapping Result

- In-scope role: `content_admin`.
- Out-of-scope roles: all other role rows unless a denied boundary is sampled from the active content_admin session.

## Acceptance Mapping Result

- Content backend AI draft workflow functional checks passed for the sampled content_admin session.
- Chinese UI language check failed because visible technical English remains on content AI pages.
- The task records the strict scoped result as fail/no-final-Pass because UI language is part of the visible acceptance
  check.
- Full role-separated final Pass remains blocked.

## Runtime Observation Summary

| Check                               | Result | Redacted evidence summary                                                                                                                                                             |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local target and session            | pass   | Browser was on local `127.0.0.1:3000`; laozhuang had logged in as `content_admin`; Codex entered no creds.                                                                            |
| Discoverable navigation entries     | pass   | Content backend navigation exposed `AI出题` and `AI组卷` links.                                                                                                                       |
| `AI出题` draft/review route         | pass   | Route opened and displayed content AI draft/review status.                                                                                                                            |
| `AI组卷` draft/review route         | pass   | Route opened; after loading it displayed content AI draft/review status.                                                                                                              |
| Formal write boundary               | pass   | Visible state said generated output remains in content AI draft/review and does not directly write formal content.                                                                    |
| Provider boundary                   | pass   | Visible state said Provider execution remains subject to later approval; no Provider action was triggered.                                                                            |
| Operations denied boundary sample   | pass   | Direct `/ops/redeem-codes` showed no-access state and did not expose global ops surfaces.                                                                                             |
| Organization denied boundary sample | pass   | Direct `/organization/portal` showed no-access state and did not expose organization backend surfaces.                                                                                |
| Browser console warnings/errors     | pass   | Browser warning/error count after observation was `0`.                                                                                                                                |
| Logout                              | pass   | Codex clicked one visible `退出登录` control and Browser returned to the local login page.                                                                                            |
| Chinese UI language                 | fail   | Visible UI still contained technical English labels including `question`, `paper`, `Provider`, and `audit_log`; content list also exposed English fixture titles before route checks. |

## Boundary Check

- Codex did not enter credentials, inspect browser storage, capture screenshots, dump HTML, read `.env*`, call Provider,
  write formal content, mutate database state, or claim final Pass.
- No prompt, Provider payload, raw generated content, full question or paper content, token, cookie, browser storage, or
  credential material is recorded.

## Validation Results

- Pass: scoped planning hardening before runtime observation.
- Pass: final scoped Prettier write/check.
- Pass: `git diff --check`.
- Pass: final Module Run v2 pre-commit hardening. Scope scan accepted all five changed files, requirement mapping passed,
  and sensitive evidence plus terminology scans reported no findings.

## Verdict

Functional content_admin AI draft workflow checks passed, but strict scoped acceptance remains fail because Chinese UI
language is not clean. No final Pass is declared.
