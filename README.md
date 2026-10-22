# Context Block

Compact supplementary information for Obsidian Markdown notes.

```markdown
> [!context]
> Linux Namespace와는 다른 수준의 개념임을 명시하자.
```

Reading view and Live Preview render a title-free block with equal padding on every side. Text inherits the note font at 90% of its size. Links, emphasis, lists and inline code use Obsidian's native Markdown renderer.

## Commands

- **Context Block: Wrap selection** wraps the selected paragraphs. A partial paragraph selection expands to the full paragraph. With no selection, it wraps the current paragraph; on an empty line it inserts an empty block.
- **Context Block: Unwrap current block** unwraps the block containing the cursor. The selection must stay inside one block. Nested quotes remain intact.

Both commands use one editor transaction and support Undo/Redo. Assign shortcuts under **Settings → Hotkeys**.

Wrapping rejects existing blockquotes, frontmatter, fenced code and indented code. Use a plain `> [!context]` header for blocks you want to unwrap with the command. Source mode retains normal Markdown syntax.

## Appearance

Under **Settings → Context Block**, configure:

| Setting | Default | Range |
| --- | --- | --- |
| Text size | 90% of note text | 75–100% |
| Padding | 10px on all sides | 4–24px |
| Background strength | 4% | 0–12% |
| Border strength | 12% | 0–30% |

Colors follow the active theme. Changes apply immediately and persist across restarts. **Reset to defaults** restores the appearance. Other callout types keep their existing styles.

Disabling the plugin leaves valid callout Markdown in the note. Obsidian then renders it as a regular callout.

## Local installation

Requires Obsidian 1.8.9 or newer.

1. Run `npm install` and `npm run build`.
2. Create `<Vault>/.obsidian/plugins/context-block/`.
3. Copy `main.js`, `manifest.json`, and `styles.css` into that folder.
4. Reload Obsidian and enable **Context Block** under **Settings → Community plugins**.

## Development

- `npm run dev`: watch and rebuild.
- `npm run build`: type check and production bundle.
- `npm run lint`: lint.
- `npm test`: document transformation regression tests.

No network requests, telemetry or external services are used by the plugin. The implementation uses browser-compatible APIs; actual iOS/Android device testing has not been performed.

Based on the official [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin).
