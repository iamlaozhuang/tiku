import { AdminQuestionEditorPage } from "@/features/admin/question-material-management/AdminQuestionEditorPage";

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams?: Promise<{ publishDraft?: string | string[] }>;
}) {
  const [{ publicId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<{ publishDraft?: string | string[] }>({}),
  ]);

  return (
    <AdminQuestionEditorPage
      publishDraft={resolvedSearchParams.publishDraft === "1"}
      questionPublicId={publicId}
    />
  );
}
