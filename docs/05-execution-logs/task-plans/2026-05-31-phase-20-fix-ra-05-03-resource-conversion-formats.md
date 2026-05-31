# Phase 20 Fix RA-05-03 Resource Conversion Formats

## Summary

- Task id: `phase-20-fix-ra-05-03-resource-conversion-formats`
- Branch: `codex/phase-20-fix-ra-05-03-resource-conversion-formats`
- Date: 2026-05-31
- Scope: local-only resource conversion behavior hardening.
- Human approval boundary: local format validation, deterministic failure status, existing parser/storage capability, and evidence integrity only.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-05-rag-knowledge.md`

## Queue Finding

- Finding: `F-RA-05-03-001`
- Gap: local resource upload has Markdown/failure evidence, but DOCX/PPTX/PDF conversion behavior and explicit 50MB validation evidence are incomplete.
- Constraint: converter dependency, cloud storage, package/lockfile, schema, drizzle, migration, real provider, staging/prod, and env work remain forbidden.

## Implementation Plan

1. Add focused RED tests for:
   - DOCX/PPTX/PDF resource uploads becoming `conversion_failed` with a redaction-safe converter-unavailable reason.
   - Parser-level 50MB boundary returning `file_too_large` without reading file contents.
   - Evidence summaries not exposing local paths, raw binary placeholders, tokens, or internal numeric ids.
2. Implement the smallest local parser/runtime changes:
   - Recognize DOCX/PPTX/PDF as known document formats that require a converter unavailable in this local mock runtime.
   - Keep unsupported binary formats as `unsupported_extension`.
   - Keep the resource entry in `conversion_failed`, with `markdownContent` and hashes as `null`.
   - Use a named local resource upload limit constant instead of an inline magic number at the call site.
3. Record evidence and run required gates.
4. Commit implementation, merge into `master`, validate `master`, push, delete the merged short branch, and close queue state.

## Risk Defense

- `dependency_change`: no package, lockfile, SDK, converter, or CLI change.
- `cloud_storage`: local ignored storage only; no object storage or cloud connection.
- `resource_lifecycle`: only local `conversion_failed` and parser skip metadata; no schema or migration.
- `local_human_verification`: no browser walkthrough required because there is no frontend interaction or route rendering change; runtime route tests cover local behavior.
- `evidence_integrity`: evidence records hashes, statuses, and redacted summaries only; no raw document bodies, secrets, tokens, provider payloads, storage root paths, or env values.

## Validation Plan

- Targeted RED/GREEN:
  - `npm.cmd run test:unit -- tests/unit/phase-11-local-text-document-parser-boundary.test.ts -t "enforces the 50MB local resource parser limit"`
  - `npm.cmd run test:unit -- tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts -t "marks DOCX PPTX and PDF local resource uploads as conversion failed"`
- Task and local CI gates:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `npm.cmd run test:e2e`
  - `git diff --check`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- Build: skipped unless implementation touches frontend route/rendering/build behavior.
