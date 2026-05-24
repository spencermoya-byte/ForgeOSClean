export type ProjectTreeNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  expanded?: boolean;
};

let projectTree: ProjectTreeNode[] = [];

export function setProjectTree(
  nodes: ProjectTreeNode[],
) {
  projectTree = nodes;

  window.dispatchEvent(
    new CustomEvent('vivus-project-tree', {
      detail: projectTree,
    }),
  );

  return projectTree;
}

export function getProjectTree() {
  return projectTree;
}
