# Extension Installation View

## Task Description
Implement the installed extensions management view on top of the existing marketplace dashboard.

## Requirements
- Installed extensions view/page/section
- Reusable installed extension list/card component
- Installed extension metadata display
- Installed status indicators
- Enabled/disabled visual state display only
- Update available indicator display only
- Compatibility warning display
- Capability badges/tags
- Empty state when no extensions are installed
- Loading skeletons
- Error state UI

## Implementation Details
- Use existing marketplace dashboard layout
- Reuse extension card patterns where appropriate
- Keep installed-specific UI separate from discover-specific UI where needed
- Maintain type safety
- Avoid duplicated UI logic
- Preserve current navigation behavior
- Keep action buttons disabled or placeholder-only if included

## Expected Features
- Installed extensions list
- Extension cards with metadata
- Status indicators (active/inactive)
- Update availability indicators
- Capability badges
- Empty state handling
- Loading states
- Error states
