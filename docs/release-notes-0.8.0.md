# 0.8.0（未リリース）: opt-in SVG overlay backend

## 追加内容

- `bubbleRenderBackend: "svg-overlay"`をopt-inで追加する。
- 初期既定値`"scratch-render"`と既存backendを保持する。
- `renderer.addOverlay(root, "scale")`上の共有SVG rootにBubble surfaceを描画する。
- host-neutralな`svgOverlayTextCapability`と、解放可能な`svgOverlayImageCapability`を公開する。
- `createSvgTextOverlayTextCapability()`でSVG Text 0.6.xの行layoutを座標・角丸ごと変換する。
- Bubble側の`createAssetManagerSvgOverlayImageCapability()`でAsset Managerの汎用DOM resourceを変換する。依存方向はBubbleからAsset Managerへの一方向を維持する。
- overlay API／text capability未対応hostは`BUBBLE-RUNTIME-004`を返す。`svgOverlayUnsupportedBehavior: "fallback"`を明示した場合だけ既存backendへ戻る。

## 自動検証結果

2026-08-18時点のunit testでは、次を合格条件としている。

- `svg-overlay`でshow、text更新、shake、shape animationを行っても、Bubbleから`createDrawable()`、`createSVGSkin()`、`createBitmapSkin()`を呼ばない（許容値: 0回）。
- 2つのBubbleが1つのrootを共有し、最後のclose後に`removeOverlay()`を1回呼ぶ（許容値: 残存root 0、重複remove 0）。
- native size変更後にrootの`viewBox`を同期し、現在表示中のtextと`RESERVED`全文layoutを再計算する。
- `script`、event handler、`foreignObject`、未許可data URLを拒否する。
- capability所有のblob URLをreplacement／close時に各1回解放する。
- renderer cleanupが失敗した場合も、残りのlistener、DOM、image leaseの解放を継続してerrorを集約する。
- Asset Managerのsanitize済みSVG resourceをBubble側adapter経由で描画し、close時にleaseを1回解放する。
- SVG Textのhost-neutral layoutをBubble側adapterで変換し、renderer skinを生成せず行座標を維持する。

## release前のmanual gate

上流の[turbowarp-svg-text#26](https://github.com/kubohiroya/turbowarp-svg-text/issues/26)は0.6.0、[turbowarp-asset-manager#103](https://github.com/kubohiroya/turbowarp-asset-manager/issues/103)は0.12.0として公開済みであり、Bubbleの開発依存・peer dependencyへ反映した。次のmanual gateが未完了の間は`svg-overlay`をproduction既定値にしない。

| 項目                       | host                                 | 許容基準                                                  | 結果   |
| -------------------------- | ------------------------------------ | --------------------------------------------------------- | ------ |
| say／think、全visual style | Web、Desktop、Packager               | reference screenshotの主要geometry差異なし                | 未測定 |
| actor／background配置      | native 480×360と変更size、fullscreen | stage外clip、tail方向、centerに回帰なし                   | 未測定 |
| typewriter                 | 1,000 update                         | Chromium readback警告0、`Silhouette.unlazy()`増分0        | 未測定 |
| shape／shake／zoom         | 各10秒                               | dropped frame率が既存backend比+5 percentage points以内    | 未測定 |
| memory／lifecycle          | show／replace／stopを100回           | close後のBubble DOM、object URL、animation、listener残存0 | 未測定 |
| raw canvas capture         | `toDataURL()`、`captureStream()`     | Bubbleが含まれない既知制約を確認                          | 未測定 |

## capture制約

SVG overlayはbrowser／OSの最終compositeには含まれるが、WebGL canvasだけを取得する`renderer.canvas.toDataURL()`、`toBlob()`、`captureStream()`には含まれない。初期実装では専用compositorを提供しない。

## rollback

設定を`bubbleRenderBackend: "scratch-render"`へ戻す。公開済みの設定値と既存backendは削除せず、重大なhost回帰がある場合は`svg-overlay`選択時の明示errorまたはpatch releaseで対処する。既定値は変更しない。
