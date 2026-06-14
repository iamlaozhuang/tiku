# Batch 178 Staging Provider Deploy Readiness Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create this planning-only handoff. This
> task is docs/state/queue/task-plan/evidence/audit only and must not be used as approval for staging resources,
> provider quota, env/secret handling, deployment commands, schema/migration, package/lockfile, source, tests, e2e,
> payment, or external-service work.

**Goal:** Record a planning-only readiness boundary for personal learning AI staging provider and deploy preparation.

**Architecture:** ADR-004 and ADR-005 keep `dev`, `staging`, and `prod` isolated. This plan documents the future approval
surface for staging AI provider enablement, deployment readiness, observability, rollback, and owner acceptance without
creating resources or executing commands.

**Tech Stack:** Next.js/TypeScript monolith, Drizzle/PostgreSQL baseline, existing Module Run v2 governance, no runtime
or dependency changes.

---

## Read Before Editing

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch evidence/audit for batch-173, batch-174, batch-175, batch-176, batch-177, and batch-179.

## Approval Boundary

The user approved `batch-178-personal-learning-ai-staging-provider-deploy-readiness` on 2026-06-14 as planning-only.

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`

Blocked:

- Real provider calls, model requests, provider quota use, or provider configuration changes.
- Env/secret reads, writes, creation, rotation, printing, `.env.local`, or `.env.*` access.
- Staging/prod/cloud resources, deploy commands, payment, or external-service configuration.
- Schema/migration, package/lockfile, source, tests, or e2e changes.
- PR creation, force-push, and further Cost Calibration.

## Current Inputs

- Batch-174: one local DeepSeek smoke completed with redacted summary, `requestCount: 1`.
- Batch-175: docs-only cost estimate for the batch-174 smoke envelope, not production workload economics.
- Batch-177: admin manual review gate exists, but formal target writes remain blocked.
- ADR-004/ADR-005: `staging` is isolated from `prod`; planning does not authorize resources, secrets, or deployment.
- ADR-006: AI SDK and provider packages are deferred unless a future dependency/provider task approves them.

## Planning Output

### 1. Staging Resource Readiness Gate

Future staging work must first name concrete resources without secrets:

- staging deployment target and ownership;
- staging domain and callback origin plan;
- isolated staging database or namespace plan;
- isolated object storage bucket or strict `staging` path prefix;
- staging-only auth secret destination;
- staging-only AI provider quota or disabled-by-default flag;
- audit log and `ai_call_log` retention expectations;
- reset or seed data ownership.

Stop condition: if any resource creation, modification, cloud command, console action, or deployment command is needed,
pause for fresh approval.

### 2. Provider Enablement Gate

Future provider staging approval must specify:

- provider and model;
- exact command or exact application path to exercise;
- environment key name and destination without printing or storing the value;
- maximum request count;
- timeout;
- spend/quota ceiling;
- redaction rules;
- allowed evidence fields;
- stop conditions for provider errors, quota/billing, timeouts, or redaction violations.

This batch does not run a provider command and does not read process env.

### 3. Deployment Readiness Gate

Future deployment approval must specify:

- exact platform target and project/app identifier;
- exact deploy command or CI job;
- required build command and whether it reads env files;
- health check URL shape without secrets;
- rollback decision point and rollback command;
- owner acceptance checklist;
- statement that `prod` remains untouched.

This batch does not deploy and does not create cloud resources.

### 4. Data And Evidence Gate

Future staging evidence may include only redacted summaries:

- command names and exit status;
- request count and duration;
- usage/cost summary when approved;
- public identifiers only when already allowed;
- redaction status;
- rollback or no-op decision.

Future evidence must not include raw prompts, provider payloads, raw provider responses, raw generated output, API keys,
Authorization headers, tokens, secrets, database URLs, row data, or production/customer data.

### 5. Validation Gate

This planning-only task validates documentation and repository hygiene only:

- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Prettier check on the five allowed files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Module Run v2 precommit, closeout, and pre-push readiness

`npm.cmd run build` remains out of scope because local build has previously reported `.env.local` loading, which
conflicts with this task boundary.

## Execution Checklist

- [x] Read required governance documents and relevant historical evidence/audit.
- [x] Confirm clean `master` baseline and no `codex/*` residue before creating the short branch.
- [x] Create `codex/batch-178-personal-learning-ai-staging-provider-deploy-readiness`.
- [x] Write planning-only task plan, evidence, and audit review.
- [x] Update project state and task queue within the allowed files.
- [ ] Run validation commands and record results.
- [ ] Commit one scoped batch-178 change.
- [ ] Fast-forward merge to `master`, run closeout/pre-push readiness, push, delete short branch, reread state/queue, and stop.

## Residual Risk Planned For Evidence

- The batch-175 cost estimate covers only the batch-174 smoke envelope, not staging workload economics.
- Staging deployment feasibility is not verified because no staging resource or deploy command is approved.
- Provider behavior outside the single local smoke remains unverified.
- Formal generated-content writes remain blocked after batch-177.
