# Discord 通知設定ガイド

Claude Code RemoteからDiscordに通知を送り、Discordから新しいコマンドを送信する方法を説明します。

## 📋 目次

1. [機能概要](#機能概要)
2. [前提条件](#前提条件)
3. [Discord Botのセットアップ](#discord-botのセットアップ)
4. [環境設定](#環境設定)
5. [起動方法](#起動方法)
6. [使い方](#使い方)
7. [トラブルシューティング](#トラブルシューティング)

## 🎯 機能概要

- **通知受信**: Claude Codeがタスクを完了したときにDiscordチャンネルにリッチな通知を受信
- **双方向コマンド**: Discord上でトークンを使用して新しいコマンドをClaude Codeに送信
- **セッション管理**: トークンベースの認証で24時間有効なセッション管理
- **リアルタイム対話**: Discordメッセージでシームレスに会話を継続

## 📦 前提条件

- Node.js >= 14.0.0
- tmuxまたはPTY環境（コマンド注入用）
- Discordアカウント
- Discord サーバーの管理者権限（Bot追加のため）

## 🤖 Discord Botのセットアップ

### 1. Discord Developer Portalでアプリケーションを作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」ボタンをクリック
3. アプリケーション名を入力（例: `Claude Code Remote`）
4. 「Create」をクリック

### 2. Botを作成してトークンを取得

1. 左メニューから「Bot」を選択
2. 「Add Bot」ボタンをクリック
3. 「Reset Token」をクリックしてBotトークンを取得
4. トークンをコピーして安全な場所に保存（後で使用）

### 3. 重要: MESSAGE CONTENT INTENTを有効化

⚠️ **この設定を忘れるとBotがメッセージを読めません！**

1. Bot設定ページの下部「Privileged Gateway Intents」セクションへ移動
2. 「MESSAGE CONTENT INTENT」を**ONに切り替え**
3. 「Save Changes」をクリック

### 4. Botをサーバーに招待

⚠️ **重要: この手順を忘れるとBotは動作しません！**

#### 方法1: 診断ツールで招待リンクを取得（推奨）

```bash
cd /path/to/Claude-Code-Remote
node check-discord-setup.js
```

診断ツールがBot IDを含む招待リンクを自動生成します。

#### 方法2: 手動でURLを生成

1. 左メニューから「OAuth2」→「URL Generator」を選択
2. 「SCOPES」で以下を選択:
   - ✅ `bot`
3. 「BOT PERMISSIONS」で以下を選択:
   - ✅ `Send Messages` (メッセージ送信)
   - ✅ `Read Messages/View Channels` (メッセージ読取)
   - ✅ `Read Message History` (メッセージ履歴読取)
   - ✅ `Embed Links` (埋め込みリンク)
4. 生成されたURLをコピーしてブラウザで開く
5. Botを追加したいDiscordサーバーを選択
6. 「認証」をクリック

**Botが正しくサーバーに追加されたことを確認**:
```bash
node check-discord-setup.js
```
「🏰 Servers Bot is in:」の下にサーバー名が表示されればOK!

### 5. チャンネルIDを取得

1. Discordの「ユーザー設定」→「詳細設定」→「開発者モード」を**ON**にする
2. 通知を受け取りたいチャンネルを右クリック
3. 「IDをコピー」を選択
4. コピーしたIDを保存（後で使用）

## ⚙️ 環境設定

### 1. 依存パッケージのインストール

```bash
cd /path/to/Claude-Code-Remote
npm install discord.js
```

### 2. .envファイルの編集

`.env`ファイルを開いて、以下の設定を追加・編集します：

```env
# ===== Discord設定 =====
# Discordによる通知を有効化
DISCORD_ENABLED=true

# Discord Bot トークン (Discord Developer Portalで取得)
DISCORD_BOT_TOKEN=your-bot-token-here

# 通知を送信するDiscordチャンネルID
DISCORD_CHANNEL_ID=your-channel-id-here

# Discordサーバー（ギルド）ID（オプション）
# DISCORD_SERVER_ID=your-server-id-here

# Discordウェブフックサーバーのポート（デフォルト: 3002）
# DISCORD_WEBHOOK_PORT=3002

# ===== システム設定 =====
# セッションマッピングファイルのパス
SESSION_MAP_PATH=/path/to/your/project/src/data/session-map.json

# 動作モード: pty または tmux
INJECTION_MODE=pty

# ログレベル: debug, info, warn, error
LOG_LEVEL=info
```

### 設定例

```env
DISCORD_ENABLED=true
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
SESSION_MAP_PATH=/Users/yourname/Claude-Code-Remote/src/data/session-map.json
INJECTION_MODE=pty
LOG_LEVEL=info
```

### 3. Claude Code フックの設定

`~/.claude/settings.json`に以下を追加：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node /path/to/Claude-Code-Remote/claude-hook-notify.js completed",
        "timeout": 5
      }]
    }],
    "SubagentStop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node /path/to/Claude-Code-Remote/claude-hook-notify.js waiting",
        "timeout": 5
      }]
    }]
  }
}
```

## 🚀 起動方法

### Discordのみを起動

```bash
npm run discord
# または
node start-discord-webhook.js
```

### すべての有効なプラットフォームを起動

```bash
npm run webhooks
# または
node start-all-webhooks.js
```

起動すると以下のようなログが表示されます：

```
🚀 Starting Claude Code Remote Multi-Platform Webhook Server...

🎮 Starting Discord webhook server...
✅ Started 1 webhook server(s):
   - Discord

📋 Platform Command Formats:
   Discord: TOKEN123 <command>

🔧 To stop all services, press Ctrl+C
```

## 💬 使い方

### 1. Claude Codeを起動

tmuxセッション内でClaude Codeを起動します：

```bash
# tmuxセッションを開始
tmux new-session -d -s claude-session
tmux attach-session -t claude-session

# tmux内でClaude Codeを起動
claude-code

# デタッチ（Claude Codeは実行し続けます）
# Ctrl+B を押してから D を押す
```

### 2. Claude Codeで作業する

tmuxセッション内でClaude Codeに任意のコマンドを実行させます。

### 3. Discord通知を受け取る

Claude Codeがタスクを完了すると、Discordチャンネルにリッチな埋め込み通知が届きます：

```
✅ Claude Task Completed

Project: your-project-name
Type: completed
Session Token: ABC12345

📝 Your Question:
（あなたの質問内容）

🤖 Claude's Response:
（Claudeの回答内容）

💬 Send New Command
Reply with: ABC12345 <your command>
Example: ABC12345 Please analyze this code file
```

### 4. 新しいコマンドを送信

Discordチャンネルで新しいメッセージとして、以下の形式でコマンドを送信：

```
ABC12345 次のコマンドを実行してください
```

または

```
ABC12345 ファイルの内容を確認してください
```

**形式**: `[トークン] [スペース] [コマンド内容]`

### 5. 確認メッセージを受信

コマンドが正常に送信されると、以下のような確認メッセージが表示されます：

```
✅ Command Sent

Command: 次のコマンドを実行してください
Session: claude-session

Please wait, Claude is processing your request...
```

### 6. 新しい通知を待つ

Claude Codeが処理を完了すると、再び通知が届きます。

## 🎨 通知の内容

Discordに送信される通知には以下の情報が含まれます：

- **タイトル**: タスクのステータス（完了/待機中）
- **プロジェクト名**: 作業中のプロジェクト
- **セッショントークン**: コマンド送信用の8文字のトークン
- **あなたの質問**: 直前に送信した質問
- **Claudeの応答**: Claudeからの回答（最大1024文字）
- **使い方**: コマンド送信方法の説明

### 通知の色

- 🟢 **緑**: タスク完了（completed）
- 🟡 **黄**: 入力待ち（waiting）

## 🔐 セキュリティ

### トークンベース認証

- 各通知には一意の8文字のトークンが生成されます
- トークンは24時間で自動的に期限切れになります
- トークンは`src/data/sessions/`ディレクトリにJSON形式で保存されます

### チャンネル制限

- Botは`.env`で指定されたチャンネルIDのメッセージのみを処理します
- 他のチャンネルでのメッセージは無視されます

## 🔧 トラブルシューティング

### 🔍 診断ツールを実行

問題が発生した場合は、まず診断ツールを実行してください:

```bash
node check-discord-setup.js
```

このツールは以下をチェックします:
- ✅ Botトークンが有効か
- ✅ Botがサーバーに参加しているか
- ✅ チャンネルにアクセスできるか
- ✅ 必要な権限があるか

### ❌ Missing Access エラー

**エラー内容**: `DiscordAPIError[50001]: Missing Access`

**原因**:
1. Botがサーバーに招待されていない（最も一般的）
2. Botがチャンネルにアクセスする権限がない
3. チャンネルIDが間違っている

**解決方法**:

1. **Botをサーバーに招待**:
   ```bash
   # 診断ツールを実行して招待リンクを取得
   node check-discord-setup.js
   ```
   表示された招待リンクをブラウザで開いてBotを招待

2. **チャンネル権限を確認**:
   - Discordでチャンネルを右クリック → 「チャンネルの編集」
   - 「権限」タブを選択
   - Botロールまたはユーザーを追加
   - 以下の権限を付与:
     - ✅ チャンネルを見る
     - ✅ メッセージを送信
     - ✅ メッセージ履歴を読む
     - ✅ リンクを埋め込む

3. **チャンネルIDを確認**:
   - 開発者モードを有効化（ユーザー設定 → 詳細設定 → 開発者モード）
   - チャンネルを右クリック → 「IDをコピー」
   - `.env`の`DISCORD_CHANNEL_ID`に正しく設定されているか確認

### Botがメッセージに反応しない

1. **MESSAGE CONTENT INTENTが有効になっているか確認**
   - Discord Developer Portal → Bot設定 → Privileged Gateway Intents
   - 「MESSAGE CONTENT INTENT」がONになっているか確認
   - **変更後は必ずBotを再起動**

2. **正しいチャンネルで送信しているか確認**
   - `.env`の`DISCORD_CHANNEL_ID`と実際のチャンネルIDが一致しているか確認

3. **トークンの形式が正しいか確認**
   - トークンは8文字の大文字英数字
   - 形式: `TOKEN123 コマンド内容`（トークンとコマンドの間にスペース）

### 通知が届かない

1. **Botがオンラインか確認**
   ```bash
   # ログを確認
   npm run discord
   ```

   正常な場合、以下のようなログが表示されます:
   ```
   ✅ Discord bot logged in as ClaudeCodeRemote#7680
   ✅ Discord webhook server started successfully
   ```

2. **Claude Codeのフック設定を確認**
   - `claude-hooks.json`のhooks設定が正しいか確認
   - パスが絶対パスで正しいか確認（例: `/Users/yourname/Claude-Code-Remote/claude-hook-notify.js`）

3. **手動テスト**
   ```bash
   node claude-hook-notify.js completed
   ```

   成功した場合、Discordチャンネルに通知が届きます。

4. **詳細ログを確認**
   ```bash
   LOG_LEVEL=debug node claude-hook-notify.js completed
   ```

### トークンが期限切れ

トークンは24時間で期限切れになります。新しい通知を待つか、Claude Codeで新しいタスクを実行してください。

### discord.jsがインストールされていない

```bash
npm install discord.js
```

### ポートが使用中

デフォルトのポート（3002）が使用中の場合、`.env`で変更できます：

```env
DISCORD_WEBHOOK_PORT=3003
```

## 📊 ログの確認

詳細なログを確認するには：

```bash
LOG_LEVEL=debug npm run discord
```

## 🛑 サービスの停止

```bash
# Ctrl+C を押す
```

または

```bash
# プロセスを検索して停止
pkill -f "node.*discord-webhook"
```

## 💡 ヒント

1. **複数プラットフォームの同時使用**: Discord、Telegram、Emailを同時に有効にして冗長性を確保できます
2. **テスト環境**: 本番使用前に専用のテストチャンネルで動作確認をお勧めします
3. **トークンの保存**: よく使うトークンをDiscordのメッセージで検索できます
4. **絵文字**: Discordのリッチな絵文字サポートで通知が見やすくなります

## 📝 コマンド例

```
ABC12345 このファイルを分析してください
ABC12345 テストを実行してください
ABC12345 コードレビューをお願いします
ABC12345 エラーの原因を調査してください
ABC12345 ドキュメントを更新してください
```

## 🔗 関連リンク

- [Discord Developer Portal](https://discord.com/developers/applications)
- [discord.js ドキュメント](https://discord.js.org/)
- [Claude Code 公式サイト](https://claude.ai/code)

---

**🎉 Discord通知の設定が完了しました！**

何か問題がある場合は、上記のトラブルシューティングセクションを参照するか、[GitHubのIssues](https://github.com/JessyTsui/Claude-Code-Remote/issues)で報告してください。
