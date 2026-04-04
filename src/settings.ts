import { App, Notice, PluginSettingTab, Setting, DropdownComponent, TextComponent } from 'obsidian';
import type AIExplainerPlugin from './main';
import { fetchModels } from './ai-service';
import { Language, t } from './i18n';

export interface AIExplainerSettings {
    aiProvider: AIProvider;
    baseUrl: string;
    apiKey: string;
    model: string;
    systemPrompt: string;
    saveMode: string;
    outputFolder: string;
    autoLink: boolean;
    language: Language;
}

type AIProvider = 'openai' | 'gemini' | 'ollama';

interface ProviderDefaults {
    baseUrl: string;
    model: string;
    needsApiKey: boolean;
}

const PROVIDER_DEFAULTS: Record<AIProvider, ProviderDefaults> = {
    openai: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        needsApiKey: true,
    },
    gemini: {
        baseUrl: 'https://generativelanguage.googleapis.com',
        model: 'gemini-2.0-flash',
        needsApiKey: true,
    },
    ollama: {
        baseUrl: 'http://localhost:11434',
        model: 'llama3',
        needsApiKey: false,
    },
};

export const DEFAULT_SETTINGS: AIExplainerSettings = {
    aiProvider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    systemPrompt: 'You are a helpful assistant. Explain the provided text clearly and concisely.',
    saveMode: 'custom',
    outputFolder: 'Explanations',
    autoLink: false,
    language: 'en',
};

export class AIExplainerSettingTab extends PluginSettingTab {
    plugin: AIExplainerPlugin;
    private modelDropdown: DropdownComponent | null = null;
    private modelText: TextComponent | null = null;
    private availableModels: string[] = [];
    private isLoadingModels = false;

    constructor(app: App, plugin: AIExplainerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        this.renderLanguageSetting();
        this.renderProviderSetting();
        this.renderBaseUrlSetting();
        this.renderApiKeySetting();
        this.renderModelSetting();
        this.renderSystemPromptSetting();
        this.renderAutoLinkSetting();
        this.renderSaveModeSetting();
    }

    private lang(): Language {
        return this.plugin.settings.language;
    }

    private renderLanguageSetting() {
        const lang = this.lang();
        new Setting(this.containerEl)
            .setName(t(lang, 'language'))
            .setDesc(t(lang, 'language_desc'))
            .addDropdown(dropdown => dropdown
                .addOption('en', t(lang, 'language_en'))
                .addOption('zh', t(lang, 'language_zh'))
                .setValue(lang)
                .onChange(async (value: Language) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                    this.display();
                }));
    }

    private renderProviderSetting() {
        const lang = this.lang();
        new Setting(this.containerEl)
            .setName(t(lang, 'ai_provider'))
            .setDesc(t(lang, 'ai_provider_desc'))
            .addDropdown(dropdown => dropdown
                .addOption('openai', t(lang, 'openai_compatible'))
                .addOption('gemini', t(lang, 'google_gemini'))
                .addOption('ollama', t(lang, 'local_ollama'))
                .setValue(this.plugin.settings.aiProvider)
                .onChange(async (value: AIProvider) => {
                    this.plugin.settings.aiProvider = value;
                    const defaults = PROVIDER_DEFAULTS[value];

                    if (this.plugin.settings.baseUrl === '' ||
                        this.providerChangedFromDefaults(this.plugin.settings.baseUrl)) {
                        this.plugin.settings.baseUrl = defaults.baseUrl;
                    }

                    if (this.plugin.settings.model === '' ||
                        this.modelIsFromPreviousProvider(this.plugin.settings.model)) {
                        this.plugin.settings.model = defaults.model;
                    }

                    await this.plugin.saveSettings();
                    this.display();
                }));
    }

    private providerChangedFromDefaults(currentUrl: string): boolean {
        const defaults = PROVIDER_DEFAULTS[this.plugin.settings.aiProvider];
        return currentUrl !== defaults.baseUrl &&
            !currentUrl.includes(defaults.baseUrl.replace('https://', '').replace('http://', ''));
    }

    private modelIsFromPreviousProvider(currentModel: string): boolean {
        const provider = this.plugin.settings.aiProvider;
        const defaults = PROVIDER_DEFAULTS[provider];
        const knownModels = Object.values(PROVIDER_DEFAULTS)
            .filter(d => d !== defaults)
            .flatMap(d => [d.model]);

        return knownModels.includes(currentModel);
    }

    private renderBaseUrlSetting() {
        const lang = this.lang();
        new Setting(this.containerEl)
            .setName(t(lang, 'base_url'))
            .setDesc(t(lang, 'base_url_desc'))
            .addText(text => text
                .setPlaceholder(PROVIDER_DEFAULTS[this.plugin.settings.aiProvider].baseUrl)
                .setValue(this.plugin.settings.baseUrl)
                .onChange(async (value) => {
                    this.plugin.settings.baseUrl = value;
                    await this.plugin.saveSettings();
                }));
    }

    private renderApiKeySetting() {
        const lang = this.lang();
        const { aiProvider } = this.plugin.settings;
        const needsKey = PROVIDER_DEFAULTS[aiProvider].needsApiKey;

        const setting = new Setting(this.containerEl)
            .setName(t(lang, 'api_key'))
            .setDesc(aiProvider === 'ollama'
                ? t(lang, 'api_key_not_required')
                : t(lang, 'api_key_desc'));

        setting.addText(text => {
            text
                .setPlaceholder(t(lang, 'enter_api_key'))
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                });

            if (needsKey) {
                text.inputEl.type = 'password';
            }
        });

        if (!needsKey) {
            setting.setDisabled(true);
        }
    }

    private renderModelSetting() {
        const lang = this.lang();
        const { aiProvider, apiKey } = this.plugin.settings;
        const needsKey = PROVIDER_DEFAULTS[aiProvider].needsApiKey;

        const setting = new Setting(this.containerEl)
            .setName(t(lang, 'model'))
            .setDesc(t(lang, 'model_desc'));

        if (needsKey && apiKey.trim() !== '') {
            setting.addButton(button => {
                button
                    .setButtonText(this.isLoadingModels ? t(lang, 'loading') : t(lang, 'fetch_models'))
                    .setDisabled(this.isLoadingModels)
                    .onClick(async () => {
                        await this.loadAvailableModels();
                    });
            });

            if (this.availableModels.length > 0) {
                setting.addDropdown(dropdown => {
                    this.modelDropdown = dropdown;
                    this.modelText = null;

                    dropdown.addOption('', t(lang, 'select_a_model'));
                    for (const model of this.availableModels) {
                        dropdown.addOption(model, model);
                    }
                    dropdown.setValue(this.plugin.settings.model);
                    dropdown.onChange(async (value) => {
                        if (value) {
                            this.plugin.settings.model = value;
                            await this.plugin.saveSettings();
                        }
                    });
                });
            } else {
                setting.addText(text => {
                    this.modelText = text;
                    this.modelDropdown = null;

                    text
                        .setPlaceholder(PROVIDER_DEFAULTS[aiProvider].model)
                        .setValue(this.plugin.settings.model)
                        .onChange(async (value) => {
                            this.plugin.settings.model = value;
                            await this.plugin.saveSettings();
                        });
                });
            }
        } else {
            setting.addText(text => {
                this.modelText = text;
                this.modelDropdown = null;

                text
                    .setPlaceholder(PROVIDER_DEFAULTS[aiProvider].model)
                    .setValue(this.plugin.settings.model)
                    .onChange(async (value) => {
                        this.plugin.settings.model = value;
                        await this.plugin.saveSettings();
                    });
            });
        }
    }

    private async loadAvailableModels() {
        const lang = this.lang();
        this.isLoadingModels = true;
        this.display();

        try {
            this.availableModels = await fetchModels(
                this.plugin.settings.aiProvider,
                this.plugin.settings.baseUrl,
                this.plugin.settings.apiKey,
            );

            new Notice(t(lang, 'models_fetch_success', { count: this.availableModels.length }));
        } catch (error) {
            new Notice(`${t(lang, 'models_fetch_failed')}: ${(error as Error).message}`, 5000);
            this.availableModels = [];
        } finally {
            this.isLoadingModels = false;
            this.display();
        }
    }

    private renderSystemPromptSetting() {
        const lang = this.lang();
        new Setting(this.containerEl)
            .setName(t(lang, 'system_prompt'))
            .setDesc(t(lang, 'system_prompt_desc'))
            .addTextArea(text => text
                .setPlaceholder(t(lang, 'system_prompt_placeholder'))
                .setValue(this.plugin.settings.systemPrompt)
                .onChange(async (value) => {
                    this.plugin.settings.systemPrompt = value;
                    await this.plugin.saveSettings();
                }));
    }

    private renderAutoLinkSetting() {
        const lang = this.lang();
        new Setting(this.containerEl)
            .setName(t(lang, 'auto_link_vault'))
            .setDesc(t(lang, 'auto_link_vault_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoLink)
                .onChange(async (value) => {
                    this.plugin.settings.autoLink = value;
                    await this.plugin.saveSettings();
                }));
    }

    private renderSaveModeSetting() {
        const lang = this.lang();
        new Setting(this.containerEl)
            .setName(t(lang, 'save_mode'))
            .setDesc(t(lang, 'save_mode_desc'))
            .addDropdown(dropdown => dropdown
                .addOption('custom', t(lang, 'save_mode_custom'))
                .addOption('ai_selected', t(lang, 'save_mode_ai_selected'))
                .setValue(this.plugin.settings.saveMode)
                .onChange(async (value) => {
                    this.plugin.settings.saveMode = value;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.saveMode === 'custom') {
            new Setting(this.containerEl)
                .setName(t(lang, 'output_folder'))
                .setDesc(t(lang, 'output_folder_desc'))
                .addText(text => text
                    .setPlaceholder(t(lang, 'output_folder'))
                    .setValue(this.plugin.settings.outputFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.outputFolder = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }
}
