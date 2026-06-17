# Task Plan: batch-209 ops-governance redeem_code redacted reference

## Task

- Task id: `batch-209-ops-governance-and-retention-redeem-code-redacted-reference`
- Module: `ops-governance-and-retention`
- Execution profile: `local_unit_tdd`
- Evidence mode: redacted local evidence only
- Branch: `codex/ops-governance-batch-209-redeem-reference`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Implement a local service-contract read model for operations-facing `redeem_code` redacted references. The read model must expose policy and status only. It must not expose plaintext redeem codes, hashes, row data, private data, raw provider payloads, raw prompts/answers, or publicId inventories.

Allowed files are limited to server model/contract/validator/service files and task plan/evidence/audit/state records declared by the queue task.

## TDD Plan

1. Add focused unit tests first for the desired ops-governance redacted reference contract.
2. Run the focused test and confirm RED failure because the service module does not exist.
3. Add the minimal model, contract, validator, and service implementation.
4. Re-run the focused test for GREEN.
5. Run lint, typecheck, diff checks, module closeout readiness, and pre-commit hardening.

## Risk Controls

- Keep output aggregate/status-only and avoid publicId lists.
- Do not touch schema, Drizzle, migrations, package files, lockfiles, dependencies, providers, cloud/deploy/payment/external services, or `.env*`.
- Use standard `{ code, message, data }` response envelopes.
- Write redacted evidence only.
