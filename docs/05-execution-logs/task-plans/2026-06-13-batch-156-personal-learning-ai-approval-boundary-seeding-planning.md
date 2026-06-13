# Task Plan: batch-156-personal-learning-ai-approval-boundary-seeding-planning

## Task

- Task id: `batch-156-personal-learning-ai-approval-boundary-seeding-planning`
- Task kind: `implementation_planning`
- Branch: `codex/batch-156-personal-learning-ai-approval-boundary-seeding-planning`
- Baseline: `159385c9943a93dc9e00d5bac7e299affe9e104a`
- Dependency satisfied: `batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh` is closed.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-153-personal-learning-ai-route-service-repository-metadata-security-review.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-151-personal-learning-ai-repository-service-defense-in-depth-seeding-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-153-personal-learning-ai-route-service-repository-metadata-security-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh.md`

## Scope

- Seed batch-157 through batch-161 as ordered docs-only personal-learning-ai approval boundary tasks.
- Keep the next tasks separated by approval surface: dependency gate, provider/env/secret gate, generated-content
  adoption boundary, local provider sandbox planning blocked gate, and staging/provider/deploy blocked gate.
- Update only project state, task queue, this task plan, this task evidence, and this task audit.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-156-personal-learning-ai-approval-boundary-seeding-planning.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-156-personal-learning-ai-approval-boundary-seeding-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-156-personal-learning-ai-approval-boundary-seeding-planning.md`

## Blocked Files And Actions

- Do not edit `.env.local`, `.env.example`, package files, lockfiles, `src/**`, `tests/**`, `e2e/**`, schema, drizzle,
  materials, paper assets, or generated Playwright artifact directories.
- Do not read, create, or modify env files, secrets, provider configuration, provider keys, or provider destinations.
- Do not install, remove, or upgrade npm packages, CLIs, SDKs, or testing frameworks.
- Do not call any AI provider or run a local provider sandbox.
- Do not write generated content or adopt it into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or
  `mistake_book`.
- Do not run e2e, schema/migration, destructive DB, staging/prod/cloud, deploy, payment, external-service, PR,
  force-push, or Cost Calibration work.

## Validation Plan

1. Run pre-edit readiness on the short branch.
2. Seed batch-157 through batch-161 with concrete dependencies, allowedFiles, blockedFiles, fresh approval boundaries,
   validation commands, evidence paths, and audit paths.
3. Run Prettier check on changed docs/state files.
4. Run `git diff --check`.
5. Run the queue-declared anchor check for `batch-157` through `batch-161` and blocked approval surfaces.
6. Run `npm.cmd run lint`.
7. Run `npm.cmd run typecheck`.
8. Run `npm.cmd run test:unit`.
9. Run `npm.cmd run build`.
10. Run Module Run v2 pre-commit hardening, module closeout readiness, and pre-push readiness for batch-156.
11. Fast-forward merge to `master`, run closeout/pre-push readiness on `master`, push `origin master`, then delete the
    merged short branch.

## Risk Controls

- Evidence will not include secrets, tokens, provider payloads, database URLs, raw generated content, or internal
  autoincrement ids.
- Any unexpected source/test/e2e/env/package/schema/provider/deploy change is a hard stop.
- Future provider, env, dependency, generated-content, sandbox, deploy, payment, external-service, and Cost Calibration
  work must remain separately queued and freshly approved before execution.
