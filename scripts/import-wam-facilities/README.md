# WAM施設データインポート

WAM（独立行政法人福祉医療機構）が提供する障害福祉サービス事業所のオープンデータをデータベースにインポートするスクリプトです。

## 使用方法

```bash
# 基本的な使用方法（全データをインポート）
bun scripts/import-wam-facilities <csv-path>

# 都道府県でフィルタリング
bun scripts/import-wam-facilities <csv-path> --prefecture=都道府県名
```

## 例

```bash
# 北海道のCSVファイルをインポート
bun scripts/import-wam-facilities ./opendata/hokkaido.csv

# 全国データから東京都のみをインポート
bun scripts/import-wam-facilities ./opendata/all.csv --prefecture=東京都

# 神奈川県のみをインポート
bun scripts/import-wam-facilities ./opendata/all.csv --prefecture=神奈川県
```

## 機能

1. **都道府県フィルタ**: `--prefecture`オプションで特定の都道府県のデータのみをインポート
2. **エラーハンドリング**: 個別レコードでエラーが発生してもスキップして処理を継続
3. **詳細なログ**: 成功/スキップ/失敗の統計とエラー詳細を表示
4. **重複チェック**: WAM IDで既存施設を検索し、重複インポートを防止
5. **法人データ統合**: 法人番号で既存法人を検索し、新規作成または既存法人に紐付け

## CSVフォーマット

WAMオープンデータのCSVフォーマット（29列）:

```csv
都道府県コード,NO,指定機関名,法人の名称,法人の名称_かな,法人番号,法人住所（市区町村）,法人住所（番地以降）,法人電話番号,法人FAX番号,法人URL,サービス種別,事業所の名称,事業所の名称_かな,事業所番号,事業所住所（市区町村）,事業所住所（番地以降）,事業所電話番号,事業所FAX番号,事業所URL,事業所緯度,事業所経度,利用可能な時間帯（平日）,利用可能な時間帯（土曜）,利用可能な時間帯（日曜）,利用可能な時間帯（祝日）,定休日,利用可能曜日特記事項（留意事項）,定員
```

## サポートしているサービス種別

以下の21種類のサービス種別に対応しています:

### 訪問系サービス
- 居宅介護
- 重度訪問介護
- 同行援護
- 行動援護
- 重度障害者等包括支援

### 日中活動系サービス
- 療養介護
- 生活介護
- 短期入所

### 施設系サービス
- 施設入所支援

### 居住系サービス
- 共同生活援助
- 自立生活援助

### 訓練系・就労系サービス
- 自立訓練（機能訓練）
- 自立訓練（生活訓練）
- 宿泊型自立訓練
- 就労移行支援
- 就労継続支援A型
- 就労継続支援B型
- 就労定着支援

### 相談系サービス
- 地域相談支援（地域移行支援）
- 地域相談支援（地域定着支援）
- 計画相談支援
- 障害児相談支援

## 出力例

```
🚀 Starting WAM facility import...
📁 CSV file: ./opendata/hokkaido.csv
🗺️  Prefecture filter: 北海道

📊 Total rows: 1500

  ✓ Imported: ヘルパーステーションＷｉｔｈＹｏｕ (ID: abc123...)
  ✓ Imported: 訪問介護ステーションリピケア (ID: def456...)
  ⊘ Skipping existing facility: 既存施設名 (WAM ID: A0000012345)
  ✗ Error at row 125 (WAM ID: A0000999999): Unknown service type: 未対応サービス

📈 Import Summary:
  ✓ Success: 1450
  ⊘ Skipped: 45
  ✗ Failed:  5

❌ Failed imports:
  Row 125 (WAM ID: A0000999999): Unknown service type: 未対応サービス
  Row 456 (WAM ID: A0001234567): Invalid data format
  ...

✅ Import completed!
```

## エラーハンドリング

- **既存施設**: WAM IDで既存施設を検出した場合はスキップ
- **不明なサービス種別**: 対応していないサービス種別の場合はエラーとして記録
- **データ形式エラー**: 数値変換エラーなどはエラーとして記録し、処理を継続
- **個別エラー**: 各行のエラーは記録されるが、全体の処理は継続される

## 技術仕様

### 都道府県マッピング

都道府県コード（01-47）から都道府県名への変換をサポート。市区町村コードからも都道府県を自動抽出します。

### サービス種別マッピング

日本語のサービス種別名を英語コードに変換:

```typescript
居宅介護 → HOME_CARE
生活介護 → DAILY_LIFE_SUPPORT
就労継続支援A型 → EMPLOYMENT_SUPPORT_A
// etc...
```

### データ構造

インポートされるデータ:

- **Facility**: 施設の基本情報
- **FacilityProfile**: 名称、定員、WAM ID等
- **FacilityLocation**: 住所、緯度経度
- **FacilityContact**: 電話、FAX、メール
- **FacilityService**: サービス種別
- **FacilityBusinessHours**: 営業時間
- **FacilityCorporation**: 法人情報（法人番号で重複チェック）

## 注意事項

1. インポート前にデータベースのバックアップを推奨
2. 大量データのインポート時は時間がかかる場合があります
3. 重複インポートはWAM IDでチェックされます
4. エラーログは詳細に確認してください
5. データベース接続エラーが発生した場合は環境変数を確認してください
