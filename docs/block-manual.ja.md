# TurboWarp Bubble ブロック利用マニュアル

このマニュアルでは、`turbowarp-bubble`をTurboWarpのカスタム拡張機能として使い、SVG本体、文字、キャラクター表情、目パチ、口パク、「次へ」アイコンを組み合わせたBubbleを表示します。

![Next1とNext2を個別登録し、入力listenerを準備してBubble内蔵待機を使うブロック例](./assets/block-quick-start.svg)

## 1. 必要な拡張機能

入力待ちを含む完全な例では6つの拡張機能を使います。TurboWarpの拡張機能ライブラリからTemporary Variablesを追加し、選択した機能に必要なカスタム拡張機能を「サンドボックスなしで実行」を許可して読み込みます。文字BubbleにはSVG TextとBubbleが必要です。portrait、lip-sync、continue indicator、フルボイス、表示効果音などのメディアアセットにはAsset Managerが必要です。Async InputとRuntime ExpressionはBubble待機を使う場合だけ必要です。

| 順番 | 拡張機能                 | 読み込み先                                                                                               |
| ---: | ------------------------ | -------------------------------------------------------------------------------------------------------- |
|    1 | Temporary Variables      | TurboWarpの拡張機能ライブラリから追加                                                                    |
|    2 | Async Input 0.3.0        | `https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-async-input@0.3.0/dist/async-input.js`               |
|    3 | Runtime Expression 0.3.0 | `https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-runtime-expression@0.3.0/dist/runtime-expression.js` |
|    4 | Asset Manager 0.7.0      | `https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-asset-manager@0.7.0/dist/asset-manager.js`           |
|    5 | SVG Text 0.4.0           | `https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-svg-text@0.4.0/dist/svg-text.js`                     |
|    6 | Bubble 0.2.0             | npm公開後は`https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-bubble@0.2.0/dist/turbowarp-bubble.js`    |

開発中のBubbleを試す場合は、このリポジトリの`dist/turbowarp-bubble.js`をローカルカスタム拡張機能として読み込みます。表示時にSVG Textが、画像・メディア機能の使用時にAsset Managerが、待機開始時にAsync InputかRuntime Expressionが見つからなければ、Bubbleは明示的なエラーを返します。

参考：

- [Asset Manager 日本語ガイド](https://kubohiroya.github.io/turbowarp-asset-manager/ja/)
- [Async Input 日本語ガイド](https://kubohiroya.github.io/turbowarp-async-input/ja/)
- [Runtime Expression 日本語ガイド](https://kubohiroya.github.io/turbowarp-runtime-expression/ja/)
- [SVG Text 日本語ガイド](https://kubohiroya.github.io/turbowarp-svg-text/ja/)

## 2. 表情画像を準備する

例では`Assets`という素材用spriteに、次のcostumeを入れます。素材用spriteは画面上で非表示でも構いません。

| costume           | Asset Managerへ登録する名前 | 内容                                             |
| ----------------- | --------------------------- | ------------------------------------------------ |
| `HeroFace`        | `HeroFace`                  | 顔、髪、輪郭などのベース。動かす目と口は含めない |
| `HeroEyesOpen`    | `HeroEyesOpen`              | 開いた目だけを描いた透明差分                     |
| `HeroEyesClosed`  | `HeroEyesClosed`            | 閉じた目だけを描いた透明差分                     |
| `HeroMouthClosed` | `HeroMouthClosed`           | 閉じた口だけを描いた透明差分                     |
| `HeroMouthOpen`   | `HeroMouthOpen`             | 開いた口だけを描いた透明差分                     |
| `Next1`           | `Next1`                     | 「次へ」アイコンの1枚目                          |
| `Next2`           | `Next2`                     | 「次へ」アイコンの2枚目                          |

ベース、目、口の画像は同じcanvasサイズと同じ中心位置で作ります。差分画像の背景は透明にしてください。位置やcanvasサイズが異なると、レイヤーを重ねたときに目や口がずれます。

Asset Managerのブロックで各costumeを登録します。

```text
register resource [costume:Assets:HeroFace] as asset [HeroFace]
register resource [costume:Assets:HeroEyesOpen] as asset [HeroEyesOpen]
register resource [costume:Assets:HeroEyesClosed] as asset [HeroEyesClosed]
register resource [costume:Assets:HeroMouthClosed] as asset [HeroMouthClosed]
register resource [costume:Assets:HeroMouthOpen] as asset [HeroMouthOpen]
register resource [costume:Assets:Next1] as asset [Next1]
register resource [costume:Assets:Next2] as asset [Next2]
```

URL画像を使う場合は、`RESOURCE_ID`へHTTPS URLを指定します。Bubbleに設定できるのは、Asset Managerへ登録済みでMIME typeが`image/*`のアセットだけです。

## 3. 文字styleを定義する

SVG Textで、Bubbleの文字部分に使う名前付きstyleを定義します。

```text
define text style [dialogue-text]
  background [#fff4cc]
  text [#332200]
  font [Noto Sans JP]
  size [100]
  align [left]
  bubble direction [up]
```

Bubbleは`dialogue-text`という名前を参照します。文字styleとBubble styleはruntime状態なので、通常は緑の旗が押されたときに毎回定義します。

SVG Text 0.4.xは文字providerです。名前付き文字styleの定義、SVG文字skinの生成、文字幅の測定を担当します。Bubbleの配置は`set bubble placement`で設定し、tailや吹き出し外形はSVG Text providerの責務ではありません。

## 4. Bubble styleを定義する

まず、Bubble style名とSVG Textのstyle名を関連付けます。

```text
define bubble style [hero-dialogue] using text style [dialogue-text]
set bubble placement [up-right] for bubble style [hero-dialogue]
set bubble distance [12] for bubble style [hero-dialogue]
set bubble visual style [NORMAL] for bubble style [hero-dialogue]
set bubble tail length [18] for bubble style [hero-dialogue]
set bubble offset x [0] y [0] scale [100] % for bubble style [hero-dialogue]
```

### Actor相対と背景相対のplacement

![Actor相対の16方向・角度指定と、背景相対の3配置を比較する図](./assets/placement-guide.svg)

Actor相対の16方向は、各方向をActor、Bubble外形、tail、文字を含む独立したミニシーンで示しています。三角形tailの基部2点は実際の本体border上にあり、本体polygonとのJSClipper union後の単一pathを描くため、接合部に内部border線は残りません。

背景相対3図はStage外枠、安全領域、Bubble外形寸法、水平中央線、基準辺／中心を示します。外形はBubble側の共有`renderBubbleSvg`で生成しており、TurboWarp Editorで本体drawableを生成するrendererと同じです。

Actor相対では、Actor中心からBubble全体の中心へ向かう方向を指定します。menuには次の16正規方向があります。

```text
up / up-up-right / up-right / right-up-right
right / right-down-right / down-right / down-down-right
down / down-down-left / down-left / left-down-left
left / left-up-left / up-left / up-up-left
```

`north`、`north-northeast`、`northeast`などのcompass aliasも直接入力またはreporterから指定できます。数値はScratch方向と同じ0〜360度で、`0`は上、`90`は右、`180`は下、`270`は左、`360`は`0`へ正規化されます。任意角度は16方向へ丸めません。placementを設定しないstyleは`up-right`になります。

背景相対はActorから生える方向を持たず、Stage安全領域へ配置します。

| placement     | 配置                          |
| ------------- | ----------------------------- |
| `HEADER_LIKE` | Stage安全領域上部、水平中央   |
| `CENTER`      | Stage安全領域の水平・垂直中央 |
| `FOOTER_LIKE` | Stage安全領域下部、水平中央   |

背景相対placementはActorの座標、bounds、可視性に依存しません。Stageから`say`／`think`を実行する場合も、この3値のいずれかを設定します。背景相対のBubble bodyにはActorを指すtailを描画しません。

### Actorとの距離、tail、本体の位置・拡大率

![Actor相対のdistance、tail length、offset、scaleを実際のBubble SVGで比較する図](./assets/actor-transform-guide.svg)

- `distance`（既定`12`）はActor boundsからtail先端までの距離です。Actor boundsとは、描画済みActorをStage座標で囲むAABB（上下左右のbounding box）です。
- `tail length`（既定`18`）は通常位置におけるBubble borderからtail先端までの基準長です。
- `offset x/y/scale`（既定`[0, 0, 100]`）は、xが右正、yが上正、scaleが百分率です。`[10, -10, 120]`なら、本体を右10・下10へ補正し、120%にします。

scaleは外形だけでなく、SVG Textの文字、表情ベース・目パチ・口パク、次へアイコン、内部余白へ一体で適用されるため、表示上のフォントサイズも同じ比率で変わります。scaleだけを変更すると、本体中心を拡大半径分だけActorから離してActor側の間隔を維持します。x/y offsetはその後に加算し、tail先端を固定したまま本体borderとのunionを再生成するため、offset後のtail実長は基準値から変化します。

Stage端では、拡大後のBubble全体を画面内へ収めるクランプが優先されるため、指定距離を保てない場合があります。背景相対の`HEADER_LIKE`／`CENTER`／`FOOTER_LIKE`では、これらのActor相対設定を使用しません。

### 幅・自動改行・禁則処理

![maxWidthの違いによる自動改行と、日本語禁則処理の例](./assets/width-linebreak-guide.svg)

図の改行結果はproductionの`wrapText`を直接実行して生成しています。`@cto.af/linebreak`がUnicode UAX #14の改行候補を返し、`Intl.Segmenter`の書記素境界で絞り込んだ後、実測幅の上限に収まる最後の候補を選びます。句読点、閉じ括弧、小書き仮名、長音、結合emojiの途中で不自然に分割しません。

### Bubble visual styleの形状例

![10種類のBubble visual styleを同じSVG rendererで比較する図](./assets/bubble-style-gallery.svg)

形状候補は`NORMAL`、`THINKING`、`DREAMING`、`YELLING`、`OFF_PANEL`、`WAVY`、`WHISPERING`、`ANNOUNCEMENT`、`NARRATION`、`NO_BUBBLE`です。次のblockでBubble styleごとに選択します。

```text
set bubble visual style [YELLING] for bubble style [hero-dialogue]
```

図とTurboWarp Editorの本体drawableはBubble側の共有`renderBubbleSvg`から生成しています。三角形tailを持つ形状は[platener/jsclipper](https://github.com/platener/jsclipper)による本体との和集合です。`THINKING`／`DREAMING`は丸trailのためunion対象外です。Actor相対ではActorを向くtailを生成し、背景相対ではtailを付けません。`NO_BUBBLE`では本体drawableを非表示にして文字・表情などだけを表示します。

visual styleを省略した場合は`NORMAL`です。本体drawableは文字・portraitより先に生成して背面へ置きます。`close this bubble`、対象sprite／cloneの停止、runtime破棄時には、本体drawableとBubbleが所有するSVG skinも解放します。

`NEGATIVE`はfill colorとborder colorで表現できるため独立styleにはしません。orientationとsegmentsも公開入力にせず、幅、フォント、文字数、禁則処理後の行数から外形寸法を自動計算する方針です。

続けて、表情レイヤーと入力待ちアイコンを設定します。

```text
set portrait base [HeroFace] for bubble style [hero-dialogue]

set blink frames [HeroEyesOpen,HeroEyesClosed]
  every [0.4] seconds for bubble style [hero-dialogue]

set lip-sync frames [HeroMouthClosed,HeroMouthOpen]
  every [0.1] seconds for bubble style [hero-dialogue]

set continue frames [Next1,Next2]
  every [0.2] seconds for bubble style [hero-dialogue]
```

`ASSETS`はカンマ区切りのAsset Managerアセット名です。名前の前後の空白は除去されます。アセット名自体にカンマは使用できません。

- 目パチと口パクは1枚以上指定できます。1枚だけなら表示は固定されます。
- 「次へ」はループが分かるよう2枚以上必要です。
- `SECONDS`は0より大きい秒数です。
- `ASSETS`を空にすると、そのアニメーション設定を解除します。
- 表情ベースを空にするとportrait全体を解除します。

## 5. 逐次表示、音声、表示サイズ

Bubbleはセリフ全体を一度に描画するだけでなく、`CHARACTER`、`WORD`、`LINE`、`BLOCK`の単位で順次表示できます。`WORD`は形態素解析を行わず、空白または指定した区切り文字集合で分割します。区切り文字を表示するかどうかも選べます。

```text
set bubble reveal unit [CHARACTER] every [0.05] seconds layout [RESERVED] for bubble style [hero-dialogue]
set bubble word delimiters [ /] show [false] for bubble style [hero-dialogue]
set bubble reveal sound [Typewriter] for bubble style [hero-dialogue]
set bubble voice [HeroVoice] for bubble style [hero-dialogue]
say [海へ出発！] with bubble style [hero-dialogue]
finish [CHARACTER] with condition [input == "pressed"] or timeout after [10] seconds
```

`DYNAMIC`は表示単位ごとに吹き出しの大きさと配置を再計算し、`RESERVED`は最終的な文字量を先に計測して表示中の外形を予約します。`set bubble reveal sound`は単位ごと、`set bubble voice`は表示開始時にAsset Managerの名前付き音声を再生します。音声がなくても文字表示は利用できます。

## 6. セリフを表示して入力を待つ

`say`または`think`はBubbleを表示するとすぐ次のブロックへ進み、初期animation modeは`talking`になります。

```text
set runtime variable [input] to []
listen for key [Space] set runtime var [input] to [pressed]
listen for touch on this sprite set runtime var [input] to [pressed]
say [海へ出発！] with bubble style [hero-dialogue]
wait with this bubble until condition [input == "pressed"] or timeout after [10] seconds
close this bubble
```

まずTemporary Variablesで`input`を初期化してから、Async Inputのキー入力とタップのlistenerを登録します。Bubbleの待機ブロックは、`input == "pressed"`をRuntime Expressionへ委譲し、開始直後とVMの各フレームで評価します。待機中は自動的に`awaiting-continue`となり、口パクを停止して`set continue frames`の画像をループします。条件成立またはtimeout後は`idle`へ移り、次の`close this bubble`へ進みます。timeoutを`0`にすると時間制限なしです。

次の待機に入る前に`input`を空文字へ戻してください。前回の`pressed`が残っていると、次の条件が直ちに成立します。別のBubble表示、close、対象targetの停止、projectの開始・停止、runtime破棄では、targetが所有する待機とlistener、timerをキャンセルして解放します。

音声再生や別の文字送り処理と組み合わせる場合は、それらが完了した時点で`awaiting-continue`へ切り替えます。

![sayで口パクし、awaiting-continueでcontinue framesを動かし、入力成立後にBubbleを閉じるアニメーション](./assets/bubble-lifecycle.gif)

アニメーションGIFを再生できない環境では、次の比較図で各animation modeを確認できます。

![talking、awaiting-continue、idleの目パチ、口パク、continue framesの状態比較](./assets/animation-mode-guide.svg)

## 7. Animation modeの使い分け

| mode                | 目パチ | 口パク       | continue frames | 主な用途                     |
| ------------------- | ------ | ------------ | --------------- | ---------------------------- |
| `talking`           | 実行   | 実行         | 非表示          | セリフ表示中、音声再生中     |
| `awaiting-continue` | 実行   | 停止・非表示 | ループ          | ユーザによる「次へ」操作待ち |
| `idle`              | 実行   | 停止・非表示 | 停止・非表示    | Bubbleを表示したまま静止     |

`set this bubble animation mode [MODE]`は、呼び出したsprite、clone、またはStageが所有するBubbleだけを変更します。先に`say`または`think`を実行していない場合はエラーになります。

## 8. 表示開始・表示中・表示終了animation

表示開始は`fadeIn`、`floatIn`、`zoomIn`、`riseUp`、表示終了は`fadeOut`、`floatOut`、`zoomOut`、`sink`から選べます。これらは`DYNAMIC`と`RESERVED`のどちらにも適用できます。

```text
set bubble show animation [fadeIn] for [0.2] seconds for bubble style [hero-dialogue]
set bubble hide animation [fadeOut] for [0.2] seconds for bubble style [hero-dialogue]
animate this bubble [shake]
shake this bubble direction [90] count [2] ease [easeInOut]
explode this bubble relative scale [1.15] count [2] ease [easeOut]
animate bubble shape to [WAVY] speed [1] for [0.5] seconds
```

`shake`は吹き出し全体を方向・回数・`ease`付きで揺らし、`explode`はportraitと文字を含むsurface全体を相対倍率で変化させます。`animate bubble shape`は`THINKING`、`DREAMING`、`YELLING`、`WAVY`、`WHISPERING`などの外形を切り替えます。仕様では、吹き出しが表示される時点を「表示開始」、隠れる時点を「表示終了」と呼びます。

## 9. sayとthink

```text
say [MESSAGE] with bubble style [STYLE]
think [MESSAGE] with bubble style [STYLE]
```

どちらも同じvisual style、表情レイヤー、placement、animation mode制御を使えます。`say`／`think`だけで形状を固定せず、`set bubble visual style`で`NORMAL`、`THINKING`などを明示的に選びます。Composition APIのsurfaceには`say`／`think`のkindも渡されるため、独自hostではkindに応じた追加表現も可能です。

同じsprite、clone、またはStageで新しい`say`／`think`を実行すると、以前のBubbleをtimerやdrawableごと破棄してから置き換えます。Stageでは背景相対placementだけを使用できます。

## 10. cloneで使う

Bubble styleの定義は拡張機能内で共有されますが、表示中のBubbleはsprite／cloneごとに所有されます。

1. 元spriteで、緑の旗が押されたときにアセットとstyleを1回定義します。
2. 各clone自身から`say`または`think`を実行します。
3. animation mode変更とcloseも、表示したのと同じcloneから実行します。

cloneが停止・削除された場合は、そのtargetに属するtimer、SVG Text skin、drawableが自動解放されます。

## 11. ブロック一覧

| ブロック                                                                                         | 説明                                                    |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `define bubble style [STYLE] using text style [TEXT_STYLE]`                                      | Bubble styleを定義または再定義する                      |
| `set bubble placement [PLACEMENT] for bubble style [STYLE]`                                      | Actor相対方向・角度、または背景相対領域を設定する       |
| `set bubble distance [DISTANCE] for bubble style [STYLE]`                                        | Actor boundsからtail先端までの距離を設定する            |
| `set bubble visual style [VISUAL_STYLE] for bubble style [STYLE]`                                | Bubble本体のSVG形状を10種類から設定する                 |
| `set bubble tail length [LENGTH] for bubble style [STYLE]`                                       | Bubble borderからtail先端までの基準長を設定する         |
| `set bubble offset x [X] y [Y] scale [SCALE] % for bubble style [STYLE]`                         | 本体位置と、文字を含む全体のscaleを設定する             |
| `set portrait base [ASSET] for bubble style [STYLE]`                                             | portraitのベース画像を設定する                          |
| `set blink frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]`                     | 目パチ差分と間隔を設定する                              |
| `set lip-sync frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]`                  | 口パク差分と間隔を設定する                              |
| `set continue frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]`                  | `awaiting-continue`中の「次へ」アニメーションを設定する |
| `set bubble reveal unit [UNIT] every [SECONDS] seconds layout [LAYOUT] for bubble style [STYLE]` | CHARACTER／WORD／LINE／BLOCKの逐次表示を設定する        |
| `set bubble word delimiters [DELIMITERS] show [SHOW] for bubble style [STYLE]`                   | WORDの区切り文字集合と表示可否を設定する                |
| `set bubble reveal sound [ASSET] for bubble style [STYLE]`                                       | 表示単位ごとの効果音を設定する                          |
| `set bubble voice [ASSET] for bubble style [STYLE]`                                              | 表示開始時のフルボイスを設定する                        |
| `finish [UNIT] with condition [CONDITION] or timeout after [TIMEOUT] seconds`                    | 未表示単位を最後まで進め、条件またはtimeoutを待つ       |
| `set bubble show animation [MOTION] for [SECONDS] seconds for bubble style [STYLE]`              | 表示開始animationを設定する                             |
| `set bubble hide animation [MOTION] for [SECONDS] seconds for bubble style [STYLE]`              | 表示終了animationを設定する                             |
| `animate this bubble [MOTION]`                                                                   | Bubble全体のanimationを再生する                         |
| `shake this bubble direction [DIRECTION] count [COUNT] ease [EASE]`                              | 吹き出し全体を指定方向へ揺らす                          |
| `explode this bubble relative scale [SCALE] count [COUNT] ease [EASE]`                           | 吹き出し全体を相対倍率で変化させる                      |
| `animate bubble shape to [VISUAL_STYLE] speed [SPEED] for [SECONDS] seconds`                     | Bubble外形を時間経過で切り替える                        |
| `say [MESSAGE] with bubble style [STYLE]`                                                        | `talking` modeでsay表示を開始・置換する                 |
| `think [MESSAGE] with bubble style [STYLE]`                                                      | `talking` modeでthink表示を開始・置換する               |
| `set this bubble animation mode [MODE]`                                                          | `talking`、`awaiting-continue`、`idle`からmodeを選ぶ    |
| `wait with this bubble until condition [CONDITION] or timeout after [TIMEOUT] seconds`           | Runtime Expressionの条件成立またはtimeoutまで待つ       |
| `close this bubble`                                                                              | 自分のBubbleと所有resourceを解放する                    |
| `Bubble version`                                                                                 | Bubble実装versionを返す                                 |

## 12. よくあるエラー

| 状況                               | 原因と対処                                                               |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Asset Managerを要求するエラー      | 画像・メディアアセットを使う前にAsset Manager 0.7.xを読み込む            |
| SVG Textを要求するエラー           | SVG Text 0.4.xをサンドボックスなしで読み込む                             |
| Async Inputを要求するエラー        | Bubble待機より前にAsync Input 0.3.xをサンドボックスなしで読み込む        |
| Runtime Expressionを要求するエラー | Bubble待機より前にRuntime Expression 0.3.xをサンドボックスなしで読み込む |
| `bubble style is not defined`      | `define bubble style`を先に実行する。緑の旗の再実行時も再定義する        |
| image assetが未登録                | `register resource ... as asset ...`の完了後にBubbleを表示する           |
| assetが画像ではない                | `MIME type of asset [NAME]`で`image/*`か確認する                         |
| continue framesが1枚               | 2枚以上にするか、空にしてcontinue表示を解除する                          |
| frame intervalエラー               | `SECONDS`を0より大きい有限値にする                                       |
| StageからActor相対表示した         | placementを`HEADER_LIKE`、`CENTER`、`FOOTER_LIKE`にする                  |
| placementが不正                    | 16方向、alias、0〜360度、背景相対3値のいずれかを指定する                 |
| 目や口がずれる                     | ベースと全差分のcanvasサイズ、中心、透明領域を揃える                     |

## 13. 自動解放されるタイミング

次の場合、Bubbleが所有するtimer、SVG Text skin、renderer drawableは自動的に解放されます。

- `close this bubble`
- 同じsprite／cloneで次の`say`または`think`を実行したとき
- 対象sprite／cloneが停止したとき
- 緑の旗によるproject開始
- projectの全停止
- TurboWarp runtimeの破棄

Asset Managerへ登録したアセット自体はBubbleの所有物ではありません。不要になった登録画像をメモリから削除する場合は、Bubbleを閉じた後にAsset Managerの`delete asset [NAME] from memory`を使います。

## 14. マニュアル画像の再生成

図とGIFはリポジトリ内のスクリプトから再生成できます。GIF生成にはImageMagickの`magick`コマンドが必要です。

```sh
pnpm docs:render
pnpm docs:check
```

`docs:check`は、SVGのviewBox、production renderer／wrapText由来marker、全visual style、GIFの寸法・16フレーム・ループ設定、マニュアルから画像と全16ブロックへの参照、およびPages用HTMLが最新であることを検証します。
