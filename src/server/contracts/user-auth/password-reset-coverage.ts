export type PasswordResetCoverageBoundary = {
  adminMediatedReset: "implemented";
  selfServiceReset: "future_product_decision_required";
};

export function createPasswordResetCoverageBoundary(): PasswordResetCoverageBoundary {
  return {
    adminMediatedReset: "implemented",
    selfServiceReset: "future_product_decision_required",
  };
}
