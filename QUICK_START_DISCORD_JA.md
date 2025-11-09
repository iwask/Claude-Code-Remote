# Discord通知 クイックスタートガイド 🚀

Discord通知が届かない場合の簡単な修正方法です。

## 📋 5分でできる修正手順

### ステップ1: 診断ツールを実行

```bash
cd /path/to/Claude-Code-Remote
node check-discord-setup.js
```

### ステップ2: 問題を確認

診断ツールが以下のいずれかを表示:

#### ✅ ケース1: Botがサーバーにいない

```
❌ Bot is not in any servers!
Please invite the bot to your server:
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=277025508352&scope=bot
```

**解決方法**:
1. 表示されたリンクをブラウザで開く
2. Botを招待したいサーバーを選択
3. 「認証」をクリック
4. もう一度診断ツールを実行して確認

#### ✅ ケース2: チャンネルにアクセスできない

```
❌ Error fetching channel: Missing Access
```

**解決方法**:
1. Discordで通知を受け取りたいチャンネルを右クリック
2. 「チャンネルの編集」→「権限」を選択
3. 「+」ボタンでBotを追加（Bot名: `ClaudeCodeRemote`）
4. 以下の権限を有効化:
   - ✅ チャンネルを見る
   - ✅ メッセージを送信
   - ✅ メッセージ履歴を読む
   - ✅ リンクを埋め込む
5. 「変更を保存」をクリック

#### ✅ ケース3: MESSAGE CONTENT INTENTが無効

```
❌ Bot can read messages but cannot see content
```

**解決方法**:
1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. あなたのBotアプリケーションを選択
3. 左メニュー「Bot」をクリック
4. 「Privileged Gateway Intents」セクションまでスクロール
5. 「MESSAGE CONTENT INTENT」を**ON**に切り替え
6. 「Save Changes」をクリック
7. Webhook serverを再起動:
   ```bash
   # 現在実行中のserverを停止 (Ctrl+C)
   # 再起動
   node start-discord-webhook.js
   ```

### ステップ3: テスト通知を送信

すべての問題を修正したら、テスト通知を送信:

```bash
node test-discord-notification.js
```

成功すると、Discordチャンネルに以下のような通知が届きます:

```
🧪 Discord Test Notification

Project: test-project
Type: completed
Session Token: ABC12345

💬 Send New Command
Reply with: ABC12345 <your command>
```

## ⚡ よくあるエラーと解決方法

### エラー: `TokenInvalid`
**原因**: Botトークンが無効または間違っている
**解決**: `.env`ファイルの`DISCORD_BOT_TOKEN`を確認して、Discord Developer Portalから新しいトークンを取得

### エラー: `Unknown Channel`
**原因**: チャンネルIDが間違っている
**解決**:
1. Discordで開発者モードを有効化（ユーザー設定 → 詳細設定 → 開発者モード）
2. 通知を受け取りたいチャンネルを右クリック
3. 「IDをコピー」を選択
4. `.env`の`DISCORD_CHANNEL_ID`に貼り付け

### エラー: `Connection timeout`
**原因**: ネットワーク接続の問題またはDiscordのサービス障害
**解決**:
1. インターネット接続を確認
2. [Discord Status](https://discordstatus.com/)で障害情報を確認
3. しばらく待ってから再試行

## 📚 完全なドキュメント

詳細な設定方法とトラブルシューティングについては、以下のドキュメントを参照してください:

- [完全セットアップガイド (日本語)](DISCORD_SETUP_JA.md)
- [メインREADME (英語)](README.md)

## 💬 サポート

問題が解決しない場合:
1. `LOG_LEVEL=debug`で詳細ログを確認
2. [GitHub Issues](https://github.com/JessyTsui/Claude-Code-Remote/issues)で報告

---

**🎉 設定が完了したら、Claude Codeからの通知をお楽しみください！**
