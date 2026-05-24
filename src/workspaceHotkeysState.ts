export type WorkspaceHotkey = {
  key: string;
  description: string;
  action: string;
};

const hotkeys: WorkspaceHotkey[] = [
  {
    key: 'Ctrl+P',
    description: 'Open command palette',
    action: 'command-palette',
  },
  {
    key: 'Ctrl+`',
    description: 'Toggle terminal',
    action: 'toggle-terminal',
  },
  {
    key: 'Ctrl+B',
    description: 'Toggle sidebar',
    action: 'toggle-sidebar',
  },
];

export function getWorkspaceHotkeys() {
  return hotkeys;
}
