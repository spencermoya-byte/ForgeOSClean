export type VivusTaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed';

export type VivusTask = {
  id: string;
  title: string;
  createdAt: number;
  status: VivusTaskStatus;
  metadata?: Record<string, unknown>;
};

let queue: VivusTask[] = [];

export function queueTask(
  title: string,
  metadata?: Record<string, unknown>,
) {
  const task: VivusTask = {
    id: `task-${Date.now()}`,
    title,
    createdAt: Date.now(),
    status: 'queued',
    metadata,
  };

  queue.push(task);

  window.dispatchEvent(
    new CustomEvent('vivus-task-queue', {
      detail: queue,
    }),
  );

  return task;
}

export function updateTaskStatus(
  taskId: string,
  status: VivusTaskStatus,
) {
  queue = queue.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status,
        }
      : task,
  );

  window.dispatchEvent(
    new CustomEvent('vivus-task-queue', {
      detail: queue,
    }),
  );
}

export function getTaskQueue() {
  return queue;
}
