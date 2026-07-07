# Task plan: full-role UI/UX local design board materialization

Date: 2026-07-07

## Task

Materialize a repository-external local design board after the six full-role UI/UX baseline batches have converged.

## Required Reads

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- Product Design audit workflow instructions and design-audit framework
- The six full-role UI/UX baseline documents
- Repository-external contact sheets for all captured role groups
- Current shell, token, and layout source entry files for grounding only

## Design Brief

Create a static, repository-external, redacted local design board that helps decision-making for the next implementation
phase. The board should:

- summarize the global page structure;
- make the shared AI five-zone model visible;
- show backend and learner layout directions;
- show content lifecycle states;
- provide a sanitized 68-page matrix;
- avoid embedding original screenshots or sensitive business content.

## Scope

Allowed:

- Create local files under `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`.
- Create the task plan, requirement alignment, evidence, and adversarial audit review.
- Update project state and task queue for this docs-plus-local-artifact task.
- Record redacted file names, counts, command statuses, and artifact paths.

Blocked:

- Code changes under `src/**`.
- DB reads or writes.
- Provider calls.
- Account, fixture, content, seed, migration, schema, env, package, lockfile, dependency, staging, production, deployment,
  release-readiness, production-usability, or Cost Calibration work.
- Recording credentials, session, cookie, token, environment values, DB URL, raw DB rows, internal ids, Provider payload,
  raw prompt, raw AI output, plaintext `redeem_code`, private fixture values, or full question, paper, material, or
  resource content.

## Method

1. Work on a short branch separate from `master`.
2. Re-read mechanism, requirements, baselines, screenshots, and layout sources.
3. Create a static local board:
   - `index.html`;
   - `page-matrix.html`;
   - `README.md`;
   - `manifest.redacted.json`.
4. Run two extra self-review passes:
   - pass 1: artifact completeness, coverage, and page-count check;
   - pass 2: redaction, no-screenshot-embedding, and no-business-content transcription check.
5. Run local artifact validation, scoped doc formatting, diff, redaction, Module Run v2, lint, and typecheck validation.
6. Commit, fast-forward merge to `master`, run closeout validation, push, and clean the short branch.

## Risk Controls

- The local board uses schematic UI and sanitized page labels only.
- Original screenshots remain in the private screenshot directory and are not copied into the design board.
- No implementation readiness or runtime pass is claimed.
- Future code work must be split into independent short branches and validate role/authorization boundaries before merging.
