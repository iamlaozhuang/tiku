# 2026-07-06 Admin Route Observability Safe Error Fix Plan

## Scope

- Task: `admin-route-observability-safe-error-fix-2026-07-06`
- Branch: `codex/admin-route-observability-fix-2026-07-06`
- Base: stacked on `codex/admin-content-route-observability-audit-2026-07-06`
- Goal: keep `409015` and no task/result persistence while exposing a redacted, safe failure category or mapped safe error type for admin/content and organization/admin AI generation route failures.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- AI generation traceability files dated 2026-07-02 and 2026-07-05
- Latest admin route observability root-cause evidence/audit

## Implementation Plan

1. Add a narrow, redacted admin AI generation rejection DTO for `409015` responses.
2. Map runtimeBridge failure categories to safe route error categories.
3. Keep no-persistence behavior for rejected output.
4. Keep sensitive fields out of responses: no Provider payload, prompt, raw output, credential, env value, grounding text, resource/chunk content, internal id, or DB row.
5. Update frontend error formatting to prefer the safe category when present.
6. Add focused unit tests for:
   - missing Provider credential category;
   - insufficient grounding category;
   - structured preview invalid category;
   - no task/result persistence remains unchanged.

## Boundaries

- No dependency, package, or lockfile change.
- No schema or migration.
- No DB operation.
- No Provider call.
- No dev server, browser matrix, staging/prod/deploy, or Cost Calibration.
- No raw sensitive evidence.

## Validation

- Focused admin route and UI unit tests.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Module Run v2 hardening and pre-push readiness before closeout.
