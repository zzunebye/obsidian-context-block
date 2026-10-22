import { Notice } from 'obsidian';
import type { Editor, Plugin } from 'obsidian';
import { unwrapContext, wrapContext } from './transforms';
import type { EditResult } from './transforms';

function apply(editor: Editor, transform: (lines: readonly string[], start: number, end: number) => EditResult): void {
	if (editor.listSelections().length > 1) {
		new Notice('Use a single selection for context blocks.');
		return;
	}
	const from = editor.getCursor('from');
	const to = editor.getCursor('to');
	const end = to.line > from.line && to.ch === 0 ? to.line - 1 : to.line;
	const lines = Array.from({ length: editor.lineCount() }, (_, index) => editor.getLine(index));
	const result = transform(lines, from.line, end);
	if ('reason' in result) {
		new Notice(result.reason);
		return;
	}
	const edit = result.edit;
	editor.transaction({ changes: [{ from: { line: edit.from, ch: 0 },
		to: { line: edit.to, ch: editor.getLine(edit.to).length }, text: edit.text }],
		selection: { from: { line: edit.cursorLine, ch: edit.cursorCh } } });
}

export function registerContextCommands(plugin: Plugin): void {
	plugin.addCommand({ id: 'wrap-context', name: 'Wrap selection',
		editorCallback: editor => apply(editor, wrapContext) });
	plugin.addCommand({ id: 'unwrap-context', name: 'Unwrap current block',
		editorCallback: editor => apply(editor, unwrapContext) });
}
