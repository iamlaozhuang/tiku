# Local Full Loop Active Queue Slimming After Post Provider Rollup Traceability

## Task

- Task id: `local-full-loop-active-queue-slimming-after-post-provider-rollup-2026-06-28`
- Branch: `codex/local-full-loop-queue-slimming-20260628`
- Scope: active queue archive/index cleanup after post-Provider rollup.

## Requirement Mapping Result

| Requirement area         | Mapping result                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Active queue readability | Move terminal historical task blocks out of active queue once they exceed the recovery window.                                        |
| Historical traceability  | Preserve moved task bodies in the June archive and add lookup entries in `task-history-index.yaml`.                                   |
| Recovery safety          | Keep current task and terminal recovery window active; dependencies can resolve through active queue or index.                        |
| Boundary preservation    | No runtime, Provider, env, DB, source/test, schema, dependency, staging/prod, payment, Cost Calibration, release, or final Pass work. |

## Decision

This task is queue hygiene only. It does not change product requirements or runtime behavior. Cost Calibration, release
readiness, and final Pass remain blocked.

## Closure Trace

- Moved terminal historical task blocks: 19.
- Active queue after close: 12 tasks, including 3 blocked non-terminal gates and 9 terminal recovery entries.
- Archive candidate count after close: 0.
- Runtime behavior changed: no.
