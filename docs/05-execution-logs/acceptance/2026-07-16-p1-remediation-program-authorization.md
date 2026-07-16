# P1 Remediation Program Standing Authorization

Date: 2026-07-16

Status: approved

Authorization source: current user request in the Codex conversation on 2026-07-16.

Program ID: `p1-remediation-2026-07-16`

## Approved Goal

Starting from the frozen P0 current-code baseline, process all 125 P1 findings in root-cause dependency order with just-in-time second-level adversarial revalidation, remediation where confirmed, local automated verification, two distinct review rounds, evidence, one focused commit per task, `--ff-only` integration into `master`, ordinary push to `origin/master`, and isolated worktree/branch cleanup. WIP is exactly one execution task. After all P1 findings are concluded, run global static regression, recalibrate the P2 impact map, and freeze the P1 static baseline.

This document records human approval for that bounded Goal and its ordinary closeout operations. It does not create authority outside the bounds below.

## Standing Task-Level Closeout Approval

- Local focused commit: approved after all declared gates pass.
- Fast-forward integration: approved only into local `master` with `git merge --ff-only`.
- Push: approved only as ordinary push to `origin/master` after fresh-master gates pass.
- Cleanup: approved only after remote synchronization is verified; remove the completed short branch and its worktree.
- One task maps to one independently reviewable commit unless evidence explicitly proves that no code change is required.

## Mandatory Execution Boundary

- P1 WIP is one. Only a materialized task with an exact finding set, invariant, authority path, allowlist, test commands, and rollback/stop conditions may enter `in_progress`.
- All 125 finding identities remain independent audit items. Candidate clusters route review; they do not merge, downgrade, close, or deduplicate findings.
- Every candidate receives current-code second-level review before any fix. Static evidence that cannot settle a claim results in `needs_review` or the project-equivalent evidence hold, not an inferred pass/fail.
- F-0013 remains `runtime_evidence_required` plus `runtime_hold` in this Goal.
- P2 is impact-mapping only until the P1 static baseline is frozen. No P2 implementation is approved.
- The 21 runtime validations remain pending and approval-required. No browser or runtime acceptance is approved.
- No real Provider, database, vector store, object store, external service, production/staging environment, or user data operation is approved.
- No dependency/package/lockfile change is approved. A later schema/migration source change requires a separately materialized task whose current-code review proves necessity; migration execution, backfill, seed, and real database mutation remain blocked.
- PR creation/update, force push, `--force-with-lease`, and deployment require fresh user approval and are not authorized here.
- `D:/tiku-readonly-audit` is immutable.

## Subagent Boundary

The user approved at most the main Agent plus three Subagents under the recorded safety gate. Analysis Subagents are read-only and may not edit, stage, commit, merge, push, mutate state/evidence, run prohibited runtime operations, or touch the audit repository. The main Agent is the single writer by default. A coding Subagent requires a separate worktree, exact allowlist and invariants, no overlap with another writer, main-Agent diff review, and full local verification before integration.

## Revocation And Stop Conditions

Stop and request fresh approval on unexplained baseline/remote/audit drift, a requirement conflict that changes intended behavior, need for a blocked capability, inability to isolate one root cause, or inability to produce redacted evidence. No historical artifact may be rewritten to fabricate approval.
