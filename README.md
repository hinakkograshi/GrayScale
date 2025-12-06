# GrayScale (SwiftWasm サンプル)

## 概要 (Overview)

このプロジェクトは、**Swift for WebAssembly (SwiftWasm)** とJavaScriptのグレースケールの計算処理のパフォーマンスを比較するために作成したWebアプリケーションのサンプルです。

Webブラウザ上でユーザーが選択した画像を読み込み、**リアルタイムでグレースケールに変換する**機能を実現しています。SwiftコードがWebAssemblyとしてコンパイルされ、いかに高速にDOM操作やCanvas APIによるピクセル操作を行えるかを示すデモンストレーションです。

## 前提条件 (Prerequisites)

このサンプルをビルドおよび実行するためには、以下の環境が必要です。

1.  **SwiftWasm ツールチェイン / SDK:**

      * Swift for WebAssembly をコンパイルするためのSDKがインストールされている必要があります。
      * **推奨バージョン:** `swift-6.2.1-RELEASE_wasm` 相当
      * 導入方法については [Getting Started with Swift SDKs for WebAssembly](https://www.swift.org/documentation/articles/wasm-getting-started.html#embedded-swift-support) を参照してください。

2.  **`http-server` (ローカルWebサーバー):**

      * ビルドされたファイルをHTTP経由で提供するために必要です。
      * Node.jsがインストールされていれば、以下のコマンドでインストールできます。
        ```bash
        npm install -g http-server
        ```

## 🔨 ビルドと実行 (Build and Run)

以下の手順に従って、プロジェクトをビルドし、ブラウザで動作させることができます。

### 1\. SwiftWasm SDK の設定

使用するSwiftWasm SDKのバージョンを環境変数 `SWIFT_SDK_ID` に設定します。

```bash
export SWIFT_SDK_ID=swift-6.2.1-RELEASE_wasm
```

> 💡 **ヒント:** インストールされているSDKのバージョンと一致させるようにしてください。

### 2\. プロジェクトのコンパイル (WebAssembly)

`swift package` コマンドを使用し、WebAssembly (Wasm) ターゲット向けにプロジェクトをコンパイルします。

```bash
swift package -Xswiftc -Ounchecked --swift-sdk $SWIFT_SDK_ID -c release js --use-cdn
```

| オプション | 目的 |
| :--- | :--- |
| `-Xswiftc -Ounchecked` | 最適化レベルを\*\*`Ounchecked`\*\*に設定し、パフォーマンスを最大化します。 |
| `--swift-sdk $SWIFT_SDK_ID` | 前手順で設定したSDKを使用してビルドを行います。 |
| `-c release` | **リリース**モードでビルドします。 |
| `js --use-cdn` | Wasmモジュール実行に必要なSwiftランタイムファイルなどをCDNから取得するよう設定します。 |

ビルドが成功すると、実行可能なファイルは通常 `./.build/release/` ディレクトリ配下に配置されます。

### 3\. ローカルサーバーの起動

ビルド結果をホストするために、`http-server`を起動します。

```bash
http-server
```

サーバーが起動すると、アクセスすべきアドレス（例: `http://127.0.0.1:8080`）がコンソールに表示されます。

### 4\. ブラウザでの確認

Webブラウザで表示されたアドレスにアクセスし、「GrayScale」Webアプリケーションを起動。
画像を選択し、グレースケール化(JavaScript)ボタンとグレースケール化(JavaScript)ボタンとグレースケール化(SwiftWasm)ボタンでグレースケール処理を比較する。

※解像度が高い8Kの画像等で比較すると速度の違いがわかりやすいです。

### 8K画像のグレースケール処理の計算処理の出力例
#### JavaScriptのグレースケール処理
グレースケール処理時間: 約150ミリ秒
<img width="800" alt="スクリーンショット 2025-12-06 13 09 41" src="https://github.com/user-attachments/assets/163ef138-12cc-403d-a948-d4780fa2d180" />

#### SwiftWasmのグレースケール処理
グレースケール処理時間: 約100ミリ秒
<img width="800" alt="スクリーンショット 2025-12-06 12 27 26" src="https://github.com/user-attachments/assets/89585bbe-abcd-43e8-b2ef-051834c9ba8b" />
