# 2026-07-09 Learner AI Credential Localhost Acceptance Evidence

## Task

- Task id: `learner-ai-credential-localhost-acceptance-2026-07-09`
- Branch: `codex/learner-ai-credential-localhost-acceptance`
- Scope: validation-only credential-in-memory localhost role acceptance.

## Runtime Boundary

- Private 0704 account fixture files were read in memory only.
- Credentials, session cookies, tokens, Authorization headers, request bodies, response bodies, raw DOM, screenshots, traces, localStorage, env values, DB URLs, DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full questions, full papers, materials, resources, chunks, and private fixture contents were not recorded.
- No Provider execution, AI generation submit action, direct DB connection, DB mutation, schema migration, seed, package, lockfile, dependency, staging/prod/deploy, PR, force push, or Cost Calibration operation was performed.

## Credential-In-Memory Probe

- `personal_advanced_student`
  - Credential fields present in approved private files: yes.
  - Login HTTP status category: HTTP 200 envelope with non-success application result.
  - Follow-up session / authorization / learner AI probes: not executed because login did not produce a usable session cookie.
  - Result: blocked by private credential login failure.
- `personal_standard_student`
  - Login: pass.
  - Authorization context aggregate: 1 total context, 0 advanced AI-capable contexts.
  - Learner AI route status: HTTP 200 page shell reachable.
  - Learner AI history API aggregate: reachable with empty learner-owned history; no advanced AI-capable authorization context observed.
  - Result: standard boundary passes at authorization-context level.
- `org_advanced_employee`
  - Login: pass.
  - Authorization context aggregate: 5 total contexts, 5 organization advanced AI-capable contexts.
  - Learner AI route status: HTTP 200.
  - Learner AI request history aggregate: AI出题 count 3, AI组卷 count 2.
  - Result: organization advanced employee learner AI access passes for login, authorization, route, and history visibility.
- `org_standard_employee`
  - Credential fields present in approved private files: yes.
  - Login HTTP status category: HTTP 200 envelope with non-success application result.
  - Follow-up session / authorization / learner AI probes: not executed because login did not produce a usable session cookie.
  - Result: blocked by private credential login failure.
- `org_advanced_admin`
  - Login: pass.
  - Learner AI route shell status: HTTP 200, but learner AI APIs returned non-success application results.
  - Learner AI raw result API aggregate: no successful learner result access.
  - Result: organization advanced admin cannot access employee learner AI raw result APIs through learner endpoints.

## Conclusions

- Credential values were available for all target role labels in the approved private files.
- Current usable-login coverage passed for:
  - `personal_standard_student`
  - `org_advanced_employee`
  - `org_advanced_admin`
- Current usable-login coverage was blocked for:
  - `personal_advanced_student`
  - `org_standard_employee`
- No current source-code defect was confirmed by this task.
- No repair branch was opened because the reproduced blocker is private fixture/session readiness, not a localized code defect.

## Validation Status

- Credential-in-memory localhost role probe: PARTIAL / BLOCKED by two private credential login failures.
- `corepack pnpm@10.26.1 exec vitest run <learner-ai-focused-suite> --reporter=dot`: PASS, 11 files / 135 tests.
- `corepack pnpm@10.26.1 run typecheck`: PASS.
- `corepack pnpm@10.26.1 run lint`: PASS.
- `git diff --check`: PASS.
