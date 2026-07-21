import {
  paperGenerationMethodValues,
  paperStatusValues,
  paperTypeValues,
  professionValues,
  subjectValues,
} from "../models/paper";
import type { NormalizedPagination } from "./pagination";
import { normalizePagination } from "./pagination";

export type NormalizedPaperSectionInput = {
  title: string;
  description: string | null;
  sortOrder: number;
};

export type NormalizedQuestionGroupInput = {
  publicId: string | null;
  title: string;
  materialPublicId: string;
  sortOrder: number;
};

export type NormalizedPaperScoringPointInput = {
  description: string;
  score: string;
  sortOrder: number;
};

type NormalizedPaperMetadataInput = {
  name: string;
  profession: (typeof professionValues)[number];
  level: number;
  subject: (typeof subjectValues)[number];
  paperType: (typeof paperTypeValues)[number] | null;
  year: number | null;
  month: number | null;
  sourceDescription: string | null;
  sourceRegion: string | null;
  sourceOrganization: string | null;
  questionBasis: string | null;
  generationMethod: (typeof paperGenerationMethodValues)[number] | null;
  durationMinute: number | null;
  totalScore: string | null;
};

export type NormalizedCreatePaperInput = NormalizedPaperMetadataInput & {
  commandPublicId: string;
};

export type NormalizedUpdatePaperInput = NormalizedPaperMetadataInput & {
  expectedRevision: number;
};

export type NormalizedAddPaperQuestionInput = {
  commandPublicId: string;
  expectedRevision: number;
  questionPublicId: string;
  score: string;
  sortOrder: number;
  paperSection: NormalizedPaperSectionInput;
  questionGroup: NormalizedQuestionGroupInput | null;
};

export type NormalizedUpdatePaperQuestionInput = {
  expectedRevision: number;
  paperSection: NormalizedPaperSectionInput | null;
  score: string;
  sortOrder: number;
  scoringPoints: NormalizedPaperScoringPointInput[];
};

export type NormalizedPaperRevisionInput = {
  expectedRevision: number;
};

export type NormalizedPaperCommandInput = NormalizedPaperRevisionInput & {
  commandPublicId: string;
};

export type NormalizedPaperSectionCommandInput =
  | (NormalizedPaperRevisionInput & {
      action: "create";
      title: string;
      description: string | null;
      sortOrder: number;
    })
  | (NormalizedPaperRevisionInput & {
      action: "update";
      paperSectionPublicId: string;
      title: string;
      description: string | null;
    })
  | (NormalizedPaperRevisionInput & {
      action: "reorder";
      paperSectionPublicIds: string[];
    })
  | (NormalizedPaperRevisionInput & {
      action: "delete";
      paperSectionPublicId: string;
    });

export type NormalizedQuestionGroupCommandInput =
  | (NormalizedPaperRevisionInput & {
      action: "create";
      paperSectionPublicId: string;
      materialPublicId: string;
      title: string;
      sortOrder: number;
    })
  | (NormalizedPaperRevisionInput & {
      action: "update";
      questionGroupPublicId: string;
      title: string;
    })
  | (NormalizedPaperRevisionInput & {
      action: "reorder";
      paperSectionPublicId: string;
      questionGroupPublicIds: string[];
    })
  | (NormalizedPaperRevisionInput & {
      action: "delete";
      questionGroupPublicId: string;
    })
  | (NormalizedPaperRevisionInput & {
      action: "set_question_membership";
      paperQuestionPublicId: string;
      questionGroupPublicId: string | null;
      paperSectionPublicId: string | null;
    });

export type NormalizedPaperListInput = NormalizedPagination & {
  profession: (typeof professionValues)[number] | null;
  level: number | null;
  subject: (typeof subjectValues)[number] | null;
  paperStatus: (typeof paperStatusValues)[number] | null;
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

export type PaperQuestionCountValidationResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export const PAPER_QUESTION_COUNT_LIMIT = 100;

const INVALID_PAPER_INPUT_MESSAGE = "Invalid paper input.";
const DRAFT_PAPER_QUESTION_COUNT_LIMIT_MESSAGE =
  "Draft paper cannot contain more than 100 questions.";
const PUBLISHED_PAPER_QUESTION_COUNT_LIMIT_MESSAGE =
  "Published paper must contain 1 to 100 questions.";

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

function normalizeCommandPublicId(value: unknown): string | null {
  const publicId = normalizeRequiredText(value);

  return publicId !== null && publicId.length <= 200 ? publicId : null;
}

function normalizePublicId(value: unknown): string | null {
  const publicId = normalizeRequiredText(value);

  return publicId !== null && publicId.length <= 200 ? publicId : null;
}

function normalizeUniquePublicIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const publicIds = value.map(normalizePublicId);

  if (
    publicIds.some((publicId) => publicId === null) ||
    new Set(publicIds).size !== publicIds.length
  ) {
    return null;
  }

  return publicIds as string[];
}

function normalizeExpectedRevision(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

export function validateDraftPaperQuestionCount(
  questionCount: number,
): PaperQuestionCountValidationResult {
  if (
    !Number.isInteger(questionCount) ||
    questionCount < 0 ||
    questionCount > PAPER_QUESTION_COUNT_LIMIT
  ) {
    return {
      success: false,
      message: DRAFT_PAPER_QUESTION_COUNT_LIMIT_MESSAGE,
    };
  }

  return { success: true };
}

export function validatePublishedPaperQuestionCount(
  questionCount: number,
): PaperQuestionCountValidationResult {
  if (
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > PAPER_QUESTION_COUNT_LIMIT
  ) {
    return {
      success: false,
      message: PUBLISHED_PAPER_QUESTION_COUNT_LIMIT_MESSAGE,
    };
  }

  return { success: true };
}

function normalizeOptionalText(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
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

function normalizeOptionalPositiveInteger(
  value: unknown,
): number | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  const positiveInteger = normalizePositiveInteger(value);

  return positiveInteger === null ? undefined : positiveInteger;
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

function normalizeScore(value: unknown): string | null {
  const score = typeof value === "number" ? value : Number(value);

  if (
    !Number.isFinite(score) ||
    score < 0 ||
    score * 2 !== Math.round(score * 2)
  ) {
    return null;
  }

  return score.toFixed(1);
}

function normalizeOptionalScore(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeScore(value) ?? undefined;
}

function isProfession(
  value: unknown,
): value is (typeof professionValues)[number] {
  return (
    typeof value === "string" &&
    professionValues.includes(value as (typeof professionValues)[number])
  );
}

function isSubject(value: unknown): value is (typeof subjectValues)[number] {
  return (
    typeof value === "string" &&
    subjectValues.includes(value as (typeof subjectValues)[number])
  );
}

function isPaperType(
  value: unknown,
): value is (typeof paperTypeValues)[number] {
  return (
    typeof value === "string" &&
    paperTypeValues.includes(value as (typeof paperTypeValues)[number])
  );
}

function isPaperStatus(
  value: unknown,
): value is (typeof paperStatusValues)[number] {
  return (
    typeof value === "string" &&
    paperStatusValues.includes(value as (typeof paperStatusValues)[number])
  );
}

function normalizePaperType(
  value: unknown,
): (typeof paperTypeValues)[number] | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return isPaperType(value) ? value : undefined;
}

function normalizePaperGenerationMethod(
  value: unknown,
): (typeof paperGenerationMethodValues)[number] | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" &&
    paperGenerationMethodValues.includes(
      value as (typeof paperGenerationMethodValues)[number],
    )
    ? (value as (typeof paperGenerationMethodValues)[number])
    : undefined;
}

function normalizeMonth(value: unknown): number | null | undefined {
  const month = normalizeOptionalPositiveInteger(value);

  if (month === undefined || month === null) {
    return month;
  }

  return month <= 12 ? month : undefined;
}

function normalizeSourceDescription(
  input: Record<string, unknown>,
): string | null | undefined {
  const hasSourceDescription = input.sourceDescription !== undefined;
  const hasLegacySource = input.source !== undefined;
  const sourceDescription = normalizeOptionalText(input.sourceDescription);
  const legacySource = normalizeOptionalText(input.source);

  if (sourceDescription === undefined || legacySource === undefined) {
    return undefined;
  }

  if (hasSourceDescription && hasLegacySource) {
    return sourceDescription === legacySource ? sourceDescription : undefined;
  }

  return hasSourceDescription ? sourceDescription : legacySource;
}

function normalizeDurationMinute(value: unknown): number | null | undefined {
  const durationMinute = normalizeOptionalPositiveInteger(value);

  if (durationMinute === undefined || durationMinute === null) {
    return durationMinute;
  }

  return durationMinute >= 10 && durationMinute <= 300
    ? durationMinute
    : undefined;
}

function normalizePaperMetadata(
  input: unknown,
): ValidationResult<NormalizedPaperMetadataInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  const name = normalizeRequiredText(input.name);
  const level = normalizePositiveInteger(input.level);
  const paperType = normalizePaperType(input.paperType);
  const year = normalizeOptionalPositiveInteger(input.year);
  const month = normalizeMonth(input.month);
  const sourceDescription = normalizeSourceDescription(input);
  const sourceRegion = normalizeOptionalText(input.sourceRegion);
  const sourceOrganization = normalizeOptionalText(input.sourceOrganization);
  const questionBasis = normalizeOptionalText(input.questionBasis);
  const generationMethod = normalizePaperGenerationMethod(
    input.generationMethod,
  );
  const durationMinute = normalizeDurationMinute(input.durationMinute);
  const totalScore = normalizeOptionalScore(input.totalScore);

  if (
    name === null ||
    !isProfession(input.profession) ||
    level === null ||
    !isSubject(input.subject) ||
    paperType === undefined ||
    year === undefined ||
    month === undefined ||
    sourceDescription === undefined ||
    sourceRegion === undefined ||
    sourceOrganization === undefined ||
    questionBasis === undefined ||
    generationMethod === undefined ||
    durationMinute === undefined ||
    totalScore === undefined
  ) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      name,
      profession: input.profession,
      level,
      subject: input.subject,
      paperType,
      year,
      month,
      sourceDescription,
      sourceRegion,
      sourceOrganization,
      questionBasis,
      generationMethod,
      durationMinute,
      totalScore,
    },
  };
}

function normalizePaperSectionInput(
  value: unknown,
): NormalizedPaperSectionInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = normalizeRequiredText(value.title);
  const description = normalizeOptionalText(value.description);
  const sortOrder = normalizePositiveInteger(value.sortOrder);

  if (title === null || description === undefined || sortOrder === null) {
    return null;
  }

  return {
    title,
    description,
    sortOrder,
  };
}

function normalizeQuestionGroupInput(
  value: unknown,
): NormalizedQuestionGroupInput | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const title = normalizeRequiredText(value.title);
  const publicId =
    value.publicId === null || value.publicId === undefined
      ? null
      : normalizeRequiredText(value.publicId);
  const materialPublicId = normalizeRequiredText(value.materialPublicId);
  const sortOrder = normalizePositiveInteger(value.sortOrder);

  if (
    title === null ||
    (publicId === null &&
      value.publicId !== null &&
      value.publicId !== undefined) ||
    materialPublicId === null ||
    sortOrder === null
  ) {
    return undefined;
  }

  return {
    publicId,
    title,
    materialPublicId,
    sortOrder,
  };
}

function normalizeScoringPoints(
  value: unknown,
): NormalizedPaperScoringPointInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const scoringPoints = value.map((scoringPoint) => {
    if (!isRecord(scoringPoint)) {
      return null;
    }

    const description = normalizeRequiredText(scoringPoint.description);
    const score = normalizeScore(scoringPoint.score);
    const sortOrder = normalizePositiveInteger(scoringPoint.sortOrder);

    if (description === null || score === null || sortOrder === null) {
      return null;
    }

    return {
      description,
      score,
      sortOrder,
    };
  });

  return scoringPoints.some((scoringPoint) => scoringPoint === null)
    ? null
    : (scoringPoints as NormalizedPaperScoringPointInput[]);
}

export function normalizeCreatePaperInput(
  input: unknown,
): ValidationResult<NormalizedCreatePaperInput> {
  const metadata = normalizePaperMetadata(input);
  const commandPublicId = isRecord(input)
    ? normalizeCommandPublicId(input.commandPublicId)
    : null;

  return !metadata.success || commandPublicId === null
    ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
    : {
        success: true,
        value: { ...metadata.value, commandPublicId },
      };
}

export function normalizeUpdatePaperInput(
  input: unknown,
): ValidationResult<NormalizedUpdatePaperInput> {
  const metadata = normalizePaperMetadata(input);
  const expectedRevision = isRecord(input)
    ? normalizeExpectedRevision(input.expectedRevision)
    : null;

  return !metadata.success || expectedRevision === null
    ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
    : {
        success: true,
        value: { ...metadata.value, expectedRevision },
      };
}

export function normalizeAddPaperQuestionInput(
  input: unknown,
): ValidationResult<NormalizedAddPaperQuestionInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  const questionPublicId = normalizeRequiredText(input.questionPublicId);
  const commandPublicId = normalizeCommandPublicId(input.commandPublicId);
  const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
  const score = normalizeScore(input.score);
  const sortOrder = normalizePositiveInteger(input.sortOrder);
  const paperSection = normalizePaperSectionInput(input.paperSection);
  const questionGroup = normalizeQuestionGroupInput(input.questionGroup);

  if (
    commandPublicId === null ||
    expectedRevision === null ||
    questionPublicId === null ||
    score === null ||
    sortOrder === null ||
    paperSection === null ||
    questionGroup === undefined
  ) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      commandPublicId,
      expectedRevision,
      questionPublicId,
      score,
      sortOrder,
      paperSection,
      questionGroup,
    },
  };
}

export function normalizeUpdatePaperQuestionInput(
  input: unknown,
): ValidationResult<NormalizedUpdatePaperQuestionInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  const score = normalizeScore(input.score);
  const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
  const sortOrder = normalizePositiveInteger(input.sortOrder);
  const scoringPoints = normalizeScoringPoints(input.scoringPoints);
  const paperSection =
    input.paperSection === undefined
      ? null
      : normalizePaperSectionInput(input.paperSection);

  if (
    expectedRevision === null ||
    score === null ||
    sortOrder === null ||
    scoringPoints === null ||
    (input.paperSection !== undefined && paperSection === null)
  ) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      expectedRevision,
      score,
      sortOrder,
      scoringPoints,
      paperSection,
    },
  };
}

export function normalizePaperRevisionInput(
  input: unknown,
): ValidationResult<NormalizedPaperRevisionInput> {
  const expectedRevision = isRecord(input)
    ? normalizeExpectedRevision(input.expectedRevision)
    : null;

  return expectedRevision === null
    ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
    : { success: true, value: { expectedRevision } };
}

export function normalizePaperCommandInput(
  input: unknown,
): ValidationResult<NormalizedPaperCommandInput> {
  const revisionInput = normalizePaperRevisionInput(input);
  const commandPublicId = isRecord(input)
    ? normalizeCommandPublicId(input.commandPublicId)
    : null;

  return !revisionInput.success || commandPublicId === null
    ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
    : {
        success: true,
        value: { ...revisionInput.value, commandPublicId },
      };
}

export function normalizePaperSectionCommandInput(
  input: unknown,
): ValidationResult<NormalizedPaperSectionCommandInput> {
  if (!isRecord(input)) {
    return { success: false, message: INVALID_PAPER_INPUT_MESSAGE };
  }

  const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
  if (expectedRevision === null) {
    return { success: false, message: INVALID_PAPER_INPUT_MESSAGE };
  }

  if (input.action === "create") {
    const section = normalizePaperSectionInput(input);
    return section === null
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: { action: "create", expectedRevision, ...section },
        };
  }

  if (input.action === "update") {
    const paperSectionPublicId = normalizePublicId(input.paperSectionPublicId);
    const title = normalizeRequiredText(input.title);
    const description = normalizeOptionalText(input.description);
    return paperSectionPublicId === null ||
      title === null ||
      description === undefined
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: {
            action: "update",
            expectedRevision,
            paperSectionPublicId,
            title,
            description,
          },
        };
  }

  if (input.action === "reorder") {
    const paperSectionPublicIds = normalizeUniquePublicIds(
      input.paperSectionPublicIds,
    );
    return paperSectionPublicIds === null
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: { action: "reorder", expectedRevision, paperSectionPublicIds },
        };
  }

  if (input.action === "delete") {
    const paperSectionPublicId = normalizePublicId(input.paperSectionPublicId);
    return paperSectionPublicId === null
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: { action: "delete", expectedRevision, paperSectionPublicId },
        };
  }

  return { success: false, message: INVALID_PAPER_INPUT_MESSAGE };
}

export function normalizeQuestionGroupCommandInput(
  input: unknown,
): ValidationResult<NormalizedQuestionGroupCommandInput> {
  if (!isRecord(input)) {
    return { success: false, message: INVALID_PAPER_INPUT_MESSAGE };
  }

  const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
  if (expectedRevision === null) {
    return { success: false, message: INVALID_PAPER_INPUT_MESSAGE };
  }

  if (input.action === "create") {
    const paperSectionPublicId = normalizePublicId(input.paperSectionPublicId);
    const materialPublicId = normalizePublicId(input.materialPublicId);
    const title = normalizeRequiredText(input.title);
    const sortOrder = normalizePositiveInteger(input.sortOrder);
    return paperSectionPublicId === null ||
      materialPublicId === null ||
      title === null ||
      sortOrder === null
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: {
            action: "create",
            expectedRevision,
            paperSectionPublicId,
            materialPublicId,
            title,
            sortOrder,
          },
        };
  }

  if (input.action === "update" || input.action === "delete") {
    const questionGroupPublicId = normalizePublicId(
      input.questionGroupPublicId,
    );
    if (questionGroupPublicId === null) {
      return { success: false, message: INVALID_PAPER_INPUT_MESSAGE };
    }
    if (input.action === "delete") {
      return {
        success: true,
        value: { action: "delete", expectedRevision, questionGroupPublicId },
      };
    }
    const title = normalizeRequiredText(input.title);
    return title === null
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: {
            action: "update",
            expectedRevision,
            questionGroupPublicId,
            title,
          },
        };
  }

  if (input.action === "reorder") {
    const paperSectionPublicId = normalizePublicId(input.paperSectionPublicId);
    const questionGroupPublicIds = normalizeUniquePublicIds(
      input.questionGroupPublicIds,
    );
    return paperSectionPublicId === null || questionGroupPublicIds === null
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: {
            action: "reorder",
            expectedRevision,
            paperSectionPublicId,
            questionGroupPublicIds,
          },
        };
  }

  if (input.action === "set_question_membership") {
    const paperQuestionPublicId = normalizePublicId(
      input.paperQuestionPublicId,
    );
    const questionGroupPublicId =
      input.questionGroupPublicId === null
        ? null
        : normalizePublicId(input.questionGroupPublicId);
    const paperSectionPublicId =
      input.paperSectionPublicId === null ||
      input.paperSectionPublicId === undefined
        ? null
        : normalizePublicId(input.paperSectionPublicId);
    const groupSelectionValid =
      questionGroupPublicId !== null && paperSectionPublicId === null;
    const standaloneSelectionValid =
      input.questionGroupPublicId === null && paperSectionPublicId !== null;
    return paperQuestionPublicId === null ||
      (!groupSelectionValid && !standaloneSelectionValid)
      ? { success: false, message: INVALID_PAPER_INPUT_MESSAGE }
      : {
          success: true,
          value: {
            action: "set_question_membership",
            expectedRevision,
            paperQuestionPublicId,
            questionGroupPublicId,
            paperSectionPublicId,
          },
        };
  }

  return { success: false, message: INVALID_PAPER_INPUT_MESSAGE };
}

export function normalizePaperListInput(
  input: Record<string, unknown> = {},
): NormalizedPaperListInput {
  const pagination = normalizePagination({
    page: normalizeQueryInteger(input.page),
    pageSize: normalizeQueryInteger(input.pageSize),
    sortBy: typeof input.sortBy === "string" ? input.sortBy : undefined,
    sortOrder:
      typeof input.sortOrder === "string" ? input.sortOrder : undefined,
  });

  return {
    ...pagination,
    profession: isProfession(input.profession) ? input.profession : null,
    level: normalizeQueryInteger(input.level) ?? null,
    subject: isSubject(input.subject) ? input.subject : null,
    paperStatus: isPaperStatus(input.paperStatus) ? input.paperStatus : null,
  };
}
