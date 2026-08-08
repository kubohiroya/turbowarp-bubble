# TurboWarp Bubble

`@kubohiroya/turbowarp-bubble`は、TurboWarp上の`say`／`think`表示を、文字、キャラクター表情、入力待ちアイコンに分けて管理するcompositionパッケージです。紙芝居固有のDSLやシーン遷移には依存しません。

## パッケージ境界

| パッケージ                            | 責務                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `@kubohiroya/turbowarp-asset-manager` | アセット名の登録、画像種別の検証、画像targetへの適用                         |
| `@kubohiroya/turbowarp-svg-text`      | 名前付き文字styleと、文字列からSVGスキンへの変換                             |
| `@kubohiroya/turbowarp-bubble`        | 吹き出しsurface、say／think、表情レイヤー、表示phase、フレームアニメーション |
| アプリ／host                          | Actorの解決、surfaceの配置、入力待ち、DSLからcomposition APIへの変換         |

Bubbleは依存パッケージを再exportせず、それぞれの公開composition APIを受け取ります。このため、SVG文字ActorはBubbleを使わない画面でも従来どおり単独で利用できます。

## インストール

```sh
pnpm add @kubohiroya/turbowarp-bubble \
  @kubohiroya/turbowarp-asset-manager \
  @kubohiroya/turbowarp-svg-text
```

現在のpeer dependency範囲は、Asset Manager `>=0.7.0 <1`、SVG Text `>=0.3.0 <1`です。

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
