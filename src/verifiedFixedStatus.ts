import { getVerifiedFixPipeline, updateVerifiedFixPipeline } from './verifiedFixPipelineState';

export type VerifiedFixedResult = {
  ok: boolean;
  status: 'verified-fixed' | 'blocked';
  summary: string;
};

export function resolveVerifiedFixedStatus(pipelineId: string): VerifiedFixedResult {
  const pipeline = getVerifiedFixPipeline(pipelineId);

  if (!pipeline) {
    return {
      ok: false,
      status: 'blocked',
      summary: 'Verified fix pipeline not found.',
    };
  }

  const hasAcceptanceCriteria = pipeline.acceptanceCriteria.length > 0;
  const hasProof = pipeline.proof.length > 0;
  const hasReproduction = pipeline.reproductionSteps.length > 0;

  if (!hasAcceptanceCriteria || !hasProof || !hasReproduction) {
    const missing = [
      !hasAcceptanceCriteria ? 'acceptance criteria' : undefined,
      !hasProof ? 'verification proof' : undefined,
      !hasReproduction ? 'reproduction steps' : undefined,
    ].filter(Boolean).join(', ');

    updateVerifiedFixPipeline(pipelineId, {
      status: 'blocked',
      failureReason: `Cannot mark verified fixed. Missing: ${missing}.`,
    });

    return {
      ok: false,
      status: 'blocked',
      summary: `Cannot mark verified fixed. Missing: ${missing}.`,
    };
  }

  updateVerifiedFixPipeline(pipelineId, {
    status: 'verified-fixed',
    failureReason: undefined,
  });

  return {
    ok: true,
    status: 'verified-fixed',
    summary: 'Verified fixed: reproduction, criteria, and proof are present.',
  };
}
