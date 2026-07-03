# 2026-07-03 Content AI Draft Adoption Source Landing Evidence

## Task

`content-ai-draft-adoption-source-landing-2026-07-03`

## Scope Evidence

result: pass

- Branch: `codex/content-ai-draft-adoption-source-landing-2026-07-03`
- Base commit: `e0d745d8af082d9fd2f8e96a76343bba341d81de`
- Implementation commit: `0725b66720fe0ceee6ea36e91e6ff07f56b0c4db`.
- Evidence mode: redacted file paths, task ids, command summaries, route names, role names, and requirement/source alignment summaries only.
- Forbidden evidence: credentials, sessions, cookies, auth headers, env values, raw DB rows, PII dumps, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw generated question/paper/material content, full source content dumps, screenshots, exports, traces, raw DOM, or private fixture material.

Cost Calibration Gate remains blocked.
threadRolloverGate: this is package 16 of 16 in the approved source landing goal; complete local closeout after validation and do not start a new package without a new user direction.
automationHandoffPolicy: no automation handoff; continue manually from committed source, docs, state, queue, and package-specific evidence.
nextModuleRunCandidate: none in the current 16-package source landing map after this package closes; recommend separate user-approved follow-up only for recorded residual gaps.
Batch range: source landing package 16 of 16, content AI draft review/adoption and formal-draft boundary.
RED: accepted requirements require content AI adoption to block `evidence_status = none`, require explicit confirmation for `weak`, preserve draft/review attribution, and avoid direct publish wording. The pre-implementation focused tests failed because repository adoption did not enforce none/weak evidence gates and the UI disabled weak adoption instead of presenting an explicit confirmation action.
GREEN: content AI review now distinguishes sufficient, weak, and none evidence; weak adoption sends explicit `weakEvidenceConfirmed: true`; none adoption remains blocked; repository adoption rejects none and weak-without-confirmation at the source-of-truth layer.
localFullLoopGate: remains blocked for browser/dev-server/e2e, direct DB, Provider, schema/migration, dependency, staging/prod, deploy, release-readiness, final Pass, and production-usability work.
blocked remainder: full visual editor mapping from persisted structured generated content into reviewed formal question/paper fields, package 15's persisted employee answer storage, browser acceptance, deployment, Cost Calibration, release readiness, final Pass, and production usability remain blocked.

## Requirement Alignment

- `UX-REQ-09`, `UX-REQ-13`, `CT-REQ-023`, `CT-REQ-040`, `D11`: content AI output remains draft/review only, with source attribution, formal adoption audit boundary, and no direct publish or direct formal-write wording.
- Advanced formal-content separation SSOT: content AI-generated output can only become formal content after review/edit/validation and formal adoption; formal publish remains separate.
- Evidence gate: `none` blocks adoption; `weak` requires explicit human confirmation; sufficient evidence can proceed without adding raw reviewed draft data in the entry UI.

## Implementation Evidence

- Added optional `weakEvidenceConfirmed` to the formal adoption command model and normalizer; only explicit `true` is preserved.
- Added repository evidence gates for platform formal adoption: `none` evidence rejects approved adoption, and `weak` evidence rejects unless explicit weak confirmation is present.
- Updated content admin review UI to show separate labels for `资料充足`, `资料较少`, and `资料不足`, and to present `确认资料较少并采用草稿` only for weak evidence.
- Preserved the no-direct-publish boundary: the UI still submits review/adoption intent only, and does not fabricate `reviewedDraft` from masked result summaries.

## Validation Results

- PASS: `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts` failed before implementation with the expected missing evidence gates and weak-confirmation UI failures, then passed after implementation (2 files, 34 tests passed).
- PASS: `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-review-result-diff-service.test.ts src/server/services/admin-ai-generation-adoption-history-read-model-service.test.ts` (6 files, 51 tests passed).
- PASS: `npm.cmd run typecheck`.
- PASS: `npm.cmd run lint`.
- PASS: `npm.cmd run format:check`.
- PASS: `git diff --check`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-draft-adoption-source-landing-2026-07-03`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-ai-draft-adoption-source-landing-2026-07-03`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-draft-adoption-source-landing-2026-07-03 -SkipRemoteAheadCheck`.

## Review Notes

- Pass 1: verified source changes address only the content AI weak/none adoption gap and do not expand schema, migration, repository persistence shape beyond existing adoption repository, Provider, Prompt, browser, or deploy boundaries.
- Pass 2: verified UI wording keeps draft/review/formal-adoption/publish separation, and the request body records only explicit weak confirmation without raw generated content.

## Git Closeout

Committed, fast-forward merged to `master`, pushed to `origin/master`, and short branch cleaned in package closeout.

## Non-Claims

- No schema/migration/dependency/Provider/database/browser/deploy work is claimed.
- No release readiness, final Pass, or production usability is claimed.
