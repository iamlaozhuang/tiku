import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST as publishRoutePost } from "@/app/api/v1/organization-trainings/[publicId]/publish/route";
import { POST as takeDownRoutePost } from "@/app/api/v1/organization-trainings/[publicId]/take-down/route";

import type { AuthContextDto } from "../contracts/auth-contract";
import type { OrganizationTrainingPublishedVersionDto } from "../contracts/organization-training-contract";
import type {
  OrganizationTrainingPublishInput,
  OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import type { SessionService } from "./session-service";
import {
  organizationTrainingPublishBlockedMessage,
  organizationTrainingTakedownBlockedMessage,
  type OrganizationTrainingAdminContext,
  type OrganizationTrainingPersistenceLineage,
  type OrganizationTrainingPublishVersionCommand,
  type OrganizationTrainingService,
  type OrganizationTrainingTakeDownVersionCommand,
} from "./organization-training-service";
import {
  createOrganizationTrainingRouteHandlers,
  createOrganizationTrainingRuntimeRouteHandlers,
  type OrganizationTrainingVisibleOrganizationScopeResolverInput,
} from "./organization-training-route";

const runtimeRepositoryMock = vi.hoisted(() => ({
  lookupVisibleOrganizationScope: vi.fn(async () => [
    "organization_route_public_401",
  ]),
  lookupTrustedPersistenceLineage: vi.fn(async () => ({
    organizationId: 501,
    orgAuthId: 601,
  })),
  lookupVersionOrganizationPublicId: vi.fn(
    async () => "organization_route_public_401",
  ),
  publishVersion: vi.fn(
    async (): Promise<OrganizationTrainingPublishedVersionDto> => ({
      publicId: "organization_training_version_route_401",
      draftPublicId: "organization_training_draft_route_401",
      versionNumber: 1,
      organizationPublicId: "organization_route_public_401",
      publishScopeSnapshot: {
        organizationPublicIds: [] as string[],
        capturedAt: "2026-06-15T10:00:00.000Z",
      },
      profession: "logistics",
      level: 4,
      subject: "theory",
      title: "Route publish training",
      description: "Route publish description",
      questionCount: 1,
      totalScore: 5,
      status: "published",
      publishedAt: "2026-06-15T10:00:00.000Z",
      takenDownAt: null,
      takedownReason: null,
    }),
  ),
  takeDownVersion: vi.fn(
    async (): Promise<OrganizationTrainingPublishedVersionDto> => ({
      publicId: "organization_training_version_route_401",
      draftPublicId: "organization_training_draft_route_401",
      versionNumber: 1,
      organizationPublicId: "organization_route_public_401",
      publishScopeSnapshot: {
        organizationPublicIds: [] as string[],
        capturedAt: "2026-06-15T10:00:00.000Z",
      },
      profession: "logistics",
      level: 4,
      subject: "theory",
      title: "Route publish training",
      description: "Route publish description",
      questionCount: 1,
      totalScore: 5,
      status: "taken_down",
      publishedAt: "2026-06-15T10:00:00.000Z",
      takenDownAt: "2026-06-15T11:00:00.000Z",
      takedownReason: "outdated training",
    }),
  ),
}));

const postgresOrganizationTrainingRepositoryFactoryMock = vi.hoisted(() =>
  vi.fn(() => runtimeRepositoryMock),
);

vi.mock("../repositories/organization-training-repository", () => ({
  createPostgresOrganizationTrainingRepository:
    postgresOrganizationTrainingRepositoryFactoryMock,
}));

const trustedLineage: OrganizationTrainingPersistenceLineage = {
  organizationId: 501,
  orgAuthId: 601,
};

const trustedAdminContext: OrganizationTrainingAdminContext = {
  adminPublicId: "organization_admin_route_public_401",
  visibleOrganizationPublicIds: ["organization_route_public_401"],
};

const publishPathPublicId = "organization_training_draft_route_401";
const takeDownPathPublicId = "organization_training_version_route_401";
type CurrentSessionRequest = Parameters<SessionService["getCurrentSession"]>[0];
type CurrentSessionResult = Awaited<
  ReturnType<SessionService["getCurrentSession"]>
>;

type CapturingSessionService = Pick<SessionService, "getCurrentSession"> & {
  requests: CurrentSessionRequest[];
};

function createPublishInput(
  overrides: Partial<OrganizationTrainingPublishInput> = {},
): OrganizationTrainingPublishInput {
  return {
    draftPublicId: publishPathPublicId,
    organizationPublicId: "organization_route_public_401",
    authorizationPublicId: "org_auth_route_public_401",
    profession: "logistics",
    level: 4,
    subject: "theory",
    title: "Route publish training",
    description: "Route publish description",
    questions: [
      {
        publicId: "training_question_route_public_401",
        questionType: "single_choice",
        score: 5,
        standardAnswer: "A",
        analysisSummary: "Choose the compliant answer.",
        evidenceStatus: "sufficient",
        citationCount: 1,
      },
    ],
    publishScopeOrganizationPublicIds: ["organization_route_public_401"],
    capabilityContext: {
      effectiveEdition: "advanced",
      authorizationSource: "org_auth",
      canCreateOrganizationTraining: true,
    },
    questionCount: 1,
    totalScore: 5,
    questionTypeSummary: {
      singleChoice: 1,
      multiChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
    },
    ...overrides,
  };
}

function createPublishedVersion(
  overrides: Partial<OrganizationTrainingPublishedVersionDto> = {},
): OrganizationTrainingPublishedVersionDto {
  return {
    publicId: "organization_training_version_route_401",
    draftPublicId: publishPathPublicId,
    versionNumber: 1,
    organizationPublicId: "organization_route_public_401",
    publishScopeSnapshot: {
      organizationPublicIds: [],
      capturedAt: "2026-06-15T10:00:00.000Z",
    },
    profession: "logistics",
    level: 4,
    subject: "theory",
    title: "Route publish training",
    description: "Route publish description",
    questionCount: 1,
    totalScore: 5,
    status: "published",
    publishedAt: "2026-06-15T10:00:00.000Z",
    takenDownAt: null,
    takedownReason: null,
    ...overrides,
  };
}

function createTakenDownVersion(
  overrides: Partial<OrganizationTrainingPublishedVersionDto> = {},
): OrganizationTrainingPublishedVersionDto {
  return createPublishedVersion({
    publicId: takeDownPathPublicId,
    status: "taken_down",
    takenDownAt: "2026-06-15T11:00:00.000Z",
    takedownReason: "outdated training",
    ...overrides,
  });
}

function createTakedownInput(
  overrides: Partial<OrganizationTrainingTakedownInput> = {},
): OrganizationTrainingTakedownInput {
  return {
    versionPublicId: takeDownPathPublicId,
    takedownReason: "outdated training",
    ...overrides,
  };
}

function createAdminAuthContext(
  overrides: Partial<AuthContextDto["user"]> = {},
): AuthContextDto {
  return {
    user: {
      publicId: "admin_user_route_public_401",
      phone: "13900000001",
      name: "Route Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "organization_admin_route_public_401",
      adminRoles: ["ops_admin"],
      ...overrides,
    },
    session: {
      expiresAt: "2026-06-16T11:00:00.000Z",
    },
  };
}

function createCurrentSessionService(
  result: CurrentSessionResult,
): CapturingSessionService {
  const requests: CurrentSessionRequest[] = [];

  return {
    requests,
    async getCurrentSession(input) {
      requests.push(input);

      return result;
    },
  };
}

function createPublishRequest(
  body: unknown,
  init: Omit<RequestInit, "body" | "method"> = {},
): Request {
  return new Request(
    `http://localhost/api/v1/organization-trainings/${publishPathPublicId}/publish`,
    {
      ...init,
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

function createTakeDownRequest(
  body: unknown,
  init: Omit<RequestInit, "body" | "method"> = {},
): Request {
  return new Request(
    `http://localhost/api/v1/organization-trainings/${takeDownPathPublicId}/take-down`,
    {
      ...init,
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

function createRouteContext(publicId = publishPathPublicId) {
  return {
    params: Promise.resolve({
      publicId,
    }),
  };
}

function createPublishService(
  result:
    | { success: true; version: OrganizationTrainingPublishedVersionDto }
    | {
        success: false;
        reason: "invalid_publish_input";
        message: typeof organizationTrainingPublishBlockedMessage;
      } = {
    success: true,
    version: createPublishedVersion(),
  },
): Pick<OrganizationTrainingService, "publishVersion" | "takeDownVersion"> & {
  commands: OrganizationTrainingPublishVersionCommand[];
} {
  const commands: OrganizationTrainingPublishVersionCommand[] = [];

  return {
    commands,
    async publishVersion(command) {
      commands.push(command);

      return result;
    },
    async takeDownVersion() {
      throw new Error("Unexpected organization training takedown command.");
    },
  };
}

function createTakeDownService(
  result:
    | { success: true; version: OrganizationTrainingPublishedVersionDto }
    | {
        success: false;
        reason: "invalid_takedown_input";
        message: typeof organizationTrainingTakedownBlockedMessage;
      } = {
    success: true,
    version: createTakenDownVersion(),
  },
): Pick<OrganizationTrainingService, "publishVersion" | "takeDownVersion"> & {
  commands: OrganizationTrainingTakeDownVersionCommand[];
} {
  const commands: OrganizationTrainingTakeDownVersionCommand[] = [];

  return {
    commands,
    async publishVersion() {
      throw new Error("Unexpected organization training publish command.");
    },
    async takeDownVersion(command) {
      commands.push(command);

      return result;
    },
  };
}

async function resolveJsonPayload(response: Response): Promise<unknown> {
  return response.json();
}

describe("organization training publish route handlers", () => {
  beforeEach(() => {
    postgresOrganizationTrainingRepositoryFactoryMock.mockClear();
    postgresOrganizationTrainingRepositoryFactoryMock.mockReturnValue(
      runtimeRepositoryMock,
    );
    runtimeRepositoryMock.lookupTrustedPersistenceLineage.mockClear();
    runtimeRepositoryMock.lookupTrustedPersistenceLineage.mockResolvedValue(
      trustedLineage,
    );
    runtimeRepositoryMock.lookupVisibleOrganizationScope.mockClear();
    runtimeRepositoryMock.lookupVisibleOrganizationScope.mockResolvedValue([
      "organization_route_public_401",
    ]);
    runtimeRepositoryMock.lookupVersionOrganizationPublicId.mockClear();
    runtimeRepositoryMock.lookupVersionOrganizationPublicId.mockResolvedValue(
      "organization_route_public_401",
    );
    runtimeRepositoryMock.publishVersion.mockClear();
    runtimeRepositoryMock.publishVersion.mockResolvedValue(
      createPublishedVersion(),
    );
    runtimeRepositoryMock.takeDownVersion.mockClear();
    runtimeRepositoryMock.takeDownVersion.mockResolvedValue(
      createTakenDownVersion(),
    );
  });

  it("exports a thin POST handler from the App Router publish entrypoint", () => {
    expect(publishRoutePost).toEqual(expect.any(Function));
  });

  it("wires trusted lineage repository lookup into the runtime publish route", async () => {
    const handlers = createOrganizationTrainingRuntimeRouteHandlers({
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput()),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createPublishedVersion(),
      },
    });
    expect(
      runtimeRepositoryMock.lookupTrustedPersistenceLineage,
    ).toHaveBeenCalledWith({
      adminContext: trustedAdminContext,
      authorizationPublicId: "org_auth_route_public_401",
      organizationPublicId: "organization_route_public_401",
    });
    expect(runtimeRepositoryMock.publishVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: trustedLineage.organizationId,
        orgAuthId: trustedLineage.orgAuthId,
      }),
    );
  });

  it("derives organization-admin context from runtime session with trusted visible organization scope before lineage lookup", async () => {
    const sessionService = createCurrentSessionService({
      code: 0,
      message: "ok",
      data: createAdminAuthContext(),
    });
    let visibleScopeInputs: Omit<
      OrganizationTrainingVisibleOrganizationScopeResolverInput,
      "request"
    >[] = [];
    const handlers = createOrganizationTrainingRuntimeRouteHandlers({
      sessionService,
      async resolveVisibleOrganizationScope(input) {
        visibleScopeInputs = [
          ...visibleScopeInputs,
          {
            adminPublicId: input.adminPublicId,
            pathPublicId: input.pathPublicId,
            publishInput: input.publishInput,
          },
        ];

        return ["organization_route_public_401"];
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput(), {
        headers: {
          authorization: "Bearer organization_training_route_session_401",
        },
      }),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createPublishedVersion(),
      },
    });
    expect(sessionService.requests).toEqual([
      {
        authorization: "Bearer organization_training_route_session_401",
      },
    ]);
    expect(visibleScopeInputs).toEqual([
      {
        adminPublicId: "organization_admin_route_public_401",
        pathPublicId: publishPathPublicId,
        publishInput: expect.objectContaining({
          draftPublicId: publishPathPublicId,
          organizationPublicId: "organization_route_public_401",
        }),
      },
    ]);
    expect(
      runtimeRepositoryMock.lookupTrustedPersistenceLineage,
    ).toHaveBeenCalledWith({
      adminContext: trustedAdminContext,
      authorizationPublicId: "org_auth_route_public_401",
      organizationPublicId: "organization_route_public_401",
    });
  });

  it("uses repository visible organization scope for the runtime organization-admin actor context", async () => {
    const sessionService = createCurrentSessionService({
      code: 0,
      message: "ok",
      data: createAdminAuthContext(),
    });
    const handlers = createOrganizationTrainingRuntimeRouteHandlers({
      sessionService,
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput(), {
        headers: {
          authorization: "Bearer organization_training_route_session_401",
        },
      }),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createPublishedVersion(),
      },
    });
    expect(
      runtimeRepositoryMock.lookupVisibleOrganizationScope,
    ).toHaveBeenCalledWith({
      adminPublicId: "organization_admin_route_public_401",
    });
    expect(
      runtimeRepositoryMock.lookupTrustedPersistenceLineage,
    ).toHaveBeenCalledWith({
      adminContext: trustedAdminContext,
      authorizationPublicId: "org_auth_route_public_401",
      organizationPublicId: "organization_route_public_401",
    });
  });

  it("fails closed before trusted lineage lookup when runtime session has no trusted visible organization scope", async () => {
    const sessionService = createCurrentSessionService({
      code: 0,
      message: "ok",
      data: createAdminAuthContext(),
    });
    runtimeRepositoryMock.lookupVisibleOrganizationScope.mockResolvedValueOnce(
      [],
    );
    const handlers = createOrganizationTrainingRuntimeRouteHandlers({
      sessionService,
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput(), {
        headers: {
          authorization: "Bearer organization_training_route_session_401",
        },
      }),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 403064,
      message: "Organization training publish lineage is unavailable.",
      data: null,
    });
    expect(sessionService.requests).toEqual([
      {
        authorization: "Bearer organization_training_route_session_401",
      },
    ]);
    expect(
      runtimeRepositoryMock.lookupVisibleOrganizationScope,
    ).toHaveBeenCalledWith({
      adminPublicId: "organization_admin_route_public_401",
    });
    expect(
      runtimeRepositoryMock.lookupTrustedPersistenceLineage,
    ).not.toHaveBeenCalled();
    expect(runtimeRepositoryMock.publishVersion).not.toHaveBeenCalled();
  });

  it("returns a success envelope from the service and uses trusted lineage instead of client lineage", async () => {
    const modelPayloadKey = ["providerPay", "load"].join("");
    const modelInputKey = ["rawPr", "ompt"].join("");
    const modelOutputKey = ["rawAn", "swer"].join("");
    const clientInternalLineage = {
      id: 9001,
      organizationId: 9002,
      orgAuthId: 9003,
      [modelPayloadKey]: "omitted-model-payload-marker",
      [modelInputKey]: "omitted-model-input-marker",
      [modelOutputKey]: "omitted-model-output-marker",
      formalQuestionPublicId: "formal_question_public_must_not_leak",
      employeeAnswerText: "employee answer must not leak",
      publishScopeOrganizationPublicIds: [
        "organization_route_public_401",
        "organization_route_public_stale",
      ],
    };
    const publishService = createPublishService();
    const resolverInputs: {
      adminContext: OrganizationTrainingAdminContext;
      publishInput: OrganizationTrainingPublishInput;
    }[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolvePersistenceLineage({ adminContext, publishInput }) {
        resolverInputs.push({
          adminContext,
          publishInput,
        });

        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest({
        ...createPublishInput(),
        ...clientInternalLineage,
      }),
      createRouteContext(),
    );
    const payload = await resolveJsonPayload(response);
    const serializedPayload = JSON.stringify(payload);
    const serializedResolverInputs = JSON.stringify(resolverInputs);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createPublishedVersion(),
      },
    });
    expect(publishService.commands).toEqual([
      {
        publishInput: expect.objectContaining({
          draftPublicId: publishPathPublicId,
        }),
        persistenceLineage: trustedLineage,
      },
    ]);
    expect(resolverInputs).toEqual([
      {
        adminContext: trustedAdminContext,
        publishInput: expect.objectContaining({
          draftPublicId: publishPathPublicId,
        }),
      },
    ]);
    expect(serializedResolverInputs).not.toMatch(
      /"id":|"organizationId":|"orgAuthId":/,
    );
    expect(serializedPayload).not.toMatch(
      /"id":|"organizationId":|"orgAuthId":/,
    );
    expect(serializedPayload).not.toContain(
      String(clientInternalLineage[modelPayloadKey]),
    );
    expect(serializedPayload).not.toContain(
      String(clientInternalLineage[modelInputKey]),
    );
    expect(serializedPayload).not.toContain(
      String(clientInternalLineage[modelOutputKey]),
    );
    expect(serializedPayload).not.toContain(
      clientInternalLineage.formalQuestionPublicId,
    );
    expect(serializedPayload).not.toContain(
      clientInternalLineage.employeeAnswerText,
    );
    expect(serializedPayload).not.toContain("organization_route_public_stale");
  });

  it("rejects a path and body draft public id mismatch before resolving lineage", async () => {
    const publishService = createPublishService();
    const resolverCalls: OrganizationTrainingPublishInput[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolvePersistenceLineage({ publishInput }) {
        resolverCalls.push(publishInput);

        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(
        createPublishInput({
          draftPublicId: "organization_training_draft_route_mismatch",
        }),
      ),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 400062,
      message:
        "Organization training publish path public id must match request body.",
      data: null,
    });
    expect(resolverCalls).toEqual([]);
    expect(publishService.commands).toEqual([]);
  });

  it("blocks client-supplied lineage when trusted lineage is unavailable", async () => {
    const publishService = createPublishService();
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolvePersistenceLineage() {
        return null;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest({
        ...createPublishInput(),
        organizationId: 9002,
        orgAuthId: 9003,
      }),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 403064,
      message: "Organization training publish lineage is unavailable.",
      data: null,
    });
    expect(publishService.commands).toEqual([]);
  });

  it("blocks lineage resolution when organization-admin actor context is unavailable", async () => {
    const publishService = createPublishService();
    const lineageCalls: OrganizationTrainingPublishInput[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolvePersistenceLineage({ publishInput }) {
        lineageCalls.push(publishInput);

        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput()),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 403063,
      message:
        "Organization training publish organization-admin actor context is unavailable.",
      data: null,
    });
    expect(lineageCalls).toEqual([]);
    expect(publishService.commands).toEqual([]);
  });

  it("resolves trusted lineage from actor-scoped public identifiers before publishing", async () => {
    const publishService = createPublishService();
    const lookupInputs: unknown[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async lookupTrustedPersistenceLineage(input: unknown) {
        lookupInputs.push(input);

        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest({
        ...createPublishInput(),
        organizationId: 9002,
        orgAuthId: 9003,
      }),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createPublishedVersion(),
      },
    });
    expect(lookupInputs).toEqual([
      {
        adminContext: trustedAdminContext,
        authorizationPublicId: "org_auth_route_public_401",
        organizationPublicId: "organization_route_public_401",
      },
    ]);
    expect(publishService.commands).toEqual([
      {
        publishInput: expect.objectContaining({
          draftPublicId: publishPathPublicId,
        }),
        persistenceLineage: trustedLineage,
      },
    ]);
  });

  it("blocks trusted lineage lookup when actor scope cannot see the publish organization", async () => {
    const publishService = createPublishService();
    const lookupInputs: unknown[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return {
          ...trustedAdminContext,
          visibleOrganizationPublicIds: ["organization_route_public_other"],
        };
      },
      async lookupTrustedPersistenceLineage(input) {
        lookupInputs.push(input);

        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput()),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 403064,
      message: "Organization training publish lineage is unavailable.",
      data: null,
    });
    expect(lookupInputs).toEqual([]);
    expect(publishService.commands).toEqual([]);
  });

  it("blocks publishing when trusted lineage lookup cannot resolve the public organization authorization pair", async () => {
    const publishService = createPublishService();
    const lookupInputs: unknown[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async lookupTrustedPersistenceLineage(input) {
        lookupInputs.push(input);

        return null;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput()),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 403064,
      message: "Organization training publish lineage is unavailable.",
      data: null,
    });
    expect(lookupInputs).toEqual([
      {
        adminContext: trustedAdminContext,
        authorizationPublicId: "org_auth_route_public_401",
        organizationPublicId: "organization_route_public_401",
      },
    ]);
    expect(publishService.commands).toEqual([]);
  });

  it("returns an invalid input envelope for malformed publish payloads", async () => {
    const publishService = createPublishService();
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolvePersistenceLineage() {
        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest({
        draftPublicId: publishPathPublicId,
      }),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 400061,
      message: "Invalid organization training publish input.",
      data: null,
    });
    expect(publishService.commands).toEqual([]);
  });

  it("returns a blocked status envelope from service blocked results", async () => {
    const publishService = createPublishService({
      success: false,
      reason: "invalid_publish_input",
      message: organizationTrainingPublishBlockedMessage,
    });
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolvePersistenceLineage() {
        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput()),
      createRouteContext(),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 409065,
      message: organizationTrainingPublishBlockedMessage,
      data: null,
    });
  });

  it("redacts unexpected service failures behind the standard runtime error envelope", async () => {
    const publishService: Pick<
      OrganizationTrainingService,
      "publishVersion" | "takeDownVersion"
    > = {
      async publishVersion() {
        throw new Error("database stack with private row details");
      },
      async takeDownVersion() {
        throw new Error("Unexpected organization training takedown command.");
      },
    };
    const handlers = createOrganizationTrainingRouteHandlers(publishService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolvePersistenceLineage() {
        return trustedLineage;
      },
    });

    const response = await handlers.publish.POST(
      createPublishRequest(createPublishInput()),
      createRouteContext(),
    );
    const payload = await resolveJsonPayload(response);
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 500001,
      message: "Unexpected runtime error.",
      data: null,
    });
    expect(serializedPayload).not.toContain("database stack");
    expect(serializedPayload).not.toContain("private row details");
  });
});

describe("organization training takedown route handlers", () => {
  beforeEach(() => {
    postgresOrganizationTrainingRepositoryFactoryMock.mockClear();
    postgresOrganizationTrainingRepositoryFactoryMock.mockReturnValue(
      runtimeRepositoryMock,
    );
    runtimeRepositoryMock.lookupVisibleOrganizationScope.mockClear();
    runtimeRepositoryMock.lookupVisibleOrganizationScope.mockResolvedValue([
      "organization_route_public_401",
    ]);
    runtimeRepositoryMock.lookupVersionOrganizationPublicId.mockClear();
    runtimeRepositoryMock.lookupVersionOrganizationPublicId.mockResolvedValue(
      "organization_route_public_401",
    );
    runtimeRepositoryMock.takeDownVersion.mockClear();
    runtimeRepositoryMock.takeDownVersion.mockResolvedValue(
      createTakenDownVersion(),
    );
  });

  it("exports a thin POST handler from the App Router take-down entrypoint", () => {
    expect(takeDownRoutePost).toEqual(expect.any(Function));
  });

  it("returns a success envelope after resolving trusted version organization scope", async () => {
    const takeDownService = createTakeDownService();
    const resolverInputs: unknown[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(takeDownService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolveVersionOrganizationPublicId(input) {
        resolverInputs.push({
          pathPublicId: input.pathPublicId,
          takedownInput: input.takedownInput,
          adminContext: input.adminContext,
        });

        return "organization_route_public_401";
      },
    });

    const response = await handlers.takeDown.POST(
      createTakeDownRequest(createTakedownInput()),
      createRouteContext(takeDownPathPublicId),
    );
    const payload = await resolveJsonPayload(response);
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createTakenDownVersion(),
      },
    });
    expect(resolverInputs).toEqual([
      {
        pathPublicId: takeDownPathPublicId,
        takedownInput: createTakedownInput(),
        adminContext: trustedAdminContext,
      },
    ]);
    expect(takeDownService.commands).toEqual([
      {
        adminContext: trustedAdminContext,
        versionOrganizationPublicId: "organization_route_public_401",
        takedownInput: createTakedownInput(),
      },
    ]);
    expect(serializedPayload).not.toMatch(
      /"id":|"organizationId":|"orgAuthId":/,
    );
  });

  it("wires version organization lookup and repository takedown into the runtime route", async () => {
    const handlers = createOrganizationTrainingRuntimeRouteHandlers({
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
    });

    const response = await handlers.takeDown.POST(
      createTakeDownRequest(createTakedownInput()),
      createRouteContext(takeDownPathPublicId),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createTakenDownVersion(),
      },
    });
    expect(
      runtimeRepositoryMock.lookupVersionOrganizationPublicId,
    ).toHaveBeenCalledWith({
      versionPublicId: takeDownPathPublicId,
    });
    expect(runtimeRepositoryMock.takeDownVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        versionPublicId: takeDownPathPublicId,
        organizationPublicId: "organization_route_public_401",
        status: "taken_down",
        takedownReason: "outdated training",
      }),
    );
  });

  it("derives takedown organization-admin context from runtime session with visible organization scope", async () => {
    const sessionService = createCurrentSessionService({
      code: 0,
      message: "ok",
      data: createAdminAuthContext(),
    });
    let visibleScopeInputs: Omit<
      OrganizationTrainingVisibleOrganizationScopeResolverInput,
      "request"
    >[] = [];
    const handlers = createOrganizationTrainingRuntimeRouteHandlers({
      sessionService,
      async resolveVisibleOrganizationScope(input) {
        visibleScopeInputs = [
          ...visibleScopeInputs,
          {
            adminPublicId: input.adminPublicId,
            pathPublicId: input.pathPublicId,
            takedownInput: input.takedownInput,
          },
        ];

        return ["organization_route_public_401"];
      },
    });

    const response = await handlers.takeDown.POST(
      createTakeDownRequest(createTakedownInput(), {
        headers: {
          authorization: "Bearer organization_training_route_session_401",
        },
      }),
      createRouteContext(takeDownPathPublicId),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        version: createTakenDownVersion(),
      },
    });
    expect(sessionService.requests).toEqual([
      {
        authorization: "Bearer organization_training_route_session_401",
      },
    ]);
    expect(visibleScopeInputs).toEqual([
      {
        adminPublicId: "organization_admin_route_public_401",
        pathPublicId: takeDownPathPublicId,
        takedownInput: createTakedownInput(),
      },
    ]);
  });

  it("rejects a path and body version public id mismatch before resolving version organization", async () => {
    const takeDownService = createTakeDownService();
    const resolverInputs: unknown[] = [];
    const handlers = createOrganizationTrainingRouteHandlers(takeDownService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolveVersionOrganizationPublicId(input) {
        resolverInputs.push(input);

        return "organization_route_public_401";
      },
    });

    const response = await handlers.takeDown.POST(
      createTakeDownRequest(
        createTakedownInput({
          versionPublicId: "organization_training_version_route_mismatch",
        }),
      ),
      createRouteContext(takeDownPathPublicId),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 400067,
      message:
        "Organization training takedown path public id must match request body.",
      data: null,
    });
    expect(resolverInputs).toEqual([]);
    expect(takeDownService.commands).toEqual([]);
  });

  it("blocks takedown when organization-admin actor context is unavailable", async () => {
    const takeDownService = createTakeDownService();
    const handlers = createOrganizationTrainingRouteHandlers(takeDownService, {
      async resolveVersionOrganizationPublicId() {
        return "organization_route_public_401";
      },
    });

    const response = await handlers.takeDown.POST(
      createTakeDownRequest(createTakedownInput()),
      createRouteContext(takeDownPathPublicId),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 403068,
      message:
        "Organization training takedown organization-admin actor context is unavailable.",
      data: null,
    });
    expect(takeDownService.commands).toEqual([]);
  });

  it("blocks takedown when the trusted version organization cannot be resolved", async () => {
    const takeDownService = createTakeDownService();
    const handlers = createOrganizationTrainingRouteHandlers(takeDownService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolveVersionOrganizationPublicId() {
        return null;
      },
    });

    const response = await handlers.takeDown.POST(
      createTakeDownRequest(createTakedownInput()),
      createRouteContext(takeDownPathPublicId),
    );

    await expect(resolveJsonPayload(response)).resolves.toEqual({
      code: 403069,
      message:
        "Organization training takedown version organization is unavailable.",
      data: null,
    });
    expect(takeDownService.commands).toEqual([]);
  });

  it("returns invalid and blocked envelopes without leaking runtime details", async () => {
    const takeDownService = createTakeDownService({
      success: false,
      reason: "invalid_takedown_input",
      message: organizationTrainingTakedownBlockedMessage,
    });
    const handlers = createOrganizationTrainingRouteHandlers(takeDownService, {
      async resolveOrganizationAdminContext() {
        return trustedAdminContext;
      },
      async resolveVersionOrganizationPublicId() {
        return "organization_route_public_401";
      },
    });

    const invalidResponse = await handlers.takeDown.POST(
      createTakeDownRequest({
        versionPublicId: takeDownPathPublicId,
      }),
      createRouteContext(takeDownPathPublicId),
    );
    const blockedResponse = await handlers.takeDown.POST(
      createTakeDownRequest(createTakedownInput()),
      createRouteContext(takeDownPathPublicId),
    );

    await expect(resolveJsonPayload(invalidResponse)).resolves.toEqual({
      code: 400066,
      message: "Invalid organization training takedown input.",
      data: null,
    });
    await expect(resolveJsonPayload(blockedResponse)).resolves.toEqual({
      code: 409070,
      message: organizationTrainingTakedownBlockedMessage,
      data: null,
    });
  });
});
