# Personal Learning AI Local Experience Packet Plan

- Task id: `personal-learning-ai-local-experience-packet`
- Branch: `codex/personal-learning-ai-local-experience-packet`
- Created at: `2026-06-18T12:25:01-07:00`
- Execution profile: `local_full_flow`
- Evidence mode: `full`
- Validation policy: `local_full_flow`
- Queue selection mode: `user_bounded_packet_serial`

## Goal

Close the following local experience matrix rows to `experience_closed` only if fresh redacted local evidence and audit
support local-only closure:

- `UC-ADV-AUTH-CONTEXT-UPGRADE`
- `UC-ADV-AI-TASK-LIFECYCLE`
- `UC-ADV-PERSONAL-AI-QUESTION-GENERATION`
- `UC-ADV-PERSONAL-AI-PAPER-GENERATION`
- `UC-ADV-FORMAL-CONTENT-SEPARATION`

This goal does not claim release readiness.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-technical-architecture.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-and-deployment-strategy.md`
- `docs/02-architecture/adr/adr-005-staging-governance-and-release-lane.md`
- `docs/02-architecture/adr/adr-006-runtime-package-baseline.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- Existing personal AI, AI task/provider, authorization, formal adoption, organization-training evidence and audit records
  referenced by the matrix rows.
- Allowed existing e2e specs:
  - `e2e/local-auth-route-guard.spec.ts`
  - `e2e/personal-ai-generation-local-request.spec.ts`
  - `e2e/local-business-flow.spec.ts`
  - `e2e/organization-training-local-full-flow.spec.ts`

## Baseline State

- Baseline commit: `5c29465e`
- `master` and `origin/master` are aligned at the baseline before branch creation.
- The previous bounded packet explicitly reached `ready_for_next_packet` and its short branch was removed.
- `Get-TikuProjectStatus.ps1` and `Get-TikuNextAction.ps1 -VerboseHistory` report a seed-required personal-learning-ai
  local experience candidate and no executable task.

## Implementation Strategy

1. Materialize one bounded packet task in `task-queue.yaml` and point `project-state.yaml` at it.
2. Run fresh focused unit tests across authorization context, AI task lifecycle, personal AI request/result/browser
   contracts, formal adoption boundary, and organization-training separation.
3. Run `npm.cmd run test:e2e -- --list`.
4. Run only the user-approved existing local e2e specs:
   - `e2e/local-auth-route-guard.spec.ts`
   - `e2e/personal-ai-generation-local-request.spec.ts`
   - `e2e/local-business-flow.spec.ts`
   - `e2e/organization-training-local-full-flow.spec.ts`
5. If validation fails, repair only directly related minimal source or focused unit tests. Do not edit e2e specs.
6. If fresh evidence passes and the audit confirms only local-only closure is being claimed, update the five matrix rows
   to `experience_closed`.
7. Run scoped formatting, whitespace, lint, typecheck, and Module Run v2 readiness gates.
8. Commit, fast-forward merge to `master`, rerun master gates, push `origin/master`, and delete the merged short branch
   only after all gates pass.

## Hard Blocks

- No `.env*` read, write, or output.
- No secret/env exposure.
- No package, lockfile, or dependency changes.
- No schema, Drizzle, or migration changes.
- No new or edited e2e specs.
- No real provider/model calls or provider configuration changes.
- No staging/prod/cloud/deploy/payment/external-service work.
- No PR, force-push, or `--force-with-lease`.
- No destructive database operations.
- No Cost Calibration Gate.
- No raw paper content, raw student answers, plain `redeem_code`, provider payload, public identifier inventories, row
  dumps, tokens, cookies, Authorization headers, database URLs, or private data in evidence.

## Risk Controls

- Treat `provider`, `payment`, `quota/cost`, and formal target writes as release blockers, not local experience blockers,
  when the local mock/local contract evidence is sufficient.
- Preserve ADR-002 layering: route handlers remain thin, services own validation and DTO creation, repositories stay
  behind service contracts.
- Keep evidence summary-only: commands, results, counts, file paths, and policy decisions only.
- Do not claim generated question/paper durability beyond the existing local contract and redacted read-model behavior.
