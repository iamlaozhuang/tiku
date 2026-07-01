# AI Generation Provider Structure Feedback Repair

## Task

- Task id: `ai-generation-provider-structure-feedback-repair-2026-07-01`
- Branch: `codex/ai-generation-provider-structure-feedback-repair`
- Scope: repair PROVIDER-001 structured preview parsing and PROVIDER-002 learner near-action feedback placement.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- All ADR files under `docs/02-architecture/adr/`

## Boundaries

- Do not read, print, store, or commit credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database URLs, raw DB rows, internal auto ids, PII, raw Provider payloads, prompts, raw AI input/output, or complete generated content.
- No dependency, package, lockfile, schema, migration, seed, staging, prod, cloud, deploy, PR, force push, release readiness, final Pass, or Cost Calibration changes.
- Local browser and real Qwen resmoke are allowed only after source validation and only via localhost, bounded to at most 8 submit attempts with redacted evidence.

## Root Cause Summary

- PROVIDER-001: structured preview was built from `visibleGeneratedContent.content`, but that field is intentionally truncated for display. Long JSON output can therefore become invalid before parsing.
- PROVIDER-001: owner preview Qwen output cap was too low for ten structured question drafts.
- PROVIDER-002: learner visible result content is nested inside the contract summary, below detail controls and practice actions, so operators do not get near-action feedback.

## Implementation Plan

1. Add failing tests for long JSON preview parsing, local Qwen output limit, and learner near-action placement.
2. Parse structured preview from full Provider text before truncating visible content.
3. Use a bounded but realistic owner preview output token limit for ten draft summaries.
4. Move learner visible generated content to the near-action area while keeping contract metadata below.
5. Run focused tests, formatting, lint, typecheck, diff check, Module Run v2 gates, and bounded localhost resmoke if the local service is healthy.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed-files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-structure-feedback-repair-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-structure-feedback-repair-2026-07-01 -SkipRemoteAheadCheck`
