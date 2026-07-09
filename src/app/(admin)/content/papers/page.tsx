import { AdminPaperManagement } from "@/features/admin/paper-management/AdminPaperManagement";

type PapersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PapersPage({ searchParams }: PapersPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const paperPublicId = resolvedSearchParams.paperPublicId;

  return (
    <AdminPaperManagement
      initialPaperPublicId={
        typeof paperPublicId === "string" ? paperPublicId : ""
      }
    />
  );
}
