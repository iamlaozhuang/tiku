# Admin AI generation provider-enabled route runtime bridge fake Provider TDD

Task id: `admin-ai-generation-provider-enabled-route-runtime-bridge-fake-provider-tdd-2026-06-26`

## Boundary

- Branch: `codex/admin-ai-provider-enabled-route-fake-tdd-20260626`
- Scope: local source focused TDD for admin route/runtime bridge control only.
- Allowed: contract/service/test edits listed in task queue, task plan/evidence/audit/state updates.
- Blocked: real Provider calls, credential/env access, DB/schema/migration/seed, package/lockfile changes, browser/e2e/dev-server, formal question/paper writes, staging/prod/payment/external service, release readiness/final Pass.

## Requirements and prior evidence read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`

## Plan

1. Add RED focused tests proving provider-enabled controlled runner support is absent for admin runtime bridge and content/org question/paper routes.
2. Extend admin runtime bridge contracts so default remains provider-disabled, while an explicit controlled runner can execute a route-integrated Provider control.
3. Add admin runtime bridge service execution mapping using existing route-integrated Provider summary boundaries; fake Provider tests must not expose raw prompt/output/payload or credentials.
4. Wire content/org admin local contract route to consume the controlled runner and preserve formal question/paper write blocks.
5. Run focused tests, lint, typecheck, diff check, Module Run v2 hardening/readiness, then write redacted evidence and audit review.

## Risk controls

- Real Provider path stays disabled unless runtime control explicitly supplies approved provider execution.
- Task 1 uses fake Provider executor only; no credential source is read.
- Evidence records only aggregate workflow/status/latency/token summary and route state.
- Generated result/history isolation remains; formal adoption is still blocked.
