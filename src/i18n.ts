export type Language = 'en' | 'zh';

export interface LocaleStrings {
    // Plugin UI
    plugin_name: string;
    explain_with_ai: string;
    explain_selected_text_with_ai: string;
    please_select_text: string;
    generating: string;
    linking: string;
    generation_success: string;
    generation_failed: string;

    // Settings
    ai_provider: string;
    ai_provider_desc: string;
    openai_compatible: string;
    google_gemini: string;
    local_ollama: string;
    base_url: string;
    base_url_desc: string;
    api_key: string;
    api_key_desc: string;
    api_key_not_required: string;
    enter_api_key: string;
    model: string;
    model_desc: string;
    fetch_models: string;
    loading: string;
    select_a_model: string;
    loaded_models_count: string;
    failed_to_fetch_models: string;
    system_prompt: string;
    system_prompt_desc: string;
    system_prompt_placeholder: string;
    auto_link_vault: string;
    auto_link_vault_desc: string;
    save_mode: string;
    save_mode_desc: string;
    save_mode_custom: string;
    save_mode_ai_selected: string;
    output_folder: string;
    output_folder_desc: string;
    language: string;
    language_desc: string;
    language_en: string;
    language_zh: string;

    // AI prompt injection
    explain_this_text: string;
    heading_rule: string;
    available_tags_header: string;
    and_more: string;
    tag_instruction: string;
    folder_instruction: string;
    available_folders_header: string;
    json_schema_description: string;
    json_schema_explanation: string;
    json_schema_title: string;
    json_schema_tags_example: string;
    json_schema_folder: string;
    root_folder_indicator: string;

    // File service
    explanation_default_title: string;
    original_context: string;
    source: string;

    // Notice messages
    models_fetch_success: string;
    models_fetch_failed: string;
}

const en: LocaleStrings = {
    plugin_name: 'Dimgaai',
    explain_with_ai: 'Dimgaai',
    explain_selected_text_with_ai: 'Explain selected text with AI',
    please_select_text: 'Please select some text first to explain.',
    generating: 'Generating...',
    linking: 'Linking...',
    generation_success: 'Generated successfully!',
    generation_failed: 'Generation failed',

    ai_provider: 'AI provider',
    ai_provider_desc: 'Select the AI provider format',
    openai_compatible: 'OpenAI compatible',
    google_gemini: 'Google Gemini',
    local_ollama: 'Local Ollama',
    base_url: 'Base URL',
    base_url_desc: 'The API endpoint URL',
    api_key: 'API key',
    api_key_desc: 'Your AI provider API key',
    api_key_not_required: 'Not required for local Ollama',
    enter_api_key: 'Enter your API key',
    model: 'Model',
    model_desc: 'The model name to use',
    fetch_models: 'Fetch models',
    loading: 'Loading...',
    select_a_model: 'Select a model',
    loaded_models_count: 'Loaded {count} models',
    failed_to_fetch_models: 'Failed to fetch models',
    system_prompt: 'System prompt',
    system_prompt_desc: 'The system prompt defining the AI behavior',
    system_prompt_placeholder: 'You are a helpful assistant...',
    auto_link_vault: 'Auto-link vault',
    auto_link_vault_desc: 'Automatically find and replace strict matches of the explained text across all your Markdown files with double links.',
    save_mode: 'Save mode',
    save_mode_desc: 'How should the plugin choose the folder for the new document?',
    save_mode_custom: 'Use a custom static folder',
    save_mode_ai_selected: 'Let AI choose the folder dynamically',
    output_folder: 'Output folder',
    output_folder_desc: 'Static folder to save explanations (e.g., explanations)',
    language: 'Language',
    language_desc: 'Display language for plugin UI and AI output',
    language_en: 'English',
    language_zh: '中文',

    explain_this_text: 'Explain this text',
    heading_rule: 'IMPORTANT: Do NOT repeat the main title as a level-1 heading (# Title) in your explanation content. The title is already set in the frontmatter and as the document heading. Start your explanation content directly at level-2 (##) or lower headings.',
    available_tags_header: 'Existing tags in your vault',
    and_more: '+{count} more',
    tag_instruction: 'Choose relevant tags from the existing vault tags above to maintain consistency, or create new tags if none fit. Do NOT include the # prefix in the tags array.',
    folder_instruction: 'Choose the most appropriate folder from the following list to save this explanation. If none fit, return the root folder "{root}".',
    available_folders_header: 'Available Folders',
    json_schema_description: 'You MUST respond with ONLY a valid JSON object matching this schema',
    json_schema_explanation: 'Your detailed explanation here',
    json_schema_title: 'A concise, descriptive title for this explanation note',
    json_schema_tags_example: 'tag1',
    json_schema_folder: 'one of the available folders from the list below',
    root_folder_indicator: '/',

    explanation_default_title: 'Explanation',
    original_context: 'Original Context',
    source: 'Source',

    models_fetch_success: 'Loaded {count} models',
    models_fetch_failed: 'Failed to fetch models',
};

const zh: LocaleStrings = {
    plugin_name: 'Dimgaai (点解)',
    explain_with_ai: '点解',
    explain_selected_text_with_ai: '用 AI 解释选中文本',
    please_select_text: '请先选中文本再进行解释。',
    generating: '生成中...',
    linking: '链接中...',
    generation_success: '生成成功！',
    generation_failed: '生成失败',

    ai_provider: 'AI 服务商',
    ai_provider_desc: '选择 AI 服务商格式',
    openai_compatible: 'OpenAI 兼容',
    google_gemini: 'Google Gemini',
    local_ollama: '本地 Ollama',
    base_url: '基础 URL',
    base_url_desc: 'API 端点地址',
    api_key: 'API 密钥',
    api_key_desc: '你的 AI 服务商 API 密钥',
    api_key_not_required: '本地 Ollama 无需密钥',
    enter_api_key: '输入你的 API 密钥',
    model: '模型',
    model_desc: '要使用的模型名称',
    fetch_models: '获取模型列表',
    loading: '加载中...',
    select_a_model: '选择模型',
    loaded_models_count: '已加载 {count} 个模型',
    failed_to_fetch_models: '获取模型失败',
    system_prompt: '系统提示词',
    system_prompt_desc: '定义 AI 行为的系统提示词',
    system_prompt_placeholder: '你是一个有用的助手...',
    auto_link_vault: '自动链接笔记库',
    auto_link_vault_desc: '自动在所有 Markdown 文件中查找并替换精确匹配的文本为双链。',
    save_mode: '保存模式',
    save_mode_desc: '插件应如何为新文档选择文件夹？',
    save_mode_custom: '使用自定义静态文件夹',
    save_mode_ai_selected: '让 AI 动态选择文件夹',
    output_folder: '输出文件夹',
    output_folder_desc: '保存解释的静态文件夹（例如 explanations）',
    language: '语言',
    language_desc: '插件界面和 AI 输出的显示语言',
    language_en: 'English',
    language_zh: '中文',

    explain_this_text: '解释以下文本',
    heading_rule: '重要：不要在解释内容中重复主标题作为一级标题（# 标题）。标题已在前置元数据中设置并作为文档标题。直接从二级（##）或更低级别的标题开始你的解释内容。',
    available_tags_header: '笔记库中已有的标签',
    and_more: '还有 {count} 个',
    tag_instruction: '从上方笔记库已有标签中选择相关标签以保持一致性，如果没有合适的可以创建新标签。标签数组中不要包含 # 前缀。',
    folder_instruction: '从以下列表中选择最合适的文件夹来保存此解释。如果没有合适的，返回根文件夹 "{root}"。',
    available_folders_header: '可用文件夹',
    json_schema_description: '你必须仅返回匹配此 schema 的有效 JSON 对象',
    json_schema_explanation: '你的详细解释内容',
    json_schema_title: '为此解释笔记提供一个简洁、描述性的标题',
    json_schema_tags_example: '标签1',
    json_schema_folder: '下方列表中的可用文件夹之一',
    root_folder_indicator: '/',

    explanation_default_title: '解释',
    original_context: '原始上下文',
    source: '来源',

    models_fetch_success: '已加载 {count} 个模型',
    models_fetch_failed: '获取模型失败',
};

export const LOCALES: Record<Language, LocaleStrings> = { en, zh };

export function t(lang: Language, key: keyof LocaleStrings, params?: Record<string, string | number>): string {
    const locale = LOCALES[lang] ?? LOCALES.en;
    let value = locale[key] ?? LOCALES.en[key] ?? key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            value = value.replace(`{${k}}`, String(v));
        }
    }
    return value;
}
