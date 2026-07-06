# 2026-07-06 Non-terminal Queue Triage Plan

## Scope

- Task ID: `non-terminal-queue-triage-2026-07-06`
- Branch: `codex/non-terminal-queue-triage-2026-07-06`
- Goal: triage the remaining active-queue non-terminal items after active queue slimming and close only items with later evidence that clearly supersedes the old blocked or ready-for-closeout state.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- Current and successor evidence/audit files for the six non-terminal queue items.

## Plan

1. Count current non-terminal queue items and identify their current evidence/audit paths.
2. For each blocked or ready-for-closeout item, verify whether a later closed task proves supersession or merge/push closeout.
3. Close only items with clear successor evidence; preserve the original blocked result through `supersededBy` and `closedByTask` metadata.
4. Keep the staging/pre-release item blocked because the missing isolated staging target remains a real high-risk gate.
5. Repair the staging item evidence/audit navigation path to the existing redacted blocked evidence, without changing its blocked semantics.
6. Update the advisory triage register with current counts and decisions.
7. Validate formatting, queue diagnostics, lint/typecheck, and Module Run v2 gates before commit, merge, push, and branch cleanup.

## Boundaries

- No product source, test source, schema, migration, dependency, lockfile, DB, Provider, env/secret, browser, staging/prod, deploy, payment, or Cost Calibration execution.
- No evidence deletion and no raw sensitive evidence.
- No release readiness, final Pass, production usability, or staging readiness claim.
