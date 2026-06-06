# Advanced Edition Follow-Up Decisions Evidence

## Summary

- Scope: docs-only requirements-design maintenance.
- Branch: `codex/advanced-edition-follow-up-decisions`.
- User-confirmed decision: `auth_upgrade` uses option B, meaning an independent upgrade record, unchanged original authorization, and dynamic `effectiveEdition` calculation.
- User-confirmed decision: `edition_upgrade` uses option B, meaning it is modeled as a `redeem_code` type rather than a separate upgrade-code entity.
- User-confirmed decision: enterprise manual upgrade uses option B, meaning a lightweight approval record with external reference, audit, and revocation.
- User-confirmed decision: personal and enterprise authorization union API contract uses option B, meaning it returns an authorization context list.
- User-confirmed decision: organization portal homepage metrics use option B, meaning three separated metric domains with fixed switchable time ranges and ranking rules.
- User-confirmed decision: employee detail field visibility uses option B, meaning statistics and summaries are visible, sensitive raw content is hidden, and unrelated personal content is invisible.
- User-confirmed decision: organization snapshot at answer time uses option B, meaning answer records write organization snapshots, historical statistics stay snapshot-based, and missing snapshots are only backfilled when reliable.
- User-confirmed decision: AI quota unit uses option B, meaning abstract integer quota points with backend-configurable consumption rules.
- User-confirmed decision: initial quota and behavior consumption table use a backend-configurable default table, with concrete values left for later decisions.
- User-confirmed decision: AI quota packages use source-separated quota packages, quota ledger entries, operations-registered purchase/grants, and no online payment integration in the first release.
- User-confirmed decision: AI generation task worker runtime uses a database task table plus lightweight worker and recoverable scanning, with queue infrastructure considered later after user scale grows.
- User-confirmed decision: AI generated question schema and validation uses per-`question_type` structured schema, a unified outer shape, and strict post-generation validation.
- User-confirmed decision: organization training first-release loop uses draft generation/editing, publish, employee answering, statistics/ranking, and unpublish.
- User-confirmed decision: platform content adoption flow uses AI draft pool, content teacher editing and validation, adoption into official draft, then the existing formal publish flow.
- User-confirmed decision: standard-to-advanced upgrade prompts and notifications use visible-but-unavailable advanced entries, explicit upgrade paths, and operations-traceable notifications.
- User-confirmed decision: peak capacity, pressure testing, and degradation strategy uses target metrics, dev/staging simulation testing, and staged degradation that protects standard core paths.
- User-confirmed decision: expired content governance uses expired hidden status, operations governance entry, recovery with reason, hard-delete approval, and periodic cleanup candidate lists.
- User-confirmed decision: log and evidence redaction uses default redacted summaries, controlled snapshots only by exception, and no raw prompt/answer/model output in evidence.
- Changed surfaces:
  - `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
  - `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-follow-up-decisions.md`
  - `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-follow-up-decisions.md`

## Design Record Update

- Added `Auth Upgrade Data Contract`.
- Recorded `auth_upgrade` internal fields using `snake_case`.
- Recorded status semantics for `active`, `expired`, and `revoked`.
- Recorded uniqueness, idempotency, audit, revocation, and `effectiveEdition` calculation rules.
- Removed the resolved `auth_upgrade` follow-up queue item.
- Added `Edition Upgrade Redeem Code Relationship`.
- Recorded that `edition_upgrade` is a `redeem_code` type, shares card-code lifecycle governance, creates `auth_upgrade` on success, and does not create a new `personal_auth`.
- Removed the resolved `edition_upgrade` follow-up queue item.
- Added `Organization Manual Upgrade Operation`.
- Recorded enterprise `org_auth` manual upgrade pre-checks, required operation records, result rules, revocation behavior, and first-release deferrals.
- Removed the resolved enterprise manual upgrade follow-up queue item.
- Added `Authorization Context API Contract`.
- Recorded response shape, field semantics, default context rules, and privacy/statistics boundaries for personal and enterprise authorization contexts.
- Removed the resolved authorization union API contract follow-up queue item.
- Added `Organization Portal Homepage Metrics`.
- Recorded formal learning, AI autonomous learning, and enterprise training metric domains, default 30-day range, 7/30/90-day switching, organization-scope rules, and ranking rules.
- Removed the resolved organization portal homepage metrics follow-up queue item.
- Added `Employee Detail Field Visibility`.
- Recorded visible fields, masked or summarized fields, invisible fields, enterprise-quota AI autonomous learning boundaries, and organization-scope rules.
- Removed the resolved employee detail field visibility follow-up queue item.
- Added `Organization Snapshot At Answer Time`.
- Recorded applicable domains, snapshot capture timing, suggested snapshot fields, statistics rules, migration/backfill strategy, and first-release deferrals.
- Removed the resolved organization snapshot follow-up queue item.
- Added `Quota Unit And Configuration`.
- Recorded abstract integer AI quota points, backend-configurable consumption rules, provider token/cost audit separation, behavior consumption principles, and first-release deferrals.
- Added `Quota Defaults And Consumption Table`.
- Recorded configurable quota objects, default table principles, behavior consumption tiers, and remaining quota-value decisions.
- Added `Quota Package And Ledger Rules`.
- Recorded quota source types, operations-registered purchases, gifts, manual adjustments, periodic resets, deduction/release/expiration rules, over-limit behavior, and payment/refund boundaries.
- Removed the resolved quota package purchase/grant/reset/expiration/over-limit follow-up queue item.
- Added `Worker Runtime And Recovery`.
- Recorded AI generation task submission, worker claiming, execution states, recovery scanning, first-release boundaries, and later queue-infrastructure upgrade triggers.
- Removed the resolved AI generation worker runtime and failure recovery follow-up queue item.
- Added `AI Generated Question Schema And Validation`.
- Recorded unified generated-question JSON shape, naming rules, common validation rules, first-release `question_type` validation rules, validation-failure handling, and first-release deferrals.
- Removed the resolved AI generated content schema and validation follow-up queue item.
- Added `Organization Training Minimum Loop`.
- Recorded organization training draft creation, AI generation, editing confirmation, publication scope, employee answering, statistics/ranking, unpublish behavior, and first-release deferrals.
- Removed the resolved organization training minimum loop follow-up queue item.
- Added `Platform Content Adoption Flow`.
- Recorded AI draft pool boundaries, editable fields, pre-adoption validation, adoption results, formal publish boundary, and first-release deferrals.
- Removed the resolved platform content teacher adoption flow follow-up queue item.
- Added `Upgrade Prompt And Notification`.
- Recorded personal-user prompts, enterprise-admin prompts, operations tracking, error response boundaries, and first-release deferrals.
- Removed the resolved standard-to-advanced prompt and notification follow-up queue item.
- Added `Peak Capacity And Degradation Strategy`.
- Recorded target indicators, dev/staging pressure testing boundaries, staged degradation, user-facing prompts, and queue-infrastructure upgrade triggers.
- Removed the resolved peak capacity, pressure testing, and degradation follow-up queue item.
- Added `Expired Content Governance`.
- Recorded expired-hidden behavior, operations governance entry, recovery rules, hard-delete approval, periodic cleanup candidate lists, and first-release deferrals.
- Removed the resolved expired content governance follow-up queue item.
- Added `Log And Evidence Redaction`.
- Recorded default raw-content prohibitions, allowed summary fields, controlled snapshot exceptions, evidence hygiene rules, redaction/summary rules, and first-release deferrals.
- Removed the resolved log and evidence redaction follow-up queue item.

## Scope Guard

- No product code changed.
- No database schema or migration changed.
- No API implementation changed.
- No package or lockfile changed.
- No environment file, secret, provider call, staging, production, cloud, deployment, or external service action performed.

## Validation

| Command                                                                                                                                                                                                                                                                                                    | Result | Notes                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| `node .\node_modules\prettier\bin\prettier.cjs --write docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-follow-up-decisions.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-follow-up-decisions.md` | pass   | Markdown formatting normalized after design/evidence updates.                                                        |
| `git diff --check`                                                                                                                                                                                                                                                                                         | pass   | No whitespace errors.                                                                                                |
| `node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-follow-up-decisions.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-follow-up-decisions.md` | pass   | All matched files use Prettier code style.                                                                           |
| `rg -n "Log And Evidence Redaction\|provider payload\|本轮 follow-up decision queue 已全部定稿\|Follow-Up Decision Queue" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`                                                                                                      | pass   | Confirmed the final redaction decision and queue closure anchors exist.                                              |
| `git status --short --branch`                                                                                                                                                                                                                                                                              | pass   | Branch is `codex/advanced-edition-follow-up-decisions`; only the three allowed Markdown files are changed/untracked. |

## Runtime Validation Skipped

- Product tests skipped because this task only updates Markdown design documentation.
- Build skipped because no runtime, route, schema, package, style, or UI behavior changed.
