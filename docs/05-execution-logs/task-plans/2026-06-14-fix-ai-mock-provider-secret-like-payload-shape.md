# Fix AI Mock Provider Secret-Like Payload Shape Plan

## Task

- Task id: `fix-ai-mock-provider-secret-like-payload-shape`
- Branch: `codex/fix-ai-mock-provider-secret-like-payload-shape`
- Date: 2026-06-14 local time
- Source story: current-state checkpoint implementation audit follow-up.
- Strict serial position: task 5 after `fix-personal-ai-generation-persistence-failure-semantics`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/ai/mock-provider.ts`
- `tests/unit/ai/provider-redaction-function-contract.test.ts`
- `src/server/contracts/ai/provider-redaction-contract.ts` read-only context.

## Start Baseline

- Current branch before short branch creation: `master`
- Short branch: `codex/fix-ai-mock-provider-secret-like-payload-shape`
- `HEAD`: `f028f0ad126e6662a561119ed9b983418c9a86ec`
- `master`: `f028f0ad126e6662a561119ed9b983418c9a86ec`
- `origin/master`: `f028f0ad126e6662a561119ed9b983418c9a86ec`
- Worktree before task 5 edits: clean.
- Local `codex/*` residue: none.
- Remote `origin/codex/*` residue: none observed.

## Scope

This task tightens the mock provider redaction-safe shape:

- Add RED coverage proving the mock provider does not construct secret-like provider payload field names or request ids.
- Replace mock provider payload envelopes with neutral redaction references that preserve redaction status and summaries.
- Preserve provider execution gate behavior and raw prompt/answer redaction.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/ai/mock-provider.ts`
- `tests/unit/ai/provider-redaction-function-contract.test.ts`

Blocked files and surfaces:

- `.env.local`, `.env.example`, `.env.*`, and any real secret/provider configuration.
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`.
- `src/db/schema/**`, `drizzle/**`, `e2e/**`, `scripts/**`.
- Real provider/model calls, quota use, schema/migration, dependency changes, deployment, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## TDD Plan

1. RED: Update the provider redaction unit test to expect neutral redaction reference objects rather than payload-shaped
   envelopes, and assert serialized mock provider result contains no `payloadKind`, `provider_request`,
   `provider_response`, `requestId`, `apiKey`, or `secret`.
2. Run `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts` and confirm it fails
   against the current mock provider shape.
3. GREEN: Change `createMockAiProvider` to construct neutral redaction reference objects without importing or creating
   provider payload envelopes.
4. Re-run the target AI/redaction unit test and confirm redaction behavior still passes.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-ai-mock-provider-secret-like-payload-shape`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-ai-mock-provider-secret-like-payload-shape`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-ai-mock-provider-secret-like-payload-shape`

## Risk Controls

- Evidence must not include token values, Authorization headers, passwords, secrets, database URLs, row data, provider
  payloads, model responses, raw prompts, generated content, or private user data.
- Do not run e2e or any real provider smoke.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Do not modify package files, lockfiles, schema, migrations, scripts, or generated report directories.
- Stop immediately on validation failure or any gate that requires new human approval.
