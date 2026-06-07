# Codex App Readiness Audit Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how to audit Codex Windows desktop readiness before using it for automated Tiku advancement. It does not approve Codex configuration changes, plugin installation, skill installation, session history cleanup, cache deletion, product code implementation, dependency changes, env/secret access, provider calls, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

## Purpose

Make Codex App readiness visible and repeatable so automation failures are caused by task constraints, not hidden tool or desktop setup drift.

The audit must answer:

- Can Codex safely read and write only intended workspace files?
- Can PowerShell, Git, Node, hooks, and quality gates run?
- Are required skills and plugins visible in the current session?
- Can browser verification be discovered when needed?
- Can long-running threads recover from durable repository state?
- Are cleanup actions clearly separated from audit-only work?

## Audit-Only Boundary

Readiness audit tasks may:

- inspect Git status and workspace paths;
- inspect project SOPs and state files;
- run local readiness and quality commands already approved by the task;
- record visible skill or plugin availability;
- record tool gaps and fallback recommendations;
- propose future configuration changes.

Readiness audit tasks must not:

- edit Codex global configuration;
- install or remove skills, plugins, connectors, CLIs, packages, or dependencies;
- delete session history, caches, worktrees, logs, or generated directories;
- read or modify `.env.local`, `.env.example`, secrets, tokens, provider keys, database URLs, or Authorization headers;
- launch GUI tools or browsers unless the task explicitly approves local verification;
- connect to staging, prod, cloud, provider, payment, or external-service resources.

## Readiness Surfaces

Audit these surfaces before relying on longer automated runs:

| Surface              | What to verify                                                       | Evidence result        |
| -------------------- | -------------------------------------------------------------------- | ---------------------- |
| workspace            | current `cwd`, writable root, dirty files, ignored residues          | pass, warning, blocked |
| Git                  | branch, `master` alignment, unmerged branches, worktree list         | pass, warning, blocked |
| shell                | PowerShell availability, command timeout behavior, encoding          | pass, warning, blocked |
| Node and package     | local Node path, npm scripts, installed dependencies already present | pass, warning, blocked |
| hooks and gates      | pre-commit, lint, typecheck, unit, format                            | pass, warning, blocked |
| skills               | required skill names visible in current session                      | pass, warning, blocked |
| plugins              | Browser, GitHub, Superpowers, and other relevant plugin visibility   | pass, warning, blocked |
| browser verification | Browser or fallback discovery path for local targets                 | pass, warning, blocked |
| thread recovery      | state, queue, evidence, audit review, and final handoff available    | pass, warning, blocked |
| evidence hygiene     | sensitive data redaction and blocked gate statements                 | pass, warning, blocked |

Use `warning` for degraded but usable conditions. Use `blocked` when the condition prevents safe automated advancement.

## Permission And Sandbox Check

Record:

- repository root;
- writable workspace roots;
- whether edits are limited to task `allowedFiles`;
- whether commands need escalation;
- whether any requested escalation is task-relevant and narrowly scoped.

Do not request broad command approvals. Do not use escalation to bypass blocked gates.

## Skill And Plugin Visibility

Skill readiness has two levels:

- path readiness: the skill files appear to exist on disk;
- session readiness: the current Codex session exposes the skill in the active skill list.

Session readiness is the controlling signal. If a skill path is missing or a skill is not visible, record the gap and use the project SOP as fallback.

Plugin or connector installation requires separate explicit approval. A readiness audit may recommend installation or restart, but it must not perform it.

## Browser Tool Readiness

For local UI validation, the preferred order is:

1. Browser plugin for `localhost`, `127.0.0.1`, `::1`, or `file://` targets.
2. Chrome-backed workflow only when the task requires a profile-backed browser condition.
3. Playwright or another fallback only after Browser or Chrome discovery is recorded.

Do not open Chrome, browser settings, extension stores, or GUI applications from an audit-only task.

## Thread And Context Hygiene

Before a long automated run, confirm:

- latest `project-state.yaml` is readable;
- latest `task-queue.yaml` is readable;
- latest task plan, evidence, and audit review are identified;
- final handoff from the previous round includes the final Git SHA;
- chat memory is not treated as the source of truth;
- context compaction recovery reads repository files before continuing.

Long threads should periodically checkpoint through evidence and handoff. A new thread may continue only after reading durable state, not just a natural-language summary.

## Session History And Cache Boundary

Session history cleanup, cache cleanup, old worktree deletion, generated log cleanup, and plugin cache repair are maintenance actions, not audit actions.

They require separate approval when they:

- delete files;
- change Codex or user-level configuration;
- alter plugin or skill availability;
- remove history needed for recovery;
- touch paths outside the repository or approved temp roots.

An audit may list recommended cleanup candidates, but must not perform cleanup.

## Required Audit Evidence

Use this shape:

```text
codex app surface:
workspace:
git:
shell:
node/package:
hooks/gates:
skills:
plugins:
browser:
thread recovery:
evidence hygiene:
warnings:
blocked items:
recommended follow-up:
```

Evidence must not include secrets, tokens, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, or private answer text.

## Stop Conditions

Stop the audit when:

- a required tool is missing and no safe fallback exists;
- Git state is dirty outside task scope;
- a command would require broad or unrelated escalation;
- the audit would need env/secret access;
- the next step is plugin installation, skill installation, GUI launch, session history cleanup, cache deletion, provider call, deploy, payment, or external-service action;
- Cost Calibration Gate execution is requested.

## Handoff

A readiness handoff must state:

- whether Codex App is `ready`, `ready_with_warnings`, or `blocked`;
- warnings that do not block local docs-only work;
- blocked items and required human decisions;
- next local-completable automation task;
- approval-required maintenance task, if any.

Do not claim automated development readiness when core local gates, Git state, or durable recovery sources are unavailable.
