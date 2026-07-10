# 2026-07-10 0704 Private Account Usage Guide Evidence

## Task

- Task id: `0704-private-account-usage-guide-2026-07-10`
- Branch: `codex/0704-private-account-usage-guide`
- Scope: docs/process task for explicit 0704 private account lookup and readiness-preflight discipline.

## Boundary

- Private credential values were not printed, committed, or copied into repository files.
- Repository evidence records only file categories, role labels, readiness-state labels, and command results.
- No credential, phone number, password, cookie, token, session, Authorization header, localStorage, env value, DB URL, raw DB row, internal id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, or private fixture content is recorded.
- No source code, test code, package, lockfile, schema, migration, seed, Provider, AI generation submit, browser, screenshot, raw DOM, staging/prod/deploy, PR, force push, Cost Calibration, database connection, database mutation, or destructive DB operation was performed.

## Artifact Summary

- Private index created outside repository:
  - `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
  - Content category: private lookup index and readiness-state vocabulary.
  - Credential handling: pointer to canonical private credential files; no repository copy.
- Repository guide created:
  - `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
  - Content category: redacted lookup order, private-file meaning, readiness states, stop rule.

## Role-State Summary

| Role label category                                  | Count | Current state category                                               |
| ---------------------------------------------------- | ----: | -------------------------------------------------------------------- |
| Bootstrap admin                                      |     1 | `seeded`                                                             |
| Recent usable learner fixtures                       |     3 | `usable_recent_0704_fixture` or `created_by_product_path_2026-07-09` |
| Content replay learner fixture                       |     1 | `usable_recent_0704_fixture`                                         |
| Role-separated admin fixtures needing readiness task |     4 | `not_ready_in_current_0704_db_as_of_2026-07-09`                      |

## Validation Commands

- `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped docs>`: PASS.
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped docs>`: PASS.
- `git diff --check`: PASS.
- Blocked-path diff check: PASS, no output.
- `corepack pnpm@10.26.1 run lint`: PASS.
- `corepack pnpm@10.26.1 run typecheck`: PASS.
- Module Run v2 pre-commit hardening: PASS.
- Module Run v2 pre-push readiness: PASS after repairing stale repository SHA checkpoint in `project-state.yaml`.
