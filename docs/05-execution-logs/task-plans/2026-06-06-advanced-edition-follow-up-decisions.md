# Advanced Edition Follow-Up Decisions Task Plan

## Goal

Continue the requirements-design discussion for Tiku advanced edition and AI generation modules by resolving follow-up decisions one at a time and maintaining the existing design record.

This task is docs-only. It does not approve or perform product code, database schema, migration, API, dependency, provider, staging, production, deployment, or environment changes.

## Scope

- Read and respect the existing design record:
  - `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- Maintain confirmed decisions in the design record.
- Keep unconfirmed items in the follow-up decision queue.
- Record only decisions confirmed by the user.

## Current Confirmed Decision

- User confirmed `auth_upgrade` should use option B: independent upgrade record, original authorization unchanged, and dynamic `effectiveEdition` calculation.
- User confirmed `edition_upgrade` should use option B: model it as a `redeem_code` type rather than a separate upgrade-code entity.
- User confirmed enterprise manual upgrade should use option B: lightweight approval record with external reference, audit, and revocation.
- User confirmed personal and enterprise authorization union API contract should use option B: return an authorization context list.
- User confirmed organization portal homepage metrics should use option B: three separated metric domains with fixed switchable time ranges and ranking rules.
- User confirmed employee detail field visibility should use option B: statistics and summaries visible, sensitive raw content hidden, unrelated personal content invisible.
- User confirmed organization snapshot at answer time should use option B: write snapshots on answer records, keep historical statistics snapshot-based, and only backfill missing snapshots when reliable.
- User confirmed AI quota unit should use option B: abstract integer quota points with backend-configurable consumption rules.
- User confirmed initial quota and behavior consumption table should be finalized as a backend-configurable default table, with concrete values left for later decisions.
- User confirmed AI quota package rules should use source-separated quota packages, quota ledger entries, operations-registered purchase/grants, and no online payment integration in the first release.
- User confirmed AI generation task worker runtime should use option B: database task table plus lightweight worker and recoverable scanning, with queue infrastructure considered later after user scale grows.
- User confirmed AI generated question schema and validation should use option B: per-`question_type` structured schema with a unified outer shape and strict post-generation validation.
- User confirmed organization training first-release loop should use option B: draft generation/editing, publish, employee answering, statistics/ranking, and unpublish.
- User confirmed platform content adoption flow should use option B: AI draft pool, content teacher editing and validation, adoption into official draft, then existing formal publish flow.
- User confirmed standard-to-advanced upgrade prompts and notifications should use option B: visible but unavailable advanced entries, explicit upgrade paths, and operations-traceable notifications.
- User confirmed peak capacity, pressure testing, and degradation strategy should use option B: target metrics, dev/staging simulation testing, and staged degradation that protects standard core paths.
- User confirmed expired content governance should use the B-1 model: expired hidden status, operations governance entry, recovery with reason, hard-delete approval, and periodic cleanup candidate lists.
- User confirmed log and evidence redaction should use option B: default redacted summaries, controlled snapshots only by exception, and no raw prompt/answer/model output in evidence.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Allowed Files

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-follow-up-decisions.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-follow-up-decisions.md`

## Blocked Scope

- Product source code.
- Database schema or migrations.
- API implementation.
- Tests and e2e implementation.
- Package or lock files.
- Environment files and secrets.
- AI provider calls.
- Staging, production, cloud, deployment, or external service operations.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-follow-up-decisions.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-follow-up-decisions.md
Select-String -Path docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md -Pattern 'auth_upgrade','effectiveEdition','revoked','target_auth_type','Follow-Up Decision Queue'
```

## Risk Controls

- Do not write unconfirmed follow-up items as confirmed decisions.
- Keep internal data-contract names in `snake_case`; future API DTO fields must be designed separately in `camelCase`.
- Do not expose plaintext `redeem_code` values in documentation or evidence.
- Keep this as a design record, not implementation approval.
