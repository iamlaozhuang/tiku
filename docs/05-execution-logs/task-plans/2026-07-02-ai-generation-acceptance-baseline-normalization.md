# AI Generation Acceptance Baseline Normalization Task Plan

Task id: `ai-generation-acceptance-baseline-normalization-2026-07-02`

Branch: `codex/ai-generation-acceptance-baseline-normalization`

## Scope

Normalize the AI出题 / AI组卷 acceptance evidence and state into one current baseline:

- Current declared AI出题 / AI组卷 acceptance scope is complete.
- Historical residuals that were later covered are marked closed or superseded by newer evidence.
- No production usability, release readiness, final Pass, deployment, Cost Calibration, or broader logistics full-coverage claim is made.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-20-fix-quick-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-02-ops-admin-local-login-residual.md`
- `docs/05-execution-logs/evidence/2026-07-02-owner-preview-resource-pack-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-question-structure-repair.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-acceptance-baseline-normalization.md`

## Blocked Actions

- Source or test code changes.
- Provider calls, browser runtime, local server, direct DB access, DB mutation, schema/migration/seed actions.
- Dependency or lockfile changes.
- Staging, production, cloud deploy, PR creation, force push.
- Production usability, release readiness, final Pass, or Cost Calibration statements.

## Acceptance Criteria

- `project-state.yaml` and `task-queue.yaml` expose this task as the current closed baseline-normalization task.
- The evidence records that the quick-acceptance `ops_admin` local login residual is closed by the later local-login residual task.
- The evidence records that the quick-acceptance logistics non-covered wording is superseded for the declared AI generation acceptance scope by later resource-pack and Provider rerun evidence, without claiming broad production/full logistics coverage.
- `MML-RERUN-01` and `MML-RERUN-02` are closed or superseded by later monopoly OCR/runtime RAG, structured parser, and Provider count evidence.
- `MML-RERUN-03` remains only a diagnostic wording inconsistency outside the current Provider acceptance blocker set.
- Evidence remains redacted and contains no credentials, raw DB rows, Provider payloads, prompts, AI output, full question/paper/material/resource/chunk content, or PII.

## Validation Plan

- Scoped Prettier write/check for the five changed docs/state files.
- `git diff --check`
- Module Run v2 pre-commit hardening for this task.
- Module Run v2 module closeout readiness for this task.
- Module Run v2 pre-push readiness for this task with remote-ahead check skipped before local merge/push decision.
