# Task plan: full-role UI/UX source implementation entry freeze

Date: 2026-07-07

## Task

Freeze the completed full-role UI/UX baseline and local design board as the required source-implementation entry for
later UI/UX code branches.

This task answers how later source work must truthfully cite and apply:

- the all-role UI remediation summary;
- the six role or flow UI/UX batch baselines;
- the repository-external local design board;
- the four-item baseline and design-board review.

## Required Reads

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/03-standards/ui-code.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- current AI generation, UI/UX, `redeem_code`, role/auth/training/ops traceability overlays
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- the six 2026-07-07 full-role UI/UX batch baseline documents
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- repository-external local design board files under
  `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`
- current admin shell, learner shell, global token CSS, and admin layout primitive source entry files for grounding only

## Scope

Allowed:

- Add a traceability entry that defines the required UI/UX implementation reading order and per-branch citation rules.
- Update the root and advanced requirement indexes so future source tasks find the entry first.
- Add this task plan, redacted evidence, and adversarial audit review.
- Update `project-state.yaml` and `task-queue.yaml`.

Blocked:

- Product source edits under `src/**`.
- Tests, browser runtime, screenshots, DOM capture, DB reads/writes, Provider calls, account/fixture/content mutation.
- Schema, migration, seed, env, package, lockfile, dependency, staging/prod/deploy, release-readiness, production-usability,
  final Pass, or Cost Calibration work.
- Recording credentials, sessions, cookies, tokens, environment values, DB URL, raw DB rows, internal ids, Provider
  payloads, raw prompt, raw AI output, plaintext `redeem_code`, private fixture values, full question, full paper, full
  material, raw resource content, screenshot pixels, raw DOM, or raw employee answers.

## Implementation Method

1. Verify the working branch was created from current `master` and only docs/state files are edited.
2. Re-read the required requirement and UI/UX baseline chain before writing.
3. Create a single traceability entry that:
   - names the authoritative source order;
   - requires later source branches to cite exact baseline items;
   - requires out-of-scope and deferred items to be declared explicitly;
   - preserves role, authorization, edition, AI, content lifecycle, and redaction boundaries;
   - records the recommended implementation slicing without treating it as source completion.
4. Update the requirement indexes so the entry becomes discoverable from the requirement SSOT path.
5. Write redacted evidence and adversarial audit review.
6. Run scoped formatting, redaction, Module Run v2, lint, and typecheck validation.
7. Commit, fast-forward merge to `master`, push with the approved current user closeout, clean the short branch, then
   reread the changed docs and recheck consistency.

## Risk Controls

- The entry must not duplicate or silently rewrite the baseline docs; it must point to them and define how to use them.
- UI visibility remains discovery only; service-side authorization remains the runtime boundary.
- The eligible operations plaintext `redeem_code` product UI exception is preserved, while evidence/log/doc redaction
  remains strict.
- AI组卷 remains the 2026-07-06 plan-and-select contract; no source task may claim completion without separate evidence.
- Future implementation branches must be smaller than the full UI/UX program and must first locate root cause before
  code changes.
