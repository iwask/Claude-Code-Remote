# Claude Code Remote - プロジェクト管理ガイド

## 🔔 Discord通知ルール

**重要**: 各応答完了後、必ずDiscordに通知を送信すること。

### 通知送信手順

1. **応答完了時に必ず実行**:
   ```bash
   echo "あなたの応答内容をここに" > /tmp/claude-response.txt
   CLAUDE_HOOK_RESPONSE_TEXT="$(cat /tmp/claude-response.txt)" node /Users/hi/src/Claude-Code-Remote/claude-hook-notify.js response
   ```

2. **通知内容**:
   - 応答の要約（100-200文字程度）
   - 長い応答の場合は冒頭部分のみ

3. **例外**:
   - 単純な確認応答（「はい」「了解」など）は通知不要
   - ユーザーが通知を望まない場合は省略可

## 📋 コミットルール

### 必須: 作業完了ごとに必ずコミット

**重要**: すべての作業セクション完了時に必ずコミットを行うこと。

```bash
# 作業完了時のコミット例
git add .
git commit -m "feat: Discord webhook機能の実装完了"
git push
```

### コミットメッセージの形式

```
<type>: <subject>

<body (optional)>
```

**Type prefix**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `refactor`: リファクタリング
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更
- `style`: コードの意味に影響しない変更（フォーマット等）

## 📁 ディレクトリ構造

```
Claude-Code-Remote/
├── src/                          # ソースコード（恒久的）
│   ├── channels/                 # 通知チャンネル実装
│   │   ├── discord/
│   │   ├── telegram/
│   │   └── line/
│   ├── core/                     # コアシステム
│   ├── utils/                    # ユーティリティ
│   └── data/                     # データディレクトリ
│       └── sessions/             # セッションファイル（.gitignore）
│
├── scripts/                      # スクリプト類
│   ├── setup/                    # セットアップスクリプト（恒久的）
│   │   ├── check-discord-setup.js
│   │   └── check-telegram-setup.js
│   ├── test/                     # テストスクリプト（恒久的）
│   │   ├── test-discord-notification.js
│   │   ├── test-telegram-notification.js
│   │   └── test-command-injection.js
│   └── temp/                     # 一時的なテストスクリプト（.gitignore）
│
├── docs/                         # ドキュメント
│   ├── official/                 # 正式ドキュメント（恒久的）
│   │   ├── SETUP_GUIDE.md
│   │   ├── DOCKER_DEPLOYMENT.md
│   │   ├── DISCORD_SETUP_JA.md
│   │   └── TELEGRAM_SETUP.md
│   ├── guides/                   # 追加ガイド・チュートリアル
│   │   └── troubleshooting/
│   └── notes/                    # 作業ログ・部分的な説明（.gitignore）
│       └── work-log-YYYYMMDD.md
│
├── logs/                         # ログファイル（.gitignore）
├── sessions/                     # Telegramセッション（.gitignore）
│
├── .github/                      # GitHub設定
│   ├── workflows/                # GitHub Actions
│   └── ISSUE_TEMPLATE/           # Issue テンプレート
│
├── docker-compose.yml            # Docker Compose設定
├── Dockerfile                    # Dockerイメージ定義
├── .dockerignore                 # Docker除外設定
│
├── start-discord-webhook.js      # Discord起動スクリプト（恒久的）
├── start-telegram-webhook.js     # Telegram起動スクリプト（恒久的）
├── start-line-webhook.js         # LINE起動スクリプト（恒久的）
├── start-all-webhooks.js         # 全サービス起動（恒久的）
│
├── claude-hook-notify.js         # Claude Code フック（恒久的）
├── claude-hooks.json             # フック設定
│
├── package.json
├── package-lock.json
├── .env.example                  # 環境変数テンプレート
├── .env                          # 環境変数（.gitignore）
├── .gitignore
├── README.md                     # プロジェクト概要
└── Claude.md                     # このファイル（プロジェクト管理）
```

## 🗂️ ファイル分類ルール

### 恒久的なファイル（Gitで管理）

**スクリプト**:
- `scripts/setup/`: 診断・セットアップツール
- `scripts/test/`: 定期的に使用するテストスクリプト
- ルートの `start-*.js`: サービス起動スクリプト

**ドキュメント**:
- `docs/official/`: 正式なセットアップ・運用ガイド
- `docs/guides/`: チュートリアル、ベストプラクティス
- `README.md`: プロジェクト概要

### 一時的なファイル（.gitignoreで除外）

**スクリプト**:
- `scripts/temp/`: 実験的・一時的なテストスクリプト
- デバッグ用のワンタイムスクリプト

**ドキュメント**:
- `docs/notes/`: 作業ログ、メモ、部分的な説明文書
- 個人的なワークログ

**データ**:
- `logs/`: アプリケーションログ
- `sessions/`: セッションファイル
- `src/data/sessions/`: トークンセッション

## 📝 ファイル移動ルール

### 新規作成時のチェックリスト

1. **スクリプトの場合**:
   - 恒久的？ → `scripts/setup/` または `scripts/test/`
   - 一時的？ → `scripts/temp/`（.gitignore）

2. **ドキュメントの場合**:
   - 正式ガイド？ → `docs/official/`
   - チュートリアル？ → `docs/guides/`
   - 作業ログ？ → `docs/notes/`（.gitignore）

3. **作業完了後**:
   - 不要な一時ファイルは削除
   - 恒久的なファイルはコミット

## 🧹 クリーンアップルール

### 定期的に削除すべきファイル

```bash
# 一時スクリプト（30日以上古い）
find scripts/temp/ -type f -mtime +30 -delete

# 古いログファイル（30日以上）
find logs/ -type f -mtime +30 -delete

# 作業ログ（90日以上）
find docs/notes/ -type f -mtime +90 -delete
```

### コミット前のチェック

```bash
# 不要なファイルがステージングされていないか確認
git status

# ルートディレクトリに不要なファイルがないか確認
ls -la | grep -E '\.(js|md)$' | grep -v -E '^(start-|claude-|package|README|Claude\.md)'
```

## 🚀 ワークフロー例

### 新機能開発時

1. **作業開始**:
   ```bash
   git checkout -b feature/new-notification-channel
   ```

2. **開発**:
   - コード実装: `src/channels/new-channel/`
   - テストスクリプト作成: `scripts/test/test-new-channel.js`

3. **テスト**:
   - 一時的なデバッグスクリプト: `scripts/temp/debug-*.js`

4. **ドキュメント**:
   - セットアップガイド: `docs/official/NEW_CHANNEL_SETUP.md`
   - 作業メモ: `docs/notes/new-channel-work-log.md`

5. **クリーンアップ**:
   ```bash
   # 一時ファイルを削除
   rm scripts/temp/debug-*.js

   # 必要なファイルをコミット
   git add src/channels/new-channel/
   git add scripts/test/test-new-channel.js
   git add docs/official/NEW_CHANNEL_SETUP.md
   git commit -m "feat: 新しい通知チャンネルの実装"
   ```

6. **マージ**:
   ```bash
   git checkout main
   git merge feature/new-notification-channel
   git push
   ```

## 🔍 現在のプロジェクト状態チェック

```bash
# ルートディレクトリの不要なファイルを確認
ls -1 *.js *.md | sort

# 移動が必要なファイルを特定
# - test-*.js → scripts/test/
# - check-*.js → scripts/setup/
# - *_SETUP*.md → docs/official/
# - work-log-*.md → docs/notes/
```

## 📌 重要な注意事項

1. **絶対に .env をコミットしない**
2. **作業完了ごとに必ずコミット**
3. **一時ファイルは scripts/temp/ または docs/notes/ に配置**
4. **ルートディレクトリは必要最小限のファイルのみ**
5. **ドキュメントは目的別にディレクトリを分ける**

---

**最終更新**: 2025-11-09
**管理者**: Claude Code
