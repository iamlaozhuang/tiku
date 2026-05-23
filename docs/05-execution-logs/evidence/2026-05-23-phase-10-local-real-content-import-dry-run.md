# Evidence: phase-10-local-real-content-import-dry-run

## Metadata

- Task id: `phase-10-local-real-content-import-dry-run`
- Branch: `codex/phase-10-local-real-content-import-dry-run`
- Base: `master`
- Evidence created at: `2026-05-23T18:41:18+08:00`
- Task plan: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-content-import-dry-run.md`
- Human approval: user explicitly requested this local read-only real-content dry run over ignored `rawfiles/`.
- Security review: evaluated; no separate security review file required because this task only reads local ignored files and records redacted metadata. It does not modify auth, session, authorization, AI/RAG runtime, database schema, migrations, runtime source, dependencies, environment files, deployment, staging, prod, real provider configuration, or production resources.

## Scope

Allowed files followed:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-content-import-dry-run.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-content-import-dry-run.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

No dependency, lockfile, runtime source, database schema, migration file, environment example, local secret file, real provider call, production resource, deployment, PR, staging, prod, cloud resource, or raw content import was changed.

## Redaction Boundary

This dry run recorded only metadata and classification:

- file counts, directory distribution, extension distribution, sizes, SHA256 prefixes;
- best-effort PDF page counts using PDF object markers;
- DOCX paragraph/table counts using OpenXML container metadata;
- PPTX slide counts using OpenXML container metadata;
- filename/path-based import classification and risk tags.

This evidence intentionally does not include raw paper text, answer text, textbook excerpts, OCR output, prompts, provider payloads, session tokens, passwords, secrets, API keys, or production credentials.

## Real Content Inventory Summary

- Root scanned: ignored local `rawfiles/`.
- Total files: `62`.
- Total size: `310,687,817` bytes, about `296.30 MiB`.
- Top-level directories:
  - `营销类`: `22` files, about `284.41 MiB`.
  - `专卖类`: `40` files, about `11.89 MiB`.
  - `物流类`: no files observed in the current expanded local input.

Extension distribution:

| Extension | Count |       Bytes |
| --------- | ----: | ----------: |
| `.doc`    |     1 |      65,024 |
| `.docx`   |    18 |  12,203,391 |
| `.pdf`    |    42 | 297,424,689 |
| `.pptx`   |     1 |     994,713 |

Second-level directory distribution:

| Directory     | Count | Approx MiB |
| ------------- | ----: | ---------: |
| `营销类/教材` |     1 |     275.65 |
| `营销类/课件` |     3 |       1.23 |
| `营销类/三级` |    18 |       7.53 |
| `专卖类/教材` |     1 |       4.49 |
| `专卖类/三级` |    13 |       2.63 |
| `专卖类/四级` |    13 |       2.68 |
| `专卖类/五级` |    13 |       2.09 |

## Structural Metadata Summary

- PDF files: `42`.
  - Best-effort page marker sum: `640`.
  - PDF files with page marker count `0`: `1`.
  - Largest PDF: about `275.65 MiB`, classified as large/scanned PDF risk.
- DOCX files: `18`.
  - Paragraph marker sum: `24,586`.
  - Table marker sum: `138`.
  - Max paragraph markers in one DOCX: `13,814`.
  - Max table markers in one DOCX: `78`.
- PPTX files: `1`.
  - Slide count: `160`.
- Legacy DOC files: `1`.
  - Classified as `legacy_doc`; no structural extraction attempted.

PDF page counts are best-effort metadata, not semantic extraction. The `0` count file should be treated as a parser/OCR risk instead of proof that the PDF has no pages.

## Per-File Metadata

The table below records source file path, size, SHA256 prefix, and structural counts only. It does not include any source text or answer content.

|   # | Path under `rawfiles/`                                                               | Ext     |       Bytes | SHA256 prefix  | PDF pages | DOCX paragraphs | DOCX tables | PPTX slides |
| --: | ------------------------------------------------------------------------------------ | ------- | ----------: | -------------- | --------: | --------------: | ----------: | ----------: |
|   1 | `营销类/教材/2025年烟草制品购销员三至五级专业知识.pdf`                               | `.pdf`  | 289,036,579 | `b7d7d932712f` |       424 |                 |             |             |
|   2 | `营销类/课件/营销技能鉴定（三级）计算题核心鉴定点.docx`                              | `.docx` |      50,626 | `b422aae7e446` |           |             460 |           0 |             |
|   3 | `营销类/课件/营销技能鉴定（三级）课件.pptx`                                          | `.pptx` |     994,713 | `b408dcdb43d7` |           |                 |             |         160 |
|   4 | `营销类/课件/营销技能竞赛鉴定点讲稿.docx`                                            | `.docx` |     242,123 | `37c7e2e15e5a` |           |           3,347 |           0 |             |
|   5 | `营销类/三级/模拟真题/营销技能鉴定（三级）专业知识模拟真题（第一套）.docx`           | `.docx` |      21,884 | `11ceaa0c5acd` |           |              58 |           0 |             |
|   6 | `营销类/三级/模拟真题/营销技能鉴定（三级）专业知识模拟真题（第一套）答案及解析.docx` | `.docx` |      23,134 | `6dc53d0bbaa1` |           |              88 |           0 |             |
|   7 | `营销类/三级/模拟真题/营销技能鉴定（三级）专业知识模拟真题（第一套）答题试卷.docx`   | `.docx` |      23,613 | `760975aee758` |           |             133 |           1 |             |
|   8 | `营销类/三级/系统课件/（3级）服务营销：3.1服务监测与评估.docx`                       | `.docx` |   1,074,480 | `1ba181fb06ce` |           |           1,054 |          16 |             |
|   9 | `营销类/三级/系统课件/（3级）服务营销：3.2零售终端建设.docx`                         | `.docx` |     297,470 | `825eb59b09c8` |           |             493 |           5 |             |
|  10 | `营销类/三级/系统课件/（3级）服务营销：3.3客户组织能力建设.docx`                     | `.docx` |      84,065 | `9c225467837f` |           |             414 |           3 |             |
|  11 | `营销类/三级/系统课件/（3级）服务营销：3.4文明吸烟环境建设.docx`                     | `.docx` |     668,436 | `8ccc3d7a3364` |           |             156 |           0 |             |
|  12 | `营销类/三级/系统课件/（3级）品牌营销：2.1品牌市场策略.docx`                         | `.docx` |   1,199,859 | `fb3032df677b` |           |             949 |          11 |             |
|  13 | `营销类/三级/系统课件/（3级）品牌营销：2.2区域市场品牌管理.docx`                     | `.docx` |     386,349 | `7055d6648f93` |           |             759 |           4 |             |
|  14 | `营销类/三级/系统课件/（3级）品牌营销：2.3工商协同营销.docx`                         | `.docx` |     705,222 | `c5e6ac1c163b` |           |             545 |           3 |             |
|  15 | `营销类/三级/系统课件/（3级）市场营销：1.1货源采购管理.docx`                         | `.docx` |   1,174,318 | `9fd66dccd762` |           |             923 |          10 |             |
|  16 | `营销类/三级/系统课件/（3级）市场营销：1.2货源投放管理.docx`                         | `.docx` |     523,930 | `c1ff5fbd2fda` |           |             562 |           4 |             |
|  17 | `营销类/三级/系统课件/（3级）市场营销：1.3库存管理.docx`                             | `.docx` |     614,448 | `7af79537e22f` |           |             355 |           3 |             |
|  18 | `营销类/三级/系统课件/（3级）营销管理：4.1组织管理.docx`                             | `.docx` |     384,532 | `89e8685eb7c6` |           |             364 |           0 |             |
|  19 | `营销类/三级/真题/202407购销（三级）技能【专业知识】.pdf`                            | `.pdf`  |     239,484 | `b50e17267d7e` |         0 |                 |             |             |
|  20 | `营销类/三级/真题/202407购销（三级）技能答案.pdf`                                    | `.pdf`  |     170,494 | `e8975691ca29` |         5 |                 |             |             |
|  21 | `营销类/三级/真题/202407购销（三级）理论.pdf`                                        | `.pdf`  |     242,217 | `81e1340ec005` |         8 |                 |             |             |
|  22 | `营销类/三级/真题/202407购销（三级）理论答案.pdf`                                    | `.pdf`  |      63,628 | `520f54f803fd` |         1 |                 |             |             |
|  23 | `专卖类/教材/烟草专卖管理师（三至五级）.docx`                                        | `.docx` |   4,705,855 | `ea72e3986f0a` |           |          13,814 |          78 |             |
|  24 | `专卖类/三级/2023年10月15日烟草专卖管理员（三级）-技能答案.pdf`                      | `.pdf`  |     216,704 | `d27307136178` |         6 |                 |             |             |
|  25 | `专卖类/三级/2023年10月15日烟草专卖管理员（三级）-技能试卷.pdf`                      | `.pdf`  |     170,711 | `59ec21da5ed1` |        10 |                 |             |             |
|  26 | `专卖类/三级/2023年10月15日烟草专卖管理员（三级）-理论答案.pdf`                      | `.pdf`  |      83,946 | `4f79c1d6436e` |         1 |                 |             |             |
|  27 | `专卖类/三级/2023年10月15日烟草专卖管理员（三级）-理论试卷.pdf`                      | `.pdf`  |     238,857 | `29cda93ec990` |        10 |                 |             |             |
|  28 | `专卖类/三级/2024年11月烟草专卖管理员（三级）-材料试卷.pdf`                          | `.pdf`  |     242,036 | `9391e4c6d59f` |         3 |                 |             |             |
|  29 | `专卖类/三级/2024年11月烟草专卖管理员（三级）-答题试卷.pdf`                          | `.pdf`  |     242,256 | `b6badb1a35ad` |         9 |                 |             |             |
|  30 | `专卖类/三级/2024年11月烟草专卖管理员（三级）-技能答案.pdf`                          | `.pdf`  |     292,114 | `359803da947d` |         6 |                 |             |             |
|  31 | `专卖类/三级/2024年11月烟草专卖管理员（三级）-理论答案.pdf`                          | `.pdf`  |      65,326 | `e793773a268f` |         1 |                 |             |             |
|  32 | `专卖类/三级/2024年11月烟草专卖管理员（三级）-理论试卷.pdf`                          | `.pdf`  |     242,594 | `21e5dcb9e361` |        10 |                 |             |             |
|  33 | `专卖类/三级/2024年4月烟草专卖管理员（三级）-技能答案.pdf`                           | `.pdf`  |     280,059 | `04b6329f60bb` |         5 |                 |             |             |
|  34 | `专卖类/三级/2024年4月烟草专卖管理员（三级）-技能试卷.pdf`                           | `.pdf`  |     357,753 | `ae670547112f` |        11 |                 |             |             |
|  35 | `专卖类/三级/2024年4月烟草专卖管理员（三级）-理论答案.pdf`                           | `.pdf`  |      83,516 | `931087ebd5df` |         1 |                 |             |             |
|  36 | `专卖类/三级/2024年4月烟草专卖管理员（三级）-理论试卷.pdf`                           | `.pdf`  |     242,923 | `4523af0c82c7` |        10 |                 |             |             |
|  37 | `专卖类/四级/2023年10月15日专卖四级技能试卷.pdf`                                     | `.pdf`  |     215,457 | `22d116bb1edb` |         8 |                 |             |             |
|  38 | `专卖类/四级/2023年10月15日专卖四级技能试卷-答案.pdf`                                | `.pdf`  |     209,927 | `e90a9dff1d0a` |         5 |                 |             |             |
|  39 | `专卖类/四级/2023年10月15日专卖四级理论试卷.pdf`                                     | `.pdf`  |     221,876 | `12de2e839d58` |         8 |                 |             |             |
|  40 | `专卖类/四级/2023年10月15日专卖四级理论试卷-答案.pdf`                                | `.pdf`  |      64,474 | `c631a192dee6` |         1 |                 |             |             |
|  41 | `专卖类/四级/2024年11月专卖四级技能-材料试卷.pdf`                                    | `.pdf`  |     254,216 | `7b7dadade33b` |         3 |                 |             |             |
|  42 | `专卖类/四级/2024年11月专卖四级技能-答案.pdf`                                        | `.pdf`  |     278,413 | `33420a2ab301` |         5 |                 |             |             |
|  43 | `专卖类/四级/2024年11月专卖四级技能-答题试卷.pdf`                                    | `.pdf`  |     165,996 | `9ed3cd288ecd` |         9 |                 |             |             |
|  44 | `专卖类/四级/2024年11月专卖四级理论试卷.pdf`                                         | `.pdf`  |     240,089 | `2c4a5471874e` |         8 |                 |             |             |
|  45 | `专卖类/四级/2024年11月专卖四级理论试卷-答案.pdf`                                    | `.pdf`  |      64,048 | `840ab7743b98` |         1 |                 |             |             |
|  46 | `专卖类/四级/2024年4月专卖四级技能试卷.pdf`                                          | `.pdf`  |     316,353 | `480321294137` |         8 |                 |             |             |
|  47 | `专卖类/四级/2024年4月专卖四级技能试卷-答案.pdf`                                     | `.pdf`  |     273,243 | `694130219f0e` |         5 |                 |             |             |
|  48 | `专卖类/四级/2024年4月专卖四级理论试卷.pdf`                                          | `.pdf`  |     400,410 | `eddfcfc9cd0b` |         8 |                 |             |             |
|  49 | `专卖类/四级/2024年4月专卖四级理论试卷-答案.pdf`                                     | `.pdf`  |     106,787 | `9fbe27371061` |         1 |                 |             |             |
|  50 | `专卖类/五级/2023年10月15日专卖鉴定五级技能.pdf`                                     | `.pdf`  |     164,169 | `e19a61e585bc` |         6 |                 |             |             |
|  51 | `专卖类/五级/2023年10月15日专卖鉴定五级技能-答案.pdf`                                | `.pdf`  |     166,493 | `aa403ceb8eed` |         3 |                 |             |             |
|  52 | `专卖类/五级/2023年10月15日专卖鉴定五级理论.pdf`                                     | `.pdf`  |     215,287 | `5491b59aa7ed` |         8 |                 |             |             |
|  53 | `专卖类/五级/2023年10月15日专卖鉴定五级理论-答案.pdf`                                | `.pdf`  |      64,556 | `eb88a4bbe3e2` |         1 |                 |             |             |
|  54 | `专卖类/五级/2024年11月专卖五级技能-材料试卷.pdf`                                    | `.pdf`  |     195,796 | `84e4e08bfbf0` |         2 |                 |             |             |
|  55 | `专卖类/五级/2024年11月专卖五级技能-答案.pdf`                                        | `.pdf`  |     218,058 | `64926955d259` |         4 |                 |             |             |
|  56 | `专卖类/五级/2024年11月专卖五级技能-答题试卷.pdf`                                    | `.pdf`  |     266,738 | `9edfc2f090ed` |         6 |                 |             |             |
|  57 | `专卖类/五级/2024年11月专卖五级理论.pdf`                                             | `.pdf`  |     222,179 | `1b0334042435` |         8 |                 |             |             |
|  58 | `专卖类/五级/2024年11月专卖五级理论-答案.pdf`                                        | `.pdf`  |      64,183 | `e846caf3a241` |         1 |                 |             |             |
|  59 | `专卖类/五级/2024年4月专卖五级技能试卷.doc`                                          | `.doc`  |      65,024 | `c0f3fda39413` |           |                 |             |             |
|  60 | `专卖类/五级/2024年4月专卖五级技能试卷.pdf`                                          | `.pdf`  |     325,803 | `e9a6d3d7c60d` |         6 |                 |             |             |
|  61 | `专卖类/五级/2024年4月专卖五级技能试卷-答案.docx`                                    | `.docx` |      23,047 | `a319f98d77db` |           |             112 |           0 |             |
|  62 | `专卖类/五级/2024年4月专卖五级技能试卷-答案.pdf`                                     | `.pdf`  |     198,941 | `10f15339f7d2` |         4 |                 |             |             |

## Preliminary Import Mapping

Profession mapping:

- `monopoly`: `40` files under `专卖类`.
- `marketing`: `22` files under `营销类`.
- `logistics`: `0` files observed; the profession remains reserved but has no local source content in this dry run.

Level mapping:

- `level_3`: 专卖三级 and 营销三级 paper/resource candidates.
- `level_4`: 专卖四级 paper candidates.
- `level_5`: 专卖五级 paper candidates.
- `level_3_to_5`: textbook resources that explicitly span 三至五级 should be treated as cross-level resources, not one single level.

Subject and entity mapping:

- `theory` paper candidates: `10` likely paper sets.
  - Monopoly: 3 levels x 3 dates = `9` theory paper sets.
  - Marketing: `1` theory paper set.
  - These are the safest first import candidates because the research report concluded theory papers are structurally stable.
- `skill` paper candidates: `11` likely paper/mock sets.
  - Monopoly: 3 levels x 3 dates = `9` skill paper sets.
  - Marketing: `1` real skill paper set plus `1` mock skill paper set.
  - These require `paper_section`, `question_group`, `material`, and `scoring_point` handling instead of flat `question` import.
- `paper_asset` candidates:
  - main paper-like assets: `21`;
  - `standard_answer` assets: `21`;
  - answer sheet assets: `4`;
  - material assets: `3`;
  - resource-only or unknown paper usage assets: `13`.
- `resource` / `knowledge_node` candidates:
  - textbook resources: `2`;
  - courseware/lecture resources: `14`;
  - marketing system courseware can seed a fine-grained `knowledge_node` skeleton before OCR is solved for the large textbook PDF.

## Risk Classification

Risk tag counts:

| Risk                        | Count | Handling                                                                                                               |
| --------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------- |
| `skill_nested_structure`    |    31 | Requires `paper_section`, `question_group`, `material`, and `scoring_point`; do not flatten as simple `question` rows. |
| `standard_answer_redaction` |    21 | Evidence may record metadata only; never include answer text.                                                          |
| `split_2024_11_asset_set`   |    15 | Treat material/answer sheet/standard answer as multiple `paper_asset` rows under one `paper`.                          |
| `answer_sheet_structure`    |     4 | Useful for online answer layout, not a standalone `paper`.                                                             |
| `large_or_scanned_pdf`      |     1 | OCR risk; record only, do not expand implementation scope.                                                             |
| `legacy_doc`                |     1 | Prefer corresponding PDF/DOCX or future conversion workflow; no parser added in this task.                             |
| `pptx_courseware`           |     1 | RAG/resource candidate; slide metadata extracted, no content extracted.                                                |

Notable dry-run findings:

- The marketing textbook PDF is very large and remains the primary OCR/scanned-PDF risk. This matches the prior research conclusion.
- The marketing true skill PDF returned `0` pages with the simple PDF marker count, so future import must use a proper PDF parser/OCR pipeline before claiming reliable structure extraction.
- The 2024-11 monopoly skill materials confirm the split `paper_asset` model: material file, answer sheet file, and standard answer file should belong to the same `paper`.
- The marketing mock paper also confirms split assets with a paper, answer sheet, and answer/analysis file.
- Word/OpenXML files are viable metadata candidates for future structured extraction, with DOCX paragraph/table counts available without reading source text into evidence.
- The lone legacy DOC file is a future conversion risk; no new dependency or converter was introduced.

## Dry-Run Conclusion

Phase 10 local dev RC can perform a real-content dry run without connecting to a real AI provider, modifying runtime code, changing dependencies, importing production resources, or exposing source content. The current evidence is sufficient for metadata-level intake planning and validates that:

- theory papers are ready as first import candidates;
- skill papers require nested `paper_section` / `question_group` / `material` / `scoring_point` support;
- split paper assets should be modeled under the same `paper`;
- textbooks, courseware, lecture notes, and calculation-point files should be routed to `resource` / `knowledge_node` / future RAG preparation rather than direct `paper` import;
- OCR and legacy-format risks are known blockers for later parser implementation tasks, not blockers for this metadata-only dry run.

## Validation Commands

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-content-import-dry-run
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results on `codex/phase-10-local-real-content-import-dry-run`:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-content-import-dry-run`: pass; task was pending, dependency `phase-10-local-db-rebuild-seed-rehearsal` was complete, `taskPlanPolicy: required`, and allowed/blocked files were confirmed.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `103` files and `379` tests passed.
  - format:check: pass.
  - Note: an intermediate post-evidence run caught Markdown formatting on this evidence file; only allowed files were formatted with Prettier, then `Invoke-QualityGate.ps1` was rerun and passed.
- `npm.cmd run build`: pass; Next.js `16.2.6` production build compiled successfully and listed the current `/api/v1/` REST surface and app routes.
- `Test-NamingConventions.ps1`: pass; banned business terms absent, standalone risky `section`/`option` absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files were limited to the four task-queue allowed files.

## Residual Risk

- This task did not import files into the database or object storage; it only produced a local redacted metadata dry run.
- The PDF page count method is lightweight and not a replacement for a future robust parser/OCR workflow.
- No AI/RAG chunking, embedding, `citation`, or `evidence_status` validation is claimed here.
- Real `model_provider` credentials, real AI calls, and RAG smoke tests remain pending future Phase 10 tasks.

## Git Closeout

- implementationCommit: pending.
- metadataCommit: pending.
- merge: pending.
- postMergeValidation: pending.
- push: pending.
- cleanup: pending.

## Taste Compliance Self-Check

- Frontend visual taste: no UI or styling changes; no pure black, unreviewed gradient, token, Tailwind, or typography changes.
- Loading/empty/error: no runtime state handling changed.
- Interaction feedback: no interactive component behavior changed.
- Tailwind formatting: no Tailwind classes changed; format gate passed.
- Backend/API contract: no API runtime changed; build preserved the `/api/v1/` route surface under ADR-002.
- Naming discipline: naming convention gate passed; evidence uses glossary identifiers such as `profession`, `level`, `subject`, `paper`, `paper_asset`, `resource`, `knowledge_node`, `standard_answer`, `material`, `paper_section`, `question_group`, and `scoring_point`.
- Data privacy: no session token, password, secret, API key, database URL, raw prompt, raw answer, raw model response, provider payload, raw OCR output, real content excerpt, or production data was recorded.
- Environment isolation: all work stayed inside local `dev` and ignored `rawfiles/`; no staging, prod, cloud, deployment, public object storage, or production-resource operation was performed.
- Dependency/schema isolation: no dependency, lockfile, environment, schema, migration file, runtime source, or production-resource change was made.
