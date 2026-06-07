# Phase 52 Docs Auto Candidate Mode Transition Proposal Evidence

## Summary

- Result: pass.
- Scope: docs_only mode transition proposal.
- Current mode: `semi_auto`.
- Proposed target mode: `docs_auto_candidate`.
- Mode changed in this task: no.
- Purpose: request-ready proposal for a later explicit human decision, not execution of the mode change.

## Task

- Task id: `phase-52-docs-auto-candidate-mode-transition-proposal`
- Branch: `codex/phase-52-docs-auto-candidate-mode-transition-proposal`
- Task kind: `docs_only`

## Source Evidence

| Source                                    | Evidence Used                                       | Interpretation                                                                                                                             |
| ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 50 automation readiness scorecard   | `ready_for_docs_auto_proposal`                      | Supports creating this dedicated proposal task                                                                                             |
| Phase 51 Browser bridge readiness recheck | Browser bridge readiness `pass` for current session | Removes the earlier Browser bridge warning for current-session readiness, but does not approve browser-dependent task execution by default |
| Current `project-state.yaml`              | `automation.mode: semi_auto`                        | Confirms the active mode has not been upgraded                                                                                             |
| Current `task-queue.yaml`                 | phase-51 completed with evidence                    | Confirms dependencies are available for this proposal                                                                                      |

## Current Mode

`automation.mode` remains `semi_auto`.

## Proposed Target Mode

Target label proposed for later human approval: `docs_auto_candidate`.

This proposal recommends that a later dedicated state-only transition task may change `automation.mode` only after the user explicitly approves:

- target mode label;
- allowed task kinds;
- forbidden task kinds;
- blocked gates;
- closeout permissions;
- stop conditions;
- evidence and audit review requirements.

## Mode Change Boundary

This phase does not write `automation.mode: docs_auto_candidate`.

Reason: the current approval covers iterative docs-only governance work and closeout for each round. It does not explicitly approve changing the project automation mode. The mode mutation must be the primary purpose of a later task, not a side effect of this proposal.

## Proposal Verdict

Verdict: `ready_for_docs_auto_proposal`.

Recommended next human decision: approve or reject a dedicated state-only task to change `automation.mode` from `semi_auto` to `docs_auto_candidate`.

## Allowed Task Kinds

If later approved, `docs_auto_candidate` should allow automatic claiming only for:

- `read_only` tasks that inspect repository state, queue, evidence, audit review, or governance documents;
- `docs_only` governance tasks with concrete dependencies, `allowedFiles`, `blockedFiles`, `riskTypes`, validation commands, task plan policy, evidence path, and audit review requirement when relevant;
- `blocked_gate` documentation tasks that record blocked status and required human input without executing the blocked action;
- docs-only `closeout` actions when the task and user approval explicitly include commit, merge, push, and short-lived branch cleanup.

## Forbidden Task Kinds

If later approved, `docs_auto_candidate` must still forbid:

- `implementation`;
- `implementation_planning` unless separately approved;
- `dependency`;
- `schema_migration`;
- `local_verification` unless the task separately approves browser or local verification scope;
- `deploy`;
- `external_service`;
- code-stage queue seeding;
- automatic task creation for product implementation;
- any task that requires product code, API, UI, service, repository, mapper, validator, tests, e2e, scripts, package, lockfile, dependency, schema, migration, Codex configuration, plugin installation, skill installation, connector installation, session history cleanup, cache deletion, destructive cleanup, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate execution.

## Blocked Gates

Cost Calibration Gate remains blocked pending fresh explicit approval.

The following remain blocked:

- provider cost measurement, real provider calls, provider quota, endpoint, model selection, fallback configuration;
- env/secret creation, reading, update, rotation, `.env.local`, `.env.example`, token, password, database URL;
- staging/prod/cloud/deploy, public endpoint, callback URL, TLS, object storage, production-like resource;
- payment, pricing, invoice, refund, reconciliation, external-service action;
- dependency, package, lockfile, CLI, SDK, schema, migration, destructive database operation, `drizzle-kit push`;
- authorization permission model changes without a dedicated approval path;
- code-stage queue seeding and implementation queue items;
- writing generated AI content or organization training output directly into formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records.

## Approval Required

Before any actual mode change, the next task must record explicit human approval that names:

- `docs_auto_candidate` as the target mode;
- whether automatic claiming is allowed and for which task kinds;
- whether closeout includes commit, merge, push, and branch cleanup;
- whether Browser-dependent local verification remains excluded by default;
- whether code-stage queue seeding remains blocked;
- that Cost Calibration Gate remains blocked unless separately approved.

## State And Queue Implications

This task may synchronize:

- current phase and current task in `project-state.yaml`;
- entry recovery SHA based on the stable `master` / `origin/master` SHA before this task;
- this task entry in `task-queue.yaml`.

This task must not synchronize a post-closeout SHA through an extra self-referential state commit. Per task lifecycle governance, the final closeout SHA belongs in the final handoff unless a separately approved closeout task has independent value.

## Project Terms And Redaction

Required project terms are preserved: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

Evidence redaction status: pass by scope. This file contains no secrets, tokens, database URLs, Authorization headers, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, private answer text, full `paper` content, or raw generated AI content.

## Residual Risks

- A later `automation.mode` mutation still needs explicit human approval.
- Browser bridge readiness was validated for the current session only; future sandbox, Codex App, plugin, or session changes may require a recheck.
- Local implementation planning, implementation tasks, and code-stage queue seeding remain unapproved.
- This docs-only proposal does not prove runtime behavior for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log`.

## Validation Results

Validated before commit on `codex/phase-52-docs-auto-candidate-mode-transition-proposal`:

| Gate                         | Command                                                                                              | Result |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| Whitespace/conflict check    | `git diff --check`                                                                                   | pass   |
| Formatting                   | `node .\node_modules\prettier\bin\prettier.cjs --check <changed docs>`                               | pass   |
| Required proposal search     | `Select-String` check for mode boundary sections, blocked gate phrase, and required project terms    | pass   |
| Added-line terminology check | `git diff --unified=0 <changed files> \| Select-String` check for prohibited conflicting terminology | pass   |
| Git inventory                | `git status --short --branch` review against phase-52 `allowedFiles`                                 | pass   |
