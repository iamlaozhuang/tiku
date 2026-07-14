# Content Admin Platform E0 Route-Family Inventory Plan

Task: `content-admin-platform-e0-route-family-inventory-2026-07-13`

Branch: `codex/content-admin-platform-e0-route-family-inventory`

Profile: R0 / `evidence_two_rounds`

Baseline: `3572f1954680b7894354f212d7e71c8ba779d152`

## Goal

Build one exact, reviewable inventory that assigns every current production route/page family to E1-E5, its source
entry, focused test ownership, applicable PIC status, protected boundary, risk and validation method. E0 changes no
product runtime or product test source and does not promote any PIC status.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md` and `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`, the serial plan, standing authorization, PIC ledger, Program Init/Module
  Run/closeout/archive SSOTs and the latest C6 plan/evidence/audit.
- Requirement indexes; standard modules/stories; advanced edition index, edition-aware authorization requirements,
  relevant advanced modules/stories and ADR-007.
- Current role/auth/training/operations decision package and reconciliation ledger (`CT-REQ-001` through
  `CT-REQ-060`); AI-generation SSOT, current acceptance normalization and goal-completion audit; phone/history decision.
- Full-role UI/UX source-entry, Batch 0-5 baselines, local design-board manifest/page matrix, and the current content
  admin P0/PIC contract.
- Every `src/app/**/page.tsx` route entry, admin/student layouts and the route-level source/test ownership discovered
  from the current tree. Deeper feature implementation remains owned by E1-E5 and must be read in full by its owning
  source task before modification.

## Method And Boundaries

1. Treat the route as the unit of user reachability and the feature component/service tests as its proof roots; do not
   infer compliance merely from a file or historical screenshot existing.
2. Record exact production routes once in E0 evidence. Group role-specific design-board views only when they resolve to
   the same route and explicitly retain the role matrix.
3. Assign content to E1, operations to E2, organization admin to E3, learner/auth to E4, and shared shell/root/
   cross-workspace aliases or residual exceptions to E5. Keep E6 as cumulative proof only.
4. Mark observed gaps as candidates, not approved exceptions. A route can be `compliant` only where the PIC ledger
   already has current Program proof; otherwise retain `partial` or `accepted_baseline`.
5. Protect A01-A30, formal-content separation, authorization/edition, organization scope/training, phone,
   `redeem_code`, audit redaction, historical `paperAssembly`, Provider-closed and deployment boundaries. X1/X2 remain
   untriggered absent their exact evidence.
6. Run only R0 governance/link/format/diff gates. No product unit suite, build, database, credential, Provider, browser,
   deployment, dependency, schema, PR or force-push action is authorized.

## Adversarial Review And Closeout

- Round 1 attacks omission, route-to-source/test mismatch, PIC overclaim and requirement/contract mismatch.
- Round 2 attacks role aliasing, direct-URL bypass ownership, cross-workspace privilege expansion, hidden exception,
  stale/superseded requirements and over-broad E1-E5 scopes.
- Record both rounds in the evidence, update only active governance pointers and the PIC ledger reference, then run
  scoped format, links, diff, recovery/serial Guards and Module Run closeout gates.
- Close with one commit, ff-only merge to `master`, push `origin/master`, exact remote equality and safe branch/worktree
  cleanup. Start E1 automatically; deployment remains blocked.
