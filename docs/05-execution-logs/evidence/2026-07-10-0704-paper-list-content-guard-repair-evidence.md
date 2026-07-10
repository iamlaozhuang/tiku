# 0704 Paper List Content Guard Repair Evidence

## Scope

- Task id: `0704-paper-list-content-guard-repair-2026-07-10`
- Branch: `codex/0704-paper-list-content-guard`
- Triggering validation task: `0704-content-non-ai-publish-smoke-2026-07-10`
- Result category: `pass_paper_list_content_role_guard_repair`

## Redacted Finding

| roleLabel | routeLabel    | observedStatusCategory       | expectedStatusCategory       |
| --------- | ------------- | ---------------------------- | ---------------------------- |
| ops_admin | `papers_list` | `unexpected_allowed_success` | `denied_permission_category` |

No account, password, cookie, session, token, env value, DB URL, raw DB row, internal id, Provider payload, raw prompt,
raw AI output, raw answer, or full `question`/`paper`/`material` content was recorded.

## Change Summary

- Added a content-read guard to the `admin-flow-runtime` paper collection GET path.
- Reused the existing standard permission-denied envelope.
- Added a unit test proving `ops_admin` is denied before repository list access.
- Preserved `content_admin` paper collection read behavior.

## Verification

| Command                                                                                                              | Result | Notes                                                                         |
| -------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-flow-runtime.test.ts`                               | RED    | New `ops_admin` denial test failed against old code.                          |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-flow-runtime.test.ts`                               | PASS   | 1 file / 3 tests.                                                             |
| `corepack pnpm@10.26.1 exec vitest run ...Stage4 targeted files plus admin-flow-runtime.test.ts`                     | PASS   | 20 files / 110 tests.                                                         |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown ...repair files...`                                    | PASS   | Scoped repair files passed.                                                   |
| `git diff --check`                                                                                                   | PASS   | No whitespace errors.                                                         |
| blocked path diff check                                                                                              | PASS   | No package, lockfile, schema, migration, seed, DB, e2e, runtime, or env diff. |
| `corepack pnpm@10.26.1 run lint`                                                                                     | PASS   | ESLint passed.                                                                |
| `corepack pnpm@10.26.1 run typecheck`                                                                                | PASS   | TypeScript passed.                                                            |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-paper-list-content-guard-repair-2026-07-10`                     | PASS   | Module Run v2 precommit passed.                                               |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-paper-list-content-guard-repair-2026-07-10 -SkipRemoteAheadCheck` | PASS   | Module Run v2 prepush passed.                                                 |

## Boundary

- Package and lockfile changes: none.
- Schema, migration, seed, and direct database operations: none.
- Provider, prompt, model config, Cost Calibration, staging/prod, and deploy operations: none.
- Browser, screenshot, raw DOM, credential/session capture: none.
