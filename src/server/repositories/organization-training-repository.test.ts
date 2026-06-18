import { describe, expect, it, vi } from "vitest";

import type {
  OrganizationTrainingPublishedVersionWrite,
  OrganizationTrainingVersionTakedownWrite,
} from "../services/organization-training-service";
import {
  createOrganizationTrainingRepository,
  type OrganizationTrainingTrustedPersistenceLineage,
  type OrganizationTrainingVersionTakedownInput,
  type OrganizationTrainingVersionGateway,
  type OrganizationTrainingVersionInsertInput,
  type OrganizationTrainingVersionRow,
  type OrganizationTrainingVisibleOrganizationScopeSource,
} from "./organization-training-repository";

function createVersionWrite(
  overrides: Partial<OrganizationTrainingPublishedVersionWrite> = {},
): OrganizationTrainingPublishedVersionWrite {
  return {
    contentType: "organization_training_version",
    ownerType: "organization",
    ownerPublicId: "organization_public_123",
    quotaOwnerType: "organization",
    quotaOwnerPublicId: "organization_public_123",
    authorizationSource: "org_auth",
    authorizationPublicId: "org_auth_public_123",
    draftPublicId: "training_draft_public_123",
    organizationPublicId: "organization_public_123",
    publishScopeSnapshot: {
      organizationPublicIds: [
        "organization_public_123",
        "organization_branch_public_456",
      ],
      capturedAt: "2026-06-15T19:20:13.000Z",
    },
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: "Safety training",
    description: null,
    questionCount: 2,
    totalScore: 5,
    questionTypeSummary: {
      singleChoice: 1,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 1,
    },
    status: "published",
    publishedAt: "2026-06-15T19:20:13.000Z",
    takenDownAt: null,
    takedownReason: null,
    ...overrides,
  };
}

function createTakedownWrite(
  overrides: Partial<OrganizationTrainingVersionTakedownWrite> = {},
): OrganizationTrainingVersionTakedownWrite {
  return {
    versionPublicId: "training_version_public_123",
    organizationPublicId: "organization_public_123",
    status: "taken_down",
    takenDownAt: "2026-06-16T08:00:00.000Z",
    takedownReason: "manual owner takedown",
    accessPolicy: {
      allowNewAnswers: false,
      allowDraftSaves: false,
      allowQuestionDetailReentry: false,
      employeeHistoryVisibility: "own_summary_only",
      preserveHistory: true,
    },
    ...overrides,
  };
}

function createGateway(
  options: {
    latestVersionNumber?: number | null;
    trustedPersistenceLineage?: OrganizationTrainingTrustedPersistenceLineage | null;
    visibleOrganizationScopeSource?: OrganizationTrainingVisibleOrganizationScopeSource | null;
    versionOrganizationPublicId?: string | null;
    takedownUpdateResult?: "row" | "null";
  } = {},
) {
  let insertInputs: OrganizationTrainingVersionInsertInput[] = [];
  let takedownInputs: OrganizationTrainingVersionTakedownInput[] = [];
  const findLatestVersionNumberByDraftPublicId = vi.fn(
    async () => options.latestVersionNumber ?? null,
  );
  const findTrustedPersistenceLineageByPublicIds = vi.fn(
    async () => options.trustedPersistenceLineage ?? null,
  );
  const findVisibleOrganizationScopeSourceByAdminPublicId = vi.fn(
    async () => options.visibleOrganizationScopeSource ?? null,
  );
  const findVersionOrganizationPublicIdByVersionPublicId = vi.fn(
    async () => options.versionOrganizationPublicId ?? null,
  );
  const insertPublishedVersion = vi.fn(
    async (input: OrganizationTrainingVersionInsertInput) => {
      insertInputs = [...insertInputs, input];

      return {
        id: 901,
        public_id: input.publicId,
        draft_public_id: input.draftPublicId,
        version_number: input.versionNumber,
        organization_id: input.organizationId,
        organization_public_id: input.organizationPublicId,
        org_auth_id: input.orgAuthId,
        authorization_source: input.authorizationSource,
        authorization_public_id: input.authorizationPublicId,
        owner_type: input.ownerType,
        owner_public_id: input.ownerPublicId,
        quota_owner_type: input.quotaOwnerType,
        quota_owner_public_id: input.quotaOwnerPublicId,
        publish_scope_snapshot: input.publishScopeSnapshot,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        title: input.title,
        description: input.description,
        question_count: input.questionCount,
        total_score: String(input.totalScore),
        question_type_summary: input.questionTypeSummary,
        version_status: input.status,
        published_at: new Date(input.publishedAt),
        taken_down_at:
          input.takenDownAt === null ? null : new Date(input.takenDownAt),
        takedown_reason: input.takedownReason,
        created_at: new Date(input.publishedAt),
        updated_at: new Date(input.publishedAt),
      };
    },
  );
  const updateVersionTakedown = vi.fn(
    async (
      input: OrganizationTrainingVersionTakedownInput,
    ): Promise<OrganizationTrainingVersionRow | null> => {
      takedownInputs = [...takedownInputs, input];

      if (options.takedownUpdateResult === "null") {
        return null;
      }

      return {
        id: 902,
        public_id: input.versionPublicId,
        draft_public_id: "training_draft_public_123",
        version_number: 1,
        organization_id: 501,
        organization_public_id: input.organizationPublicId,
        org_auth_id: 601,
        authorization_source: "org_auth",
        authorization_public_id: "org_auth_public_123",
        owner_type: "organization",
        owner_public_id: input.organizationPublicId,
        quota_owner_type: "organization",
        quota_owner_public_id: input.organizationPublicId,
        publish_scope_snapshot: {
          organizationPublicIds: ["organization_public_123"],
          capturedAt: "2026-06-15T19:20:13.000Z",
        },
        profession: "monopoly",
        level: 3,
        subject: "theory",
        title: "Safety training",
        description: null,
        question_count: 2,
        total_score: "5",
        question_type_summary: {
          singleChoice: 1,
          multiChoice: 0,
          trueFalse: 0,
          shortAnswer: 1,
        },
        version_status: input.status,
        published_at: new Date("2026-06-15T19:20:13.000Z"),
        taken_down_at: new Date(input.takenDownAt),
        takedown_reason: input.takedownReason,
        created_at: new Date("2026-06-15T19:20:13.000Z"),
        updated_at: new Date(input.takenDownAt),
      };
    },
  );
  const gateway: OrganizationTrainingVersionGateway = {
    findLatestVersionNumberByDraftPublicId,
    findTrustedPersistenceLineageByPublicIds,
    findVisibleOrganizationScopeSourceByAdminPublicId,
    findVersionOrganizationPublicIdByVersionPublicId,
    insertPublishedVersion,
    updateVersionTakedown,
  };

  return {
    gateway,
    findLatestVersionNumberByDraftPublicId,
    findTrustedPersistenceLineageByPublicIds,
    findVisibleOrganizationScopeSourceByAdminPublicId,
    findVersionOrganizationPublicIdByVersionPublicId,
    insertPublishedVersion,
    updateVersionTakedown,
    getInsertInputs: () => insertInputs,
    getTakedownInputs: () => takedownInputs,
  };
}

describe("organization training repository", () => {
  it("creates a published version with next version number and internal lineage storage", async () => {
    const {
      gateway,
      findLatestVersionNumberByDraftPublicId,
      insertPublishedVersion,
    } = createGateway({ latestVersionNumber: 2 });
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_999",
    });

    const result = await repository.publishVersion({
      ...createVersionWrite(),
      organizationId: 501,
      orgAuthId: 601,
    });

    expect(findLatestVersionNumberByDraftPublicId).toHaveBeenCalledWith(
      "training_draft_public_123",
    );
    expect(insertPublishedVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        publicId: "training_version_public_999",
        draftPublicId: "training_draft_public_123",
        versionNumber: 3,
        organizationId: 501,
        orgAuthId: 601,
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization_public_123",
      }),
    );
    expect(result).toMatchObject({
      publicId: "training_version_public_999",
      draftPublicId: "training_draft_public_123",
      versionNumber: 3,
      organizationPublicId: "organization_public_123",
      status: "published",
    });
    expect("authorizationSource" in result).toBe(false);
    expect("authorizationPublicId" in result).toBe(false);
    expect("organizationId" in result).toBe(false);
    expect("orgAuthId" in result).toBe(false);
  });

  it("assigns version number one when the draft has no previous published version", async () => {
    const { gateway } = createGateway({ latestVersionNumber: null });
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_first",
    });

    const result = await repository.publishVersion({
      ...createVersionWrite(),
      organizationId: 501,
      orgAuthId: 601,
    });

    expect(result.versionNumber).toBe(1);
  });

  it("preserves publish scope snapshots and lifecycle takedown metadata", async () => {
    const { gateway, getInsertInputs } = createGateway();
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_taken_down",
    });
    const versionWrite = createVersionWrite({
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });

    const result = await repository.publishVersion({
      ...versionWrite,
      organizationId: 501,
      orgAuthId: 601,
    });

    versionWrite.publishScopeSnapshot.organizationPublicIds.push(
      "organization_other_public_999",
    );

    expect(getInsertInputs()[0]?.publishScopeSnapshot).toEqual({
      organizationPublicIds: [
        "organization_public_123",
        "organization_branch_public_456",
      ],
      capturedAt: "2026-06-15T19:20:13.000Z",
    });
    expect(result).toMatchObject({
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });
    expect(result.publishScopeSnapshot.organizationPublicIds).not.toContain(
      "organization_other_public_999",
    );
  });

  it("keeps insert values away from formal targets and provider raw fields", async () => {
    const { gateway, getInsertInputs } = createGateway();
    const repository = createOrganizationTrainingRepository(gateway, {
      createVersionPublicId: () => "training_version_public_clean",
    });

    await repository.publishVersion({
      ...createVersionWrite(),
      organizationId: 501,
      orgAuthId: 601,
    });

    const serializedInsert = JSON.stringify(getInsertInputs());

    expect(serializedInsert).toContain("organization_training_version");
    expect(serializedInsert).not.toContain("formalQuestionPublicId");
    expect(serializedInsert).not.toContain("formalPaperPublicId");
    expect(serializedInsert).not.toContain("practicePublicId");
    expect(serializedInsert).not.toContain("mockExamPublicId");
    expect(serializedInsert).not.toContain("answerRecordPublicId");
    expect(serializedInsert).not.toContain("examReportPublicId");
    expect(serializedInsert).not.toContain("mistakeBookPublicId");
    expect(serializedInsert).not.toContain("providerPayload");
    expect(serializedInsert).not.toContain("rawPrompt");
    expect(serializedInsert).not.toContain("rawAnswer");
    expect(serializedInsert).not.toContain("employeeAnswer");
  });

  it("looks up trusted internal lineage from public organization and authorization identifiers", async () => {
    const { gateway, findTrustedPersistenceLineageByPublicIds } = createGateway(
      {
        trustedPersistenceLineage: {
          organizationId: 501,
          orgAuthId: 601,
        },
      },
    );
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupTrustedPersistenceLineage({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });

    expect(findTrustedPersistenceLineageByPublicIds).toHaveBeenCalledWith({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });
    expect(result).toEqual({
      organizationId: 501,
      orgAuthId: 601,
    });
  });

  it("does not query trusted lineage when public identifiers are blank", async () => {
    const { gateway, findTrustedPersistenceLineageByPublicIds } = createGateway(
      {
        trustedPersistenceLineage: {
          organizationId: 501,
          orgAuthId: 601,
        },
      },
    );
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupTrustedPersistenceLineage({
      organizationPublicId: " ",
      authorizationPublicId: "org_auth_public_123",
    });

    expect(result).toBeNull();
    expect(findTrustedPersistenceLineageByPublicIds).not.toHaveBeenCalled();
  });

  it("looks up a version organization public id from a trimmed version public id", async () => {
    const { gateway, findVersionOrganizationPublicIdByVersionPublicId } =
      createGateway({
        versionOrganizationPublicId: "organization_public_123",
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVersionOrganizationPublicId({
      versionPublicId: " training_version_public_123 ",
    });

    expect(
      findVersionOrganizationPublicIdByVersionPublicId,
    ).toHaveBeenCalledWith("training_version_public_123");
    expect(result).toBe("organization_public_123");
  });

  it("does not query version organization when the version public id is blank", async () => {
    const { gateway, findVersionOrganizationPublicIdByVersionPublicId } =
      createGateway({
        versionOrganizationPublicId: "organization_public_123",
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVersionOrganizationPublicId({
      versionPublicId: " ",
    });

    expect(result).toBeNull();
    expect(
      findVersionOrganizationPublicIdByVersionPublicId,
    ).not.toHaveBeenCalled();
  });

  it("takes down a version with lifecycle metadata without persisting runtime access policy", async () => {
    const { gateway, updateVersionTakedown, getTakedownInputs } =
      createGateway();
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.takeDownVersion(createTakedownWrite());

    expect(updateVersionTakedown).toHaveBeenCalledWith({
      versionPublicId: "training_version_public_123",
      organizationPublicId: "organization_public_123",
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });
    expect(result).toMatchObject({
      publicId: "training_version_public_123",
      organizationPublicId: "organization_public_123",
      status: "taken_down",
      takenDownAt: "2026-06-16T08:00:00.000Z",
      takedownReason: "manual owner takedown",
    });
    expect(JSON.stringify(getTakedownInputs())).not.toContain(
      "allowNewAnswers",
    );
  });

  it("fails closed when takedown persistence cannot update a matching version", async () => {
    const { gateway } = createGateway({ takedownUpdateResult: "null" });
    const repository = createOrganizationTrainingRepository(gateway);

    await expect(
      repository.takeDownVersion(createTakedownWrite()),
    ).rejects.toThrow("organization training version takedown failed.");
  });

  it("rejects invalid trusted internal lineage returned by the gateway", async () => {
    const { gateway } = createGateway({
      trustedPersistenceLineage: {
        organizationId: 0,
        orgAuthId: 601,
      },
    });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupTrustedPersistenceLineage({
      organizationPublicId: "organization_public_123",
      authorizationPublicId: "org_auth_public_123",
    });

    expect(result).toBeNull();
  });

  it("expands assigned root organizations to active descendant public ids for admin visible scope", async () => {
    const { gateway, findVisibleOrganizationScopeSourceByAdminPublicId } =
      createGateway({
        visibleOrganizationScopeSource: {
          assignedRootOrganizationIds: [101],
          activeOrganizationRows: [
            {
              organizationId: 101,
              organizationPublicId: "organization_scope_root_public",
              parentOrganizationId: null,
            },
            {
              organizationId: 102,
              organizationPublicId: "organization_scope_child_public",
              parentOrganizationId: 101,
            },
            {
              organizationId: 103,
              organizationPublicId: "organization_scope_grandchild_public",
              parentOrganizationId: 102,
            },
            {
              organizationId: 104,
              organizationPublicId: "organization_scope_unassigned_public",
              parentOrganizationId: null,
            },
          ],
        },
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVisibleOrganizationScope({
      adminPublicId: " organization_admin_public_123 ",
    });

    expect(
      findVisibleOrganizationScopeSourceByAdminPublicId,
    ).toHaveBeenCalledWith("organization_admin_public_123");
    expect(result).toEqual([
      "organization_scope_root_public",
      "organization_scope_child_public",
      "organization_scope_grandchild_public",
    ]);
  });

  it("does not query visible organization scope when admin public id is blank", async () => {
    const { gateway, findVisibleOrganizationScopeSourceByAdminPublicId } =
      createGateway({
        visibleOrganizationScopeSource: {
          assignedRootOrganizationIds: [101],
          activeOrganizationRows: [
            {
              organizationId: 101,
              organizationPublicId: "organization_scope_root_public",
              parentOrganizationId: null,
            },
          ],
        },
      });
    const repository = createOrganizationTrainingRepository(gateway);

    const result = await repository.lookupVisibleOrganizationScope({
      adminPublicId: " ",
    });

    expect(result).toBeNull();
    expect(
      findVisibleOrganizationScopeSourceByAdminPublicId,
    ).not.toHaveBeenCalled();
  });
});
