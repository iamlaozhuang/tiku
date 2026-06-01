# Phase 22 Existing Seed Bootstrap Capability Assessment Evidence

## Summary

- Result: pass with insufficient capability for complete fresh DB acceptance.
- Scope: read_only.
- Changed surfaces: evidence, task plan, queue/state only.
- Gates: seed/bootstrap capability scan pass; prior evidence reconciliation pass; git inventory pass.
- Forbidden scope (`forbiddenScope`): no `.env.local` values, env edits, dependency changes, script/source/test/e2e/schema/drizzle changes, DB reset, raw SQL, destructive data, staging/prod/cloud/deploy, real provider, or external service.
- Residual gaps (`residualGaps`): current seed/bootstrap plus e2e is not yet a durable, deterministic fresh DB acceptance mechanism without approved validation data preparation.

## Commands

### Seed/bootstrap capability scan

Command:

```text
rg -n "seed|bootstrap|create.*test|ensure.*test|upsert|idempotent|test data|fixture" scripts src e2e tests docs -g "!*.env*" -g "!node_modules/**"
```

Result: pass.

Sanitized findings:

- Existing local/dev seed command exists under `scripts/db/Seed-DevDatabase.ps1`.
- Existing seed implementation is idempotent-looking for the rows it owns.
- Role-based e2e contains runtime `created_test_only` paths for selected data, including per-run students, `org_auth` readiness, content readiness, and redeem-code redemption.
- Prior fresh local/dev migration evidence showed first full e2e failed after migration-only and passed only after approved seed/bootstrap plus approved local API validation-data preparation.

### Prior evidence reconciliation

Reviewed prior redacted evidence:

- `docs/05-execution-logs/evidence/2026-06-01-ai-scoring-retry-fresh-local-dev-migration-verification.md`
- `docs/05-execution-logs/evidence/2026-06-01-fresh-local-dev-db-validation-flow-docs.md`
- `docs/05-execution-logs/evidence/2026-06-01-phase-22-fresh-db-readiness-assessment.md`

Result: pass.

Relevant redacted conclusion:

- Reviewed migrations succeeded on a fresh local/dev DB in the prior approved task.
- Existing dev seed unblocked baseline login and content data.
- The first seeded DB still lacked deterministic `mistake_book` and `ai_call_log` prerequisites until approved validation data preparation ran through local/dev APIs.

### Git inventory

Command:

```text
git status --short --branch
```

Result: pass.

Sanitized output:

```text
branch: codex/phase-22-fresh-db-seed-bootstrap-readiness
changed: project-state, task-queue, task plans, evidence
forbidden files: not changed
```

## Capability Assessment

Existing mechanism capability:

- Migration path: already proven in prior evidence through reviewed Drizzle migration, not rerun in this task.
- Seed/bootstrap: existing script can seed a partial local/dev baseline.
- Runtime e2e data creation: current e2e can create some data during tests and can pass on the current prepared local/dev target.
- Validation data preparation: prior fresh DB success required an approved local/API preparation step, but that step is not currently represented as a durable repository script or task-owned mechanism.

Insufficient areas for a fresh empty DB acceptance declaration:

- No current approved one-command bootstrap that prepares all required baseline and validation data.
- No current durable mechanism that explicitly produces `mistake_book` and `ai_call_log` prerequisites before full e2e.
- Full e2e determinism may depend on order and previous runtime data when the target starts from a freshly migrated DB.
- Formalizing this would require modifying seed/script/e2e/source/schema or adding a new approved validation-data prep mechanism, which is outside this batch.

## Decision

The existing mechanisms are enough to support continued local validation on a prepared dev DB and enough to identify the required data, but they are not enough to claim future complete fresh DB local acceptance from an empty migrated DB without a follow-up implementation gate.

## Stop-The-Line Assessment

No stop-the-line blocker for the diagnosis child task because current work can continue with existing e2e reruns. Implementation remains blocked and must be proposed separately.

## Evidence Hygiene

This evidence intentionally omits `.env.local` values, DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, raw SQL output, plaintext `redeem_code`, full papers, full textbooks, OCR full text, and customer/customer-like private data.
