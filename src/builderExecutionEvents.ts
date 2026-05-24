export type BuilderExecutionEventType =
  | "checking-models"
  | "planning"
  | "infer-target"
  | "load-context"
  | "generate-patch"
  | "build-diff"
  | "checkpoint"
  | "apply"
  | "verify"
  | "repair"
  | "rollback"
  | "verified"
  | "blocked";

export type BuilderExecutionEvent = {
  type: BuilderExecutionEventType;
  label: string;
  detail: string;
  status: "active" | "done" | "blocked";
  timestamp: number;
};

const EVENT_NAME = "vivus-builder-execution-event";

export function emitBuilderExecutionEvent(event: Omit<BuilderExecutionEvent, "timestamp">) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<BuilderExecutionEvent>(EVENT_NAME, {
    detail: {
      ...event,
      timestamp: Date.now(),
    },
  }));
}

export function subscribeToBuilderExecutionEvents(handler: (event: BuilderExecutionEvent) => void) {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    handler((event as CustomEvent<BuilderExecutionEvent>).detail);
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
