import { AdminQuestionMaterialManagement } from "@/features/admin/question-material-management/AdminQuestionMaterialManagement";

type QuestionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const knowledgeNodePublicId = resolvedSearchParams.knowledgeNodePublicId;

  return (
    <AdminQuestionMaterialManagement
      defaultView="questions"
      initialKnowledgeNodeFilter={
        typeof knowledgeNodePublicId === "string" ? knowledgeNodePublicId : ""
      }
    />
  );
}
