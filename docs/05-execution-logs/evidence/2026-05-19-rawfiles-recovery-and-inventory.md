# Rawfiles recovery and inventory evidence

> Date: 2026-05-19
> Branch: codex/phase-4-student-experience-planning
> Related plan: `docs/05-execution-logs/task-plans/2026-05-19-rawfiles-recovery-and-inventory.md`

## Summary

Recovered the local raw paper and learning materials that were previously expected under `F:\tiku\rawfiles`.

The materials were not present in Git history because `rawfiles/` is ignored by `.gitignore`. Historical inventory in `archive/plans/2026-05-01-question-paper-model-research.md` was used to identify the expected files and verify that the recovered local WeChat cache materials match the earlier project notes.

## Source Locations

- `C:\Users\laozhuang\Documents\xwechat_files\zhuangjz_2a21\msg\file\2026-02`
- `C:\Users\laozhuang\Documents\xwechat_files\zhuangjz_2a21\msg\file\2026-03`

## Target Layout

Recovered files were organized under ignored local directory `F:\tiku\rawfiles`:

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

`物流类/` is intentionally present as an empty reserved directory because the historical inventory states that logistics was reserved but had no first-batch source material.

## Inventory Count

Command:

```powershell
Get-ChildItem -LiteralPath 'F:\tiku\rawfiles' -Recurse -File |
  Group-Object { $_.DirectoryName.Replace('F:\tiku\rawfiles\','') } |
  Sort-Object Name
```

Result:

```text
营销类\教材              1
营销类\课件              3
营销类\三级\模拟真题      3
营销类\三级\系统课件      11
营销类\三级\真题          4
专卖类\教材              1
专卖类\三级              13
专卖类\四级              13
专卖类\五级              13
专卖类\压缩包            3
```

Total recovered files:

```text
65
```

## Notable Recovered Materials

### 专卖类

- `专卖3级真题.rar`
- `专卖4级真题.rar`
- `专卖5级真题.rar`
- `烟草专卖管理师（三至五级）.docx`
- 三级 2023.10 / 2024.4 / 2024.11 paper, answer, material, and answer-sheet PDFs
- 四级 2023.10 / 2024.4 / 2024.11 paper, answer, material, and answer-sheet PDFs
- 五级 2023.10 / 2024.4 / 2024.11 paper, answer, material, and answer-sheet PDFs
- 五级 2024.4 Word/PDF paired skill paper and answer files

### 营销类

- `202407购销（三级）理论.pdf`
- `202407购销（三级）理论答案.pdf`
- `202407购销（三级）技能【专业知识】.pdf`
- `202407购销（三级）技能答案.pdf`
- `营销技能鉴定（三级）专业知识模拟真题（第一套）.docx`
- `营销技能鉴定（三级）专业知识模拟真题（第一套）答题试卷.docx`
- `营销技能鉴定（三级）专业知识模拟真题（第一套）答案及解析.docx`
- `2025年烟草制品购销员三至五级专业知识.pdf`
- `营销技能鉴定（三级）课件.pptx`
- `营销技能竞赛鉴定点讲稿.docx`
- `营销技能鉴定（三级）计算题核心鉴定点.docx`

The 11 marketing system-course Word files were recovered into `rawfiles/营销类/三级/系统课件/`:

```text
（3级）市场营销：1.1货源采购管理.docx
（3级）市场营销：1.2货源投放管理.docx
（3级）市场营销：1.3库存管理.docx
（3级）品牌营销：2.1品牌市场策略.docx
（3级）品牌营销：2.2区域市场品牌管理.docx
（3级）品牌营销：2.3工商协同营销.docx
（3级）服务营销：3.1服务监测与评估.docx
（3级）服务营销：3.2零售终端建设.docx
（3级）服务营销：3.3客户组织能力建设.docx
（3级）服务营销：3.4文明吸烟环境建设.docx
（3级）营销管理：4.1组织管理.docx
```

## Verification

- `rawfiles/` remains ignored by Git, so recovered binary materials are not staged or committed.
- Main worktree status remains clean except ignored `rawfiles/`.
- Tracked documentation changes exist only in `codex/phase-4-student-experience-planning`.
- `npm.cmd run format:check` passed for the documentation changes.

Command:

```powershell
git -C F:\tiku status --short --ignored rawfiles
```

Result:

```text
!! rawfiles/
```

Format check:

```text
> tiku-scaffold@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

## Follow-Up Note

Phase 4 and Phase 5 planning should use this recovered local material set as the authoritative raw source inventory unless a newer source package is provided by the user.
