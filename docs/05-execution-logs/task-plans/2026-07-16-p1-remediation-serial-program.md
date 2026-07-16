# P1 Remediation Serial Program

Date: 2026-07-16

Program ID: `p1-remediation-2026-07-16`

Baseline SHA: `4cd2792f57d4eea3ac2770598b5490ebcfdead51`

Frozen P0 product static baseline: `e136ca28acde82282a17c65ccfb828a01e872c0b`

Authorization: `docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`

## Program Contract

The Program preserves the closed startup package and its 143-item ledger as historical evidence. It performs just-in-time second-level review and, only where confirmed, P1 remediation. WIP is one dynamically materialized execution task. A candidate cluster is a dependency-ordered review route, not an executable task and not permission to combine findings.

Each materialized task must record its finding IDs, current authority path, business invariant, adversarial failure mode, exact allowed/blocked files, RED proof, focused and blast-radius commands, P0 guard, two distinct review rounds, redacted evidence, closeout policy, and recovery checkpoint. No successor task may start until the prior task's commit, master merge, origin synchronization, worktree cleanup, and short-branch cleanup all pass.

## Canonical Candidate Order

| Order | Candidate                                     | Dependency purpose                                                                     |
| ----- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| 01    | `P1-RC-01`                                    | Identity, registration, credential and session authority                               |
| 02    | `P1-RC-02`                                    | Organization boundary and employee lifecycle                                           |
| 03    | `P1-RC-03`                                    | Authorization scope and edition boundary                                               |
| 04    | `P1-RC-04`                                    | API contract, identifier and error semantics                                           |
| 05    | `P1-RC-05`                                    | Content and paper aggregate integrity                                                  |
| 06    | `P1-RC-06`                                    | Knowledge resource, ingestion and retrieval integrity                                  |
| 07    | `P1-RC-07`                                    | AI configuration, execution and provenance                                             |
| 08    | `P1-RC-08`                                    | Learner answer, scoring and report integrity                                           |
| 09    | `P1-RC-09`                                    | Organization training and statistics integrity                                         |
| 10    | `P1-GLOBAL-STATIC-REGRESSION-BASELINE-FREEZE` | Reconcile all P1 conclusions, recalibrate P2 impact, and freeze the P1 static baseline |

## Dynamic Materialization State Machine

1. Select the next dependency-ready pending P1 finding from the canonical ledger.
2. Review requirements, original evidence, current source, tests, analogous paths, P0 evidence, consumers, and persistence boundaries.
3. Produce a per-finding verdict: `confirmed`, `not_reproduced`, `false_positive`, or `needs_review`, while preserving project evidence/disposition/execution dimensions.
4. If confirmed findings share one current authority path and one independently testable root cause, propose the narrowest atomic task. Otherwise materialize separate tasks.
5. Record exact scope and gates in state/queue/task plan before product code changes.
6. Establish RED, implement the smallest fix, run focused plus blast-radius regression and the P0 guard, then complete Round 1 and independent Round 2 reviews.
7. Write redacted evidence, commit one task, fast-forward `master`, validate on fresh `master`, push `origin/master`, verify synchronization, and clean isolation resources.
8. Mark all five closeout checkpoints pass before materializing the successor.

Closeout facts that occur after a task commit—master merge, origin synchronization, worktree cleanup, and branch cleanup—are recorded by the next governance-only Program transition commit. That transition may close the prior task and materialize exactly one successor, but it may not contain product implementation. A remediation task's product/test change remains one focused commit, while Program-control transitions remain separate auditable commits. The P1 guard rejects a commit that changes state/queue scope and implementation paths together.

The transition commit is the only point at which the `currentTaskId` and successor scope may change. It requires the predecessor's five closeout checkpoints and final two-round evidence, a synchronized `HEAD == origin/master` parent, prior short-branch cleanup, JIT review, and an `APPROVE_SCOPE` decision. The successor enters `executionStage: scope_frozen`; its state/queue projection is immutable until the next task transition. The implementation commit must therefore consume the scope already frozen in its parent and must update both evidence and audit with final implementation reviews. A two-step allowlist expansion for the same task is rejected even when the expansion and implementation are placed in separate commits.

Final task evidence retains the JIT-revalidation and scope-freeze sections in addition to implementation Round 1, independent Round 2, and validation results. Product, test, configuration, or other non-governance changes are treated as implementation changes regardless of directory; they require both evidence and audit to change in the same commit. Staged/worktree divergence on a staged path is rejected to prevent the hook from reviewing content different from the index.

## Frozen Exclusions

- P2 implementation, runtime/browser acceptance, and all 21 runtime backlog items.
- F-0013 static closure or runtime-state change.
- Real Provider/database/vector/object-store/external-service operations.
- Dependency/package/lockfile changes without fresh approval.
- PR, force push, `--force-with-lease`, and deployment.
- Any modification under `D:/tiku-readonly-audit`.

## Initial Review Boundary

The first current-code review set is F-0001, F-0003, F-0129, and F-0131. They remain four independent findings because their alleged authority boundaries differ: cross-domain identity uniqueness, logout completion, registration unit-of-work, and concurrent single-session issuance. The bootstrap does not claim a verdict or remediation for any of them.

## Recovery Inputs

- Project projection: `docs/04-agent-system/state/project-state.yaml`
- Queue projection: `docs/04-agent-system/state/task-queue.yaml`
- Canonical finding ledger: `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml`
- Post-P0 map: `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml`
- Candidate clusters: `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml`
- Runtime backlog: `D:/tiku-readonly-audit/runtime/runtime-validation-backlog.yaml`
- Program guard: `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`

## Program Completion

Completion requires every one of the 125 P1 finding IDs to have an evidence-backed final static disposition, no open materialized task, all task closeout checkpoints passed, global static regression passed from a fresh `master`, all 18 P2 impact mappings recalibrated without P2 implementation, the 21 runtime items still correctly bounded, F-0013 still on its runtime hold unless separately authorized evidence exists, and a frozen P1 static baseline artifact committed, pushed, and recoverable.
