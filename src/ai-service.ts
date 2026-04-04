import { requestUrl } from 'obsidian';
import { AIExplainerSettings } from './settings';
import { t } from './i18n';
import { OBSIDIAN_MARKDOWN_PROMPT } from './obsidian-markdown-prompt';

export interface AIResponse {
    explanation: string;
    title?: string;
    tags?: string[];
    folder_path?: string;
}

interface OpenAIChoice {
    message: {
        content: string;
    };
}

interface OpenAIResponse {
    choices: OpenAIChoice[];
}

interface OpenAIModelsResponse {
    data: Array<{ id: string }>;
}

interface GeminiPart {
    text: string;
}

interface GeminiContent {
    parts: GeminiPart[];
}

interface GeminiCandidate {
    content: GeminiContent;
}

interface GeminiResponse {
    candidates: GeminiCandidate[];
}

interface GeminiModelsResponse {
    models: Array<{ name: string }>;
}

interface OllamaModelsResponse {
    models: Array<{ name: string }>;
}

function buildSystemPrompt(settings: AIExplainerSettings, vaultFolders: string[], vaultTags: string[]): string {
    const lang = settings.language;
    let prompt = settings.systemPrompt;

    prompt += `\n\n${OBSIDIAN_MARKDOWN_PROMPT}`;

    prompt += `\n\n${t(lang, 'heading_rule')}`;

    if (vaultTags.length > 0) {
        prompt += `\n\n${t(lang, 'available_tags_header')}:\n${vaultTags.slice(0, 200).join(', ')}`;
        if (vaultTags.length > 200) {
            prompt += ` ...(${t(lang, 'and_more', { count: vaultTags.length - 200 })})`;
        }
        prompt += `\n\n${t(lang, 'tag_instruction')}`;
    }

    prompt += `\n\n${t(lang, 'json_schema_description')}:\n{\n    "explanation": "${t(lang, 'json_schema_explanation')}"`;

    prompt += `,\n    "title": "${t(lang, 'json_schema_title')}"`;

    prompt += `,\n    "tags": ["${t(lang, 'json_schema_tags_example')}"]`;

    if (settings.saveMode === 'ai_selected') {
        prompt += `,\n    "folder_path": "${t(lang, 'json_schema_folder')}"`;
    }

    prompt += '\n}';

    if (settings.saveMode === 'ai_selected' && vaultFolders.length > 0) {
        const root = t(lang, 'root_folder_indicator');
        prompt += `\n\n${t(lang, 'folder_instruction', { root })}\n${t(lang, 'available_folders_header')}:\n- ` + vaultFolders.join('\n- ');
    }

    return prompt;
}

function buildOpenAIUrl(baseUrl: string): string {
    const normalized = baseUrl.replace(/\/+$/, '');
    return `${normalized}/chat/completions`;
}

function buildGeminiUrl(baseUrl: string, apiKey: string): string {
    if (baseUrl.includes('generateContent')) {
        return appendApiKey(baseUrl, apiKey);
    }
    const normalized = baseUrl.replace(/\/+$/, '');
    return `${normalized}/v1beta/models/${encodeURIComponent('model-placeholder')}:generateContent?key=${apiKey}`;
}

function appendApiKey(url: string, apiKey: string): string {
    return url.includes('?') ? `${url}&key=${apiKey}` : `${url}?key=${apiKey}`;
}

function extractContentFromOpenAIResponse(json: OpenAIResponse): string {
    if (!json.choices?.[0]?.message?.content) {
        throw new Error('Unexpected OpenAI-compatible response format: missing choices[0].message.content');
    }
    return json.choices[0].message.content;
}

function extractContentFromGeminiResponse(json: GeminiResponse): string {
    if (!json.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Unexpected Gemini response format: missing candidates[0].content.parts[0].text');
    }
    return json.candidates[0].content.parts[0].text;
}

function stripMarkdownCodeFences(text: string): string {
    return text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
}

function parseAIResponse(contentText: string): AIResponse {
    const cleaned = stripMarkdownCodeFences(contentText);

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
        console.error('Failed to parse JSON response:', contentText);
        throw new Error('The AI did not return a valid JSON format. Check console for details.');
    }

    if (typeof parsed.explanation !== 'string' || parsed.explanation.length === 0) {
        throw new Error("JSON response missing or invalid 'explanation' field.");
    }

    const result: AIResponse = { explanation: parsed.explanation };

    if (typeof parsed.folder_path === 'string') {
        result.folder_path = parsed.folder_path;
    }

    return result;
}

export async function fetchExplanation(text: string, settings: AIExplainerSettings, vaultFolders: string[], vaultTags: string[]): Promise<AIResponse> {
    if (!settings.apiKey && settings.aiProvider !== 'ollama') {
        throw new Error('API Key is missing. Please configure it in settings.');
    }

    const systemPrompt = buildSystemPrompt(settings, vaultFolders, vaultTags);
    const lang = settings.language;
    const userPrompt = `${t(lang, 'explain_this_text')}:\n\n${text}`;

    if (settings.aiProvider === 'gemini') {
        return fetchGemini(userPrompt, settings, systemPrompt);
    }

    return fetchOpenAICompatible(userPrompt, settings, systemPrompt);
}

async function fetchOpenAICompatible(
    userPrompt: string,
    settings: AIExplainerSettings,
    systemPrompt: string,
): Promise<AIResponse> {
    const payload: Record<string, unknown> = {
        model: settings.model,
        messages: [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: userPrompt },
        ],
        response_format: { type: 'json_object' },
    };

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (settings.apiKey) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
    }

    const response = await requestUrl({
        url: buildOpenAIUrl(settings.baseUrl),
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    if (response.status !== 200) {
        throw new Error(`API Error: ${response.status} - ${response.text}`);
    }

    const contentText = extractContentFromOpenAIResponse(response.json as OpenAIResponse);
    return parseAIResponse(contentText);
}

async function fetchGemini(
    userPrompt: string,
    settings: AIExplainerSettings,
    systemPrompt: string,
): Promise<AIResponse> {
    const payload = {
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }],
            },
        ],
        systemInstruction: {
            parts: [{ text: systemPrompt }],
        },
        generationConfig: {
            responseMimeType: 'application/json',
        },
    };

    const urlTemplate = buildGeminiUrl(settings.baseUrl, settings.apiKey);
    const url = urlTemplate.replace('model-placeholder', settings.model);

    const response = await requestUrl({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (response.status !== 200) {
        throw new Error(`API Error: ${response.status} - ${response.text}`);
    }

    const contentText = extractContentFromGeminiResponse(response.json as GeminiResponse);
    return parseAIResponse(contentText);
}

export async function fetchModels(
    provider: string,
    baseUrl: string,
    apiKey: string,
): Promise<string[]> {
    switch (provider) {
        case 'openai':
            return fetchOpenAIModels(baseUrl, apiKey);
        case 'gemini':
            return fetchGeminiModels(baseUrl, apiKey);
        case 'ollama':
            return fetchOllamaModels(baseUrl);
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

async function fetchOpenAIModels(baseUrl: string, apiKey: string): Promise<string[]> {
    const normalized = baseUrl.replace(/\/+$/, '');
    const response = await requestUrl({
        url: `${normalized}/models`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = response.json as OpenAIModelsResponse;
    return data.data.map(m => m.id).sort();
}

async function fetchGeminiModels(baseUrl: string, apiKey: string): Promise<string[]> {
    const normalized = baseUrl.replace(/\/+$/, '');
    const response = await requestUrl({
        url: `${normalized}/v1beta/models?key=${apiKey}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = response.json as GeminiModelsResponse;
    return data.models
        .map(m => m.name.replace('models/', ''))
        .filter(name => name.includes('generateContent') || name.includes('gemini'))
        .sort();
}

async function fetchOllamaModels(baseUrl: string): Promise<string[]> {
    const normalized = baseUrl.replace(/\/+$/, '');
    const response = await requestUrl({
        url: `${normalized}/api/tags`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = response.json as OllamaModelsResponse;
    return data.models.map(m => m.name).sort();
}
