# Preview Owner Acceptance Checklist Plan

## Scope

- Task id: `preview-owner-acceptance-checklist-2026-06-22`
- Branch: `codex/preview-owner-acceptance-checklist-20260622`
- Scope type: docs/state-only preview owner acceptance checklist refinement.
- User direction: refine owner acceptance accounts, sample data boundary, and monitoring/rollback/stop owner checklist while keeping actual staging, browser/e2e, Provider, and deploy work behind separate fresh approvals.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- Existing preview planning packets and evidence.

## Plan

1. Archive the displaced closed task `batch-285-ai-task-and-provider-local-task-request-policy-and-result-referen` to keep the active terminal recovery window clean.
2. Add `docs/04-agent-system/state/preview-owner-acceptance-checklist.yaml`.
3. Register checklist summary in `project-state.yaml`, `task-queue.yaml`, `task-history-index.yaml`, and the local experience coverage matrix.
4. Validate queue status, next action, seed proposal, queue slimming, formatting, lint, typecheck, diff, and Module Run v2 closeout checks.

## Risk Controls

- No account creation, no seed/reset command, no staging/prod connection, no browser/e2e/dev-server runtime, no Provider/model call, no env/secret access, no deployment, no PR, no force push outside approved master push.
- Evidence remains metadata-only and excludes secrets, tokens, DB URLs, raw prompts, Provider payloads, raw generated content, raw employee answers, full paper content, and plaintext `redeem_code`.
