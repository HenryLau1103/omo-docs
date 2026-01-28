---
title: "刪除交易記錄功能"
date: "2026-01-28"
author: "Henry Lau"
status: ready
version: "1.0.0"
tags: ["sas-tauri", "trading", "crud"]
target_project: "sas-tauri"
estimated_hours: 2
related_docs: ["/specs/sas-tauri-spec"]
---

# 任務目標

在 SAS 股票交易系統中新增刪除交易記錄的功能，讓用戶可以刪除錯誤輸入的交易。

# 背景

## 為什麼需要這個功能

用戶可能會誤輸入交易記錄，需要能夠刪除。目前系統只支援新增，沒有刪除功能。

## 相關文件

- [SAS 技術規格](/specs/sas-tauri-spec)

# 修改範圍

## 新增檔案

無

## 修改檔案

| 檔案路徑 | 修改內容 |
|----------|----------|
| `src-tauri/src/commands/mod.rs` | 新增 `delete_trade` command |
| `src-tauri/src/infrastructure/csv_repository.rs` | 新增 `delete_trading_record` 函數 |
| `src-tauri/src/lib.rs` | 註冊新 command |
| `src/api.ts` | 新增 `deleteTrade` API 封裝 |
| `src/components/TodayRecords.tsx` | 新增刪除按鈕 |

# MUST (必須精確實作)

## Rust 後端

### 新增 Command

```rust
// src-tauri/src/commands/mod.rs
#[tauri::command]
pub fn delete_trade(id: String) -> Result<(), String> {
    csv_repository::delete_trading_record(&id)
        .map_err(|e| e.to_string())
}
```

### CSV Repository 函數

```rust
// src-tauri/src/infrastructure/csv_repository.rs
pub fn delete_trading_record(id: &str) -> Result<(), SasError> {
    // 1. 讀取當月 CSV
    // 2. 過濾掉指定 id 的記錄
    // 3. 重寫整個 CSV 檔案
}
```

### 錯誤處理

| 錯誤情況 | 錯誤訊息 |
|---------|---------|
| id 為空 | "交易記錄 ID 不可為空" |
| 找不到記錄 | "找不到交易記錄" |
| 檔案寫入失敗 | "無法寫入檔案: {error}" |

## TypeScript 前端

### API 封裝

```typescript
// src/api.ts
export async function deleteTrade(id: string): Promise<void> {
  return invoke('delete_trade', { id });
}
```

### UI 變更

- 在 `TodayRecords.tsx` 每筆記錄旁新增「刪除」按鈕
- 點擊後顯示確認對話框
- 確認後呼叫 `deleteTrade(id)`
- 成功後從 state 移除該筆記錄

# SHOULD (可彈性處理)

- 刪除確認對話框的樣式
- 按鈕的 hover 效果
- 刪除後是否需要 toast 通知
- 是否需要 undo 功能

# 驗收標準

## 情境 1：成功刪除記錄

**Given** 今日有一筆交易記錄 (id: abc123)
**When** 用戶點擊該記錄的「刪除」按鈕並確認
**Then** 記錄從畫面消失，CSV 檔案中該記錄被移除

## 情境 2：取消刪除

**Given** 今日有一筆交易記錄
**When** 用戶點擊「刪除」按鈕後點擊「取消」
**Then** 記錄保持不變

## 情境 3：記錄不存在

**Given** 嘗試刪除一個不存在的 id
**When** 呼叫 `delete_trade("non-existent-id")`
**Then** 回傳錯誤訊息「找不到交易記錄」

## 技術驗收

- [ ] Rust 編譯通過: `cd src-tauri && cargo check`
- [ ] 前端建置通過: `npm run build`
- [ ] 應用程式可啟動: `npm run tauri dev`
- [ ] 手動測試刪除功能正常運作
