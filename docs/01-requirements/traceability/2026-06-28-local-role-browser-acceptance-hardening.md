# 2026-06-28 Local Role Browser Acceptance Hardening Traceability

- Task id: `local-role-browser-acceptance-hardening-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-role-browser-acceptance-20260628`
- Scope: local-only six-role browser acceptance hardening after the local full-loop rollup.
- Boundary: no Cost Calibration, no release/final Pass, no staging/prod/deploy, no Provider call, no package/lockfile or `.env*` change, no schema/migration.

## Requirement Mapping Result

| Requirement area               | Local acceptance bridge                                                                                                                                   | Evidence                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Multi-role local loop          | Browser login and route checks covered `student`, `content_admin`, `ops_admin`, `org_standard_admin`, `org_advanced_admin`, and `employee`.               | `docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md` |
| Student experience             | Student home, practice, and mistake_book/AI explanation entry routes stayed reachable after local login.                                                  | Browser acceptance: 3/3 student routes passed.                                          |
| Content AI generation          | Content admin AI question and paper generation entry routes rendered locally without permission denial.                                                   | Browser acceptance: 2/2 content admin routes passed; focused unit fixtures aligned.     |
| Ops admin                      | Ops users and AI audit/log operations entry routes rendered locally without permission denial.                                                            | Browser acceptance: 2/2 ops routes passed.                                              |
| Organization standard admin    | Standard organization admin saw local organization portal and standard-unavailable state for advanced-only training, analytics, and AI generation routes. | Browser acceptance: 4/4 standard org admin routes passed.                               |
| Organization advanced admin    | Advanced organization admin reached organization portal, training, analytics, and organization AI question/paper generation routes.                       | Browser acceptance: 5/5 advanced org admin routes passed.                               |
| Employee organization training | Employee login and organization training route stayed reachable locally.                                                                                  | Browser acceptance: 2/2 employee routes passed.                                         |
| Authorization DB alignment     | Unit fixtures now reflect runtime `org_auth` and `service_computed` admin workspace capability requirements.                                              | Focused RED/GREEN unit evidence.                                                        |
| Redaction and safety           | Evidence records only role/route/status aggregates and command outcomes.                                                                                  | Evidence redaction section.                                                             |

## Code/Test Mapping

| File                                                            | Reason                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `tests/unit/organization-training-admin-entry-surface.test.ts`  | Align organization admin session fixture with runtime organization auth capability source. |
| `tests/unit/organization-analytics-admin-entry-surface.test.ts` | Align organization admin session fixture with runtime organization auth capability source. |
| `tests/unit/admin-ai-generation-entry-surface.test.ts`          | Align shared admin AI generation fixture with runtime organization auth capability source. |
| `docs/04-agent-system/state/project-state.yaml`                 | Track the local browser acceptance task status and validation state.                       |
| `docs/04-agent-system/state/task-queue.yaml`                    | Add and close the local browser acceptance hardening task.                                 |

## Non-Goals

- No formal question or paper adoption.
- No Provider/model payload, prompt, raw AI output, or cost calibration.
- No release readiness or final Pass decision.
- No staging/prod/deploy, payment, OCR, export, or external-service execution.
