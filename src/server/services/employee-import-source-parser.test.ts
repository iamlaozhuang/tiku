import { describe, expect, it } from "vitest";

import { parseEmployeeImportSource } from "./employee-import-source-parser";

describe("parseEmployeeImportSource", () => {
  it("parses BOM, CRLF, quoted comma, escaped quote and quoted newline as logical rows", () => {
    const result = parseEmployeeImportSource({
      content:
        '\uFEFFphone,name,initialPassword\r\n13900000001,"Doe, ""Jane""","Sec,ret"\r\n13800000002,"Line\r\nBreak",\r\n',
      sourceFormat: "csv",
    });

    expect(result).toEqual({
      success: true,
      rows: [
        {
          rowNumber: 1,
          phone: "13900000001",
          name: 'Doe, "Jane"',
          initialPassword: "Sec,ret",
        },
        {
          rowNumber: 2,
          phone: "13800000002",
          name: "Line\r\nBreak",
          initialPassword: "",
        },
      ],
    });
  });

  it("parses TSV with quoted tabs and embedded newlines", () => {
    expect(
      parseEmployeeImportSource({
        content:
          'phone\tname\tinitialPassword\n13900000001\t"Employee\tOne"\t"Secret\nValue"',
        sourceFormat: "tsv",
      }),
    ).toEqual({
      success: true,
      rows: [
        {
          rowNumber: 1,
          phone: "13900000001",
          name: "Employee\tOne",
          initialPassword: "Secret\nValue",
        },
      ],
    });
  });

  it.each([
    ["unclosed quote", 'phone,name\n13900000001,"Employee'],
    ["quote inside an unquoted cell", 'phone,name\n13900000001,Em"ployee'],
    ["character after a closed quote", 'phone,name\n13900000001,"Employee"x'],
  ])("rejects %s", (_label, content) => {
    expect(parseEmployeeImportSource({ content, sourceFormat: "csv" })).toEqual(
      {
        success: false,
        reason: "malformed_quote",
        message: "Employee import source contains malformed quotes.",
      },
    );
  });

  it.each([
    [
      "missing required header",
      "phone,initialPassword",
      "missing_required_header",
    ],
    ["duplicate header", "phone,name,name", "duplicate_header"],
    ["unknown header", "phone,name,organizationPublicId", "unknown_header"],
    ["authorization header", "phone,name,edition", "unknown_header"],
  ])("rejects %s", (_label, header, reason) => {
    const result = parseEmployeeImportSource({
      content: `${header}\n13900000001,Employee,Value`,
      sourceFormat: "csv",
    });

    expect(result).toMatchObject({ success: false, reason });
  });

  it("rejects empty source, empty data and ragged rows with stable reasons", () => {
    expect(
      parseEmployeeImportSource({ content: "", sourceFormat: "csv" }),
    ).toMatchObject({ success: false, reason: "empty_source" });
    expect(
      parseEmployeeImportSource({
        content: "phone,name\r\n\r\n",
        sourceFormat: "csv",
      }),
    ).toMatchObject({ success: false, reason: "empty_data" });
    expect(
      parseEmployeeImportSource({
        content: "phone,name\n13900000001",
        sourceFormat: "csv",
      }),
    ).toMatchObject({ success: false, reason: "invalid_column_count" });
  });

  it("accepts 500 logical data rows and rejects row 501", () => {
    const rows = Array.from(
      { length: 501 },
      (_, index) => `139${String(index).padStart(8, "0")},Employee ${index}`,
    );

    expect(
      parseEmployeeImportSource({
        content: `phone,name\n${rows.slice(0, 500).join("\n")}`,
        sourceFormat: "csv",
      }),
    ).toMatchObject({ success: true, rows: { length: 500 } });
    expect(
      parseEmployeeImportSource({
        content: `phone,name\n${rows.join("\n")}`,
        sourceFormat: "csv",
      }),
    ).toEqual({
      success: false,
      reason: "row_limit_exceeded",
      message: "Employee import source exceeds 500 data rows.",
    });
  });

  it("stops at row 501 before parsing later malformed content", () => {
    const content = [
      "phone,name",
      ...Array.from(
        { length: 501 },
        (_, index) => `1390000${String(index).padStart(4, "0")},Employee`,
      ),
      '13999999999,"unterminated',
    ].join("\n");

    expect(parseEmployeeImportSource({ content, sourceFormat: "csv" })).toEqual(
      expect.objectContaining({ success: false, reason: "row_limit_exceeded" }),
    );
  });
});
