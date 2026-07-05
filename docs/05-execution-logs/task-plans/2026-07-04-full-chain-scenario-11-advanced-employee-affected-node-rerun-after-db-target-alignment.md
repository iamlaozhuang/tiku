# 2026-07-04 Full-Chain Scenario 11 Advanced Employee Affected-Node Rerun After DB Target Alignment Plan

Status: blocked

## Task

- Task id: `full-chain-scenario-11-advanced-employee-affected-node-rerun-after-db-target-alignment-2026-07-04`
- Branch: `codex/full-chain-scenario-11-advanced-employee-affected-node-rerun-after-db-target-alignment-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_advanced_employee`
- Imported employee batch selector label: `fc_org_advanced_employee_batch`
- Content scope label: `marketing:3`
- Scenario selector label: `fc_scenario_11_advanced_employee_affected_node_rerun_after_db_target_alignment`
- Role label: `org_advanced_employee`
- Restart node: `s11_browser_login_advanced_employee_learning_and_enterprise_training_boundary`

## Read Gate

Read before task materialization:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-enterprise-training-baseline-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-db-target-alignment-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-db-target-alignment-provisioning.md`
- relevant learner login, practice, organization training, AI training source and tests listed in state/queue.
- private account and advanced employee selector inputs in memory only.

## Minimum Pre-Browser Checklist

Before local app/browser runtime:

| Item                   | Required result                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| selector               | advanced employee selector and imported batch selector exist by label/count only                |
| account                | advanced employee login input available in memory only                                          |
| authorization          | active advanced `marketing:3` organization authorization exists                                 |
| content baseline       | published `marketing:3` paper/question aggregate exists                                         |
| training baseline      | assigned published `marketing:3` enterprise training aggregate exists                           |
| DB target              | process-scoped DB target override matches `tiku_full_chain_acceptance_20260704_001`             |
| forbidden repeat items | employee import, S10 learning data, S1-S10 runtime, and old authorization flow are not repeated |

If any item is missing, stop and split a smaller provisioning/repair task. Do not enter runtime.

## Execution Plan

1. Align branch, state, queue, plan, evidence, and audit before runtime.
2. Run the minimum pre-browser checklist with process-scoped DB target override.
3. Start local app on loopback using the process-scoped DB target override only after preflight passes.
4. Run browser login readiness smoke and wait for hydrated/interactable login inputs before private credential fill.
5. Log in as the advanced employee using private values only in memory.
6. Observe learner home entries for `AI训练` and `企业训练`.
7. Exercise advanced employee practice learning only if no Provider/source/test/schema/fake-data expansion is needed.
8. Exercise assigned `企业训练` through product UI, recording only surface labels and aggregate counts.
9. Observe `AI训练` surface without clicking `AI出题` or `AI组卷` submit actions.
10. Run selector-scoped aggregate DB verification and Provider/AI-call no-submit boundary checks.
11. Stop runtime, update evidence/audit/state/queue, run closeout gates, commit, fast-forward merge, push, delete branch,
    then continue to the next approved node or split repair/provisioning on block.

## Closeout Status Alignment

- Result: blocked before browser/runtime.
- Stop point: minimum pre-browser checklist.
- Blocker label: `missing_assigned_published_enterprise_training_baseline`.
- Runtime/browser: not started.
- Product DB write: not executed.
- Direct DB write: not executed.
- Next task: split a dedicated provisioning task for the S11 enterprise training baseline, then rerun S11 only from the
  affected browser login / advanced employee learning / enterprise training boundary.

## Stop Rules

Stop and split repair/provisioning on login failure, DB target mismatch, missing private selector input, missing advanced
employee selector, missing active advanced `org_auth`, missing matching `marketing:3` published content, missing assigned
published enterprise training baseline, permission bypass, redaction risk, product source/test repair need,
schema/migration/seed need, Provider/staging/prod/Cost need, destructive DB operation, employee import repeat
requirement, S10 learning repeat requirement, or release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, route/surface label, selector label, role label, scope label, aggregate counts, command name,
pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization
header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete
material/question/paper/resource/chunk content, private fixture contents, employee answers, and plaintext card values.
