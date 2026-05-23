import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AiExplanationDto,
  MistakeBookAiExplanationResultDto,
  MistakeBookListResultDto,
  MistakeBookResultDto,
} from "../contracts/mistake-book-contract";
import { mapMistakeBookItemToApi } from "../mappers/mistake-book-mapper";
import type {
  MistakeBookAuthorizationScopeRow,
  MistakeBookRepository,
  MistakeBookRow,
} from "../repositories/mistake-book-repository";
import {
  normalizeAiExplanationInput,
  normalizeMistakeBookListQuery,
} from "../validators/mistake-book";

export type MistakeBookUserContext = {
  userPublicId: string;
};

export type MistakeBookClock = {
  now(): Date;
};

export type MistakeBookService = {
  listMistakeBooks(
    userContext: MistakeBookUserContext,
    query: unknown,
  ): Promise<ApiResponse<MistakeBookListResultDto>>;
  getMistakeBook(
    userContext: MistakeBookUserContext,
    publicId: string,
  ): Promise<ApiResponse<MistakeBookResultDto | null>>;
  favoriteMistakeBook(
    userContext: MistakeBookUserContext,
    publicId: string,
  ): Promise<ApiResponse<MistakeBookResultDto | null>>;
  unfavoriteMistakeBook(
    userContext: MistakeBookUserContext,
    publicId: string,
  ): Promise<ApiResponse<MistakeBookResultDto | null>>;
  markMistakeBookMastered(
    userContext: MistakeBookUserContext,
    publicId: string,
  ): Promise<ApiResponse<MistakeBookResultDto | null>>;
  removeMistakeBook(
    userContext: MistakeBookUserContext,
    publicId: string,
  ): Promise<ApiResponse<MistakeBookResultDto | null>>;
  requestAiExplanation(
    userContext: MistakeBookUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<MistakeBookAiExplanationResultDto | null>>;
};

export type MistakeBookAiExplanationRuntimeContext = {
  userPublicId: string;
  mistakeBookPublicId: string;
  questionPublicId: string;
  paperQuestionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  learnerAnswer: string;
  standardAnswer: string;
  analysis: string | null;
  isCorrect: false;
  triggerReason: "manual_request";
};

export type MistakeBookAiExplanationRuntime = {
  generateObjectiveExplanation(
    context: MistakeBookAiExplanationRuntimeContext,
  ): Promise<AiExplanationDto>;
};

export type MistakeBookServiceOptions = {
  aiExplanationRuntime?: MistakeBookAiExplanationRuntime;
};

const mistakeBookContractTerm = "mistake_book";
const masteredContractTerm = "mastered";
const authorizationContractTerm = "authorization";

void [mistakeBookContractTerm, masteredContractTerm, authorizationContractTerm];

const systemClock: MistakeBookClock = {
  now() {
    return new Date();
  },
};

function hasEffectiveAuthorization(
  scopes: MistakeBookAuthorizationScopeRow[],
  mistakeBook: { profession: MistakeBookRow["profession"]; level: number },
): boolean {
  return scopes.some(
    (scope) =>
      scope.profession === mistakeBook.profession &&
      scope.level === mistakeBook.level,
  );
}

function createMistakeBookNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404331, "Mistake book item does not exist.");
}

function getStringField(
  value: Record<string, unknown>,
  key: string,
): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function getLearnerAnswer(mistakeBook: MistakeBookRow): string {
  if (
    mistakeBook.latest_answer_snapshot.textAnswer !== null &&
    mistakeBook.latest_answer_snapshot.textAnswer.trim().length > 0
  ) {
    return mistakeBook.latest_answer_snapshot.textAnswer.trim();
  }

  return mistakeBook.latest_answer_snapshot.selectedLabels.join(",");
}

function createAiExplanationRuntimeContext(
  userContext: MistakeBookUserContext,
  mistakeBook: MistakeBookRow,
): MistakeBookAiExplanationRuntimeContext {
  return {
    userPublicId: userContext.userPublicId,
    mistakeBookPublicId: mistakeBook.public_id,
    questionPublicId: mistakeBook.question_public_id,
    paperQuestionPublicId: mistakeBook.paper_question_public_id,
    questionSnapshot: mistakeBook.question_snapshot,
    learnerAnswer: getLearnerAnswer(mistakeBook),
    standardAnswer:
      getStringField(mistakeBook.question_snapshot, "standardAnswerRichText") ??
      "",
    analysis: getStringField(mistakeBook.question_snapshot, "analysisRichText"),
    isCorrect: false,
    triggerReason: "manual_request",
  };
}

function isMistakeBookRow(
  value: MistakeBookRow | ApiResponse<null>,
): value is MistakeBookRow {
  return "public_id" in value;
}

async function listScopes(
  repository: MistakeBookRepository,
  userContext: MistakeBookUserContext,
): Promise<MistakeBookAuthorizationScopeRow[]> {
  return repository.listEffectiveAuthorizationScopes({
    userPublicId: userContext.userPublicId,
  });
}

async function getAuthorizedMistakeBook(
  repository: MistakeBookRepository,
  userContext: MistakeBookUserContext,
  publicId: string,
): Promise<MistakeBookRow | ApiResponse<null>> {
  const mistakeBook = await repository.findMistakeBookByPublicId({
    userPublicId: userContext.userPublicId,
    publicId,
  });

  if (mistakeBook === null) {
    return createMistakeBookNotFoundResponse();
  }

  const scopes = await listScopes(repository, userContext);

  if (!hasEffectiveAuthorization(scopes, mistakeBook)) {
    return createMistakeBookNotFoundResponse();
  }

  return mistakeBook;
}

async function updateAuthorizedMistakeBook(
  repository: MistakeBookRepository,
  userContext: MistakeBookUserContext,
  mistakeBook: MistakeBookRow,
  nextState: {
    mistakeBookStatus: MistakeBookRow["mistake_book_status"];
    isFavorite: boolean;
    isRemoved: boolean;
    masteredAt: Date | null;
    updatedAt: Date;
  },
): Promise<ApiResponse<MistakeBookResultDto | null>> {
  const updatedMistakeBook = await repository.updateMistakeBookState({
    userPublicId: userContext.userPublicId,
    publicId: mistakeBook.public_id,
    ...nextState,
  });

  if (updatedMistakeBook === null) {
    return createMistakeBookNotFoundResponse();
  }

  return createSuccessResponse({
    mistakeBook: mapMistakeBookItemToApi(updatedMistakeBook),
  });
}

export function createMistakeBookService(
  repository: MistakeBookRepository,
  clock: MistakeBookClock = systemClock,
  options: MistakeBookServiceOptions = {},
): MistakeBookService {
  return {
    async listMistakeBooks(userContext, query) {
      const normalizedQuery = normalizeMistakeBookListQuery(query);
      const [scopes, mistakeBookPage] = await Promise.all([
        listScopes(repository, userContext),
        repository.listMistakeBooks({
          userPublicId: userContext.userPublicId,
          ...normalizedQuery,
        }),
      ]);
      const authorizedMistakeBooks = mistakeBookPage.rows.filter(
        (mistakeBook) =>
          !mistakeBook.is_removed &&
          hasEffectiveAuthorization(scopes, mistakeBook),
      );

      return createPaginatedResponse(
        {
          mistakeBooks: authorizedMistakeBooks.map(mapMistakeBookItemToApi),
        },
        {
          page: normalizedQuery.page,
          pageSize: normalizedQuery.pageSize,
          total: authorizedMistakeBooks.length,
          sortBy: normalizedQuery.sortBy,
          sortOrder: normalizedQuery.sortOrder,
        },
      );
    },

    async getMistakeBook(userContext, publicId) {
      const mistakeBook = await getAuthorizedMistakeBook(
        repository,
        userContext,
        publicId,
      );

      if (!isMistakeBookRow(mistakeBook)) {
        return mistakeBook;
      }

      return createSuccessResponse({
        mistakeBook: mapMistakeBookItemToApi(mistakeBook),
      });
    },

    async favoriteMistakeBook(userContext, publicId) {
      const mistakeBook = await getAuthorizedMistakeBook(
        repository,
        userContext,
        publicId,
      );

      if (!isMistakeBookRow(mistakeBook)) {
        return mistakeBook;
      }

      return updateAuthorizedMistakeBook(repository, userContext, mistakeBook, {
        mistakeBookStatus: mistakeBook.mistake_book_status,
        isFavorite: true,
        isRemoved: false,
        masteredAt: mistakeBook.mastered_at,
        updatedAt: clock.now(),
      });
    },

    async unfavoriteMistakeBook(userContext, publicId) {
      const mistakeBook = await getAuthorizedMistakeBook(
        repository,
        userContext,
        publicId,
      );

      if (!isMistakeBookRow(mistakeBook)) {
        return mistakeBook;
      }

      return updateAuthorizedMistakeBook(repository, userContext, mistakeBook, {
        mistakeBookStatus: mistakeBook.mistake_book_status,
        isFavorite: false,
        isRemoved: false,
        masteredAt: mistakeBook.mastered_at,
        updatedAt: clock.now(),
      });
    },

    async markMistakeBookMastered(userContext, publicId) {
      const mistakeBook = await getAuthorizedMistakeBook(
        repository,
        userContext,
        publicId,
      );

      if (!isMistakeBookRow(mistakeBook)) {
        return mistakeBook;
      }

      const masteredAt = clock.now();

      return updateAuthorizedMistakeBook(repository, userContext, mistakeBook, {
        mistakeBookStatus: "mastered",
        isFavorite: mistakeBook.is_favorite,
        isRemoved: false,
        masteredAt,
        updatedAt: masteredAt,
      });
    },

    async removeMistakeBook(userContext, publicId) {
      const mistakeBook = await getAuthorizedMistakeBook(
        repository,
        userContext,
        publicId,
      );

      if (!isMistakeBookRow(mistakeBook)) {
        return mistakeBook;
      }

      return updateAuthorizedMistakeBook(repository, userContext, mistakeBook, {
        mistakeBookStatus: "removed",
        isFavorite: mistakeBook.is_favorite,
        isRemoved: true,
        masteredAt: mistakeBook.mastered_at,
        updatedAt: clock.now(),
      });
    },

    async requestAiExplanation(userContext, publicId, input) {
      normalizeAiExplanationInput(input);

      const mistakeBook = await getAuthorizedMistakeBook(
        repository,
        userContext,
        publicId,
      );

      if (!isMistakeBookRow(mistakeBook)) {
        return mistakeBook;
      }

      if (options.aiExplanationRuntime !== undefined) {
        const aiExplanation =
          await options.aiExplanationRuntime.generateObjectiveExplanation(
            createAiExplanationRuntimeContext(userContext, mistakeBook),
          );

        return createSuccessResponse({
          aiExplanation,
        });
      }

      return createErrorResponse(
        422331,
        "AI explanation is not available for mistake book in Phase 4.",
      );
    },
  };
}

export function createUnavailableMistakeBookService(): MistakeBookService {
  return {
    async listMistakeBooks() {
      return createPaginatedResponse(
        {
          mistakeBooks: [],
        },
        {
          page: 1,
          pageSize: 20,
          total: 0,
          sortBy: "latestWrongAt",
          sortOrder: "desc",
        },
        "Mistake book runtime is not configured.",
      );
    },
    async getMistakeBook() {
      return createErrorResponse(
        503331,
        "Mistake book runtime is not configured.",
      );
    },
    async favoriteMistakeBook() {
      return createErrorResponse(
        503331,
        "Mistake book runtime is not configured.",
      );
    },
    async unfavoriteMistakeBook() {
      return createErrorResponse(
        503331,
        "Mistake book runtime is not configured.",
      );
    },
    async markMistakeBookMastered() {
      return createErrorResponse(
        503331,
        "Mistake book runtime is not configured.",
      );
    },
    async removeMistakeBook() {
      return createErrorResponse(
        503331,
        "Mistake book runtime is not configured.",
      );
    },
    async requestAiExplanation() {
      return createErrorResponse(
        503331,
        "Mistake book runtime is not configured.",
      );
    },
  };
}
