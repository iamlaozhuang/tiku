# 2026-07-07 Provider-Enabled Bounded Smoke Plan

## Task

- Task id: `provider-enabled-bounded-smoke-2026-07-07`
- Branch: `codex/provider-enabled-bounded-smoke-2026-07-07`
- Approval: user approved the recommended `Provider-enabled bounded smoke` on 2026-07-07.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- AI generation traceability overlays through `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest 0704 local grounding, DB-backed replay, organization enterprise fixture materialization, Provider count/timeout, and final local rollup evidence.

## Scope

Execute a local-only Provider-enabled smoke with a maximum of four Provider submit attempts:

1. `personal_advanced_student` AI出题 tiny request.
2. `personal_advanced_student` AI组卷 bounded plan request.
3. `org_advanced_admin` AI组卷 bounded plan request.
4. `content_admin` AI出题 tiny request.

Each attempt must use the existing route-integrated Provider execution path and owner-preview Qwen local runtime control. The harness must record only redacted aggregate outcomes.

## Boundaries

- Local only.
- Provider-enabled, maximum four submits, zero retries per submit.
- Stop on first unsafe redaction condition.
- Stop or classify blocked on missing credential, insufficient grounding, network/provider failure, or unclear runtime boundary.
- No Cost Calibration, cost measurement, quota decision, latency benchmark, staging, production, deployment, PR, force-push, dependency change, package/lockfile change, schema/migration/seed change, destructive DB operation, screenshot, DOM dump, trace, or source fix.
- No committed product source or test changes.
- No Provider payload, raw prompt, raw AI output, full generated content, full question, answer, paper, material, resource, chunk content, DB URL, raw DB row, internal id, credential, token, cookie, session, header, env value, private fixture value, employee raw answer, or plaintext `redeem_code` in evidence.

## Evidence Fields

Allowed evidence fields:

- role label;
- workflow label;
- requested count category;
- grounding `evidenceStatus` and citation count;
- credential-present category only;
- Provider call executed boolean;
- result status and safe failure category;
- duration bucket;
- structured preview kind and parse status;
- requested/recognized count categories;
- usage summary presence only;
- redaction status;
- Cost Calibration executed false.

## Validation

- Temporary Provider smoke harness, removed before commit.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts`
- `git diff --check`
- scoped Prettier check
- Module Run v2 pre-commit hardening

## Closeout

Local commit is approved by this task. Fast-forward merge, push, and branch cleanup require fresh approval.
