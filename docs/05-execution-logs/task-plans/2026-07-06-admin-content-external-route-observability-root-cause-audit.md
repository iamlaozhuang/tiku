# 2026-07-06 Admin Content External Route Observability Root-Cause Audit Plan

## Scope

- Task: `admin-content-external-route-observability-root-cause-audit-2026-07-06`
- Branch: `codex/admin-content-route-observability-audit-2026-07-06`
- Goal: explain why content/admin and organization/admin external AI generation routes returned `409015` without runtimeBridge details while the admin bridge replay reached `missing_provider_credential`.

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
- Latest 0704 no-Provider route grounding replay evidence/audit

## Method

1. Inspect the content and organization AI generation route handlers.
2. Trace route handler to shared admin AI generation local contract route/service mapping.
3. Identify the earliest condition that returns `409015`.
4. Compare that path to the bridge replay path and determine whether the limitation is:
   - expected request-contract gating,
   - runtimeBridge mapping omission,
   - test fixture/request-shape issue,
   - or confirmed product source defect.
5. Record only file paths, function names, error codes, booleans, and aggregate conclusions.

## Boundaries

- No source code change.
- No persisted test source change.
- No package or lockfile change.
- No DB operation.
- No Provider call.
- No dev server required unless source inspection cannot explain root cause.
- No staging/prod/deploy.
- No Cost Calibration.
- No credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question, full paper, full material, resource, chunk, screenshots, DOM dumps, or private fixture values in evidence.

## Expected Deliverables

- Redacted evidence.
- Adversarial audit review.
- State and queue update.
- Local validation and one docs/evidence commit if no source bug is confirmed.
