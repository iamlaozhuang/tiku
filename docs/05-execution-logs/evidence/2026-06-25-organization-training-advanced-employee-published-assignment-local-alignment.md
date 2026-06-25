# Organization Training Advanced Employee Published Assignment Local Alignment Evidence

Task id: `organization-training-advanced-employee-published-assignment-local-alignment-2026-06-25`

Branch: `codex/org-training-assignment-align-20260625`

## Fresh Approval

User approved targeted local assignment alignment followed by a focused browser rerun on 2026-06-25.

## Scope Guard

- Local DB read/write for targeted published organization-training assignment alignment: approved.
- Schema/migration executed: no.
- Account/user/authorization/employee mutation executed: no.
- Browser/runtime rerun executed in this task: no.
- `.env*` read/write executed: no.
- Raw rows, raw public ids, account identifiers, credentials, database URLs, tokens, cookies, screenshots, traces, or
  personal data recorded: no.
- Standard/Advanced MVP final Pass claimed: no.

## Alignment Results

The first dry-run precheck query failed before any write because it assumed `org_auth.subject` existed. The schema keeps
`subject` on `organization_training_version`, so the guard was corrected to match source versions by `profession` and
`level` only.

Guarded local DB alignment command:

| Check                                             | Result                        |
| ------------------------------------------------- | ----------------------------- |
| Transaction used                                  | yes                           |
| Temporary metrics table only                      | yes                           |
| Raw row or raw identifier output                  | no                            |
| Pre active-session employee count                 | 12                            |
| Pre active-session advanced employee count        | 11                            |
| Pre matched advanced employee count               | 10                            |
| Pre unmatched advanced employee count             | 1                             |
| Target context count                              | 1                             |
| Matching source version count by profession/level | 1                             |
| Target org visible published count before         | 0                             |
| Inserted published training version count         | 1                             |
| Post active-session advanced employee count       | 11                            |
| Post matched advanced employee count              | 11                            |
| Post unmatched advanced employee count            | 0                             |
| Redacted conclusion                               | `guarded_alignment_committed` |

The inserted row was a local `organization_training_version` only. It used generated identifiers, copied metadata from
an existing same-profession/same-level published version, and set `publish_scope_snapshot.organizationPublicIds` to the
target current organization. No account, user, employee, authorization, schema, migration, source, test, `.env*`,
Provider, Cost, staging/prod, payment, or external service change was executed.

## Validation Results

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md`:
  passed.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md`:
  passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-advanced-employee-published-assignment-local-alignment-2026-06-25`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-advanced-employee-published-assignment-local-alignment-2026-06-25 -SkipRemoteAheadCheck`:
  passed.

## Closeout Result

Pending commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup. Final SHA and push result
will be reported in the assistant handoff.

No Standard/Advanced MVP final Pass is claimed.
