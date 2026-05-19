# Phase 4 Student Home UI Baseline Evidence

## Metadata

- Task id: `phase-4-student-home-ui-baseline`
- Branch: `codex/phase-4-student-home-ui-baseline`
- Base: `master`
- Worktree: `F:\tiku\.worktrees\phase-4-student-home-ui-baseline`
- Date: 2026-05-19
- Result: pass

## Scope

Implemented the Phase 4 student home UI baseline for `US-03-01`:

- Effective `authorization` scopes are displayed as selectable profession/level controls.
- The remembered scope is selected when present; otherwise the first available scope is used.
- Papers are filtered by selected `profession` and `level`, grouped by `subject` (`theory` / `skill`), and sorted by `publishedAt` descending.
- Paper cards expose `data-public-id` only and route actions with `paperPublicId`.
- Loading, error, empty-paper, and no-authorization states are explicit UI states.
- The route `src/app/(student)/home/page.tsx` now renders the student home feature instead of the Phase 2 placeholder.

This task did not change dependencies, schema, migrations, env files, or API route behavior. A frozen dependency install was run only inside the fresh worktree to create local `node_modules` for `next build`; `package.json` and lockfiles were not modified.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-student-home-ui-baseline-security-review.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-home-ui-baseline.md`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-home-ui-baseline.md`
- `src/app/(student)/home/page.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `tests/unit/student-home-ui.test.ts`

## TDD Evidence

### Baseline

Command:

```powershell
npm.cmd run test:unit
```

Result: pass before implementation in the isolated worktree.

Key output:

```text
Test Files 61 passed (61)
Tests 184 passed (184)
```

### RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts
```

Initial sandbox result: failed with `spawn EPERM`; rerun outside the sandbox for the Vite helper process.

Expected RED result: fail because the target module did not exist.

Key output:

```text
Failed to resolve import "@/features/student/home/StudentHomePage"
```

### GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts
```

Result: pass after implementation.

Key output:

```text
Test Files 1 passed (1)
Tests 4 passed (4)
```

## Queue Validation Commands

### `npm.cmd run lint`

Result: pass.

Key output:

```text
> tiku-scaffold@0.1.0 lint
> eslint
```

### `npm.cmd run typecheck`

Result: pass.

Key output:

```text
> tiku-scaffold@0.1.0 typecheck
> tsc --noEmit
```

### `npm.cmd run test:unit`

Result: pass.

Key output:

```text
Test Files 62 passed (62)
Tests 188 passed (188)
```

### `npm.cmd run build`

Initial result: fail in the fresh worktree because `node_modules` was absent and Turbopack could not resolve `next/package.json`.

Fix command:

```powershell
corepack pnpm@10 install --frozen-lockfile
```

Install result: pass; lockfile resolution was skipped and no package files changed.

Final build result: pass.

Key output:

```text
Compiled successfully in 18.6s
Finished TypeScript in 27.8s
Generating static pages using 7 workers (28/28)
Route (app)
...
└ ○ /home
```

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`

Result: pass.

Key output:

```text
== Result ==
naming convention scan completed
```

## Additional Validation

### `npm.cmd run format:check`

Initial result: fail on two new files.

Fix command:

```powershell
npm.cmd exec -- prettier --write src/features/student/home/StudentHomePage.tsx tests/unit/student-home-ui.test.ts
```

Final result: pass.

Key output:

```text
All matched files use Prettier code style!
```

### Browser/IAB Verification

- Selected backend: `iab`.
- URL verified: `http://localhost:3006/home`.
- Dev server command: `npm.cmd run dev -- --port 3006`.
- Screenshot status: viewport screenshot captured through Browser/IAB.
- Console result: no `error` or `warn` logs.

Visible state checks:

```json
{
  "url": "http://localhost:3006/home",
  "snapshotContainsHome": true,
  "marketingSelected": "true",
  "monopolySelected": "false",
  "hasTheoryGroup": true,
  "hasSkillGroup": true,
  "marketingCardPublicId": "paper-marketing-theory-002",
  "marketingCardInternalId": null,
  "hasPracticeLink": true,
  "hasMockExamLink": true,
  "containsMarketingPaper": true,
  "containsSkillPaper": true
}
```

Interaction check after clicking `专卖 3级`:

```json
{
  "monopolySelected": "true",
  "marketingSelected": "false",
  "containsMonopolyPaper": true,
  "containsMarketingPaper": false
}
```

Accepted browser verification gap:

- Browser/IAB viewport verification was completed at the available desktop-sized viewport. Mobile-first behavior is covered by the component's base layout and unit coverage, but no separate mobile viewport screenshot was captured in this pass.

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`

Result: pass.

Key output:

```text
OK file: AGENTS.md
OK npm script: lint
OK npm script: typecheck
OK npm script: test:unit
OK plugin enabled: superpowers@openai-curated
```

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

Result: pass.

Key output:

```text
RUN npm script: lint
RUN npm script: typecheck
RUN npm script: test:unit
Test Files 62 passed (62)
Tests 188 passed (188)
RUN npm script: format:check
All matched files use Prettier code style!
```

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

Result: pass.

Key output:

```text
branch: codex/phase-4-student-home-ui-baseline
Tracked Changes: project-state.yaml, task-queue.yaml, src/app/(student)/home/page.tsx
Untracked Files: task plan, evidence, security review, student home feature, student home unit test
== Result ==
git completion readiness inventory completed
```

## Security Review

Security review path:

`docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-student-home-ui-baseline-security-review.md`

Verdict: `APPROVE`

Accepted gaps:

- The route uses a local UI baseline fixture until real session-bound API hydration is introduced.
- No runtime authorization resolver or network data fetch was added in this UI task.
- Practice and mock exam destination pages are placeholders for later queued UI tasks; links use `paperPublicId`.

## State Update

- `phase-4-student-home-ui-baseline`: `done`
- Next recommended action: `claim_phase_4_practice_ui_baseline`

## Completion Notes

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` changes.
- No `src/db/schema/**`, `drizzle/**`, or `.env.example` changes.
- No numeric database ids are exposed in student UI cards or action URLs.
- Loading, empty, and error states are explicit.
- The student home UI remains within Phase 4 frontend scope and consumes the existing student paper DTO contract.

## Post-Merge Master Closeout

- Merge target: `master`
- Merge result: fast-forward from `faf9c5c` to `938a122`
- Implementation commit: `938a122 feat(student): add student home UI baseline`

Post-merge validation on `master`:

- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: initial parallel run observed stale/concurrent `.next/types` errors while `next build` was regenerating route types; standalone rerun after build completed passed.
- `npm.cmd run test:unit`: pass, 62 files and 188 tests.
- `npm.cmd run build`: pass, `/home` included in the app route output.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `npm.cmd run format:check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass on `master`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass on `master`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`: pass after rerun outside the constrained shell language mode.

Git readiness key output before closeout evidence commit:

```text
branch: master
head: 938a122
## master...origin/master [ahead 1]
Tracked Changes: none
Staged Changes: none
Untracked Files: none
leftRightCount(origin/master...HEAD): 0 1
```

Files changed against `origin/master`:

```text
docs/04-agent-system/state/project-state.yaml
docs/04-agent-system/state/task-queue.yaml
docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-student-home-ui-baseline-security-review.md
docs/05-execution-logs/evidence/2026-05-19-phase-4-student-home-ui-baseline.md
docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-home-ui-baseline.md
src/app/(student)/home/page.tsx
src/features/student/home/StudentHomePage.tsx
tests/unit/student-home-ui.test.ts
```

## Push And Cleanup Evidence

- Push target: `origin master`
- Push result: pass; `master` advanced on origin from `faf9c5c` to `f157185`.
- Browser tab cleanup: Browser/IAB tab closed.
- Dev server cleanup: stopped process listening on port `3006`; final `netstat -ano | findstr :3006` returned no listener.
- Worktree cleanup: `git worktree remove .worktrees\phase-4-student-home-ui-baseline` unregistered the worktree; Windows left local dependency residue, so the verified path `F:\tiku\.worktrees\phase-4-student-home-ui-baseline` was removed with the long-path prefix.
- Branch cleanup: deleted merged local branch `codex/phase-4-student-home-ui-baseline`.
- Final local inventory after cleanup:

```text
git worktree list
F:/tiku  f157185 [master]

git branch --list
* master

git status --short --branch
## master...origin/master

Test-Path .worktrees\phase-4-student-home-ui-baseline
False
```
