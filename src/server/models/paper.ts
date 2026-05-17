export type Profession = "monopoly" | "marketing" | "logistics";

export type ExamSubject = "theory" | "skill";

export type PaperType = "past_paper" | "mock_paper";

export type PaperStatus = "draft" | "published" | "archived";

export type PaperRow = {
  id: number;
  public_id: string;
  title: string;
  profession: Profession;
  level: number;
  subject: ExamSubject;
  paper_type: PaperType;
  paper_status: PaperStatus;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
};

export type PaperDto = {
  publicId: string;
  title: string;
  profession: Profession;
  level: number;
  subject: ExamSubject;
  paperType: PaperType;
  paperStatus: PaperStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
