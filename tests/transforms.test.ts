import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toggleContext, wrapContext, unwrapContext } from '../src/transforms';
import type { EditResult } from '../src/transforms';

function apply(source: string, result: EditResult): string {
	if ('reason' in result) throw new Error(result.reason);
	const lines = source.split('\n');
	lines.splice(result.edit.from, result.edit.to - result.edit.from + 1, result.edit.text);
	return lines.join('\n');
}

await test('wraps the complete paragraph when only its middle line is selected', () => {
	// Given
	const source = 'Before\n\nFirst\nMiddle\nLast\n\nAfter';
	// When
	const result = apply(source, wrapContext(source.split('\n'), 3, 3));
	// Then
	assert.equal(result, 'Before\n\n> [!context]\n> First\n> Middle\n> Last\n\nAfter');
});

await test('preserves Markdown and empty lines when several paragraphs are wrapped', () => {
	// Given
	const source = '**Bold** and `code`\n\n- One\n- Two';
	// When
	const result = apply(source, wrapContext(source.split('\n'), 0, 3));
	// Then
	assert.equal(result, '> [!context]\n> **Bold** and `code`\n>\n> - One\n> - Two');
});

await test('restores content exactly when a generated block is unwrapped', () => {
	// Given
	const source = 'Before\n\n한국어 **본문**\n\n[Link](https://example.com)\n\nAfter';
	const wrapped = apply(source, wrapContext(source.split('\n'), 2, 4));
	// When
	const result = apply(wrapped, unwrapContext(wrapped.split('\n'), 4, 4));
	// Then
	assert.equal(result, source);
});

await test('inserts a typing position when the current paragraph is empty', () => {
	// Given
	const source = [''];
	// When
	const result = wrapContext(source, 0, 0);
	// Then
	assert.deepEqual(result, { edit: { from: 0, to: 0, text: '> [!context]\n> ', cursorLine: 1, cursorCh: 2 } });
});

for (const [name, source, line] of [
	['an existing quote', '> quote', 0],
	['an existing callout', '> [!context]\n> text', 1],
	['fenced code', '```md\nhello\n```', 1],
	['tilde fenced code', '~~~~\nhello\n~~~~', 1],
	['frontmatter', '---\ntitle: note\n---\n\ntext', 1],
	['indented code', '    code', 0],
] as const) {
	await test(`rejects wrapping inside ${name}`, () => {
		// Given
		const lines = source.split('\n');
		// When
		const result = wrapContext(lines, line, line);
		// Then
		assert.ok('reason' in result);
	});
}

await test('preserves nested quotes when the outer context is unwrapped', () => {
	// Given
	const source = '> [!context]\n> Explanation\n>\n> > Nested quote';
	// When
	const result = apply(source, unwrapContext(source.split('\n'), 3, 3));
	// Then
	assert.equal(result, 'Explanation\n\n> Nested quote');
});

await test('leaves the next callout intact when adjacent callouts are unwrapped', () => {
	// Given
	const source = '> [!context]\n> First\n> [!note]\n> Second';
	// When
	const result = apply(source, unwrapContext(source.split('\n'), 1, 1));
	// Then
	assert.equal(result, 'First\n\n> [!note]\n> Second');
});

await test('rejects unwrapping when a selection extends outside the context', () => {
	// Given
	const source = '> [!context]\n> Text\n\nOutside';
	// When
	const result = unwrapContext(source.split('\n'), 1, 3);
	// Then
	assert.ok('reason' in result);
});

await test('does not interpret a callout-looking string inside a code fence', () => {
	// Given
	const source = '```md\n> [!context]\n> Text\n```';
	// When
	const result = unwrapContext(source.split('\n'), 2, 2);
	// Then
	assert.ok('reason' in result);
});

await test('preserves a literal context marker in another callout code sample', () => {
	// Given
	const source = '> [!note]\n> ```md\n> [!context]\n> sample\n> ```';
	// When
	const result = unwrapContext(source.split('\n'), 3, 3);
	// Then
	assert.ok('reason' in result);
});

await test('unwraps the real context while preserving a fenced callout example', () => {
	// Given
	const source = '> [!context]\n> ```md\n> [!context]\n> sample\n> ```\n> Explanation';
	// When
	const result = apply(source, unwrapContext(source.split('\n'), 3, 3));
	// Then
	assert.equal(result, '```md\n[!context]\nsample\n```\nExplanation');
});

await test('ends a quoted fence when the quote ends', () => {
	// Given
	const source = '> ```md\n> sample\n\n> [!context]\n> Explanation';
	// When
	const result = apply(source, unwrapContext(source.split('\n'), 4, 4));
	// Then
	assert.equal(result, '> ```md\n> sample\n\nExplanation');
});

await test('wraps the whole paragraph when toggle runs on plain text', () => {
	// Given
	const source = 'Before\n\nFirst\nSecond\n\nAfter';
	// When
	const result = apply(source, toggleContext(source.split('\n'), 3, 3));
	// Then
	assert.equal(result, 'Before\n\n> [!context]\n> First\n> Second\n\nAfter');
});

await test('unwraps the whole block when toggle runs inside context', () => {
	// Given
	const source = '> [!context]\n> First\n>\n> Second';
	// When
	const result = apply(source, toggleContext(source.split('\n'), 3, 3));
	// Then
	assert.equal(result, 'First\n\nSecond');
});

await test('restores original Markdown when the wrapped block is toggled again', () => {
	// Given
	const source = '**Details**\n\n- One\n- Two';
	const wrapped = apply(source, toggleContext(source.split('\n'), 0, 3));
	// When
	const result = apply(wrapped, toggleContext(wrapped.split('\n'), 1, 1));
	// Then
	assert.equal(result, source);
});

await test('unwraps from code inside a real context while preserving literal headers', () => {
	// Given
	const source = '> [!context]\n> ```md\n> [!context]\n> sample\n> ```';
	// When
	const result = apply(source, toggleContext(source.split('\n'), 3, 3));
	// Then
	assert.equal(result, '```md\n[!context]\nsample\n```');
});

for (const [name, source, start, end] of [
	['leaves a context block', '> [!context]\n> Details\n\nOutside', 1, 3],
	['enters a context block', 'Outside\n\n> [!context]\n> Details', 0, 3],
	['spans two context blocks', '> [!context]\n> First\n\n> [!context]\n> Second', 1, 4],
	['is inside a different callout', '> [!note]\n> Details', 1, 1],
	['contains only a literal code sample', '```md\n> [!context]\n> Details\n```', 2, 2],
] as const) {
	await test(`rejects toggle when the selection ${name}`, () => {
		// Given
		const lines = source.split('\n');
		// When
		const result = toggleContext(lines, start, end);
		// Then
		assert.ok('reason' in result);
	});
}

await test('inserts an empty context block when toggle runs on an empty paragraph', () => {
	// Given
	const source = '';
	// When
	const result = apply(source, toggleContext(source.split('\n'), 0, 0));
	// Then
	assert.equal(result, '> [!context]\n> ');
});
