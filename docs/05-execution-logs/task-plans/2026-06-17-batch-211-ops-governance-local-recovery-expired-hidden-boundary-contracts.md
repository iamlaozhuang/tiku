# Task Plan: batch-211 ops-governance local recovery expired-hidden boundary contracts

## Task

- Task id: `batch-211-ops-governance-and-retention-local-recovery-and-expired-hidden-boundary-c`
- Module: `ops-governance-and-retention`
- Execution profile: `local_unit_tdd`
- Evidence mode: redacted local evidence only
- Branch: `codex/ops-governance-batch-211-recovery-boundary`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Implement a local service-contract read model for operations-facing local recovery and expired-hidden boundary contracts. The read model must expose policy and aggregate status only: local recovery mode, recoverable artifact count, expired/hidden aggregate coverage, redacted log reference status, blocked capabilities, and operations review status.

Allowed files are limited to server model/contract/validator/service files and declared governance state, task plan, evidence, and audit records.

## TDD Plan

1. Add focused unit tests for the desired local recovery and expired-hidden boundary contract.
2. Run the focused test and confirm RED failure because the service module does not exist.
3. Add the minimal model, contract, validator, and service implementation.
4. Re-run the focused test for GREEN.
5. Run formatting, lint, typecheck, diff checks, module closeout readiness, and pre-commit hardening.

## Risk Controls

- Do not expose publicId inventories, row data, raw request/response content, raw prompts/answers, provider payloads, secrets, tokens, cookies, Authorization headers, DB URLs, or private data.
- Do not touch schema, Drizzle, migrations, package files, lockfiles, dependencies, providers, cloud/deploy/payment/external services, or `.env*`.
- Use standard `{ code, message, data }` response envelopes.
- Keep evidence redacted and command/result focused.
