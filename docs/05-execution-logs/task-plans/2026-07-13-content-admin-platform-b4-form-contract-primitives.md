# Content Admin Platform B4 Form Contract Primitives Plan

Date: 2026-07-13

Task: `content-admin-platform-b4-form-contract-primitives-2026-07-13`

Branch: `codex/content-admin-platform-b4-form-contract-primitives`

Profile: R2 / `independent_audit`

Baseline: `master == origin/master == 779b856c2f09490fe8ed3b7be3084ab3902eccbf`

## Goal

Extract the narrow form contract already proven by question/material integrity rules: reusable field-error lookup and
summary, deterministic first-invalid focus, an explicitly associated disabled reason, and a caller-owned dirty-state
interface. Apply it to both question and material create/edit forms without introducing a universal form framework or
changing business validation.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md` plus question/paper and admin/operations requirements and stories.
- Advanced-edition index and the full-role source implementation entry plus the current content/PIC baseline chain.
- PIC contract P0-03/P0-11/P0-13 and PIC-05/PIC-06/PIC-07/PIC-09/PIC-10.
- B–F serial plan, standing authorization, B0 map, B1-B3 evidence/audits, PIC ledger, Lean Module Run v3, and closeout SOP.
- `content-integrity`, question/material forms and focused tests, Button semantics, and current list/editor ownership split.

## Baseline Application

- Exact items: shared create/edit validation, local field errors, top summary, first invalid focus, duplicate-submit
  disabled reason, and a dirty-state interface that C routes can consume.
- Affected surfaces: the current content-admin/super-admin question and material forms only. Both modes continue using
  the same form component and `getQuestionIntegrityIssues` / `getMaterialIntegrityIssues` source.
- Deferred: dedicated editor routes, dirty-leave prompts, refresh/return behavior, lock/copy route design, and broad
  page-family rollout remain C/E work. B5 owns cumulative Batch B regression.
- AI, Provider, edition, authorization, organization, phone, `redeem_code`, database, API, and content lifecycle remain
  outside this task.

## Design

1. Add a pure `admin-form-contract` module for first-error lookup, deterministic focus-field selection, and dirty-state
   resolution from caller-provided fingerprints. The helper owns no form library, schema, serializer, router, or browser
   leave behavior.
2. Add a small `AdminFormFeedback` presentation primitive for the accessible summary, field error, and disabled reason.
3. Replace the two local copies in question/material forms, focus the first available invalid field through the shared
   contract, expose clean/dirty state as a stable data contract, and explicitly associate the disabled save button with
   its visible in-progress reason.
4. Keep create/edit validation functions and mutation behavior unchanged; use the same primitives for both resources.

## Risk Defenses

- The business issue order remains authoritative; missing or non-focusable fields fall forward to the next issue.
- Field messages and summaries render fixed client validation copy only; server diagnostics remain excluded.
- Dirty state compares caller-owned fingerprints, avoiding a hidden universal deep-equality or serialization policy.
- Submit remains enabled before validation and disabled only in flight; no new validation drift or premature blocker.
- No route, navigation prompt, API, authorization, lifecycle, AI, dependency, build configuration, or database change.

## Allowed Changes

- `src/lib/admin-form-contract.ts` and focused test.
- `src/components/admin/AdminFormFeedback/**`.
- Question/material client and focused unit test.
- Active state/history, B4 plan/evidence/audit, and PIC coverage ledger declared by the queue.

## Validation

- TDD RED/GREEN for field lookup, focus fallback, clean/dirty fingerprints, summary and field-error accessibility,
  disabled-reason association, same-source create/edit validation, and question/material consumption.
- Focused regression includes the new contract, feedback primitive, `content-integrity`, and question/material UI; then
  serial lint, typecheck, changed-file Prettier, diff check, recovery/Program Guards, and Module Run closeout gates.
- Build/full regression are impact-triggered. B4 changes a narrow presentation contract and existing local consumer,
  without shared request runtime, core API, authorization, AI, dependency, build, or test-infrastructure changes. B5 is
  the immediately following fixed full node.

## Adversarial Review

- Round 1: validation-source identity, issue ordering, focus fallback, aria association, duplicate prevention, input
  preservation, dirty-state correctness, and contract/source alignment.
- Round 2: hidden validation drift, inaccessible disabled state, selector injection, stale baseline, raw diagnostic
  leakage, route/privilege expansion, generic-framework over-design, and false PIC closure.

Closeout is one principal commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check and
short branch/worktree cleanup; B5 starts automatically.
