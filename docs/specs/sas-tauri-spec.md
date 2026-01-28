---
title: "SAS 股票交易系統技術規格"
date: "2026-01-28"
author: "Henry Lau"
status: approved
version: "1.0.0"
tags: ["tauri", "rust", "react", "trading", "desktop-app"]
---

# OVERVIEW

SAS (Stock Accounting System) 是一套台灣股票交易記錄管理系統，採用 Tauri 2 框架開發的跨平台桌面應用程式。系統以 React 19 + TypeScript 建構前端介面，Rust 實作後端邏輯，使用 CSV 檔案作為資料持久化方案，並整合 TWSE (台灣證券交易所) OpenAPI 取得即時股票資訊。

## 目標用戶

台灣個人投資者，需要記錄與追蹤股票交易的工具。

## 核心價值

- **輕量化**: 無需安裝 Java 或資料庫，單一執行檔即可運行
- **可攜式**: 資料存放於程式旁的 `data/` 目錄，可隨身攜帶
- **相容性**: CSV 格式與舊版 Java 系統相容

# STRUCTURE

## 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   App.tsx   │  │ TodayRecords│  │  ReportDialog   │  │
│  │  交易表單   │  │  今日記錄   │  │    報表產生     │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                │                   │           │
│  ┌──────┴────────────────┴───────────────────┴───────┐  │
│  │                    api.ts                          │  │
│  │              Tauri invoke() 封裝                   │  │
│  └────────────────────────┬──────────────────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                            │ IPC (JSON-RPC)
┌───────────────────────────┼─────────────────────────────┐
│                    Backend (Rust)                        │
│  ┌────────────────────────┴──────────────────────────┐  │
│  │                  commands/mod.rs                   │  │
│  │              Tauri Command Handlers                │  │
│  └─────┬──────────────┬──────────────┬───────────────┘  │
│        │              │              │                   │
│  ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐            │
│  │  domain/  │  │infrastructure│  │  TWSE   │            │
│  │ entities  │  │csv_repository│  │ Service │            │
│  │  error    │  │excel_report  │  │  (API)  │            │
│  └───────────┘  │ data_path    │  └─────────┘            │
│                 └──────────────┘                         │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                    File System                           │
│  data/                                                   │
│  ├── base_data/              # 主檔資料                  │
│  │   ├── 股票.csv            # 股票代號/名稱             │
│  │   ├── 證券商清單.csv      # 券商清單                  │
│  │   ├── 帳號.csv            # 交易帳號                  │
│  │   └── today_stock_data_YYYY-MM-DD.json               │
│  └── trand_data/             # 交易記錄                  │
│      └── YYYY-MM.csv         # 月份分割                  │
└─────────────────────────────────────────────────────────┘
```

## 目錄結構

```
sas-tauri/
├── src/                        # React 前端
│   ├── App.tsx                 # 主元件 - 交易表單
│   ├── api.ts                  # Tauri API 封裝層
│   ├── types.ts                # TypeScript 型別定義
│   └── components/
│       ├── TodayRecords.tsx    # 今日交易列表
│       └── ReportDialog.tsx    # 報表產生對話框
├── src-tauri/                  # Rust 後端
│   ├── src/
│   │   ├── lib.rs              # 入口 + 命令註冊
│   │   ├── main.rs             # Windows subsystem 設定
│   │   ├── domain/
│   │   │   ├── entities.rs     # 業務實體
│   │   │   └── error.rs        # 錯誤型別
│   │   ├── infrastructure/
│   │   │   ├── csv_repository.rs   # CSV 讀寫
│   │   │   ├── data_path.rs        # 路徑解析
│   │   │   ├── excel_report.rs     # Excel 報表
│   │   │   └── twse_service.rs     # TWSE API
│   │   └── commands/
│   │       └── mod.rs          # Tauri 命令
│   └── tauri.conf.json         # Tauri 設定
└── data/                       # 執行期資料
    ├── base_data/              # 主檔
    └── trand_data/             # 交易記錄
```

## 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 框架 | Tauri | 2.x |
| 前端 | React | 19.x |
| 語言 | TypeScript | 5.8 |
| 樣式 | Tailwind CSS | 4.x |
| 建置 | Vite | 7.x |
| 後端 | Rust | stable |
| 序列化 | serde / serde_json | - |
| CSV | csv crate | - |
| Excel | rust_xlsxwriter | - |
| HTTP | reqwest | - |
| 日期 | chrono | - |

# CONVENTIONS

## 領域模型

### TradingRecord (交易記錄)

核心業務實體，記錄單筆股票交易。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | `String` | UUID v4 |
| date | `NaiveDate` | 交易日期 |
| broker | `String` | 證券商名稱 |
| account | `String` | 交易帳號 |
| stockCode | `String` | 股票代號 |
| stockName | `String` | 股票名稱 |
| buyQuantity | `Option<i32>` | 買進股數 |
| buyPrice | `Option<f64>` | 買進單價 |
| buyAmount | `Option<f64>` | 買進金額 |
| buyMargin | `Option<f64>` | 買進融資金額 |
| sellQuantity | `Option<i32>` | 賣出股數 |
| sellPrice | `Option<f64>` | 賣出單價 |
| sellAmount | `Option<f64>` | 賣出金額 |
| sellMargin | `Option<f64>` | 賣出融資金額 |
| isMargin | `bool` | 是否融資交易 |

### Stock (股票)

```rust
pub struct Stock {
    pub code: String,           // 股票代號
    pub name: String,           // 股票名稱
    pub closing_price: Option<f64>, // 收盤價
}
```

### MasterData (主檔資料)

```rust
pub struct MasterData {
    pub brokers: Vec<String>,   // 證券商清單
    pub accounts: Vec<String>,  // 帳號清單
    pub stocks: Vec<Stock>,     // 股票清單
}
```

## API 命令

### 前後端 IPC 介面

| 命令 | 參數 | 回傳 | 說明 |
|------|------|------|------|
| `get_master_data` | - | `MasterData` | 取得券商/帳號/股票清單 |
| `get_stocks` | - | `Vec<Stock>` | 取得股票清單 |
| `save_trade` | `NewTradeRequest` | `TradingRecord` | 儲存交易記錄 |
| `get_today_records` | - | `Vec<TradingRecord>` | 取得今日記錄 |
| `get_records` | start_date, end_date, account?, broker? | `Vec<TradingRecord>` | 查詢記錄 |
| `update_stock_data` | - | `usize` | 更新股票資料 (TWSE) |
| `generate_report` | `ReportRequest` | `String` | 產生 Excel 報表 |
| `get_data_path` | - | `String` | 取得資料目錄路徑 |

## 資料格式

### 交易記錄 CSV

檔案位置: `data/trand_data/YYYY-MM.csv`

```csv
交易日期,證券商,帳號,股票代號,股票名稱,買進股數,買進單價,買進金額,買進融資金額,賣出股數,賣出單價,賣出金額,賣出融資金額,融資
2026-01-28,元大,AAA-123456,2330,台積電,1000,580.00,580000,,,,,,否
```

**重要**: CSV 標頭格式固定，與舊版 Java 系統相容，不可修改。

### 股票清單 CSV

檔案位置: `data/base_data/股票.csv`

```csv
股票代號,股票名稱
2330,台積電
2317,鴻海
```

## 程式碼規範

### Rust 後端

- **架構**: DDD-lite (domain, infrastructure, commands)
- **錯誤處理**: 統一使用 `SasError` enum + `thiserror`
- **序列化**: 跨 FFI 的 struct 必須加 `#[serde(rename_all = "camelCase")]`
- **命令回傳**: `Result<T, String>`，使用 `.map_err(|e| e.to_string())`
- **禁止**: 在 command handler 中使用 `unwrap()` 或 `expect()`

### TypeScript 前端

- **型別**: 在 `types.ts` 中定義，與 Rust struct 對應 (camelCase)
- **API 呼叫**: 透過 `api.ts` 封裝，不直接使用 `invoke()`
- **樣式**: Tailwind CSS 4 (Vite plugin)
- **元件**: 函式元件 + Hooks，PascalCase 檔名

## 外部整合

### TWSE OpenAPI

- **端點**: `https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_AVG_ALL`
- **用途**: 取得上市股票清單與收盤價
- **逾時**: 30 秒
- **頻率限制**: 無官方限制，但建議避免頻繁呼叫

## 可攜模式

應用程式啟動時檢查資料路徑：

1. 優先使用執行檔旁的 `data/` 目錄 (可攜模式)
2. 若不存在，使用 `Documents/SAS-Trading/` (安裝模式)

## 視窗設定

| 屬性 | 值 |
|------|-----|
| 預設大小 | 900 x 700 |
| 最小大小 | 600 x 500 |
| 可調整大小 | 是 |
| 置中顯示 | 是 |

## 建置產出

| 格式 | 說明 |
|------|------|
| NSIS | Windows 安裝程式 (.exe) |
| MSI | Windows Installer 套件 |

支援語言: 繁體中文、英文
