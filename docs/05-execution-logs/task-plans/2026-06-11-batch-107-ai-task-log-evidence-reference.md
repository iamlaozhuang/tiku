# Batch 107 AI Task Log Evidence Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement deterministic local redacted `audit_log` and `ai_call_log` evidence reference contracts for advanced edition `ai_generation_task` flows.

**Architecture:** Keep this batch inside model, contract, validator, and service surfaces. No repository, route handler, Server Action, schema, migration, provider runtime, dependency, env/secret, staging, prod, cloud, deploy, payment, or external service work is included.

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
- `docs/05-execution-logs/evidence/batch-106-ai-task-and-provider-local-task-request-policy-and-result-referen.md`

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

- [x] Review existing generic `audit_log` / `ai_call_log` reference code and batch106 request policy.
- [x] RED: add focused tests for `ai_generation_task` log evidence references.
- [x] Verify RED with the focused unit test command.
- [x] GREEN: implement minimal deterministic model, contract, validator, and service exports.
- [x] Verify GREEN with the focused unit test command.
- [x] Run `npm.cmd run lint`, `npm.cmd run typecheck`, focused unit tests, `git diff --check`, and module closeout readiness.
- [x] Write evidence and audit review with redacted validation output.

## Risk Defense

- The implementation exposes public ids, task status, failure category, retention metadata, redaction status, and summary visibility only.
- It must not expose numeric ids, raw prompt text, provider payload, raw AI output, raw error payload, secret, token, database URL, Authorization header, plaintext `redeem_code`, full `paper` content, raw answer text, IP address, or user agent.
- No schema, migration, dependency, lockfile, env, staging, prod, cloud, deploy, payment, external service, PR, force push, e2e, provider call, provider configuration, or Cost Calibration Gate action is included.
