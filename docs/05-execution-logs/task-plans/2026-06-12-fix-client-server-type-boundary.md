# fix-client-server-type-boundary Task Plan

## Task

- Task id: `fix-client-server-type-boundary`
- Branch: `codex/fix-client-server-type-boundary`
- Task kind: `implementation`
- Date: 2026-06-12
- Source: health audit follow-up queue

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-005
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`

## Scope

Allowed files:

- `src/lib/**`
- `src/server/contracts/contact-config-contract.ts`
- `src/server/services/contact-config-service.ts`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- Relevant focused unit tests listed in the task queue
- This task plan, evidence, and audit review

Blocked work:

- No dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, e2e, PR, force-push, or Cost Calibration Gate work.

## Approach

- Move `LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG` to a client-safe `src/lib` module.
- Keep DTO types in `src/server/contracts/contact-config-contract.ts`; use type-only import from the shared module.
- Update student/admin client pages and server contact config service to import the fallback from `src/lib`.
- Replace garbled fallback Chinese text with readable Chinese.
- Update focused tests only where visible fallback text changes.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `git diff --check`

## Stop Conditions

- Stop if the repair requires API shape changes or dependency/schema/env/provider work.
- Stop if client pages still import runtime values from `@/server/contracts/contact-config-contract`.
