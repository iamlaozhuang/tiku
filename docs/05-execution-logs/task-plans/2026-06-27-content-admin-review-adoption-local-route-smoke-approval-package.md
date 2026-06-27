# Content Admin Review Adoption Local Route Smoke Approval Package Plan

Task id: `content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27`

Branch: `codex/content-admin-route-smoke-approval-20260627`

moduleRunVersion: 2

## Objective

Prepare a docs/state-only Layer 2 approval package for the next capped local route/service smoke of the content-admin
generated-result review adoption loop.

This task defines the future execution boundary only. It must not run browser, dev-server, e2e, DB connection or
read/write, real mutation, credential reads, Provider calls, Cost Calibration, formal publish, student-visible runtime,
staging/prod/deploy/payment/external service, OCR/export, archive/index movement, PR, force push, release readiness, or
final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`

## Requirement Decision Map

| Requirement source              | Decision used by this task                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Content-admin AI scope decision | Generated results stay isolated until governed review, validation, attribution, and audit.                                      |
| Advanced AI scope clarification | Content-admin AI output must not directly create formal `question` or `paper`; adoption is a governed two-step flow.            |
| Role-separated MVP alignment    | Content-admin entries lead to draft/review, not direct formal writes.                                                           |
| Command-contract TDD evidence   | `approved` and `rejected` review decisions are source/test-covered, but runtime DB mutation remains blocked.                    |
| Layer 2 rollup refresh          | The smallest next step is a docs-only route-smoke approval package, followed by a separately approved capped runtime execution. |

## Requirement Mapping

The approval package will preserve these boundaries:

- Layer 1 remains a no-regression guard only.
- Layer 2 becomes ready for a future capped local route/service smoke approval request, but runtime remains blocked.
- Layer 3 Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, and external-service gates remain
  blocked.
- Formal publish and student-visible runtime remain outside the future route-smoke package unless separately approved.

## Evidence-Only Sources

The package may cite previous evidence and acceptance ledgers, but it must not infer runtime proof from source/test or
docs-only evidence. It will record no DB rows, raw generated output, credentials, tokens, Authorization headers,
Provider payloads, screenshots, traces, page text dumps, localStorage/cookie values, or plaintext `redeem_code`.

## Conflict Check

- The user fresh-approved docs/state-only preparation for this task.
- The user explicitly did not approve browser/dev-server/e2e, DB access, credentials, Provider, Cost Calibration, real
  mutation, formal publish, student-visible runtime, staging/prod/deploy/payment/external service, OCR/export,
  archive/index movement, PR, force push, release readiness, or final Pass.
- The user's independent-branch instruction allows task-local branch, commit, ff-only merge, push, and cleanup after
  scoped gates pass.
- No source/test/schema/package/lockfile/script change is allowed.

## Documentation Approach

1. Create this task plan before state/docs edits.
2. Create an acceptance approval package that defines the future execution task, test data boundary, mutation cap,
   DB read/write boundary, rollback/archive strategy, redaction rules, and copyable approval text.
3. Create evidence and audit review documents for this docs/state-only package.
4. Update `project-state.yaml` and `task-queue.yaml` to record this task as closed after validation while keeping the
   future route-smoke execution blocked.
5. Run scoped formatting and Module Run v2 gates, then commit and perform approved closeout.

## Future Approval Package Contents

The acceptance package will define:

- Future execution task id: `content-admin-review-adoption-local-route-smoke-execution-2026-06-27`.
- Test data: one existing local dev generated-result review record or one separately approved synthetic/local fixture;
  no production data, no raw generated output in evidence.
- Mutation cap: exactly one content-admin review decision, either `approved` or `rejected`, for one generated result and
  one reviewer.
- DB boundary: local dev DB only, read/write limited to the route/service smoke's required metadata. No schema,
  migration, seed, destructive operation, staging/prod/cloud DB, or row dump.
- Rollback/archive: future execution must identify a test-owned target and an app-level cleanup/archive/reversal path
  before mutation. If cleanup cannot be bounded, execution must stop before DB write.
- Redaction: evidence records only command names, role label, decision kind, pass/fail, counts, and masked/public-id
  summaries.
- Stop conditions: missing test data, unclear route/service surface, rollback ambiguity, secret/env need, Provider need,
  multiple mutations, publish/student visibility, or non-local target.

## Validation Commands

```text
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27 -SkipRemoteAheadCheck
```

## Stop Conditions

Stop without execution if any step requires:

- reading `.env*`, credentials, tokens, cookies, localStorage, or private secret stores;
- browser, dev-server, e2e, DB connection, seed, migration, rollback, or mutation execution;
- Provider call/configuration, Cost Calibration, staging/prod/deploy/payment/external service, OCR/export;
- source/test/package/lockfile/schema/script/archive/index edits;
- PR, force push, release readiness, or final Pass.
