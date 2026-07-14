import { AdminMaterialEditorPage } from "@/features/admin/question-material-management/AdminMaterialEditorPage";

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return <AdminMaterialEditorPage materialPublicId={publicId} />;
}
