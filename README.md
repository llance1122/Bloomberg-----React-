# Bloomberg 借用系統（React + Azure 版）

把原本架在 NAS 上的 PHP + MySQL 借用系統重寫成：

- **前端**：Vite + React (路由 react-router-dom)
- **後端**：Azure Static Web Apps Managed Functions（Node.js 18 + mysql2）
- **資料庫**：Azure Database for MySQL Flexible Server
- **HTTPS**：Static Web Apps 內建受信任憑證（不會再有「不安全」警告）

---

## 1. 本機開發

```powershell
# 在專案根目錄
npm install
cd api
npm install
cd ..

# 啟動前端 dev server
npm run dev
```

前端：http://localhost:5173

要連到資料庫測試，需要：

1. 安裝 Azure Functions Core Tools v4 與 SWA CLI

   ```powershell
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   npm install -g @azure/static-web-apps-cli
   ```

2. 把 `api/local.settings.json.example` 複製成 `api/local.settings.json`，填入 Azure MySQL 的連線資訊（這份檔案在 `.gitignore` 內，不會被 commit）

3. 用 SWA CLI 同時起前端 + Functions：

   ```powershell
   swa start http://localhost:5173 --run "npm run dev" --api-location api
   ```

   之後打開 http://localhost:4280 就是模擬上線後的 Static Web Apps 環境。

---

## 2. Azure 資源建立步驟（學生方案）

### 2.1 建立 MySQL Flexible Server

1. 進 [Azure Portal](https://portal.azure.com) → 搜尋 **Azure Database for MySQL flexible servers** → 「建立」
2. 設定：
   - **訂閱**：Azure for Students
   - **資源群組**：新建 `rg-bloomberg-booking`
   - **伺服器名稱**：例如 `bloomberg-booking-mysql`（會變成 `bloomberg-booking-mysql.mysql.database.azure.com`）
   - **區域**：`Japan East`（東京，網路品質好且靠近台灣）
   - **MySQL 版本**：8.0
   - **工作負載類型**：開發
   - **計算和儲存體**：點「設定」→ **Burstable B1ms（1 vCore, 2 GB）** 是最便宜的
   - **管理員使用者名稱**：例如 `bloomberg_admin`，密碼自訂並記好
3. 「網路」分頁：
   - **連線方法**：公用存取
   - **防火牆規則**：勾「允許從 Azure 內任何 Azure 服務存取此伺服器」（讓 Static Web Apps 連得到）
   - 也勾「新增目前的用戶端 IP 位址」（讓你本機能連進去執行 schema.sql）
4. 完成建立（約 5–10 分鐘）

### 2.2 建立資料庫

在 Portal 內找到剛剛的 MySQL Server → 左側「設定 → 資料庫」→ 新增 `booking` 資料庫

或用任何 MySQL 客戶端（MySQL Workbench、DBeaver、TablePlus）連進去執行 `db/schema.sql`：

```
Host: bloomberg-booking-mysql.mysql.database.azure.com
Port: 3306
User: bloomberg_admin
Password: （剛才設的）
SSL: 必須啟用
```

### 2.3 把專案推到 GitHub

```powershell
git init
git add .
git commit -m "Initial commit: Bloomberg booking React + Azure SWA"
# 在 GitHub 新建 repo，然後：
git remote add origin https://github.com/<你的帳號>/bloomberg-booking.git
git branch -M main
git push -u origin main
```

### 2.4 建立 Static Web App

1. Azure Portal → 搜尋 **Static Web Apps** → 「建立」
2. 設定：
   - **訂閱 / 資源群組**：同 MySQL，`rg-bloomberg-booking`
   - **名稱**：例如 `bloomberg-booking`（會給你 `https://bloomberg-booking-<random>.<region>.azurestaticapps.net` 這個免費網址）
   - **方案類型**：**Free**
   - **區域 (for Functions)**：East Asia
   - **部署來源**：GitHub → 授權
   - **組織 / Repo / 分支**：選你剛 push 的 repo + main 分支
   - **建置預設**：選 **React**（或 Custom）
     - **App location**：`/`
     - **Api location**：`api`
     - **Output location**：`dist`
3. 「檢閱 + 建立」→ 完成
4. Azure 會自動在你的 GitHub repo 開一個 PR / commit，把 `.github/workflows/azure-static-web-apps-*.yml` 加進來，並觸發第一次部署（約 3–5 分鐘）

### 2.5 設定環境變數

部署完成後：

1. 進 Static Web App → 左側「設定 → 環境變數」
2. 新增以下變數（對應 `api/shared/db.js`）：

   | 名稱 | 值 |
   | --- | --- |
   | `MYSQL_HOST` | `bloomberg-booking-mysql.mysql.database.azure.com` |
   | `MYSQL_PORT` | `3306` |
   | `MYSQL_USER` | `bloomberg_admin` |
   | `MYSQL_PASSWORD` | （你的密碼） |
   | `MYSQL_DATABASE` | `booking` |
   | `MYSQL_SSL` | `true` |

3. 儲存後 Functions 會重啟。

### 2.6 完成 🎉

開啟 Static Web App 給的 `https://...azurestaticapps.net` 網址，理論上：

- 借用申請頁 (`/`) 載入 → 上方顯示「目前可用台數 5 / 5」
- 借用清單頁 (`/list`) 載入 → 顯示「目前無人借用」

---

## 2.A 用 Azure CLI 一鍵跑完（替代 2.1–2.5）

若你想跳過 Portal 點選，整段在 PowerShell 跑完。先確認 Azure CLI 已裝（`az version`），然後依序：

> 區域：MySQL 放在 `japaneast`（東京）；Static Web Apps 沒有 Japan 區，最近的選擇是 `eastasia`（香港），約 50ms RTT 不影響。

### 0. 登入並選擇訂閱

```powershell
az login
az account list --output table
az account set --subscription "Azure for Students"
```

### 1. 設定變數

```powershell
$RG            = "rg-bloomberg-booking"
$MYSQL_LOC     = "japaneast"
$SWA_LOC       = "eastasia"
$MYSQL_SERVER  = "bloomberg-booking-mysql"   # 必須全球唯一
$MYSQL_USER    = "bloomberg_admin"
$DB_NAME       = "booking"
$SWA_NAME      = "bloomberg-booking"

$securePwd  = Read-Host "MySQL admin password (8+ 字元，含大小寫+數字+符號)" -AsSecureString
$MYSQL_PWD  = [System.Net.NetworkCredential]::new("", $securePwd).Password
```

### 2. 建 Resource Group

```powershell
az group create --name $RG --location $MYSQL_LOC
```

### 3. 建 MySQL Flexible Server（Burstable B1ms）

抓你目前公網 IP 加進防火牆，建立時順便允許自己連線：

```powershell
$myIp = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content.Trim()

az mysql flexible-server create `
  --resource-group $RG `
  --name $MYSQL_SERVER `
  --location $MYSQL_LOC `
  --admin-user $MYSQL_USER `
  --admin-password $MYSQL_PWD `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --version 8.0.21 `
  --storage-size 20 `
  --public-access $myIp `
  --yes
```

**這一步要 5–10 分鐘。** 跑完再開放給 Azure 內部服務（讓 Static Web Apps 連得到，跨區也適用）：

```powershell
az mysql flexible-server firewall-rule create `
  --resource-group $RG `
  --name $MYSQL_SERVER `
  --rule-name "AllowAzureServices" `
  --start-ip-address "0.0.0.0" `
  --end-ip-address "0.0.0.0"
```

### 4. 建資料庫

```powershell
az mysql flexible-server db create `
  --resource-group $RG `
  --server-name $MYSQL_SERVER `
  --database-name $DB_NAME
```

### 5. 跑 `schema.sql`（不需另裝 MySQL 客戶端）

```powershell
cd "C:\Users\D000020403\Desktop\Bloomberg交易實驗室\Bloomberg借用網站-React版"

# 若提示「需要 rdbms-connect 擴充套件」就跑這條：
# az extension add --name rdbms-connect

az mysql flexible-server execute `
  --name $MYSQL_SERVER `
  --admin-user $MYSQL_USER `
  --admin-password $MYSQL_PWD `
  --database-name $DB_NAME `
  --file-path "db/schema.sql"
```

### 6. push 程式碼到 GitHub（用 git）

```powershell
git init
git add .
git commit -m "Initial commit: Bloomberg booking React + Azure SWA"
# 先到 https://github.com/new 建空 repo
git remote add origin https://github.com/<你的帳號>/bloomberg-booking.git
git branch -M main
git push -u origin main
```

### 7. 建 Static Web App + 連 GitHub

**建議在 Portal 點**（一次性、最簡單）：照 2.4 步驟操作即可。

或全 CLI 版（需 GitHub PAT — https://github.com/settings/tokens 開一個，勾 `repo` + `workflow`）：

```powershell
$secureToken = Read-Host "GitHub PAT" -AsSecureString
$GH_PLAIN = [System.Net.NetworkCredential]::new("", $secureToken).Password

az staticwebapp create `
  --name $SWA_NAME `
  --resource-group $RG `
  --location $SWA_LOC `
  --sku Free `
  --source "https://github.com/<你的帳號>/bloomberg-booking" `
  --branch main `
  --app-location "/" `
  --api-location "api" `
  --output-location "dist" `
  --token $GH_PLAIN
```

### 8. 設定 SWA 環境變數（連 MySQL）

```powershell
az staticwebapp appsettings set `
  --name $SWA_NAME `
  --resource-group $RG `
  --setting-names `
    MYSQL_HOST="$MYSQL_SERVER.mysql.database.azure.com" `
    MYSQL_PORT="3306" `
    MYSQL_USER="$MYSQL_USER" `
    MYSQL_PASSWORD="$MYSQL_PWD" `
    MYSQL_DATABASE="$DB_NAME" `
    MYSQL_SSL="true"
```

### 9. 拿到網址

```powershell
az staticwebapp show --name $SWA_NAME --resource-group $RG --query "defaultHostname" -o tsv
```

### 額外管理指令

不用時 stop（不算錢，要用再 start）：

```powershell
az mysql flexible-server stop  --name $MYSQL_SERVER --resource-group $RG
az mysql flexible-server start --name $MYSQL_SERVER --resource-group $RG
```

清掉 PowerShell 變數內的明文密碼：

```powershell
Remove-Variable MYSQL_PWD, GH_PLAIN -ErrorAction SilentlyContinue
```

整個拆除（如果想砍掉重建）：

```powershell
az group delete --name $RG --yes --no-wait
```

---

## 3. 後續整合（不影響上述部署）

`Bloomberg遠端預約系統` 那一坨（PowerShell + Google Apps Script）**完全不用動**，繼續跑在 Google 與你的本機 Windows PC 上。

如果未來想把借用網站綁學校網域（例如 `bloomberg.your-domain.cgu.edu.tw`）：

1. Static Web App → 左側「設定 → 自訂網域」→ 新增 CNAME
2. 在 DNS 處新增 `CNAME bloomberg → bloomberg-booking-xxx.azurestaticapps.net`
3. Azure 會自動申請免費 Managed Certificate（不用自己處理 SSL）

---

## 4. 估算月費（學生方案）

| 服務 | 月費 |
| --- | --- |
| Static Web Apps (Free 方案) | NT$0 |
| Managed Functions（Free 方案內含） | NT$0 |
| MySQL Flexible Server B1ms | ~NT$400–500/月（學生額度 US$100 可吸收約 5 個月） |
| 出站流量（前 100 GB） | NT$0 |

省錢小技巧：MySQL 可以**用完關機**（Portal → 停止伺服器），不算錢，需要時再開。

---

## 5. 專案結構

```
Bloomberg借用網站-React版/
├── package.json              # 前端依賴
├── vite.config.js            # Vite 設定（含 /api proxy）
├── index.html
├── staticwebapp.config.json  # SWA 路由 fallback（SPA 路由）
├── public/
│   └── icon.png
├── src/
│   ├── main.jsx              # 路由 entry
│   ├── App.jsx               # 上方 nav
│   ├── App.css
│   ├── pages/
│   │   ├── BookingPage.jsx   # 對應原 index.html
│   │   └── ListPage.jsx      # 對應原 list.php
│   └── components/
│       └── Modal.jsx
├── api/                       # SWA Managed Functions
│   ├── host.json
│   ├── package.json
│   ├── shared/db.js          # MySQL 連線池
│   ├── get-count/            # GET /api/get-count
│   ├── submit/               # POST /api/submit
│   ├── list/                 # GET /api/list
│   └── return/               # POST /api/return?id=N
└── db/
    └── schema.sql            # 建立 booking 資料庫的 SQL
```
