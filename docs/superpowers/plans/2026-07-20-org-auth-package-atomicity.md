# Organization Authorization Package Atomicity Plan

> Main-thread execution only. No subagent or independent reviewer is authorized.

## Goal

Close `F-0007` without changing entitlement semantics: one confirmed multi-scope `org_auth` package must commit every
normalized atomic `profession + level + edition + organization scope` row and one redacted package audit, or commit
nothing.

## Authority And Boundary

- SSOT: advanced module 06, role/auth decision package, `CT-REQ-008`, `CT-REQ-022`, and ADR-007.
- Existing active-overlap, active-organization, specified-node, quota, edition, employee inheritance, and public-ID rules
  remain authoritative.
- The package command may only preserve or tighten existing behavior. It adds no role, permission, scope, edition,
  quota, default capability, or authorization entry.
- No schema/migration, real database execution, persistent test write, dependency, Provider, external call, UI change,
  secret/env, deployment, PR, force-push, or safety-kernel change.
- Bounded approval: `standing-bounded-medium-risk-closeout-approval-2026-07-20`.

## Root Cause And Adversarial Failure

The route currently validates and calls `createOrgAuth` once per atomic scope. Each call owns a separate transaction;
the success audit is appended only after the loop. If a later atom or audit fails, earlier authorizations remain committed
although the client receives an overall failure. The fix must make rollback ownership explicit in one repository command,
not add compensation or another orchestration layer.

Attack cases:

- second atom rejects after the first would have inserted;
- audit insertion fails after all atoms would have inserted;
- purchaser or specified target becomes inactive between route parsing and repository execution;
- overlap or quota changes under concurrency;
- duplicate atoms or a retry cannot silently create a partial second package;
- repository adapters that do not implement the atomic command fail closed;
- audit metadata contains no secret, internal ID, session token, or full organization payload.

## Frozen Files

The exact allowlist is `docs/04-agent-system/state/task-safety.json`. Product scope is limited to the organization auth
result contract, route/repository command, one focused characterization test, the existing operations loop test, and two
existing repository-invariant regression tests. The user approved adding those two regression tests after their brittle
method-body extraction failed to follow the shared atomic helper; no product scope was added.

## TDD And Implementation

1. Add RED proving the route calls exactly one package command, does not loop `createOrgAuth`, and does not append a
   second success audit.
2. Add RED proving the production repository owns one transaction containing all atomic revalidation/writes and the
   package-level redacted audit, with rejection throwing through the transaction rather than returning after partial writes.
3. Implement the smallest package command by reusing existing locks, scope resolution, overlap, quota, mapping, and audit
   helpers. Retain the single-atom method only as a compatibility surface; the production route must not use it.
4. Return a package public ID plus every created atom in the existing API envelope. A replay is allowed to fail with the
   existing explicit overlap conflict; it must never duplicate or partially create a package.

## Verification

- Focused and affected regression commands are frozen in `task-safety.json`.
- Then run lint, typecheck, build, exact-file Prettier check, `git diff --check`, P0 global baseline, and P0 serial baseline,
  serially.
- Before freeze, run the formatter, ensure no test/build processes remain, stage the exact candidate, verify zero
  unstaged/untracked files, and complete one main-thread adversarial diff review.
- The standing approval may be used for candidate-bound kernel validation and one ordinary canonical push only if the
  final diff has no entitlement expansion, schema/migration, real database execution, or extra file.

## Metrics

- approvalRequests: `1`; reason: the initial allowlist omitted two affected static regression tests that required a
  helper-aware assertion update.
- approvalIdMismatch: `0`.
- postApprovalCandidateTreeChanges: `0`.
- repeatedBlockerReports: `2`; the automatic Goal continuation repeated the same allowlist blocker before the user
  approved it.
- validationRetryCount: `1`; an auxiliary state parser referenced an unavailable direct `yaml` module, made no file
  change, and was replaced by the repository's Prettier YAML parse plus native JSON parse.
- fullRuns: `1`.

## Verification Evidence

- RED: focused profile produced the expected four failures of seven before the repository package command existed.
- GREEN: focused `7/7`; affected regression `27/27`; exact lint and typecheck passed.
- Full: production build passed with 96 static pages; P0 global baseline passed with 35 findings, 143 impacts, 21
  runtime-pending items, eight root-cause clusters, and zero dependency cycles; P0 serial returned
  `pass_closed_program`.
- Main-thread adversarial review: the production route delegates exactly once; the repository revalidates every atom
  under the existing global lock and one transaction; empty or rejected atoms throw through that transaction; the
  redacted package audit is awaited before success; unexpected errors propagate; no role, entitlement, quota, schema,
  migration, real database, dependency, Provider, external, or safety-kernel boundary changed.
