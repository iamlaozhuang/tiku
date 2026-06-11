# Batch 105 AI Task Lifecycle Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the provider-agnostic AI generation task lifecycle contract for the advanced edition `ai-task-and-provider` module.

**Architecture:** Keep this batch at model and contract level only. No repository, route handler, provider runtime, schema, migration, dependency, env/secret, or external service work is included.

**Tech Stack:** TypeScript, Vitest, existing `src/server/models/**` and `src/server/contracts/**` patterns.

---

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`

## Scope

Create:

- `src/server/models/ai-generation-task.test.ts`
- `src/server/models/ai-generation-task.ts`
- `src/server/contracts/ai-generation-task-contract.ts`

Update:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/batch-105-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract.md`
- `docs/05-execution-logs/audits-reviews/batch-105-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract.md`

## Steps

- [ ] RED: add focused lifecycle model tests for allowed transitions, blocked transitions, retryable failure categories, and redaction-safe public identifiers.
- [ ] Verify RED with `npm.cmd run test:unit -- src/server/models/ai-generation-task.test.ts`.
- [ ] GREEN: implement minimal lifecycle model and contract exports.
- [ ] Verify GREEN with the focused test.
- [ ] Run `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit -- src/server/models/ai-generation-task.test.ts`, `git diff --check`, and module closeout readiness.
- [ ] Write evidence and audit review with redacted validation output.

## Risk Defense

- No provider call, provider configuration, prompt, provider payload, raw AI output, secret, token, database URL, plaintext `redeem_code`, full `paper` content, or raw answer text is introduced.
- No schema, migration, dependency, lockfile, env, staging, prod, cloud, deploy, payment, external service, PR, force push, or Cost Calibration Gate action is included.
