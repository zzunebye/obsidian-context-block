export interface TextEdit {
	readonly from: number;
	readonly to: number;
	readonly text: string;
	readonly cursorLine: number;
	readonly cursorCh: number;
}

export type EditResult = { readonly edit: TextEdit } | { readonly reason: string };

const quote = /^ {0,3}>/;
const context = /^ {0,3}>\s?\[!context\]\s*$/i;
const callout = /^ {0,3}>\s?\[!/;

function protectedLines(lines: readonly string[]): ReadonlySet<number> {
	const result = new Set<number>();
	let fence = '';
	let fenceLength = 0;
	let fenceDepth = 0;
	let frontmatter = lines[0] === '---';
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? '';
		if (frontmatter) {
			result.add(i);
			if (i > 0 && /^(---|\.\.\.)\s*$/.test(line)) frontmatter = false;
			continue;
		}
		let content = line;
		let depth = 0;
		while (quote.test(content)) {
			content = content.replace(/^ {0,3}> ?/, '');
			depth++;
		}
		if (fence && depth < fenceDepth) fence = '';
		const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(content);
		if (fence) {
			result.add(i);
			if (depth === fenceDepth && marker?.[1]?.[0] === fence && marker[1].length >= fenceLength && !marker[2]?.trim()) fence = '';
		} else if (marker?.[1]) {
			result.add(i);
			fence = marker[1][0] ?? '';
			fenceLength = marker[1].length;
			fenceDepth = depth;
		} else if (/^( {4}|\t)/.test(line)) result.add(i);
	}
	return result;
}

export function wrapContext(lines: readonly string[], start: number, end: number): EditResult {
	while (start > 0 && lines[start]?.trim() && lines[start - 1]?.trim()) start--;
	while (end < lines.length - 1 && lines[end]?.trim() && lines[end + 1]?.trim()) end++;
	const protectedSet = protectedLines(lines);
	for (let i = start; i <= end; i++) {
		if (protectedSet.has(i) || quote.test(lines[i] ?? '')) {
			return { reason: 'Select plain paragraphs outside quotes, code blocks, and frontmatter.' };
		}
	}
	const content = lines.slice(start, end + 1).map(line => line ? `> ${line}` : '>');
	if (content.length === 1 && !lines[start]?.trim()) content[0] = '> ';
	return { edit: { from: start, to: end, text: ['> [!context]', ...content].join('\n'),
		cursorLine: start + 1, cursorCh: 2 } };
}

export function unwrapContext(lines: readonly string[], start: number, end: number): EditResult {
	const protectedSet = protectedLines(lines);
	let header = start;
	while (header > 0 && quote.test(lines[header] ?? '') && (!callout.test(lines[header] ?? '') || protectedSet.has(header))) header--;
	if (protectedSet.has(header) || !context.test(lines[header] ?? '')) return { reason: 'Place the cursor inside a context block with a plain [!context] header.' };
	let last = header;
	while (last + 1 < lines.length && quote.test(lines[last + 1] ?? '') && (!callout.test(lines[last + 1] ?? '') || protectedSet.has(last + 1))) last++;
	if (end > last) return { reason: 'Select text inside a single context block.' };
	const content = lines.slice(header + 1, last + 1).map(line => line.replace(/^ {0,3}> ?/, ''));
	const before = header > 0 && !!lines[header - 1]?.trim() ? '\n' : '';
	const after = last + 1 < lines.length && !!lines[last + 1]?.trim() ? '\n' : '';
	return { edit: { from: header, to: last, text: before + content.join('\n') + after,
		cursorLine: header + (before ? 1 : 0), cursorCh: 0 } };
}
