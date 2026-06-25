# Learner Org Employee Home Entry Capability Discovery Repair Evidence

Task id: learner-org-employee-home-entry-capability-discovery-repair-2026-06-25

Branch: codex/home-entry-visibility-repair-20260625

Status: closed

## Approval Boundary

- Current user approved proceeding with the recommended next source repair on 2026-06-25.
- Approved scope: low-risk source repair and focused unit tests, followed by local commit, fast-forward merge to `master`, push to `origin/master`, and merged branch cleanup.
- Not approved: browser runtime rerun, credential reads, DB/seed/schema/migration, `.env*`, Provider/Cost/staging/prod/payment/external-service work, dependency/package/lockfile changes, PR, force push, or final MVP Pass claim.

## Requirement Mapping Result

Maps to R5/R6 in `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`, `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`, and `docs/01-requirements/advanced-edition/modules/04-organization-training.md`. This task repairs effective authorization capability discoverability for learner home entries only. It does not execute browser validation and does not close full eight-row runtime acceptance.

## Changed Files

- `src/server/services/effective-authorization-service.ts`
- `src/server/services/effective-authorization-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`

## TDD Evidence

- RED: `npm.cmd run test:unit -- src/server/services/effective-authorization-service.test.ts` failed with 2 expected failures. Personal advanced and org advanced contexts still returned false capability flags while the new assertions expected discoverable AI and organization training capability.
- GREEN: `npm.cmd run test:unit -- src/server/services/effective-authorization-service.test.ts` passed after changing capability mapping and updating the older org advanced capability expectation.
- Consumer check: `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts` passed, confirming existing learner home UI behavior still shows entries when the effective authorization payload exposes the expected capabilities.

Implementation summary:

- Personal advanced contexts now expose `canGenerateAiQuestion` and `canGenerateAiPaper` based on `effectiveEdition`.
- Organization advanced contexts now expose learner AI capabilities plus organization training capabilities based on `effectiveEdition`.
- Standard contexts still return disabled capabilities.
- `production_enablement_blocked` remains present when Provider production enablement is not configured; this task did not enable or call Provider.

## Validation Results

- `npm.cmd run test:unit -- src/server/services/effective-authorization-service.test.ts`: passed, 6 tests.
- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts`: passed, 13 tests.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npx.cmd prettier --write --ignore-unknown ...`: passed, unchanged.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-home-entry-capability-discovery-repair-2026-06-25`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-home-entry-capability-discovery-repair-2026-06-25 -SkipRemoteAheadCheck`: passed.

## Closeout Readiness

- Task is approved for local commit, fast-forward merge to `master`, push to `origin/master`, and merged branch cleanup.
- Closeout status at file handoff: local validation complete; final SHA, push, and branch cleanup results are recorded in the assistant handoff per post-closeout SHA rule.
- Browser post-repair runtime evidence was not executed in this task.

## Blocked Remainder

- Browser post-repair runtime rerun remains blocked without a separate approval task.
- Standard organization employee direct `/organization-training` route denial remains outside this repair.
- Full eight-row role-separated runtime acceptance remains blocked.
- No Standard/Advanced MVP final Pass is claimed.
