# TurboWarp Bubble

`@kubohiroya/turbowarp-bubble`は、TurboWarp上の`say`／`think`表示を、文字、キャラクター表情、入力待ちアイコンに分けて管理するunsandboxed機能拡張です。同じ機能をアプリから直接利用するためのcomposition APIも提供します。紙芝居固有のDSLやシーン遷移には依存しません。

## パッケージ境界

| パッケージ                            | 責務                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `@kubohiroya/turbowarp-asset-manager` | アセット名の登録、画像種別の検証、画像targetへの適用                       |
| `@kubohiroya/turbowarp-svg-text`      | 名前付き文字styleと、文字列からSVGスキンへの変換                           |
| `@kubohiroya/turbowarp-bubble`        | 吹き出しsurface、配置、say／think、表情レイヤー、表示phase、アニメーション |
| アプリ／host                          | 入力待ち、必要に応じたDSLからcomposition APIへの変換                       |

Bubbleは依存パッケージを再exportしません。このため、Asset ManagerとSVG文字ActorはBubbleを使わない画面でも従来どおり単独で利用できます。

## 自動改行と禁則処理の基盤

Bubbleの任意`maxWidth`による自動改行では、`@cto.af/linebreak`を利用してUnicode UAX #14準拠の改行可能位置を求めます。依存は`LineBreakProvider` interfaceの内側へ閉じ込め、実際のフォントで測った幅から、上限内に収まる最も後ろの候補をBubble側で選びます。

`UnicodeLineBreakProvider`はUAX #14の候補を`Intl.Segmenter`の書記素境界で絞るため、句読点や小書き仮名の禁則に加え、結合文字や絵文字の途中分割も避けます。明示改行は維持し、URLなど分割可能な候補がない文字列だけを書記素境界でfallback分割します。

```ts
import { wrapText } from "@kubohiroya/turbowarp-bubble/composition";

const layout = wrapText({
  text: "これは長いセリフです。",
  maxWidth: 320,
  measureText: (text) => textRenderer.measure(text),
});
```

この基盤は改行位置と行幅を返します。Bubble surfaceへ`maxWidth`を渡し、SVG Textの実測値と吹き出し形状へ接続する処理は、後続の表示統合で追加します。

配布bundleに含まれる依存ライブラリのライセンスは、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)を参照してください。

## インストール

```sh
pnpm add @kubohiroya/turbowarp-bubble \
  @kubohiroya/turbowarp-asset-manager \
  @kubohiroya/turbowarp-svg-text
```

現在のpeer dependency範囲は、Asset Manager `>=0.7.0 <1`、SVG Text `>=0.3.0 <1`です。

## TurboWarp機能拡張

ブロックの組み方、表情差分の準備、入力待ち、clone、エラー対処を含む手順は、[ブロック利用マニュアル](docs/block-manual.md)を参照してください。`speaking`から`waiting`、入力成立、`close`までのアニメーション例も掲載しています。

TurboWarpの「カスタム拡張機能」から、次の3本を読み込みます。Asset ManagerとSVG Textは、最初のBubble表示より前にロードされていれば、読み込み順は問いません。

```text
https://unpkg.com/@kubohiroya/turbowarp-asset-manager/dist/asset-manager.js
https://unpkg.com/@kubohiroya/turbowarp-svg-text/dist/svg-text.js
https://unpkg.com/@kubohiroya/turbowarp-bubble/dist/turbowarp-bubble.js
```

Bubbleは呼び出し元のsprite、clone、またはStageごとに表示を所有します。文字、表情ベース、目パチ、口パク、次へアイコンのrenderer drawableは自動生成されるため、レイヤー用spriteをプロジェクトへ追加する必要はありません。Stageから表示できるのは背景相対placementを使うstyleだけです。

### 提供ブロック

| ブロック                                                                       | 動作                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `define bubble style [STYLE] using text style [TEXT_STYLE]`                    | Bubble styleを定義し、SVG Textで定義した文字style名を関連付ける   |
| `set bubble placement [PLACEMENT] for bubble style [STYLE]`                    | Actor相対方向・角度、または背景相対領域を設定する                 |
| `set portrait base [ASSET] for bubble style [STYLE]`                           | 表情ベース画像を設定する。空文字でportrait全体を解除する          |
| `set blink frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]`   | 目パチ差分を設定する。空リストで解除する                          |
| `set talk frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]`    | 口パク差分を設定する。空リストで解除する                          |
| `set advance frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]` | 入力待ちアイコンを設定する。2フレーム以上必要。空リストで解除する |
| `say [MESSAGE] with bubble style [STYLE]`                                      | `speaking` phaseでsay表示を開始または置換する                     |
| `think [MESSAGE] with bubble style [STYLE]`                                    | `speaking` phaseでthink表示を開始または置換する                   |
| `set this bubble phase [PHASE]`                                                | `speaking`／`waiting`／`idle`を切り替える                         |
| `close this bubble`                                                            | 呼び出し元のBubbleと所有resourceを解放する                        |
| `Bubble version`                                                               | 実装versionを返す                                                 |

`ASSETS`はAsset Managerへ登録済みの画像アセット名をカンマ区切りで指定します。アセット名自体にカンマは使用できません。すべての`SECONDS`は0より大きい秒数です。

### Placement

`PLACEMENT`はActor相対と背景相対の二系統です。省略時は`up-right`です。

- Actor相対：16の正規方向名、そのcompass alias、またはScratch方向と同じ0〜360度。`0`は上、`90`は右、`180`は下、`270`は左で、`360`は`0`へ正規化します。任意角度は16方向へ丸めません。
- 背景相対：`HEADER_LIKE`、`CENTER`、`FOOTER_LIKE`。Stage安全領域の上部、中央、下部へ水平中央揃えで置き、Actor位置・bounds・可視性には依存しません。

Actor相対の正規方向名は次の16個です。別名は大文字小文字を区別せず、正規名へ変換されます。

| 正規名             | compass alias     | 正規名           | compass alias     |
| ------------------ | ----------------- | ---------------- | ----------------- |
| `up`               | `north`           | `down`           | `south`           |
| `up-up-right`      | `north-northeast` | `down-down-left` | `south-southwest` |
| `up-right`         | `northeast`       | `down-left`      | `southwest`       |
| `right-up-right`   | `east-northeast`  | `left-down-left` | `west-southwest`  |
| `right`            | `east`            | `left`           | `west`            |
| `right-down-right` | `east-southeast`  | `left-up-left`   | `west-northwest`  |
| `down-right`       | `southeast`       | `up-left`        | `northwest`       |
| `down-down-right`  | `south-southeast` | `up-up-left`     | `north-northwest` |

![Actor相対の16方向・角度指定と、背景相対の3配置を比較する図](docs/assets/placement-guide.svg)

図中の文字パネルは、現在のstandalone Bubbleと同じ`createSvgTextComposition`のSVG生成経路で描画しています。現在のstandalone rendererは配置基準を実装済みです。背景相対は方向を持たず、後続のBubble body rendererでもtailなしとして描画します。

### 表示phase

| phase      | 目パチ | 口パク       | 次へアイコン |
| ---------- | ------ | ------------ | ------------ |
| `speaking` | 実行   | 実行         | 非表示       |
| `waiting`  | 実行   | 停止・非表示 | ループ実行   |
| `idle`     | 実行   | 停止・非表示 | 停止・非表示 |

`say`／`think`ブロックは表示を開始した時点で次のブロックへ進みます。キー入力、タップ、文字送り完了の判定はBubbleの責務ではありません。入力待ちを開始する側が`waiting`へ変更し、入力成立後に`close this bubble`または次の表示ブロックを実行します。

### ブロック構成例

```text
define bubble style [hero-dialogue] using text style [dialogue-text]
set bubble placement [up-right] for bubble style [hero-dialogue]
set portrait base [HeroFace] for bubble style [hero-dialogue]
set blink frames [HeroEyesOpen,HeroEyesClosed] every [0.4] seconds for bubble style [hero-dialogue]
set talk frames [HeroMouthClosed,HeroMouthOpen] every [0.1] seconds for bubble style [hero-dialogue]
set advance frames [Next1,Next2] every [0.2] seconds for bubble style [hero-dialogue]
say [海へ出発！] with bubble style [hero-dialogue]
set this bubble phase [waiting]
close this bubble
```

プロジェクト開始・停止、対象sprite／cloneの停止、runtime破棄でも、所有するtimer、SVG text skin、drawableを自動解放します。依存拡張が未ロードの場合は、必要なnpmパッケージ名を含むerrorを返します。

## Composition API

```ts
import { createAssetManagerComposition } from "@kubohiroya/turbowarp-asset-manager/composition";
import { createSvgTextComposition } from "@kubohiroya/turbowarp-svg-text/composition";
import { createBubbleComposition } from "@kubohiroya/turbowarp-bubble/composition";

const assetManager = createAssetManagerComposition();
const svgText = createSvgTextComposition({ runtime });

svgText.defineStyle({
  name: "dialogue-text",
  backgroundColor: "#ffffff",
  textColor: "#332200",
  font: "Noto Sans JP",
  fontPercent: 100,
  alignment: "left",
});

const bubbles = createBubbleComposition({
  assetManager,
  svgText,
  async createSurface({ actor, actorKey, kind, style }) {
    // hostがActorの近くへsurfaceを配置し、各レイヤー用のtargetを返します。
    return bubbleSurfaceHost.create({ actor, actorKey, kind, style });
  },
});
```

`createSurface`が返すsurfaceは、次のtargetを持ちます。

- `text`: SVG Textが文字スキンを適用するtarget
- `portraitBase`: キャラクター表情のベース画像target
- `portraitBlink`: 目パチ差分target
- `portraitTalk`: 口パク差分target
- `advanceIndicator`: 「次へ」アイコンtarget

画像レイヤーのtarget IDは互いに異なる必要があります。styleで使わないレイヤーのtargetは省略できます。

## Styleと表示

```ts
bubbles.defineStyle({
  name: "hero-dialogue",
  textStyle: "dialogue-text",
  placement: "north-northeast",
  portrait: {
    base: "HeroFace",
    blink: {
      frames: ["HeroEyesOpen", "HeroEyesClosed"],
      frameIntervalSeconds: 0.4,
    },
    talk: {
      frames: ["HeroMouthClosed", "HeroMouthOpen"],
      frameIntervalSeconds: 0.1,
    },
  },
  advanceIndicator: {
    frames: ["Next1", "Next2"],
    frameIntervalSeconds: 0.2,
  },
});

bubbles.defineStyle({
  name: "narration",
  textStyle: "dialogue-text",
  placement: "FOOTER_LIKE",
});

const bubble = await bubbles.show({
  actor: heroTarget,
  actorKey: "Hero",
  kind: "say",
  text: "海へ出発！",
  styleName: "hero-dialogue",
});
```

`show`の初期phaseは`speaking`です。目パチは表示中継続し、口パクだけが動きます。全文表示後にアプリが入力待ちへ移るとき、phaseを`waiting`へ変更します。

```ts
await bubble.setPhase("waiting");
// 口パクを停止して非表示にし、「次へ」アイコンをループ表示します。

await bubble.setPhase("idle");
// 吹き出しを残したまま、口パクと「次へ」アイコンを停止します。

await bubble.close();
```

同じ`actorKey`へ新しいBubbleを表示すると、以前のBubbleを完全に破棄してから置き換えます。`releaseTarget`、`releaseAll`、`dispose`も、所有するtimer、SVG Text target、surfaceを解放します。composition間で状態は共有しません。

## DSL 4.0との関係

このパッケージは`bubbleStyles`を含むDSLを解析しません。紙芝居アプリ側のadapterが、例えば`placement: north-northeast`、`placement: 33.75`、`placement: FOOTER_LIKE`を`defineStyle`へ渡し、表示ライフサイクルに合わせて`show`、`setPhase`、`close`を呼び出します。

アプリ統合は起動時固定・既定OFFのfeature flagで段階導入します。ロールバック時はflagをOFFにし、既存のTurboWarp say／think経路へ戻します。

## 開発

```sh
pnpm install
pnpm check
```

`pnpm check`は型検査、lint、format、単体テスト、配布物検査、外部consumer型検査、npm pack dry-runを実行します。
