import { listProjectTree } from "../../builderPatchEngine";

export type ProjectValidationResult = {
  valid: boolean;
  reason?: string;
};

const PROJECT_MARKERS = ["package.json", "Cargo.toml", ".git", "src"];

export async function validateProjectPath(rootPath: string): Promise<ProjectValidationResult> {
  const projectPath = rootPath.trim();
  if (!projectPath) return { valid: false, reason: "Project path is required." };

  const tree = await listProjectTree(projectPath, "");
  if (!tree.ok) {
    return { valid: false, reason: tree.blockedReason ?? "Project path is not readable." };
  }

  const names = new Set(tree.entries.map((entry) => entry.name));
  const hasMarker = PROJECT_MARKERS.some((marker) => names.has(marker));
  if (!hasMarker) {
    return {
      valid: false,
      reason: "Folder must contain package.json, Cargo.toml, .git, or src to be opened as a Vivus workspace.",
    };
  }

  return { valid: true };
}

export function validateProjectName(name: string): ProjectValidationResult {
  if (!name.trim()) return { valid: false, reason: "Project name is required." };
  if (name.trim().length > 80) return { valid: false, reason: "Project name must be 80 characters or less." };
  return { valid: true };
}
