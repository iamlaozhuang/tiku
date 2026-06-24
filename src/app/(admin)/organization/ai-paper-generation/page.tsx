import { AdminAiGenerationEntryPage } from "@/features/admin/ai-generation/AdminAiGenerationEntryPage";

export default function AdminOrganizationAiPaperGenerationRoutePage() {
  return (
    <AdminAiGenerationEntryPage
      workspace="organization"
      generationKind="paper"
    />
  );
}
