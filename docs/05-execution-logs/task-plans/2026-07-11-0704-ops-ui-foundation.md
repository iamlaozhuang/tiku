# 0704 Ops UI Foundation Plan

## Metadata

- taskId: `0704-ops-ui-foundation-2026-07-11`
- branch: `codex/0704-ops-ui-foundation`
- approval: current user approved serial execution with commit, merge, push, and cleanup on 2026-07-11
- scope: first task in the approved operations-admin UI optimization sequence
- conclusion boundary: localhost UI source/test foundation only

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- latest local UI, owner-preview Provider gate, preview risk, role overview, and user-management evidence/audit logs
- private design-board contact sheets and page-specific screenshots under `D:\tiku-local-private\acceptance\`

## Source Baseline

- Existing reusable query contract: `src/server/contracts/admin-interaction-contract.ts`
- Existing reusable hook: `src/hooks/useAdminListInteraction.ts`
- Existing admin layout primitive: `src/components/admin/admin-layout-primitives.ts`
- Current behavior surfaces:
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
  - `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
  - `src/features/admin/contact-config/AdminContactConfigPage.tsx`
- Current tests:
  - `tests/unit/admin-shell-common-interaction.test.ts`
  - `tests/unit/admin-layout-primitives-ui.test.ts`
  - `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
  - `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`

## Implementation Scope

1. Strengthen shared admin-list primitives for toolbar, table, pagination, and list-state surfaces.
2. Add focused unit checks proving these primitives are available and keep the shared list contract stable.
3. Add behavior-freeze assertions for the approved operations surfaces where useful, especially:
   - organization tree uses four user-facing levels: `省`、`地市`、`县区`、`站点`;
   - enterprise authorization creation/cancel requests keep the existing endpoint and payload semantics;
   - employee import still rejects authorization-scope fields and does not change parsing rules;
   - redeem-code generation and redacted detail behavior stay unchanged;
   - audit and AI call log data remains redacted and Provider payload/raw prompt/raw output is absent.
4. Record redacted evidence and an adversarial audit.

## Explicit Non-Scope

- No business logic changes for organization updates, enterprise authorization, employee import, redeem-code generation, or log services.
- No QR upload contract in this task.
- No page split, route split, or menu rename in this task.
- No database schema, migration, seed, or direct DB execution.
- No Provider-enabled behavior.
- No staging, production, deployment, env/secret, or Cost Calibration work.
- No package or lockfile changes.
- No screenshots or raw DOM in repo evidence.

## Risk Controls

- Treat UI visibility as separate from authorization; server-side role and scope checks remain authoritative.
- Keep `effectiveEdition`, organization authorization, redeem-code plaintext eligibility, and employee/admin isolation unchanged.
- Maintain redaction: no credentials, sessions, cookies, tokens, DB URLs, env values, raw DB rows, raw prompt, raw AI output, Provider payload, plaintext redeem code, full content, or internal numeric identifiers in evidence.
- Do not replace existing operations forms with new behavior in this foundation task.
- Use existing tokens and class naming patterns; avoid new dependencies.

## Validation Plan

1. Red check for new shared primitive expectations.
2. Green targeted tests:
   - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-layout-primitives-ui.test.ts tests/unit/admin-shell-common-interaction.test.ts`
   - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
3. `corepack pnpm@10.26.1 run lint`
4. `corepack pnpm@10.26.1 run typecheck`
5. `git diff --check`
6. Module Run v2 pre-commit hardening.
7. Module Run v2 pre-push readiness after merge checkpoint.

## Acceptance Criteria

- Shared list primitives expose a consistent basis for filters, table rows, pagination, and list states.
- Existing organization, authorization, employee import, redeem code, audit log, and AI call log behavior remains frozen by targeted tests.
- User-facing organization tree levels are documented and tested as `省`、`地市`、`县区`、`站点`.
- No new dependency, schema, API, Provider, env, deploy, or business-write behavior is introduced.
- Evidence and audit are redacted and only claim localhost UI foundation completion.
