import type { PaperRow } from "../models/paper";
import type { NormalizedPagination } from "../validators/pagination";

export type PaperListResult = {
  rows: PaperRow[];
  total: number;
};

export type PaperRepository = {
  listPapers(query: NormalizedPagination): Promise<PaperListResult>;
};
