export type MaterialLifecycleBoundary = {
  objectStorageStatus: "blocked";
  rawContentEvidenceStatus: "blocked";
  schemaMigrationStatus: "blocked";
};

export function createMaterialLifecycleBoundary(): MaterialLifecycleBoundary {
  return {
    objectStorageStatus: "blocked",
    rawContentEvidenceStatus: "blocked",
    schemaMigrationStatus: "blocked",
  };
}
