import { professionValues, type Profession } from "../models/auth";

export type KnowledgeNodeMutationInput = {
  parentKnowledgeNodePublicId: string | null;
  profession: Profession;
  levelList: number[];
  name: string;
  sortOrder: number;
};

export type KnowledgeNodeUpdateInput = Partial<KnowledgeNodeMutationInput> & {
  expectedUpdatedAt: string;
};

type ScopedKnowledgeNode = {
  id: number;
  knowledgeBaseId: number;
  profession: Profession;
};

type ResourceKnowledgeNodeScope = ScopedKnowledgeNode & {
  publicId: string;
  knStatus: "active" | "disabled";
};

export type KnowledgeNodeParentScopeValidationResult =
  | { status: "valid" }
  | {
      status: "invalid";
      reason: "self_parent" | "knowledge_base_mismatch" | "profession_mismatch";
    };

export type ResourceKnowledgeNodeScopeValidationResult =
  | { status: "valid"; knowledgeNodeIds: number[] }
  | {
      status: "invalid";
      reason:
        | "duplicate_knowledge_node_public_id"
        | "knowledge_node_set_mismatch"
        | "knowledge_base_mismatch"
        | "profession_mismatch"
        | "knowledge_node_disabled";
    };

export function validateKnowledgeNodeParentScope(input: {
  current: ScopedKnowledgeNode;
  parent: ScopedKnowledgeNode | null;
}): KnowledgeNodeParentScopeValidationResult {
  if (input.parent === null) {
    return { status: "valid" };
  }

  if (input.parent.id === input.current.id) {
    return { status: "invalid", reason: "self_parent" };
  }

  if (input.parent.knowledgeBaseId !== input.current.knowledgeBaseId) {
    return { status: "invalid", reason: "knowledge_base_mismatch" };
  }

  if (input.parent.profession !== input.current.profession) {
    return { status: "invalid", reason: "profession_mismatch" };
  }

  return { status: "valid" };
}

export function validateResourceKnowledgeNodeScope(input: {
  resource: Pick<ScopedKnowledgeNode, "knowledgeBaseId" | "profession">;
  requestedKnowledgeNodePublicIds: string[];
  knowledgeNodes: ResourceKnowledgeNodeScope[];
}): ResourceKnowledgeNodeScopeValidationResult {
  const uniqueRequestedPublicIds = new Set(
    input.requestedKnowledgeNodePublicIds,
  );

  if (
    uniqueRequestedPublicIds.size !==
    input.requestedKnowledgeNodePublicIds.length
  ) {
    return {
      status: "invalid",
      reason: "duplicate_knowledge_node_public_id",
    };
  }

  const knowledgeNodeByPublicId = new Map(
    input.knowledgeNodes.map((knowledgeNode) => [
      knowledgeNode.publicId,
      knowledgeNode,
    ]),
  );

  if (
    knowledgeNodeByPublicId.size !== uniqueRequestedPublicIds.size ||
    [...uniqueRequestedPublicIds].some(
      (publicId) => !knowledgeNodeByPublicId.has(publicId),
    )
  ) {
    return { status: "invalid", reason: "knowledge_node_set_mismatch" };
  }

  const knowledgeNodeIds: number[] = [];

  for (const publicId of input.requestedKnowledgeNodePublicIds) {
    const knowledgeNode = knowledgeNodeByPublicId.get(publicId);

    if (knowledgeNode === undefined) {
      return { status: "invalid", reason: "knowledge_node_set_mismatch" };
    }

    if (knowledgeNode.knowledgeBaseId !== input.resource.knowledgeBaseId) {
      return { status: "invalid", reason: "knowledge_base_mismatch" };
    }

    if (knowledgeNode.profession !== input.resource.profession) {
      return { status: "invalid", reason: "profession_mismatch" };
    }

    if (knowledgeNode.knStatus !== "active") {
      return { status: "invalid", reason: "knowledge_node_disabled" };
    }

    knowledgeNodeIds.push(knowledgeNode.id);
  }

  return { status: "valid", knowledgeNodeIds };
}

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

  if (!isCanonicalIsoTimestamp(value.expectedUpdatedAt)) {
    return null;
  }

  const updateInput: KnowledgeNodeUpdateInput = {
    expectedUpdatedAt: value.expectedUpdatedAt,
  };

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

function isCanonicalIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
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
