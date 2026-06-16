import { randomUUID } from "node:crypto";

import {
  admin,
  adminOrganization,
  orgAuth,
  orgAuthOrganization,
  organization,
  organizationTrainingVersion,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type { OrganizationTrainingPublishedVersionPersistenceWrite } from "../services/organization-training-service";
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
  OrganizationTrainingPublishedVersionPersistenceWrite;

export type OrganizationTrainingVersionInsertInput =
  OrganizationTrainingPublishedVersionPersistenceInput & {
    publicId: string;
    versionNumber: number;
  };

export type OrganizationTrainingTrustedPersistenceLineage = {
  organizationId: number;
  orgAuthId: number;
};

export type OrganizationTrainingTrustedPersistenceLineageLookupInput = {
  organizationPublicId: string;
  authorizationPublicId: string;
};

export type OrganizationTrainingVisibleOrganizationScopeLookupInput = {
  adminPublicId: string;
};

export type OrganizationTrainingVisibleOrganizationScopeRow = {
  organizationId: number;
  organizationPublicId: string;
  parentOrganizationId: number | null;
};

export type OrganizationTrainingVisibleOrganizationScopeSource = {
  assignedRootOrganizationIds: readonly number[];
  activeOrganizationRows: readonly OrganizationTrainingVisibleOrganizationScopeRow[];
};

export type OrganizationTrainingVersionGateway = {
  findLatestVersionNumberByDraftPublicId(
    draftPublicId: string,
  ): Promise<number | null>;
  findTrustedPersistenceLineageByPublicIds(
    input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingTrustedPersistenceLineage | null>;
  findVisibleOrganizationScopeSourceByAdminPublicId(
    adminPublicId: string,
  ): Promise<OrganizationTrainingVisibleOrganizationScopeSource | null>;
  insertPublishedVersion(
    input: OrganizationTrainingVersionInsertInput,
  ): Promise<OrganizationTrainingVersionRow | null>;
};

export type OrganizationTrainingRepository = {
  lookupVisibleOrganizationScope(
    input: OrganizationTrainingVisibleOrganizationScopeLookupInput,
  ): Promise<readonly string[] | null>;
  lookupTrustedPersistenceLineage(
    input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
  ): Promise<OrganizationTrainingTrustedPersistenceLineage | null>;
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
    async lookupVisibleOrganizationScope(input) {
      const adminPublicId = normalizeRequiredText(input.adminPublicId);

      if (adminPublicId === null) {
        return null;
      }

      const visibleOrganizationScopeSource =
        await gateway.findVisibleOrganizationScopeSourceByAdminPublicId(
          adminPublicId,
        );

      return visibleOrganizationScopeSource === null
        ? null
        : resolveVisibleOrganizationPublicIds(visibleOrganizationScopeSource);
    },

    async lookupTrustedPersistenceLineage(input) {
      const lookupInput = normalizeTrustedPersistenceLineageLookupInput(input);

      if (lookupInput === null) {
        return null;
      }

      const persistenceLineage =
        await gateway.findTrustedPersistenceLineageByPublicIds(lookupInput);

      return persistenceLineage === null
        ? null
        : normalizeTrustedPersistenceLineage(persistenceLineage);
    },

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
    async findTrustedPersistenceLineageByPublicIds(input) {
      return findTrustedPersistenceLineageByPublicIds(getDatabase(), input);
    },
    async findVisibleOrganizationScopeSourceByAdminPublicId(adminPublicId) {
      return findVisibleOrganizationScopeSourceByAdminPublicId(
        getDatabase(),
        adminPublicId,
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

function normalizeRequiredText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeTrustedPersistenceLineageLookupInput(
  input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
): OrganizationTrainingTrustedPersistenceLineageLookupInput | null {
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );

  if (organizationPublicId === null || authorizationPublicId === null) {
    return null;
  }

  return {
    organizationPublicId,
    authorizationPublicId,
  };
}

function normalizeTrustedPersistenceLineage(
  persistenceLineage: OrganizationTrainingTrustedPersistenceLineage,
): OrganizationTrainingTrustedPersistenceLineage | null {
  if (
    !Number.isInteger(persistenceLineage.organizationId) ||
    persistenceLineage.organizationId < 1 ||
    !Number.isInteger(persistenceLineage.orgAuthId) ||
    persistenceLineage.orgAuthId < 1
  ) {
    return null;
  }

  return {
    organizationId: persistenceLineage.organizationId,
    orgAuthId: persistenceLineage.orgAuthId,
  };
}

function normalizeVisibleOrganizationScopeRow(
  scopeRow: OrganizationTrainingVisibleOrganizationScopeRow,
): OrganizationTrainingVisibleOrganizationScopeRow | null {
  const organizationPublicId = normalizeRequiredText(
    scopeRow.organizationPublicId,
  );

  if (
    organizationPublicId === null ||
    !Number.isInteger(scopeRow.organizationId) ||
    scopeRow.organizationId < 1 ||
    (scopeRow.parentOrganizationId !== null &&
      (!Number.isInteger(scopeRow.parentOrganizationId) ||
        scopeRow.parentOrganizationId < 1))
  ) {
    return null;
  }

  return {
    organizationId: scopeRow.organizationId,
    organizationPublicId,
    parentOrganizationId: scopeRow.parentOrganizationId,
  };
}

function resolveVisibleOrganizationPublicIds(
  visibleOrganizationScopeSource: OrganizationTrainingVisibleOrganizationScopeSource,
): string[] {
  const activeOrganizationRows =
    visibleOrganizationScopeSource.activeOrganizationRows
      .map(normalizeVisibleOrganizationScopeRow)
      .filter(
        (
          scopeRow,
        ): scopeRow is OrganizationTrainingVisibleOrganizationScopeRow =>
          scopeRow !== null,
      );
  const activeOrganizationIds = new Set(
    activeOrganizationRows.map((scopeRow) => scopeRow.organizationId),
  );
  const assignedRootOrganizationIds = [
    ...new Set(
      visibleOrganizationScopeSource.assignedRootOrganizationIds.filter(
        (organizationId) =>
          Number.isInteger(organizationId) &&
          organizationId > 0 &&
          activeOrganizationIds.has(organizationId),
      ),
    ),
  ];

  if (assignedRootOrganizationIds.length === 0) {
    return [];
  }

  const childOrganizationIdsByParentId = activeOrganizationRows.reduce(
    (childIdsByParentId, scopeRow) => {
      if (scopeRow.parentOrganizationId === null) {
        return childIdsByParentId;
      }

      const currentChildIds =
        childIdsByParentId.get(scopeRow.parentOrganizationId) ?? [];
      childIdsByParentId.set(scopeRow.parentOrganizationId, [
        ...currentChildIds,
        scopeRow.organizationId,
      ]);

      return childIdsByParentId;
    },
    new Map<number, number[]>(),
  );
  const visibleOrganizationIds = new Set<number>();
  let pendingOrganizationIds = assignedRootOrganizationIds;

  while (pendingOrganizationIds.length > 0) {
    const [nextOrganizationId, ...remainingOrganizationIds] =
      pendingOrganizationIds;

    if (
      nextOrganizationId === undefined ||
      visibleOrganizationIds.has(nextOrganizationId)
    ) {
      pendingOrganizationIds = remainingOrganizationIds;
      continue;
    }

    visibleOrganizationIds.add(nextOrganizationId);
    pendingOrganizationIds = [
      ...remainingOrganizationIds,
      ...(childOrganizationIdsByParentId.get(nextOrganizationId) ?? []),
    ];
  }

  return activeOrganizationRows
    .filter((scopeRow) => visibleOrganizationIds.has(scopeRow.organizationId))
    .map((scopeRow) => scopeRow.organizationPublicId);
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

async function findTrustedPersistenceLineageByPublicIds(
  database: RuntimeDatabase,
  input: OrganizationTrainingTrustedPersistenceLineageLookupInput,
): Promise<OrganizationTrainingTrustedPersistenceLineage | null> {
  const [row] = await database
    .select({
      organization_id: organization.id,
      org_auth_id: orgAuth.id,
    })
    .from(orgAuthOrganization)
    .innerJoin(
      organization,
      eq(orgAuthOrganization.organization_id, organization.id),
    )
    .innerJoin(orgAuth, eq(orgAuthOrganization.org_auth_id, orgAuth.id))
    .where(
      and(
        eq(organization.public_id, input.organizationPublicId),
        eq(orgAuth.public_id, input.authorizationPublicId),
      ),
    )
    .limit(1);

  if (row === undefined) {
    return null;
  }

  return {
    organizationId: row.organization_id,
    orgAuthId: row.org_auth_id,
  };
}

async function findVisibleOrganizationScopeSourceByAdminPublicId(
  database: RuntimeDatabase,
  adminPublicId: string,
): Promise<OrganizationTrainingVisibleOrganizationScopeSource> {
  const assignedRootRows = await database
    .select({
      organization_id: adminOrganization.organization_id,
    })
    .from(adminOrganization)
    .innerJoin(admin, eq(adminOrganization.admin_id, admin.id))
    .innerJoin(
      organization,
      eq(adminOrganization.organization_id, organization.id),
    )
    .where(
      and(
        eq(admin.public_id, adminPublicId),
        eq(admin.status, "active"),
        eq(organization.status, "active"),
      ),
    );
  const assignedRootOrganizationIds = assignedRootRows.map(
    (assignedRootRow) => assignedRootRow.organization_id,
  );

  if (assignedRootOrganizationIds.length === 0) {
    return {
      assignedRootOrganizationIds,
      activeOrganizationRows: [],
    };
  }

  const activeOrganizationRows = await database
    .select({
      organization_id: organization.id,
      organization_public_id: organization.public_id,
      parent_organization_id: organization.parent_organization_id,
    })
    .from(organization)
    .where(eq(organization.status, "active"));

  return {
    assignedRootOrganizationIds,
    activeOrganizationRows: activeOrganizationRows.map(
      (activeOrganizationRow) => ({
        organizationId: activeOrganizationRow.organization_id,
        organizationPublicId: activeOrganizationRow.organization_public_id,
        parentOrganizationId: activeOrganizationRow.parent_organization_id,
      }),
    ),
  };
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
