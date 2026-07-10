# 2026-07-10 0704 Private Account Usage Guide Task Plan

## Task

- Task id: `0704-private-account-usage-guide-2026-07-10`
- Branch: `codex/0704-private-account-usage-guide`
- Goal: make 0704 credential lookup explicit for future localhost role acceptance, without committing or printing credential material.

## Read Before Change

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-0704-account-readiness-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-09-learner-ai-0704-account-readiness-audit.md`
- Private local directory inventory under `D:\tiku-local-private\acceptance`, with credential values kept out of output and evidence.

## Scope

- Create private local index: `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`.
- Add repository handoff guide that points to the private index and explains lookup order.
- Record task state, evidence, and adversarial audit using role labels and status categories only.

## Boundaries

- No source code, test code, package, lockfile, schema, migration, seed, env, provider, browser, screenshot, raw DOM, staging, prod, deploy, PR, force-push, Cost Calibration, or destructive database operation.
- Private credential values may be read only from local private files when needed, but must not be printed, committed, or copied into repository evidence.
- Repository documents must not contain account values, passwords, phone numbers, cookies, tokens, session data, Authorization headers, localStorage, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, or full question/paper/material content.

## Implementation Plan

1. Create a private role credential index outside the repository with fixed lookup fields and readiness-state vocabulary.
2. Add a repository handoff guide that future 0704 acceptance tasks must read before using role credentials.
3. Update agent state and task queue with a docs-only low-risk task record.
4. Write redacted evidence and adversarial audit.
5. Run scoped formatting, lint, typecheck, diff checks, and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, and confirm clean/aligned.

## Risk Defenses

- Treat “credential exists in a private file” and “role can create a usable session in the current 0704 app DB” as separate states.
- Block business acceptance if readiness preflight fails for any in-scope role.
- Keep the private index as a pointer to canonical private credential files instead of duplicating passwords into more places.
- Evidence records only role labels, source-file categories, and readiness-state categories.
