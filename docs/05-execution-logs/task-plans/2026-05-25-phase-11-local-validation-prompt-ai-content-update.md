# Phase 11 Local Validation Prompt AI Content Update Plan

## Task

- id: `phase-11-local-validation-prompt-ai-content-update`
- source: user request on 2026-05-25 to adjust the next local validation prompt so it includes manual content-backend experience and limited local/dev real AI provider experience.
- branch: `codex/phase-11-local-validation-prompt-ai-content`
- scope: documentation-only handoff update.

## Read Gate

Read before editing:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/handoffs/2026-05-25-next-local-validation-session-prompt.md`

## Boundary

Allowed files:

- `docs/05-execution-logs/handoffs/2026-05-25-next-local-validation-session-prompt.md`
- `docs/05-execution-logs/task-plans/2026-05-25-phase-11-local-validation-prompt-ai-content-update.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-validation-prompt-ai-content-update.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files and actions:

- no `package.json`, lockfile, `.env.example`, `.env.local`, runtime source, schema, migration, drizzle, or script change;
- no secret/env reading or output;
- no staging/prod connection;
- no deployment;
- no cloud resource change;
- no real provider call in this task;
- no raw provider payload, raw prompt, raw answer, or raw model response in evidence.

## Implementation Approach

1. Register the documentation-only task in queue/state.
2. Rewrite the handoff prompt in clean Chinese text.
3. Add explicit local content-backend manual test allowance and redaction rules.
4. Add explicit local/dev real AI provider allowance capped at five calls for the next session only.
5. Preserve Phase 11 pause status and external resource readiness facts.
6. Validate with task readiness, text checks, agent readiness, naming checks, git completion readiness, and diff hygiene.

## Risk Defense

- This task does not execute the next local validation.
- This task does not upload content.
- This task does not call a real AI provider.
- This task does not read `.env.local`.
- The next-session prompt carries redaction and approval boundaries so runtime evidence remains reviewable without leaking sensitive content.
