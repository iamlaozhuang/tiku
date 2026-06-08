# Module Run v2 Autopilot Thread Handoff

thread rollover handoff:
decision: require_new_thread
reason: autopilot thread rollover decision
mode: local_auto_candidate
phase: module-run-v2-autopilot-orchestration-control
task: module-run-v2-autopilot-orchestration-control
task status: in_progress
branch: codex/module-run-v2-unattended-automation-control
commit: 1b3030c5d402c50853d4df85608daf531263440c
latest task plan: docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-autopilot-orchestration-control.md
latest evidence: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-autopilot-orchestration-control.md
latest audit review: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-autopilot-orchestration-control.md
blocked gates: Cost Calibration Gate remains blocked; provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, and migration remain blocked.
allowed next task: proposal-only recovery audit and Module Run v2 plan for ai-task-and-provider
forbidden scope: business implementation, provider/env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost Calibration Gate execution
validation: receiving thread must rerun recovery audit, unattended readiness, thread launch policy, and relevant closeout gates before implementation
git state: ## codex/module-run-v2-unattended-automation-control | M docs/04-agent-system/sop/automated-advancement-governance.md | M docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md | M docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md | M docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml | M docs/04-agent-system/state/mechanism-source-of-truth-index.yaml | M docs/04-agent-system/state/project-state.yaml | M docs/04-agent-system/state/task-queue.yaml | ?? docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-autopilot-orchestration-control.md | ?? docs/05-execution-logs/evidence/2026-06-08-module-run-v2-autopilot-orchestration-control.md | ?? docs/05-execution-logs/handoffs/2026-06-08-module-run-v2-autopilot-orchestration-control.md | ?? docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-autopilot-orchestration-control.md | ?? scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1 | ?? scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1 | ?? scripts/agent-system/New-ModuleRunV2ThreadHandoff.Smoke.ps1 | ?? scripts/agent-system/New-ModuleRunV2ThreadHandoff.ps1 | ?? scripts/agent-system/Test-ModuleRunV2ThreadLaunchPolicy.Smoke.ps1 | ?? scripts/agent-system/Test-ModuleRunV2ThreadLaunchPolicy.ps1
read order: AGENTS.md -> docs/03-standards/code-taste-ten-commandments.md -> docs/02-architecture/adr/ -> docs/04-agent-system/state/project-state.yaml -> docs/04-agent-system/state/task-queue.yaml -> latest task plan -> latest evidence -> latest audit review -> relevant SOPs
nextModuleRunCandidate: ai-task-and-provider
thread tools: use create_thread for a new Codex thread, then send_message_to_thread only with this handoff content and no secrets
user decision needed: create_thread may be called only by Codex thread tooling after launch policy approval

Cost Calibration Gate remains blocked.
