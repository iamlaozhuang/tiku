# Automation Loop SOP

## Status

Draft for Phase 0

## Purpose

Define the cross-session automation loop for Tiku agent work. This SOP keeps each agent run standards-driven, scoped, verifiable, and recoverable.

## Startup Read Order

Every automation session starts by reading these sources in order:

1. `AGENTS.md`
2. `docs/03-standards/doc-management.md`
3. `docs/03-standards/code-taste-ten-commandments.md`
4. `docs/03-standards/local-ci.md`
5. `docs/03-standards/testing-tdd.md`
6. `docs/02-architecture/adr/`
7. `docs/04-agent-system/sop/security-review-gate.md`
8. `docs/04-agent-system/state/project-state.yaml`
9. `docs/04-agent-system/state/task-queue.yaml`

If any required source is missing, stop the loop and record the blocker before changing project files.

## Session Startup Report

After the startup read order and before editing files, each agent session must provide a short startup report when the user asks to continue, resume, verify status, or run the queue. The report is a control surface for the human owner, not a substitute for evidence.

The startup report must include:

- current branch and `git status --short --branch`;
- whether `master` is clean and whether `master` is aligned with `origin/master`, using a fresh fetch when remote state matters;
- local short-lived branches that are not merged into `master`;
- registered worktrees and any obvious task worktree residue;
- current `project-state.yaml` phase, current task, and handoff path;
- task queue counts for `pending`, `blocked`, `closed`, `done`, and `pushed`;
- the next eligible `pending` task, or a statement that no executable pending task exists;
- current long-lived blocked gates when they are relevant to the requested work;
- latest evidence file(s) that define the recovery point.

When the user's instruction says to report first or wait for direction, stop after the startup report and wait. Do not create branches, edit files, start servers, run long validation gates, read environment files, push, deploy, or contact external services until the user gives the next instruction.

Use this compact shape unless the user requests more detail:

```text
branch/status:
master alignment:
local branches/worktrees:
project-state:
queue summary:
next eligible task:
blocked gates:
latest evidence:
waiting: yes/no
```

If the startup report reveals drift between Git reality and `project-state.yaml`, record the drift in the report and resolve it through the closeout reconciliation rules before claiming the task state is current.

## Readiness Command

Run the readiness check before claiming a task:

```powershell
.\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

The command is the operational readiness gate. Missing files, missing quality scripts, or unavailable local skill paths must be treated as visible evidence, not ignored.

## Task Claiming Rules

An agent may claim a task only when all of these conditions are true:

- The task status is `pending`.
- Every dependency listed by the task is `done`.
- High-risk items have explicit human approval before execution.
- High-risk security tasks have `securityReviewRequired: true` or an equivalent evidence plan.
- The current branch is not `main` or `master`.
- The allowed file scope is clear and does not overlap with another active agent's scope.
- Dependency add, remove, or upgrade work has passed `docs/04-agent-system/sop/dependency-introduction-gate.md`.

If a task cannot be claimed cleanly, leave it unchanged and report why it is blocked.

Before claiming a queued task, run the claim preflight when available:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId <task-id>
```

The preflight is evidence, not a substitute for reading the task. Resolve protected branch usage, incomplete dependencies, missing `taskPlanPolicy`, package or lockfile risk, and security review risk before editing project files.

New queue tasks should use this status progression:

```text
pending -> claimed -> implemented -> validated -> committed -> merged -> pushed -> closed
```

`done` remains valid for legacy tasks and evidence-only tasks that predate this status model.

## Execution Sequence

For each claimed task:

1. Generate or update the task plan under `docs/05-execution-logs/task-plans/` unless the active human instruction restricts the writable file scope.
2. Reconfirm the allowed file list and current Git branch.
3. Perform only the scoped edit required by the task.
4. Run available gates, starting with task-specific validation commands.
5. Run `Test-NamingConventions.ps1` for API, service, contract, or route changes.
6. Write evidence for command outputs, missing gates, and any accepted residual risk. Use `New-TaskEvidence.ps1` when a new evidence skeleton is useful.
7. For high-risk tasks, complete the security review gate in `docs/04-agent-system/sop/security-review-gate.md` before merge.
8. Run a Git completion inventory with `Test-GitCompletionReadiness.ps1` or equivalent commands.
9. Commit successful work only when the task instruction allows commits; otherwise record why the work remains uncommitted.
10. Do not claim the next task while completed-task changes are still mixed with the current worktree, unless the handoff explicitly names the remaining files and reason.
11. Update the queue and project state only when those files are in the allowed scope.

Each step should leave enough evidence for another agent to resume without guessing.

For Phase 11 MVP gap tasks, also follow:

- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`

Those documents are mandatory for the 16 MVP gap tasks created by `phase-11-mvp-functional-completeness-gap-audit`. They require an AC-to-runtime matrix, P0/P1/P2/P3 problem grading, explicit `fixture-only` / `mock-only` / `read-only` / `entry-only` labels, validation records, a Repository Hygiene Closeout Checklist, `stagingDecision`, and next-step evidence before the next task is claimed.

Every new queue task should declare `taskPlanPolicy: required`, `taskPlanPolicy: evidence_only`, or `taskPlanPolicy: skipped_with_reason`.

- Use `required` for normal implementation tasks.
- Use `evidence_only` for readiness, closeout, and state-only tasks when the queue intentionally does not allow `docs/05-execution-logs/task-plans/**`.
- Use `skipped_with_reason` only when a human instruction explicitly prevents a plan, and record the reason in evidence.

When appending repetitive command evidence, prefer:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Add-TaskEvidenceResult.ps1 -EvidencePath <evidence.md> -Command '<command>' -Result pass -Summary '<summary>'
```

Manual evidence is still required for judgment, accepted gaps, security conclusions, and unusual failures.

## Evidence Summary

New task evidence should start with a short `Summary` section before detailed implementation notes. The summary is for fast human review and cross-session recovery; it does not replace command evidence.

Use this shape when applicable:

```markdown
## Summary

- Result: pass/fail/blocked/pending validation.
- Scope: read_only/docs_only/implementation/local_verification/closeout/blocked_gate.
- Changed surfaces: short list of files or areas.
- Gates: lint/typecheck/test/build/e2e/readiness/git inventory pass/fail/skipped with reason.
- Forbidden scope (`forbiddenScope`): env/dependency/schema/migration/staging/prod/cloud/deploy/real provider status.
- Residual gaps (`residualGaps`): none, or gap ids with evidence path.
```

Keep the summary factual and bounded. Do not record secrets, tokens, raw prompts, raw answers, raw model responses, provider payloads, database URLs, full papers, full textbooks, OCR full text, or customer/customer-like private data.

## Commit Barrier

- A task is not ready for handoff until its validation output, evidence file, and Git inventory all agree on the changed file set.
- One task should normally close with one focused commit. Split commits only when the task has clearly separate approved scopes, such as dependency approval, dependency install, and business implementation.
- If final merge, push, or cleanup evidence would churn the implementation commit SHA, record `implementationCommit` and `closeoutEvidenceCommit` separately instead of repeatedly amending the same commit.
- Never bundle an allowed dependency or lockfile change into a later feature commit. Dependency work must carry its own approval evidence.
- If the user asks to continue the queue after a task is complete, first decide whether the completed task should be committed and merged before starting the next task.

## Context Management

Keep session context small and durable:

- Load only the requirements, ADRs, standards, and source files needed for the active task.
- Prefer `project-state.yaml`, `task-queue.yaml`, the task plan, and evidence files as the cross-session memory source.
- Do not rely on chat memory when a durable state file contradicts it.
- If a session resumes after interruption, read the latest evidence before continuing.

## Phase Transition Persistence Gate

When a human-approved discussion changes the project phase or operating model, persist it before implementation work starts. The durable record must include these six layers:

1. Roadmap update in `docs/04-agent-system/milestones-goals/mvp-roadmap.md`.
2. Queue entries in `docs/04-agent-system/state/task-queue.yaml`.
3. Project-state handoff in `docs/04-agent-system/state/project-state.yaml`.
4. Task plan under `docs/05-execution-logs/task-plans/`.
5. Evidence under `docs/05-execution-logs/evidence/`.
6. A contract or interface document when the phase depends on runtime, API, schema, or integration scope.

Evidence for the phase transition must include a self-check proving that all six layers exist, are searchable, and do not modify blocked files.

## Phase 7 Runtime Readiness Gate

Phase 7 is `MVP Local Runtime And Integration Readiness`. It is a runtime-hardening phase, not a horizontal feature expansion phase.

Before replacing unavailable runtime services, agents must read:

- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md#phase-7-mvp-local-runtime-and-integration-readiness`
- the current Phase 7 task plan and evidence

Phase 7 work must preserve these guardrails:

- `no_horizontal_feature_expansion`
- `mvp_vertical_slice`
- `docker_pgvector_dev`
- `seed_idempotent`
- `mock_provider_first`

The first runtime task after planning must inventory `createUnavailable...` surfaces and map each surface to required MVP runtime, mock runtime, deferred runtime, or blocked-by-dependency status. Do not replace broad route groups before that inventory is recorded.

## Git And Remote Repository Handling

- Do not work directly on `master` or `main` unless the user explicitly requests a read-only inspection.
- Use one short-lived branch or worktree per task.
- After any approved merge into `master`, remove the task worktree and delete the merged branch when it no longer backs an open PR.
- If no remote is configured, do not invent a repository URL.
- When a remote exists, use draft PRs by default and do not enable auto-merge.
- Push, PR creation, deployment, and production environment changes require explicit user approval.
- Local commit, local merge, remote push, PR creation, and cleanup are separate decisions. Approval for one does not automatically approve the next.
- Before pushing `master`, fetch the remote and verify the branch is not behind `origin/master`.
- Evidence must record every approved remote action and its result.

## Closeout Sequence

After a task branch is locally merged:

1. Switch to the merge target branch.
2. Run task-relevant validation plus readiness and quality gates.
3. Write closeout evidence with commit, merge, push, and cleanup status.
4. Push only when explicitly approved.
5. Remove the task worktree and delete the merged branch only after target-branch validation and evidence are complete.

If Windows leaves a worktree directory behind because of `node_modules` or other generated residue, resolve the absolute path and confirm it is under `.worktrees/` before deleting anything.

Closeout evidence must name the implementation commit. It does not need to contain the SHA of the closeout evidence commit itself, because that SHA is created after the file is written. Record the closeout evidence commit in the final handoff or `project-state.yaml` when useful instead of creating repeated evidence-only commits.

## Project State Closeout Reconciliation

After a task is merged, pushed, and cleaned up, reconcile `project-state.yaml` with Git reality before claiming the task is closed or starting the next task. This is required when a startup report shows that `master` is clean and aligned with `origin/master` but the handoff still says merge, push, or cleanup is pending.

The reconciliation check must compare:

- `git status --short --branch`;
- `git rev-list --left-right --count master...origin/master`;
- `git branch --no-merged master`;
- `git worktree list`;
- `project-state.yaml` `currentTask`, `handoff.nextRecommendedAction`, and latest evidence path.

When Git confirms there are no unpushed commits, no unmerged short-lived branches, and no task worktree residue, `project-state.yaml` must not keep a stale handoff such as "await push", "await closeout merge", or "perform cleanup" for an already completed task.

Use these state rules:

- `currentTask` may point to the most recently closed task, but its `status` must be `closed`.
- `handoff.nextRecommendedAction` must name the next actionable queue task or state that no executable pending task exists.
- `handoff.lastSummaryPath` must point to the latest evidence that actually describes the recovery point.
- When useful, record `repository.lastKnownMasterSha` and `repository.lastKnownOriginMasterSha` so future sessions can distinguish Git drift from stale handoff text.
- Do not rewrite historical evidence only to record the SHA of the evidence commit that contains the record. Put that self-referential closeout detail in the final handoff or `project-state.yaml` instead.

## Blocked Gates Registry

Long-lived approval gates live in `docs/04-agent-system/state/blocked-gates.yaml`. This registry is for cross-task red lines such as real provider access, staging/prod/cloud access, dependency changes, secret/env changes, deployment, and destructive data operations.

The blocked gates registry does not replace `task-queue.yaml`. Use it only for approval gates that remain blocked across many tasks. Ordinary implementation blockers stay in the task queue and evidence.

When a task touches or approaches a long-lived gate, the startup report and evidence must name the relevant gate id and whether it remains blocked. Do not mark a gate unblocked unless the task evidence includes the required human approval fields listed in `blocked-gates.yaml`.

Before Phase 5 AI/RAG work starts, complete a Phase 5 entry gate. The gate must confirm dependency approval, secret and environment strategy, model configuration boundaries, prompt template versioning, AI call log redaction, RAG `evidence_status` behavior, pgvector or embedding verification strategy, and Browser/IAB usage rules.

## PR Baseline Hygiene

- Prefer one PR per task. If a task depends on an unmerged prerequisite branch, mark the PR as stacked in its body.
- When the prerequisite branch lands in `master`, retarget dependent PRs to `master`.
- Rebuild dependent task branches on latest `origin/master` when the compare includes stale prerequisite files or formatting-only noise.
- Use `--force-with-lease` for rebuilt short-lived task branches; never use an unguarded force push.
- Confirm the final compare is ahead of `master`, not behind it, and contains only task-scoped files.

## Fresh Worktree Verification

- Validate mechanism and formatting changes in a freshly created worktree from the intended base branch.
- Treat line-ending drift as a repository policy problem. The required repository policy is `.gitattributes` with `* text=auto eol=lf`.
- Do not declare `format:check` healthy based only on an existing worktree that may have local line-ending state.
- If a temporary worktree leaves dependency residue after `git worktree remove`, delete it only after resolving and confirming the target path is under `.worktrees/`.

## Browser Verification Tool Discovery

When a task needs local UI, browser, or rendered frontend verification, do not declare the built-in browser unavailable until the project evidence shows the discovery path below.

For human-accompanied local product checks, also follow `docs/04-agent-system/sop/local-human-verification.md`. That playbook is required when the user asks for "真人体验验证", local verification accompaniment, local role-play, or a browser-guided readiness pass.

1. Use the Browser skill and the `iab` backend for ordinary local targets such as `localhost`, `127.0.0.1`, `::1`, or `file://` unless the user asks for Chrome-specific state.
2. Use the Chrome skill and the `extension` backend when the user asks for Chrome, an existing Chrome tab, cookies, logged-in session state, extensions, or another profile-backed browser condition.
3. If tool discovery does not expose an obvious browser-specific tool, search for the generic Node REPL execution tool in this order: `node_repl js`, `mcp__node_repl__js`, `js`, then `node_repl js JavaScript execution`.
4. Bootstrap browser control by importing the plugin's absolute `scripts/browser-client.mjs` path. Browser verification uses `agent.browsers.get("iab")`; Chrome verification uses `agent.browsers.get("extension")`.
5. Run a lightweight connection check such as listing tabs before navigation. For Chrome extension failures, wait briefly, retry once, then run the Chrome plugin checks for running Chrome, installed browsers, extension installation, and native host manifest.
6. Ask for human approval before launching Chrome, opening the Chrome extension manager, or opening the Chrome Web Store. Do not install or repair the native host from the agent.
7. Use standalone Playwright, CLI browser tools, or another fallback only after the Browser or Chrome skill workflow has been attempted and the failure is recorded in evidence.
8. Do not use Figma capture, static screenshots, or a non-browser rendering surface as a substitute for browser verification.
9. Finish browser work by recording tab cleanup or finalization status. Chrome-backed work must call the Chrome tab finalization step unless no Chrome session was established.

Browser verification evidence must record:

- selected backend: `iab`, `extension`, or fallback with reason;
- discovery path attempted, including `node_repl js` search when relevant;
- URL or route verified;
- visible state checks and interaction checks performed;
- console or browser log result when available;
- screenshot status when visual verification matters;
- fallback decision and residual risk, if any;
- tab cleanup or finalization result.

## Failure Fuse

The loop has a hard failure fuse:

- Maximum three failures per task.
- Increment the task retry count after each failed execution attempt when queue updates are allowed.
- On the third failure, mark the task `blocked`.
- Write a failure report under `docs/06-issue-tracking/bug-reports/` when that path is in scope.
- Stop the loop after the task is blocked.

Failure reports must include the task id, failing command or step, observed output, suspected cause, and required human decision.
