# Prelaunch AI Paper Test-Data Refresh Plan

**Task:** `user-led-prelaunch-test-data-refresh-2026-07-12`

**Branch:** `codex/prelaunch-test-data-refresh`

**Baseline:** `0233990b736b80b47e7afbaaf6e05283eb5c8b6a`

## Objective

Refresh only the localhost 0704 prelaunch AI paper history that cannot satisfy the accepted persisted-snapshot contract. The database is test and acceptance data only. No legacy paper result is reconstructed from current question sources, browser state, or a Provider request.

## Required Reading Completed

- `AGENTS.md`, project state, task queue, the code-taste commandments, ADR-001 through ADR-007, requirement indexes, edition-aware authorization requirements, and the full-role UI/UX implementation entry.
- AI requirements SSOT, Phase4 recovery baseline, acceptance-baseline normalization, goal-completion audit, the 2026-07-12 AI training history resume repair plan/evidence/audit, and the earlier 0704 fixture/history records.
- The accepted 2026-07-12 phone visibility and prelaunch AI paper history decision, the three completed phone decision/enforcement/validation records, current AI result/session schema, migrations, repositories, and persisted-result route contracts.

## Contract And Candidate Definition

- The only candidate is a `personal_ai_generation_result` whose `task_type` is `ai_paper_generation`, whose result is a draft, and whose persisted `content_redacted_snapshot` lacks a structurally valid `paperAssembly` object.
- AI question results, results with an assembled `paperAssembly`, formal content, organization training, authorization, users, organizations, and all unrelated AI task chains are out of scope.
- Direct dependencies are discovered from current database metadata before any mutation. The known first-order chain is result -> learning session -> answer feedback; task metadata and task-level dependencies are inventoried instead of assumed.

## Preflight And Stop Conditions

1. Confirm `master == origin/master ==` the baseline SHA and a clean worktree before database contact.
2. Confirm the canonical 0704 local target through the approved local container connection. Do not read or print `.env.local`, environment values, connection details, credential values, session data, or raw rows.
3. Read database metadata and aggregate counts only. Verify target identity, expected tables/columns, candidate count, direct-dependency count, and candidate-task dependency inventory.
4. Stop without mutation if the target is not the canonical 0704 acceptance database, the snapshot JSON contract differs from source, an unanticipated foreign key/dependency is present, any candidate is outside the narrow definition, or a backup cannot be verified.

## Backup And Transaction

1. Create an external, non-versioned backup covering only the affected AI result/session/feedback/task dependency tables. Verify the backup exists, is non-empty, has an expected PostgreSQL dump header, and record only its SHA256 fingerprint in evidence.
2. Re-run the aggregate candidate predicate after backup. If zero candidates remain, record a no-op refresh and skip mutation.
3. If candidates remain, run one database transaction that deletes dependent feedback, dependent learning sessions, exact candidate results, and only their now-unreferenced task metadata/task rows. The transaction must reject any wider count than the preflight inventory.
4. Never truncate, reset sequences, alter schema, run migration tooling, change fixtures, or delete shared AI call/audit records. On a mismatch or error, roll back; restore only from the external backup through a separately recorded recovery command if rollback cannot complete.

## Postflight And Regression

- Re-run aggregate invariants: no candidate remains, no dependent learning session/feedback remains for deleted results, and no unrelated task chain was selected.
- Confirm the Provider remains closed and the local learner result-history route returns the standard response envelope without recording business content.
- Run the full unit suite, lint, typecheck, format check, webpack build, and whitespace check.
- Perform two adversarial reviews: transaction scope/dependency integrity and role/Provider/formal-domain regression. Then self-review all evidence against the allowed-file and redaction boundaries.

## Out Of Scope

No runtime source/test/schema/migration/fixture/dependency change, Provider-enabled action, `.env.local` change, staging, production, deployment, Cost Calibration, PR, force push, raw DOM capture, or in-repository screenshot.

## Closeout

Write redacted evidence and audit, run Module Run v2 gates, make one task-scoped commit, fast-forward into `master`, revalidate the merged baseline, push `origin/master`, confirm zero divergence, and remove the short branch/worktree.
