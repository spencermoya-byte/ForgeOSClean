import { getCommandPaletteState } from './commandPaletteState';
import { executePaletteAction } from './commandPaletteActions';

export function initializeCommandPaletteRuntime() {
  return getCommandPaletteState();
}

export function runCommandPaletteAction(
  action: string,
) {
  return executePaletteAction(action);
}
