import type { ProtectedPatchResult } from "./protectedPatchExecution";

export type VerifiedFixedStatus = "verified-fixed" | "not-fixed" | "rolled-back" | "blocked";

export type VerifiedFixedResult = {
  status: VerifiedFixedStatus;
  verified: boolean;
  message: string;
  evidence: string[];
};

export function enforceVerifiedFixed(result: ProtectedPatchResult): VerifiedFixedResult {
  const evidence: string[] = [];

  if (result.diff.trim()) {
    evidence.push("Diff was generated.");
  }

  if (result.checkpointId) {
    evidence.push(`Checkpoint created: ${result.checkpointId}.`);
  }

  if (result.verification) {
    evidence.push(
      `Verification command ${result.verification.commandId} finished with exit code ${result.verification.exitCode ?? "n/a"}.`,
    );
  }

  if (result.rollback?.attempted) {
    evidence.push(result.rollback.ok ? "Rollback completed." : "Rollback attempted but failed.");
  }

  if (result.blockedReason) {
    return {
      status: result.rollback?.attempted ? "rolled-back" : "blocked",
      verified: false,
      message: result.blockedReason,
      evidence,
    };
  }

  if (result.rollback?.attempted) {
    return {
      status: "rolled-back",
      verified: false,
      message: result.rollback.ok
        ? "Patch was not verified and was rolled back. Builder must not claim success."
        : "Patch was not verified and rollback failed. Manual inspection is required.",
      evidence,
    };
  }

  if (!result.ok) {
    return {
      status: "not-fixed",
      verified: false,
      message: "Patch did not complete successfully. Builder must not claim success.",
      evidence,
    };
  }

  if (!result.changed) {
    return {
      status: "not-fixed",
      verified: false,
      message: "No file changes were applied. Builder must not claim the issue is fixed.",
      evidence,
    };
  }

  if (!result.verification?.ok) {
    return {
      status: "not-fixed",
      verified: false,
      message: "Build verification did not pass. Builder must not claim success.",
      evidence,
    };
  }

  return {
    status: "verified-fixed",
    verified: true,
    message: "Verified Fixed: patch applied, build verification passed, and rollback was not required.",
    evidence,
  };
}
