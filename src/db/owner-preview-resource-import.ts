import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type OwnerPreviewResourceImportMode = "dry_run" | "execute";

type OwnerPreviewDatabaseTargetFailureCategory =
  | "database_url_invalid"
  | "database_url_missing"
  | "database_name_not_local_dev"
  | "target_not_local_dev";

type OwnerPreviewDatabaseTarget =
  | {
      databaseName: string;
      hostClass: "loopback";
      ok: true;
    }
  | {
      failureCategory: OwnerPreviewDatabaseTargetFailureCategory;
      hostClass: "invalid" | "missing" | "remote";
      ok: false;
    };

export type OwnerPreviewResourcePackageStatus =
  | "blocked"
  | "partially_usable"
  | "usable";

export type OwnerPreviewResourceCoverage = {
  knowledgeNodeCount: number;
  levelCount: number;
  professionCount: number;
  subjectCount: number;
};

export type OwnerPreviewResourceFileCounts = {
  csvFileCount: number;
  jsonFileCount: number;
  sourceDocumentCount: number;
  structuredFileCount: number;
  totalFileCount: number;
  yamlFileCount: number;
};

export type OwnerPreviewResourcePackageValidation = {
  coverage: OwnerPreviewResourceCoverage;
  failureCategories: string[];
  fileCounts: OwnerPreviewResourceFileCounts;
  packageRoot: string;
  questionRowCount: number;
  resourceInventoryRowCount: number;
  status: OwnerPreviewResourcePackageStatus;
};

export type OwnerPreviewResourceImportExecutionSummary = {
  knowledgeBaseCount: number;
  knowledgeNodeCount: number;
  materialCount: number;
  paperCount: number;
  paperQuestionCount: number;
  questionCount: number;
  resourceCount: number;
};

export type OwnerPreviewResourceImportSummary = {
  databaseTarget?: OwnerPreviewDatabaseTarget;
  execution?: OwnerPreviewResourceImportExecutionSummary;
  failureCategory?: string;
  mode: OwnerPreviewResourceImportMode;
  status: "blocked" | "dry_run" | "executed";
  validation: OwnerPreviewResourcePackageValidation;
};

export type OwnerPreviewResourceImportRunResult = {
  status: "blocked" | "dry_run" | "executed";
  summary: OwnerPreviewResourceImportSummary;
};

export type OwnerPreviewResourceImportDatabaseAdapter = {
  close?: () => Promise<void> | void;
  importPackage: (
    dataset: OwnerPreviewResourceImportDataset,
  ) => Promise<OwnerPreviewResourceImportExecutionSummary>;
};

type OwnerPreviewResourceQuestionRow = {
  analysis: string;
  difficulty: string;
  knowledgeNode: string;
  level: number;
  options: OwnerPreviewResourceQuestionOption[];
  profession: OwnerPreviewResourceProfession;
  questionStem: string;
  questionType: OwnerPreviewResourceQuestionType;
  standardAnswer: string;
  subject: OwnerPreviewResourceSubject;
};

type OwnerPreviewResourceQuestionOption = {
  content: string;
  isCorrect: boolean;
  label: string;
  sortOrder: number;
};

type OwnerPreviewResourceInventoryRow = {
  extension: string | null;
  fileSizeByte: number | null;
  hash: string | null;
  kind: OwnerPreviewResourceType;
  level: number | null;
  levels: number[];
  profession: OwnerPreviewResourceProfession;
  subject: OwnerPreviewResourceSubject | null;
  subjectLabel: string;
};

type OwnerPreviewResourceImportDataset = {
  inventoryRows: OwnerPreviewResourceInventoryRow[];
  questionRows: OwnerPreviewResourceQuestionRow[];
  validation: OwnerPreviewResourcePackageValidation;
};

type OwnerPreviewResourceProfession = "logistics" | "marketing" | "monopoly";
type OwnerPreviewResourceSubject = "skill" | "theory";
type OwnerPreviewResourceQuestionType =
  | "case_analysis"
  | "calculation"
  | "fill_blank"
  | "multi_choice"
  | "short_answer"
  | "single_choice"
  | "true_false";
type OwnerPreviewResourceType =
  | "courseware"
  | "knowledge_doc"
  | "lecture_note"
  | "other"
  | "textbook";

type CsvRecord = Record<string, string>;

type QueryableSql = {
  <Row extends Record<string, unknown> = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Row[]>;
  begin<T>(callback: (sql: QueryableSql) => Promise<T>): Promise<T>;
  end?: () => Promise<void>;
};

const databaseUrlEnvKey = "DATABASE" + "_URL";
const defaultPackageRoot = "D:\\tiku-local-private\\owner-facing-fixtures";
const curatedRootSegment = "2026-06-28-rawfiles-curated";
const questionImportFileName = "minimal-question-import.csv";
const sourceInventoryFileName = "source-inventory.json";
const localLoopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const localDatabaseNamePattern = /^tiku(?:$|[_-])/i;
const nonLocalDatabaseNamePattern = /(prod|production|staging|cloud)/i;

const professionValues = ["logistics", "marketing", "monopoly"] as const;
const subjectValues = ["skill", "theory"] as const;
const questionTypeValues = [
  "case_analysis",
  "calculation",
  "fill_blank",
  "multi_choice",
  "short_answer",
  "single_choice",
  "true_false",
] as const;
const resourceTypeValues = [
  "courseware",
  "knowledge_doc",
  "lecture_note",
  "other",
  "textbook",
] as const;
const sourceDocumentExtensions = new Set([".docx", ".md", ".pdf", ".pptx"]);
const structuredExtensions = new Set([".csv", ".json", ".md", ".yaml", ".yml"]);

const forbiddenEvidencePatterns = [
  /postgres(?:ql)?:\/\//i,
  /\bdatabase_url\b/i,
  /\bpassword\b/i,
  /\btoken\b/i,
  /\bcookie\b/i,
  /\bsession\b/i,
  /localstorage/i,
  /authorization_header/i,
  /bearer\s+[a-z0-9._-]+/i,
  /api[_-]?key/i,
  /redeem_code/i,
  /provider_payload/i,
  /raw_ai_output/i,
  /raw_prompt/i,
  /\bemail\b/i,
  /\bphone\b/i,
  /public_id/i,
  /internal_id/i,
];

export async function validateOwnerPreviewResourcePackage(
  packageRoot: string,
): Promise<OwnerPreviewResourcePackageValidation> {
  const dataset = loadOwnerPreviewResourceImportDataset(packageRoot);

  return dataset.validation;
}

export function createOwnerPreviewResourceImportDryRunSummary(input: {
  validation: OwnerPreviewResourcePackageValidation;
}): OwnerPreviewResourceImportSummary {
  return {
    mode: "dry_run",
    status: "dry_run",
    validation: input.validation,
  };
}

export function validateOwnerPreviewResourceDatabaseUrl(
  databaseUrl: string | null | undefined,
): OwnerPreviewDatabaseTarget {
  if (!databaseUrl) {
    return {
      failureCategory: "database_url_missing",
      hostClass: "missing",
      ok: false,
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    return {
      failureCategory: "database_url_invalid",
      hostClass: "invalid",
      ok: false,
    };
  }

  const protocol = parsedUrl.protocol.toLowerCase();
  const hostName = parsedUrl.hostname.toLowerCase();
  const databaseName = decodeURIComponent(parsedUrl.pathname).replace(
    /^\/+/,
    "",
  );

  if (!["postgres:", "postgresql:"].includes(protocol)) {
    return {
      failureCategory: "database_url_invalid",
      hostClass: "invalid",
      ok: false,
    };
  }

  if (!localLoopbackHosts.has(hostName)) {
    return {
      failureCategory: "target_not_local_dev",
      hostClass: "remote",
      ok: false,
    };
  }

  if (
    !databaseName ||
    !localDatabaseNamePattern.test(databaseName) ||
    nonLocalDatabaseNamePattern.test(databaseName)
  ) {
    return {
      failureCategory: "database_name_not_local_dev",
      hostClass: "remote",
      ok: false,
    };
  }

  return {
    databaseName,
    hostClass: "loopback",
    ok: true,
  };
}

export function containsForbiddenOwnerPreviewResourceImportEvidenceText(
  text: string,
) {
  return forbiddenEvidencePatterns.some((pattern) => pattern.test(text));
}

export function renderOwnerPreviewResourceImportSummary(
  summary: OwnerPreviewResourceImportSummary,
) {
  const lines = [
    "ownerPreviewResourceImport",
    `mode=${summary.mode}`,
    `status=${summary.status}`,
    `packageStatus=${summary.validation.status}`,
    `totalFileCount=${summary.validation.fileCounts.totalFileCount}`,
    `structuredFileCount=${summary.validation.fileCounts.structuredFileCount}`,
    `sourceDocumentCount=${summary.validation.fileCounts.sourceDocumentCount}`,
    `questionRowCount=${summary.validation.questionRowCount}`,
    `resourceInventoryRowCount=${summary.validation.resourceInventoryRowCount}`,
    `professionCount=${summary.validation.coverage.professionCount}`,
    `levelCount=${summary.validation.coverage.levelCount}`,
    `subjectCount=${summary.validation.coverage.subjectCount}`,
    `knowledgeNodeCount=${summary.validation.coverage.knowledgeNodeCount}`,
  ];

  if (summary.databaseTarget) {
    lines.push(renderDatabaseTarget(summary.databaseTarget));
  } else {
    lines.push("databaseTarget=not_required");
  }

  for (const failureCategory of summary.validation.failureCategories) {
    lines.push(`packageFailureCategory=${failureCategory}`);
  }

  if (summary.execution) {
    lines.push(
      `importedKnowledgeBaseCount=${summary.execution.knowledgeBaseCount}`,
    );
    lines.push(
      `importedKnowledgeNodeCount=${summary.execution.knowledgeNodeCount}`,
    );
    lines.push(`importedMaterialCount=${summary.execution.materialCount}`);
    lines.push(`importedQuestionCount=${summary.execution.questionCount}`);
    lines.push(`importedResourceCount=${summary.execution.resourceCount}`);
    lines.push(`importedPaperCount=${summary.execution.paperCount}`);
    lines.push(
      `importedPaperQuestionCount=${summary.execution.paperQuestionCount}`,
    );
  }

  if (summary.failureCategory) {
    lines.push(`failureCategory=${summary.failureCategory}`);
  }

  return lines.join("\n");
}

export async function runOwnerPreviewResourceImport(input: {
  adapter?: OwnerPreviewResourceImportDatabaseAdapter;
  confirmOwnerPreviewResourceImport: boolean;
  databaseUrl?: string;
  mode: OwnerPreviewResourceImportMode;
  packageRoot: string;
}): Promise<OwnerPreviewResourceImportRunResult> {
  const dataset = loadOwnerPreviewResourceImportDataset(input.packageRoot);

  if (input.mode === "dry_run") {
    const summary = createOwnerPreviewResourceImportDryRunSummary({
      validation: dataset.validation,
    });

    return { status: "dry_run", summary };
  }

  const databaseTarget = validateOwnerPreviewResourceDatabaseUrl(
    input.databaseUrl,
  );
  const failureCategory = resolveOwnerPreviewResourceImportExecutionBlock({
    confirmOwnerPreviewResourceImport: input.confirmOwnerPreviewResourceImport,
    databaseTarget,
    validation: dataset.validation,
  });

  if (failureCategory !== null) {
    return {
      status: "blocked",
      summary: {
        databaseTarget,
        failureCategory,
        mode: input.mode,
        status: "blocked",
        validation: dataset.validation,
      },
    };
  }

  const adapter =
    input.adapter ??
    (await createOwnerPreviewResourceImportPostgresAdapter(input.databaseUrl));

  try {
    const execution = await adapter.importPackage(dataset);

    return {
      status: "executed",
      summary: {
        databaseTarget,
        execution,
        mode: input.mode,
        status: "executed",
        validation: dataset.validation,
      },
    };
  } catch (error) {
    return {
      status: "blocked",
      summary: {
        databaseTarget,
        failureCategory: resolveSafeImportFailureCategory(error),
        mode: input.mode,
        status: "blocked",
        validation: dataset.validation,
      },
    };
  } finally {
    await adapter.close?.();
  }
}

export async function createOwnerPreviewResourceImportPostgresAdapter(
  databaseUrl: string | undefined,
): Promise<OwnerPreviewResourceImportDatabaseAdapter> {
  if (!databaseUrl) {
    throw new Error("database_url_missing");
  }

  const postgresModule = await import("postgres");
  const postgresFactory = postgresModule.default;
  const sql = postgresFactory(databaseUrl, {
    connect_timeout: 5,
    idle_timeout: 5,
    max: 1,
  }) as unknown as QueryableSql;

  return createOwnerPreviewResourceImportSqlAdapter(sql);
}

export function createOwnerPreviewResourceImportSqlAdapter(
  sql: QueryableSql,
): OwnerPreviewResourceImportDatabaseAdapter {
  return {
    close: () => sql.end?.(),
    importPackage: (dataset) => importOwnerPreviewResourceDataset(sql, dataset),
  };
}

export async function runOwnerPreviewResourceImportCli(
  argv = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
  io: {
    error: (message: string) => void;
    log: (message: string) => void;
  } = console,
) {
  const mode: OwnerPreviewResourceImportMode = argv.includes("--execute")
    ? "execute"
    : "dry_run";
  const confirmOwnerPreviewResourceImport = argv.includes(
    "--confirm-owner-preview-resource-import",
  );
  const packageRoot =
    readCliValue(argv, "--package-root") ??
    env.OWNER_PREVIEW_RESOURCE_PACKAGE_ROOT ??
    defaultPackageRoot;
  if (mode === "execute") {
    loadLocalDatabaseUrlEnvIfMissing(env, process.cwd());
  }

  const databaseUrl = mode === "execute" ? env[databaseUrlEnvKey] : undefined;
  const result = await runOwnerPreviewResourceImport({
    confirmOwnerPreviewResourceImport,
    databaseUrl,
    mode,
    packageRoot,
  });
  const rendered = renderOwnerPreviewResourceImportSummary(result.summary);

  if (containsForbiddenOwnerPreviewResourceImportEvidenceText(rendered)) {
    io.error("ownerPreviewResourceImport output redaction guard failed.");
    return 2;
  }

  io.log(rendered);

  return result.status === "blocked" ? 1 : 0;
}

function loadOwnerPreviewResourceImportDataset(
  packageRoot: string,
): OwnerPreviewResourceImportDataset {
  const normalizedPackageRoot = resolve(packageRoot);
  const failureCategories: string[] = [];

  if (!existsSync(normalizedPackageRoot)) {
    const validation = createEmptyValidation(
      normalizedPackageRoot,
      "package_root_missing",
    );

    return {
      inventoryRows: [],
      questionRows: [],
      validation,
    };
  }

  const packageFiles = collectPackageFiles(normalizedPackageRoot);
  const fileCounts = countPackageFiles(packageFiles);
  const questionCsvPath = findPackageFilePath(
    packageFiles,
    questionImportFileName,
  );
  const inventoryJsonPath = findPackageFilePath(
    packageFiles,
    sourceInventoryFileName,
  );
  const questionRows =
    questionCsvPath === null
      ? []
      : readQuestionImportRows(join(normalizedPackageRoot, questionCsvPath));
  const inventoryRows =
    inventoryJsonPath === null
      ? []
      : readInventoryRows(join(normalizedPackageRoot, inventoryJsonPath));

  if (questionCsvPath === null) {
    failureCategories.push("question_import_csv_missing");
  }

  if (inventoryJsonPath === null) {
    failureCategories.push("resource_inventory_missing");
  }

  if (questionRows.length === 0) {
    failureCategories.push("question_rows_empty");
  }

  if (inventoryRows.length === 0) {
    failureCategories.push("resource_inventory_rows_empty");
  }

  const coverage = calculateCoverage(questionRows, inventoryRows);
  const status = resolvePackageStatus({
    coverage,
    failureCategories,
    questionRowCount: questionRows.length,
    resourceInventoryRowCount: inventoryRows.length,
  });

  return {
    inventoryRows,
    questionRows,
    validation: {
      coverage,
      failureCategories,
      fileCounts,
      packageRoot: normalizedPackageRoot,
      questionRowCount: questionRows.length,
      resourceInventoryRowCount: inventoryRows.length,
      status,
    },
  };
}

function createEmptyValidation(
  packageRoot: string,
  failureCategory: string,
): OwnerPreviewResourcePackageValidation {
  return {
    coverage: {
      knowledgeNodeCount: 0,
      levelCount: 0,
      professionCount: 0,
      subjectCount: 0,
    },
    failureCategories: [failureCategory],
    fileCounts: {
      csvFileCount: 0,
      jsonFileCount: 0,
      sourceDocumentCount: 0,
      structuredFileCount: 0,
      totalFileCount: 0,
      yamlFileCount: 0,
    },
    packageRoot,
    questionRowCount: 0,
    resourceInventoryRowCount: 0,
    status: "blocked",
  };
}

function collectPackageFiles(packageRoot: string) {
  const result: string[] = [];

  function visit(directoryPath: string) {
    for (const directoryEntry of readdirSync(directoryPath)) {
      const absolutePath = join(directoryPath, directoryEntry);
      const relativePath = absolutePath
        .slice(packageRoot.length + 1)
        .replaceAll("\\", "/");
      const fileStatus = statSync(absolutePath);

      if (fileStatus.isDirectory()) {
        visit(absolutePath);
      } else if (fileStatus.isFile()) {
        result.push(relativePath);
      }
    }
  }

  visit(packageRoot);

  return result;
}

function countPackageFiles(files: string[]): OwnerPreviewResourceFileCounts {
  let csvFileCount = 0;
  let jsonFileCount = 0;
  let sourceDocumentCount = 0;
  let structuredFileCount = 0;
  let yamlFileCount = 0;

  for (const filePath of files) {
    const extension = extname(filePath).toLowerCase();

    if (extension === ".csv") {
      csvFileCount += 1;
    }

    if (extension === ".json") {
      jsonFileCount += 1;
    }

    if (extension === ".yaml" || extension === ".yml") {
      yamlFileCount += 1;
    }

    if (structuredExtensions.has(extension)) {
      structuredFileCount += 1;
    }

    if (sourceDocumentExtensions.has(extension)) {
      sourceDocumentCount += 1;
    }
  }

  return {
    csvFileCount,
    jsonFileCount,
    sourceDocumentCount,
    structuredFileCount,
    totalFileCount: files.length,
    yamlFileCount,
  };
}

function findPackageFilePath(files: string[], fileName: string) {
  const preferredPath = files.find(
    (filePath) =>
      filePath.includes(`${curatedRootSegment}/`) &&
      basename(filePath) === fileName,
  );

  return (
    preferredPath ??
    files.find((filePath) => basename(filePath) === fileName) ??
    null
  );
}

function readQuestionImportRows(
  filePath: string,
): OwnerPreviewResourceQuestionRow[] {
  const records = parseCsvRecords(readFileSync(filePath, "utf8"));

  return records
    .map(mapQuestionImportRecord)
    .filter((row): row is OwnerPreviewResourceQuestionRow => row !== null);
}

function readInventoryRows(
  filePath: string,
): OwnerPreviewResourceInventoryRow[] {
  const parsedValue: unknown = JSON.parse(readFileSync(filePath, "utf8"));

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .map(mapInventoryRecord)
    .filter((row): row is OwnerPreviewResourceInventoryRow => row !== null);
}

function parseCsvRecords(csvText: string): CsvRecord[] {
  const rows = parseCsvRows(csvText);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());

  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row) =>
      headers.reduce<CsvRecord>((record, header, index) => {
        record[header] = row[index]?.trim() ?? "";
        return record;
      }, {}),
    );
}

function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      currentField += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentField);
      rows.push(currentRow);
      currentField = "";
      currentRow = [];
      continue;
    }

    currentField += character;
  }

  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function mapQuestionImportRecord(
  record: CsvRecord,
): OwnerPreviewResourceQuestionRow | null {
  const profession = normalizeProfession(record.profession);
  const level = normalizeSingleLevel(record.level);
  const subject = normalizeSubject(record.subject);
  const questionType = normalizeQuestionType(record.questionType);
  const knowledgeNode = normalizeRequiredText(record.knowledgeNode);
  const questionStem = normalizeRequiredText(record.questionStem);
  const standardAnswer = normalizeRequiredText(record.standardAnswer);
  const analysis = normalizeRequiredText(record.analysis);

  if (
    profession === null ||
    level === null ||
    subject === null ||
    questionType === null ||
    knowledgeNode === null ||
    questionStem === null ||
    standardAnswer === null ||
    analysis === null
  ) {
    return null;
  }

  return {
    analysis,
    difficulty: normalizeRequiredText(record.difficulty) ?? "medium",
    knowledgeNode,
    level,
    options: createQuestionOptions(record, standardAnswer),
    profession,
    questionStem,
    questionType,
    standardAnswer,
    subject,
  };
}

function mapInventoryRecord(
  value: unknown,
): OwnerPreviewResourceInventoryRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const profession = normalizeProfession(value.profession);
  const levels = normalizeLevels(value.level);
  const subject = normalizeSubject(value.subject);

  if (profession === null) {
    return null;
  }

  return {
    extension: normalizeOptionalText(value.extension),
    fileSizeByte: normalizeOptionalNumber(value.sourceSizeBytes),
    hash: normalizeOptionalText(value.fixtureSha256),
    kind: normalizeResourceType(value.kind),
    level: levels.length === 1 ? levels[0] : null,
    levels,
    profession,
    subject,
    subjectLabel: normalizeOptionalText(value.subject) ?? "unspecified",
  };
}

function createQuestionOptions(
  record: CsvRecord,
  standardAnswer: string,
): OwnerPreviewResourceQuestionOption[] {
  return ["A", "B", "C", "D"].flatMap((label, index) => {
    const content = normalizeRequiredText(record[`option${label}`]);

    if (content === null) {
      return [];
    }

    return {
      content,
      isCorrect: standardAnswer
        .split(/[;,\s]+/)
        .map((answer) => answer.trim().toUpperCase())
        .includes(label),
      label,
      sortOrder: index + 1,
    };
  });
}

function calculateCoverage(
  questionRows: OwnerPreviewResourceQuestionRow[],
  inventoryRows: OwnerPreviewResourceInventoryRow[],
): OwnerPreviewResourceCoverage {
  const professions = new Set<OwnerPreviewResourceProfession>();
  const levels = new Set<number>();
  const subjects = new Set<OwnerPreviewResourceSubject>();
  const knowledgeNodes = new Set<string>();

  for (const row of questionRows) {
    professions.add(row.profession);
    levels.add(row.level);
    subjects.add(row.subject);
    knowledgeNodes.add(`${row.profession}:${row.knowledgeNode}`);
  }

  for (const row of inventoryRows) {
    professions.add(row.profession);
    for (const level of row.levels) {
      levels.add(level);
    }

    if (row.subject !== null) {
      subjects.add(row.subject);
    }
  }

  return {
    knowledgeNodeCount: knowledgeNodes.size,
    levelCount: levels.size,
    professionCount: professions.size,
    subjectCount: subjects.size,
  };
}

function resolvePackageStatus(input: {
  coverage: OwnerPreviewResourceCoverage;
  failureCategories: string[];
  questionRowCount: number;
  resourceInventoryRowCount: number;
}): OwnerPreviewResourcePackageStatus {
  if (input.questionRowCount > 0 && input.resourceInventoryRowCount > 0) {
    return input.coverage.knowledgeNodeCount > 0
      ? "usable"
      : "partially_usable";
  }

  if (
    input.questionRowCount > 0 ||
    input.resourceInventoryRowCount > 0 ||
    input.failureCategories.length < 4
  ) {
    return "partially_usable";
  }

  return "blocked";
}

function resolveOwnerPreviewResourceImportExecutionBlock(input: {
  confirmOwnerPreviewResourceImport: boolean;
  databaseTarget: OwnerPreviewDatabaseTarget;
  validation: OwnerPreviewResourcePackageValidation;
}) {
  if (!input.confirmOwnerPreviewResourceImport) {
    return "owner_preview_resource_import_confirmation_missing";
  }

  if (!input.databaseTarget.ok) {
    return input.databaseTarget.failureCategory;
  }

  if (input.validation.status === "blocked") {
    return "resource_package_not_usable";
  }

  return null;
}

function resolveSafeImportFailureCategory(error: unknown) {
  if (
    error instanceof Error &&
    error.message === "owner_preview_content_admin_missing"
  ) {
    return error.message;
  }

  return "resource_import_execution_failed";
}

async function importOwnerPreviewResourceDataset(
  sql: QueryableSql,
  dataset: OwnerPreviewResourceImportDataset,
): Promise<OwnerPreviewResourceImportExecutionSummary> {
  return sql.begin(async (transaction) => {
    const contentAdminId = await resolveContentAdminId(transaction);
    const knowledgeBaseIdsByProfession = await upsertKnowledgeBases(
      transaction,
      dataset,
    );
    const materialIdsByGroup = await upsertMaterials(
      transaction,
      dataset,
      contentAdminId,
    );
    const knowledgeNodeIdsByKey = await upsertKnowledgeNodes(
      transaction,
      dataset,
      knowledgeBaseIdsByProfession,
    );
    const resourceCount = await upsertResources(
      transaction,
      dataset,
      knowledgeBaseIdsByProfession,
      knowledgeNodeIdsByKey,
    );
    const questionIdsByKey = await upsertQuestions(
      transaction,
      dataset,
      materialIdsByGroup,
      knowledgeNodeIdsByKey,
      contentAdminId,
    );
    const paperSummary = await upsertPapers(
      transaction,
      dataset,
      questionIdsByKey,
      contentAdminId,
    );

    return {
      knowledgeBaseCount: knowledgeBaseIdsByProfession.size,
      knowledgeNodeCount: knowledgeNodeIdsByKey.size,
      materialCount: materialIdsByGroup.size,
      paperCount: paperSummary.paperCount,
      paperQuestionCount: paperSummary.paperQuestionCount,
      questionCount: questionIdsByKey.size,
      resourceCount,
    };
  });
}

async function resolveContentAdminId(sql: QueryableSql) {
  const rows = await sql<{ id: number }>`
    SELECT id
    FROM admin
    WHERE admin_role = ${"content_admin"}
      AND status = ${"active"}
    ORDER BY id
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error("owner_preview_content_admin_missing");
  }

  return Number(rows[0].id);
}

async function upsertKnowledgeBases(
  sql: QueryableSql,
  dataset: OwnerPreviewResourceImportDataset,
) {
  const professions = uniqueValues([
    ...dataset.questionRows.map((row) => row.profession),
    ...dataset.inventoryRows.map((row) => row.profession),
  ]);
  const idsByProfession = new Map<OwnerPreviewResourceProfession, number>();

  for (const profession of professions) {
    const rows = await sql<{ id: number }>`
      INSERT INTO knowledge_base (
        public_id,
        profession,
        display_name,
        description,
        is_enabled
      )
      VALUES (
        ${createPublicId("knowledge_base", [profession])},
        ${profession},
        ${`Owner preview ${profession} knowledge base`},
        ${"Local owner preview resource package coverage."},
        true
      )
      ON CONFLICT (profession)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        is_enabled = true,
        updated_at = now()
      RETURNING id
    `;

    idsByProfession.set(profession, Number(rows[0].id));
  }

  return idsByProfession;
}

async function upsertMaterials(
  sql: QueryableSql,
  dataset: OwnerPreviewResourceImportDataset,
  contentAdminId: number,
) {
  const groups = uniqueQuestionGroups(dataset.questionRows);
  const idsByGroup = new Map<string, number>();

  for (const group of groups) {
    const groupKey = createGroupKey(group);
    const rows = await sql<{ id: number }>`
      INSERT INTO material (
        public_id,
        title,
        content_rich_text,
        profession,
        level,
        subject,
        status,
        is_locked,
        created_by_admin_id,
        updated_by_admin_id
      )
      VALUES (
        ${createPublicId("material", [group.profession, String(group.level), group.subject])},
        ${`Owner preview ${group.profession} L${group.level} ${group.subject} material`},
        ${"Owner preview placeholder material for local data-backed walkthrough."},
        ${group.profession},
        ${group.level},
        ${group.subject},
        ${"available"},
        false,
        ${contentAdminId},
        ${contentAdminId}
      )
      ON CONFLICT (public_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        content_rich_text = EXCLUDED.content_rich_text,
        status = EXCLUDED.status,
        is_locked = false,
        updated_by_admin_id = EXCLUDED.updated_by_admin_id,
        updated_at = now()
      RETURNING id
    `;

    idsByGroup.set(groupKey, Number(rows[0].id));
  }

  return idsByGroup;
}

async function upsertKnowledgeNodes(
  sql: QueryableSql,
  dataset: OwnerPreviewResourceImportDataset,
  knowledgeBaseIdsByProfession: Map<OwnerPreviewResourceProfession, number>,
) {
  const nodeInputs = uniqueKnowledgeNodeInputs(dataset);
  const idsByKey = new Map<string, number>();

  for (const nodeInput of nodeInputs) {
    const knowledgeBaseId = knowledgeBaseIdsByProfession.get(
      nodeInput.profession,
    );

    if (knowledgeBaseId === undefined) {
      continue;
    }

    const rows = await sql<{ id: number }>`
      INSERT INTO knowledge_node (
        public_id,
        knowledge_base_id,
        profession,
        level_list,
        name,
        path_name,
        depth,
        sort_order,
        kn_status,
        is_recommendable
      )
      VALUES (
        ${createPublicId("knowledge_node", [nodeInput.profession, nodeInput.name])},
        ${knowledgeBaseId},
        ${nodeInput.profession},
        ${JSON.stringify(nodeInput.levels)},
        ${nodeInput.name},
        ${nodeInput.name},
        1,
        ${nodeInput.sortOrder},
        ${"active"},
        true
      )
      ON CONFLICT (public_id)
      DO UPDATE SET
        level_list = EXCLUDED.level_list,
        name = EXCLUDED.name,
        path_name = EXCLUDED.path_name,
        sort_order = EXCLUDED.sort_order,
        kn_status = EXCLUDED.kn_status,
        is_recommendable = true,
        updated_at = now(),
        disabled_at = null
      RETURNING id
    `;

    idsByKey.set(
      createKnowledgeNodeKey(nodeInput.profession, nodeInput.name),
      Number(rows[0].id),
    );
  }

  return idsByKey;
}

async function upsertResources(
  sql: QueryableSql,
  dataset: OwnerPreviewResourceImportDataset,
  knowledgeBaseIdsByProfession: Map<OwnerPreviewResourceProfession, number>,
  knowledgeNodeIdsByKey: Map<string, number>,
) {
  let resourceCount = 0;

  for (const [index, row] of dataset.inventoryRows.entries()) {
    const knowledgeBaseId = knowledgeBaseIdsByProfession.get(row.profession);

    if (knowledgeBaseId === undefined) {
      continue;
    }

    const rows = await sql<{ id: number }>`
      INSERT INTO resource (
        public_id,
        knowledge_base_id,
        resource_type,
        resource_status,
        title,
        content_hash,
        file_size_byte,
        profession,
        level,
        is_vector_stale
      )
      VALUES (
        ${createPublicId("resource", [row.profession, row.levels.join("_"), row.subjectLabel, String(index)])},
        ${knowledgeBaseId},
        ${row.kind},
        ${"uploaded"},
        ${`Owner preview ${row.profession} ${renderResourceLevelLabel(row)} ${row.subjectLabel} resource ${index + 1}`},
        ${row.hash},
        ${row.fileSizeByte},
        ${row.profession},
        ${row.level},
        false
      )
      ON CONFLICT (public_id)
      DO UPDATE SET
        resource_type = EXCLUDED.resource_type,
        resource_status = EXCLUDED.resource_status,
        title = EXCLUDED.title,
        content_hash = EXCLUDED.content_hash,
        file_size_byte = EXCLUDED.file_size_byte,
        is_vector_stale = false,
        updated_at = now()
      RETURNING id
    `;
    const resourceId = Number(rows[0].id);
    const knowledgeNodeId = resolveKnowledgeNodeForResource(
      row,
      knowledgeNodeIdsByKey,
    );

    if (knowledgeNodeId !== null) {
      await sql`
        INSERT INTO knowledge_node_resource (
          knowledge_node_id,
          resource_id
        )
        VALUES (${knowledgeNodeId}, ${resourceId})
        ON CONFLICT (knowledge_node_id, resource_id) DO NOTHING
      `;
    }

    resourceCount += 1;
  }

  return resourceCount;
}

async function upsertQuestions(
  sql: QueryableSql,
  dataset: OwnerPreviewResourceImportDataset,
  materialIdsByGroup: Map<string, number>,
  knowledgeNodeIdsByKey: Map<string, number>,
  contentAdminId: number,
) {
  const idsByKey = new Map<string, number>();

  for (const [index, row] of dataset.questionRows.entries()) {
    const questionKey = createQuestionKey(row);
    const materialId = materialIdsByGroup.get(createGroupKey(row)) ?? null;
    const rows = await sql<{ id: number }>`
      INSERT INTO question (
        public_id,
        question_type,
        profession,
        level,
        subject,
        stem_rich_text,
        analysis_rich_text,
        standard_answer_rich_text,
        status,
        is_locked,
        multi_choice_rule,
        scoring_method,
        fill_blank_answers,
        material_id,
        created_by_admin_id,
        updated_by_admin_id
      )
      VALUES (
        ${createPublicId("question", [
          row.profession,
          String(row.level),
          row.subject,
          row.knowledgeNode,
          row.questionStem,
          String(index),
        ])},
        ${row.questionType},
        ${row.profession},
        ${row.level},
        ${row.subject},
        ${row.questionStem},
        ${row.analysis},
        ${row.standardAnswer},
        ${"available"},
        false,
        ${"all_correct_only"},
        ${"auto_match"},
        ${JSON.stringify([])},
        ${materialId},
        ${contentAdminId},
        ${contentAdminId}
      )
      ON CONFLICT (public_id)
      DO UPDATE SET
        question_type = EXCLUDED.question_type,
        stem_rich_text = EXCLUDED.stem_rich_text,
        analysis_rich_text = EXCLUDED.analysis_rich_text,
        standard_answer_rich_text = EXCLUDED.standard_answer_rich_text,
        status = EXCLUDED.status,
        is_locked = false,
        material_id = EXCLUDED.material_id,
        updated_by_admin_id = EXCLUDED.updated_by_admin_id,
        updated_at = now()
      RETURNING id
    `;
    const questionId = Number(rows[0].id);

    await sql`DELETE FROM question_option WHERE question_id = ${questionId}`;

    for (const option of row.options) {
      await sql`
        INSERT INTO question_option (
          question_id,
          label,
          content_rich_text,
          is_correct,
          sort_order
        )
        VALUES (
          ${questionId},
          ${option.label},
          ${option.content},
          ${option.isCorrect},
          ${option.sortOrder}
        )
      `;
    }

    await sql`DELETE FROM question_knowledge_node WHERE question_id = ${questionId}`;

    const knowledgeNodeId = knowledgeNodeIdsByKey.get(
      createKnowledgeNodeKey(row.profession, row.knowledgeNode),
    );

    if (knowledgeNodeId !== undefined) {
      await sql`
        INSERT INTO question_knowledge_node (
          question_id,
          knowledge_node_id
        )
        VALUES (${questionId}, ${knowledgeNodeId})
        ON CONFLICT (question_id, knowledge_node_id) DO NOTHING
      `;
    }

    idsByKey.set(questionKey, questionId);
  }

  return idsByKey;
}

async function upsertPapers(
  sql: QueryableSql,
  dataset: OwnerPreviewResourceImportDataset,
  questionIdsByKey: Map<string, number>,
  contentAdminId: number,
) {
  let paperCount = 0;
  let paperQuestionCount = 0;
  const questionsByGroup = groupQuestionsByCoverage(dataset.questionRows);

  for (const [groupKey, questionRows] of questionsByGroup.entries()) {
    const firstQuestion = questionRows[0];
    const paperRows = await sql<{ id: number }>`
      INSERT INTO paper (
        public_id,
        name,
        profession,
        level,
        subject,
        paper_status,
        paper_type,
        year,
        duration_minute,
        total_score,
        published_at,
        created_by_admin_id,
        updated_by_admin_id
      )
      VALUES (
        ${createPublicId("paper", [groupKey])},
        ${`Owner preview ${firstQuestion.profession} L${firstQuestion.level} ${firstQuestion.subject} sample paper`},
        ${firstQuestion.profession},
        ${firstQuestion.level},
        ${firstQuestion.subject},
        ${"published"},
        ${"mock_paper"},
        2026,
        60,
        ${String(questionRows.length)},
        now(),
        ${contentAdminId},
        ${contentAdminId}
      )
      ON CONFLICT (public_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        paper_status = EXCLUDED.paper_status,
        paper_type = EXCLUDED.paper_type,
        year = EXCLUDED.year,
        duration_minute = EXCLUDED.duration_minute,
        total_score = EXCLUDED.total_score,
        published_at = now(),
        archived_at = null,
        updated_by_admin_id = EXCLUDED.updated_by_admin_id,
        updated_at = now()
      RETURNING id
    `;
    const paperId = Number(paperRows[0].id);

    await sql`DELETE FROM paper_section WHERE paper_id = ${paperId}`;

    const sectionRows = await sql<{ id: number }>`
      INSERT INTO paper_section (
        paper_id,
        title,
        description,
        sort_order,
        total_score
      )
      VALUES (
        ${paperId},
        ${"Owner preview section"},
        ${"Local data-backed walkthrough section."},
        1,
        ${String(questionRows.length)}
      )
      RETURNING id
    `;
    const paperSectionId = Number(sectionRows[0].id);

    for (const [index, questionRow] of questionRows.entries()) {
      const questionId = questionIdsByKey.get(createQuestionKey(questionRow));

      if (questionId === undefined) {
        continue;
      }

      await sql`
        INSERT INTO paper_question (
          public_id,
          paper_id,
          paper_section_id,
          question_id,
          question_snapshot,
          score,
          sort_order
        )
        VALUES (
          ${createPublicId("paper_question", [groupKey, createQuestionKey(questionRow)])},
          ${paperId},
          ${paperSectionId},
          ${questionId},
          ${JSON.stringify(createQuestionSnapshot(questionRow))},
          ${"1"},
          ${index + 1}
        )
        ON CONFLICT (public_id)
        DO UPDATE SET
          paper_id = EXCLUDED.paper_id,
          paper_section_id = EXCLUDED.paper_section_id,
          question_id = EXCLUDED.question_id,
          question_snapshot = EXCLUDED.question_snapshot,
          score = EXCLUDED.score,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()
      `;
      paperQuestionCount += 1;
    }

    paperCount += 1;
  }

  return { paperCount, paperQuestionCount };
}

function resolveKnowledgeNodeForResource(
  row: OwnerPreviewResourceInventoryRow,
  knowledgeNodeIdsByKey: Map<string, number>,
) {
  for (const [key, knowledgeNodeId] of knowledgeNodeIdsByKey.entries()) {
    if (key.startsWith(`${row.profession}:`)) {
      return knowledgeNodeId;
    }
  }

  return null;
}

function renderResourceLevelLabel(row: OwnerPreviewResourceInventoryRow) {
  if (row.level !== null) {
    return `L${row.level}`;
  }

  if (row.levels.length > 0) {
    return `L${row.levels.join("_")}`;
  }

  return "all-level";
}

function uniqueKnowledgeNodeInputs(dataset: OwnerPreviewResourceImportDataset) {
  const levelsByNode = new Map<string, Set<number>>();
  const namesByKey = new Map<
    string,
    { name: string; profession: OwnerPreviewResourceProfession }
  >();

  for (const row of dataset.questionRows) {
    const key = createKnowledgeNodeKey(row.profession, row.knowledgeNode);

    if (!levelsByNode.has(key)) {
      levelsByNode.set(key, new Set());
      namesByKey.set(key, {
        name: row.knowledgeNode,
        profession: row.profession,
      });
    }

    levelsByNode.get(key)?.add(row.level);
  }

  return Array.from(namesByKey.entries()).map(([key, value], index) => ({
    key,
    levels: Array.from(levelsByNode.get(key) ?? []).sort((a, b) => a - b),
    name: value.name,
    profession: value.profession,
    sortOrder: index + 1,
  }));
}

function uniqueQuestionGroups(rows: OwnerPreviewResourceQuestionRow[]) {
  return Array.from(
    new Map(rows.map((row) => [createGroupKey(row), row])).values(),
  );
}

function groupQuestionsByCoverage(rows: OwnerPreviewResourceQuestionRow[]) {
  const result = new Map<string, OwnerPreviewResourceQuestionRow[]>();

  for (const row of rows) {
    const groupKey = createGroupKey(row);

    result.set(groupKey, [...(result.get(groupKey) ?? []), row]);
  }

  return result;
}

function createQuestionSnapshot(row: OwnerPreviewResourceQuestionRow) {
  return {
    analysisRichText: row.analysis,
    knowledgeNode: row.knowledgeNode,
    options: row.options.map((option) => ({
      contentRichText: option.content,
      isCorrect: option.isCorrect,
      label: option.label,
      sortOrder: option.sortOrder,
    })),
    profession: row.profession,
    questionType: row.questionType,
    standardAnswerRichText: row.standardAnswer,
    stemRichText: row.questionStem,
    subject: row.subject,
  };
}

function uniqueValues<TValue>(values: TValue[]) {
  return Array.from(new Set(values));
}

function createGroupKey(input: {
  level: number;
  profession: OwnerPreviewResourceProfession;
  subject: OwnerPreviewResourceSubject;
}) {
  return `${input.profession}:${input.level}:${input.subject}`;
}

function createKnowledgeNodeKey(
  profession: OwnerPreviewResourceProfession,
  knowledgeNode: string,
) {
  return `${profession}:${knowledgeNode}`;
}

function createQuestionKey(row: OwnerPreviewResourceQuestionRow) {
  return createHash("sha256")
    .update(
      [
        createGroupKey(row),
        row.knowledgeNode,
        row.questionType,
        row.questionStem,
        row.standardAnswer,
      ].join("|"),
    )
    .digest("hex");
}

function createPublicId(kind: string, parts: string[]) {
  const digest = createHash("sha256").update(parts.join("|")).digest("hex");

  return `owner_preview_${kind}_${digest.slice(0, 16)}`;
}

function renderDatabaseTarget(databaseTarget: OwnerPreviewDatabaseTarget) {
  if (!databaseTarget.ok) {
    return `databaseTarget=blocked hostClass=${databaseTarget.hostClass} failureCategory=${databaseTarget.failureCategory}`;
  }

  return `databaseTarget=local hostClass=${databaseTarget.hostClass} databaseName=${databaseTarget.databaseName}`;
}

function readCliValue(argv: string[], optionName: string) {
  const inlineValue = argv.find((argument) =>
    argument.startsWith(`${optionName}=`),
  );

  if (inlineValue !== undefined) {
    return inlineValue.slice(optionName.length + 1);
  }

  const optionIndex = argv.indexOf(optionName);

  if (optionIndex >= 0 && argv[optionIndex + 1]) {
    return argv[optionIndex + 1];
  }

  return null;
}

function loadLocalDatabaseUrlEnvIfMissing(
  env: NodeJS.ProcessEnv,
  workspaceRoot: string,
) {
  if (env[databaseUrlEnvKey]) {
    return;
  }

  for (const envFileName of [".env.local", ".env.development.local", ".env"]) {
    const envFilePath = join(workspaceRoot, envFileName);

    if (!existsSync(envFilePath)) {
      continue;
    }

    const parsedValue = readEnvFileValue(envFilePath, databaseUrlEnvKey);

    if (parsedValue !== null) {
      env[databaseUrlEnvKey] = parsedValue;
      return;
    }
  }
}

function readEnvFileValue(envFilePath: string, key: string) {
  const lines = readFileSync(envFilePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (
      trimmedLine === "" ||
      trimmedLine.startsWith("#") ||
      !trimmedLine.startsWith(`${key}=`)
    ) {
      continue;
    }

    return unquoteEnvValue(trimmedLine.slice(key.length + 1).trim());
  }

  return null;
}

function unquoteEnvValue(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeProfession(
  value: unknown,
): OwnerPreviewResourceProfession | null {
  return normalizeEnumValue(value, professionValues);
}

function normalizeSubject(value: unknown): OwnerPreviewResourceSubject | null {
  return normalizeEnumValue(value, subjectValues);
}

function normalizeQuestionType(
  value: unknown,
): OwnerPreviewResourceQuestionType | null {
  const normalizedValue = normalizeOptionalText(value);

  if (normalizedValue === "multiple_choice") {
    return "multi_choice";
  }

  if (normalizedValue === "subjective") {
    return "short_answer";
  }

  return normalizeEnumValue(normalizedValue, questionTypeValues);
}

function normalizeResourceType(value: unknown): OwnerPreviewResourceType {
  const normalizedValue = normalizeOptionalText(value);

  if (normalizedValue === "material") {
    return "knowledge_doc";
  }

  if (normalizedValue === "paper" || normalizedValue === "answer_key") {
    return "other";
  }

  return normalizeEnumValue(normalizedValue, resourceTypeValues) ?? "other";
}

function normalizeEnumValue<const TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
): TValue | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return (
    allowedValues.find((allowedValue) => allowedValue === normalizedValue) ??
    null
  );
}

function normalizeSingleLevel(value: unknown) {
  const levels = normalizeLevels(value);

  return levels.length === 1 ? levels[0] : null;
}

function normalizeLevels(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return isAllowedLevel(value) ? [value] : [];
  }

  if (typeof value !== "string") {
    return [];
  }

  const normalizedValue = value.trim();
  const numericMatches = normalizedValue.match(/\d+/g) ?? [];
  const levels = numericMatches
    .map((match) => Number(match))
    .filter(isAllowedLevel);

  return Array.from(new Set(levels)).sort((left, right) => left - right);
}

function isAllowedLevel(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function normalizeRequiredText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue === "" ? null : normalizedValue;
}

function normalizeOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function normalizeOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const isDirectRun =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  runOwnerPreviewResourceImportCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
