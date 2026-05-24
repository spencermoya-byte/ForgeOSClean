export type FileSearchState = {
  query: string;
  results: string[];
  searching: boolean;
};

let state: FileSearchState = {
  query: '',
  results: [],
  searching: false,
};

export function updateFileSearchState(
  update: Partial<FileSearchState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-file-search', {
      detail: state,
    }),
  );

  return state;
}

export function getFileSearchState() {
  return state;
}
