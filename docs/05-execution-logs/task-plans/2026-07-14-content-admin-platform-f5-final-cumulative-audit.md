# Content Admin Platform F5 Final Cumulative Audit Plan

Date: 2026-07-14

Task: `content-admin-platform-f5-final-cumulative-audit-2026-07-13`

Branch: `codex/content-admin-platform-f5-final-cumulative-audit`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 20e396334ee0255ebadba0f385c383a38e9e472b`

## Goal

Close the complete M1/M2 and B0-F5 serial Program with one cumulative source/evidence/PIC reconciliation, the fixed F5
full-quality node, two adversarial reviews and terminal Git closeout. The final state must be independently recoverable
as a closed Program with no canonical next task, no approved PIC exception, no deployment and no reopening of closed
A01-A30 or superseded AI findings.

## SSOT Read List

- `AGENTS.md`.
- `docs/04-agent-system/state/project-state.yaml` and `docs/04-agent-system/state/task-queue.yaml` plus the active-state
  history index.
- `docs/03-standards/code-taste-ten-commandments.md` and every current decision under
  `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`, `docs/01-requirements/advanced-edition/00-index.md`,
  `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and
  `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`,
  `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md` and
  `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`.
- Canonical B-F serial plan, standing authorization and PIC/exception ledger.
- Program Init and M1/M2 plan/evidence/audit; Module Run v3, closeout, archive and terminal-state mechanism SSOT/SOP.
- B5, D4, C6 and E6 cumulative evidence/audits plus F0-F4 readiness/role-acceptance evidence/audits.
- Exact Program commit/diff history, fixed/full and impact-triggered regression records, current Guard/recovery scripts
  and their smoke tests.

Later traceability and closed baseline evidence supersede older partial observations. Stable requirement conflicts stop
the task; Git-derived SHA/clean facts are verified at handoff rather than creating a closeout-noise commit.

## Execution

1. Claim only F5 after materializing F4 closeout; set the canonical next task to empty and keep one terminal active
   record while the Program remains in progress.
2. RED-test and repair the recovery surface so it accepts exactly one well-formed terminal F5 record with an empty next
   task in the in-progress, ready-for-closeout and closed lifecycle states, while continuing to reject an empty-next
   non-terminal task, extra task, deployment authorization or inconsistent Program closure.
3. Reconcile every Program task, commit, evidence/audit and closeout checkpoint; enumerate the five fixed full nodes and
   every legitimate impact-triggered extra full run.
4. Promote PIC-01 through PIC-13 only where cumulative implementation plus representative acceptance is complete. Any
   unresolved item must have an approved exception or block final closure; current expectation is zero exceptions.
5. Run the fixed F5 full unit suite serially, then lint, typecheck, full format check and production build. Re-run focused
   recovery/Program Guard positive and negative smoke, diff and Module Run gates.
6. Complete two independent adversarial reviews: first for requirements/data/contract integrity; second for regression,
   privilege, exception paths, cross-page consistency, mechanism terminal safety and over-design.
7. Commit the terminal declaration, ff-only merge, ordinary push, verify local/origin/remote equality, remove the F5
   worktree/branch and confirm a clean root. Mark the goal complete only after these external facts pass.

## Boundary Guards

- F5 changes no product feature unless a current reproducible failure is found. Governance terminal support is narrow to
  the final canonical task and must have positive/negative smoke coverage.
- Authorization, edition, organization scope, enterprise training, phone, `redeem_code`, audit redaction, personal AI,
  historical `paperAssembly`, formal content and Provider-closed boundaries remain unchanged.
- Full tests/build are validation, not deployment. Staging/production/deployment still require fresh approval.
- Credentials, sessions, cookies, tokens, DB URLs, environment values, rows, identifiers, answers and private content do
  not enter versioned evidence.
- The F4 private credential-catalog drift becomes one deferred external maintenance candidate, not an active Program
  task, PIC exception or authorization to edit repository-external data.

## Expected Changes

- Active Program state/queue/history pointers and the PIC/exception ledger.
- F5 plan, evidence and independent audit.
- Terminal-aware recovery script and smoke only if RED proves the current final-state gap.

## Validation And Review

- Fixed full unit, lint, typecheck, full-repository format and production build.
- Recovery surface and Program Guard smoke/positive paths, including terminal positive and terminal misuse negatives.
- Program commit/evidence/PIC/link/diff reconciliation and Module Run pre-commit/closeout/pre-push gates.
- Round 1 attacks omitted tasks, false completion, data/contract/authorization drift and incomplete evidence.
- Round 2 attacks terminal-state bypass, regression, privilege escalation, exception laundering, stale failure reopening,
  sensitive retention, cleanup claims and over-design.

No deployment.
