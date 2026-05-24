import { AI_ROLES, type AiRoleId } from './aiOrchestrationRoles';

export type AvailableAiModel = {
  name: string;
  size?: string;
  modifiedAt?: string;
};

export type AiModelSelection = {
  role: AiRoleId;
  modelName?: string;
  fallbackUsed: boolean;
  reason: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, '');
}

export function selectModelForRole(roleId: AiRoleId, availableModels: AvailableAiModel[]): AiModelSelection {
  const role = AI_ROLES.find((item) => item.id === roleId);

  if (!role) {
    return {
      role: roleId,
      fallbackUsed: true,
      reason: 'Unknown role.',
    };
  }

  const normalizedModels = availableModels.map((model) => ({
    ...model,
    normalizedName: normalize(model.name),
  }));

  for (const hint of role.preferredModelHints) {
    const normalizedHint = normalize(hint);
    const match = normalizedModels.find((model) => model.normalizedName.includes(normalizedHint));
    if (match) {
      return {
        role: roleId,
        modelName: match.name,
        fallbackUsed: false,
        reason: `Matched preferred model hint: ${hint}`,
      };
    }
  }

  const fallback = normalizedModels.find((model) => {
    if (role.requiresVision) return model.normalizedName.includes('vl') || model.normalizedName.includes('llava');
    if (role.requiresCodeContext) return model.normalizedName.includes('coder') || model.normalizedName.includes('qwen');
    return model.normalizedName.includes('qwen') || model.normalizedName.includes('coder');
  });

  return {
    role: roleId,
    modelName: fallback?.name,
    fallbackUsed: true,
    reason: fallback ? 'Used best available fallback model.' : 'No compatible local model found.',
  };
}

export function selectModelsForRoles(availableModels: AvailableAiModel[]) {
  return AI_ROLES.map((role) => selectModelForRole(role.id, availableModels));
}
