# AP-01 AI Scoring Provider Execution Approval Package Plan

## Task

- AP id: `AP-01`
- Task id: `ap-01-ai-scoring-provider-execution-approval-package`
- Use case id: `UC-STD-AI-SCORING-EXPLANATION`
- Branch: `codex/ap-serial-approval-package-execution`
- Created at: `2026-06-18T19:46:09-07:00`
- Task kind: `high_risk_approval_package`
- Execution result for this packet: minimum approval package only; execution remains blocked.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-blocked-gates-approval-package-materialization.md`
- `docs/05-execution-logs/evidence/2026-06-18-blocked-gates-approval-package-materialization.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-blocked-gates-approval-package-materialization.md`

## Current Facts

- The AP-01 task queue record is `status: blocked`.
- The AP-01 matrix row is `status: release_blocked`.
- The matrix blocked gate is `provider_call_env_secret_cost_calibration_staging_prod`.
- The task's `nextApprovalRequired` is
  `exact_provider_model_route_allowed_files_request_cost_redaction_and_rollback`.
- Existing evidence and audit are the AP-00 through AP-11 materialization packet.

## Minimum Approval Package

### Target And Success Criteria

Target: convert AP-01 from a blocked approval package into a separately approved, scoped provider execution task for
`UC-STD-AI-SCORING-EXPLANATION`.

Success criteria for a future approved execution task:

- a named provider key and model name are supplied by the human approver without exposing the secret value;
- request count, timeout, retry, and spend ceilings are explicit;
- provider execution is limited to local `dev` validation unless the approval separately names a staging target;
- `ai_scoring` execution produces only redacted evidence and standard API/log contract evidence;
- no raw prompt, question content, student answer, standard answer, provider payload, secret, env value, token,
  Authorization header, database URL, row data, or private file URL is written to evidence;
- Cost Calibration Gate remains blocked unless the approval explicitly names it and its measurement ceiling.

### Current Docs/State Allowed Files

This packet is limited to these files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md`

### Future Execution Files That Must Be Reconfirmed

A later approval must restate exact allowed files. The likely review set is:

- `src/ai/mock-provider.ts`
- `src/server/services/ai-scoring-service.ts`
- `src/server/services/ai-mock-provider-runtime.ts`
- `src/server/services/model-config-runtime.ts`
- `src/server/services/student-flow-runtime.ts`
- `src/server/repositories/ai-scoring-attempt-repository.ts`
- `src/server/repositories/ai-call-log/ai-call-log-repository.ts`
- `src/server/repositories/ai-call-log/in-memory-ai-call-log-repository.ts`
- `src/server/repositories/ai-call-log/postgres-ai-call-log-repository.ts`
- `src/app/api/v1/model-configs/route.ts`
- `src/app/api/v1/model-configs/[publicId]/route.ts`
- `src/app/api/v1/ai-call-logs/route.ts`
- `src/app/api/v1/ai-call-logs/summary/route.ts`
- `src/server/services/ai-scoring-service.test.ts`
- `tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts`
- `tests/unit/phase-12-model-config-server-runtime.test.ts`
- `tests/unit/ai/provider-redaction-function-contract.test.ts`

No future source or test file is approved by this packet.

### Current Exact Commands

This packet may run only docs/state governance validation:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-ai-scoring-provider-execution-approval-package -Capability providerKey -Intent declare_adapter`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-ai-scoring-provider-execution-approval-package -Capability providerCall -Intent declare_adapter`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md docs/05-execution-logs/evidence/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-ai-scoring-provider-execution-approval-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-ai-scoring-provider-execution-approval-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-01-ai-scoring-provider-execution-approval-package`

### Future Execution Commands That Must Be Reconfirmed

A later provider execution approval must provide the exact provider execution command. This packet does not approve one.
The minimum validation command set for any later approved AP-01 execution should include:

- `npm.cmd run test:unit -- src/server/services/ai-scoring-service.test.ts tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/ai/provider-redaction-function-contract.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-ai-scoring-provider-execution-approval-package -Capability providerKey -Intent use_capability`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId ap-01-ai-scoring-provider-execution-approval-package -Capability providerCall -Intent use_capability`

### Explicitly Forbidden In This Packet

- `.env*` read/write/output
- secret/env value access or disclosure
- real provider/model call
- staging/prod/cloud/deploy
- payment/external-service
- Cost Calibration Gate
- vector provider or real RAG provider execution
- quota-cost measurement
- schema/drizzle/migration
- package/lockfile/dependency change
- product source change
- tests/e2e change or new e2e
- PR
- force push or `--force-with-lease`
- destructive database operation
- raw sensitive evidence exposure

### Rollback And Stop Conditions

Stop immediately if:

- any command would read, write, or print `.env*`, a secret, a token, a database URL, or provider payload;
- any provider/model call would exceed the approved request or spend ceiling;
- any output includes raw prompt, raw answer, raw question bank content, standard answer, student answer, row data, or
  private URL;
- any command targets staging, prod, cloud, deployment, payment, or external service without fresh approval;
- validation attempts to change package/lockfile, schema/drizzle/migration, product source, or e2e files outside the
  approved file list.

Rollback for this docs/state packet is a normal git revert of the AP-01 docs/state commit before any later provider
execution. Future provider execution must define its own rollback and data deletion plan.

### Redaction Evidence Plan

Evidence may record only:

- AP id, task id, use case id, branch, commit, and command names;
- provider key alias and model name after human supplies them, but never the secret value;
- request count, timeout, retry, spend ceiling, pass/fail status, and redaction status;
- `ai_call_log` contract field names and redaction status, not raw payloads or rows.

Evidence must not include raw question bank content, student answers, standard answers, cleartext `redeem_code`, raw
prompts, raw model/provider responses, provider payloads, secrets, env values, tokens, Authorization headers, database
URLs, private row data, screenshots, traces, or DOM dumps.

### Fresh Approval Text Required

To execute AP-01 later, reply with a filled version of this text:

```text
I fresh approve AP-01 provider execution for task ap-01-ai-scoring-provider-execution-approval-package and useCase
UC-STD-AI-SCORING-EXPLANATION.

Exact target:
- providerKey alias, no secret value: <fill exact provider key alias>
- modelName: <fill exact model name>
- environment: dev/local only OR <fill exact staging target if staging is approved>
- maxRequests: <fill integer>
- maxSpend: <fill currency and amount, or "no paid provider call">
- timeoutSeconds: <fill integer>
- retryLimit: <fill integer>

Exact allowed files:
<paste exact file list>

Exact allowed commands:
<paste exact command list>

I explicitly keep .env* disclosure, secret value output, unbounded provider/model calls, staging/prod/cloud/deploy unless
named above, payment/external-service, Cost Calibration Gate unless named above, schema/drizzle/migration,
package/lockfile/dependency, unrelated product source, tests/e2e changes, PR, force-push, destructive DB, and raw
sensitive evidence blocked.

Rollback/stop/redaction:
Use the AP-01 rollback, stop conditions, and redaction evidence plan from
docs/05-execution-logs/task-plans/2026-06-18-ap-01-ai-scoring-provider-execution-approval-package.md.
```

## Current Validation Plan

Run the current exact commands above, write redacted results to AP-01 evidence, keep the task `status: blocked`, keep the
matrix row `status: release_blocked`, then commit, fast-forward merge to `master`, push `origin/master`, and delete the
merged short branch if gates pass.

Cost Calibration Gate remains blocked.
