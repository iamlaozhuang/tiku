# Phase 57 Docs Slimming Readonly Inventory Evidence

## Scope

This evidence records a docs-only, read-only inventory for project document slimming and archive preparation. It identifies recovery bottlenecks, archive candidates, slimming candidates, source-of-truth documents, and recommended follow-up tasks.

This task did not move, delete, archive, rename, or rewrite existing source documents. It did not approve product code, code-stage queue seeding, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work.

## Source Documents Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-56-advanced-edition-coverage-audit.md`

## Inventory Verdict

Verdict: document slimming is necessary before code-stage work, but execution should be split into separate approved docs-only tasks.

The largest current friction is not advanced edition requirements themselves. The biggest recovery bottleneck is historical execution material, especially `docs/04-agent-system/state/task-queue.yaml` and the high-volume task plan/evidence/audit review directories. Source-of-truth requirement and architecture documents should remain stable until an approved slimming task creates replacement indexes and verifies references.

This means document cleanup should happen before product implementation, not during code implementation. Code implementation tasks should only do task-local documentation maintenance.

## Inventory Snapshot

| Area                                                                         | Observed Count Or Size                     | Interpretation                                                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Total files under `docs/`                                                    | 1197 files                                 | The document corpus is large enough to slow manual recovery and broad context loading.             |
| `docs/05-execution-logs/evidence/`                                           | 474 files                                  | Historical evidence is useful but too large for default recovery reads.                            |
| `docs/05-execution-logs/task-plans/`                                         | 458 files after this task plan was created | Task plans need index-based lookup rather than broad reading.                                      |
| `docs/05-execution-logs/audits-reviews/`                                     | 153 files                                  | Review evidence should be retained but grouped by phase/month.                                     |
| `docs/04-agent-system/state/task-queue.yaml`                                 | about 974 KB and 19473 lines               | Active queue has become a historical ledger and should be archived/indexed.                        |
| `task-queue.yaml` task ids                                                   | 477 task entries                           | Every queue task currently appears terminal, so there is no active pending list in the queue file. |
| `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md` | about 81 KB and 684 lines                  | Large source document; do not slim until source-of-truth replacement rules are approved.           |

## Directory Pressure Map

| Directory                                    | Role                                                       | Pressure      | Recommended Treatment                                                        |
| -------------------------------------------- | ---------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `docs/04-agent-system/state/task-queue.yaml` | Active task queue and recovery registry                    | high          | Execute a queue archive/index task first.                                    |
| `docs/05-execution-logs/evidence/`           | Historical validation evidence                             | high          | Add monthly or phase index before moving any files.                          |
| `docs/05-execution-logs/task-plans/`         | Historical execution plans                                 | high          | Add index and archive strategy; do not load broadly by default.              |
| `docs/05-execution-logs/audits-reviews/`     | Historical reviews and audits                              | medium        | Keep paired with evidence through index entries.                             |
| `docs/superpowers/specs/`                    | Source specs and decision inputs                           | medium        | Preserve as source-of-truth unless superseded by a reviewed index.           |
| `docs/superpowers/plans/`                    | Detailed implementation planning and source-of-truth index | medium        | Keep advanced edition plans intact before code-stage seeding.                |
| `docs/01-requirements/`                      | Standard and advanced requirement reading surfaces         | medium        | Keep stable; only slim with traceability matrix and source reference checks. |
| `docs/02-architecture/`                      | ADRs and architecture contracts                            | low to medium | Do not slim without a specific architecture review task.                     |
| `docs/03-standards/`                         | Normative standards and glossary                           | low           | Do not slim except for encoding or direct contradiction fixes.               |
| `docs/04-agent-system/sop/`                  | Mechanism rules                                            | medium        | Consider an index only after queue archive is complete.                      |

## Archive Candidate Register

| Candidate                                        | Reason                                                                                                                             | Execution Boundary                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Terminal historical entries in `task-queue.yaml` | Active queue should contain current, pending, blocked, retrying, and recent recovery window tasks, not all 477 historical entries. | Separate archive execution task using `task-queue-archival-and-index-governance.md`. |
| Old execution logs from May 2026                 | 656 execution-log files from May were identified by filename pattern.                                                              | Separate evidence/task-plan/audit index task; do not move without exact file list.   |
| No-date `phase-*` execution evidence             | 53 execution-log files use older no-date naming.                                                                                   | Separate normalization or archive task; preserve content and add index references.   |
| Historical phase closeout plans and evidence     | Useful for audit history but not for default recovery.                                                                             | Archive by month or phase after index design approval.                               |

## Slimming Candidate Register

| Candidate                                                                    | Reason                                                                       | Safe First Step                                                                                                               |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `docs/05-execution-logs/*` reading surface                                   | The folders are valuable but too large for routine recovery.                 | Build a lightweight execution-log index with task id, phase, evidence path, audit review path, and commit SHA when available. |
| `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md` | Large original advanced edition decision document.                           | Keep as source; create a concise derivative map only if source-of-truth rules are updated.                                    |
| `docs/superpowers/plans/2026-06-06-advanced-edition-*implementation-plan.md` | Seven detailed plans are long but currently needed for future queue seeding. | Do not slim before code-stage queue seeding approval; use source-of-truth index to control reading order.                     |
| `docs/02-architecture/interfaces/*`                                          | Several contracts are large and phase-specific.                              | Create an architecture contract index before any archive decision.                                                            |
| `docs/04-agent-system/sop/*`                                                 | SOP count is now 25.                                                         | Create an SOP index or decision map after queue archive execution.                                                            |

## Do Not Touch Register

These documents should not be moved, deleted, or slimmed in the next execution task unless that task explicitly approves their treatment:

- `AGENTS.md`
- `docs/03-standards/glossary.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- The seven advanced edition detailed implementation plans.

## Recommended Execution Sequence

1. Task queue archive execution plan and execution: move old terminal task entries out of active `task-queue.yaml`, create or update `task-history-index.yaml`, and keep enough recent recovery context.
2. Execution-log archive/index governance: define how task plans, evidence, and audit reviews are indexed before moving any files.
3. Execution-log archive execution: archive older month/phase execution logs only after exact file lists are approved.
4. Source-of-truth index tightening: ensure advanced edition requirements, standard edition requirements, ADRs, SOPs, and implementation plans have a minimal read order.
5. Core document slimming review: only after the indexes exist, review whether any large source document can be summarized into a derivative index while preserving the original.

## Blocked Gates

- Cost Calibration Gate remains blocked.
- Provider cost measurement and real provider calls remain blocked.
- env/secret work remains blocked.
- staging/prod/cloud/deploy work remains blocked.
- payment and external-service work remain blocked.
- Code-stage queue seeding remains blocked pending explicit approval.
- Product implementation remains unapproved.
- Document moving/deletion/archive execution remains unapproved by this readonly inventory.

## Validation Commands

### Initial Validation

- `git diff --check`: PASS.
- `node .\node_modules\prettier\bin\prettier.cjs --check ...`: FAIL before formatting; three new Markdown files required Prettier wrapping.
- Required heading and terminology `Select-String`: PASS.
- Added-line blocked term scan for non-project terms: PASS, no matches.
- `automation.mode` check for `semi_auto`: PASS.

### Remediation

- Ran `node .\node_modules\prettier\bin\prettier.cjs --write` for the three new phase-57 Markdown files.

### Final Validation

- `git diff --check`: PASS.
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-57-docs-slimming-readonly-inventory.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-57-docs-slimming-readonly-inventory.md docs\05-execution-logs\evidence\2026-06-07-phase-57-docs-slimming-readonly-inventory.md`: PASS, all matched files use Prettier code style.
- `Select-String` required headings and terms: PASS for Inventory Verdict, Inventory Snapshot, Directory Pressure Map, Archive Candidate Register, Slimming Candidate Register, Do Not Touch Register, Recommended Execution Sequence, Blocked Gates, Cost Calibration Gate remains blocked, `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.
- Added-line blocked term scan for non-project terms: PASS, no matches.
- `Select-String -Path docs\04-agent-system\state\project-state.yaml -Pattern 'mode: semi_auto'`: PASS.
- `git status --short --branch`: PASS, changed files are limited to phase-57 allowed files.

## Closeout Status

Ready for commit, merge, push, and short-lived branch cleanup under the user's standing approval for this docs-only serial batch.
