# TurboWarp Bubble

`@kubohiroya/turbowarp-bubble`は、TurboWarp上の`say`／`think`表示を、文字、キャラクター表情、入力待ちアイコンに分けて管理するunsandboxed機能拡張です。同じ機能をアプリから直接利用するためのcomposition APIも提供します。紙芝居固有のDSLやシーン遷移には依存しません。

## パッケージ境界

| パッケージ                            | 責務                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `@kubohiroya/turbowarp-asset-manager` | アセット名の登録、画像種別の検証、画像targetへの適用                         |
| `@kubohiroya/turbowarp-svg-text`      | 名前付き文字styleと、文字列からSVGスキンへの変換                             |
| `@kubohiroya/turbowarp-bubble`        | 吹き出しsurface、say／think、表情レイヤー、表示phase、フレームアニメーション |
| アプリ／host                          | 入力待ち、必要に応じたDSLからcomposition APIへの変換                         |

Bubbleは依存パッケージを再exportしません。このため、Asset ManagerとSVG文字ActorはBubbleを使わない画面でも従来どおり単独で利用できます。

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

Bubbleは呼び出し元のspriteまたはcloneごとに表示を所有します。文字、表情ベース、目パチ、口パク、次へアイコンのrenderer drawableは自動生成されるため、レイヤー用spriteをプロジェクトへ追加する必要はありません。Stageから表示ブロックを実行することはできません。

### 提供ブロック

| ブロック                                                                       | 動作                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `define bubble style [STYLE] using text style [TEXT_STYLE]`                    | Bubble styleを定義し、SVG Textで定義した文字style名を関連付ける   |
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

このパッケージは`bubbleStyles`を含むDSLを解析しません。紙芝居アプリ側のadapterがDSLの値を`defineStyle`へ変換し、`Actor.say`／`Actor.think`のライフサイクルに合わせて`show`、`setPhase`、`close`を呼び出します。

アプリ統合は起動時固定・既定OFFのfeature flagで段階導入します。ロールバック時はflagをOFFにし、既存のTurboWarp say／think経路へ戻します。

## 開発

```sh
pnpm install
pnpm check
```

`pnpm check`は型検査、lint、format、単体テスト、配布物検査、外部consumer型検査、npm pack dry-runを実行します。
