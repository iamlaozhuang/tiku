import { createHash } from "node:crypto";

import type { RedeemCodePreviewDto } from "../contracts/authorization-contract";
import type {
  PersonalAuthPreviewRow,
  RedeemCodePreviewFacts,
} from "../repositories/redeem-code-authorization-repository";

export type RedeemCodePreviewUnavailableReason =
  | "already_advanced"
  | "expired"
  | "inconsistent"
  | "no_target"
  | "used";

export type RedeemCodePreviewEvaluation =
  | {
      status: "ready";
      data: RedeemCodePreviewDto;
    }
  | {
      status: "unavailable";
      reason: RedeemCodePreviewUnavailableReason;
    };

type EvaluateRedeemCodePreviewInput = RedeemCodePreviewFacts & {
  userPublicId: string;
  checkedAt: Date;
};

const PREVIEW_VERSION_DOMAIN = "tiku:redeem-code-preview:v1";

export function evaluateRedeemCodePreview(
  input: EvaluateRedeemCodePreviewInput,
): RedeemCodePreviewEvaluation {
  const { redeemCode } = input;

  if (
    redeemCode.status === "used" ||
    redeemCode.used_by_user_id !== null ||
    redeemCode.used_at !== null
  ) {
    return {
      status: "unavailable",
      reason:
        redeemCode.status === "used" &&
        redeemCode.used_by_user_id !== null &&
        redeemCode.used_at !== null
          ? "used"
          : "inconsistent",
    };
  }

  if (
    redeemCode.status === "expired" ||
    (redeemCode.redeem_deadline_at !== null &&
      redeemCode.redeem_deadline_at < input.checkedAt)
  ) {
    return { status: "unavailable", reason: "expired" };
  }

  const redeemDeadlineAt = redeemCode.redeem_deadline_at?.toISOString() ?? null;

  const resultEdition =
    redeemCode.redeem_code_type === "personal_standard_activation"
      ? "standard"
      : "advanced";
  const upgradeTargets =
    redeemCode.redeem_code_type === "edition_upgrade"
      ? evaluateUpgradeTargets(input)
      : [];

  if (upgradeTargets === "already_advanced") {
    return { status: "unavailable", reason: "already_advanced" };
  }

  if (upgradeTargets === "no_target") {
    return { status: "unavailable", reason: "no_target" };
  }

  const versionFacts = {
    domain: PREVIEW_VERSION_DOMAIN,
    userPublicId: input.userPublicId,
    redeemCode: {
      publicId: redeemCode.public_id,
      status: redeemCode.status,
      redeemCodeType: redeemCode.redeem_code_type,
      profession: redeemCode.profession,
      level: redeemCode.level,
      durationDay: redeemCode.duration_day,
      redeemDeadlineAt,
      updatedAt: redeemCode.updated_at.toISOString(),
    },
    resultEdition,
    upgradeTargets: upgradeTargets.map((target) => ({
      personalAuthPublicId: target.personalAuthPublicId,
      sourceEdition: target.sourceEdition,
      startsAt: target.startsAt,
      expiresAt: target.expiresAt,
      updatedAt: target.updatedAt,
    })),
  };

  return {
    status: "ready",
    data: {
      redeemCodeType: redeemCode.redeem_code_type,
      profession: redeemCode.profession,
      level: redeemCode.level,
      resultEdition,
      durationDay: redeemCode.duration_day,
      redeemDeadlineAt,
      previewVersion: `sha256:${createHash("sha256")
        .update(JSON.stringify(versionFacts))
        .digest("hex")}`,
      upgradeTargets: upgradeTargets.map((target) => ({
        personalAuthPublicId: target.personalAuthPublicId,
        sourceEdition: target.sourceEdition,
        startsAt: target.startsAt,
        expiresAt: target.expiresAt,
      })),
    },
  };
}

function evaluateUpgradeTargets(input: EvaluateRedeemCodePreviewInput):
  | Array<{
      personalAuthPublicId: string;
      sourceEdition: "standard";
      startsAt: string;
      expiresAt: string;
      updatedAt: string;
    }>
  | "already_advanced"
  | "no_target" {
  if (
    input.activePersonalAuths.some(
      (personalAuth) => personalAuth.edition === "advanced",
    ) ||
    input.activeUpgradedPersonalAuthPublicIds.length > 0
  ) {
    return "already_advanced";
  }

  const targets = input.activePersonalAuths
    .filter(isStandardPersonalAuth)
    .map((personalAuth) => ({
      personalAuthPublicId: personalAuth.public_id,
      sourceEdition: "standard" as const,
      startsAt: personalAuth.starts_at.toISOString(),
      expiresAt: personalAuth.expires_at.toISOString(),
      updatedAt: personalAuth.updated_at.toISOString(),
    }))
    .sort((left, right) =>
      left.personalAuthPublicId.localeCompare(right.personalAuthPublicId),
    );

  return targets.length === 0 ? "no_target" : targets;
}

function isStandardPersonalAuth(
  personalAuth: PersonalAuthPreviewRow,
): personalAuth is PersonalAuthPreviewRow & { edition: "standard" } {
  return personalAuth.edition === "standard";
}
