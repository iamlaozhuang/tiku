import { AdminAiGenerationEntryPage } from "@/features/admin/ai-generation/AdminAiGenerationEntryPage";

export default function AdminOrganizationAiQuestionGenerationRoutePage() {
  return (
    <AdminAiGenerationEntryPage
      workspace="organization"
      generationKind="question"
    />
  );
}
