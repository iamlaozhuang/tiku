# 2026-07-09 content AI question formal publish loop evidence

## Scope

- Task id: `content-ai-question-formal-publish-loop-2026-07-09`
- Branch: `codex/content-ai-question-formal-publish-loop`
- Scope: content-admin AI question adoption to non-user-usable formal question draft, then explicit publish through the question detail edit path.
- Out of scope: AI paper publish loop, organization training, personal AI, organization admin AI generation, Provider execution, DB connection or mutation, schema migration, dependency or lockfile changes, browser runtime, screenshots, raw DOM, env or secret access.

## Redacted Finding

- The current formal question writer path defaulted created questions to the existing user-usable status.
- The repository already supports only two question statuses; this branch uses the existing non-user-usable status as the AI-created formal question draft gate without schema changes.
- The top-level content-admin AI question adoption path now passes an internal initial-status option.
- AI paper companion question creation is intentionally unchanged in this branch.

## Requirement Mapping Result

- Current AI-generation traceability requires content AI出题 adoption to produce reviewable formal drafts before learner use.
- Current question/paper requirements do not define a separate question draft enum, so this branch maps the draft gate to the existing non-user-usable question status without schema changes.
- Authorization SSOT and ADR-007 remain unchanged; personal AI, organization admin AI, organization employee visibility, and organization training are covered only by adjacent regression.
- AI组卷 formal paper closure remains out of scope for the next serial branch.

## Validation

- Red TDD run: expected failures observed in 3 files / 4 assertions for missing initial-status propagation and missing explicit publish UI.
- Targeted green:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/question-service.test.ts tests/unit/admin-question-material-ui.test.ts --reporter=dot`
  - Result: pass, 3 files / 46 tests.
- Adjacent role-boundary regression:
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 6 files / 160 tests.
- `corepack pnpm@10.26.1 run typecheck`: pass.
- `corepack pnpm@10.26.1 run lint`: pass.
- `git diff --check`: pass.
- Module Run v2 pre-commit hardening:
  - Initial run: failed only because the evidence/audit mapping anchor was missing.
  - After adding `Requirement Mapping Result`: pass.
- Module Run v2 pre-push readiness:
  - Initial run: failed only because the accepted ancestor repository checkpoint was stale.
  - After aligning `lastKnownMasterSha` and `lastKnownOriginMasterSha` to the confirmed local `master` / `origin/master`: pass.
- Master post-merge gates:
  - Targeted question formal publish loop tests: pass, 3 files / 46 tests.
  - Adjacent role-boundary regression: pass, 6 files / 160 tests.
  - `corepack pnpm@10.26.1 run typecheck`: pass.
  - `corepack pnpm@10.26.1 run lint`: pass.
  - `git diff --check`: pass.

## Redaction Boundary

- Evidence records only task ids, file paths, code symbol categories, counts, and pass/fail status.
- No credentials, sessions, cookies, tokens, localStorage/Auth header values, env values, DB URLs, DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full question text, full paper text, full material text, full resource/chunk content, screenshots, traces, or raw DOM were recorded.
