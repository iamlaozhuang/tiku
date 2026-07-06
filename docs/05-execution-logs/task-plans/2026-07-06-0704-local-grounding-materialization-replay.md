# 2026-07-06 0704 Local Grounding Materialization Replay Plan

## Scope

- Task id: `0704-local-grounding-materialization-replay-2026-07-06`
- Branch: `codex/0704-grounding-materialization-replay-2026-07-06`
- Goal: independently replay the local 0704 grounding materialization path so current localhost/no-Provider generation can find sufficient local RAG evidence again.
- Trigger: user requested a standalone `0704 local grounding materialization replay`.

## Read Gate

Completed before local runtime artifact work:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- Latest local runtime and adversarial acceptance evidence dated `2026-07-06`.
- Latest grounding root-cause audit evidence dated `2026-07-06`.

## Allowed Work

- Read local 0704 private fixture files only to build local runtime RAG resources.
- Write local untracked runtime artifacts under `.runtime/uploads/dev/resource/`.
- Create redacted task plan, evidence, audit/review, and queue/state updates.
- Run no-Provider grounding checks against the local resource catalog shape and retrieval thresholds.

## Blocked Work

- No source code change unless a separate root-cause fix branch is created after confirming a source defect.
- No dependency, `package.json`, lockfile, schema, migration, `.env*`, secret, staging/prod, deploy, or Cost Calibration work.
- No destructive DB operation and no DB mutation.
- No Provider call, model cost measurement, Provider payload capture, prompt capture, or raw AI output capture.
- No screenshots, DOM dumps, sessions, cookies, tokens, DB URLs, raw DB rows, internal ids, full question, full paper, full material, or full chunk content in evidence.

## Replay Approach

1. Confirm current `.runtime/uploads` baseline is empty or missing the local resource catalog.
2. Materialize a minimal local `rag_ready` resource catalog for the 0704 marketing level 3 theory replay path using private fixture content internally.
3. Add runtime-only query metadata tokens required by the current local deterministic retriever: `AI 出题`, `AI 组卷`, `marketing`, `level 3`, `theory`, and `knowledge_node`.
4. Validate that both owner-preview retrieval queries can produce at least two strong citations and `evidenceStatus=sufficient`.
5. Record only aggregate counts, role/path labels, status codes, and result classifications.

## Risk Controls

- Treat this as local materialization evidence, not release readiness or production usability.
- Keep `.runtime` artifacts untracked and out of committed evidence.
- If fresh endpoint behavior still reports insufficient grounding after materialization, classify that as a separate runtime/root-cause question instead of silently declaring pass.

## Validation Plan

- `git status --short --branch`
- Local materialization script with aggregate-only output.
- No-Provider grounding replay script with aggregate-only output.
- `npm.cmd exec -- prettier --check --ignore-unknown` on changed markdown/yaml files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-local-grounding-materialization-replay-2026-07-06`
- Commit hook gates on commit.
