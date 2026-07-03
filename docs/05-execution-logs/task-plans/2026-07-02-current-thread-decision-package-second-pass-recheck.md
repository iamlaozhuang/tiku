# 2026-07-02 Current Thread Decision Package Second-Pass Recheck

## Task

Perform a second docs-only adversarial recheck after the owner explicitly warned that the previous recheck could still
contain omissions, errors, or underspecified details.

This task may correct requirement documentation, traceability rows, and governance evidence only. It does not approve
product source changes, tests, schema, migration, database access, Provider execution, env/secret access,
browser/runtime validation, staging/prod deployment, payment, release readiness, final Pass, production usability, or
Cost Calibration.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`

## Recheck Method

1. Search stable requirement modules, stories, older traceability, and the new ledger for stale wording.
2. Compare role boundaries against the latest current-thread rows instead of relying on older role-separated wording.
3. Treat broad "organization admin" phrases as suspect when the current decision distinguishes `org_standard_admin` and
   `org_advanced_admin`.
4. Record every confirmed omission, ambiguity, or contradiction either as a new ledger row or, when it is a residual
   wording instance of an already-recorded decision, as a decision-package gap/correction tied to that existing row.
5. Avoid changing product semantics beyond already confirmed current-thread decisions.

## Risk Controls

- No product source edits.
- No raw Prompt text, Provider payload, credentials, env values, raw DB rows, plaintext `redeem_code`, raw employee
  answers, or full question/paper/material content in evidence.
- Older traceability wording is corrected by adding supersession context, not by claiming runtime acceptance.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown ...`
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
- `git diff --check`
- Ledger table row count and duplicate check.
