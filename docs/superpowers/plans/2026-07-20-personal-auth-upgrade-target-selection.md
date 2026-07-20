# Personal Auth Upgrade Target Selection Implementation Plan

> **For agentic workers:** This plan is executed inline by the main thread. Subagents are prohibited for this task.

**Goal:** Close F-0004 without repeating F-0132 by preserving explicit selection for multiple eligible standard `personal_auth` records, allowing omission only for one eligible target, and recording the successful target in a redacted transactional `audit_log`.

**Architecture:** Keep the existing preview/confirm boundary and `previewVersion` revalidation. Normalize an omitted confirmation target to `null`; inside the already-authoritative database transaction, resolve `null` only when the recomputed candidate set has exactly one entry. After the conditional card consume and `auth_upgrade` insert succeed, append the audit row in the same transaction with public identifiers only.

**Tech Stack:** TypeScript, Drizzle ORM, Vitest, ESLint, PowerShell minimal safety kernel.

## Global Constraints

- WIP=1; one reviewable commit; main-thread adversarial review only.
- No schema, migration, dependency, database execution, deployment, secret/env, Provider, PR, force-push, external-service, or kernel/guard/smoke changes.
- Multiple candidates always require an explicit `targetPersonalAuthPublicId`; an omitted target may resolve only when the transaction sees exactly one eligible candidate.
- Invalid, missing-multiple, stale, expired, used, already-advanced, or scope-mismatched confirmation must not consume the card, create `auth_upgrade`, or append a success audit row.
- Audit metadata must not contain plaintext redeem codes, hashes, numeric ids, phone numbers, or raw database rows.
- F-0140 cross-code concurrent upgrade and RV-0021 real PostgreSQL interleaving remain out of scope.
- Closeout is covered by `standing-bounded-medium-risk-closeout-approval-2026-07-20` only while every bounded-medium-risk prerequisite remains true.

---

### Task 1: Encode the F-0004 boundary as RED

**Files:**

- Create: `tests/unit/p1-personal-auth-upgrade-target-selection.test.ts`
- Modify: `src/server/validators/redeem-code.test.ts`
- Modify: `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`

**Interfaces:**

- Consumes: `normalizeRedeemCodeConfirmationInput(input)` and `createPostgresStudentAuthorizationRedeemRuntimeRepositories(options)`.
- Proves: omitted target normalizes to `null`; one candidate is resolved; multiple candidates without a target fail before mutation; explicit eligible selection succeeds; success writes one redacted audit row in the same transaction.

- [x] Add a validator test whose confirmation body omits `targetPersonalAuthPublicId` and expects a normalized `null`.
- [x] Add a transaction-backed repository harness with queued select results and recorded update/insert values.
- [x] Keep the existing phase-8 JIT repository harness aligned with the locked active-user row shape.
- [x] Add the single-candidate omission test and assert the selected `personal_auth` public id appears in the audit target while the card plaintext/hash/numeric ids do not.
- [x] Add multiple-candidate omission and invalid-explicit-target tests asserting `invalid_target` and zero update/insert side effects.
- [x] Run `corepack.cmd pnpm@10.15.1 exec vitest run src/server/validators/redeem-code.test.ts tests/unit/p1-personal-auth-upgrade-target-selection.test.ts`; observe the expected omission and audit failures.

### Task 2: Implement the narrow transactional fix

**Files:**

- Modify: `src/server/validators/redeem-code.ts`
- Modify: `src/server/repositories/student-authorization-redeem-runtime-repository.ts`

**Interfaces:**

- Produces: confirmation input always carries `targetPersonalAuthPublicId: string | null` after normalization.
- Produces: transaction target resolution equivalent to `explicitTarget ?? (eligibleTargets.length === 1 ? eligibleTargets[0] : undefined)`; multiple candidates never auto-resolve.
- Produces: a success-only `audit_log` row with actor public id, role derived from the current user type, action `personal_auth.upgrade_by_redeem_code`, resource `personal_auth`, selected target public id, and redacted metadata.

- [x] Treat an absent `targetPersonalAuthPublicId` property as `null`; continue rejecting non-null malformed values.
- [x] Reuse the transaction-recomputed `preview.data.upgradeTargets` to resolve one omitted candidate, then locate the matching locked standard row.
- [x] Preserve `invalid_target` for omitted-multiple and wrong explicit targets before `consumeUnusedRedeemCodeForUser`.
- [x] Capture the inserted upgrade public id and append the redacted success audit row after the upgrade insert, using the same transaction.
- [x] Run the focused command and observe 7/7 passing.

### Task 3: Verify and freeze the candidate

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/task-safety.json`

- [x] Run both validation commands from `task-safety.json`, then `git diff --check` and `corepack.cmd pnpm@10.15.1 exec prettier --check` on the exact changed files.
- [x] Adversarially retrace omitted-one, omitted-many, forged-target, stale-preview, non-upgrade-target, failure-before-consume, audit atomicity, redaction, and F-0140 non-expansion paths.
- [x] Stage only the exact allowlist, bind the standing approval token to the staged tree, and run `Test-MinimalSafetyKernel.ps1 -Phase pre_commit`.
- [ ] If every bounded-medium-risk prerequisite still holds: create one commit, ff-only merge to `master`, push only canonical `origin/master` with one-use `TIKU_PUSH_APPROVED=1`, verify clean sync, and remove the short branch; otherwise stop for a precise fresh approval.

## Self-Review

- Spec coverage: F-0004 explicit multi-target selection, unique omission compatibility, safe error/no-consume, public-id audit, and current preview/UI behavior are covered.
- Placeholder scan: no deferred implementation placeholders remain.
- Type consistency: the external field remains `targetPersonalAuthPublicId`; repository and audit use `personal_auth` public ids, never numeric ids.
