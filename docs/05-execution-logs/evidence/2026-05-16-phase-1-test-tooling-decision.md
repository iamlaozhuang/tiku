# Evidence: Phase 1 Test Tooling Decision

## Date

2026-05-16

## Scope

Prepare the test tooling decision, record human approval, install approved test dependencies, add minimal Vitest and Playwright configuration, and verify the new local test gate.

## Branch

`codex/phase-1-test-tooling-decision`

## Files Created Or Updated

- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.mts`
- `vitest.setup.ts`
- `playwright.config.ts`
- `tests/unit/utils.test.ts`
- `e2e/home.spec.ts`
- `docs/05-execution-logs/task-plans/2026-05-16-phase-1-test-tooling-decision.md`
- `docs/05-execution-logs/evidence/2026-05-16-phase-1-test-tooling-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Context Read

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/05-execution-logs/evidence/2026-05-16-mechanism-hardening.md`

## External References Checked

- Next.js Testing guide: `https://nextjs.org/docs/app/guides/testing`
- Next.js Vitest guide: `https://nextjs.org/docs/app/guides/testing/vitest`
- Next.js Playwright guide: `https://nextjs.org/docs/app/guides/testing/playwright`
- Vitest features guide: `https://vitest.dev/guide/features`
- Playwright installation guide: `https://playwright.dev/docs/intro`

## Registry Version Checks

Initial non-escalated `npm.cmd view` calls failed because npm could not write to `C:\Users\laozhuang\AppData\Local\npm-cache\_cacache\tmp` from the sandbox. The commands were rerun with escalation and did not install dependencies.

```text
npm.cmd view vitest version
4.1.6

npm.cmd view @vitejs/plugin-react version
6.0.2

npm.cmd view jsdom version
29.1.1

npm.cmd view @testing-library/react version
16.3.2

npm.cmd view @testing-library/dom version
10.4.1

npm.cmd view @testing-library/jest-dom version
6.9.1

npm.cmd view vite-tsconfig-paths version
6.1.1

npm.cmd view @playwright/test version
1.60.0
```

Implementation note: `vite-tsconfig-paths` was initially approved and version-checked, but was removed during configuration because Vite 8 reported native support through `resolve.tsconfigPaths`. The final Vitest config uses the native option to keep the dependency surface smaller.

## Decision Summary

- Unit test runner: `vitest`.
- Component test approach: `@testing-library/react` with `jsdom`.
- DOM matchers: `@testing-library/jest-dom`.
- Path alias support for test runtime: Vite 8 native `resolve.tsconfigPaths`.
- E2E approach: `@playwright/test`, Chromium-first for the workplace desktop baseline.
- Async Server Components: avoid unit-level rendering claims; cover through E2E when user-visible.

## Dependency Approval Status

`human approval: approve phase-1-test-tooling-decision devDependencies`.

The user requested: “按方案进入依赖安装与测试配置落地”. This is treated as explicit approval to install the devDependencies listed in `docs/05-execution-logs/task-plans/2026-05-16-phase-1-test-tooling-decision.md`.

## Installation Results

Initial pnpm attempt:

```text
corepack pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @playwright/test

[ERR_PNPM_UNEXPECTED_STORE] Unexpected store location
The dependencies at "F:\tiku\node_modules" are currently linked from the store at "F:\.pnpm-store\v10".
pnpm now wants to use the store at "F:\.pnpm-store\v11" to link dependencies.
```

Resolution:

```text
corepack pnpm@10 --version
10.33.4
```

Successful dependency install:

```text
corepack pnpm@10 add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @playwright/test

devDependencies:
+ @playwright/test 1.60.0
+ @testing-library/dom 10.4.1
+ @testing-library/jest-dom 6.9.1
+ @testing-library/react 16.3.2
+ @vitejs/plugin-react 6.0.2
+ jsdom 29.1.1
+ vite-tsconfig-paths 6.1.1
+ vitest 4.1.6
Done in 1m 3s using pnpm v10.33.4
```

Dependency reduction:

```text
corepack pnpm@10 remove vite-tsconfig-paths

devDependencies:
- vite-tsconfig-paths 6.1.1
Done in 9.6s using pnpm v10.33.4
```

Playwright browser install:

```text
corepack pnpm@10 exec playwright install chromium

Chrome for Testing 148.0.7778.96 downloaded.
Chrome Headless Shell 148.0.7778.96 downloaded.
```

## Validation To Run Before Handoff

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Select-String -Path 'docs\05-execution-logs\task-plans\2026-05-16-phase-1-test-tooling-decision.md' -Pattern 'human approval'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

## Validation Results

Initial unit test in sandbox:

```text
npm.cmd run test:unit

failed to load config from F:\tiku\vitest.config.mts
Error: spawn EPERM
```

Escalated unit test after config adjustment:

```text
npm.cmd run test:unit

RUN  v4.1.6 F:/tiku
Test Files  1 passed (1)
Tests  1 passed (1)
Duration  3.59s
```

Initial E2E before browser install:

```text
npm.cmd run test:e2e -- --project=chromium

Error: browserType.launch: Executable doesn't exist at C:\Users\laozhuang\AppData\Local\ms-playwright\chromium_headless_shell-1223\chrome-headless-shell-win64\chrome-headless-shell.exe
```

E2E after Chromium install:

```text
npm.cmd run test:e2e -- --project=chromium

Running 1 test using 1 worker
ok 1 [chromium] › e2e\home.spec.ts:3:5 › loads the root navigation page
1 passed (12.6s)
```

Full test script:

```text
npm.cmd run test

Test Files  1 passed (1)
Tests  1 passed (1)
ok 1 [chromium] › e2e\home.spec.ts:3:5 › loads the root navigation page
1 passed (12.9s)
```

Readiness:

```text
OK file: AGENTS.md
OK file: docs\03-standards\code-taste-ten-commandments.md
OK file: docs\02-architecture\adr\adr-001-tech-stack-selection.md
OK file: docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md
OK file: docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md
OK file: docs\02-architecture\interfaces\global-db-api-skeleton.md
OK file: docs\04-agent-system\sop\automation-loop.md
OK file: docs\04-agent-system\sop\skill-dispatch-matrix.md
OK file: docs\04-agent-system\sop\dependency-introduction-gate.md
OK file: docs\04-agent-system\state\project-state.yaml
OK file: docs\04-agent-system\state\task-queue.yaml
OK file: docs\04-agent-system\milestones-goals\mvp-roadmap.md
OK file: package.json
OK npm script: lint
OK npm script: typecheck
OK npm script: test
OK skill path: ralplan
OK skill path: ralph
OK skill path: autopilot
OK skill path: code-review
OK skill path: code-simplifier
OK skill path: drizzle-orm-expert
OK skill path: postgresql
OK skill path: postgres-best-practices
OK skill path: nextjs-app-router-patterns
OK skill path: nextjs-best-practices
OK skill path: react-nextjs-development
OK skill path: shadcn
OK skill path: tailwind-design-system
OK skill path: tailwind-patterns
OK skill path: vercel-ai-sdk-expert
OK skill path: rag-engineer
OK skill path: rag-implementation
OK skill path: playwright-skill
OK skill path: webapp-testing
OK skill path: e2e-testing
OK skill path: tdd-orchestrator
OK skill path: tdd-workflow
OK skill path: testing-patterns
NOTE: Newly installed local skills require restarting Codex before they appear in the active skill list.
```

Approval phrase check:

```text
Select-String found multiple occurrences of "human approval" in the task plan, including the dependency approval table and pending approval status.
```

Quality gate:

```text
RUN npm script: lint

> tiku-scaffold@0.1.0 lint
> eslint

RUN npm script: typecheck

> tiku-scaffold@0.1.0 typecheck
> tsc --noEmit

RUN npm script: test

> tiku-scaffold@0.1.0 test
> npm run test:unit && npm run test:e2e

Test Files  1 passed (1)
Tests  1 passed (1)
ok 1 [chromium] › e2e\home.spec.ts:3:5 › loads the root navigation page
1 passed (12.1s)
```

Build:

```text
npm.cmd run build

Compiled successfully.
Finished TypeScript.
Generated static pages using 7 workers (8/8).
Routes generated: /, /_not-found, /content/papers, /design-system, /home, /login, /ops/users.
```

Current status:

```text
lint: pass
typecheck: pass
test: pass
build: pass
```
