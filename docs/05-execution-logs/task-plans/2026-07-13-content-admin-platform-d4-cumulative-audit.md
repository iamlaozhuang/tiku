# Content Admin Platform D4 Cumulative Audit Plan

Date: 2026-07-13

Task: `content-admin-platform-d4-cumulative-audit-2026-07-13`

Branch: `codex/content-admin-platform-d4-cumulative-audit`

Profile: R2 / fixed full-regression node / `independent_audit`

Baseline: `master == origin/master == 30fbe7d49e3bd3da7b370170d554f0a5b3a76f5e`

## Goal

Audit the exact D0-D3 Batch D delta and prove cumulative question/material list request, URL, pagination, refresh and
return behavior without introducing product changes.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md` and `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`, relevant admin/question/material requirements and full-role traceability.
- B–F plan, standing authorization, D0-D3 plans/evidence/audits, B1-B5 closeout, Lean Module Run v3, cumulative SOP,
  closeout SOP and PIC ledger.

## Audit And Validation

1. Reconcile the exact `B5..D3` and D0-D3 commit/diff chain against ownership, tests and protected domains.
2. Attack expected-failure removal, request-state races, URL restoration loops, pagination drift, focus/scroll fallback,
   lifecycle/lock regression, duplicate frameworks and scope expansion.
3. Run the fixed full node serially: all unit tests, lint, typecheck, full format check and production build. The worktree
   dependency junction limitation may require the authoritative build in the clean root checkout at the exact product
   commit; record that condition without changing product code.
4. Run guards, record PIC status, complete two adversarial rounds, then close out with one governance commit.

No deployment, dependency, database, Provider, authorization or product-runtime change is permitted. C0 starts after
ff-only merge, push, equality verification and cleanup.
