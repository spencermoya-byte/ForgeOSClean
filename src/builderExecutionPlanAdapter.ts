import { createBuilderImplementationPlan, type BuilderImplementationPlan } from "./builderImplementationPlan";
import { listProjectTree, type ProjectTreeEntry } from "./builderPatchEngine";

export type BuilderExecutionPlanRequest = {
  projectPath: string;
  userRequest: string;
};

export type BuilderExecutionPlanResult = {
  ok: boolean;
  plan: BuilderImplementationPlan | null;
  selectedRelativePath: string | null;
  planSummary: string;
  blockedReason: string | null;
};

async function collectWorkspaceSourceEntries(projectPath: string): Promise<ProjectTreeEntry[]> {
  const roots = ["src", "src-tauri/src"];
  const entries: ProjectTreeEntry[] = [];

  for (const root of roots) {
    const tree = await listProjectTree(projectPath, root);
    if (!tree.ok) continue;
    entries.push(...tree.entries);
  }

  return entries;
}

function formatPlanSummary(plan: BuilderImplementationPlan) {
  const files = plan.candidateFiles
    .slice(0, 5)
    .map((candidate, index) => `${index + 1}. ${candidate.relativePath} — ${candidate.reason}`)
    .join("\n");

  const checks = plan.acceptanceChecks.map((check) => `- ${check}`).join("\n");
  const blocked = plan.blockedChanges.map((item) => `- ${item}`).join("\n");

  return `${plan.summary}\n\nRisk: ${plan.riskLevel}\n\nCandidate files:\n${files || "No candidate files found."}\n\nAcceptance checks:\n${checks}\n\nBlocked changes:\n${blocked}`;
}

export async function createBuilderExecutionPlan(
  request: BuilderExecutionPlanRequest,
): Promise<BuilderExecutionPlanResult> {
  const userRequest = request.userRequest.trim();

  if (!request.projectPath.trim()) {
    return {
      ok: false,
      plan: null,
      selectedRelativePath: null,
      planSummary: "",
      blockedReason: "Builder execution requires an active workspace path.",
    };
  }

  if (!userRequest) {
    return {
      ok: false,
      plan: null,
      selectedRelativePath: null,
      planSummary: "",
      blockedReason: "Builder execution requires a user request.",
    };
  }

  const entries = await collectWorkspaceSourceEntries(request.projectPath);
  const plan = createBuilderImplementationPlan(request.projectPath, userRequest, entries);
  const selectedRelativePath = plan.candidateFiles[0]?.relativePath ?? null;

  if (!selectedRelativePath) {
    return {
      ok: false,
      plan,
      selectedRelativePath: null,
      planSummary: formatPlanSummary(plan),
      blockedReason: "No safe candidate source file was found for this request.",
    };
  }

  return {
    ok: true,
    plan,
    selectedRelativePath,
    planSummary: formatPlanSummary(plan),
    blockedReason: null,
  };
}
