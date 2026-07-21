import { paperAttachmentUsageValues } from "../models/paper";
import type { NormalizedPagination } from "./pagination";
import { normalizePagination } from "./pagination";

export type NormalizedCreatePaperAssetInput = {
  commandPublicId: string;
  paperPublicId: string;
  paperAttachmentUsage: (typeof paperAttachmentUsageValues)[number];
  fileName: string;
  objectKey: string;
  contentType: string;
  fileSizeByte: number;
  fileHash: string;
};

export type NormalizedPaperAssetListInput = NormalizedPagination & {
  paperPublicId: string | null;
  paperAttachmentUsage: (typeof paperAttachmentUsageValues)[number] | null;
};

type ValidationResult<TValue> =
  | {
      success: true;
      value: TValue;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PAPER_ASSET_INPUT_MESSAGE = "Invalid paper_asset input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function normalizeQueryInteger(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function isPaperAttachmentUsage(
  value: unknown,
): value is (typeof paperAttachmentUsageValues)[number] {
  return (
    typeof value === "string" &&
    paperAttachmentUsageValues.includes(
      value as (typeof paperAttachmentUsageValues)[number],
    )
  );
}

export function normalizeCreatePaperAssetInput(
  input: unknown,
): ValidationResult<NormalizedCreatePaperAssetInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_ASSET_INPUT_MESSAGE,
    };
  }

  const paperPublicId = normalizeRequiredText(input.paperPublicId);
  const normalizedCommandPublicId = normalizeRequiredText(
    input.commandPublicId,
  );
  const commandPublicId =
    normalizedCommandPublicId !== null &&
    normalizedCommandPublicId.length <= 200
      ? normalizedCommandPublicId
      : null;
  const fileName = normalizeRequiredText(input.fileName);
  const objectKey = normalizeRequiredText(input.objectKey);
  const contentType = normalizeRequiredText(input.contentType);
  const fileSizeByte = normalizePositiveInteger(input.fileSizeByte);
  const fileHash = normalizeRequiredText(input.fileHash);

  if (
    commandPublicId === null ||
    paperPublicId === null ||
    !isPaperAttachmentUsage(input.paperAttachmentUsage) ||
    fileName === null ||
    objectKey === null ||
    contentType === null ||
    fileSizeByte === null ||
    fileHash === null
  ) {
    return {
      success: false,
      message: INVALID_PAPER_ASSET_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      commandPublicId,
      paperPublicId,
      paperAttachmentUsage: input.paperAttachmentUsage,
      fileName,
      objectKey,
      contentType,
      fileSizeByte,
      fileHash,
    },
  };
}

export function normalizePaperAssetListInput(
  input: Record<string, unknown> = {},
): NormalizedPaperAssetListInput {
  const pagination = normalizePagination({
    page: normalizeQueryInteger(input.page),
    pageSize: normalizeQueryInteger(input.pageSize),
    sortBy: typeof input.sortBy === "string" ? input.sortBy : undefined,
    sortOrder:
      typeof input.sortOrder === "string" ? input.sortOrder : undefined,
  });

  return {
    ...pagination,
    paperPublicId:
      typeof input.paperPublicId === "string" &&
      input.paperPublicId.trim().length > 0
        ? input.paperPublicId.trim()
        : null,
    paperAttachmentUsage: isPaperAttachmentUsage(input.paperAttachmentUsage)
      ? input.paperAttachmentUsage
      : null,
  };
}
