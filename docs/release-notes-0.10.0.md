# 0.10.0: 名前付きBubble close policy

## 概要

Bubble 0.10.0では、吹き出しを閉じる条件を再利用可能な名前付きpolicyとして定義し、表示後に名前で適用できる。

- `condition`、`timeout`、`condition-or-timeout`の3つのtriggerを明示的に選べる。
- `wait and close this bubble using close policy [POLICY]`は定義をsnapshotし、成立まで待ち、hide animationとresource解放までを実行する。
- timeoutだけのpolicyはAsync InputやRuntime Expressionを必要としない。
- conditionを含むpolicyは既存の統合待機と同じcapabilityを使い、待機中は`awaiting-continue` modeになる。
- Bubbleの置換、target／projectの停止、runtime破棄では待機をcancelし、置換後のBubbleを閉じない。

## 追加ブロック

```text
define bubble close policy [three-seconds] trigger [timeout] condition [] timeout [3] seconds
say [3秒後に閉じます。]
wait and close this bubble using close policy [three-seconds]
```

キー入力やspriteへのタッチをRuntime Expressionのconditionとして登録した場合は、時間制限なしの`condition`、またはtimeoutとの先着になる`condition-or-timeout`を使える。

```text
define bubble close policy [advance] trigger [condition] condition [input == "pressed"] timeout [0] seconds
say [キーを押すかspriteをタッチしてください。]
wait and close this bubble using close policy [advance]
```

Bubble close policyは制御フローの設定であり、吹き出しの形やtail/trailを選ぶBubble styleとは別のregistryである。

## 互換性

- 既存の`say`、`think`、`show ... with bubble style ...`、`wait with this bubble ...`、`close this bubble`の契約は維持する。
- 保存済みstyled say／thinkブロック向けの非表示opcodeも維持する。
- standalone manifestは33定義を持ち、paletteには31ブロックを表示する。
- Composition APIとTurboWarp adapterの既存entry pointに破壊的変更はない。

## 検証

- `pnpm check`
- `pnpm release:check`
- TypeScript declarationとComposition API consumerのcompile成功。
- lifecycle cancel、定義snapshot、timeout、condition、先着triggerを自動testで検証。
- ドキュメントsource、Pages生成HTML、extension manifest、配布bundle、npm tarballを一括検証。

## 更新とロールバック

extension URLまたはnpm dependencyを0.9.0から0.10.0へ更新する。名前付きclose policyを使わない既存projectは変更不要である。

回帰が見つかった場合はextension URLまたはnpm dependencyを0.9.0へpinし、修正版0.10.x patchを公開する。公開済み0.10.0 packageをunpublishしたり、対応するGit tag／GitHub Releaseを削除したりしない。
