# Task plan: full-role UI/UX batch 5 content admin and cross-role closure

Date: 2026-07-07

## Task

Prepare a docs-only UI/UX remediation baseline for `content_admin` and the content workspace reachable by
`super_admin`, then close cross-role terminology, menu, copy, and state consistency for the six-batch series.

## Required Reads

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- UI/UX and advanced-edition requirement traces
- Prior full-role UI/UX baselines, especially batches 0 through 4
- Repository-external content-admin and super-admin contact sheets
- Content workspace source entry files for structure only

## Scope

Allowed:

- Create the batch 5 task plan, requirement alignment, evidence, and adversarial audit review.
- Update project state and task queue for this docs-only task.
- Record redacted role labels, page labels, counts, safe UI observations, command status, and candidate remediation
  guidance.

Blocked:

- Code changes.
- DB reads or writes beyond already captured screenshot evidence.
- Account, fixture, content, seed, migration, schema, env, package, lockfile, dependency, Provider, staging, production,
  deployment, release-readiness, production-usability, or Cost Calibration work.
- Recording credentials, session, cookie, token, environment values, DB URL, raw DB rows, internal ids, Provider payload,
  raw prompt, raw AI output, plaintext `redeem_code`, private fixture values, or full question, paper, material, or
  resource content.

## Method

1. Confirm the batch 5 branch is isolated from `master`.
2. Re-read the mechanism, requirements, prior baselines, screenshots, and relevant content source entry files.
3. Build the content-admin and super-admin content-workspace baseline from first principles:
   - content lifecycle must be draft/review/publish oriented;
   - AI output must enter editable draft/review loops, not direct formal content;
   - AI paper generation must align to plan-and-select semantics;
   - resource and knowledge workflows must show pipeline states;
   - super-admin visibility must not weaken content-admin constraints.
4. Run two explicit self-review passes:
   - pass 1: completeness and cross-role consistency;
   - pass 2: redaction, authority boundaries, and no-regression check.
5. Run scoped formatting, diff, redaction, Module Run v2, lint, and typecheck validation.
6. Commit, fast-forward merge to `master`, run closeout validation, push, and clean the short branch.

## Risk Controls

- Treat all screenshot text as private observation input; do not transcribe full business content.
- Preserve the user-approved plaintext `redeem_code` product behavior from earlier batches; this batch does not revisit
  it.
- Do not classify screenshot observations as fixed source defects.
- Any future implementation must first locate root cause on an independent short fix branch.
