# Codex Skill Gap Governance Plan

## Status

Approved by the user on 2026-05-21.

## Purpose

Reduce false negatives and real capability gaps in the local Codex readiness check before further Tiku development.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `C:\Users\jzzhu\.codex\skills\.system\skill-installer\SKILL.md`

## Current Finding

`Test-AgentSystemReadiness.ps1` reports many missing local skill paths because it checks only:

```text
$CODEX_HOME/skills/<skill-name>
```

This misses capabilities supplied by enabled Codex plugins under:

```text
$CODEX_HOME/plugins/cache/openai-curated/<plugin>/.../skills/<skill-name>
```

Therefore, the task is not to install every reported name blindly. The task is to classify missing entries and install only skills with a clear source and direct project value.

## Scope

Allowed changes:

- Add this task plan.
- Add evidence under `docs/05-execution-logs/evidence/`.
- Update `scripts/agent-system/Test-AgentSystemReadiness.ps1` so it distinguishes:
  - local installed skills;
  - plugin-covered capabilities;
  - optional unresolved skills;
  - reserved skills.
- Install local curated Codex skills that are available and useful for this repo.

Forbidden changes:

- No project npm dependency changes.
- No `package.json` or lockfile changes.
- No business source changes under `src/`.
- No database migration changes.
- No deployment, push, PR, or merge without separate approval.
- No global Git configuration changes.

## Initial Classification Strategy

### Local Skills Already Installed

- `playwright`
- `security-best-practices`
- `security-threat-model`

### Candidate Curated Local Skills

From the OpenAI curated list, project-relevant installable candidates are:

- `yeet`
- `gh-address-comments`
- `gh-fix-ci`
- `playwright-interactive`
- `openai-docs`

`openai-docs` is already available as a system skill in this Codex session, so local installation is optional.

### Plugin-Covered Capabilities

The current Codex session exposes plugin skills for:

- GitHub publishing and PR feedback workflows.
- Code review through CodeRabbit.
- Next.js, React, shadcn, Vercel AI SDK, and frontend testing through Build Web Apps / Vercel plugins.
- Postgres best practices through Build Web Apps.
- TDD and workflow governance through Superpowers.

These should be reported as plugin-covered rather than missing.

### Optional / Unresolved Capability Names

The following readiness names have no direct curated skill match in the current OpenAI skill list:

- `ralplan`
- `ralph`
- `code-simplifier`
- `drizzle-orm-expert`
- `tailwind-design-system`
- `tailwind-patterns`
- `rag-engineer`
- `rag-implementation`
- `webapp-testing`
- `e2e-testing`
- `tdd-orchestrator`
- `tdd-workflow`
- `testing-patterns`

Some are still covered by plugins at the capability level. Exact local skill installation should be deferred unless a trusted source is identified.

## Implementation Steps

1. Re-run `Test-AgentSystemReadiness.ps1` and record the baseline missing list.
2. Query curated and experimental skill indexes.
3. Install curated local skills that are available and directly useful.
4. Update the readiness script to detect plugin-covered capabilities without hiding unresolved optional gaps.
5. Re-run readiness.
6. Run `npm.cmd run format:check` because the task edits Markdown and PowerShell.
7. Record evidence.
8. Confirm no npm dependencies, lockfiles, business code, secrets, or database files changed.

## Risk Controls

- Installing Codex skills writes only under `$CODEX_HOME/skills`, not inside the repository.
- Repository changes are limited to documentation and readiness script logic.
- Readiness output must not claim optional unresolved capabilities as hard blockers.
- If any skill install fails, stop and record the failed source instead of inventing a replacement.
- If a newly installed skill requires a Codex restart, report that explicitly.

## Self-Check

- This plan does not modify app runtime behavior.
- This plan does not modify dependencies.
- This plan does not touch secrets.
- This plan keeps plugin-covered capabilities distinct from local installed skills.
- This plan preserves future ability to add exact specialist skills when trusted sources are known.
