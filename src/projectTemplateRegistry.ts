export type ProjectTemplate = {
  id: string;
  name: string;
  description: string;
  stack: string[];
};

const templates: ProjectTemplate[] = [
  {
    id: 'tauri-react-ts',
    name: 'Tauri + React + TypeScript',
    description:
      'Desktop-first local app foundation.',
    stack: [
      'tauri',
      'react',
      'typescript',
      'vite',
    ],
  },
  {
    id: 'react-ts',
    name: 'React + TypeScript',
    description: 'Frontend application starter.',
    stack: [
      'react',
      'typescript',
      'vite',
    ],
  },
];

export function listProjectTemplates() {
  return templates;
}
