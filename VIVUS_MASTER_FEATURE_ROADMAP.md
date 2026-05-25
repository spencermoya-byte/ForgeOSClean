# Vivus Master Feature Roadmap

This document is the master source of truth for the planned Vivus feature set.

## Core Vision

- Fully local-first AI software engineering platform
- Privacy-first / offline-first architecture
- No mandatory cloud AI dependency
- Beginner-friendly + advanced developer capable
- Professional/native desktop feel
- High-quality implementation over quick hacks
- Verified fixes instead of AI guessing

## Core Stack

- Tauri desktop app
- React + TypeScript + Tailwind frontend
- Rust backend
- Monaco editor
- xterm.js terminal
- Vite
- Ollama local model runtime

## AI Architecture

### Local-First AI
- Fully local AI operation
- No required cloud inference
- Local orchestration system
- Multi-model routing
- Planner/Coder/Vision specialization
- Role-based model assignment
- Guardrails against off-task behavior
- Minimal patch strategy
- Active source verification
- No collateral changes

### Adaptive Best-Model Routing Toggle
- Toggle to automatically choose the best available local model
- Task-aware routing
- Automatic model switching
- Manual override option
- Local-only model selection

Task routing categories:
- UI
- UX
- Frontend
- Backend
- Shell / terminal
- Code generation
- Visual reasoning
- Chatting
- Language/writing
- Planning
- Debugging
- Verification

Expected behavior:
- Detect task intent
- Inspect installed Ollama models
- Rank best available model
- Automatically switch model
- Explain model selection
- Fall back safely when unavailable

### Vision System
- Built-in local image understanding
- Screenshot understanding
- UI debugging
- Diagram understanding
- CAD screenshot understanding
- Document/image understanding
- Local file understanding
- Preferred vision model: qwen3-vl:32b
- Fallback local vision models supported

## Planning System

### Plan Mode
- Collaborative requirements planning
- Define specs before code generation
- User approval required before building
- Architecture planning
- Feature planning
- Constraint definition
- Iterative refinement

## Live Preview System

### Standard Live Preview
- Embedded preview
- Fast updates
- Live reload
- Multi-app support

### True AI Live Canvas
- Sandbox preview before file writes
- Real-time streamed UI/code generation
- Preview before commit
- Approve/reject generated changes
- Diff + rollback support
- Xcode-style live preview workflow

### Live Preview Annotation / Markup
- Draw directly on preview
- Circle UI problems
- Underline issues
- Mark layout bugs
- AI interprets markup
- AI fixes marked areas
- Auto-clear annotations after verified fixes

## Verified Debugging / Guaranteed Fix Workflow
- Bug reproduction
- Acceptance criteria
- Root-cause diagnosis
- Minimal safe patching
- Automated verification
- Build verification
- Lint verification
- Run verification
- Screenshot/UI verification
- Loop detection
- Rollback on failure
- Escalation when not fixed
- Verified Fixed status only after objective proof

## Safety / Permission Layer
- Permission system
- Safety system
- File protections
- Destructive action guardrails
- Protected execution flow
- App self-protection
- Vivus cannot access its own app files/repo during Builder execution
- Approval-before-write system

## Workspace System
- Multi-project management
- Multi-workspace management
- Workspace shell
- Project switching
- Embedded preview per project
- Workspace memory

## Memory System
- Local memory system
- Project memory
- Context persistence
- Session continuity
- Local indexing

## Time Machine / Rollback
- Full rollback system
- Restore checkpoints
- File recovery
- Safe experimentation
- Recovery after failed patches

## Visual Diff System
- Human-readable diffs
- Before/after comparisons
- Visual UI diffs
- File diffs
- Patch review system

## Autonomy System

### Light Autonomy
- High user involvement
- Frequent approvals
- Limited AI freedom

### Medium Autonomy
- More AI independence
- Periodic checkpoints
- Moderate approvals

### Full Autonomy
- Minimal user involvement
- AI builds from specifications
- Safety guardrails remain enabled

### Advanced Custom Autonomy
- Granular permissions
- File creation control
- Package install permissions
- Terminal permissions
- Delete permissions
- Commit permissions

## Agent Transparency
- Activity panel
- Current task visibility
- Changed file visibility
- Elapsed time
- Confidence indicators
- Transparent reasoning summaries

## Secrets / Environment Manager
- Environment variables
- Secret storage
- Secure local management
- Permission-based access

## Plugin Marketplace
- Plugin system
- Sandboxed plugins
- Marketplace rules
- Local plugin support

## Editor Experience
- Monaco editor integration
- Multi-file editing
- Tabs
- State restoration
- Fast navigation

## Terminal Experience
- Embedded terminal
- Terminal orchestration
- Command execution
- Builder-aware terminal actions

## Performance Goals
- Native-feeling responsiveness
- Instant typing
- Instant tab switching
- Instant resizing
- Fast preview updates
- Professional desktop responsiveness

## Design Principles
- Highest Quality Within Scope
- Minimal safe patching
- Root-cause fixes
- No lazy fixes
- No temporary hacks
- Robust + maintainable architecture
- Stable + scalable systems
