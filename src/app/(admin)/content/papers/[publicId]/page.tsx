import { AdminPaperDetailPage } from "@/features/admin/paper-management/AdminPaperDetailPage";

export default async function PaperDetailRoute({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  return <AdminPaperDetailPage publicId={publicId} />;
}
