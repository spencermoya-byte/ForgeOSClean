export type ComposerMode =
  | 'plan'
  | 'build';

export type AIComposerState = {
  mode: ComposerMode;
  prompt: string;
  attachments: string[];
  sending: boolean;
};

let state: AIComposerState = {
  mode: 'build',
  prompt: '',
  attachments: [],
  sending: false,
};

export function updateAIComposer(
  update: Partial<AIComposerState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-ai-composer', {
      detail: state,
    }),
  );

  return state;
}

export function getAIComposerState() {
  return state;
}
