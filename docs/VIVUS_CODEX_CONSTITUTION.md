# VIVUS CODEX CONSTITUTION
# Hard Guardrails for Safe Vivus Development

## PRIME DIRECTIVE

Vivus v1 is a PRODUCT, not an architecture exercise.

Architecture exists only to safely support shipping.

If choosing between:
A) more refactoring
B) building real product functionality

Choose B unless architecture actively blocks progress.

---

## ABSOLUTE TASK LOCK

Do exactly the assigned task.

DO NOT:
- expand scope
- improve unrelated systems
- add opportunistic cleanup
- perform “while I’m here” edits

Complete task.
Commit.
Stop.

---

## FILE SCOPE LOCK

Only edit files required for the task.

Before editing:
List:

ALLOWED FILES
BLOCKED FILES

If task can be completed in:
1 file → edit 1 file
2 files → edit 2 files

Do not touch unrelated files.

Allowed scope expansion only if:
1. build broken
2. dependency required
3. explicit justification provided

---

## SOURCE VERIFICATION

Before editing:

1. Read actual source files.
2. Identify ownership.
3. Identify dependencies.
4. Identify exact edit location.
5. Patch minimally.

Never assume:
- file contents
- imports
- JSX structure
- state ownership
- architecture

Inspect first.

---

## MINIMAL PATCH STRATEGY

Fix root cause using smallest safe change.

DO:
- targeted edits
- smallest responsible patch
- preserve working systems

DO NOT:
- rewrite systems unnecessarily
- over-engineer
- expand task scope

---

## BEHAVIOR LOCK

Extractions must preserve behavior.

DO NOT:
- redesign layouts
- change spacing
- alter routes
- alter button behavior
- change plugin behavior
- alter interactions

Allowed:
ownership movement only.

Behavior must remain identical.

---

## UI PRESERVATION LOCK

Vivus UI layout is intentional.

DO NOT alter:
- dock spacing
- composer positioning
- plus button placement
- send button placement
- nav spacing
- workspace layout

unless explicitly requested.

Architecture extraction ≠ UI redesign.

---

## EXTRACTION COMPLETION RULE

Every extraction MUST finish fully.

Required steps:

1. Create component
2. Move rendering logic
3. Replace old usage
4. Remove old implementation
5. Remove obsolete imports
6. Remove duplicate ownership
7. Remove dead code
8. Verify behavior unchanged
9. Stop

Forbidden:
- old + new systems active simultaneously
- duplicate render paths
- duplicate ownership
- unfinished extraction

No new extraction until current one is complete.

---

## NO DUPLICATE OWNERSHIP

Never allow:

old system
+
new system

at the same time.

Example:

Forbidden:
renderWorkspaceContent()
+
<WorkspaceContent />

Only one ownership path allowed.

---

## SAFE SOURCE MODIFICATION

FORBIDDEN:
- broad regex replacement
- blind multiline replacement
- global rewrites
- newline corruption
- malformed source injection

Required:
small targeted edits.

After editing:
re-read modified sections.

---

## NO ASSUMPTIONS

Never invent architecture.

Never guess:
- imports
- component ownership
- dependencies
- state location

Inspect actual source first.

---

## NO REFACTOR HELL

Architecture stabilization is limited.

Allowed only until:
- App.tsx no longer God file
- Workspace segmented
- Builder helpers moved
- major domains isolated

After that:
STOP REFACTORING.

Build product features.

No endless architecture cleanup.

---

## STOP AFTER SUCCESS

Task complete?

STOP.

DO NOT:
- improve unrelated systems
- continue cleanup
- optimize
- reorganize
- continue refactoring

Commit.
Stop.

---

## POST-COMMIT VERIFICATION

After every commit:

1. Verify commit exists.
2. Confirm changed files match scope.
3. Confirm no unrelated files changed.
4. Confirm no duplicate ownership.
5. Confirm no dead code.
6. Confirm stop condition met.

If failed:
fix immediately.

Commit.
Verify commit exists.
Stop.