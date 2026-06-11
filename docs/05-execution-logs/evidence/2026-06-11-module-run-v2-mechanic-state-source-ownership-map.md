# Module Run V2 State Source Ownership Map Evidence

## Scope

Task 6 updates ownership documentation for `tiku-module-run-v2-autopilot` and `tiku-module-run-v2-mechanic-2`.

## Commands

- `Select-String -Path docs/04-agent-system/state/mechanism-source-of-truth-index.yaml,docs/04-agent-system/operating-manual.md,docs/04-agent-system/sop/automated-advancement-governance.md -Pattern "factOwnership|task-queue.yaml|project-state.yaml|advanced-edition-domain-module-run-matrix.yaml|derived summary|Script output is a derived summary|transient owner|validation facts|Cost Calibration Gate remains blocked"`
  - Result: all ownership anchors found.
- `git diff --check`
  - Result: passed with no whitespace errors.
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown <changed files>`
  - Result: `All matched files use Prettier code style!`
- `npm run lint`
  - Result: passed.
- `npm run typecheck`
  - Result: passed.

## Result

Passed. `mechanism-source-of-truth-index.yaml` now maps task state, current task, standing approval, module closure,
transient owner, validation facts, audit conclusions, and Codex automation registration to their owning sources. SOP and
ownership index now state that script output is a derived summary, not a second durable source of truth.

## Safety

- No runner, seed, queue, project-state, provider, env, schema, deploy, dependency, PR, force push, or Cost Calibration Gate action was executed.
- `Cost Calibration Gate remains blocked`.
