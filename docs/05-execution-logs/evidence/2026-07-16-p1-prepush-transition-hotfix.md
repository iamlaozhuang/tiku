# P1 Transition Pre-Push Hotfix Evidence

Date: 2026-07-16

Task ID: `p1-prepush-transition-ancestor-gate-hotfix-2026-07-16`

Status: complete

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

The current hook, P1 guard transition/closeout paths, Module Run pre-push SHA policy, their smoke fixtures, bootstrap evidence, AGENTS, Code Taste Ten Commandments, and ADR-001 through ADR-007 were reviewed.

## Requirement Mapping Result

- P1 remains the sole authority for classifying a successor range as governance-only transition scope.
- Module Run remains the authority for repository readiness and accepts the ancestor checkpoint only when the P1 mode and independent Git/state invariants agree.
- All other active-task SHA drift remains hard-blocked.

## Root-Cause Reproduction

Result: pass

- Full-range ordinary push was rejected because it combined task transition and product implementation.
- Transition-only P1 pre-push returned `p1ProgramGuardResult: pass`.
- The same transition-only Module Run pre-push failed only with `HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master`.

## TDD Evidence

Result: pass

- P1 RED: ordinary pre-push lacked `p1TransitionScopeMode: standard`.
- Module pre-push RED: `P1TransitionScopeMode` was not a recognized parameter.
- Hook-order RED: the hook did not capture stdin and run P1 before Module Run.
- Module pre-commit RED: the exact independently approved hotfix set was rejected with `HARD_BLOCK_OUT_OF_SCOPE` for nine paths.
- Git-environment RED: the existing cross-repository smoke exposed that PowerShell 7 materialized cleared `GIT_*` variables as empty strings, causing `fatal: not a git repository: ''`; the smoke's own unset restoration similarly left an empty `GIT_INDEX_FILE`.
- Dotfile-alias RED: both P1 and Module path normalization stripped the leading dot, so `governance-hook` could match `.governance-hook`; the new negative fixture unexpectedly passed before normalization was corrected.
- GREEN: P1 smoke passes `8 positive, 48 negative`; Module pre-push smoke passes; Module pre-commit smoke passes its exact-set positive case plus alias, invalid-approval, and extra `src/out-of-scope.ts` negatives.

## Implemented Invariants

- The hook captures stdin once, waits for a successful P1 result, and forwards only P1's exact `transition_only` output.
- P1 emits `transition_only` only for a pre-push task transition with no non-governance change; ordinary and same-task closeout paths emit `standard`.
- Module Run additionally requires `in_progress`, `master`, `HEAD == master`, both recorded SHAs equal actual `origin/master`, strict ancestry, and a clean existing pre-push context.
- Without the mode, the same topology still fails `HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master`; invalid transition context fails `HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID`.
- The one-time pre-commit bridge requires the exact 14-file set, approved branch/base/bootstrap projection, and an approval artifact absent from the parent commit. No state/queue self-expansion is used.
- Git repository-local environment variables are removed through the environment provider and restored in `finally`, avoiding empty-string repository overrides on PowerShell 5.1/7.
- Path normalization removes only an explicit `./` prefix and leading separators; leading dots in `.husky` and `.env` identities remain significant.

## Validation Results

Result: pass

| Validation                                          | Result | Evidence                                                                         |
| --------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| P1 Program smoke, Windows PowerShell 5.1            | pass   | `8 positive, 48 negative`; includes transition modes and dotfile-alias rejection |
| Module Run pre-push smoke, Windows PowerShell 5.1   | pass   | standard path hard-blocked; proof path accepted; invalid context blocked         |
| Module Run pre-commit smoke, Windows PowerShell 5.1 | pass   | exact bridge accepted; alias, invalid approval, and extra product path blocked   |
| Content Admin recovery smoke                        | pass   | `6 positive, 28 negative`                                                        |
| P1/P2 startup package                               | pass   | 125 P1, 18 P2, 21 runtime; origin/live `4806ba0...`                              |
| P0 global and serial guards                         | pass   | 35 P0, 143 impacts, 21 runtime; closed Program valid                             |
| P1 manual guard                                     | pass   | Program/state/audit integrity; `standard` mode                                   |
| One-time Module pre-commit gate                     | pass   | `filesToScan: 14`; `approved_one_time`; every path `OK_SCOPE`                    |
| Bootstrap Module closeout                           | pass   | evidence/audit, validation commands, cost/thread/next-run anchors                |
| Hook syntax                                         | pass   | Git for Windows `sh -n .husky/pre-push`                                          |
| Scoped Prettier                                     | pass   | all seven Markdown artifacts use project style                                   |
| Whitespace                                          | pass   | `git diff --check`                                                               |
| Product/dependency/schema diff                      | pass   | no path under `src`, `tests`, `e2e`, packages, schema, drizzle, or migrations    |
| Audit repository                                    | pass   | HEAD `a84224fa12ec85b28e6acd945deba2afa28c6c02`, clean, `git fsck --no-dangling` |

The disposable sparse-checkout smoke emits expected Git line-ending conversion warnings while creating CRLF/LF fixtures; the guard exits 0, project Prettier passes, and `git diff --check` is clean.

taskCommit: `finalized_by_commit_containing_this_evidence`

Remote push evidence is emitted by the real verified pre-push hook and recorded in the task delivery after `origin/master` synchronization; no bypass is permitted.

Cost Calibration Gate remains blocked.

threadRolloverGate: `continue_current_thread`.

nextModuleRunCandidate: resume `p1-remediation-rc-01-server-session-logout-2026-07-16` closeout after this hotfix is remotely synchronized.
