# Evidence: Agent Mechanism Hardening

## Metadata

- Task id: `agent-mechanism-hardening`
- Branch: `codex/phase-0-2-mechanism-review`
- Worktree: `F:\tiku\.worktrees\phase-0-2-mechanism-review`
- Base: `master`
- Evidence recorded at: `2026-05-19T00:31:00+08:00`

## Scope

Implemented mechanism hardening based on `docs/05-execution-logs/audits-reviews/2026-05-19-phase-0-2-mechanism-review.md`.

Created:

- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/task-plans/2026-05-19-agent-mechanism-hardening.md`
- `docs/05-execution-logs/evidence/2026-05-19-agent-mechanism-hardening.md`
- `scripts/agent-system/Test-NamingConventions.ps1`
- `scripts/agent-system/New-TaskEvidence.ps1`

Modified:

- `docs/03-standards/testing-tdd.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/git-workflow.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`

Not changed:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`

## Implementation Summary

- Updated TDD standards from pending tooling to active Vitest and Playwright tooling.
- Added a security review gate SOP for high-risk authorization, API contract, data contract, schema, session, token, admin, and similar work.
- Added `Test-NamingConventions.ps1`, a read-only scan for banned business terms, risky generic terms, API route folder casing, public-id route parameters, and DTO camelCase fields.
- Added `New-TaskEvidence.ps1`, an evidence skeleton generator that records task, branch, validation, review, git closeout, and taste self-check slots.
- Registered the new SOP and scripts in `Test-AgentSystemReadiness.ps1`.
- Updated local CI, automation loop, and git workflow docs so the new gates are visible during task startup, execution, validation, and closeout.

## Validation

### PowerShell Script Parse

Command:

```powershell
Get-ChildItem -Path 'scripts\agent-system' -Filter '*.ps1' | ForEach-Object { $parseErrors = $null; $content = Get-Content -LiteralPath $_.FullName -Raw; $null = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$parseErrors); if ($parseErrors.Count -gt 0) { throw "Parse failed: $($_.Name)" }; Write-Output "Parsed $($_.Name)" }
```

Result:

- Exit code: `0`
- Parsed all agent-system scripts, including `New-TaskEvidence.ps1` and `Test-NamingConventions.ps1`.

### Naming Convention Scan

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Initial non-escalated result:

- Exit code: `1`
- Cause: local constrained-language sandbox attempted a dot-source invocation.

Escalated read-only result:

- Exit code: `0`
- Output included:
  - `OK banned terms absent`
  - `OK standalone section/option absent`
  - `OK route folders use kebab-case and public-id route params`
  - `OK contract DTO fields are camelCase`
  - `naming convention scan completed`

### Agent System Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result:

- Exit code: `0`
- Output included the new required files:
  - `docs\04-agent-system\sop\security-review-gate.md`
  - `scripts\agent-system\Test-NamingConventions.ps1`
  - `scripts\agent-system\New-TaskEvidence.ps1`

### Quality Gate

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result:

- Exit code: `0`
- Output included:
  - lint: pass
  - typecheck: pass
  - test:unit: `29 passed (29)`, `64 passed (64)`
  - format:check: `All matched files use Prettier code style!`

### Git Completion Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result:

- Exit code: `0`
- Output showed branch `codex/phase-0-2-mechanism-review`.
- Tracked changes were limited to standards, SOP, and readiness script files.
- Untracked files were limited to the new security SOP, task plan, and two agent-system scripts before this evidence file was added.

## Review

Security review required: yes, because the task changes security review process and naming guardrails.

Review result:

- This is governance and read-only tooling work only.
- The new naming script scans `src/server` and `src/app/api/v1`; it does not modify files.
- The evidence generator writes only when explicitly invoked and refuses to overwrite an existing evidence file.
- Self-review found and fixed an evidence-template interpolation issue by switching `New-TaskEvidence.ps1` to placeholder replacement.
- No dependency, schema, migration, secret, or runtime source change was introduced.

Accepted residual risk:

- `Test-NamingConventions.ps1` is intentionally conservative and lightweight. It is not a full AST-based lint rule and may need refinement when Phase 3 adds legitimate `paper_section` and `question_option` entities.
- Security review gate enforcement is process-based for now. Future hardening can add task queue schema validation.

## Git Closeout

- implementationCommit: pending before commit.
- closeoutEvidenceCommit: pending after merge, push, and cleanup.
- merge: pending.
- push: pending.
- cleanup: pending.

## Taste Compliance Self-Check

- Standard API response: no runtime API response code was changed; docs reinforce `{ code, message, data }`.
- Naming discipline: added a naming scan for banned terms, route casing, public-id route params, and DTO camelCase.
- Public ID boundary: route parameter scan flags non-public id route params.
- Layering: no runtime layering was changed; mechanism docs reinforce scoped execution.
- Dependency isolation: package and lock files were not changed.
- Schema and migration boundary: schema and migration files were not changed.
- Evidence before conclusion: validation outputs are recorded before closeout.
