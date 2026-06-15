# advanced-admin-ai-audit-log-public-identifier-redaction-affordance

## Task

Narrow TDD UI-only implementation to hide or collapse visible public identifier text by default in the admin AI audit log
summary, after the readonly policy recheck identified visible actor identifier metadata.

## Approval

User approved execution on 2026-06-15 after the recommended next task was presented.

## Required Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-admin-ai-generation-public-identifier-display-policy-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-admin-ai-generation-public-identifier-display-policy-recheck.md`

## Scope

Allowed implementation files:

- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx`

Allowed governance files:

- project state, task queue, this task plan, evidence, and audit review.

## TDD Plan

1. RED: add focused failing tests proving visible admin audit log summary text no longer includes actor/target/row public
   identifier values, while retaining metadata-only/redacted/summary-only semantics.
2. Verify RED with the scoped unit test command.
3. GREEN: minimally adjust the admin audit log row presentation so identifiers are collapsed as policy labels rather than
   visible values. Preserve route/DTO identifiers and DOM metadata where needed.
4. Verify GREEN with the scoped unit test command.
5. Run diff check, lint, typecheck, and Module Run v2 closeout gates.

## Blocked Gates

- No `.env*` read/write/output.
- No DB access or direct row/private data access.
- No provider/model call.
- No quota/cost or Cost Calibration Gate execution.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No schema/drizzle/scripts/package/lockfile/dependency change.
- No route/service/repository/API contract change.
- No formal adoption target write.
- No public identifier value list, raw prompt, raw answer, provider payload, secret, token, cookie, Authorization header,
  DB URL, row data, or private data exposure in evidence.
- No PR and no force push.

## Risk Controls

- Evidence will describe field names and behavior, not actual public identifier values.
- UI text will use existing token-driven styles and existing component structure.
- Browser/Playwright rendered validation remains blocked; component unit tests are the validation surface for this task.
