# Rawfiles recovery and inventory task plan

> Date: 2026-05-19
> Branch: codex/phase-4-student-experience-planning
> Scope: Restore ignored local source materials into `rawfiles/` and record an inventory for future Phase 4/5 planning.

## Context

The user reported that `rawfiles/` previously contained complete paper materials by profession and level. The current working copy only retained the marketing textbook PDF under `rawfiles/marketing`.

Investigation found that `rawfiles/` is ignored by `.gitignore`, so the original binary materials were never preserved in Git history. Historical project notes in `archive/plans/2026-05-01-question-paper-model-research.md` describe the expected source package layout and match files found in the local WeChat file cache.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `archive/plans/2026-05-01-question-paper-model-research.md`

## Recovery Sources

- `C:\Users\laozhuang\Documents\xwechat_files\zhuangjz_2a21\msg\file\2026-02`
- `C:\Users\laozhuang\Documents\xwechat_files\zhuangjz_2a21\msg\file\2026-03`

## Target Layout

Use a stable, human-readable local archive layout under ignored `F:\tiku\rawfiles`:

```text
rawfiles/
  专卖类/
    三级/
    四级/
    五级/
    教材/
    压缩包/
  营销类/
    三级/
      真题/
      模拟真题/
      系统课件/
    教材/
    课件/
  物流类/
```

## Steps

1. Create the target directories without deleting current files.
2. Copy matched WeChat cache files into the target layout.
3. Keep existing files if destination content already exists with the same file name.
4. Generate a tracked inventory evidence document under `docs/05-execution-logs/evidence/`.
5. Verify the recovered file count and current Git status.

## Guardrails

- Do not modify `package.json`, lockfiles, `src/**`, `src/db/schema/**`, `drizzle/**`, or `.env.example`.
- Do not commit raw binary files because `rawfiles/` is intentionally ignored.
- Do not delete any source cache files.
- Preserve original filenames; only directory placement is normalized.
