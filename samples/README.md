# 最小デモ

[Editorで開く](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-bubble%2Fsamples%2Fsay-and-close-bubble.sb3) · [SB3をダウンロード](https://kubohiroya.github.io/turbowarp-bubble/samples/say-and-close-bubble.sb3)

緑の旗で吹き出しが表示され、Spaceで閉じて描画資源を解放します。停止後も緑の旗から再実行できます。

公式TurboWarp Editorでカスタム拡張の確認画面の **Run extension without sandbox** をチェックし、**Allow** を選択してください。SB3はこのリポジトリの配布JSを内包します。 文字のみの表示は内蔵レイアウトを使い、SVG Text/Asset Cache/Async Inputの追加読み込みは不要です。

`say-and-close-bubble/project.json` とSVGが編集用ソースです。`samples/manifest.json` が配布設定と期待値です。編集後はNode.js 26で `node scripts/build-samples.mjs`、`node scripts/build-samples.mjs --check`、`node --test scripts/verify-samples.mjs` を実行し、生成SB3をコミットしてください。`node scripts/prepare-pages.mjs` は既存docs/distと配布ファイルを `_site` に配置します。本体フラグの既定値は変更しません。
