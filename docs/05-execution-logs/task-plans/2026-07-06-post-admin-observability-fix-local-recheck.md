# 2026-07-06 Post Admin Observability Fix Local Recheck Plan

## Scope

- Task: `post-admin-observability-fix-local-recheck-2026-07-06`
- Branch: `codex/post-admin-observability-fix-local-recheck-2026-07-06`
- Base: `master` at `107accbc5`
- Goal: adversarially recheck the local evidence after the admin route observability fix, with emphasis on `409015` safe rejection reason visibility, no-persistence boundaries, standard-role denial, and remaining non-claim boundaries.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- AI generation traceability files dated `2026-07-02` and `2026-07-05`
- Latest 2026-07-06 local adversarial acceptance, no-Provider route replay, grounding root-cause, admin route observability audit, and safe error fix evidence/audit.

## Recheck Strategy

1. Confirm `master` / `origin/master` alignment before branching and record current commit.
2. Run source/unit gates:
   - `npm.cmd run lint`
   - `npm.cmd run typecheck`
   - focused admin route/UI unit tests
   - `git diff --check`
3. Run mechanism diagnostics:
   - `Get-TikuNextAction.ps1`
   - `Get-TikuProjectStatus.ps1`
   - `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
4. Run post-fix route/unit adversarial probes for:
   - provider-disabled `409015` safe reason;
   - missing Provider credential safe reason;
   - insufficient grounding safe reason;
   - structured-preview unacceptable safe reason;
   - no task/result persistence.
5. If localhost and private 0704 runtime prerequisites are available without secret/env disclosure, run a bounded browser/API spot check and record only aggregate role/status/code/category results.
6. Do not claim Provider-enabled small-sample pass unless a fresh approved local small sample actually executes; otherwise record blocked/not tested.

## Boundaries

- No source implementation change planned.
- No dependency, package, lockfile, schema, migration, seed, env, or secret change.
- No destructive DB operation.
- No Provider payload, raw prompt, raw AI output, complete question/paper/material/chunk text, DB raw row, internal id, credential, session, cookie, token, screenshot, trace, or DOM dump in evidence.
- No staging/prod/deploy, external service, release readiness, production usability, or Cost Calibration execution/claim.

## Expected Deliverables

- Redacted evidence file.
- Adversarial audit review.
- State/queue update for this local recheck.
- If no code issue is proven: docs/evidence/state-only commit.
- If code issue is proven: stop this recheck path, create separate fix branch, then rerun recheck after fix.
