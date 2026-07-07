# 2026-07-07 0704 DB Local Manual Role Acceptance Prep Evidence

## Scope

- Task id: `0704-db-local-manual-role-acceptance-prep-2026-07-07`
- Branch: `codex/0704-db-local-manual-role-acceptance-prep-2026-07-07`
- Runtime target: explicit local 20260704 DB label.
- Boundary: local localhost preparation only; no Provider-enabled flow, no staging/prod/deploy, no Cost Calibration, no schema/migration/seed/package/lockfile change, no destructive DB action, no `.env.local` edit.
- Redaction: this evidence intentionally records only labels, status booleans, route labels, role labels, and safe gap categories. It does not record credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, phone/email/password, plaintext `redeem_code`, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk content, screenshots, raw DOM, traces, or private fixture values.

## Recovery Sources Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- Advanced edition requirement index, module, story, authorization, and ADR-007 materials.
- Current AI generation traceability overlays through the 2026-07-06 recontract requirements materialization.
- Latest login dev origin readiness fix evidence/audit.
- Latest explicit 20260704 localhost browser replay evidence/audit.
- Latest full DB-backed local runtime replay evidence/audit.
- Latest post-recontract local adversarial acceptance consolidation evidence/audit.
- 0704 DB/account boundary evidence, including full-chain account planning, 0704 local DB-backed replay, org enterprise fixture materialization, no-Provider route grounding replay, and personal standard fixture acceptance evidence/audits.

## Service Consistency

| Check                                     | Result       | Redacted note                                                                             |
| ----------------------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| `master` vs `origin/master` before branch | pass         | fetched and aligned; worktree clean before task branch                                    |
| short-lived branch                        | pass         | current branch is task branch                                                             |
| process-only DB override                  | pass         | localhost dev server restarted with explicit 20260704 target; `.env.local` not modified   |
| read-only DB label check                  | pass         | target label matched; no DB URL or row output recorded                                    |
| `/login` HTTP reachability                | pass         | `http://127.0.0.1:3000/login` returned 200                                                |
| login dev-origin readiness                | pass         | `allowedDevOrigins` includes loopback host and browser probe reached login without submit |
| browser probe redaction                   | pass         | no screenshot, trace, DOM dump, cookie, session, or credential output                     |
| Provider-enabled flow                     | not_executed | blocked by task boundary                                                                  |
| destructive DB action                     | not_executed | only read-only label check and localhost service start                                    |

## Localhost Browser Probe

| Probe                                              | Result |
| -------------------------------------------------- | ------ |
| route reachable in browser                         | pass   |
| login inputs present                               | pass   |
| submit enabled after synthetic non-submitted input | pass   |
| console error count                                | 0      |

Note: an initial probe attempted the wrong direct module name and failed before browser launch. It was rerun through the existing `@playwright/test` dependency; no dependency was added or changed.

## 0704 Account Inventory

| role                        | account material exists | needs supplement | gap type                                                                                                                                              |
| --------------------------- | ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_advanced_student` | yes                     | no               | none                                                                                                                                                  |
| `personal_standard_student` | partial                 | yes              | current explicit 20260704 direct-login material is not closed; older local 0704 evidence exists but is not sufficient to bind this manual role thread |
| `org_advanced_employee`     | partial                 | yes              | employee import material exists, but direct session login material is not validated for this manual thread                                            |
| `org_standard_employee`     | yes                     | no               | none                                                                                                                                                  |
| `org_advanced_admin`        | yes                     | no               | none                                                                                                                                                  |
| `org_standard_admin`        | yes                     | no               | none                                                                                                                                                  |
| `content_admin`             | yes                     | no               | none                                                                                                                                                  |

Inventory boundary: only the 20260704 DB/account fixture family and latest 20260704 evidence were used. 0601, 0623, dev seed, and historical role-separated materials were not treated as usable 20260704 login evidence.

## Non-Destructive Supplement Proposal

No supplement was executed. If fresh approval is granted, the safe local-only proposal is:

1. Use the explicit 20260704 DB target through process-only connection handling; do not edit `.env.local`.
2. Run read-only preflight checks by redacted role/selector labels only; do not print DB rows, internal ids, credentials, or private fixture values.
3. For `personal_standard_student`, reconcile the current 20260704 full-chain personal account selector with a direct manual-login fixture while preserving standard-edition denial semantics.
4. For `org_advanced_employee`, bind the existing advanced employee import material to direct manual-login material, preserving advanced employee authorization and enterprise-training association.
5. Apply only non-destructive local materialization if missing; no delete, truncate, schema, migration, seed file, package, lockfile, env, staging/prod/deploy, Provider-enabled, or Cost Calibration action.
6. Re-run redacted login/session preflight and write separate evidence/audit.

This proposal requires explicit human approval before any DB or private account fixture write.

## Manual Acceptance Checklist

| role                        | login viable now | entry path                                                         | AI出题 visible                                 | AI组卷 visible                              | standard denial expected | advanced error clarity expected | content backend draft/review closure |
| --------------------------- | ---------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------- | ------------------------ | ------------------------------- | ------------------------------------ |
| `personal_advanced_student` | yes              | `/login` -> `/home` -> `/ai-generation`                            | yes                                            | yes                                         | n/a                      | yes                             | n/a                                  |
| `personal_standard_student` | needs supplement | `/login` -> `/home`; direct `/ai-generation` should be unavailable | no                                             | no                                          | yes                      | n/a                             | n/a                                  |
| `org_advanced_employee`     | needs supplement | `/login` -> `/home`, `/organization-training`, `/ai-generation`    | yes                                            | yes                                         | n/a                      | yes                             | n/a                                  |
| `org_standard_employee`     | yes              | `/login` -> `/home`, `/organization-training` if assigned          | no                                             | no                                          | yes                      | n/a                             | n/a                                  |
| `org_advanced_admin`        | yes              | `/login` -> `/organization/portal`                                 | yes via `/organization/ai-question-generation` | yes via `/organization/ai-paper-generation` | n/a                      | yes                             | n/a                                  |
| `org_standard_admin`        | yes              | `/login` -> `/organization/portal`                                 | no                                             | no                                          | yes                      | n/a                             | n/a                                  |
| `content_admin`             | yes              | `/login` -> `/content/organization-portal`                         | yes via `/content/ai-question-generation`      | yes via `/content/ai-paper-generation`      | n/a                      | yes                             | yes                                  |

Manual operator note: record only redacted phenomena by role and route label. Do not record screenshots, DOM, cookies, sessions, credentials, account values, DB rows, Provider payloads, prompts, raw AI output, or full question/paper/material content.

## Command Evidence

| Command class                             | Result | Redacted note                                            |
| ----------------------------------------- | ------ | -------------------------------------------------------- |
| `git fetch origin master` / status checks | pass   | alignment and clean baseline confirmed before branch     |
| process-only local dev server restart     | pass   | 127 loopback server active with explicit 20260704 target |
| read-only DB target label probe           | pass   | boolean match only                                       |
| `Invoke-WebRequest /login`                | pass   | HTTP 200                                                 |
| browser login readiness probe             | pass   | no submit; no artifact capture                           |
| private fixture inventory label scan      | pass   | only role labels and gap categories retained             |
| focused unit tests                        | pass   | 2 files, 7 tests                                         |
| `npm.cmd run lint`                        | pass   | exit 0                                                   |
| `npm.cmd run typecheck`                   | pass   | exit 0                                                   |
| `git diff --check`                        | pass   | exit 0                                                   |
| scoped Prettier write/check               | pass   | check passed after formatting docs                       |
| Module Run v2 pre-commit hardening        | pass   | scope, sensitive evidence, terminology checks passed     |

## Current Result

- Service preparation is ready for manual walk-through on `http://127.0.0.1:3000/login`.
- Five role materials are ready for manual login preparation.
- Two role materials need explicit human approval before local non-destructive supplement: `personal_standard_student`, `org_advanced_employee`.
- No current source-code defect is confirmed in this thread.
- No release readiness, production usability, staging, deploy, Provider-enabled, or Cost Calibration claim is made.
