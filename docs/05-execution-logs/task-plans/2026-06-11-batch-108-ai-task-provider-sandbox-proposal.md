# Batch 108 AI Task Provider Sandbox Proposal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement deterministic local `local_provider_sandbox` proposal and evidence rules for advanced edition `ai_generation_task` flows.

**Architecture:** Keep this batch inside model, contract, validator, and service surfaces. The output is proposal-only local read-model logic that records whether a separately approved local provider sandbox validation would be allowed. No provider runtime, provider SDK, env/secret, repository, route handler, Server Action, schema, migration, dependency, staging, prod, cloud, deploy, payment, external service, e2e, or Cost Calibration Gate work is included.

**Tech Stack:** TypeScript, Vitest, existing `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**` patterns.

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
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`
- `docs/05-execution-logs/evidence/batch-107-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence.md`
- `docs/05-execution-logs/audits-reviews/batch-107-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence.md`

## Scope

Create or update only as needed:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Steps

- [x] Review existing `ai_generation_task` request policy and log evidence reference code.
- [x] RED: add focused tests for `local_provider_sandbox` proposal and evidence rules.
- [x] Verify RED with the focused unit test command.
- [x] GREEN: implement minimal deterministic model, contract, validator, and service exports.
- [x] Verify GREEN with the focused unit test command.
- [x] Run `npm.cmd run lint`, `npm.cmd run typecheck`, focused unit tests, and `git diff --check`.
- [x] Run module closeout readiness.
- [x] Write evidence and audit review with redacted validation output.

## Risk Defense

- The implementation exposes only public ids, proposal status, local-only approval state, blocked reason categories, redaction state, summary-only evidence rules, and allowed validation evidence metadata.
- It must not expose numeric ids, raw prompt text, provider payload, raw AI output, raw error payload, secret, token, database URL, Authorization header, plaintext `redeem_code`, full `paper` content, raw answer text, IP address, or user agent.
- The service is proposal-only and must not execute a provider call, read or write env/secret values, change provider configuration, measure provider cost, or trigger Cost Calibration Gate behavior.
- No schema, migration, dependency, lockfile, env, staging, prod, cloud, deploy, payment, external service, PR, force push, e2e, provider runtime, provider configuration, provider call, or Cost Calibration Gate action is included.
