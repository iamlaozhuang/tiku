import { randomUUID } from "node:crypto";

import { organizationTrainingVersion } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { OrganizationTrainingPublishedVersionWrite } from "../services/organization-training-service";
import {
  mapOrganizationTrainingVersionRowToDto,
  type OrganizationTrainingVersionRow,
} from "../mappers/organization-training-mapper";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type { OrganizationTrainingVersionRow };

export type OrganizationTrainingPublishedVersionPersistenceInput =
  OrganizationTrainingPublishedVersionWrite & {
    organizationId: number;
    orgAuthId: number;
  };

export type OrganizationTrainingVersionInsertInput =
  OrganizationTrainingPublishedVersionPersistenceInput & {
    publicId: string;
    versionNumber: number;
  };

export type OrganizationTrainingVersionGateway = {
  findLatestVersionNumberByDraftPublicId(
    draftPublicId: string,
  ): Promise<number | null>;
  insertPublishedVersion(
    input: OrganizationTrainingVersionInsertInput,
  ): Promise<OrganizationTrainingVersionRow | null>;
};

export type OrganizationTrainingRepository = {
  publishVersion(
    input: OrganizationTrainingPublishedVersionPersistenceInput,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
};

export type OrganizationTrainingRepositoryOptions = {
  createVersionPublicId?: () => string;
};

const organizationTrainingVersionSelection = {
  id: organizationTrainingVersion.id,
  public_id: organizationTrainingVersion.public_id,
  draft_public_id: organizationTrainingVersion.draft_public_id,
  version_number: organizationTrainingVersion.version_number,
  organization_id: organizationTrainingVersion.organization_id,
  organization_public_id: organizationTrainingVersion.organization_public_id,
  org_auth_id: organizationTrainingVersion.org_auth_id,
  authorization_source: organizationTrainingVersion.authorization_source,
  authorization_public_id: organizationTrainingVersion.authorization_public_id,
  owner_type: organizationTrainingVersion.owner_type,
  owner_public_id: organizationTrainingVersion.owner_public_id,
  quota_owner_type: organizationTrainingVersion.quota_owner_type,
  quota_owner_public_id: organizationTrainingVersion.quota_owner_public_id,
  publish_scope_snapshot: organizationTrainingVersion.publish_scope_snapshot,
  profession: organizationTrainingVersion.profession,
  level: organizationTrainingVersion.level,
  subject: organizationTrainingVersion.subject,
  title: organizationTrainingVersion.title,
  description: organizationTrainingVersion.description,
  question_count: organizationTrainingVersion.question_count,
  total_score: organizationTrainingVersion.total_score,
  question_type_summary: organizationTrainingVersion.question_type_summary,
  version_status: organizationTrainingVersion.version_status,
  published_at: organizationTrainingVersion.published_at,
  taken_down_at: organizationTrainingVersion.taken_down_at,
  takedown_reason: organizationTrainingVersion.takedown_reason,
  created_at: organizationTrainingVersion.created_at,
  updated_at: organizationTrainingVersion.updated_at,
};

export function createOrganizationTrainingRepository(
  gateway: OrganizationTrainingVersionGateway,
  options: OrganizationTrainingRepositoryOptions = {},
): OrganizationTrainingRepository {
  const createVersionPublicId =
    options.createVersionPublicId ?? createDefaultVersionPublicId;

  return {
    async publishVersion(input) {
      const latestVersionNumber =
        await gateway.findLatestVersionNumberByDraftPublicId(
          input.draftPublicId,
        );
      const insertInput = createVersionInsertInput(input, {
        publicId: createVersionPublicId(),
        versionNumber: resolveNextVersionNumber(latestVersionNumber),
      });
      const insertedRow = await gateway.insertPublishedVersion(insertInput);

      if (insertedRow === null) {
        throw new Error("organization training version persistence failed.");
      }

      return mapOrganizationTrainingVersionRowToDto(insertedRow);
    },
  };
}

export function createPostgresOrganizationTrainingRepository(
  options: RuntimeDatabaseOptions = {},
): OrganizationTrainingRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for organization training publish-version persistence.",
  );

  return createOrganizationTrainingRepository({
    async findLatestVersionNumberByDraftPublicId(draftPublicId) {
      return findLatestVersionNumberByDraftPublicId(
        getDatabase(),
        draftPublicId,
      );
    },
    async insertPublishedVersion(input) {
      const [row] = await getDatabase()
        .insert(organizationTrainingVersion)
        .values({
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
        })
        .returning(organizationTrainingVersionSelection);

      return (row as OrganizationTrainingVersionRow | undefined) ?? null;
    },
  });
}

function createVersionInsertInput(
  input: OrganizationTrainingPublishedVersionPersistenceInput,
  generated: {
    publicId: string;
    versionNumber: number;
  },
): OrganizationTrainingVersionInsertInput {
  return {
    ...input,
    publicId: generated.publicId,
    versionNumber: generated.versionNumber,
    publishScopeSnapshot: {
      organizationPublicIds: [
        ...input.publishScopeSnapshot.organizationPublicIds,
      ],
      capturedAt: input.publishScopeSnapshot.capturedAt,
    },
    questionTypeSummary: {
      singleChoice: input.questionTypeSummary.singleChoice,
      multiChoice: input.questionTypeSummary.multiChoice,
      trueFalse: input.questionTypeSummary.trueFalse,
      shortAnswer: input.questionTypeSummary.shortAnswer,
    },
  };
}

async function findLatestVersionNumberByDraftPublicId(
  database: RuntimeDatabase,
  draftPublicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({
      version_number: organizationTrainingVersion.version_number,
    })
    .from(organizationTrainingVersion)
    .where(eq(organizationTrainingVersion.draft_public_id, draftPublicId))
    .orderBy(desc(organizationTrainingVersion.version_number))
    .limit(1);

  return row?.version_number ?? null;
}

function resolveNextVersionNumber(latestVersionNumber: number | null): number {
  if (
    latestVersionNumber === null ||
    !Number.isInteger(latestVersionNumber) ||
    latestVersionNumber < 1
  ) {
    return 1;
  }

  return latestVersionNumber + 1;
}

function createDefaultVersionPublicId(): string {
  return `organization_training_version_${randomUUID()}`;
}
