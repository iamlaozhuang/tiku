# 0704 Content Detail Entry Adversarial Review

## Scope

- taskId: `0704-content-detail-entry-2026-07-11`
- review target: read-only paper, question, and material detail access
- API/service/repository/validator, business write contract, permission, database, dependency, and external runtime changes: none

## Adversarial Matrix

| boundary                         | result | review summary                                                                                                                                                                                          |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Role authorization               | pass   | Detail surfaces call the existing server-authorized GET endpoints; UI state cannot widen content or super-administrator capability.                                                                     |
| No-write guarantee               | pass   | Opening and rendering details sends GET only and exposes no save, publish, archive, disable, copy, compose, or delete command.                                                                          |
| Lock boundary                    | pass   | Locked question/material content remains inspectable, while existing edit controls remain disabled and copy remains the explicit follow-up.                                                             |
| Paper lifecycle                  | pass   | Draft, published, and archived details are read-only; publish-state text does not execute or replace server validation.                                                                                 |
| Snapshot boundary                | pass   | Paper detail renders stored paper, question, material, answer, analysis, option, score, and scoring-point snapshots without modifying source content.                                                   |
| Attachment isolation             | pass   | Attachment metadata errors do not hide successfully loaded paper content; hash and storage details are not displayed.                                                                                   |
| Safe content rendering           | pass   | Existing structured rich-text renderer blocks active form/script/embed content and renders bounded images/tables without raw HTML injection.                                                            |
| URL/query isolation              | pass   | Detail state is stored in route query for refresh recovery but omitted from list API query; closing removes only the detail target.                                                                     |
| Sensitive data                   | pass   | Default and detail surfaces do not add internal numeric IDs, credentials, sessions, tokens, file hashes, raw AI data, or Provider payloads.                                                             |
| Error-state completeness         | pass   | Loading, unauthorized, forbidden, not found, generic failure, empty content, and attachment-local failure have distinct text and roles.                                                                 |
| Accessibility                    | pass   | Drawers are labelled modal dialogs with initial close focus, Escape close, focus loop, focus restoration, named controls, and scroll containment.                                                       |
| Dependency/data/runtime boundary | pass   | No package/lockfile, API contract, service, repository, validator, schema, migration, seed, direct database, env, secret, Provider, staging, production, deployment, or new screenshot action occurred. |

## Residual Risk

- No fresh browser screenshot or raw DOM capture was authorized; visual assurance uses approved existing screenshots, source inspection, safe-rendering tests, and component tests.
- Existing material question references do not include a human-readable question title in the current GET contract, so the drawer shows readable question type/status summaries without inventing names or issuing N+1 requests.
- Existing attachment GET contracts expose metadata only; this task intentionally does not claim or fabricate a download action.

## Decision

- decision: pass_ready_for_fast_forward_merge_push_and_cleanup
- claim boundary: localhost UI source/test optimization only
