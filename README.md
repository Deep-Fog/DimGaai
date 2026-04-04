# Dimgaai (点解)

An Obsidian AI plugin that explains selected text and creates linked notes.

## Features

- Editor context menu / Command palette: select text → AI explanation
- Auto-generates a new note with title and source reference
- Optional: auto-link all matching text across vault to the new note
- Supports OpenAI compatible / Google Gemini / Local Ollama
- Bilingual UI (English / Chinese)

## Installation

1. Copy `main.js`, `manifest.json`, and `styles.css` (if any) to `<Vault>/.obsidian/plugins/dimgaai/`
2. Restart Obsidian and enable the plugin under **Settings → Community plugins**

## Development

```bash
npm install
npm run dev      # Watch mode
npm run build    # Production build
```

## Settings

Configure after enabling the plugin:

- **AI provider**: OpenAI compatible / Google Gemini / Local Ollama
- **Base URL / API Key / Model**: fill in according to your provider
- **System prompt**: customize AI behavior
- **Save mode**: custom folder or AI dynamic selection
- **Auto-link vault**: replace all matching text with double links
- **Language**: English / Chinese

---

## 中文

Obsidian AI 插件：划词选中后调用 AI 生成解释，并自动创建双链笔记。
名称来自于粤语“为什么”——“点解”。


### 功能

- 编辑器右键菜单 / 命令面板：选中文本 → AI 解释
- 自动生成带标题、来源引用的新笔记
- 可选：全文自动双链替换
- 支持 OpenAI 兼容 / Google Gemini / 本地 Ollama
- 中英双语界面

### 安装

1. 复制 `main.js`、`manifest.json`、`styles.css`（如有）到 `<Vault>/.obsidian/plugins/dimgaai/`
2. 重启 Obsidian，在 **设置 → 社区插件** 中启用

### 开发

```bash
npm install
npm run dev      # 监听模式
npm run build    # 生产构建
```

### 设置

启用插件后在设置页配置：

- **AI 服务商**：OpenAI 兼容 / Google Gemini / 本地 Ollama
- **Base URL / API Key / 模型**：按服务商填写
- **系统提示词**：自定义 AI 行为
- **保存模式**：自定义文件夹 或 AI 动态选择
- **自动链接笔记库**：开启后全文替换匹配文本为双链
- **语言**：英文 / 中文

---

## LICENSE

This project is licensed under CC BY-NC-SA 4.0 and may not be distributed by anyone for profit.

任何人不得以盈利为目的进行再分发。

## Thanks

Gemini,Qwen,Claude.