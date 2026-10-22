# Context Block design

## 1. Purpose
Compact supplementary context within Markdown notes. Screenshots illustrate excess space to remove, not a pixel-match target.

## 2. Integration
Native [!context] callouts in Reading view and Live Preview. Source mode stays editable; other callouts retain their theme styling.

## 3. Tokens
Note font at 90% (75–100% configurable), line height 1.5, uniform 10px padding (4–24px), 6px radius, 1px neutral border. Background uses host text ink at 4% opacity (0–12%); border at 12% (0–30%). Text retains full host contrast.

## 4. Layout
Note width, content-driven height, paragraph/list/code gap 0.5em, surrounding gap 1em. Zero first/last child margins. Keep Korean words together; unbroken long strings can wrap. Code uses the context font size and line height, with 0.5em uniform inner padding. Code and tables scroll. Preserve authored blank code lines.

## 5. Primitives
Context callout hides its title and icon. Content stays visible. Nested context never compounds text shrinking. Settings use native controls and tooltips. No animation.

## 6. Editing
Wrap complete paragraphs in one transaction, preserving content and blank lines. Empty selection wraps current paragraph. Unwrap removes exactly one outer context layer. Reject existing quotes, code fences and frontmatter when wrapping.

## 7. Accessibility
Inherit host fonts, theme colors and zoom. No dimmed text, fixed heights, or motion. Keyboard access through command palette and assignable shortcuts.

## 8. Verification
Build, lint, document transform tests and actual Obsidian rendering, light/dark and narrow/wide. Verify persistence, Undo and unload cleanup.
