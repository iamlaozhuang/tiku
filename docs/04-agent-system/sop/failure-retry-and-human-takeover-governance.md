# Failure Retry And Human Takeover Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku agents classify failures, spend retry budgets, stop repeated loops, and hand work to a human without losing evidence. It does not approve product code implementation, dependency changes, schema or migration work, env/secret work, provider work, staging/prod/cloud/deploy work, payment work, external-service work, thread creation, worktree creation, parallel worker execution, or Cost Calibration Gate execution. Cost Calibration Gate remains blocked.

## Purpose

Make failure handling explicit and auditable.

The mechanism must prevent:

- retrying the same broken action without new evidence;
- hiding a blocked gate behind a retry;
- broadening scope to fix a failure without approval;
- treating flaky validation as a pass;
- losing Git or task state after interruption;
- asking for human help without enough recovery context.

## Failure Classification

Classify every failure before retrying:

| Class                              | Meaning                                                            | Default action                                  |
| ---------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| `transient_tool_failure`           | command, shell, plugin, or browser tool failed once                | one safe retry after recording evidence         |
| `deterministic_validation_failure` | lint, typecheck, test, build, format, or search fails consistently | fix only inside task scope, then rerun the gate |
| `scope_violation`                  | changed files exceed `allowedFiles` or touch `blockedFiles`        | stop and repair scope before continuing         |
| `blocked_gate_failure`             | next step needs blocked or high-risk action                        | stop for human approval                         |
| `missing_approval`                 | task needs approval not present in queue or evidence               | stop for human approval                         |
| `git_state_failure`                | dirty tree, branch drift, merge conflict, or remote divergence     | stop and reconcile before new work              |
| `tool_unavailable`                 | required skill, plugin, connector, or command is unavailable       | use approved fallback or stop                   |
| `context_uncertainty`              | compaction or interruption makes ownership unclear                 | stop and recover from durable files             |
| `sensitive_evidence_risk`          | evidence would expose secrets or protected content                 | stop and redact or ask human                    |
| `ambiguous_requirement`            | request, task queue, or state has conflicting intent               | stop and ask human                              |

Do not retry until the failure class is recorded in evidence or the working note that will become evidence.

## Retry Budget

Each task has a maximum retry budget of three attempts unless the task queue sets a lower value.

Use this counting rule:

```text
attempt 1: original failing action
attempt 2: first retry after a concrete change or transient-safe rerun
attempt 3: final retry after a second concrete change
```

After three failed attempts for the same failure class and same blocker, mark the task blocked and stop. Do not rename the blocker to reset the budget.

Retry budget is task-scoped. A later task may retry only when it has a new plan, new evidence path, and a changed premise.

## Retry Preconditions

A retry is allowed only when all conditions are true:

- the failure class allows retry;
- the retry stays inside `allowedFiles`;
- no `blockedFiles` are touched;
- no dependency, schema, migration, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service action is required;
- the next command can produce fresh evidence;
- Git state is understandable;
- the retry reason is recorded.

If any condition fails, stop for human takeover.

## Safe Retry Patterns

Allowed retry patterns include:

- rerun a command once after a transient shell or tool failure;
- run Prettier on task-scoped docs, then rerun format check;
- fix a typo in a governance SOP, then rerun required pattern search;
- adjust evidence wording to remove sensitive or conflicting terminology, then rerun redaction and terminology checks;
- rerun local validation after a task-scoped code fix when implementation approval exists.

These retries must not be used to claim staging, prod, provider, payment, or external-service readiness from local-only evidence.

## Human Takeover Triggers

Stop and hand work to a human when:

- Cost Calibration Gate execution is needed;
- provider cost measurement, real provider call, provider quota, provider endpoint, or provider fallback configuration is needed;
- env/secret creation, reading, update, rotation, `.env.local`, `.env.example`, token, password, or database URL work is needed;
- staging, prod, cloud, deploy, public endpoint, callback URL, TLS, object storage, or production-like resource work is needed;
- payment, pricing, invoice, refund, reconciliation, or external-service work is needed;
- dependency, package, lockfile, CLI, SDK, schema, migration, destructive data operation, or `drizzle-kit push` is needed without approval;
- authorization permission model changes are needed without a dedicated approval path;
- evidence would need cleartext `redeem_code`, private answer text, full `paper` content, raw AI prompts, raw answers, provider payloads, secrets, or Authorization headers;
- `project-state.yaml`, `task-queue.yaml`, Git reality, or user request conflict;
- branch, worktree, merge order, or ownership is ambiguous;
- the same blocker reaches the retry budget;
- a required skill or plugin is unavailable and no approved fallback exists;
- the user asks to pause, inspect, or discuss.

## Blocked Task Recording

When a task is blocked, record:

```text
task id:
branch:
failure class:
attempt count:
last command:
last observed result:
changed files:
blocked gate:
human decision needed:
safe recovery point:
cleanup status:
```

The task queue status should become `blocked` only when the blocker is real, repeated, or outside the current approval scope. Do not mark a task blocked merely because it is unfinished but still safely actionable.

## Human Handoff Package

Human takeover handoff must include:

- task id and task kind;
- branch and latest commit state;
- current Git status;
- latest task plan path;
- latest evidence path;
- latest audit review path when present;
- failure class and attempt count;
- exact command that failed;
- whether files are staged, unstaged, or untracked;
- blocked gates and approvals needed;
- safest next action;
- explicit list of actions not taken.

The handoff is a recovery package, not a completion claim.

## Recovery After Human Decision

After a human gives a decision:

1. Re-read `AGENTS.md`, relevant SOPs, `project-state.yaml`, `task-queue.yaml`, latest task plan, latest evidence, and latest audit review.
2. Verify Git status, branch, `master` / `origin/master` alignment, and worktree list.
3. Confirm the new approval scope is written in the task plan or evidence.
4. Continue only inside the approved scope.
5. Reset retry classification only when the human decision changes the premise.

If the decision approves a high-risk action, isolate that action in its own task and evidence unless the approval explicitly says otherwise.

## Evidence Requirements

Failure and retry evidence should include:

```text
failure class:
attempt count:
retry reason:
commands:
changed files:
validation results:
blocked gates:
human approval needed:
fallback used:
redaction check:
final status:
```

For `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log` tasks, evidence must preserve the project terminology while redacting protected content and avoiding raw operational data unless a task-specific approval exists.

## Stop Conditions

Stop immediately when:

- the next retry would exceed the retry budget;
- retry would require scope expansion;
- blocked gate execution would be needed;
- sensitive evidence cannot be redacted safely;
- Git recovery is uncertain;
- approval language is ambiguous;
- local validation is being used to claim staging, prod, provider, payment, or external-service readiness.

## Forbidden Claims

Do not claim:

- a task passed because a later retry was skipped;
- a flaky command is healthy without a fresh successful rerun;
- a blocked gate is resolved by documenting it;
- human approval exists when it is only implied by old context;
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` runtime behavior is fixed from docs-only retry evidence;
- Cost Calibration Gate readiness while it remains blocked.
