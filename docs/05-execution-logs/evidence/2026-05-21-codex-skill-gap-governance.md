# Codex Skill Gap Governance Evidence

## Scope

Codex local skill gap review and readiness script correction for Tiku.

Branch:

```text
codex/skill-gap-governance
```

## Human Approval

The user approved continuing with Codex skill gap governance after confirming that some skills were still missing.

No push, PR, merge, deployment, npm dependency change, database migration, or business source change is approved by this evidence.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `C:\Users\jzzhu\.codex\skills\.system\skill-installer\SKILL.md`

## Baseline Readiness Finding

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Baseline result before this task:

- Required repository files: OK.
- Required npm scripts: OK.
- Superpowers plugin: OK.
- Local skills already installed:
  - `playwright`
  - `security-best-practices`
  - `security-threat-model`
- Several expected skill names were reported as `MISSING skill path` because the script only checked `$CODEX_HOME/skills/<skill-name>`.

## Curated Skill Source Check

Command:

```powershell
python C:\Users\jzzhu\.codex\skills\.system\skill-installer\scripts\list-skills.py --format json
```

Result: pass.

Project-relevant curated skills found:

- `yeet`
- `gh-address-comments`
- `gh-fix-ci`
- `playwright-interactive`
- `openai-docs`

`openai-docs` is already available as a system skill in the active Codex session, so it was not duplicated as a local skill.

Experimental list command:

```powershell
python C:\Users\jzzhu\.codex\skills\.system\skill-installer\scripts\list-skills.py --path skills/.experimental --format json
```

Result: no experimental source available at `skills/.experimental`.

## Local Skills Installed

Command:

```powershell
python C:\Users\jzzhu\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py --repo openai/skills --path skills/.curated/yeet skills/.curated/gh-address-comments skills/.curated/gh-fix-ci skills/.curated/playwright-interactive
```

Result: pass.

Installed:

- `C:\Users\jzzhu\.codex\skills\yeet`
- `C:\Users\jzzhu\.codex\skills\gh-address-comments`
- `C:\Users\jzzhu\.codex\skills\gh-fix-ci`
- `C:\Users\jzzhu\.codex\skills\playwright-interactive`

Note: newly installed local skills require restarting Codex before they appear in the active skill list.

## Readiness Script Update

Updated:

- `scripts/agent-system/Test-AgentSystemReadiness.ps1`

Change summary:

- Replaced local-directory-only skill checks with capability checks.
- Added local skill detection under `$CODEX_HOME/skills`.
- Added plugin skill detection under `$CODEX_HOME/plugins/cache/openai-curated`.
- Added explicit output classes:
  - `OK local skill capability`
  - `OK plugin-covered capability`
  - `OPTIONAL unresolved capability`
  - `MISSING required capability`

## Plugin-Covered Capabilities

Readiness now recognizes these as covered by active plugin caches:

- `code-review`
- `postgresql`
- `postgres-best-practices`
- `nextjs-app-router-patterns`
- `nextjs-best-practices`
- `react-nextjs-development`
- `shadcn`
- `tailwind-design-system`
- `tailwind-patterns`
- `vercel-ai-sdk-expert`
- `webapp-testing`
- `tdd-orchestrator`
- `tdd-workflow`
- `testing-patterns`

## Final Readiness Result

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result: pass.

Summary:

```text
Required repository files: OK
Required npm scripts: OK
Superpowers plugin skills: OK
Required capabilities: no MISSING required capability entries
Local GitHub workflow skills: yeet, gh-address-comments, gh-fix-ci
Local browser workflow skill: playwright-interactive
```

Remaining optional unresolved capabilities:

- `ralplan`
- `ralph`
- `code-simplifier`
- `drizzle-orm-expert`
- `rag-engineer`
- `rag-implementation`

Reserved but intentionally not installed:

- `autopilot`

## Post-Restart Third-Party Skill Installation

After Codex was restarted, the user explicitly approved installing the remaining third-party GitHub skills.

Installed:

- `ralplan` from `Yeachan-Heo/oh-my-codex`, path `skills/ralplan`.
- `ralph` from `Yeachan-Heo/oh-my-codex`, path `skills/ralph`.
- `code-simplifier` from `getsentry/skills`, path `skills/code-simplifier`.
- `rag-implementation` from `applied-artificial-intelligence/claude-code-toolkit`, path `skills/rag-implementation`.
- `drizzle-orm-expert` from `mogharsallah/nyngi-web-app`, path `.claude/skills/drizzle`, installed under local skill name `drizzle-orm-expert`.
- `rag-engineer` from `sickn33/antigravity-awesome-skills`, path `skills/rag-engineer`.

Failed and corrected attempts:

- `applied-artificial-intelligence/rag-implementation` was not an accessible standalone repo; the correct source was `applied-artificial-intelligence/claude-code-toolkit`.
- `RhushabhVaghela/openclaw-workspace` was not accessible for `drizzle-orm-expert`.
- `mogharsallah/nyngi-web-app` did not expose `SKILL.md` at `drizzle`; the correct path was `.claude/skills/drizzle`.
- `claudiodearaujo/sistema-de-narra-o-de-livro` and `openclaw/skills` were not accessible for `rag-engineer`; the final accessible source was `sickn33/antigravity-awesome-skills`.

Temporary inspection clones were created under `C:\tmp` and removed after path verification.

## Post-Installation Readiness Result

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result: pass.

Summary:

```text
OK local skill capability: ralplan via ralplan
OK local skill capability: ralph via ralph
OK local skill capability: code-simplifier via code-simplifier
OK local skill capability: drizzle-orm-expert via drizzle-orm-expert
OK local skill capability: rag-engineer via rag-engineer
OK local skill capability: rag-implementation via rag-implementation
Required capabilities: no missing entries
Reserved skill path not installed: autopilot
```

Local skill directories after installation:

```text
code-simplifier
drizzle-orm-expert
gh-address-comments
gh-fix-ci
playwright
playwright-interactive
rag-engineer
rag-implementation
ralph
ralplan
security-best-practices
security-threat-model
yeet
```

## Formatting Gate

Command:

```powershell
npm.cmd run format:check
```

Result: pass.

Summary:

```text
All matched files use Prettier code style.
```

## Risk Review

- No npm dependency changed.
- No lockfile changed.
- No `src/` business code changed.
- No database files changed.
- No secrets were read or recorded.
- No remote repository action was performed.

## Follow-Up

After restarting Codex, rerun:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

The newly installed local skills should then be available to the active Codex session.
