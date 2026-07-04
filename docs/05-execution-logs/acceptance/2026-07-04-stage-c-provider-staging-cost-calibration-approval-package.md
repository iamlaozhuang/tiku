# 2026-07-04 Stage C Provider Staging Cost Calibration Approval Package

## Status

- Task ID: `stage-b-local-acceptance-closeout-and-stage-c-approval-prep-2026-07-04`
- Package status: prepared for human decision only
- Execution status: not executed
- Decision mode: approval package only, no Provider, no staging, no Cost Calibration

## Purpose

Stage B proved the approved local DB-backed 8-role path only. Stage C is the next external-runtime decision surface. This
package separates three gates that must not be silently combined:

1. Provider/model runtime and env/secret handling.
2. Staging resource, deployment, data, and owner-preview handling.
3. Cost Calibration, quota, pricing, and measurement handling.

Approval of this document as committed evidence must not be interpreted as approval to execute any of the gates below.
Each execution gate needs a fresh approval message that names the exact scope.

## Gate Summary

| Gate                       | Current status         | Execution requires fresh approval for                                                                                                             | Must remain forbidden until approved                                                                                             |
| -------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Stage C-1 Provider smoke   | prepared, not executed | Provider label, model/config candidate, env/secret access method, max calls, data class, stop rule, redacted evidence owner                       | Provider call, model request, prompt execution, env/secret read/write, provider payload capture, raw AI input/output             |
| Stage C-2 Staging preview  | prepared, not executed | Staging URL, resource owner, database/storage/auth isolation, sample data policy, deployment/rollback owner, monitoring owner, redaction reviewer | Cloud resource change, deploy, staging/prod connection, secret creation/rotation, production data import, public URL publication |
| Stage C-3 Cost Calibration | prepared, not executed | Pricing source/date, sample size, max spend, measurement target, quota owner, stop threshold, log redaction, outlier/failure counting             | Cost measurement, billing, quota default decision, payment/external-service action, production pricing claim                     |

## Stage C-1 Provider Smoke Approval Requirements

Before any Provider/model runtime execution, a future task must record:

- provider and `model_config` candidate labels without exposing keys;
- whether the execution is local-only, staging-only, or another explicitly named target;
- maximum call count, timeout, retry, and failure stop threshold;
- allowed data class: synthetic or reviewed non-sensitive sample only;
- prompt and response evidence policy: no raw prompt, Provider payload, raw AI input/output, full generated `question`,
  full generated `paper`, full `material`, full `resource`, or full `chunk` in committed evidence;
- env/secret access owner and rule that secret values are not printed or committed;
- `ai_call_log` redaction expectations;
- rollback/disable rule if output is unsafe, costly, unstable, or not reproducible.

Recommended approval text template:

```text
Approve Stage C-1 Provider smoke for Tiku only within [local/staging target], using [provider/model label], max [N]
calls, synthetic/reviewed non-sensitive data only, no raw prompts/payloads/AI output in evidence, no secret values
printed or committed, stop on first unsafe/costly/unstable failure, and no release readiness/final Pass/production
claim.
```

## Stage C-2 Staging Preview Approval Requirements

Before any staging preview or deployment rehearsal, a future task must record:

- staging URL and deployment target;
- staging resource owner and rollback owner;
- PostgreSQL instance or isolated namespace decision, backup/restore approach, and pgvector readiness if RAG is in scope;
- object storage bucket or strict `staging/` prefix policy;
- staging-only auth base URL, callback URL, and secret ownership;
- account creation/disable owner and allowed test-owned account set;
- data policy: synthetic or reviewed non-sensitive sample data only unless a separate data handling plan approves more;
- monitoring, incident, stop owner, and redaction reviewer;
- confirmation that `prod` is untouched and production data is not imported.

Recommended approval text template:

```text
Approve Stage C-2 staging preview preparation/execution only for [staging URL/target], with isolated staging resources,
no production data, no shared writable prod storage/database, named rollback/monitoring/stop/redaction owners, redacted
evidence only, and no production release or final Pass claim.
```

## Stage C-3 Cost Calibration Approval Requirements

Before any Cost Calibration or quota economics work, a future task must record:

- pricing source and date;
- sample size, max spend, and stop threshold;
- whether Provider execution is local or staging, and whether Stage C-1 approval already exists;
- quota owner categories: personal, organization, or ops governance;
- how retries, timeouts, failures, and outliers are counted;
- allowed `ai_call_log` and aggregate cost summaries;
- rule that no raw Provider payload, raw prompt, raw AI output, secret, payment credential, or customer data appears in evidence;
- explicit statement that calibration evidence does not by itself approve production pricing or quota defaults.

Recommended approval text template:

```text
Approve Stage C-3 Cost Calibration planning/execution for [target], using [pricing source/date], max spend [amount],
sample size [N], redacted aggregate cost/log summaries only, no raw Provider payloads/prompts/AI outputs/secrets, stop
on threshold breach, and no production pricing/quota/final Pass claim.
```

## Required Serial Order

Recommended order:

1. Stage C-1 Provider smoke approval and execution, if real model behavior must be measured.
2. Stage C-3 Cost Calibration approval and execution, only after the Provider target and call limits are explicit.
3. Stage C-2 staging preview approval and execution, only after staging resources, owners, and data policy are explicit.

If the user wants staging before Provider, the staging task must explicitly keep Provider disabled or separately approve
Provider inside staging.

## Stop Conditions

Any future Stage C execution must stop and split a repair or decision task if it encounters:

- missing or mismatched target environment;
- missing owner for secrets, staging resources, rollback, monitoring, stop authority, or redaction;
- request to reveal credentials, env values, Provider payload, raw prompt, raw AI output, raw DB rows, PII, full content, or production data;
- unexpected Provider cost, unsafe output, unstable response, or non-reproducible behavior;
- staging/prod boundary ambiguity;
- need for schema/migration, dependency, payment, external service, or production release action not already approved.

## Non-Claims

- No Provider readiness.
- No staging readiness.
- No Cost Calibration result.
- No release readiness.
- No final Pass.
- No production usability.
- No production data safety claim.
