# F-0143 employee personal AI context authorization

Status: approved

## Approval

- Date: 2026-07-18
- Task: `p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`
- Finding: `F-0143`
- User decision: `批准 F-0143 方案 A`
- Human approval: the current user explicitly approved F-0143 design option A.
- Approved design: the server-revalidated selected `authorizationPublicId` determines authorization source, owner, organization, and quota owner across generation, request history, result history, and result detail.

## Authorized scope

- Materialize the F-0143 task, written design, task plan, evidence, and adversarial audit.
- After written-spec approval, change only the product and test files listed in the active task allowlist.
- Preserve explicit personal and organization contexts for an employee; do not infer ownership from `userType` when a valid selected authorization exists.
- Add static regression coverage for an employee using a personal result to create a learning session.

## Boundaries

- This approval does not authorize schema, migration, dependency, database execution, external Provider calls, browser/runtime acceptance, P2 implementation, PR creation, force push, or deployment.
- F-0142 authorization expiry, cancellation, downgrade, and continuation policy remains outside this task.
- Product implementation remains blocked until the written design is reviewed and approved.

## Closeout authorization

The existing P1 standing authorization permits a task-scoped local commit, ff-only merge into `master`, ordinary push to `origin/master`, and cleanup after all declared guards pass. It does not broaden any blocked capability above.
