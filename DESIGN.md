# Context Block design

## 1. Purpose
Compact supplementary context within Markdown notes. Screenshots illustrate excess space to remove, not a pixel-match target.

## 2. Integration
Native [!context] and [!context-short] callouts in Reading view and Live Preview. Source mode stays editable; other callouts retain their theme styling.

## 3. Tokens
Note font at 90% (75–100% configurable), line height 1.5, uniform 10px padding (4–24px), 6px radius, 1px neutral border. Background uses host text ink at 4% opacity (0–12%); border at 12% (0–30%). Text retains full host contrast.

## 4. Layout
Full-width [!context] and content-width [!context-short], both bounded by note width. Content-driven height, paragraph/list/code gap 0.5em, surrounding gap 1em. Zero first/last child margins. Keep Korean words together; unbroken long strings can wrap. Code uses the context font size and line height, with 0.5em uniform inner padding. Code and tables scroll. Preserve authored blank code lines.

## 5. Primitives
Both context callout types hide their title and icon. Content stays visible. Nested context never compounds text shrinking. Settings use native controls and tooltips. No animation.

## 6. Editing
Wrap complete paragraphs or explicitly quoted blocks in one transaction, preserving content and blank lines. A selection inside a quote expands to its contiguous quoted lines. Preserve existing quote markers as a nested quote, including other callouts and quoted code. Empty selection wraps the current paragraph or quote. Unwrap removes exactly one outer context layer. Reject existing context blocks, standalone code fences and frontmatter when wrapping.

Toggle wrapping uses the same transformations: unwrap when the cursor or selection is inside one context block; otherwise wrap paragraphs or quotes. It recognizes both context callout types. Selections crossing a context boundary or spanning multiple context blocks are rejected. Keep explicit Wrap and Unwrap commands; assign no default hotkeys.

## 7. Accessibility
Inherit host fonts, theme colors and zoom. No dimmed text, fixed heights, or motion. Keyboard access through command palette and assignable shortcuts.

## 8. Verification
Build, lint, document transform tests and actual Obsidian rendering, light/dark and narrow/wide. Verify persistence, Undo and unload cleanup.
