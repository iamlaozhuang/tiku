export type ExamPaperType = "mock_paper";

export type ExamPaperStatus = "draft" | "published" | "unpublished";

export type ExamPaperTransport = {
  paperType: ExamPaperType;
  publicId: string;
  publishedAt?: string | null;
  status: ExamPaperStatus;
  title: string;
};

export type ExamPaperListData = {
  examPapers: ExamPaperTransport[];
};

export type ExamPaperDetailData = {
  examPaper: ExamPaperTransport;
};

export type Pagination = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  total: number;
};

export type ApiEnvelope<TData> = {
  code: number;
  data: TData;
  message: string;
  pagination?: Pagination;
};
