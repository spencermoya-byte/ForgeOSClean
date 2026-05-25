export type VivusWorkspaceUIProps = {
  activeProject: any;
  buildInput: string;
  setBuildInput: (value: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPreparePatch: () => void;
};
