# AP-01 Qwen exact model id and key permission handoff audit review

## Decision

APPROVE_DOCS_STATE_CLOSEOUT

## Scope Review

- Docs/state only: planned.
- Provider call: blocked.
- `.env.local` read/write: blocked.
- Business code/tests/schema/migration/dependency changes: blocked.
- Push/PR/deploy/staging/prod/cloud/payment/external service: blocked.

## Findings

No blocking findings. This task intentionally records configuration guidance and next approval boundaries only.

## Risk Review

- The prior retry used `qwen-plus`; the intended next model is `qwen3.7-max`, so the next execution requires explicit fresh approval for the new model id.
- The official examples use `DASHSCOPE_API_KEY`, while the project runner currently uses `ALIBABA_API_KEY` by explicit `--env-key`; this is acceptable if documented and passed explicitly.
- The current runner does not automatically read `ALIBABA_BASE_URL` or `ALIBABA_MODEL`; relying on those values without explicit CLI flags would be misleading.
- API Key screenshots can expose masked fragments; evidence must not copy those fragments.

## Closeout Requirements

- Update task queue and project state with this handoff result.
- Update the AP-01 coverage matrix row with the new evidence and next fresh approval candidate.
- Run Prettier, diff check, lint, typecheck, pre-commit hardening, and closeout readiness.
- Commit locally only.
