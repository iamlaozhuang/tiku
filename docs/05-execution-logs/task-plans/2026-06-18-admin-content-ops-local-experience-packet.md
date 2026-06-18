# 2026-06-18 Admin Content Ops Local Experience Packet

## Scope

Goal: advance the bounded local experience packet below to local experience closure only:

- `UC-STD-ADMIN-OPS-LOGS`
- `UC-STD-ORG-AUTH-MANAGED`
- `UC-STD-QUESTION-MATERIAL-MANAGE`
- `UC-STD-PAPER-LIFECYCLE`
- `UC-ADV-RETENTION-LOG-GOVERNANCE`

Local experience closure means `status: experience_closed` in
`docs/04-agent-system/state/local-experience-coverage-matrix.yaml` with fresh redacted evidence, audit review, task queue
sync, and project-state sync. It does not imply release readiness.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- Existing directly related evidence, audit, and task-plan records where present.
- Existing allowed e2e specs:
  - `e2e/admin-audit-navigation.spec.ts`
  - `e2e/local-business-flow.spec.ts`
  - `e2e/content-action-closures.spec.ts`
  - `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- Directly related admin ops logs, organization auth, question/material, paper lifecycle, and retention/log governance
  source and focused unit tests.
- During RED investigation, `e2e/admin-audit-navigation.spec.ts` showed the contact_config runtime page loading an error
  state. The directly related route service and focused unit test are included for the minimal repair.

## Local State Baseline

- Branch: `codex/admin-content-ops-local-experience-packet`
- Base `master` / `origin/master` / `HEAD`: `fddef3417a628f5118741c1fd3b6865a7e871f0a`
- Existing matrix states:
  - `UC-STD-ADMIN-OPS-LOGS`: `local_experience_ready`
  - `UC-STD-ORG-AUTH-MANAGED`: `partial`
  - `UC-STD-QUESTION-MATERIAL-MANAGE`: `partial`
  - `UC-STD-PAPER-LIFECYCLE`: `partial`
  - `UC-ADV-RETENTION-LOG-GOVERNANCE`: `partial`
- Existing `standard-admin-ops-logs-local-full-flow-validation` queue entry is closed, but its referenced evidence and
  audit files are missing locally, so this packet will rerun fresh validation rather than relying on that stale record.

## Execution Strategy

1. Seed one bounded, user-approved local packet task in `task-queue.yaml` and point `project-state.yaml` at it.
2. Run focused unit tests covering the five use cases.
3. Run e2e list discovery once.
4. Run only the four pre-approved existing local e2e specs.
5. If validation fails, repair only the smallest directly related source or focused unit test surface allowed by the user.
6. Write redacted evidence and audit review.
7. Mark the five matrix rows `experience_closed` only if validation and audit pass.
8. Run scoped prettier, `git diff --check`, lint, typecheck, and Module Run v2 closeout gates.
9. Commit locally, fast-forward merge into `master`, rerun required master gates, push `origin/master`, and delete the merged
   short branch only if all closure and repository gates pass.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts "src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx" tests/unit/phase-11-system-ops-organization-management-loop.test.ts tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts tests/unit/admin-question-material-ui.test.ts src/server/services/question-service.test.ts src/server/services/material-service.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts src/server/services/paper-service.test.ts src/server/services/paper-draft-service.test.ts src/server/services/paper-asset-service.test.ts tests/unit/paper-draft-repository-composition-guard.test.ts tests/unit/paper-draft-repository-archive-termination.test.ts src/server/services/ops-governance-log-retention-redaction-contracts-service.test.ts tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/admin-audit-navigation.spec.ts e2e/local-business-flow.spec.ts e2e/content-action-closures.spec.ts e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-admin-content-ops-local-experience-packet.md docs/05-execution-logs/evidence/2026-06-18-admin-content-ops-local-experience-packet.md docs/05-execution-logs/audits-reviews/2026-06-18-admin-content-ops-local-experience-packet.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-content-ops-local-experience-packet`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId admin-content-ops-local-experience-packet`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-content-ops-local-experience-packet`

## Boundaries

- Do not edit `.env*`.
- Do not edit `package.json` or lockfiles.
- Do not edit schema, drizzle, or migration files.
- Do not edit or add e2e specs.
- Do not perform provider/model calls or configuration changes.
- Do not use staging/prod/cloud/deploy/payment/external-service scope.
- Do not create PRs.
- Do not force-push.
- Do not run destructive database operations.
- Do not run Cost Calibration Gate.
- Do not expose paper content, student answers, plaintext card codes, provider payloads, or environment values in evidence.

## Risk Controls

- Evidence will summarize command outcomes and browser coverage without copying sensitive payloads.
- Any runtime-created card code stays inside local test execution and is not recorded in logs.
- Matrix `experience_closed` updates will retain release/high-risk blocked-gate wording.
- If any use case hits a hard-forbidden boundary, record blocked evidence and continue only independent in-scope use cases.
