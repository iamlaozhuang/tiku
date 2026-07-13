# Content Admin Platform B5 Cumulative Audit Plan

Date: 2026-07-13

Task: `content-admin-platform-b5-cumulative-audit-2026-07-13`

Branch: `codex/content-admin-platform-b5-cumulative-audit`

Profile: R2 / `independent_audit`

Batch baseline: `f29b2c382fed36bd9d493d2c83212479c2f021d3`

Current baseline: `master == origin/master == 206344b320d2754c6f51445d6eff5a4390a875b9`

## Goal

Audit the complete B0-B4 net diff and PIC ledger from the post-M2 baseline, reject duplicated or over-generalized
abstractions, verify protected boundaries and evidence consistency, and execute the first fixed cumulative full node. B5
does not claim route-family completion owned by D/C/E/F.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md` plus question/paper and admin/operations requirements and stories.
- Advanced-edition index and full-role source implementation entry plus the current content/PIC baseline chain.
- Content Admin P0/PIC contract, B–F serial plan, standing authorization, and PIC coverage/exception ledger.
- B0-B4 plans, evidence and audits; the complete `f29b2c3..206344b3` source/test/document diff; affected shared
  primitives, consumers, focused tests, and comparable pre-existing abstractions.
- Lean Module Run v3, Module Run closeout, cumulative-audit, archive, and Git closeout SOPs.

## Audit Scope

1. Reconcile B0-B4 task claims, source changes, tests, PIC statuses, protected boundaries, and exception ledger.
2. Review the Batch B net diff for duplicated semantics, leaky cross-domain coupling, hidden universal frameworks,
   unstable state ownership, accessibility regressions, unsafe diagnostics, and unjustified PIC closure.
3. Run the fixed cumulative gates serially: full unit suite, lint, typecheck, full format check, production build, diff
   check, recovery/Program Guards, and Module Run closeout gates.
4. Repair only a blocking Batch B finding within the materialized allowlist, then rerun affected and cumulative gates.
   Independent issues remain queued without contaminating this commit.

## Baseline Application

- B1 owns shared async-state semantics; B2 owns list-query/debounce/latest-intent/filter-chip semantics; B3 owns Detail
  Drawer focus, Toast, and returned-object updates; B4 owns the narrow form feedback/dirty interface.
- B5 verifies those seams compose without merging request, mutation, form, route, authorization, AI, or lifecycle state
  into one framework.
- PIC-02 through PIC-10 remain partial where D/C/E/F still own consumer and acceptance proof. PIC-01/PIC-09/PIC-12/
  PIC-13 are not promoted by this audit.
- No browser, database, Provider, dependency, schema, authorization, edition, content lifecycle, deployment, PR, or force
  push action is authorized or required.

## Risk Defenses

- Audit claims are derived from the exact Batch baseline/current commit pair and repository evidence, not chat memory.
- Full gates run serially to avoid resource-contention false failures; build follows test/lint/typecheck/format.
- The audit does not rewrite B0 historical observations or closed evidence; cumulative conclusions reference them.
- A01-A30 and superseded AI findings remain closed absent fresh current-baseline failures.
- Any blocking repair stays inside Batch B ownership and receives both focused and cumulative revalidation.

## Validation

- `npm.cmd run test:unit`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `npm.cmd run format:check`.
- `npm.cmd run build`.
- `git diff --check`, recovery/Program Guards, and Module Run pre-commit/closeout/pre-push gates.

## Adversarial Review

- Round 1: net-diff correctness, test/evidence traceability, data integrity, accessible contracts, consumer composition,
  PIC accounting, and full-gate results.
- Round 2: regression, hidden coupling, duplicate/over-generalized abstractions, exceptional paths, diagnostic leakage,
  authorization/lifecycle/AI scope creep, stale historical reopening, and false cumulative closure.

Closeout is one audit/state commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check and
short branch/worktree cleanup; D0 starts automatically.
