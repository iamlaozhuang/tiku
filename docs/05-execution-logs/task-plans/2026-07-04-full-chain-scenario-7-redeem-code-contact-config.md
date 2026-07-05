# 2026-07-04 Full-Chain Scenario 7 Redeem Code And Contact Config

Status: blocked

## Task

- Task id: `full-chain-scenario-7-redeem-code-contact-config-2026-07-04`
- Branch: `codex/full-chain-scenario-7-redeem-code-contact-config-2026-07-04`
- Goal node: Scenario 7, `ops_admin` creates one standard activation, one advanced activation, and one edition-upgrade `redeem_code`; verify `contact_config` readiness before ordinary-user contact validation.
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector: `fc_ops_admin_created_by_super_admin`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-01-09-contact-config-runtime.md`
- `docs/05-execution-logs/evidence/2026-07-02-redeem-code-edition-plaintext-decision-doc-update.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-redeem-code-edition-plaintext-decision-doc-update.md`
- `src/app/api/v1/redeem-codes/route.ts`
- `src/app/api/v1/redeem-codes/[publicId]/route.ts`
- `src/app/api/v1/contact-configs/route.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `src/server/validators/redeem-code.ts`
- `src/server/services/redeem-code-route.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/server/services/contact-config-service.ts`
- `src/server/contracts/contact-config-contract.ts`
- `src/server/contracts/redeem-code-reference-contract.ts`
- `src/db/schema/auth.ts`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/contact-config/AdminContactConfigPage.tsx`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

Private files are allowed only for selector lookup and private card handoff; their values must never be copied into repo files or chat.

## Boundaries

- Allowed repo files: state, queue, this plan, evidence, and audit only.
- Allowed private output: `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/redeem-code/full-chain/redeem-code-selector-pack-2026-07-04.json`.
- Product runtime mutations: only Scenario 7 `redeem_code` creation through supported product runtime.
- Contact config scope: verify active `contact_config` readiness and ops surface access; do not require persisted DB contact mutation.
- Browser rule: before any product write, run a minimal hydrated/interactable login smoke and verify React-observed input state enables submit.
- DB rule: selector-scoped read-only aggregate verification only; no raw rows, internal ids, destructive operations, schema, migration, or seed.
- Evidence rule: record only task id, branch, surface labels, selector labels, role labels, aggregate counts, command labels, pass/fail/block, and redacted summaries.

## Stop Rules

Stop and split repair/provisioning if any of these occur:

- Login readiness fails, DB target mismatches, private selector input is unavailable, or account-domain conflict appears.
- `redeem_code_type` cannot be explicitly selected or submitted.
- Product runtime cannot create exactly one `personal_standard_activation`, one `personal_advanced_activation`, and one `edition_upgrade` card.
- Plaintext card values cannot be captured only into the approved private file, or any evidence redaction risk appears.
- `content_admin`, org admins, learners, or unauthenticated users can access global card creation or plaintext card surfaces.
- Source repair, schema/migration/seed, dependency change, Provider, staging/prod, Cost Calibration, destructive DB, release readiness, final Pass, or production usability claim is needed.

## Runtime Steps

1. Verify branch, target DB label, private selector presence, and no pre-existing S7 repo artifacts.
2. Start local app with redacted runtime environment.
3. Run minimal browser login smoke with hydrated/interactable readiness before private credential fill.
4. Use `ops_admin` product runtime to verify contact-config readiness and create the three single card types.
5. Store plaintext card values only in the approved private selector pack; record only selector labels and counts in repo evidence.
6. Verify negative permissions for non-ops card/contact management surfaces without recording raw DOM, screenshots, traces, storage, headers, or secrets.
7. Run selector-scoped aggregate DB verification by type/status count only.
8. Stop runtime, update evidence/audit/state/queue, then enter closeout freeze.

## Block Outcome

Runtime stopped at step 4 before any `redeem_code` product mutation. `/ops/redeem-codes` reached the card management surface, but the current empty-state branch returns before `RedeemCodeActionPanel`, so the explicit `redeem_code_type` generation controls are not reachable when the card list is empty. Direct API generation is rejected as an acceptance bypass.

Next split task: `full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair-2026-07-04`.

## Closeout Gates

- `npm.cmd run test:unit -- tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-7-redeem-code-contact-config-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-7-redeem-code-contact-config-2026-07-04 -SkipRemoteAheadCheck`
