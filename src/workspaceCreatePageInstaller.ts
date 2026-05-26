import { createWorkspaceFromUserInput } from "./workspaceCreateRuntime";

function findCreateForm(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return null;
  const form = target.closest<HTMLFormElement>("form.home-composer");
  return form;
}

function installWorkspaceCreatePage() {
  if (typeof document === "undefined") return;

  document.addEventListener("submit", async (event) => {
    const form = findCreateForm(event.target);
    if (!form) return;

    const textarea = form.querySelector<HTMLTextAreaElement>("textarea");
    const value = textarea?.value.trim() ?? "";
    if (!value) return;

    const result = await createWorkspaceFromUserInput(value);
    if (!result.created) return;

    event.preventDefault();
    event.stopPropagation();
    if (textarea) textarea.value = "";
    window.location.hash = "/workspace";
  }, true);
}

let started = false;

export async function startWorkspaceCreatePageInstaller() {
  if (started) return;
  started = true;
  installWorkspaceCreatePage();
}



