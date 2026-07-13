# Content Admin Platform Program Init Adversarial Audit

Date: 2026-07-13

Task: `content-admin-platform-program-init-2026-07-13`

Verdict: `PASS — Program Init closed; B0 may remain claimed without implying implementation start`

Subagents were not used because repository instructions prohibit them without explicit approval. Both reviews are performed serially against the full diff and executed gates.

## Round 1 — State Machine, Authorization And Bypass

Attack surface:

- skip an earlier task or activate a later task;
- claim the successor before the predecessor commit/merge/push/cleanup checkpoint;
- write an unsupported status or keep state/queue/currentTask pointers inconsistent;
- materialize a task without the standing authorization or with false/wrong closeout targets;
- mark deployment automatically approved;
- start X1/X2 while their trigger is false;
- close the Program early or leave its guard blocking unrelated work forever.

Findings fixed during review:

1. Required AI and advanced-authorization reading was initially unconditional. It is now selected by explicit task `requiredReadingProfiles`, while base instructions/requirements remain mandatory for every task.
2. The first guard draft compared only Program pointers. It now also verifies the baseline SHA, top-level `currentTask`, active task record, complete state/queue status maps, condition blocks and serial-plan task inventory.
3. Closeout policy initially proved only that section names existed. It now requires `approved: true`, `master`, `origin/master` and branch cleanup values under the correct sections.
4. Checkpoints now accept only `pending|pass`, enforce monotonic order, require all predecessor checkpoints before advancement and require every checkpoint when a task is closed.
5. A closed Program would otherwise keep applying the last task allowlist to unrelated future work. The guard now becomes a read-only pass-through only after every ordered task is closed/recorded and deployment remains blocked.

Result: pass. The smoke suite supplies one positive and eight adversarial negative proofs; no Critical or Important residual finding remains.

## Round 2 — Recovery, Scope Drift And Historical Protection

Attack surface:

- recover from state/queue without chat context;
- omit required reading, target source/test review or the second adversarial review;
- change a file outside the active task allowlist;
- silently reorder tasks or insert a conditional task;
- treat PIC acceptance as implementation completion;
- use UI consistency to reopen A01-A30, merge AI/formal/organization/learner domains, weaken phone/`redeem_code` redaction, or overwrite edition-aware authorization;
- introduce product code, dependency, DB, Provider, browser, environment or deployment scope through a governance task.

Verified results:

- Repository-only recovery identifies the 32 ordered tasks, current/next pointers, two conditional tasks, authorization source, deployment block, PIC ledger and guard path.
- The serial plan defines task content, acceptance, cumulative audits, stop conditions, B -> D -> C -> E -> F order and X1/X2 triggers. State and queue carry the same IDs and statuses.
- PIC statuses start as `accepted_baseline` or `partial`; Program Init does not claim a route is compliant.
- The changed-file inventory contains only the 13 approved governance/hook/script files. There is no product source/test, dependency, schema, fixture, environment or private path.
- A01-A30, Provider-disabled behavior, historical `paperAssembly` recovery, phone masking/reveal, plaintext `redeem_code` product exception, `effectiveEdition` derivation and organization-training ownership remain explicit protection rows.
- Full unit (363 files/2036 tests), lint, typecheck, full format, webpack build (90 pages), PowerShell parse, guard smoke and whitespace checks pass.

Result: pass. No sensitive value or product-function change was found; no Critical or Important residual finding remains.

## Round 3 — Physical Cleanup And Claimed-successor Handoff

Attack surface:

- record branch/worktree cleanup before it physically occurs;
- advance B0 before Program Init commit, ff-only merge or remote synchronization;
- let the Program Guard pass but have the existing Module Run v2 pre-push gate reject the same legal state transition;
- treat `claimed` as proof that B0 required reading or implementation has started.

Finding and repair:

- The original Program Init branch/worktree was removed only after `master == origin/master == 621b83ce459392b123e6ee5f301d0315c4a067c3` was verified.
- A real RED proved the Module Run v2 pre-push gate still evaluated B0's claimed status and rejected the predecessor SHA checkpoints. The repair lets a claimed task name one explicit predecessor closeout scope; it does not relax ordinary claimed-task SHA checks.
- The first claim-transition pre-commit gate also rejected a missing `blockedFiles` contract. B0 now materializes the full product/private/runtime blocklist before the transition commit.
- Program Init is now `closed` with all five checkpoints `pass`; B0 is only `claimed`, has five pending checkpoints, and explicitly says its required reading and implementation have not started.

Result: pass. The Program pointer cannot advance unless the predecessor is closed, recorded in `completedTaskIds`, and has all closeout checkpoints complete.

## Round 4 — Handoff Bypass And Cross-program Contamination

Attack surface:

- add a claim-transition marker to an unrelated task and inherit a permissive predecessor state;
- point the marker at an arbitrary historical closed task;
- preserve a stale current/last-closed pointer mismatch;
- use handoff mechanics to authorize deployment, product code, DB, Provider, browser or dependency changes.

Verified results:

- The pre-push gate honors the marker only when the claimed task equals the Program `currentTaskId`, the scope equals `lastClosedTaskId`, and the scoped queue task is actually `closed`; otherwise it hard-blocks.
- Program Guard independently verifies sequential order, completed-task membership, all predecessor checkpoints, one active task, allowed files and deployment blocking.
- The handoff diff remains governance-only. B0's product/runtime/test/DB/Provider/browser/dependency/schema/deploy capabilities are blocked until its required reading, precise plan and task-specific scope are materialized.
- X1/X2 remain untriggered, and the bounded-concurrency 363-file/2036-test pass leaves no reproducible current-master product defect.

Result: pass. No Critical or Important residual finding remains after the post-cleanup handoff reviews.

## Taste Compliance Checklist

- [x] No product runtime, API envelope, database naming, dependency, schema or environment behavior changed.
- [x] No parallel or large framework abstraction was introduced; the guard is a bounded PowerShell script using existing repository patterns.
- [x] State, queue, plan, evidence, audit and hook behavior share one explicit Program vocabulary.
- [x] AI, authorization, edition, organization, phone, `redeem_code` and content-lifecycle boundaries remain fail-closed.
- [x] Deployment is not implied by ordinary push and remains a fresh-approval gate.
- [x] RED/GREEN evidence, full gates and two serial adversarial reviews precede the closeout verdict.
