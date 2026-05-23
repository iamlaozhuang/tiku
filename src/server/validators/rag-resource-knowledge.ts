import { professionValues, type Profession } from "../models/auth";

export type KnowledgeNodeMutationInput = {
  parentKnowledgeNodePublicId: string | null;
  profession: Profession;
  levelList: number[];
  name: string;
  sortOrder: number;
};

export type KnowledgeNodeUpdateInput = Partial<KnowledgeNodeMutationInput>;

export function parseKnowledgeNodeMutationInput(
  value: unknown,
): KnowledgeNodeMutationInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const parentKnowledgeNodePublicId = value.parentKnowledgeNodePublicId;
  const profession = value.profession;
  const levelList = value.levelList;
  const name = value.name;
  const sortOrder = value.sortOrder;

  if (
    !isNullablePublicId(parentKnowledgeNodePublicId) ||
    !isProfession(profession) ||
    !isLevelList(levelList) ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof sortOrder !== "number" ||
    !Number.isInteger(sortOrder)
  ) {
    return null;
  }

  return {
    parentKnowledgeNodePublicId,
    profession,
    levelList,
    name: name.trim(),
    sortOrder,
  };
}

export function parseKnowledgeNodeUpdateInput(
  value: unknown,
): KnowledgeNodeUpdateInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const updateInput: KnowledgeNodeUpdateInput = {};

  if ("parentKnowledgeNodePublicId" in value) {
    if (!isNullablePublicId(value.parentKnowledgeNodePublicId)) {
      return null;
    }

    updateInput.parentKnowledgeNodePublicId = value.parentKnowledgeNodePublicId;
  }

  if ("profession" in value) {
    if (!isProfession(value.profession)) {
      return null;
    }

    updateInput.profession = value.profession;
  }

  if ("levelList" in value) {
    if (!isLevelList(value.levelList)) {
      return null;
    }

    updateInput.levelList = value.levelList;
  }

  if ("name" in value) {
    if (typeof value.name !== "string" || value.name.trim().length === 0) {
      return null;
    }

    updateInput.name = value.name.trim();
  }

  if ("sortOrder" in value) {
    if (
      typeof value.sortOrder !== "number" ||
      !Number.isInteger(value.sortOrder)
    ) {
      return null;
    }

    updateInput.sortOrder = value.sortOrder;
  }

  return updateInput;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullablePublicId(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.length > 0);
}

function isProfession(value: unknown): value is Profession {
  return (
    typeof value === "string" && professionValues.includes(value as Profession)
  );
}

function isLevelList(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((level) => Number.isInteger(level) && level > 0)
  );
}
