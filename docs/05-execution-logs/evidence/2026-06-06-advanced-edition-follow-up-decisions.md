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
- Added `Edition Upgrade Redeem Code Relationship`.
- Added `Organization Manual Upgrade Operation`.
- Added `Authorization Context API Contract`.
- Added `Organization Portal Homepage Metrics`.
- Added `Employee Detail Field Visibility`.
- Added `Organization Snapshot At Answer Time`.
- Added `Quota Unit And Configuration`.
- Added `Quota Defaults And Consumption Table`.
- Added `Quota Package And Ledger Rules`.
- Added `Worker Runtime And Recovery`.
- Added `AI Generated Question Schema And Validation`.
- Added `Organization Training Minimum Loop`.
- Added `Platform Content Adoption Flow`.
- Added `Upgrade Prompt And Notification`.
- Added `Peak Capacity And Degradation Strategy`.
- Added `Expired Content Governance`.
- Added `Log And Evidence Redaction`.
- Removed all resolved items from the original follow-up decision queue and recorded that this queue is fully finalized.

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
| `rg -n "Log And Evidence Redaction\|provider payload\|Follow-Up Decision Queue" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`                                                                                                                                                | pass   | Confirmed the final redaction decision and queue closure anchors exist.                                              |
| `git status --short --branch`                                                                                                                                                                                                                                                                              | pass   | Branch is `codex/advanced-edition-follow-up-decisions`; only the three allowed Markdown files are changed/untracked. |

## Master Merge Validation

| Command                                                                                                                                                                                                                                                                                                    | Result | Notes                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `git fetch origin master`                                                                                                                                                                                                                                                                                  | pass   | Confirmed remote `master` was fetched before integration.                                          |
| `git switch master`                                                                                                                                                                                                                                                                                        | pass   | Local `master` was up to date with `origin/master` before merge.                                   |
| `git merge --no-ff --no-commit codex/advanced-edition-follow-up-decisions`                                                                                                                                                                                                                                 | pass   | Merge applied cleanly with no conflicts and was held before commit for validation/evidence update. |
| `git diff --check`                                                                                                                                                                                                                                                                                         | pass   | No whitespace errors in the merged result.                                                         |
| `node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-follow-up-decisions.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-follow-up-decisions.md` | pass   | All merged Markdown files use Prettier code style.                                                 |
| `rg -n "Log And Evidence Redaction\|Follow-Up Decision Queue" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`                                                                                                                                                                  | pass   | Confirmed queue closure and final redaction decision remain present after merge.                   |

## Runtime Validation Skipped

- Product tests skipped because this task only updates Markdown design documentation.
- Build skipped because no runtime, route, schema, package, style, or UI behavior changed.
