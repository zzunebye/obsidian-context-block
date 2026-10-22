import { Plugin } from 'obsidian';
import { registerContextCommands } from './commands';
import { ContextSettingTab, parseSettings } from './settings';
import type { ContextSettings } from './settings';

export default class ContextBlockPlugin extends Plugin {
	settings!: ContextSettings;
	private readonly styles = new Map<Document, HTMLStyleElement>();

	async onload(): Promise<void> {
		this.settings = parseSettings(await this.loadData());
		this.applyStyles(document);
		this.app.workspace.iterateAllLeaves(leaf => this.applyStyles(leaf.view.containerEl.ownerDocument));
		this.registerEvent(this.app.workspace.on('window-open', (_win, window) => this.applyStyles(window.document)));
		this.registerEvent(this.app.workspace.on('window-close', (_win, window) => {
			this.styles.get(window.document)?.remove();
			this.styles.delete(window.document);
		}));
		this.register(() => {
			for (const style of this.styles.values()) style.remove();
			this.styles.clear();
		});
		registerContextCommands(this);
		this.addSettingTab(new ContextSettingTab(this.app, this));
	}

	applyStyles(doc: Document): void {
		let style = this.styles.get(doc);
		if (!style) {
			style = doc.createElement('style');
			doc.head.appendChild(style);
			this.styles.set(doc, style);
		}
		const s = this.settings;
		style.textContent = `body { --context-font-size: ${s.fontSize / 100}em; --context-padding: ${s.padding}px; --context-background: ${s.background}%; --context-border: ${s.border}%; }`;
	}

	async updateSettings(settings: ContextSettings): Promise<void> {
		this.settings = settings;
		for (const doc of this.styles.keys()) this.applyStyles(doc);
		await this.saveData(settings);
	}
}
