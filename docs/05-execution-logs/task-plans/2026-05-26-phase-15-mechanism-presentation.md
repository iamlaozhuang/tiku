# Phase 15 Mechanism Presentation Task Plan

**Task id:** `phase-15-mechanism-presentation`

**Branch:** `codex/phase-15-mechanism-presentation`

**Date:** 2026-05-26

## Scope

Create a static HTML presentation for team onboarding that explains the updated semi-automation mechanism from design intent, implementation model, and operational details.

Output file:

- `archive/presentations/semi-automation-mechanism-presentation.html`

State/evidence files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-15-mechanism-presentation.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-15-mechanism-presentation.md`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- latest Phase 15 evidence files
- existing `archive/presentations/*.html` files for local presentation style context

## Implementation Approach

1. Register the task as `docs_only` in the queue and point `project-state.yaml` to the active branch.
2. Build a self-contained HTML presentation with no external dependencies, no network resources, and no runtime build requirement.
3. Organize content around:
   - why the mechanism exists;
   - design principles;
   - state model and files;
   - end-to-end task lifecycle;
   - risk gates and forbidden scope;
   - evidence and closeout discipline;
   - human collaboration habits;
   - team usage checklist.
4. Include CSS/SVG diagrams and timeline visuals directly in the HTML.
5. Validate static artifact existence, key content markers, readiness, Git inventory, formatting, and whitespace.

## Risk Controls

- No `.env.local` or `.env.example` read/write.
- No dependency, package manifest, lockfile, source, test, schema, migration, staging/prod/cloud, deployment, or real provider changes.
- No external assets or CDN links.
- No claim that runtime behavior changed.
- Do not push without explicit user approval.

## Validation Plan

- `Test-Path archive\presentations\semi-automation-mechanism-presentation.html`
- `Select-String` for key presentation headings and mechanism terms.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Prettier check on changed Markdown/YAML/HTML files when available.
