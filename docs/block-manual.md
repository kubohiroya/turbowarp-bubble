# TurboWarp Bubble ブロック利用マニュアル

このマニュアルでは、`turbowarp-bubble`をTurboWarpのカスタム拡張機能として使い、文字、キャラクター表情、目パチ、口パク、「次へ」アイコンを組み合わせたBubbleを表示します。

![Asset ManagerとSVG Textで準備し、Bubbleのsay、waiting、closeを順に実行するブロック例](./assets/block-quick-start.svg)

## 1. 必要な拡張機能

次の3つはすべて「サンドボックスなしで実行」を許可して読み込みます。推奨順はAsset Manager、SVG Text、Bubbleです。実際には、最初のBubble表示より前に依存拡張が揃っていれば構いません。

| 順番 | 拡張機能            | 読み込み先                                                                                            |
| ---: | ------------------- | ----------------------------------------------------------------------------------------------------- |
|    1 | Asset Manager 0.7.0 | `https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-asset-manager@0.7.0/dist/asset-manager.js`        |
|    2 | SVG Text 0.3.0      | `https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-svg-text@0.3.0/dist/svg-text.js`                  |
|    3 | Bubble 0.1.0        | npm公開後は`https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-bubble@0.1.0/dist/turbowarp-bubble.js` |

開発中のBubbleを試す場合は、このリポジトリの`dist/turbowarp-bubble.js`をローカルカスタム拡張機能として読み込みます。Bubbleだけを読み込んでも、表示時にAsset ManagerとSVG Textが見つからなければ明示的なエラーになります。

参考：

- [Asset Manager 日本語ガイド](https://kubohiroya.github.io/turbowarp-asset-manager/ja/)
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

SVG Text 0.3.xではblock contract上`bubble direction`入力が残っていますが、Bubbleが`setText`で生成する文字drawableの配置には使われません。Bubbleの配置は次節の`set bubble placement`で設定します。SVG Textからのdirection削除は、破壊的変更が可能な次版で行います。

## 4. Bubble styleを定義する

まず、Bubble style名とSVG Textのstyle名を関連付けます。

```text
define bubble style [hero-dialogue] using text style [dialogue-text]
set bubble placement [up-right] for bubble style [hero-dialogue]
```

### Actor相対と背景相対のplacement

![Actor相対の16方向・角度指定と、背景相対の3配置を比較する図](./assets/placement-guide.svg)

図中の文字パネルは、現在のstandalone Bubbleが実際に使う`createSvgTextComposition`のSVG生成経路から生成しています。解説専用の近似吹き出しではありません。Bubble本体の形状とtailは後続実装のため、この図でも未実装のtailは描いていません。

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

背景相対placementはActorの座標、bounds、可視性に依存しません。Stageから`say`／`think`を実行する場合も、この3値のいずれかを設定します。将来のBubble body rendererではActorを指すtailを描画しません。

続けて、表情レイヤーと入力待ちアイコンを設定します。

```text
set portrait base [HeroFace] for bubble style [hero-dialogue]

set blink frames [HeroEyesOpen,HeroEyesClosed]
  every [0.4] seconds for bubble style [hero-dialogue]

set talk frames [HeroMouthClosed,HeroMouthOpen]
  every [0.1] seconds for bubble style [hero-dialogue]

set advance frames [Next1,Next2]
  every [0.2] seconds for bubble style [hero-dialogue]
```

`ASSETS`はカンマ区切りのAsset Managerアセット名です。名前の前後の空白は除去されます。アセット名自体にカンマは使用できません。

- 目パチと口パクは1枚以上指定できます。1枚だけなら表示は固定されます。
- 「次へ」はループが分かるよう2枚以上必要です。
- `SECONDS`は0より大きい秒数です。
- `ASSETS`を空にすると、そのアニメーション設定を解除します。
- 表情ベースを空にするとportrait全体を解除します。

## 5. セリフを表示して入力を待つ

`say`または`think`はBubbleを表示するとすぐ次のブロックへ進み、初期phaseは`speaking`になります。

```text
say [海へ出発！] with bubble style [hero-dialogue]
set this bubble phase [waiting]
wait until <space key pressed? or mouse down?>
close this bubble
```

`waiting`に変えると口パクが止まり、「次へ」アイコンがループします。Bubble自身はキー入力、タップ、文字送り完了を判定しません。`wait until`など、通常のScratch/TurboWarpブロックで待ち、入力成立後に`close this bubble`を実行してください。

音声再生や別の文字送り処理と組み合わせる場合は、それらが完了した時点で`waiting`へ切り替えます。

![sayで口パクし、waitingで次へアイコンを動かし、入力成立後にBubbleを閉じるアニメーション](./assets/bubble-lifecycle.gif)

アニメーションGIFを再生できない環境では、次の比較図で各phaseを確認できます。

![speaking、waiting、idleの目パチ、口パク、次へアイコンの状態比較](./assets/phase-guide.svg)

## 6. phaseの使い分け

| phase      | 目パチ | 口パク       | 「次へ」アイコン | 主な用途                 |
| ---------- | ------ | ------------ | ---------------- | ------------------------ |
| `speaking` | 実行   | 実行         | 非表示           | セリフ表示中、音声再生中 |
| `waiting`  | 実行   | 停止・非表示 | ループ           | キー入力やタップ待ち     |
| `idle`     | 実行   | 停止・非表示 | 停止・非表示     | Bubbleを表示したまま静止 |

`set this bubble phase [PHASE]`は、呼び出したsprite、clone、またはStageが所有するBubbleだけを変更します。先に`say`または`think`を実行していない場合はエラーになります。

## 7. sayとthink

```text
say [MESSAGE] with bubble style [STYLE]
think [MESSAGE] with bubble style [STYLE]
```

どちらも同じstyle、表情レイヤー、phase制御を使えます。現在のStandalone rendererでは文字パネルとportraitの配置は共通です。Composition APIのsurfaceには`say`／`think`のkindが渡されるため、独自hostでは形や配置を区別できます。

同じsprite、clone、またはStageで新しい`say`／`think`を実行すると、以前のBubbleをtimerやdrawableごと破棄してから置き換えます。Stageでは背景相対placementだけを使用できます。

## 8. cloneで使う

Bubble styleの定義は拡張機能内で共有されますが、表示中のBubbleはsprite／cloneごとに所有されます。

1. 元spriteで、緑の旗が押されたときにアセットとstyleを1回定義します。
2. 各clone自身から`say`または`think`を実行します。
3. phase変更とcloseも、表示したのと同じcloneから実行します。

cloneが停止・削除された場合は、そのtargetに属するtimer、SVG Text skin、drawableが自動解放されます。

## 9. ブロック一覧

| ブロック                                                                       | 説明                                                  |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `define bubble style [STYLE] using text style [TEXT_STYLE]`                    | Bubble styleを定義または再定義する                    |
| `set bubble placement [PLACEMENT] for bubble style [STYLE]`                    | Actor相対方向・角度、または背景相対領域を設定する     |
| `set portrait base [ASSET] for bubble style [STYLE]`                           | portraitのベース画像を設定する                        |
| `set blink frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]`   | 目パチ差分と間隔を設定する                            |
| `set talk frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]`    | 口パク差分と間隔を設定する                            |
| `set advance frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]` | waiting中の「次へ」アニメーションを設定する           |
| `say [MESSAGE] with bubble style [STYLE]`                                      | speaking phaseでsay表示を開始・置換する               |
| `think [MESSAGE] with bubble style [STYLE]`                                    | speaking phaseでthink表示を開始・置換する             |
| `set this bubble phase [PHASE]`                                                | 自分のBubbleを`speaking`、`waiting`、`idle`へ変更する |
| `close this bubble`                                                            | 自分のBubbleと所有resourceを解放する                  |
| `Bubble version`                                                               | Bubble実装versionを返す                               |

## 10. よくあるエラー

| 状況                          | 原因と対処                                                        |
| ----------------------------- | ----------------------------------------------------------------- |
| Asset Managerを要求するエラー | Asset Manager 0.7.xをサンドボックスなしで読み込む                 |
| SVG Textを要求するエラー      | SVG Text 0.3.xをサンドボックスなしで読み込む                      |
| `bubble style is not defined` | `define bubble style`を先に実行する。緑の旗の再実行時も再定義する |
| image assetが未登録           | `register resource ... as asset ...`の完了後にBubbleを表示する    |
| assetが画像ではない           | `MIME type of asset [NAME]`で`image/*`か確認する                  |
| advance framesが1枚           | 2枚以上にするか、空にしてadvance表示を解除する                    |
| frame intervalエラー          | `SECONDS`を0より大きい有限値にする                                |
| StageからActor相対表示した    | placementを`HEADER_LIKE`、`CENTER`、`FOOTER_LIKE`にする           |
| placementが不正               | 16方向、alias、0〜360度、背景相対3値のいずれかを指定する          |
| 目や口がずれる                | ベースと全差分のcanvasサイズ、中心、透明領域を揃える              |

## 11. 自動解放されるタイミング

次の場合、Bubbleが所有するtimer、SVG Text skin、renderer drawableは自動的に解放されます。

- `close this bubble`
- 同じsprite／cloneで次の`say`または`think`を実行したとき
- 対象sprite／cloneが停止したとき
- 緑の旗によるproject開始
- projectの全停止
- TurboWarp runtimeの破棄

Asset Managerへ登録したアセット自体はBubbleの所有物ではありません。不要になった登録画像をメモリから削除する場合は、Bubbleを閉じた後にAsset Managerの`delete asset [NAME] from memory`を使います。

## 12. マニュアル画像の再生成

図とGIFはリポジトリ内のスクリプトから再生成できます。GIF生成にはImageMagickの`magick`コマンドが必要です。

```sh
pnpm docs:render
pnpm docs:check
```

`docs:check`は、SVGのviewBox、GIFの寸法・16フレーム・ループ設定、マニュアルから画像と全11ブロックへの参照を検証します。
