# Phase 52 Docs Auto Candidate Mode Transition Proposal Task Plan

## Task

- Task id: `phase-52-docs-auto-candidate-mode-transition-proposal`
- Branch: `codex/phase-52-docs-auto-candidate-mode-transition-proposal`
- Task kind: `docs_only`
- Current mode: `semi_auto`
- Proposed target label: `docs_auto_candidate`
- Mode change in this task: no

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/codex-app-readiness-audit-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-50-automation-readiness-scorecard.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-51-browser-bridge-readiness-recheck.md`

## Scope

Create a dedicated docs-only proposal that explains whether Tiku is ready to request explicit human approval for moving from `semi_auto` to `docs_auto_candidate`.

The proposal must:

- use phase-50 scorecard evidence;
- use phase-51 Browser bridge recheck evidence;
- define allowed task kinds for the proposed mode;
- define forbidden task kinds and blocked gates;
- state that `automation.mode` is not changed in this task;
- keep Cost Calibration Gate blocked;
- preserve project terms: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md`

## Blocked Scope

This task must not change:

- product code, product tests, e2e tests, UI, API, service, repository, mapper, validator, schema, migration, or database files;
- scripts, packages, lockfiles, dependencies, CLIs, SDKs, or test frameworks;
- Codex configuration, skill installation, plugin installation, connector installation, session history, or cache files;
- `.env.local`, `.env.example`, secrets, tokens, database URLs, or Authorization headers;
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate behavior;
- `automation.mode`.

## Approach

1. Record a proposal verdict instead of mutating `automation.mode`.
2. Carry forward phase-50 `ready_for_docs_auto_proposal`.
3. Carry forward phase-51 Browser bridge readiness pass, but keep browser-dependent task execution subject to task-specific approval.
4. Define a narrow `docs_auto_candidate` boundary limited to `read_only`, `docs_only`, blocked gate documentation, and approved docs-only closeout actions.
5. Add the task entry to `task-queue.yaml` and synchronize `project-state.yaml` as the current docs-only task.
6. Validate formatting, required sections, blocked gate wording, required project terms, and prohibited terminology.

## Risk Defenses

- Do not write `automation.mode: docs_auto_candidate`.
- Treat the proposal as an approval request, not an approval record.
- Keep code-stage queue seeding unapproved.
- Keep product implementation unapproved.
- Keep Cost Calibration Gate blocked pending fresh explicit approval.
- Keep evidence free of secrets, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, private answer text, and full `paper` content.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md docs\05-execution-logs\evidence\2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md`
- `Select-String -Path docs\05-execution-logs\audits-reviews\2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md,docs\05-execution-logs\evidence\2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md -Pattern 'Current Mode','Proposed Target Mode','Mode Change Boundary','Allowed Task Kinds','Forbidden Task Kinds','Blocked Gates','Approval Required','ready_for_docs_auto_proposal','docs_auto_candidate','Cost Calibration Gate remains blocked','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log'`
- `git diff --unified=0 -- <changed files> | Select-String -Pattern '^\+.*(license|exam_paper)' -CaseSensitive`

## Stop Conditions

Stop before commit if:

- `automation.mode` would need to change;
- validation fails outside a safely repairable docs-only scope;
- changed files exceed allowed files;
- a blocked file is touched;
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, product code, or Cost Calibration Gate work becomes necessary.
