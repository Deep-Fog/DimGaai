import { App, TFile, normalizePath } from 'obsidian';
import { Language, t } from './i18n';

async function createFolderRecursively(app: App, folderPath: string) {
    if (folderPath === '/' || folderPath === '') return;

    const parts = folderPath.split('/');
    let current = '';

    for (const part of parts) {
        current = current === '' ? part : `${current}/${part}`;
        const folder = app.vault.getAbstractFileByPath(current);
        if (!folder) {
            await app.vault.createFolder(current);
        }
    }
}

export async function createExplanationDocument(
    app: App,
    folder: string,
    title: string,
    explanation: string,
    originalText: string,
    sourceFileName: string,
    lang: Language,
    aiTags?: string[]
): Promise<TFile> {
    const sanitizedTitle = title.replace(/[\\/:*?"<>|#^[\]]/g, '').substring(0, 100).trim() || t(lang, 'explanation_default_title');
    let folderPath = normalizePath(folder);

    if (folderPath === '/' || folderPath === '') {
        folderPath = '';
    } else {
        await createFolderRecursively(app, folderPath);
    }

    let filePath = folderPath === '' ? `${sanitizedTitle}.md` : `${folderPath}/${sanitizedTitle}.md`;
    let fileIndex = 1;

    while (app.vault.getAbstractFileByPath(filePath)) {
        filePath = folderPath === '' ? `${sanitizedTitle}-${fileIndex}.md` : `${folderPath}/${sanitizedTitle}-${fileIndex}.md`;
        fileIndex++;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    const tags = aiTags && aiTags.length > 0 
        ? aiTags.map(tag => tag.startsWith('#') ? tag.slice(1) : tag)
        : ['ai-explanation', 'explanation'];
    const tagsYaml = tags.map(tag => `  - ${tag}`).join('\n');
    
    const frontmatter = `---
title: ${sanitizedTitle}
date: ${dateStr}
tags:
${tagsYaml}
aliases:
  - ${sanitizedTitle}
source: "[[${sourceFileName}]]"
---
`;

    const blockquoteLines = originalText.split('\n').map(line => `> ${line}`).join('\n');
    const content = `${frontmatter}# ${sanitizedTitle}\n\n${explanation}\n\n---\n> **${t(lang, 'original_context')}**\n${blockquoteLines}\n\n**${t(lang, 'source')}**: [[${sourceFileName}]]\n`;

    return await app.vault.create(filePath, content);
}

export interface AutoLinkOptions {
    maxModifications?: number;
    signal?: AbortSignal;
}

export interface AutoLinkResult {
    modifiedCount: number;
    scannedCount: number;
    cancelled: boolean;
}

const DEFAULT_MAX_MODIFICATIONS = 100;

export async function autoLinkVaultText(
    app: App,
    term: string,
    newFile: TFile,
    onProgress?: (current: number, total: number) => void,
    options?: AutoLinkOptions,
): Promise<AutoLinkResult> {
    if (!term || term.trim().length < 2) return { modifiedCount: 0, scannedCount: 0, cancelled: false };

    const maxModifications = options?.maxModifications ?? DEFAULT_MAX_MODIFICATIONS;
    const signal = options?.signal;

    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match term not already inside [[...]] or [...] links.
    // Uses negative lookbehind for [[ and [, negative lookahead for ]] and ].
    // Does NOT use \b (word boundary) since it doesn't work for CJK characters.
    const regex = new RegExp(`(?<!\\[\\[)(?<!\\[)(${escapedTerm})(?!\\]\\])(?!\\])`, 'g');
    const linkText = `[[${newFile.basename}|${term}]]`;

    const files = app.vault.getMarkdownFiles().filter(f => f.path !== newFile.path);
    const total = files.length;
    if (total === 0) return { modifiedCount: 0, scannedCount: 0, cancelled: false };

    const BATCH_SIZE = 5;
    const modifications: { file: TFile; content: string }[] = [];
    let scannedCount = 0;

    for (let i = 0; i < total; i += BATCH_SIZE) {
        if (signal?.aborted) {
            break;
        }

        const batch = files.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
            batch.map(async (file) => {
                const content = await app.vault.read(file);
                const newContent = content.replace(regex, linkText);
                return content !== newContent ? { file, content: newContent } : null;
            }),
        );

        for (const result of results) {
            if (result) {
                if (modifications.length >= maxModifications) {
                    break;
                }
                modifications.push(result);
            }
        }

        scannedCount = Math.min(i + BATCH_SIZE, total);
        onProgress?.(scannedCount, total);
    }

    if (modifications.length > 0 && !(signal?.aborted)) {
        await Promise.all(
            modifications.map(({ file, content }) => app.vault.modify(file, content)),
        );
    }

    return {
        modifiedCount: modifications.length,
        scannedCount,
        cancelled: signal?.aborted ?? false,
    };
}
