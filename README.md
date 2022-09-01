# Habiticord
[Habitica](https://habitica.com)をDiscord上で楽しむためのDiscord Botです。

GCPにデプロイすると無料枠で動かせてイイカンジです。

- https://github.com/ver-1000000/habiticord.git

## Botの使い方
DiscordサーバーにHabiticordがログインすると、1時間ほどでHabiticordの提供する`habitica`スラッシュコマンド郡がサーバーに登録されます。

その後、ユーザーごとに`habitica register`コマンドを入力して、
HabiticaユーザーIDとHabitica API トークンを入力することで
APIを利用した`habitica`スラッシュコマンドが機能するようになります。

## ローカルでの環境構築
### 前提
- 対象のDiscordサーバーにBOTがログインしている状態にしておくこと
- `node.js`のいい感じの環境を整えておくこと

### 手順
1. 本リポジトリをクローンし、`npm ci`を実行する
2. プロジェクトのルートディレクトリにある`.env.sample`をコピーして`.env`を作成する
3. `.env`ファイルを編集して環境変数を設定する
4. `npm run dev`を行うと、開発用サーバーが立ち上がり、ファイルの変更検知込のビルド&サービングを行う

## 環境変数(.envファイル)の説明
- `DISCORD_TOKEN`: Discord APIを利用するために必要なトークン
- `DATABASE_URL`: Prismaで利用するSQLiteのdbファイルパス
- `HABITICA_ENDPOINT`: HabiticaのAPIエンドポイント
