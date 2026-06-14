import type {
  ExamPaperStatus,
  ExamPaperTransport,
  ExamPaperType,
  Pagination,
} from "@/server/contracts/question-paper/exam-paper-contract";

export type ExamPaperRecord = {
  paperType: ExamPaperType;
  publicId: string;
  publishedAt?: string | null;
  status: ExamPaperStatus;
  title: string;
};

export type ListExamPapersQuery = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type ListExamPapersResult = {
  examPapers: ExamPaperRecord[];
  pagination: Pagination;
};

export type QuestionPaperRepository = {
  copyExamPaper?: (publicId: string) => Promise<ExamPaperRecord | null>;
  createExamPaperDraft?: () => Promise<ExamPaperRecord>;
  findExamPaperByPublicId?: (
    publicId: string,
  ) => Promise<ExamPaperRecord | null>;
  listExamPapers?: (
    query: ListExamPapersQuery,
  ) => Promise<ListExamPapersResult>;
  publishExamPaper?: (publicId: string) => Promise<ExamPaperRecord | null>;
  unpublishExamPaper?: (publicId: string) => Promise<ExamPaperRecord | null>;
  updateExamPaper?: (publicId: string) => Promise<ExamPaperRecord | null>;
};

export function createUnavailableQuestionPaperRepository(): QuestionPaperRepository {
  return {};
}

export function mapExamPaperRecord(
  examPaperRecord: ExamPaperRecord,
): ExamPaperTransport {
  return {
    paperType: examPaperRecord.paperType,
    publicId: examPaperRecord.publicId,
    ...(examPaperRecord.publishedAt !== undefined
      ? { publishedAt: examPaperRecord.publishedAt }
      : {}),
    status: examPaperRecord.status,
    title: examPaperRecord.title,
  };
}
