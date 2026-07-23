import { MAX_MATERIAL_RICH_TEXT_LENGTH } from "../../lib/content-integrity";
import { listVersionedPublishedPaperSnapshotQuestionEntries } from "../../lib/published-paper-snapshot";
import { PAPER_QUESTION_COUNT_LIMIT } from "../validators/paper-draft";

export const AI_SCORING_QUESTION_CONTEXT_SCHEMA_VERSION = 1 as const;

const maximumPublicIdLength = 200;
const maximumTitleLength = 2_000;
const forbiddenTextControlPattern =
  /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;
const forbiddenRichTextControlPattern =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;

type Profession = "monopoly" | "marketing" | "logistics";
type Subject = "theory" | "skill";

export type AiScoringQuestionContextScope = {
  profession: Profession;
  level: number;
  subject: Subject;
};

export type AiScoringQuestionContext = {
  schemaVersion: typeof AI_SCORING_QUESTION_CONTEXT_SCHEMA_VERSION;
  paperQuestionPublicId: string;
  questionPublicId: string;
  paperSection: {
    publicId: string;
    title: string;
    sortOrder: number;
  };
  questionGroup: {
    publicId: string;
    title: string;
    sortOrder: number;
    paperQuestionPublicIds: string[];
    material: {
      materialPublicId: string;
      title: string;
      contentRichText: string;
      profession: Profession;
      level: number;
      subject: Subject;
    };
  } | null;
};

export type AiScoringQuestionContextExpectations =
  AiScoringQuestionContextScope & {
    paperQuestionPublicId: string;
    questionPublicId: string;
  };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value);

  return (
    actualKeys.length === keys.length &&
    actualKeys.every((key) => keys.includes(key))
  );
}

function hasUnpairedSurrogate(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff) {
      const nextCode = value.charCodeAt(index + 1);
      if (
        !Number.isFinite(nextCode) ||
        nextCode < 0xdc00 ||
        nextCode > 0xdfff
      ) {
        return true;
      }
      index += 1;
      continue;
    }

    if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function readBoundedText(
  value: unknown,
  maximumLength: number,
  allowRichTextWhitespace: boolean,
): string | null {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximumLength ||
    value.trim().length === 0 ||
    hasUnpairedSurrogate(value) ||
    (allowRichTextWhitespace
      ? forbiddenRichTextControlPattern.test(value)
      : forbiddenTextControlPattern.test(value))
  ) {
    return null;
  }

  if (!allowRichTextWhitespace && value !== value.trim()) {
    return null;
  }

  return value;
}

function readPublicId(value: unknown): string | null {
  return readBoundedText(value, maximumPublicIdLength, false);
}

function readTitle(value: unknown): string | null {
  return readBoundedText(value, maximumTitleLength, false);
}

function readRichText(value: unknown): string | null {
  return readBoundedText(value, MAX_MATERIAL_RICH_TEXT_LENGTH, true);
}

function readPositiveSafeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

function readProfession(value: unknown): Profession | null {
  return value === "monopoly" || value === "marketing" || value === "logistics"
    ? value
    : null;
}

function readSubject(value: unknown): Subject | null {
  return value === "theory" || value === "skill" ? value : null;
}

function readPaperSection(
  value: unknown,
): AiScoringQuestionContext["paperSection"] | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["publicId", "title", "sortOrder"])
  ) {
    return null;
  }

  const publicId = readPublicId(value.publicId);
  const title = readTitle(value.title);
  const sortOrder = readPositiveSafeInteger(value.sortOrder);

  return publicId === null || title === null || sortOrder === null
    ? null
    : { publicId, title, sortOrder };
}

function readMaterial(
  value: unknown,
): NonNullable<AiScoringQuestionContext["questionGroup"]>["material"] | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "materialPublicId",
      "title",
      "contentRichText",
      "profession",
      "level",
      "subject",
    ])
  ) {
    return null;
  }

  const materialPublicId = readPublicId(value.materialPublicId);
  const title = readTitle(value.title);
  const contentRichText = readRichText(value.contentRichText);
  const profession = readProfession(value.profession);
  const level = readPositiveSafeInteger(value.level);
  const subject = readSubject(value.subject);

  return materialPublicId === null ||
    title === null ||
    contentRichText === null ||
    profession === null ||
    level === null ||
    subject === null
    ? null
    : {
        materialPublicId,
        title,
        contentRichText,
        profession,
        level,
        subject,
      };
}

function readPaperQuestionPublicIds(value: unknown): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > PAPER_QUESTION_COUNT_LIMIT
  ) {
    return null;
  }

  const publicIds: string[] = [];
  const exactPublicIds = new Set<string>();
  const foldedPublicIds = new Set<string>();

  for (let index = 0; index < value.length; index += 1) {
    if (!(index in value)) {
      return null;
    }

    const publicId = readPublicId(value[index]);
    const foldedPublicId = publicId?.toLowerCase() ?? null;

    if (
      publicId === null ||
      foldedPublicId === null ||
      exactPublicIds.has(publicId) ||
      foldedPublicIds.has(foldedPublicId)
    ) {
      return null;
    }

    publicIds.push(publicId);
    exactPublicIds.add(publicId);
    foldedPublicIds.add(foldedPublicId);
  }

  return publicIds;
}

function readQuestionGroup(
  value: unknown,
): AiScoringQuestionContext["questionGroup"] | null | undefined {
  if (value === null) {
    return null;
  }

  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "publicId",
      "title",
      "sortOrder",
      "paperQuestionPublicIds",
      "material",
    ])
  ) {
    return undefined;
  }

  const publicId = readPublicId(value.publicId);
  const title = readTitle(value.title);
  const sortOrder = readPositiveSafeInteger(value.sortOrder);
  const paperQuestionPublicIds = readPaperQuestionPublicIds(
    value.paperQuestionPublicIds,
  );
  const material = readMaterial(value.material);

  return publicId === null ||
    title === null ||
    sortOrder === null ||
    paperQuestionPublicIds === null ||
    material === null
    ? undefined
    : {
        publicId,
        title,
        sortOrder,
        paperQuestionPublicIds,
        material,
      };
}

export function normalizeAiScoringQuestionContext(
  value: unknown,
  expectations?: AiScoringQuestionContextExpectations,
): AiScoringQuestionContext | null {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "schemaVersion",
      "paperQuestionPublicId",
      "questionPublicId",
      "paperSection",
      "questionGroup",
    ]) ||
    value.schemaVersion !== AI_SCORING_QUESTION_CONTEXT_SCHEMA_VERSION
  ) {
    return null;
  }

  const paperQuestionPublicId = readPublicId(value.paperQuestionPublicId);
  const questionPublicId = readPublicId(value.questionPublicId);
  const paperSection = readPaperSection(value.paperSection);
  const questionGroup = readQuestionGroup(value.questionGroup);

  if (
    paperQuestionPublicId === null ||
    questionPublicId === null ||
    paperSection === null ||
    questionGroup === undefined ||
    (questionGroup !== null &&
      questionGroup.paperQuestionPublicIds.filter(
        (publicId) => publicId === paperQuestionPublicId,
      ).length !== 1)
  ) {
    return null;
  }

  if (
    expectations !== undefined &&
    (paperQuestionPublicId !== expectations.paperQuestionPublicId ||
      questionPublicId !== expectations.questionPublicId ||
      (questionGroup !== null &&
        (questionGroup.material.profession !== expectations.profession ||
          questionGroup.material.level !== expectations.level ||
          questionGroup.material.subject !== expectations.subject)))
  ) {
    return null;
  }

  return {
    schemaVersion: AI_SCORING_QUESTION_CONTEXT_SCHEMA_VERSION,
    paperQuestionPublicId,
    questionPublicId,
    paperSection: { ...paperSection },
    questionGroup:
      questionGroup === null
        ? null
        : {
            publicId: questionGroup.publicId,
            title: questionGroup.title,
            sortOrder: questionGroup.sortOrder,
            paperQuestionPublicIds: [...questionGroup.paperQuestionPublicIds],
            material: { ...questionGroup.material },
          },
  };
}

export function buildAiScoringQuestionContext(
  input: {
    paperSnapshot: Record<string, unknown>;
    paperQuestionPublicId: string;
  } & AiScoringQuestionContextScope,
): AiScoringQuestionContext | null {
  const entries = listVersionedPublishedPaperSnapshotQuestionEntries(
    input.paperSnapshot,
  );

  if (entries === null) {
    return null;
  }

  const entry = entries.find(
    ({ paperQuestion }) =>
      paperQuestion.paperQuestionPublicId === input.paperQuestionPublicId,
  );

  if (entry === undefined) {
    return null;
  }

  const paperQuestionPublicId = readPublicId(
    entry.paperQuestion.paperQuestionPublicId,
  );
  const questionPublicId = readPublicId(entry.paperQuestion.questionPublicId);
  if (paperQuestionPublicId === null || questionPublicId === null) {
    return null;
  }

  const paperSection = {
    publicId: entry.paperSection.publicId,
    title: entry.paperSection.title,
    sortOrder: entry.paperSection.sortOrder,
  };
  let questionGroup: Record<string, unknown> | null = null;

  if (entry.questionGroup !== null) {
    const groupPaperQuestions = entry.questionGroup.paperQuestions;
    if (!Array.isArray(groupPaperQuestions)) {
      return null;
    }

    questionGroup = {
      publicId: entry.questionGroup.publicId,
      title: entry.questionGroup.title,
      sortOrder: entry.questionGroup.sortOrder,
      paperQuestionPublicIds: groupPaperQuestions.map((paperQuestion) =>
        isRecord(paperQuestion) ? paperQuestion.paperQuestionPublicId : null,
      ),
      material: {
        materialPublicId: isRecord(entry.questionGroup.materialSnapshot)
          ? entry.questionGroup.materialSnapshot.materialPublicId
          : null,
        title: isRecord(entry.questionGroup.materialSnapshot)
          ? entry.questionGroup.materialSnapshot.title
          : null,
        contentRichText: isRecord(entry.questionGroup.materialSnapshot)
          ? entry.questionGroup.materialSnapshot.contentRichText
          : null,
        profession: isRecord(entry.questionGroup.materialSnapshot)
          ? entry.questionGroup.materialSnapshot.profession
          : null,
        level: isRecord(entry.questionGroup.materialSnapshot)
          ? entry.questionGroup.materialSnapshot.level
          : null,
        subject: isRecord(entry.questionGroup.materialSnapshot)
          ? entry.questionGroup.materialSnapshot.subject
          : null,
      },
    };
  }

  return normalizeAiScoringQuestionContext(
    {
      schemaVersion: AI_SCORING_QUESTION_CONTEXT_SCHEMA_VERSION,
      paperQuestionPublicId,
      questionPublicId,
      paperSection,
      questionGroup,
    },
    {
      paperQuestionPublicId: input.paperQuestionPublicId,
      questionPublicId,
      profession: input.profession,
      level: input.level,
      subject: input.subject,
    },
  );
}
