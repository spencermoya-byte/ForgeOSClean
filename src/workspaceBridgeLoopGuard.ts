const BRIDGE_WRITE_KEY = "__vivusWorkspaceBridgeWrite";

type BridgeWindow = Window & {
  __vivusWorkspaceBridgeWrite?: boolean;
};

export function isWorkspaceBridgeWrite() {
  if (typeof window === "undefined") return false;
  return Boolean((window as BridgeWindow)[BRIDGE_WRITE_KEY]);
}

export function withWorkspaceBridgeWrite<T>(operation: () => T): T {
  if (typeof window === "undefined") return operation();

  const target = window as BridgeWindow;
  const previous = target[BRIDGE_WRITE_KEY];
  target[BRIDGE_WRITE_KEY] = true;

  try {
    return operation();
  } finally {
    target[BRIDGE_WRITE_KEY] = previous;
  }
}
