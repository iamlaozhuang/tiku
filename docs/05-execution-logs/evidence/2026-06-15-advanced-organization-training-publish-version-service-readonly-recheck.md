# Evidence: advanced-organization-training-publish-version-service-readonly-recheck

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-service-readonly-recheck`
- Batch range: single user-approved readonly recheck after `advanced-organization-training-publish-version-service`.
- Branch: `codex/advanced-organization-training-publish-version-service-readonly-recheck`
- Baseline: `master == origin/master == b94c254efe40640825f015ed7bf2a37a8fee3248` before branch creation.
- Commit: `b94c254efe40640825f015ed7bf2a37a8fee3248` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit `批准执行`.
- localFullLoopGate: scoped unit test set, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch and durable state.
- nextModuleRunCandidate: docs-only queue seeding for a narrow authorization lineage coverage repair, or user review before downstream publish repository planning.
- Cost Calibration Gate remains blocked.
- result: pass_with_needs_recheck

## Readiness

Executed before branch creation or confirmed at branch start:

```powershell
git switch master
git fetch --prune origin
git status --porcelain=v1
git branch --show-current
git rev-parse HEAD
git rev-parse master
git rev-parse origin/master
git branch --list "codex/*"
git for-each-ref refs/remotes/origin/codex --format='%(refname:short)'
```

Result:

- Worktree was clean.
- `HEAD == master == origin/master == b94c254efe40640825f015ed7bf2a37a8fee3248`.
- No local or remote `codex/*` branches were present before this short branch was created.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-service.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Readonly Recheck Findings

- Publish-version service remains a service-layer boundary. No route, repository, mapper, schema, API runtime, UI, package, lockfile, dependency, provider, or DB surface is implemented by this recheck.
- `publishVersion` consumes the existing local `OrganizationTrainingPublishInput` shape and composes an `organization_training_version` metadata write through the injected store boundary.
- Published version metadata records `status: "published"`, `publishedAt`, `takenDownAt: null`, `takedownReason: null`, and an organization scope snapshot copied at publish time.
- Formal target writes remain blocked: no formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` write path is created or invoked.
- ADR-002 layering remains intact: business logic is in service; route/API and repository work remain absent and future-scoped.
- Existing tests cover publish success, immutable copied scope snapshot, blocked capability/scope states, and non-leakage of formal target/provider/raw field names.

## RED / GREEN

RED: not applicable for this readonly recheck. No failing implementation test was introduced because product source
changes were blocked.

GREEN: readonly recheck passed after scoped unit tests and local quality gates confirmed the existing publish-version
service/test/contract/validator surfaces remain consistent with the documented boundary, subject to the recorded
authorization lineage needs_recheck.

## needs_recheck

- `authorizationPublicId` is normalized by the publish input validator, but the current service published-version write and DTO do not carry an authorization lineage field. This is not a blocker for the readonly recheck because no persistence contract was implemented here, but repository/schema/route planning must decide whether published versions need explicit authorization lineage and add scoped coverage before persistence work.
- Future repository/schema work must recheck that scope snapshots, owner/quota owner metadata, version numbering, and persistence mapping do not expose row/private data or formal target identifiers.
- Future route/UI/employee answer/takedown/copy/analytics behavior remains unimplemented and must not be inferred from this service-layer result.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
```

Result: PASS on 2026-06-15.

- Vitest reported `Test Files 3 passed (3)`.
- Vitest reported `Tests 20 passed (20)`.
- Exit code: 0.

```powershell
git diff --check
```

Result: PASS on 2026-06-15. No whitespace errors were reported.

- Exit code: 0.

```powershell
npm.cmd run lint
```

Result: PASS on 2026-06-15.

- `eslint` completed without reported errors.
- Exit code: 0.

```powershell
npm.cmd run typecheck
```

Result: PASS on 2026-06-15.

- `tsc --noEmit` completed without reported errors.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: PASS on 2026-06-15.

- Reported current branch:
  `codex/advanced-organization-training-publish-version-service-readonly-recheck`.
- Reported changed tracked files were limited to the two state files before evidence/audit/task plan creation.
- Reported the three untracked execution-log files for this readonly recheck.
- Reported no commits ahead of `origin/master`.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-service-readonly-recheck
```

Result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 5`.
- Scope scan reported `OK_SCOPE` for the two state files, task plan, evidence, and audit review.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-service-readonly-recheck
```

Result: PASS on 2026-06-15 after evidence anchor repair.

- Initial run failed on evidence-only anchors: missing exact Cost Calibration Gate statement, RED/GREEN anchors, and
  non-pending batch commit evidence.
- Repaired evidence only; no product source or blocked surface changed.
- Final run reported `moduleCloseoutMode: hard_block`.
- Evidence and audit paths were accepted.
- Module Run v2 strict evidence anchors passed.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-service-readonly-recheck
```

Result: PASS on 2026-06-15 after local closeout commit.

- `prePushMode: hard_block`.
- Git readiness passed for the short branch.
- `master`, `origin/master`, state master, and state origin master were aligned at
  `b94c254efe40640825f015ed7bf2a37a8fee3248`.
- Evidence and audit paths were accepted.
- Exit code: 0.

## Decision

pass_readonly_recheck_with_authorization_lineage_needs_recheck

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No source implementation changes.
- No route, repository, mapper, API runtime, contract, model, validator, or UI changes.
- No takedown, copy-to-new-draft, employee answer, analytics, quota/cost, or formal content write behavior.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
