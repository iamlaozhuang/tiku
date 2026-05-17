# Phase 1 Formatting Gate Decision Implementation Plan

## Goal

Introduce the Phase 1 formatting gate after human approval, with Tailwind class sorting handled by Tailwind Labs' Prettier plugin and staged-file formatting handled by lint-staged.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Human Approval

`human approval`: the user explicitly approved execution in chat with `批准执行` on 2026-05-16.

Approved devDependencies:

- `prettier`
- `prettier-plugin-tailwindcss`
- `lint-staged`
- `husky`

## Implementation

- Add `format`, `format:check`, `lint-staged`, and `prepare` scripts.
- Add Prettier config with `prettier-plugin-tailwindcss`.
- Add `.prettierignore` for generated output, caches, worktrees, agent artifacts, and lockfile.
- Add `lint-staged` config for Prettier and ESLint staged-file processing.
- Update the actual Husky hook entrypoint at `.husky/_/h`, because `core.hooksPath` is `.husky/_`.

## Risk Controls

- No source or broad documentation files are auto-formatted in this task.
- `npm.cmd run format:check` is recorded as a baseline discovery command and currently reports historical formatting drift.
- Full quality gate and actual pre-commit hook smoke test must pass before handoff.
