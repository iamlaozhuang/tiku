import type {
  EmployeeImportSourceFormat,
  NormalizedEmployeeImportCommandInput,
} from "../contracts/employee-import-command-contract";

export type EmployeeImportSourceParseFailureReason =
  | "empty_source"
  | "malformed_quote"
  | "missing_required_header"
  | "duplicate_header"
  | "unknown_header"
  | "invalid_column_count"
  | "empty_data"
  | "row_limit_exceeded";

export type EmployeeImportSourceParseResult =
  | {
      success: true;
      rows: NormalizedEmployeeImportCommandInput["rows"];
    }
  | {
      success: false;
      reason: EmployeeImportSourceParseFailureReason;
      message: string;
    };

type DelimitedParseResult =
  | { success: true; records: string[][] }
  | {
      success: false;
      reason: "malformed_quote" | "row_limit_exceeded";
    };

type ParserState = "unquoted" | "quoted" | "quote_closed";

const EMPLOYEE_IMPORT_ROW_LIMIT = 500;
const REQUIRED_HEADERS = ["phone", "name"] as const;
const ALLOWED_HEADERS = new Set([...REQUIRED_HEADERS, "initialPassword"]);

const failureMessages = {
  duplicate_header: "Employee import source contains duplicate headers.",
  empty_data: "Employee import source must include at least one data row.",
  empty_source: "Employee import source is empty.",
  invalid_column_count:
    "Employee import source contains a row with an invalid column count.",
  malformed_quote: "Employee import source contains malformed quotes.",
  missing_required_header:
    "Employee import source must include phone and name headers.",
  row_limit_exceeded: "Employee import source exceeds 500 data rows.",
  unknown_header: "Employee import source contains unknown headers.",
} satisfies Record<EmployeeImportSourceParseFailureReason, string>;

function failed(
  reason: EmployeeImportSourceParseFailureReason,
): EmployeeImportSourceParseResult {
  return { success: false, reason, message: failureMessages[reason] };
}

function parseDelimitedRecords(
  content: string,
  delimiter: "," | "\t",
): DelimitedParseResult {
  const records: string[][] = [];
  let record: string[] = [];
  let cell = "";
  let cellWasQuoted = false;
  let recordHadStructure = false;
  let state: ParserState = "unquoted";

  const finishCell = () => {
    record.push(cellWasQuoted ? cell : cell.trim());
    cell = "";
    cellWasQuoted = false;
    state = "unquoted";
  };
  const finishRecord = (): boolean => {
    finishCell();
    const isBlankRecord =
      record.length === 1 && record[0] === "" && !recordHadStructure;
    if (!isBlankRecord) {
      records.push(record);
    }
    record = [];
    recordHadStructure = false;
    return records.length <= EMPLOYEE_IMPORT_ROW_LIMIT + 1;
  };

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (state === "quoted") {
      if (character === '"') {
        if (nextCharacter === '"') {
          cell += '"';
          index += 1;
        } else {
          state = "quote_closed";
        }
      } else {
        cell += character;
      }
      continue;
    }

    if (state === "quote_closed") {
      if (character === delimiter) {
        recordHadStructure = true;
        finishCell();
      } else if (character === "\r" || character === "\n") {
        if (!finishRecord()) {
          return { success: false, reason: "row_limit_exceeded" };
        }
        if (character === "\r" && nextCharacter === "\n") {
          index += 1;
        }
      } else if (!/\s/u.test(character)) {
        return { success: false, reason: "malformed_quote" };
      }
      continue;
    }

    if (character === '"') {
      if (cell.length > 0) {
        return { success: false, reason: "malformed_quote" };
      }
      cellWasQuoted = true;
      recordHadStructure = true;
      state = "quoted";
    } else if (character === delimiter) {
      recordHadStructure = true;
      finishCell();
    } else if (character === "\r" || character === "\n") {
      if (!finishRecord()) {
        return { success: false, reason: "row_limit_exceeded" };
      }
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
    } else {
      cell += character;
      if (!/\s/u.test(character)) {
        recordHadStructure = true;
      }
    }
  }

  if (state === "quoted") {
    return { success: false, reason: "malformed_quote" };
  }
  if (
    record.length > 0 ||
    cell.length > 0 ||
    cellWasQuoted ||
    recordHadStructure
  ) {
    if (!finishRecord()) {
      return { success: false, reason: "row_limit_exceeded" };
    }
  }

  return { success: true, records };
}

export function parseEmployeeImportSource(input: {
  content: string;
  sourceFormat: EmployeeImportSourceFormat;
}): EmployeeImportSourceParseResult {
  if (input.content.replace(/^\uFEFF/u, "").trim().length === 0) {
    return failed("empty_source");
  }

  const delimiter = input.sourceFormat === "tsv" ? "\t" : ",";
  const parsed = parseDelimitedRecords(input.content, delimiter);
  if (!parsed.success) {
    return failed(parsed.reason);
  }

  const [headerRecord, ...dataRecords] = parsed.records;
  if (headerRecord === undefined) {
    return failed("empty_source");
  }
  const headers = headerRecord.map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/u, "") : header).trim(),
  );
  if (new Set(headers).size !== headers.length) {
    return failed("duplicate_header");
  }
  if (headers.some((header) => !ALLOWED_HEADERS.has(header))) {
    return failed("unknown_header");
  }
  if (REQUIRED_HEADERS.some((header) => !headers.includes(header))) {
    return failed("missing_required_header");
  }
  if (dataRecords.length === 0) {
    return failed("empty_data");
  }
  if (dataRecords.length > EMPLOYEE_IMPORT_ROW_LIMIT) {
    return failed("row_limit_exceeded");
  }
  if (dataRecords.some((record) => record.length !== headers.length)) {
    return failed("invalid_column_count");
  }

  const headerIndexByName = new Map(
    headers.map((header, index) => [header, index]),
  );
  const valueFor = (record: string[], header: string) => {
    const headerIndex = headerIndexByName.get(header);
    return headerIndex === undefined ? "" : (record[headerIndex] ?? "");
  };

  return {
    success: true,
    rows: dataRecords.map((record, index) => ({
      initialPassword: valueFor(record, "initialPassword"),
      name: valueFor(record, "name"),
      phone: valueFor(record, "phone"),
      rowNumber: index + 1,
    })),
  };
}
