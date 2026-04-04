import { Plugin, Notice, Editor, MarkdownView, MarkdownFileInfo, TFolder } from 'obsidian';
import { AIExplainerSettings, DEFAULT_SETTINGS, AIExplainerSettingTab } from './settings';
import { fetchExplanation } from './ai-service';
import { createExplanationDocument, autoLinkVaultText } from './file-service';
import { t, Language } from './i18n';

export default class AIExplainerPlugin extends Plugin {
    settings: AIExplainerSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new AIExplainerSettingTab(this.app, this));

        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => {
                const selection = editor.getSelection();
                if (selection) {
                    menu.addItem((item) => {
                        item
                            .setTitle(t(this.settings.language, 'explain_with_ai'))
                            .setIcon('bot')
                            .onClick(async () => {
                                await this.handleExplanation(selection, editor, view);
                            });
                    });
                }
            })
        );

        this.addCommand({
            id: 'explain-with-ai',
            name: t(this.settings.language, 'explain_selected_text_with_ai'),
            editorCallback: async (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
                const selection = editor.getSelection();
                if (selection) {
                    await this.handleExplanation(selection, editor, view);
                } else {
                    new Notice(t(this.settings.language, 'please_select_text'));
                }
            }
        });
    }

    lang(): Language {
        return this.settings.language;
    }

    getAllVaultTags(): string[] {
        const tagSet = new Set<string>();
        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            const cache = this.app.metadataCache.getFileCache(file);
            if (cache?.tags) {
                for (const tag of cache.tags) {
                    tagSet.add(tag.tag.replace('#', ''));
                }
            }
            if (cache?.frontmatter?.tags) {
                const fmTags = cache.frontmatter.tags as string | string[] | undefined;
                if (Array.isArray(fmTags)) {
                    fmTags.forEach((t: string) => tagSet.add(t.replace('#', '')));
                } else if (typeof fmTags === 'string') {
                    tagSet.add(fmTags.replace('#', ''));
                }
            }
        }
        return Array.from(tagSet).sort();
    }

    async handleExplanation(selection: string, editor: Editor, view: MarkdownView | MarkdownFileInfo) {
        const lang = this.lang();
        const notice = new Notice(t(lang, 'generating'), 0);
        try {
            let vaultFolders: string[] = [];
            if (this.settings.saveMode === 'ai_selected') {
                vaultFolders = this.app.vault.getAllLoadedFiles()
                    .filter(file => file instanceof TFolder)
                    .map(folder => folder.path);
            }

            const vaultTags = this.getAllVaultTags();

            const aiResponse = await fetchExplanation(selection, this.settings, vaultFolders, vaultTags);
            const sourceFileName = view.file ? view.file.basename : 'Unknown Source';

            let outputFolder = this.settings.outputFolder;
            if (this.settings.saveMode === 'ai_selected' && aiResponse.folder_path) {
                outputFolder = aiResponse.folder_path === '/' ? '' : aiResponse.folder_path;
            }

            const newFile = await createExplanationDocument(
                this.app,
                outputFolder,
                aiResponse.title || selection,
                aiResponse.explanation,
                selection,
                sourceFileName,
                lang,
                aiResponse.tags
            );

            const linkText = `[[${newFile.basename}|${selection}]]`;
            editor.replaceSelection(linkText);

            if (this.settings.autoLink) {
                await autoLinkVaultText(this.app, selection, newFile, (current, total) => {
                    notice.setMessage(`${t(lang, 'linking')} ${current}/${total}`);
                });
            }

            notice.hide();
            new Notice(t(lang, 'generation_success'));
        } catch (error) {
            notice.hide();
            new Notice(`${t(lang, 'generation_failed')}: ${(error as Error).message}`, 5000);
            console.error(error);
        }
    }

    async loadSettings() {
        const data = await this.loadData() as Partial<AIExplainerSettings>;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
