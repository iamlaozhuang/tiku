# Module Run v2 Mechanism Completion Plan

## Summary

Implement the approved six-task mechanism completion sequence before starting another business Module Run v2.

## Tasks

1. `module-run-v2-mechanism-state-source-sync`: synchronize durable state, queue, matrix, and SOP wording with the real
   post-pilot baseline.
2. `module-run-v2-start-gate-hardening`: make pre-work and pre-edit require an explicit active TaskId and valid
   plan/evidence/audit paths.
3. `module-run-v2-closeout-strictness-hardening`: require Batch, RED/GREEN, commit, localFullLoopGate, rollover, and
   handoff evidence for Module Run v2 closeout.
4. `module-run-v2-post-commit-advisory`: add a non-blocking post-commit inventory hook.
5. `module-run-v2-automation-readiness-scorecard-refresh`: evaluate automation and hook readiness after the first real
   pilot.
6. `module-run-v2-evidence-redaction-scan-hardening`: expand pre-commit evidence redaction scans.

## Boundaries

- Do not start a business execution module.
- Do not execute Cost Calibration Gate.
- Do not change dependency, package, lockfile, schema, migration, env/secret, provider, staging/prod/cloud/deploy,
  payment, external-service, `src/db/schema/**`, drizzle, `.env.local`, `.env.example`, or `e2e/**`.
- Keep `ai-task-and-provider` as a nextModuleRunCandidate proposal only.

## Closeout

The final closeout task id is `module-run-v2-mechanism-completion`. It must record hook readiness for pre-work,
pre-edit, pre-commit, post-commit, pre-push, and module-closeout, then run the required validation gates on the feature
branch and again after fast-forward merge to master.
