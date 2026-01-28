---
title: "Oh-My-OpenCode 配置安裝指南"
description: "為 Sisyphus 和 Document-Writer agents 啟用 Docs-as-Code 支持"
date: 2026-01-28
category: "setup"
---

# Oh-My-OpenCode 配置安裝指南

本指南說明如何為 Oh-My-OpenCode 配置添加 Docs-as-Code 支持，將 `prompt_append` 設定應用於 `sisyphus` 和 `document-writer` agents。

## 概述

該配置包含以下特性：
- **Sisyphus Agent**: 強制使用繁體中文回應，並在處理 Markdown 文件時遵守 Docs-as-Code 規範
- **Document-Writer Agent**: 專注於文檔生成，確保輸出符合 YAML frontmatter 規範和 schema 定義

## 安裝步驟

### 步驟 1: 找到現有配置路徑

根據你的作業系統，找到 Oh-My-OpenCode 配置文件位置：

**Linux / macOS**:
```bash
~/.config/opencode/oh-my-opencode.json
```

**Windows**:
```powershell
$env:USERPROFILE\.config\opencode\oh-my-opencode.json
```

### 步驟 2: 備份現有配置

在修改前，建議先備份現有配置：

```bash
# Linux / macOS
cp ~/.config/opencode/oh-my-opencode.json ~/.config/opencode/oh-my-opencode.json.backup

# Windows PowerShell
Copy-Item -Path "$env:USERPROFILE\.config\opencode\oh-my-opencode.json" -Destination "$env:USERPROFILE\.config\opencode\oh-my-opencode.json.backup"
```

### 步驟 3: 合併設定

參考本專案內的 `assets/oh-my-opencode.example.json` 文件。

**關鍵配置項**：

將下列內容合併到你的 `oh-my-opencode.json` 中：

#### 針對 Sisyphus Agent:
```json
{
  "agents": {
    "sisyphus": {
      "model": "your-provider/your-model",
      "prompt_append": "重要：你必須使用繁體中文回覆所有訊息。若產生/修改docs內Markdown，請遵守Docs-as-Code：輸出單一檔案內容＋YAML frontmatter，欄位需符合對應schema（docs/.schemas/*.schema.json）與模板；缺資訊先提問，不要臆測。並在第一行提供Path: docs/{specs|prd|api|changelog|plans}/<slug>.md。"
    }
  }
}
```

#### 針對 Document-Writer Agent:
```json
{
  "agents": {
    "document-writer": {
      "model": "your-provider/your-model",
      "prompt_append": "輸出文件時遵守Docs-as-Code：回覆為單一Markdown檔內容。最上方必含YAML frontmatter，且需符合對應schema（docs/.schemas/*.schema.json）與templates；缺資訊先提問，不要臆測。並在第一行提供建議存放路徑：Path: docs/{specs|prd|api|changelog|plans}/<slug>.md。查閱docs/.schemas/中對應的schema以確認必填欄位。"
    }
  }
}
```

**重要提示**:
- 替換 `your-provider/your-model` 為你的實際模型配置（如 `github-copilot/gpt-4o`）
- **不要** 替換整個配置文件，只需合併相關的 `prompt_append` 欄位
- 確保 JSON 格式正確（如有逗號分隔符等）

### 步驟 4: 驗證配置生效

在 Oh-My-OpenCode 應用中測試配置：

1. 重啟 Oh-My-OpenCode 應用，確保新配置被載入
2. 嘗試使用 Document-Writer 或 Sisyphus agent 生成文檔
3. 驗證第一行是否為 `Path: docs/...` 格式
4. 檢查生成的 Markdown 是否包含 YAML frontmatter

**CLI 驗證**（如適用）:
```bash
# 檢查配置文件語法
node -e "require('path').resolve(); console.log('Config syntax OK')"

# 或使用 Python
python3 -c "import json; json.load(open('~/.config/opencode/oh-my-opencode.json'))"
```

### 步驟 5: 還原方法

如需回復到原始配置：

```bash
# Linux / macOS
cp ~/.config/opencode/oh-my-opencode.json.backup ~/.config/opencode/oh-my-opencode.json

# Windows PowerShell
Copy-Item -Path "$env:USERPROFILE\.config\opencode\oh-my-opencode.json.backup" -Destination "$env:USERPROFILE\.config\opencode\oh-my-opencode.json"
```

## 常見問題

### Q: 是否需要替換整個 oh-my-opencode.json 文件？

**A**: 不需要。請只合併相關配置欄位。完整替換可能會覆蓋你現有的其他配置。

### Q: prompt_append 的字符限制是多少？

**A**: 建議保持在 500 字符以內。過長的 prompt_append 可能影響性能。

### Q: 若 document-writer 不支持該配置，有備選方案嗎？

**A**: 可以改用 `build` agent 或其他支持自訂 prompt 的 agents。

### Q: 如何確認 prompt_append 是否生效？

**A**: 檢查 agent 輸出的第一行是否符合格式要求（如 `Path: docs/specs/xxx.md`）。

## 相關資源

- 本專案的範例配置: `assets/oh-my-opencode.example.json`
- Oh-My-OpenCode 官方文檔: https://github.com/code-yeongyu/oh-my-opencode
- Docs-as-Code 規範: 參見專案內 `docs/.schemas/` 和 `docs/.templates/`

---

**最後更新**: 2026-01-28
