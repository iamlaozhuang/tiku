# P0 RC-04 Adversarial Review

Date: 2026-07-15

Task: `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`

Status: `in_progress`

## Round 1 — Root Cause / Diff / Transaction / Security

status: pending

- verify authoritative write path, revision CAS and status predicate are inside transaction;
- verify command replay cannot duplicate paper/question/publish side effects or cross actor/payload;
- verify group/material and scoring point identities cannot be forged across paper;
- verify rich text preservation does not weaken existing rendering sanitization;
- verify migration source does not derive public IDs from internal auto-increment IDs and is not applied.

## Round 2 — Cross-role / Snapshot / API / Regression

status: pending

- verify content_admin create/edit/compose/publish/copy/archive and four learner roles consume one immutable snapshot;
- verify illegal scoring states, stale writes, missing points, concurrent start/archive and response-loss retries fail closed;
- verify public IDs、camelCase、standard envelope、`null`/`[]` and no internal ID/answer leakage;
- verify P1/P2 remain impact mapping only and RC-05+ are untouched;
- verify source/audit repositories and fresh-master inventory remain clean outside allowlist.
