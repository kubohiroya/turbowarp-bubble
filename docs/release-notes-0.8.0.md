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

2026-08-19時点のunit testでは、次を合格条件としている。

- optionsを省略した既定経路でshow、text更新、shake、shape animationを行っても、Bubbleから`createDrawable()`、`createSVGSkin()`、`createBitmapSkin()`を呼ばない（許容値: 0回）。
- 2つのBubbleが1つのrootを共有し、最後のclose後に`removeOverlay()`を1回呼ぶ（許容値: 残存root 0、重複remove 0）。
- native size変更後にrootの`viewBox`を同期し、現在表示中のtextと`RESERVED`全文layoutを再計算する。
- `script`、event handler、`foreignObject`、未許可data URLを拒否する。
- capability所有のblob URLをreplacement／close時に各1回解放する。
- renderer cleanupが失敗した場合も、残りのlistener、DOM、image leaseの解放を継続してerrorを集約する。
- Asset Managerのsanitize済みSVG resourceをBubble側adapter経由で描画し、close時にleaseを1回解放する。
- SVG Textのhost-neutral layoutをBubble側adapterで変換し、renderer skinを生成せず行座標を維持する。stock named styleの再定義後は、同じ公開handoffから次回layoutへ新しいfont、color、size、alignment、改行layoutを反映する。

## Web smoke結果

2026-08-20にcommit `9b01605`からbuildしたrelease候補の`dist/turbowarp-bubble.js`を、TurboWarp Webのカスタム拡張機能へtext入力し、unsandboxedで読み込んだ。Chrome／macOSで`define bubble style`、say／think、style／reveal／animation／closeの各blockを実行した結果は次のとおり。

- Bubble paletteが登録され、sprite上方に`NORMAL`のsay bubbleが表示された。
- `[data-bubble-render-backend="svg-overlay"]`は1個で、DOMへ接続済みだった。
- rootは`viewBox="0 0 480 360"`、属性上の幅・高さとCSS上の表示領域はいずれも480×360だった。
- `NORMAL`、`THINKING`、`DREAMING`、`YELLING`、`OFF_PANEL`、`WAVY`、`WHISPERING`、`ANNOUNCEMENT`、`NARRATION`、`NO_BUBBLE`の全10styleを表示した。`THINKING`はbody `path` 1個とtrail `circle` 2個、`DREAMING`は`circle` 3個、`NO_BUBBLE`はbodyを非表示にしてtextだけを維持した。
- short textの`THINKING`／`DREAMING`で固定Bezier制御点が自己交差する問題をこの確認で検出した。cloud bodyへ176×96の最小viewportと比例制御点によるclosed splineを導入し、修正版で滑らかな輪郭を再確認した。
- root内の`script`、`foreignObject`、inline event handlerは0個だった。
- 初回登録時に検出したTurboWarp VMの`Unexpected input recieved in replaceUnsafeChars`は、`color2`／`color3`の明示後のrelease候補bundleでは再現せず、extension登録から全smoke終了まで新規warning／errorは0件だった。
- revealを`CHARACTER`、0.05秒に設定したsayは`H`、`Hello`、`Hello!`の順に進み、Chromiumのreadback、`Silhouette.unlazy()`、`getImageData()`関連warningは0件だった。
- shake中はsurface transformが変化して終了時に基準位置へ戻り、shape animationは`NORMAL`から`WAVY`へ完了した。close後はrootが0個となり、再度sayするとroot 1個へ復帰した。

stageはnative 480×360、small表示240×180、fullscreen表示3152×2364、custom native 640×480で確認した。各表示でrootの属性と`viewBox`はnative sizeに一致し、CSS表示領域はhostの拡大縮小へ追随した。sprite相対配置に加え、Stage targetの`HEADER_LIKE`も640×480上端のsafe area内へ表示された。最後に480×360、sprite相対`NORMAL`へ戻した。

## Desktop smoke結果

2026-08-20にTurboWarp Desktop 1.16.0へ同じrelease候補をtext入力し、unsandboxedで読み込んだ。実アプリのsprite／Stage targetとVM primitiveを使って確認した結果は次のとおり。

- Bubble paletteと全28 primitiveが登録され、say／thinkと全10 visual styleが表示された。short textの`THINKING`は176×96・trail `circle` 2個、`DREAMING`は176×96・`circle` 3個だった。
- revealは`H`、`Hell`、`Hello!`の順に進んだ。shakeはsurface transformを変化させて基準位置へ戻り、shape animationは`NORMAL`から`WAVY`へ完了した。
- native 480×360、small表示240×180、fullscreen表示955×716、custom native 640×480でrootがstageへ追随した。sprite相対配置とStage targetの`HEADER_LIKE`を確認した。
- spriteとStageの2 surfaceを同時表示した後、Stageのcloseで1 surface、spriteのcloseでroot 0となった。
- 正しいstage sizeを設定して再実行した区間では、consoleのwarning／errorは0件だった。最後にstageを480×360へ戻し、root 0を確認した。

## Packager smoke結果

2026-08-20にTurboWarp Packager Standalone 3.13.0で、Bubble blockを含むDesktopプロジェクトからプレーンHTMLのpreviewを生成した。Packagerの高度な設定ではrelease候補のdata URLがcustom extensionとして検出され、cached copyの埋め込みが有効だった。生成playerではBubbleの全28 primitiveがロードされた。

- sayで全10 visual styleを表示し、明示したthinkでもshort `DREAMING`が176×96・trail `circle` 3個となった。short `THINKING`は176×96・`circle` 2個だった。
- revealは`H`、`Hel`、`Hello!`の順に進んだ。`zoomIn`はscale 0.01から1へ完了し、shakeは位置を変化させて基準位置へ戻り、shape animationは`WAVY`へ完了した。
- sprite相対配置に加え、Stage targetの`HEADER_LIKE`をnative 480×360のsafe area内で確認した。
- Bubble表示中にcanvasの`toDataURL()`はPNG data URLを返し、`captureStream()`はvideo trackを1本返した。Bubble rootはcanvasの子ではなく、隣接する`.scratch-render-overlays`内にあるため、両APIにBubbleが含まれない既知制約を確認した。
- show／replace／closeを100回実行した後、Bubble root、surface、overlay childは0で、runtime listener数の増分も0だった。
- 全smoke終了までconsoleのwarning／errorは0件だった。

## deterministic benchmark結果

`pnpm benchmark:render-backends`は、happy-dom上の同一fake rendererと決定的schedulerを使い、`svg-overlay`とrollback用`scratch-render`を同じ入力で比較する。2026-08-20にNode.js v26.7.0／arm64 macOSで実行した代表値は次のとおり。

| workload                                       | svg-overlay                              | scratch-render                           | 判定                                |
| ---------------------------------------------- | ---------------------------------------- | ---------------------------------------- | ----------------------------------- |
| typewriter、1,000回                            | 62.254 ms、skin／drawable生成0           | 8.720 ms、skin 1,002、drawable 2         | overlayのrenderer resource生成0     |
| shape／shake／zoom、各10秒・合計1,875 callback | callback超過0%、p95 0.352 ms             | callback超過0%、p95 0.157 ms             | 差0 percentage points、許容値+5以内 |
| show／text・style更新／close、100回            | DOM／listener／skin／drawable残存すべて0 | DOM／listener／skin／drawable残存すべて0 | lifecycle residual 0                |

このbenchmarkが測るのはJavaScript callbackのCPU時間、renderer API呼び出し数、明示resourceの解放である。実browserのlayout／paint／composite、GC後の保持heap、host固有のframe dropを代替しない。数値は環境と実行ごとに変動するため、release判定ではresource残存とpercentage-point基準を主要判定値とする。

## release前のmanual gate

上流の[turbowarp-svg-text#26](https://github.com/kubohiroya/turbowarp-svg-text/issues/26)で公開されたhost-neutral layoutを0.8.0の通常dependencyとして採用する。[turbowarp-asset-manager#103](https://github.com/kubohiroya/turbowarp-asset-manager/issues/103)のDOM image resourceをBubble所有adapterで変換し、stock拡張間のhandoffには[turbowarp-asset-manager#106](https://github.com/kubohiroya/turbowarp-asset-manager/issues/106)で公開された0.12.1 APIを使う。既定値変更後も次のmanual gateをrelease前に実施し、実測値をこの表へ記録する。

| 項目                       | host                                 | 許容基準                                                  | 結果                                                                                                     |
| -------------------------- | ------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| say／think、全visual style | Web、Desktop、Packager               | reference screenshotの主要geometry差異なし                | 3 hostでsay／thinkと全10styleを確認。short cloudの最小寸法とtrail数も一致                                |
| actor／background配置      | native 480×360と変更size、fullscreen | stage外clip、tail方向、centerに回帰なし                   | Web／Desktopで480×360、small、fullscreen、640×480、Packagerで480×360のactor／backgroundを確認            |
| typewriter                 | 1,000 update                         | Chromium readback警告0、`Silhouette.unlazy()`増分0        | harnessで1,000 updateとresource生成0。3 hostの実revealで関連warning 0                                    |
| shape／shake／zoom         | 各10秒                               | dropped frame率が既存backend比+5 percentage points以内    | harnessで各10秒・0%対0%、差0 points。Web／Desktopでshape／shake、Packagerでshape／shake／zoomをsmoke済み |
| memory／lifecycle          | show／replace／stopを100回           | close後のBubble DOM、object URL、animation、listener残存0 | harnessの全resource残存0。Packager実hostの100回後にDOM、surface、overlay child、listener増分0            |
| raw canvas capture         | `toDataURL()`、`captureStream()`     | Bubbleが含まれない既知制約を確認                          | Packagerで両APIの成功と、Bubble rootがcanvas外のsibling overlayにあることを確認                          |

## capture制約

SVG overlayはbrowser／OSの最終compositeには含まれるが、WebGL canvasだけを取得する`renderer.canvas.toDataURL()`、`toBlob()`、`captureStream()`には含まれない。初期実装では専用compositorを提供しない。

## rollback

設定へ`bubbleRenderBackend: "scratch-render"`を明示する。公開済みの設定値と既存backendは削除せず、重大なhost回帰がある場合は明示errorまたはpatch releaseで対処する。暗黙fallbackは行わないため、rollbackはhost側で確認できる。
