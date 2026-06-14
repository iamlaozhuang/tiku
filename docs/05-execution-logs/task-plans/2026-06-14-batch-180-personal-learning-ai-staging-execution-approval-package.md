# Batch 180 Staging Execution Approval Package Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create this approval package. This task
> is docs/state/queue/task-plan/evidence/audit only. It is not approval to create resources, read or write secrets,
> call providers, deploy, change dependencies, change schema, edit source/tests/e2e, or configure external services.

**Goal:** Convert batch-178 planning gates into a concrete future approval checklist for real staging/provider/deploy work.

**Architecture:** ADR-004 and ADR-005 require `dev`, `staging`, and `prod` isolation. This package defines the exact
approval fields a future task must name before it can touch staging resources, provider quota, env/secret destinations,
deployment commands, health checks, rollback, owner acceptance, or evidence collection.

**Tech Stack:** Existing Next.js/TypeScript monolith and Module Run v2 governance only. No runtime, package, schema,
provider, environment, deployment, or external-service change is allowed in this task.

---

## Read Before Editing

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`

## Approval Boundary

The user approved this batch on 2026-06-14 as docs-only.

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`

Blocked:

- Provider calls, model requests, quota use, or provider configuration.
- Env/secret reads, writes, creation, rotation, printing, `.env.local`, `.env.*`, or secret files.
- Staging/prod/cloud resources, deployment commands, payment, or external-service configuration.
- Schema/migration, package/lockfile, source, tests, e2e, or script changes.
- PR creation, force-push, and further Cost Calibration.

## Approval Package

### A. Staging Resource Approval Fields

A future real staging task must explicitly name:

- `targetEnvironment`: `staging`
- `deploymentTarget`: provider/platform name without credentials
- `projectOrAppIdentifier`: public or redacted identifier only
- `region`: staging region or locality
- `domainPlan`: staging domain and callback origin shape
- `databasePlan`: isolated database instance or namespace; no database URL in evidence
- `storagePlan`: isolated bucket or strict `staging` prefix
- `authPlan`: staging-only auth base URL, callback URL, and secret destination name
- `aiProviderPlan`: provider disabled-by-default or staging-only quota plan
- `auditLogPlan`: retention and redaction rules for `audit_log` and `ai_call_log`
- `seedResetPlan`: synthetic seed/reset owner and data boundary
- `rollbackOwner`: named human role or owner
- `ownerAcceptanceOwner`: named human role or owner

### B. Env And Secret Approval Fields

A future task that touches env or secrets must explicitly name:

- exact environment variable names;
- exact destination service or console;
- whether values are created, updated, rotated, or only verified;
- who performs the secret input;
- confirmation that values must never be printed, logged, committed, or written to evidence;
- confirmation that `.env.local`, `.env.*`, real secret files, Authorization headers, tokens, and database URLs remain
  unreadable by Codex unless separately approved with a redacted procedure.

### C. Provider Quota Or Smoke Approval Fields

A future provider task must explicitly name:

- `provider`
- `providerName`
- `baseUrl` when applicable
- `model`
- exact command or application route to exercise
- process env key name only, never the value
- max request count
- timeout
- spend or quota ceiling
- retry policy, defaulting to no automatic retry unless approved
- allowed evidence fields
- redaction rules
- stop conditions for missing env, provider error, timeout, quota/billing failure, rate limit, redaction violation, raw
  payload/response leakage, or request count overrun

### D. Deployment Approval Fields

A future deployment task must explicitly name:

- exact deploy target;
- exact CLI command, CI job, or console action;
- build command and whether it reads env files;
- health check URL shape without secrets;
- smoke route list and expected redacted results;
- rollback command or rollback decision path;
- max deployment attempts;
- owner acceptance checklist;
- statement that `prod` is untouched.

### E. Evidence Approval Fields

Future evidence may include only:

- command name and sanitized arguments;
- exit status;
- duration;
- request count;
- redacted usage summary when approved;
- health check pass/fail;
- public or redacted identifiers;
- rollback decision;
- redaction status.

Future evidence must not include:

- raw prompt;
- provider payload;
- raw provider response;
- raw generated output;
- API key;
- Authorization header;
- token;
- secret;
- database URL;
- row data;
- production data;
- customer or customer-like private content.

## Suggested Future Approval Text

```text
批准执行 staging execution slice for personal learning AI, scope limited to [exact resource/command list]. Approved
targetEnvironment=staging only. Approved commands: [exact commands]. Approved provider/model/quota: [provider, model,
max requests, timeout, spend ceiling]. Approved env/secret handling: [env names, destination, human input procedure,
no value printing]. Approved evidence fields: [field list]. Stop on missing env, non-zero exit, timeout, provider error,
quota/billing error, rate limit, redaction violation, requestCount overrun, raw prompt/payload/response/output leakage,
or any need for schema/migration/package/lockfile/source/tests/e2e/deploy surface outside the approved list. Prod remains
untouched.
```

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md docs/05-execution-logs/evidence/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Module Run v2 precommit, closeout, and pre-push readiness

`npm.cmd run build` is not planned because prior evidence records that local build may read `.env.local`, which is outside
this task boundary.

## Execution Checklist

- [x] Re-read governing documents and batch-178 evidence/audit.
- [x] Confirm clean `master` baseline and no `codex/*` residue before creating the short branch.
- [x] Create `codex/batch-180-personal-learning-ai-staging-execution-approval-package`.
- [x] Write this approval package plan.
- [x] Update state/queue and create evidence/audit files.
- [ ] Run validation commands and record results.
- [ ] Commit one scoped batch-180 change.
- [ ] If closeout gates pass, fast-forward merge to `master`, push, delete the merged short branch, reread state/queue,
      and stop.

## Residual Risk Planned For Evidence

- The package is not executable approval for staging; it only defines what future approval must name.
- Provider economics beyond batch-174 single smoke remain unknown.
- Staging deployment feasibility remains unverified.
- Formal generated-content writes remain blocked.
