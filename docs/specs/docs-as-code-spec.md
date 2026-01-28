---
title: "Docs as Code 系統規格"
date: "2026-01-28"
author: "Henry Lau"
status: approved
version: "1.0.0"
tags: ["docs-as-code", "infrastructure", "ci-cd"]
---

# OVERVIEW

本規格描述 Docs as Code 基礎設施的技術實現，使 Oh-My-OpenCode (OMO) 能在協助開發時自動產生符合標準的技術文檔。

## 目標

- 標準化文檔格式：統一 YAML frontmatter 結構
- 自動化驗證：CI/CD 流程驗證文檔品質
- 文檔網站：VitePress 靜態網站生成與部署

# STRUCTURE

## 目錄結構

```
omo-docs/
├── docs/
│   ├── .schemas/          # JSON Schema 驗證定義
│   ├── .templates/        # 文檔模板
│   ├── .vitepress/        # VitePress 配置
│   ├── specs/             # 技術規格文檔
│   ├── prd/               # 產品需求文檔
│   ├── api/               # API 規格文檔
│   ├── changelog/         # 變更記錄
│   └── plans/             # 工作計劃
├── scripts/
│   └── validate-frontmatter.mjs
└── .github/
    └── workflows/
        └── docs.yml
```

## 驗證流程

1. **Frontmatter Schema 驗證**: 使用 AJV 驗證 YAML frontmatter
2. **Markdown Lint**: markdownlint-cli2 檢查格式
3. **死鏈接檢查**: Lychee 掃描壞連結
4. **文風檢查**: Vale + write-good 風格指南

## 部署架構

- **觸發條件**: Push 到 `main` 分支
- **建置工具**: VitePress
- **部署目標**: GitHub Pages
- **URL**: `https://henrylau1103.github.io/omo-docs/`

# CONVENTIONS

## Frontmatter 必填欄位

每種文檔類型有 6 個必填欄位，共同欄位為：

| 欄位 | 類型 | 說明 |
|------|------|------|
| title | string | 文檔標題 |
| date | string | ISO 日期 (YYYY-MM-DD) |
| author | string | 作者名稱 |

## 命名規範

- 文件名：kebab-case（如 `docs-as-code-spec.md`）
- 無日期前綴
- 使用有意義的 slug

## 驗證模式

採用**警告模式**：驗證失敗不阻止部署，但會在 CI log 中顯示錯誤。僅 VitePress build 失敗會阻止部署。
