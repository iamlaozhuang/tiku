# Content AI 0704 Account Matrix Recovery Evidence

## Scope

- Task id: `content-ai-0704-account-matrix-recovery-2026-07-09`
- Branch: `codex/content-ai-0704-account-matrix-recovery`
- Mode: localhost-only, redacted runtime credential-readiness verification.

## Supersession

This record supersedes the account-matrix portion of
`2026-07-09-content-ai-0704-account-fixture-readiness.md`.

The earlier record was conservative because it only counted exact structured
role selectors. The corrected recovery pass also reads scenario markdown,
bootstrap markdown, and employee import CSV selectors in memory.

## Private Material Coverage

| Role label                  | Source category                         | Credential pair present | Runtime login | Authorization category                                                             |
| --------------------------- | --------------------------------------- | ----------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `super_admin`               | bootstrap markdown                      | yes                     | pass          | `super_admin`                                                                      |
| `ops_admin`                 | scenario markdown                       | yes                     | pass          | `ops_admin`                                                                        |
| `content_admin`             | scenario markdown                       | yes                     | pass          | `content_admin`                                                                    |
| `org_standard_admin`        | scenario markdown                       | yes                     | pass          | `org_standard_admin`                                                               |
| `org_advanced_admin`        | scenario markdown                       | yes                     | pass          | `org_advanced_admin`                                                               |
| `personal_standard_student` | structured JSON                         | yes                     | pass          | `personal_auth/standard/standard/not_blocked/no_ai`                                |
| `personal_advanced_student` | scenario markdown alias                 | yes                     | pass          | `personal_auth/standard/advanced/production_enablement_blocked/ai_capable`         |
| `org_standard_employee`     | employee import CSV                     | yes                     | pass          | `org_auth/standard/standard/not_blocked/no_ai`                                     |
| `org_advanced_employee`     | employee import CSV and structured JSON | yes                     | pass          | `org_auth/advanced/advanced/production_enablement_blocked/ai_and_training_capable` |

## Runtime Probe Summary

| Probe                                                | Result              |
| ---------------------------------------------------- | ------------------- |
| Localhost endpoint                                   | pass                |
| Private account values output                        | no                  |
| Session/cookie/token/localStorage/auth header output | no                  |
| Env value / DB URL output                            | no                  |
| Raw DB row / internal numeric id output              | no                  |
| Provider call                                        | not executed        |
| Screenshot / raw DOM capture                         | not executed        |
| Direct DB connection or mutation                     | not executed        |
| Product login route used                             | yes, localhost only |

## Remaining Interpretation

- The local service is strongly associated with the 0704 fixture data by successful authentication of the private 0704
  role matrix on `127.0.0.1:3000`.
- The personal advanced learner is represented by the private personal contact account whose effective edition resolves
  to advanced and whose personal AI capabilities are true. `production_enablement_blocked` remains present because the
  local production enablement gate is not configured, and the personal AI request route treats that status as a usable
  local capability context.
- Employee accounts are represented by the first rows of the standard and advanced employee import CSV files; row values
  were used only in memory.

## Validation

| Command                                                                                                                 | Result                                   |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped-doc-files>`                                       | pass                                     |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped-doc-files>`                                       | pass                                     |
| `git diff --check`                                                                                                      | pass                                     |
| `corepack pnpm@10.26.1 lint`                                                                                            | pass                                     |
| `corepack pnpm@10.26.1 typecheck`                                                                                       | pass                                     |
| Targeted tests                                                                                                          | not applicable; no source or test change |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-account-matrix-recovery-2026-07-09`                     | pass                                     |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-account-matrix-recovery-2026-07-09 -SkipRemoteAheadCheck` | pass                                     |
