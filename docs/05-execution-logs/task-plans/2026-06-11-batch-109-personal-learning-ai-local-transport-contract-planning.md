# Task Plan: batch-109-personal-learning-ai-local-transport-contract-planning

## Task

- id: `batch-109-personal-learning-ai-local-transport-contract-planning`
- branch: `codex/batch-109-personal-ai-transport-planning`
- task kind: `docs_only`
- local validation level: `L4 local transport/API/contract planning`

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `docs/05-execution-logs/evidence/phase-82-personal-learning-ai-module-run-proposal.md`
- `docs/05-execution-logs/audits-reviews/phase-82-personal-learning-ai-module-run-proposal.md`
- `src/server/models/personal-ai-generation-request.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/services/personal-ai-generation-request-service.ts`
- `src/server/services/personal-ai-generation-request-service.test.ts`
- existing route-handler pattern in `src/server/services/student-paper-route.ts`
- existing App Router export pattern in `src/app/api/v1/student-papers/route.ts`

## Goal

Plan the next L4 local transport/API/contract bridge for `personal-learning-ai-experience` without changing product code.
The follow-up implementation task is `batch-110-personal-learning-ai-local-transport-contract`.

## Existing Code Facts

- The local service contract already exists as `buildPersonalAiGenerationRequestReadModel(input)`.
- The contract returns the standard `{ code, message, data }` envelope.
- The DTO already uses camelCase fields and redacts `redeem_code`, `audit_log`, and `ai_call_log` references.
- The validator rejects `ai_scoring` by disallowing the `"scoring"` function type.
- There is no current `/api/v1/**` route for this personal AI request contract.

## L4 Transport Plan For Batch 110

### Route Boundary

Create a thin local transport adapter:

- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`

The REST path is:

```text
POST /api/v1/personal-ai-generation-requests
```

Rationale:

- Uses `/api/v1/`.
- Uses kebab-case plural resource noun.
- Does not expose numeric ids in the URL.
- Uses POST because the route normalizes a request contract from user/session context and submitted body.
- Does not call a provider, create a task, write a database row, or execute generation.

### Request Contract

The route body should accept only transport-safe camelCase fields:

```json
{
  "authorizationPublicId": "personal_auth_public_123",
  "aiFuncType": "explanation",
  "questionPublicId": "question_public_123",
  "answerRecordPublicId": "answer_record_public_123",
  "paperPublicId": "paper_public_123",
  "mockExamPublicId": "mock_exam_public_123",
  "redeemCodePublicId": "redeem_code_public_123",
  "auditLogPublicId": "audit_log_public_123",
  "aiCallLogPublicId": "ai_call_log_public_123"
}
```

The route must derive `userPublicId` from a resolver, not from client body. If no local user context is available, return:

```json
{
  "code": 401001,
  "message": "User session is required.",
  "data": null
}
```

### Response Contract

Success response delegates to `buildPersonalAiGenerationRequestReadModel` after merging `userPublicId`:

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "userPublicId": "user_public_123",
    "authorizationPublicId": "personal_auth_public_123",
    "aiFuncType": "explanation",
    "runtimeStatus": "local_contract_only",
    "generationContext": {
      "questionPublicId": "question_public_123",
      "answerRecordPublicId": "answer_record_public_123",
      "paperPublicId": "paper_public_123",
      "mockExamPublicId": "mock_exam_public_123"
    },
    "redeemCodeReference": {
      "publicId": "redeem_code_public_123",
      "redactionStatus": "redacted"
    },
    "evidenceReferences": {
      "auditLogPublicId": "audit_log_public_123",
      "aiCallLogPublicId": "ai_call_log_public_123",
      "redactionStatus": "redacted"
    }
  }
}
```

Invalid input must preserve the existing service error:

```json
{
  "code": 400011,
  "message": "Invalid personal AI generation request input.",
  "data": null
}
```

### Test Plan For Batch 110

Create focused unit tests in `src/server/services/personal-ai-generation-request-route.test.ts`:

1. `POST` merges resolver-provided `userPublicId` with request body and returns the redacted standard envelope.
2. Missing user context returns `401001` and does not call the service path with a body-provided user id.
3. Body-provided `userPublicId`, numeric `id`, raw prompt, raw answer, raw generated content, token, and plaintext
   `redeem_code` are ignored or absent from serialized response.
4. Invalid `aiFuncType: "scoring"` returns `400011`.

Required focused validation command:

```powershell
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts
```

### Batch 110 Allowed Surface Confirmation

Batch110 may edit only:

- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- existing contract/service imports only when required by the thin adapter
- task plan, evidence, audit, project-state, and task-queue files

Batch110 must not edit schema, migrations, repositories, provider runtime, env/secret files, package files, lockfiles,
UI pages, or e2e specs. If route implementation requires those surfaces, stop and report a blocked boundary.

## Risk Defense

- L4 is local contract transport only, not AI generation execution.
- No provider call, provider configuration, raw prompt, raw generated AI content, provider payload, secret, token,
  database URL, Authorization header, plaintext `redeem_code`, full `paper`, full `material`, or raw DB row may enter
  evidence.
- The route must use public identifiers only.
- The route handler and App Router export must remain thin adapters over service logic.
- `Cost Calibration Gate remains blocked`.

## Validation Commands

1. `node .\node_modules\prettier\bin\prettier.cjs --write docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-batch-109-personal-learning-ai-local-transport-contract-planning.md docs\05-execution-logs\evidence\batch-109-personal-learning-ai-local-transport-contract-planning.md docs\05-execution-logs\audits-reviews\batch-109-personal-learning-ai-local-transport-contract-planning.md`
2. `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-batch-109-personal-learning-ai-local-transport-contract-planning.md docs\05-execution-logs\evidence\batch-109-personal-learning-ai-local-transport-contract-planning.md docs\05-execution-logs\audits-reviews\batch-109-personal-learning-ai-local-transport-contract-planning.md`
3. `Select-String -Path docs\05-execution-logs\task-plans\2026-06-11-batch-109-personal-learning-ai-local-transport-contract-planning.md,docs\05-execution-logs\evidence\batch-109-personal-learning-ai-local-transport-contract-planning.md,docs\05-execution-logs\audits-reviews\batch-109-personal-learning-ai-local-transport-contract-planning.md -Pattern 'personal-learning-ai-experience','local_api_or_server_action_contract','localExperienceAcceptanceBridgeApproved','authorization','paper','mock_exam','ai_call_log','Cost Calibration Gate remains blocked'`
4. `git diff --check`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-109-personal-learning-ai-local-transport-contract-planning`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-109-personal-learning-ai-local-transport-contract-planning`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-109-personal-learning-ai-local-transport-contract-planning`

## Stop Conditions

- Any planning or queue adjustment requires product source edits in batch109.
- Batch110 would require schema/migration, dependency, env/secret, provider, deploy, payment, external-service,
  destructive DB, e2e execution, PR, force push, or Cost Calibration Gate work.
- Evidence would need sensitive content or raw runtime payloads.
- Changed files exceed batch109 `allowedFiles`.
- Remote divergence appears before approved closeout.
