# Docker デプロイメントガイド 🐳

Claude Code RemoteをDockerで常時稼働させるための完全ガイドです。

## 📋 目次

1. [前提条件](#前提条件)
2. [クイックスタート](#クイックスタート)
3. [設定](#設定)
4. [運用](#運用)
5. [トラブルシューティング](#トラブルシューティング)

## 前提条件

### 必須ソフトウェア

- Docker Engine 20.10以上
- Docker Compose v2.0以上

### インストール確認

```bash
docker --version
docker compose version
```

## クイックスタート

### 1. 環境変数の設定

`.env`ファイルを作成（`.env.example`を参考に）：

```bash
cp .env.example .env
nano .env  # または vim .env
```

最低限必要な設定：

```env
# Discord設定（必須）
DISCORD_ENABLED=true
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
DISCORD_WEBHOOK_PORT=3023

# オプション: Telegram
TELEGRAM_ENABLED=false

# オプション: Email
EMAIL_ENABLED=false

# ログレベル
LOG_LEVEL=info
```

### 2. Dockerイメージのビルド

```bash
docker compose build
```

### 3. サービスの起動

**Discordのみ（推奨）:**

```bash
docker compose up -d
```

**全サービス起動:**

```bash
docker compose --profile telegram --profile line up -d
```

### 4. 動作確認

```bash
# ログを確認
docker compose logs -f discord-webhook

# ステータス確認
docker compose ps

# Health check
curl http://localhost:3023/health
```

## 設定

### サービス構成

| サービス | 説明 | ポート | Profile |
|---------|------|--------|---------|
| discord-webhook | Discord通知受信（メイン） | 3023 | default |
| telegram-webhook | Telegram通知受信 | 3005 | telegram |
| line-webhook | LINE通知受信 | 3000 | line |

### Profile の使い方

Profileを使うことで、必要なサービスだけを起動できます：

```bash
# Discordのみ（デフォルト）
docker compose up -d

# Discord + Telegram
docker compose --profile telegram up -d

# Discord + LINE
docker compose --profile line up -d

# 全サービス
docker compose --profile telegram --profile line up -d
```

### 環境変数の詳細

#### Discord設定

```env
DISCORD_ENABLED=true                      # Discord通知を有効化
DISCORD_BOT_TOKEN=MTQzNj...               # Botトークン（必須）
DISCORD_CHANNEL_ID=1437100351336747189    # チャンネルID（必須）
DISCORD_SERVER_ID=1113458566200123456     # サーバーID（オプション）
DISCORD_WEBHOOK_PORT=3023                 # Webhookポート
```

#### Telegram設定

```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_GROUP_ID=your_group_id  # オプション
TELEGRAM_WEBHOOK_PORT=3005
```

#### システム設定

```env
LOG_LEVEL=info                    # debug, info, warn, error
NODE_ENV=production
INJECTION_MODE=tmux              # tmux, pty
```

### tmux統合の設定

Dockerコンテナからホストのtmuxセッションにアクセスするため、tmuxソケットをマウントしています：

```yaml
volumes:
  - /tmp/tmux-${UID:-1000}:/tmp/tmux-${UID:-1000}
```

**UID確認方法:**

```bash
echo $UID
```

## 運用

### 基本操作

#### サービスの起動

```bash
docker compose up -d
```

#### サービスの停止

```bash
docker compose down
```

#### サービスの再起動

```bash
docker compose restart
```

#### 特定サービスの再起動

```bash
docker compose restart discord-webhook
```

### ログ管理

#### ログの確認

```bash
# 全サービスのログ
docker compose logs

# 特定サービスのログ
docker compose logs discord-webhook

# ログをフォロー（リアルタイム表示）
docker compose logs -f

# 最新100行のログ
docker compose logs --tail=100

# タイムスタンプ付き
docker compose logs -t
```

#### ログの永続化

ログは自動的に `./logs` ディレクトリに保存されます：

```bash
ls -la logs/
```

### セッション管理

セッションファイルは `./sessions` ディレクトリに保存されます：

```bash
# セッション一覧
ls -la sessions/

# セッション内容を確認
cat sessions/ABC12345.json
```

### Health Check

各サービスには自動Health checkが設定されています：

```bash
# Dockerステータスで確認
docker compose ps

# 手動でHealth check
curl http://localhost:3023/health

# 応答例:
# {"status":"ok","service":"discord-webhook"}
```

### 更新とメンテナンス

#### コードを更新した場合

```bash
# サービス停止
docker compose down

# イメージ再ビルド
docker compose build

# サービス再起動
docker compose up -d
```

#### 設定（.env）を更新した場合

```bash
# 再起動のみでOK（再ビルド不要）
docker compose restart
```

### バックアップ

重要なデータのバックアップ：

```bash
# セッションデータのバックアップ
tar -czf backup-sessions-$(date +%Y%m%d).tar.gz sessions/

# .envファイルのバックアップ（機密情報注意）
cp .env .env.backup

# ログのバックアップ
tar -czf backup-logs-$(date +%Y%m%d).tar.gz logs/
```

## トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker compose logs

# 設定を検証
docker compose config

# ポート使用状況を確認
lsof -i :3023
```

### tmux連携が動作しない

**症状**: Discordで送信したコマンドがtmuxに反映されない

**確認事項**:

1. **tmuxソケットのマウント確認:**

```bash
# ホストのtmuxソケット位置を確認
echo /tmp/tmux-$UID

# コンテナ内で確認
docker compose exec discord-webhook ls -la /tmp/tmux-$UID/
```

2. **tmuxセッションの存在確認:**

```bash
# ホストで確認
tmux list-sessions

# 存在しない場合は作成
tmux new-session -d -s claude-real
```

3. **権限の確認:**

```bash
# tmuxソケットの権限
ls -la /tmp/tmux-$UID/

# 必要に応じて権限修正
chmod 700 /tmp/tmux-$UID/
```

### Discord Botが接続できない

```bash
# 診断ツールを実行
docker compose run --rm discord-webhook node check-discord-setup.js

# 環境変数を確認
docker compose exec discord-webhook env | grep DISCORD
```

### メモリ使用量が多い

```bash
# コンテナのリソース使用状況
docker stats

# メモリ制限を追加（docker-compose.yml）:
services:
  discord-webhook:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### ディスク容量の確認

```bash
# Dockerのディスク使用状況
docker system df

# 不要なイメージ・コンテナを削除
docker system prune -a
```

### ログが大きくなりすぎた場合

```bash
# ログサイズを確認
du -sh logs/

# 古いログを削除
find logs/ -type f -mtime +30 -delete

# または Docker のログローテーション設定:
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 本番環境推奨設定

### docker-compose.prod.yml

本番環境用の設定例：

```yaml
version: '3.8'

services:
  discord-webhook:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

使用方法：

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 自動起動の設定

システム起動時に自動でDockerコンテナを起動：

```bash
# すでに restart: unless-stopped が設定されているため、
# Dockerサービスが起動すれば自動的にコンテナも起動します

# Dockerサービスの自動起動を確認（Linux）:
sudo systemctl enable docker

# macOSの場合はDocker Desktopの設定で「Start Docker Desktop when you log in」を有効化
```

### モニタリング

Prometheusなどと連携する場合：

```bash
# メトリクスエンドポイントを追加（今後の拡張）
curl http://localhost:3023/metrics
```

## よくある質問

### Q: Dockerなしで従来通り使えますか？

A: はい。`node start-discord-webhook.js`で直接起動できます。

### Q: 複数のDiscordチャンネルで使えますか？

A: 現在は1チャンネルのみです。複数チャンネル対応は今後の機能追加予定です。

### Q: AWS/GCPで運用できますか？

A: はい。Docker Composeが動作する環境であれば運用可能です。
   - AWS: ECS, EC2
   - GCP: Cloud Run, GCE
   - Azure: Container Instances

### Q: データの永続化は大丈夫ですか？

A: sessions/とlogs/をvolumeマウントしているため、コンテナを削除してもデータは保持されます。

## 次のステップ

1. **監視の追加**: Prometheus + Grafanaでメトリクス監視
2. **CI/CD**: GitHub Actionsで自動デプロイ
3. **セキュリティ**: 非rootユーザーでの実行、secretsの管理
4. **スケーリング**: Kubernetes対応

---

**🎉 これでDocker環境での常時稼働が可能になりました！**

問題が発生した場合は、[GitHub Issues](https://github.com/JessyTsui/Claude-Code-Remote/issues)でサポートを受けられます。
