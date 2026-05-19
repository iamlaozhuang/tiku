import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  StudentPaperDetailResultDto,
  StudentPaperScopeDto,
  StudentPaperSummaryDto,
} from "../contracts/student-paper-contract";
import {
  mapStudentPaperDetailToApi,
  mapStudentPaperListToApi,
  mapStudentPaperScopeToApi,
} from "../mappers/student-paper-mapper";
import type {
  StudentPaperAuthorizationScopeRow,
  StudentPaperRepository,
  StudentPublishedPaperRow,
} from "../repositories/student-paper-repository";
import { normalizeStudentPaperListInput } from "../validators/student-paper";
import type { NormalizedStudentPaperListInput } from "../validators/student-paper";

export type StudentPaperUserContext = {
  userPublicId: string;
};

export type StudentPaperService = {
  listScopes(
    userContext: StudentPaperUserContext,
  ): Promise<ApiResponse<StudentPaperScopeDto[] | null>>;
  listStudentPapers(
    userContext: StudentPaperUserContext,
    input?: Record<string, unknown>,
  ): Promise<ApiResponse<StudentPaperSummaryDto[] | null>>;
  getStudentPaper(
    userContext: StudentPaperUserContext,
    publicId: string,
  ): Promise<ApiResponse<StudentPaperDetailResultDto | null>>;
};

type SelectedStudentPaperScope =
  | {
      status: "selected";
      profession: StudentPaperAuthorizationScopeRow["profession"];
      level: number;
    }
  | {
      status: "missing";
    }
  | {
      status: "forbidden";
    }
  | {
      status: "empty";
    };

const missingScopeMessage = "Student paper scope selection is required.";
const forbiddenScopeMessage =
  "Student authorization is not valid for this paper scope.";
const missingPaperMessage = "Student paper does not exist.";

const authorizationContractTerm = "authorization";
const paperSnapshotContractTerm = "paper_snapshot";
const publishedContractTerm = "published";

void [
  authorizationContractTerm,
  paperSnapshotContractTerm,
  publishedContractTerm,
];

function isSameScope(
  scope: StudentPaperAuthorizationScopeRow,
  profession: StudentPaperAuthorizationScopeRow["profession"],
  level: number,
): boolean {
  return scope.profession === profession && scope.level === level;
}

function selectStudentPaperScope(
  scopes: StudentPaperAuthorizationScopeRow[],
  input: NormalizedStudentPaperListInput,
): SelectedStudentPaperScope {
  if (scopes.length === 0) {
    return {
      status: "empty",
    };
  }

  if (input.profession !== null && input.level !== null) {
    const hasMatchingScope = scopes.some((scope) =>
      isSameScope(scope, input.profession!, input.level!),
    );

    return hasMatchingScope
      ? {
          status: "selected",
          profession: input.profession,
          level: input.level,
        }
      : {
          status: "forbidden",
        };
  }

  if (scopes.length === 1) {
    return {
      status: "selected",
      profession: scopes[0].profession,
      level: scopes[0].level,
    };
  }

  return {
    status: "missing",
  };
}

function isPaperWithinScopes(
  paper: StudentPublishedPaperRow,
  scopes: StudentPaperAuthorizationScopeRow[],
): boolean {
  return scopes.some((scope) =>
    isSameScope(scope, paper.profession, paper.level),
  );
}

export function createStudentPaperService(
  studentPaperRepository: StudentPaperRepository,
): StudentPaperService {
  return {
    async listScopes(userContext) {
      const scopes =
        await studentPaperRepository.listEffectiveAuthorizationScopes({
          userPublicId: userContext.userPublicId,
        });

      return createSuccessResponse(
        scopes.map((scope) => mapStudentPaperScopeToApi(scope)),
      );
    },

    async listStudentPapers(userContext, input = {}) {
      const normalizedInput = normalizeStudentPaperListInput(input);
      const scopes =
        await studentPaperRepository.listEffectiveAuthorizationScopes({
          userPublicId: userContext.userPublicId,
        });
      const selectedScope = selectStudentPaperScope(scopes, normalizedInput);

      if (selectedScope.status === "empty") {
        return createPaginatedResponse([], {
          page: normalizedInput.page,
          pageSize: normalizedInput.pageSize,
          total: 0,
          sortBy: normalizedInput.sortBy,
          sortOrder: normalizedInput.sortOrder,
        });
      }

      if (selectedScope.status === "missing") {
        return createErrorResponse(422301, missingScopeMessage);
      }

      if (selectedScope.status === "forbidden") {
        return createErrorResponse(403301, forbiddenScopeMessage);
      }

      const paperResult = await studentPaperRepository.listPublishedPapers({
        ...normalizedInput,
        userPublicId: userContext.userPublicId,
        profession: selectedScope.profession,
        level: selectedScope.level,
      });

      return createPaginatedResponse(
        mapStudentPaperListToApi(paperResult.rows),
        {
          page: normalizedInput.page,
          pageSize: normalizedInput.pageSize,
          total: paperResult.total,
          sortBy: normalizedInput.sortBy,
          sortOrder: normalizedInput.sortOrder,
        },
      );
    },

    async getStudentPaper(userContext, publicId) {
      const scopes =
        await studentPaperRepository.listEffectiveAuthorizationScopes({
          userPublicId: userContext.userPublicId,
        });

      if (scopes.length === 0) {
        return createErrorResponse(404301, missingPaperMessage);
      }

      const paper = await studentPaperRepository.findPublishedPaperByPublicId({
        userPublicId: userContext.userPublicId,
        publicId,
      });

      if (paper === null || !isPaperWithinScopes(paper, scopes)) {
        return createErrorResponse(404301, missingPaperMessage);
      }

      return createSuccessResponse({
        paper: mapStudentPaperDetailToApi(paper),
      });
    },
  };
}

export function createUnavailableStudentPaperService(): StudentPaperService {
  return {
    async listScopes() {
      return createErrorResponse(
        503301,
        "Student paper runtime is not configured.",
      );
    },
    async listStudentPapers() {
      return createErrorResponse(
        503301,
        "Student paper runtime is not configured.",
      );
    },
    async getStudentPaper() {
      return createErrorResponse(
        503301,
        "Student paper runtime is not configured.",
      );
    },
  };
}
