# Learner and employee AI history closure implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the learner and employee AI generation request/result history loop after a local visible Provider submit.

**Architecture:** Reuse the existing personal AI generation route, repository, runtime bridge, and redacted result materialization services. Normalize personal users to personal ownership and employee users to organization ownership at the route boundary, then pass owner type through repository conditions and redacted result materialization.

**Tech Stack:** Next.js route services, TypeScript, Drizzle repository adapters, Vitest focused unit tests.

---

## Task

- Task id: `learner-employee-ai-history-closure-2026-07-02`
- Branch: `codex/learner-employee-ai-history-closure`
- Source: `marketing-monopoly-provider-acceptance-2026-07-02` residual findings `MM-01` and `MM-02`.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-provider-acceptance.md`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/models/ai-generation-task-request.ts`
- `src/db/schema/ai-rag.ts`

## Scope

- Fix employee local browser AI generation request persistence so organization-owned employee submits are not silently excluded.
- Fix request and result history lookup so employee sessions query the organization owner public id and organization owner type.
- Fix route-integrated Provider success with result materialization control so a redacted draft result can be persisted in the same server route path.
- Keep all persisted result content redacted snapshot only; visible Provider text remains transient UI response only.

## Out Of Scope

- Logistics resource coverage.
- Real Provider call execution in automated validation.
- `.env*` read/write, credential/session/localStorage/cookie/Auth header inspection, DB connection, DB mutation, resource import, package/lockfile/dependency change, schema/migration/seed, e2e, staging/prod/cloud/deploy, Cost Calibration, PR, force push, release readiness, final Pass.
- Raw DB rows, internal ids, PII, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/question/paper/material/resource/chunk content in evidence.

## Implementation Steps

- [x] Add failing request route tests for employee organization-owner persistence and employee request history lookup.
- [x] Add failing result route tests for employee organization-owner result history and detail lookup.
- [x] Add failing runtime bridge test proving Provider success plus materialization persists a redacted result summary.
- [x] Run focused tests and record red failures.
- [x] Extend personal AI generation request/result repository inputs and conditions with `ownerType`, defaulting existing personal callers to `personal`.
- [x] Reuse the route user context resolver to derive owner query scope: personal users use personal owner; employees use organization owner.
- [x] Allow persistent request input for `personal_auth` personal ownership and `org_auth` organization ownership.
- [x] Include `ownerType` in redacted result persistence input and task lookup.
- [x] When provider execution succeeds and result materialization control is present, materialize the redacted result through the existing materialization service.
- [x] Run focused tests and keep them green.
- [x] Run lint, typecheck, prettier check, `git diff --check`, and Module Run v2 gates.
- [x] Write evidence and adversarial audit review before commit.

## Validation

- `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-learner-employee-ai-history-closure.md docs/05-execution-logs/evidence/2026-07-02-learner-employee-ai-history-closure.md docs/05-execution-logs/audits-reviews/2026-07-02-learner-employee-ai-history-closure.md src/server/models/personal-ai-generation-result-history.ts src/server/models/personal-ai-generation-result.ts src/server/validators/personal-ai-generation-result-history.ts src/server/validators/personal-ai-generation-result-persistence.ts src/server/repositories/personal-ai-generation-request-repository.ts src/server/repositories/personal-ai-generation-result-repository.ts src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-result-route.ts src/server/services/personal-ai-generation-result-history-service.ts src/server/services/personal-ai-generation-route-integrated-result-materialization-service.ts src/server/services/personal-ai-generation-runtime-bridge-service.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-employee-ai-history-closure-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-employee-ai-history-closure-2026-07-02 -SkipRemoteAheadCheck`
