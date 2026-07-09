# 2026-07-09 Content AI 0704 Goal Closeout Plan

## Task

- Task id: `content-ai-0704-goal-closeout-2026-07-09`
- Branch: `codex/content-ai-0704-goal-closeout`
- Goal contribution: close the active serial goal after all approved content AI 0704 short branches have been merged, pushed, cleaned, and validated.
- Scope type: docs/state closeout only.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-fixture-history-refresh.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-question-publish-replay.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-paper-publish-replay.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-final-role-regression.md`
- related audits in `docs/05-execution-logs/audits-reviews/`.

## Boundaries

- No source, test, package, lockfile, schema, migration, seed, dependency, browser, Provider, direct DB access, direct DB mutation, staging/prod/deploy, PR, force push, or Cost Calibration action.
- No credential, password, plaintext card, session, cookie, token, localStorage, Authorization header, DB URL, env value, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, or full question/paper/material/resource/chunk content in evidence.
- This closeout may summarize prior redacted evidence and update task state only.

## Execution Steps

1. Verify current `master` and `origin/master` are aligned after final role regression push.
2. Materialize this closeout task in `project-state.yaml` and `task-queue.yaml`.
3. Write final redacted evidence and adversarial audit that summarize the completed serial branches.
4. Run docs-state validation: scoped Prettier, `git diff --check`, lint, typecheck, Module Run v2 precommit, and prepush readiness.
5. Commit, fast-forward merge to `master`, rerun master docs-state gates, push `origin/master`, delete the closeout branch, confirm clean/aligned.
6. Mark the active Codex goal complete only after push and cleanup have succeeded.

## Expected Validation

- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`: pass.
- `git diff --check`: pass.
- `corepack pnpm@10.26.1 lint`: pass.
- `corepack pnpm@10.26.1 typecheck`: pass.
- Module Run v2 precommit hardening: pass.
- Module Run v2 prepush readiness: pass.

## Adversarial Review Focus

- All prior branches are merged to `master`, pushed to `origin/master`, and cleaned.
- Content AI 出题 and AI组卷 closed-loop evidence is redacted and bounded to localhost 0704.
- Personal advanced, organization advanced employee, and organization advanced admin regression evidence remains intact.
- Standard/advanced role boundaries are not weakened by any closeout wording.
- No release readiness, production usability, staging/prod, Provider readiness, broad production coverage, or Cost Calibration claim is made.
