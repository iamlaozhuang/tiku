import { createPaginatedResponse } from "../contracts/api-response";
import { mapPaperRowToApi } from "../mappers/paper-mapper";
import type { PaperDto } from "../models/paper";
import type { PaperRepository } from "../repositories/paper-repository";
import {
  normalizePagination,
  type PaginationInput,
} from "../validators/pagination";

export type PaperService = {
  listPapers(
    input?: PaginationInput,
  ): Promise<ReturnType<typeof createPaperListResponse>>;
};

function createPaperListResponse(
  papers: PaperDto[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  },
) {
  return createPaginatedResponse(papers, pagination);
}

export function createPaperService(
  paperRepository: PaperRepository,
): PaperService {
  return {
    async listPapers(input = {}) {
      const pagination = normalizePagination(input);
      const paperList = await paperRepository.listPapers(pagination);

      return createPaperListResponse(
        paperList.rows.map((paperRow) => mapPaperRowToApi(paperRow)),
        {
          ...pagination,
          total: paperList.total,
        },
      );
    },
  };
}
