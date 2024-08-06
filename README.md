# GLBファイル表示アプリ

このプロジェクトは、TypeScriptとViteを使用してGLBファイルを表示するシンプルなWebアプリケーションです。Three.jsを使用して3Dモデルを表示し、Draco圧縮されたファイルのサポートも追加されています。

## プロジェクトのセットアップ

### 必要なツールとライブラリ

- Node.jsとnpm
- TypeScript
- Three.js
- Draco Loader
- Vite

### プロジェクトのディレクトリ構造

```plaintext
my-app/
├── src/
│   ├── index.html
│   ├── main.ts
│   └── style.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## インストール手順

### 1. プロジェクトのクローンまたは作成

```sh
git clone <リポジトリのURL>
cd 24_08_05_08_45_36_047.glb-viewer
```

### 2. 依存関係のインストール

```sh
npm install
```

### 3. 開発サーバーの起動

```sh
npm run dev
```

ブラウザが自動的に開き、`src/index.html`が表示されます。

## 使用方法

1. 開発サーバーを起動し、ブラウザで`src/index.html`を開きます。
2. ファイル入力フィールドからGLBファイルを選択します。
3. 3Dモデルが表示されます。
