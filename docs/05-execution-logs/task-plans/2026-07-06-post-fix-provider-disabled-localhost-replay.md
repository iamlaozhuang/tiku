# 2026-07-06 Post Fix Provider Disabled Localhost Replay Plan

## Task

- id: `post-fix-provider-disabled-localhost-replay-2026-07-06`
- branch: `codex/post-fix-provider-disabled-localhost-replay-2026-07-06`
- base: `master` / `origin/master` at `4c849fcdb`
- approval: current user approved independent short branch, completion, merge, push, and cleanup on 2026-07-06.

## Read Gate

Read before execution:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- Latest post-fix local adversarial acceptance evidence and audit.
- Latest no-Provider route grounding replay evidence.
- Latest admin route observability safe error fix evidence.

## Goal

Produce a fresh local Provider-disabled replay after the admin observability fix. The target is a clear, redacted local claim about disabled Provider behavior, not Provider-enabled success and not release readiness.

## Strategy

1. Confirm current branch and clean baseline.
2. Run source/unit gates that protect the fixed admin route and UI mapping.
3. Build and start the app only on localhost in local `next start` mode so owner-preview runtime Provider control is disabled by runtime mode and admin routes fall back to `provider_call_blocked`.
4. Use private fixture credentials only in-memory for role login. Do not print or persist credential, cookie, token, header, private fixture value, DB URL, raw row, internal id, or full content.
5. Probe content admin and organization advanced admin AI generation routes with redacted aggregate request bodies.
6. Probe organization standard admin denial to ensure advanced AI is still blocked before runtime work.
7. Probe browser mapping with a real content/admin page session and intercepted same-shape Provider-disabled response only if direct content-admin login is viable under localhost runtime.
8. Stop localhost service, clean task-owned runtime logs, and write evidence/audit/state/queue.

## Expected Evidence Categories

- content/admin Provider-disabled route: `409015`, safe rejection reason, no Provider call, no env secret access, no Provider config read, no Cost Calibration, no aggregate history growth.
- org/admin Provider-disabled route: same as above for advanced org admin if fixture login succeeds.
- org standard admin: `403011`, no advanced AI route execution.
- browser mapping: clear Provider-disabled no-draft message, no forbidden markers.

## Boundaries

- No source implementation planned.
- No dependency, package, lockfile, schema, migration, seed, or env file change.
- No destructive DB operation.
- No staging/prod/deploy/cloud/payment/external-service work.
- No Cost Calibration execution or claim.
- No Provider-enabled success claim.
- No raw Provider payload, prompt, AI output, complete question, paper, material, DB row, internal id, credential, session, token, cookie, header, env value, screenshot, DOM dump, or private fixture value in evidence.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run build`
- localhost provider-disabled redacted replay script
- `git diff --check`
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId post-fix-provider-disabled-localhost-replay-2026-07-06`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId post-fix-provider-disabled-localhost-replay-2026-07-06 -SkipRemoteAheadCheck`
