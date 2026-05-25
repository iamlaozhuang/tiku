# Task Plan: Phase 11 Paper Asset Local Boundary Closeout

## Task

Close the P3 local validation finding that `paper_asset` validation is metadata-only in local/dev. The goal is to make the local product boundary explicit and test-covered without implementing object storage, OCR, public URLs, or file-byte upload.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md`
- `docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-system-validation.md`

## Scope

Allowed changes:

- `src/features/admin/paper-management/**`
- focused tests under `tests/unit/**`
- this task plan and evidence
- agent state and task queue status

Forbidden changes:

- No dependency, package, or lockfile changes.
- No schema, migration, or script changes.
- No `.env.local`, `.env.example`, secret, token, provider payload, raw prompt, raw answer, raw model response, full paper, textbook, OCR, or customer/customer-like private content access or output.
- No staging/prod connection.
- No deployment.
- No cloud, DNS, Tencent Cloud COS, public object storage URL, or external resource change.
- No real file upload, OCR, object-storage implementation, or public URL creation.

## Implementation Plan

1. Add a failing unit test that expects the admin paper asset form to label the flow as local metadata registration and to avoid presenting a real file upload input.
2. Update the admin paper management copy and success message so the local boundary is explicit.
3. Keep the existing API payload as metadata-only and keep `objectKey` out of the DOM.
4. Update project state, task queue, and evidence.
5. Run focused tests, full unit tests, E2E, build, and agent gates.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-paper-asset-local-boundary-closeout`
- `npm.cmd run test:unit -- tests/unit/admin-paper-ui.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Treat this as product-boundary closeout, not storage implementation.
- Keep object storage and public URL work blocked on future external readiness and explicit approval.
- Do not record file content, object keys, secret values, or private data in evidence.
