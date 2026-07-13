import { redirect } from "next/navigation";

import { AdminQuestionMaterialManagement } from "@/features/admin/question-material-management/AdminQuestionMaterialManagement";

type QuestionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const knowledgeNodePublicId = resolvedSearchParams.knowledgeNodePublicId;
  const questionPublicId = resolvedSearchParams.questionPublicId;
  const normalizedQuestionPublicId =
    typeof questionPublicId === "string" ? questionPublicId.trim() : "";

  if (normalizedQuestionPublicId !== "") {
    redirect(
      `/content/questions/${encodeURIComponent(normalizedQuestionPublicId)}/edit?publishDraft=1`,
    );
  }

  return (
    <AdminQuestionMaterialManagement
      defaultView="questions"
      initialKnowledgeNodeFilter={
        typeof knowledgeNodePublicId === "string" ? knowledgeNodePublicId : ""
      }
      questionEditorRoutesEnabled
    />
  );
}
