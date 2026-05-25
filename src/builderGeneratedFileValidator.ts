export type GeneratedFileValidationResult = {
  ok: boolean;
  issues: string[];
};

function hasLikelyExplanation(content: string) {
  const trimmed = content.trim().toLowerCase();
  return (
    trimmed.startsWith("here") ||
    trimmed.startsWith("sure") ||
    trimmed.includes("i changed") ||
    trimmed.includes("explanation") ||
    trimmed.includes("```")
  );
}

function extension(path: string) {
  const match = path.match(/\.([^.]+)$/);
  return match?.[1]?.toLowerCase() ?? "";
}

export function validateGeneratedFile(relativePath: string, content: string): GeneratedFileValidationResult {
  const issues: string[] = [];
  const ext = extension(relativePath);
  const trimmed = content.trim();

  if (!trimmed) {
    issues.push("Generated file content is empty.");
  }

  if (hasLikelyExplanation(trimmed)) {
    issues.push("Generated output appears to contain explanation or markdown instead of only file content.");
  }

  if (["tsx", "ts", "jsx", "js"].includes(ext)) {
    const opens = (trimmed.match(/[({[]/g) ?? []).length;
    const closes = (trimmed.match(/[)}\]]/g) ?? []).length;
    if (Math.abs(opens - closes) > 8) {
      issues.push("Generated source has suspiciously unbalanced brackets.");
    }

    if (trimmed.includes("export default") && trimmed.includes("module.exports")) {
      issues.push("Generated source mixes ES module and CommonJS export styles.");
    }
  }

  if (ext === "json") {
    try {
      JSON.parse(trimmed);
    } catch {
      issues.push("Generated JSON is invalid.");
    }
  }

  if (trimmed.length < 12) {
    issues.push("Generated file content is too small to be a safe replacement.");
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}
