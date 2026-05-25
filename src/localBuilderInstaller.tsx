// Legacy Local Builder DOM injector disabled.
//
// The old LocalBuilderCoordinatorPanel was force-injecting
// itself into `.builder-workspace` and wiping App.tsx-owned UI:
//
// mountedElement.innerHTML = ""
//
// Rendering ownership now belongs to the Vivus shell
// through App.tsx + feature modules.
//
// Builder functionality should be rendered intentionally
// through the shell architecture, not injected into the DOM.

export function startLocalBuilderInstaller() {
  // Intentionally disabled.
  return;
}