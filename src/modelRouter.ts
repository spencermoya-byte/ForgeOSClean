import { getOllamaStatus, pickModel } from './builderOllama';

export type VivusModelRole =
  | 'planner'
  | 'coder'
  | 'vision';

export type RoutedModel = {
  role: VivusModelRole;
  model: string;
};

export async function resolveVivusModels(): Promise<RoutedModel[]> {
  const status = await getOllamaStatus();

  if (!status.ok || !status.models.length) {
    return [];
  }

  return [
    {
      role: 'planner',
      model: pickModel(status.models, 'planner'),
    },
    {
      role: 'coder',
      model: pickModel(status.models, 'coder'),
    },
    {
      role: 'vision',
      model:
        status.models.find((m) =>
          m.name.includes('vl'),
        )?.name ?? 'qwen3-vl:32b',
    },
  ];
}
