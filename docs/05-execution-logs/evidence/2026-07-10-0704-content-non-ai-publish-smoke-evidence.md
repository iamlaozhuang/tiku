# 0704 Content Non-AI Publish Smoke Evidence

## Scope

- Task id: `0704-content-non-ai-publish-smoke-2026-07-10`
- Branch: `codex/0704-content-non-ai-publish-smoke`
- Result category: `pass_targeted_content_non_ai_publish_contract_runtime_ui_and_localhost_api_smoke`
- Repair dependency closed first: `0704-paper-list-content-guard-repair-2026-07-10`

## Redacted Readiness Preflight

| roleLabel                 | authContextCategory           | statusCategory      |
| ------------------------- | ----------------------------- | ------------------- |
| super_admin               | admin_session_no_learner_auth | ready_0704_verified |
| ops_admin                 | ops_admin_only                | ready_0704_verified |
| content_admin             | content_admin_only            | ready_0704_verified |
| personal_standard_student | standard_only_context         | ready_0704_verified |
| personal_advanced_student | personal_advanced_ai_context  | ready_0704_verified |
| org_standard_admin        | org_standard_admin_context    | ready_0704_verified |
| org_advanced_admin        | org_advanced_admin_context    | ready_0704_verified |
| org_standard_employee     | standard_only_context         | ready_0704_verified |
| org_advanced_employee     | org_advanced_ai_context       | ready_0704_verified |

## Localhost API Smoke

All localhost checks were read-only route status checks. No content create, edit, disable, copy, publish, archive, or
formal adoption was executed through localhost.

| roleLabel     | routeLabel     | statusCategory             |
| ------------- | -------------- | -------------------------- |
| content_admin | questions_list | allowed_success_envelope   |
| content_admin | materials_list | allowed_success_envelope   |
| content_admin | papers_list    | allowed_success_envelope   |
| super_admin   | questions_list | allowed_success_envelope   |
| super_admin   | materials_list | allowed_success_envelope   |
| super_admin   | papers_list    | allowed_success_envelope   |
| ops_admin     | questions_list | denied_permission_category |
| ops_admin     | materials_list | denied_permission_category |
| ops_admin     | papers_list    | denied_permission_category |

Initial Stage 4 smoke found `ops_admin` unexpectedly allowed on `papers_list`. That was repaired and closed by
`docs/05-execution-logs/evidence/2026-07-10-0704-paper-list-content-guard-repair-evidence.md`, then rerun here as
`denied_permission_category`.

## Targeted Tests

| Command                                                                                                           | Result | Notes                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm@10.26.1 exec vitest run ...Stage4 content files plus admin-flow-runtime.test.ts`                   | PASS   | 20 files / 110 tests.                                                                                                   |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown ...Stage4 docs/state files...`                      | PASS   | Scoped Stage4 files passed.                                                                                             |
| `git diff --check`                                                                                                | PASS   | No whitespace errors.                                                                                                   |
| blocked path diff check                                                                                           | PASS   | No source, test, package, lockfile, schema, migration, seed, DB, e2e, runtime, or env diff in Stage4 validation commit. |
| `corepack pnpm@10.26.1 run lint`                                                                                  | PASS   | ESLint passed.                                                                                                          |
| `corepack pnpm@10.26.1 run typecheck`                                                                             | PASS   | TypeScript passed.                                                                                                      |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-content-non-ai-publish-smoke-2026-07-10`                     | PASS   | Module Run v2 precommit passed.                                                                                         |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-content-non-ai-publish-smoke-2026-07-10 -SkipRemoteAheadCheck` | PASS   | Module Run v2 prepush passed.                                                                                           |

## Acceptance Mapping

| Acceptance item                                                                                   | Status category                             |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `content_admin` can access formal content maintenance surfaces                                    | pass_localhost_allowed_status               |
| draft `question`, `material`, and `paper` lifecycle status categories behave as expected          | pass_targeted_contract_runtime_ui_tests     |
| publish validation blocks incomplete paper status categories                                      | pass_targeted_service_route_tests           |
| published `paper` and referenced `question`/`material` boundaries remain immutable where required | pass_lock_snapshot_copy_only_contract_tests |
| takedown blocks new learner starts while preserving historical status categories                  | pass_archive_termination_guard_test         |
| AI generation formal adoption is not rerun                                                        | pass_not_executed                           |

## Redaction Boundary

Evidence contains only role labels, route labels, auth context categories, status categories, and command results. It does
not contain credentials, cookies, sessions, tokens, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw
prompts, raw AI output, raw answers, or full `question`/`paper`/`material` content.
