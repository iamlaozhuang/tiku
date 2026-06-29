# Local Acceptance Session Runtime Bridge Stage C Repair Traceability

## Scope

- Task id: `local-acceptance-session-runtime-bridge-stage-c-repair-2026-06-28`
- Scope: repair the local-only acceptance session bridge so `/api/v1/local-acceptance-sessions` sessions can be resolved
  by `/api/v1/sessions` in the same live localhost runtime.
- Source trigger: `full-acceptance-content-admin-ai-generation-detail-rerun-after-safe-bootstrap-2026-06-28` blocked
  because bootstrap accepted but live session resolution stayed unauthorized.

## Requirement Mapping

| Source                     | Mapping                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Owner-facing checklist     | Unblocks future rerun for `content_admin.content_ai_question_generation` and `content_admin.content_ai_paper_generation`. |
| ADR-002                    | Keep route handlers thin and business logic in `src/server/services`.                                                     |
| Stage C approval           | Source/test repair only, local validation, redacted evidence, commit/merge/push/cleanup per task.                         |
| AI generation reuse policy | No AI generation source changes; existing shared AI generation UI/service contracts must remain reused.                   |

## Boundaries

Allowed:

- Local-only source/test repair for local acceptance session runtime bridge.
- Focused unit tests and full unit baseline.
- Localhost API smoke only for bootstrap/session status, with sensitive material handled in memory and not recorded.

Forbidden:

- Credentials, cookies, tokens, sessions, localStorage, Authorization headers in evidence.
- Raw DOM, screenshots, traces, raw DB rows, internal IDs, PII, env contents.
- Provider calls/configuration, prompts, raw AI input/output.
- AI generation UI/service duplication or role-specific AI implementation.
- DB writes, schema/migration/seed, package/lockfile changes, staging/prod/deploy, PR, force push, final Pass, Cost
  Calibration Gate.
