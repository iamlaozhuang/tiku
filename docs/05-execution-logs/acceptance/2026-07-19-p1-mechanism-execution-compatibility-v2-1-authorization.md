# P1 Mechanism Execution Compatibility v2.1 Authorization

Status: approved

Task ID: `p1-mechanism-execution-compatibility-v2-1-2026-07-19`

Parent task: `p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`

Base: `61303d935e58e65103563fcb0fa865d7bfb6cf3e`

Branch: `codex/p1-mechanism-execution-compatibility-v2-1`

Human approval source: current user message approving the complete P1 mechanism execution compatibility charter v2.1 and the subsequent current user message approving a one-time, non-finding-specific P1 mechanism-task bootstrap transition.

Bootstrap transition: atomically close F-0143 and materialize exactly one `mechanism_hardening` successor with `findingIds: []` and `productClosureContribution: none`.

Ordinary in-progress SHA drift: hard-block.

Hook bypass: prohibited.

Quality gate reduction: prohibited.

Future transition authorization: the candidate contract cannot authorize itself; `approved_same_task_transition` must resolve authorization or standing authorization from the base SHA task record or base SHA task-level closeout policy.

## Approved Scope

- One strict versioned `approved_same_task_transition` contract and formal schema.
- One shared PowerShell 5.1-safe parser/validator/normalized decision layer.
- Thin P1, Module pre-commit and Module pre-push adapters.
- Corresponding focused/full smoke, strict machine evidence, validation profiles, freshness keys, minimal SOP/index/manual changes, state/queue bootstrap and task evidence/audit.
- One implementation Subagent and one independent final reviewer; fixes return to the same implementer.
- Task-scoped local commit, ff-only merge to `master`, ordinary push to `origin/master`, and cleanup under the existing P1 standing closeout authorization.

## Exact Files

1. `docs/04-agent-system/operating-manual.md`
2. `docs/04-agent-system/sop/p1-approved-same-task-transition.md`
3. `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
4. `docs/04-agent-system/state/p1-approved-same-task-transition-schema-v1.yaml`
5. `docs/04-agent-system/state/project-state.yaml`
6. `docs/04-agent-system/state/task-queue.yaml`
7. `docs/05-execution-logs/acceptance/2026-07-19-p1-mechanism-execution-compatibility-v2-1-authorization.md`
8. `docs/05-execution-logs/task-plans/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md`
9. `docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md`
10. `docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md`
11. `scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1`
12. `scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1`
13. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
14. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
15. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
16. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
17. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
18. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Prohibited Scope

No `.husky/**`, product source/test, dependency/lockfile, schema/migration, database, Provider, runtime/browser, P2, PR, force push, deploy, secret/env, Cost Calibration Gate, historical hardcode migration or ordinary drift exception is authorized.

## Narrow manual-stage contract recognition correction (2026-07-20)

Approval state: approved

The current user approved one narrow manual-stage correction: recognize the already-materialized, findingless mechanism-bootstrap contract after its `ready_for_closeout` state-only transition and add the corresponding smoke coverage. This approval does not change pre-commit or pre-push routing, ordinary in-progress SHA-drift hard-blocks, transition topology, authorization, evidence or ancestor policy. It grants no hook bypass, scope expansion, product closure, database/schema/dependency/Provider/runtime/P2/PR/force-push/deploy permission.

## One-time pre-commit scope-correction channel (2026-07-20)

Approval state: approved

The current user approved one one-time, exact-allowlist pre-commit scope-correction channel for the same already-materialized findingless mechanism contract. The channel is limited to the exact current branch `codex/p1-mechanism-bootstrap-manual-recognition`, parent/HEAD `d0b71842657f8f4df7e72d5fa6514b94d20b2de4`, origin/master equality, clean index/worktree, and these eight `M` paths only: this authorization record, the mechanism task plan/evidence/audit records, the P1 guard/smoke, and the Module pre-commit guard/smoke. It does not authorize state/queue edits, pre-push changes, ordinary SHA drift, transition topology changes, ancestor permission, hook bypass, approval/evidence weakening, product closure, schema/migration/database/dependency/Provider/runtime/P2/PR/force-push/deploy work.

## C3 Resumed Focused Budget Authorization

The user freshly approved the same `mechanism_hardening` task to resume at C3 with a new 90-minute focused budget window beginning at `2026-07-19T08:03:58.1040109-07:00` and ending at `2026-07-19T09:33:58.1040109-07:00`.

C0-C2 evidence, the exact 18-file freeze, all Safety Invariants and every permission boundary above remain unchanged. This approval grants time only; it does not authorize a new branch, a new task, a hook bypass, ordinary SHA drift, expanded files, product closure, product/source/schema/database/Provider/runtime/P2/PR/force-push/deploy work or weaker validation.

## C6 Additional 120-Minute Budget Authorization

At `2026-07-19T12:01:43.3166301-07:00`, the user freshly approved another 120-minute budget window for this same `mechanism_hardening` task, ending at `2026-07-19T14:01:43.3166301-07:00`.

This authorization grants time only for the current C6 compatibility correction, fresh focused validation, serial full validation and review. All prior evidence, the exact 18-file freeze, WIP=1, Safety Invariants and permission boundaries remain unchanged. It does not authorize a new task or branch, hook bypass, ordinary SHA drift, scope expansion, product closure, or any prohibited action listed above.

## C6 Recovery 120-Minute Budget Authorization

At `2026-07-19T16:10:05.7682473-07:00`, the user freshly approved a new 120-minute recovery window for this same `mechanism_hardening` task, ending at `2026-07-19T18:10:05.7682473-07:00`.

This authorization grants time only to preserve and record the fourth P1 full RED, verify its existing fixture-only correction, recompute the frozen candidate identity/freshness key, complete the serial C6 validation matrix and review, and—only after every C6 gate passes—continue the already approved C7 closeout. C0-C5 evidence, all earlier C6 results, the exact 18-file freeze, WIP=1, production review `PENDING`, Safety Invariants and every permission boundary remain unchanged. It does not authorize a new task or branch, hook bypass, ordinary SHA drift, scope expansion, product closure, weakened validation, or any prohibited action listed above.

## C6 Post-Blocked 120-Minute Budget Authorization

At `2026-07-19T18:16:12.9670681-07:00`, the user freshly approved a new 120-minute recovery window for this same `mechanism_hardening` task, ending at `2026-07-19T20:16:12.9670681-07:00`.

This authorization resumes the blocked Goal at the exact C6 `main_review_pass_full_pending` entry and grants time only for the first serial P1 full, the remaining serial C6 matrix, the independent final review, and—only after all C6 gates pass—the already approved C7 closeout. C0-C5 evidence, all six retained full REDs, the fresh unborn focused/static evidence, exact 18-file freeze, WIP=1, production review `PENDING`, Safety Invariants and every permission boundary remain unchanged. It does not authorize a new task or branch, hook bypass, ordinary SHA drift, scope expansion, product closure, weakened validation, or any prohibited action listed above.
