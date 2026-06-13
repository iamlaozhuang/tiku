# Task Plan: batch-157-personal-learning-ai-dependency-introduction-gate-docs

## Task

- Task id: `batch-157-personal-learning-ai-dependency-introduction-gate-docs`
- Task kind: `blocked_gate`
- Branch: `codex/batch-157-personal-learning-ai-dependency-introduction-gate-docs`
- Baseline: `06e90ecb875da3b5b4f29f3aadb419df9dcb7b6a`
- Dependency satisfied: `batch-156-personal-learning-ai-approval-boundary-seeding-planning` is closed.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-13-batch-156-personal-learning-ai-approval-boundary-seeding-planning.md`

## Scope

- Record docs-only AI SDK/provider dependency candidates for future personal-learning-ai provider work.
- Record why each candidate remains deferred, what human approval evidence must exist before package or lockfile work,
  and how dependency changes must be isolated from feature implementation.
- Update only project state, task queue status for this task, this task plan, this task evidence, and this task audit.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-157-personal-learning-ai-dependency-introduction-gate-docs.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-157-personal-learning-ai-dependency-introduction-gate-docs.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-157-personal-learning-ai-dependency-introduction-gate-docs.md`

## Blocked Files And Actions

- Do not edit `.env.local`, `.env.example`, `package.json`, any lockfile, `src/**`, `tests/**`, `e2e/**`, schema,
  drizzle, materials, paper assets, or generated Playwright artifact directories.
- Do not install, remove, or upgrade npm packages, CLIs, SDKs, or testing frameworks.
- Do not call any provider, configure any provider endpoint, or read/write env or secret files.
- Do not run local provider sandbox, write generated content, deploy, touch payment or external-service surfaces, create
  a PR, force-push, or execute Cost Calibration.

## Validation Plan

1. Run pre-edit readiness on the short branch.
2. Record dependency candidate and approval-boundary evidence.
3. Run Prettier check on changed docs/state files.
4. Run `git diff --check`.
5. Run the queue-declared anchor check for `AI SDK/provider dependency candidates`, `package/lockfile changes remain
blocked`, `human approval`, and `Cost Calibration Gate remains blocked`.
6. Run `npm.cmd run lint`.
7. Run `npm.cmd run typecheck`.
8. Run `npm.cmd run test:unit`.
9. Run `npm.cmd run build`.
10. Run Module Run v2 pre-commit hardening, module closeout readiness, and pre-push readiness for batch-157.
11. Fast-forward merge to `master`, run closeout/pre-push readiness on `master`, push `origin master`, then delete the
    merged short branch.

## Risk Controls

- Evidence will not include secrets, tokens, provider payloads, database URLs, raw generated content, or internal
  autoincrement ids.
- Any package/lockfile, source/test/e2e, env/secret, schema/migration, provider, deploy, payment, or external-service
  change is a hard stop.
- Future dependency work must use a separate queued task, explicit `human approval`, package/lockfile allowedFiles, and
  an isolated dependency commit.
