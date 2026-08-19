# 0.8.0: default SVG overlay backend

## 追加内容

- `bubbleRenderBackend`の既定値を`"svg-overlay"`へ変更する。
- `"scratch-render"`は明示指定できるrollback backendとして保持する。
- `renderer.addOverlay(root, "scale")`上の共有SVG rootにBubble surfaceを描画する。
- host-neutralな`svgOverlayTextCapability`と、解放可能な`svgOverlayImageCapability`を公開する。
- SVG Text 0.8.1を通常dependencyとし、standalone拡張がない場合は`createSvgTextLayoutComposition().layoutText()`、ロード済みの場合は公開`getLayoutCapability()`から同じnamed-style registryの行layoutを変換する。
- handoffのない古いstandalone SVG Textが存在する場合、named styleを既定値へ黙って置換せず、明示errorまたは設定済みscratch-render fallbackを使う。
- Bubble側の`createAssetManagerSvgOverlayImageCapability()`でAsset Managerの汎用DOM resourceを変換する。依存方向はBubbleからAsset Managerへの一方向を維持する。
- stock Asset Manager 0.12.1を別拡張として読み込んだ場合、Bubbleが公開`getDOMImageCapability()`を遅延取得し、Asset Managerブロックで登録された同じregistryへ自動接続する。
- overlay API未対応hostは`BUBBLE-RUNTIME-004`を返す。`svgOverlayUnsupportedBehavior: "fallback"`を明示した場合だけ既存backendへ戻る。

## 自動検証結果

2026-08-18時点のunit testでは、次を合格条件としている。

- optionsを省略した既定経路でshow、text更新、shake、shape animationを行っても、Bubbleから`createDrawable()`、`createSVGSkin()`、`createBitmapSkin()`を呼ばない（許容値: 0回）。
- 2つのBubbleが1つのrootを共有し、最後のclose後に`removeOverlay()`を1回呼ぶ（許容値: 残存root 0、重複remove 0）。
- native size変更後にrootの`viewBox`を同期し、現在表示中のtextと`RESERVED`全文layoutを再計算する。
- `script`、event handler、`foreignObject`、未許可data URLを拒否する。
- capability所有のblob URLをreplacement／close時に各1回解放する。
- renderer cleanupが失敗した場合も、残りのlistener、DOM、image leaseの解放を継続してerrorを集約する。
- Asset Managerのsanitize済みSVG resourceをBubble側adapter経由で描画し、close時にleaseを1回解放する。
- SVG Textのhost-neutral layoutをBubble側adapterで変換し、renderer skinを生成せず行座標を維持する。

## release前のmanual gate

上流の[turbowarp-svg-text#26](https://github.com/kubohiroya/turbowarp-svg-text/issues/26)で公開されたhost-neutral layoutを0.8.0の通常dependencyとして採用する。[turbowarp-asset-manager#103](https://github.com/kubohiroya/turbowarp-asset-manager/issues/103)のDOM image resourceをBubble所有adapterで変換し、stock拡張間のhandoffには[turbowarp-asset-manager#106](https://github.com/kubohiroya/turbowarp-asset-manager/issues/106)で公開された0.12.1 APIを使う。既定値変更後も次のmanual gateをrelease前に実施し、実測値をこの表へ記録する。

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

設定へ`bubbleRenderBackend: "scratch-render"`を明示する。公開済みの設定値と既存backendは削除せず、重大なhost回帰がある場合は明示errorまたはpatch releaseで対処する。暗黙fallbackは行わないため、rollbackはhost側で確認できる。
