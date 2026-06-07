# Skill Dispatch And Thread Handoff Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku agents select skills and plugins, record fallbacks, survive context compaction, and hand work to a new thread without losing the project line. It does not approve plugin installation, skill installation, connector installation, thread creation, code-stage queue seeding, product code implementation, dependency changes, env/secret access, provider calls, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution. Cost Calibration Gate remains blocked.

## Purpose

Make skill usage and thread continuation auditable.

The mechanism must prevent:

- assuming a skill is available because a path exists;
- skipping a required project SOP because a skill failed to load;
- continuing after context compaction from chat memory only;
- starting a new thread without a durable handoff;
- treating plugin or skill installation as an automatic maintenance action.

## Dispatch Sources

Skill and plugin dispatch uses these sources in order:

1. Current task `taskKind`, `riskTypes`, `allowedFiles`, and `validationCommands`.
2. Project SOPs and ADRs.
3. Active Codex session skill list.
4. Plugin/tool visibility in the current session.
5. Existing `docs/04-agent-system/sop/skill-dispatch-matrix.md`.
6. Fallback project SOP workflow when skills or tools are unavailable.

Do not rely on chat memory or historical tool availability.

## Skill Readiness Levels

Record skill readiness with these labels:

| Label               | Meaning                                           | Allowed action                                     |
| ------------------- | ------------------------------------------------- | -------------------------------------------------- |
| `session_ready`     | skill is visible in the active session            | use the skill workflow                             |
| `path_only`         | skill file appears on disk but is not active      | do not assume activation; use project SOP fallback |
| `declared_missing`  | skill is listed in docs but unavailable on disk   | record warning; use fallback                       |
| `not_applicable`    | skill is unrelated to the task                    | no action                                          |
| `requires_approval` | using or installing the tool needs human approval | stop before install/configuration                  |

Session readiness controls execution. Path readiness alone is not enough.

## Task-To-Skill Dispatch

Use this dispatch guide:

| Task surface               | Preferred skill or plugin family                 | Fallback when unavailable                         |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| brainstorming or planning  | brainstorming, writing-plans                     | project SOPs, ADRs, task plan template            |
| docs-only governance       | verification-before-completion                   | task lifecycle governance and evidence template   |
| implementation             | test-driven-development, executing-plans         | TDD section in task lifecycle governance          |
| debugging                  | systematic-debugging                             | reproduce, isolate, fix, verify workflow          |
| frontend UI                | shadcn, react/next, browser tools                | existing frontend standards and local browser SOP |
| database and repository    | drizzle/postgres skills                          | ADR-001, code taste, repository tests             |
| authorization/security     | security-best-practices, security-threat-model   | security review gate SOP                          |
| AI/RAG                     | Vercel AI SDK, RAG skills                        | blocked gate and AI/RAG SOPs; no provider calls   |
| local browser verification | Browser plugin, Playwright fallback              | browser discovery rules in automation-loop        |
| closeout                   | finishing branch, verification-before-completion | task lifecycle closeout gate                      |
| code review                | code-review or requesting-code-review            | audit review and security review SOPs             |

When a preferred skill is unavailable, evidence must say which fallback was used.

## Plugin Dispatch

Plugins and connectors are selected by task need:

- Browser plugin for local web targets and rendered UI verification.
- GitHub plugin or Git CLI for repository, PR, and remote review when approved.
- Figma plugin only for design tasks or Figma URLs.
- OpenAI Developers plugin only for OpenAI API or ChatGPT App tasks.
- Vercel plugin only for Vercel-specific tasks and only within approval boundaries.

Plugin installation, connector installation, account authorization, remote API access, and GUI launch require separate explicit approval when not already available.

## Thread Handoff Entry Gate

A new thread may continue project work only after reading:

- `AGENTS.md`;
- `docs/03-standards/code-taste-ten-commandments.md`;
- relevant ADRs;
- `docs/04-agent-system/state/project-state.yaml`;
- `docs/04-agent-system/state/task-queue.yaml`;
- latest task plan;
- latest evidence;
- latest audit review;
- final handoff from the previous thread when available.

The new thread must verify Git state before editing:

- current branch;
- `master` and `origin/master` alignment;
- unmerged short-lived branches;
- worktree list;
- dirty or untracked files.

## Thread Handoff Shape

Use this shape for thread continuation:

```text
thread handoff:
project phase:
current task:
latest evidence:
latest audit review:
final git sha:
branch state:
blocked gates:
allowed next task:
approval-required work:
skills/plugins warnings:
stop conditions:
```

This handoff is a pointer, not the source of truth. The receiving thread must recover from repository files.

## Context Compaction Recovery

After context compaction or long-thread uncertainty:

1. Stop before editing.
2. Read `project-state.yaml`, `task-queue.yaml`, latest evidence, latest task plan, and latest audit review.
3. Verify Git state.
4. Compare current user request with durable handoff.
5. Continue only if the newest user request and repository state agree.

If there is a conflict, ask for clarification or create a docs-only state/audit task when approved.

## New Thread Continuation

Creating or using a new thread may be useful when:

- context is near exhaustion;
- a module boundary is reached;
- a handoff is clearer than continued compaction;
- a parallel independent task is explicitly approved.

New thread creation or handoff automation must not:

- skip startup read order;
- skip Git verification;
- bypass blocked gates;
- assume skill availability;
- carry uncommitted work across threads without evidence.

## Skill Or Plugin Failure Handling

When a skill or plugin fails:

1. Record the failure in evidence.
2. Retry only once if the failure is transient and safe.
3. Use project SOP fallback when possible.
4. Stop if the task depends on the unavailable tool and no safe fallback exists.
5. Do not install, repair, or configure tools without explicit approval.

For example, if a Browser tool is not visible, record discovery attempts and use the browser verification fallback rules. Do not claim browser validation passed without a browser-equivalent check.

## Evidence Requirements

Skill and thread handoff evidence should include:

```text
task surface:
preferred skills:
session-ready skills:
path-only or missing skills:
plugins/tools used:
fallbacks used:
thread state:
context recovery source:
handoff target:
warnings:
blocked items:
```

Evidence must not include secrets, tokens, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, or private answer text.

## Stop Conditions

Stop when:

- required skill or plugin is unavailable and no safe fallback exists;
- plugin or skill installation is needed;
- thread handoff lacks latest evidence or audit review;
- Git state is ambiguous;
- user request conflicts with durable state;
- context compaction makes the active task uncertain;
- blocked gate execution would be required;
- provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work becomes necessary.

## Forbidden Claims

Do not claim:

- a skill was used when only project SOP fallback was used;
- a plugin was available when it was not visible in the active session;
- a new thread can continue from chat summary alone;
- browser validation passed without a browser or approved equivalent;
- Cost Calibration Gate readiness while it remains blocked.
