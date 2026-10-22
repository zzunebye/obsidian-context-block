import { PluginSettingTab, Setting } from 'obsidian';
import type { App } from 'obsidian';
import type ContextBlockPlugin from './main';

export interface ContextSettings {
	readonly fontSize: number;
	readonly padding: number;
	readonly background: number;
	readonly border: number;
}

export const DEFAULT_SETTINGS: ContextSettings = {
	fontSize: 90, padding: 10, background: 4, border: 12,
};

export function parseSettings(data: unknown): ContextSettings {
	const values = typeof data === 'object' && data !== null ? data : {};
	const number = (key: keyof ContextSettings, min: number, max: number): number => {
		const value: unknown = Reflect.get(values, key);
		return typeof value === 'number' && Number.isFinite(value)
			? Math.min(max, Math.max(min, Math.round(value))) : DEFAULT_SETTINGS[key];
	};
	return { fontSize: number('fontSize', 75, 100), padding: number('padding', 4, 24),
		background: number('background', 0, 12), border: number('border', 0, 30) };
}

export class ContextSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: ContextBlockPlugin) {
		super(app, plugin);
	}

	display(): void {
		this.containerEl.empty();
		for (const definition of this.getSettingDefinitions()) {
			const setting = new Setting(this.containerEl).setName(definition.name).setDesc(definition.desc);
			definition.render(setting);
		}
	}

	getSettingDefinitions() {
		return [
			this.slider('fontSize', 'Text size', 'Percentage of the note text size.', 75, 100),
			this.slider('padding', 'Padding', 'Equal space on all four sides, in pixels.', 4, 24),
			this.slider('background', 'Background strength', 'Theme-aware background opacity, in percent.', 0, 12),
			this.slider('border', 'Border strength', 'Theme-aware border opacity, in percent.', 0, 30),
			{ name: 'Reset appearance', desc: 'Restore the default appearance of all context blocks.',
				render: (setting: Setting): void => {
					setting.addButton(button => button.setButtonText('Reset to defaults').onClick(async () => {
						await this.plugin.updateSettings(DEFAULT_SETTINGS);
						const update: unknown = Reflect.get(this, 'update');
						if (typeof update === 'function') update.call(this);
						else this.display();
					}));
				} },
		];
	}

	private slider(key: keyof ContextSettings, name: string, desc: string, min: number, max: number) {
		return { name, desc, render: (setting: Setting): void => {
			setting.addSlider(slider => slider.setLimits(min, max, 1)
				.setValue(this.plugin.settings[key]).setDynamicTooltip()
				.onChange(async value => { await this.plugin.updateSettings({ ...this.plugin.settings, [key]: value }); }));
		} };
	}
}
