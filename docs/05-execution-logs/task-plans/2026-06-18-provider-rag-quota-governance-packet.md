# Provider RAG Quota Governance Packet Plan

## Task

- Task id: `provider-rag-quota-governance-packet`
- Branch: `codex/provider-rag-quota-governance-packet`
- Date: 2026-06-18
- Packet: `provider-rag-quota-governance-packet`
- Goal: resolve each packet use case as either local-only `experience_closed` or packet-level `blocked_with_fresh_evidence`.

## Use Cases

1. `UC-STD-AI-SCORING-EXPLANATION`
2. `UC-STD-KN-RECOMMENDATION`
3. `UC-STD-RAG-KNOWLEDGE-BASE`
4. `UC-ADV-OPS-AUTH-QUOTA`
5. `UC-GATE-PROVIDER-STAGING-EXECUTION`

## Required Reads Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- Related source, focused unit tests, existing evidence, and allowed existing e2e specs:
  - `e2e/local-business-flow.spec.ts`
  - `e2e/admin-audit-navigation.spec.ts`
  - `e2e/personal-ai-generation-local-request.spec.ts`

## Start Checkpoint

- `git status --short --branch`: clean `master...origin/master` before branch creation.
- `HEAD`, `master`, and `origin/master`: `58bc22175c2c88d2a6c7cb7fa60aeebacdc470fb`.
- `Get-TikuProjectStatus`: `local_experience_task_seed_required`; candidate `standard-mvp-local-experience-readiness-audit`.
- `Get-TikuNextAction -VerboseHistory`: candidate use cases `UC-STD-KN-RECOMMENDATION`, `UC-STD-RAG-KNOWLEDGE-BASE`; no executable queued task; Cost Calibration Gate blocked.
- Previous packet handoff gate: satisfied by prior `ready_for_next_packet`, clean master, no branch residue for the previous packet.

## Status Model Guard

The matrix status may only use:

- `missing`
- `partial`
- `local_experience_ready`
- `experience_closed`
- `release_blocked`

Packet-level outcomes such as `blocked_with_fresh_evidence` and `completed_or_blocked_resolved` may appear only in task evidence, audit, queue result, and delivery notes. They must not be written as matrix status.

## Intended Resolution

| Use case                             | Current matrix status | Intended packet resolution                                                                                                                   |
| ------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `UC-STD-AI-SCORING-EXPLANATION`      | `release_blocked`     | Keep `release_blocked`; refresh blocked evidence for provider/env/staging/cost gates.                                                        |
| `UC-STD-KN-RECOMMENDATION`           | `partial`             | Attempt local deterministic recommendation closure; if focused validation and approved local e2e pass, mark `experience_closed` local-only.  |
| `UC-STD-RAG-KNOWLEDGE-BASE`          | `partial`             | Attempt local resource/knowledge-base closure; if focused validation and approved local e2e pass, mark `experience_closed` local-only.       |
| `UC-ADV-OPS-AUTH-QUOTA`              | `partial`             | Keep or move to `release_blocked`; refresh blocked evidence for Cost Calibration, provider measurement, payment, and external-service gates. |
| `UC-GATE-PROVIDER-STAGING-EXECUTION` | `release_blocked`     | Keep `release_blocked`; refresh blocked evidence and minimal approval package.                                                               |

## Validation Plan

Focused unit validation:

```powershell
npm.cmd run test:unit -- tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts src/server/services/rag-retrieval-service.test.ts src/server/services/rag-chunking-service.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts src/server/services/ops-governance-authorization-quota-summary-service.test.ts tests/unit/ai/provider-redaction-function-contract.test.ts tests/unit/rag-knowledge/rag-layering-retrieval-governance.test.ts
```

Local e2e discovery and approved existing specs:

```powershell
npm.cmd run test:e2e -- --list
npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts e2e/admin-audit-navigation.spec.ts e2e/personal-ai-generation-local-request.spec.ts
```

Closeout gates:

```powershell
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-provider-rag-quota-governance-packet.md docs/05-execution-logs/evidence/2026-06-18-provider-rag-quota-governance-packet.md docs/05-execution-logs/audits-reviews/2026-06-18-provider-rag-quota-governance-packet.md
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId provider-rag-quota-governance-packet
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId provider-rag-quota-governance-packet
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId provider-rag-quota-governance-packet
```

## Hard Blocks

- No `.env*` read/write/output.
- No package, lockfile, dependency, schema, Drizzle, or migration changes.
- No new or edited e2e specs.
- No real provider/model call, provider configuration, vector provider, real RAG provider, real quota/cost measurement, payment, external-service, staging/prod/cloud/deploy, PR, force-push, destructive DB, or Cost Calibration Gate.
- No raw question bank content, student answers, cleartext `redeem_code`, provider payload, secret, env, private row data, or raw prompt/output in evidence.

## Taste Compliance Plan

- Keep changes scoped to docs/state/evidence/audit unless validation fails.
- Preserve standard API envelope and camelCase JSON expectations in validation notes.
- Treat local-only closure as non-release-ready.
- Keep blocked gates explicit and separate from matrix status.
