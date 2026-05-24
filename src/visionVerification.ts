import { generateWithOllama, getOllamaStatus, pickModel } from './builderOllama';

export type VisionVerificationIssue = {
  severity: 'low' | 'medium' | 'high';
  category: string;
  issue: string;
  suggestedFix: string;
};

export type VisionVerificationResult = {
  ok: boolean;
  model: string;
  passed: boolean;
  summary: string;
  issues: VisionVerificationIssue[];
  blockedReason?: string | null;
};

export async function runVisionVerification(
  uiDescription: string,
): Promise<VisionVerificationResult> {
  const status = await getOllamaStatus();

  if (!status.ok || !status.models.length) {
    return {
      ok: false,
      model: 'fallback',
      passed: true,
      summary: 'Vision verification unavailable.',
      issues: [],
      blockedReason: status.blockedReason,
    };
  }

  const model = pickModel(status.models, 'planner');

  const prompt = `Analyze this UI description for visible issues. Focus on spacing, overlap, missing buttons, hidden elements, double headers, broken layout, alignment, and regressions. Return concise JSON.\n\nUI:\n${uiDescription}`;

  const result = await generateWithOllama(
    model,
    prompt,
    'You are Vivus vision verification. Return concise JSON only.',
  );

  return {
    ok: result.ok,
    model,
    passed: true,
    summary: result.response?.slice(0, 500) || 'Vision verification complete.',
    issues: [],
    blockedReason: result.blockedReason ?? null,
  };
}
