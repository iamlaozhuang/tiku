export type OrganizationTrainingPersistenceConflictKind =
  | "draft_save_conflict"
  | "publish_conflict"
  | "answer_draft_conflict"
  | "answer_submit_conflict";

export class OrganizationTrainingPersistenceConflictError extends Error {
  readonly kind: OrganizationTrainingPersistenceConflictKind;

  constructor(kind: OrganizationTrainingPersistenceConflictKind) {
    super(`Organization training persistence conflict: ${kind}.`);
    this.name = "OrganizationTrainingPersistenceConflictError";
    this.kind = kind;
  }
}

export function isOrganizationTrainingPersistenceConflictError(
  error: unknown,
): error is OrganizationTrainingPersistenceConflictError {
  return error instanceof OrganizationTrainingPersistenceConflictError;
}
