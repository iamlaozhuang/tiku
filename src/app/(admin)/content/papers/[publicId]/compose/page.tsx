import { AdminPaperComposerPage } from "@/features/admin/paper-composer/AdminPaperComposerPage";

export default async function PaperComposerRoute({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  return <AdminPaperComposerPage paperPublicId={publicId} />;
}
