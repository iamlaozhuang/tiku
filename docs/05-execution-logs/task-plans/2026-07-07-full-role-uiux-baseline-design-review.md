# Task plan: full-role UI/UX baseline and design-board review

Date: 2026-07-07

## Task

Execute the approved four-item review for the converged full-role UI/UX baselines and the repository-external local
design board:

1. baseline consistency;
2. design-board usability;
3. boundary safety;
4. implementation feasibility and slicing.

## Required Reads

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- Product Design audit workflow, critical overrides, user-context preflight, and design-audit framework
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- Current AI generation, UI/UX, `redeem_code`, role/auth/training/ops traceability overlays
- Six full-role UI/UX batch baseline documents from 2026-07-07
- Repository-external local design board files under
  `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`
- Current admin shell, learner shell, design token, and layout primitive source entry files for grounding only

## Scope

Allowed:

- Add the task plan, requirement traceability review, evidence, and adversarial audit review.
- Update `project-state.yaml` and `task-queue.yaml`.
- Read existing repository-external design board artifacts.
- Record only redacted role/page labels, counts, file paths, command names, and pass/fail summaries.

Blocked:

- Code changes under `src/**`.
- New screenshots or screenshot copying.
- DB reads or writes.
- Provider calls.
- Account, fixture, content, seed, schema, migration, env, package, lockfile, dependency, staging/prod/deploy,
  release-readiness, production-usability, or Cost Calibration work.
- Recording credentials, sessions, cookies, tokens, environment values, DB URL, raw DB rows, internal ids, Provider
  payload, raw prompt, raw AI output, plaintext `redeem_code`, private fixture values, or full question, paper,
  material, resource, screenshot, DOM, or employee-answer content.

## Review Method

1. Confirm the branch starts from current `origin/master`.
2. Re-read governance, requirements, batch baselines, design board files, and source entry points.
3. Review four axes:
   - baseline consistency across batches 0-5 and the board;
   - board usability as a planning and decision artifact;
   - authorization, edition, AI, content lifecycle, and redaction boundary safety;
   - implementation branch slicing that reduces regression risk.
4. Write docs-only conclusions and residual risks.
5. Validate formatting, redaction, artifact existence/counts, Module Run v2 hardening, lint, and typecheck.
6. Close out through the approved low-risk docs-only path if validation passes.

## Risk Controls

- Treat the design board as a planning artifact, not a pixel-perfect implementation spec.
- Do not reopen AI generation historical gaps without fresh current-baseline evidence.
- Keep `redeem_code` plaintext product UI exception intact while preserving evidence/log/doc redaction.
- Keep UI visibility separate from runtime authorization enforcement.
- Future source work must be split into independent short branches and must first locate root cause before changing code.
