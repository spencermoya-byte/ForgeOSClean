export type CommandPaletteState = {
  open: boolean;
  query: string;
  highlightedIndex: number;
};

let state: CommandPaletteState = {
  open: false,
  query: '',
  highlightedIndex: 0,
};

export function updateCommandPalette(
  update: Partial<CommandPaletteState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-command-palette', {
      detail: state,
    }),
  );

  return state;
}

export function getCommandPaletteState() {
  return state;
}
