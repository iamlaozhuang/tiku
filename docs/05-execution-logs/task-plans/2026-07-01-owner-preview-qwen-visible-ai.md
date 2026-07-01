# Task Plan: owner-preview-qwen-visible-ai

## Task

- Task id: `owner-preview-qwen-visible-ai-2026-07-01`
- Branch: `codex/owner-preview-qwen-visible-ai`
- Goal: wire the local owner preview AI generation routes to Alibaba Qwen through the existing OpenAI-compatible provider path, returning only transient page-visible generated content while keeping persistence and evidence redacted.
- Human approval: current user explicitly requested implementation of the two-stage owner preview preparation plan on 2026-07-01.

## Read Before Coding

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

## Scope

- Add a DTO field for transient page-visible generated content outside the redacted execution summary.
- Keep the existing Qwen/OpenAI-compatible metadata and local limits; increase only the output token cap enough for manual preview.
- Wire local API routes to a server-side runtime control that reads `ALIBABA_API_KEY` from runtime environment only and never reads `.env*`.
- Show transient generated content on the student AI training page and admin AI generation page when the provider call succeeds.
- Persist only existing redacted snapshots, status, duration, token usage, and safe metadata; never persist visible generated text.

## Out of Scope

- No real Provider call during validation without separate fresh owner preview approval.
- No `.env*` read, print, edit, or commit.
- No browser runtime, e2e, raw DOM, screenshot, trace, HTML dump, staging/prod/cloud, deployment, PR, force push, Cost Calibration, release readiness, final Pass, package/lockfile, dependency, schema, migration, seed, or DB changes.
- No Provider payloads, prompts, raw AI input/output, full generated content, full question/paper/material/resource/chunk content, raw DB rows, internal numeric IDs, credentials, tokens, cookies, sessions, localStorage, Authorization headers, PII, or plaintext `redeem_code` in evidence.

## Implementation Approach

1. Extend route-integrated Provider result/outcome DTOs with `visibleGeneratedContent`, a transient response-only object.
2. Add shared normalization and redaction checks for visible generated text:
   - cap response text length;
   - block credential or forbidden Provider artifact leakage;
   - return a redaction-violation summary if unsafe.
3. Update personal and admin runtime bridges to carry the transient content through route responses but not into execution summaries or redacted snapshots.
4. Widen admin task persistence metadata only for safe Provider status flags already represented in the existing schema, without persisting visible generated text.
5. Add a local owner preview runtime control factory for student personal/employee and content/organization admin routes. It reads only `process.env.ALIBABA_API_KEY` at request time and is disabled in production.
6. Render the transient generated content in existing UI surfaces when present.
7. Update focused tests for success, missing key, redaction violation, route wiring, UI rendering, and persistence/evidence non-leakage.

## Validation

- `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId owner-preview-qwen-visible-ai-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId owner-preview-qwen-visible-ai-2026-07-01 -SkipRemoteAheadCheck`
