# 0.9.0: TurboWarp互換の組み込みsay／think style

## 概要

Bubble 0.9.0では、設定不要の基本経路をTurboWarp標準の`say`／`think`ブロックへ揃え、named custom styleは種類指定が競合しない1つの表示ブロックから利用できるようにする。

- 組み込みBubble style `say`はspeech本体とspeech tailを持つ。
- 組み込みBubble style `think`はthought本体とround trailを持つ。
- 本体とtail/trailの形は不可分なvisual styleであり、tail形状だけを独立して指定する設定は持たない。
- 短い`say [MESSAGE]`／`think [MESSAGE]`ブロックが対応する組み込みstyleを自動選択する。
- 両組み込みstyleは予約SVG Text profile `default`を使う。
- named custom styleは`show [MESSAGE] with bubble style [STYLE]`で表示する。

## TurboWarpとの外観互換

基本profileは内容に追従するgeometry、14px Helvetica、16px line height、最大行幅170px、最小text幅50px、padding 10px、corner 16px、白いfill、Scratchのtext／outline色、右側優先・収まりに応じた左反転、block入力の330文字上限、空文字でのcloseを使う。

Scratch互換SVG本体は4px strokeを白いfillより先に描く。fillがstrokeの内側半分を覆うため、画面上に見える輪郭はTurboWarp標準と同じ細さになる。Actor相対のspeech tail／thought trailはActorの方向を指す。

日英マニュアルには、実際のTurboWarp Editorで撮影したStage結果と対応コードブロックの比較図版を含める。

- [Stage比較](./assets/turbowarp-say-think-stage-comparison.png)
- [ブロック比較](./assets/turbowarp-say-think-block-comparison.png)

## ブロック契約と互換性

standalone manifestは31定義を持ち、paletteには29ブロックを表示する。

- 表示opcode `say`、`think`、`showWithBubbleStyle`を追加する。
- 旧`sayWithBubbleStyle`／`thinkWithBubbleStyle` opcodeは以前のargument既定値を維持したまま実装を残し、paletteから非表示にする。
- いずれかの旧opcodeを使う保存済みprojectは引き続き動作する。
- quick-startとlifecycle図版は、named custom style用の表示される統合`show`ブロックを使う。
- Bubbleを消す操作は`close this bubble`とし、設定済みの表示終了animation後に所有resourceを解放する。`hide`という別ブロックは設けない。

## 検証

- `pnpm check`
- TypeScript declarationとComposition API consumerのcompile成功。
- 14 test files／125 tests成功。
- ドキュメントsource、Pages生成HTML、extension manifest、配布bundle、npm tarballを一括検証。
- 公開Stage／ブロック比較画像のhashがrepository assetと一致。

## 更新とロールバック

保存済みstyled say／thinkブロックを移行せず、extension URLを0.8.0から0.9.0へ置き換えられる。新しいscriptでは、基本profileには短い組み込みブロック、named custom styleには統合`show`ブロックを使う。

回帰が見つかった場合はextension URLまたはnpm dependencyを0.8.0へpinし、修正版0.9.x patchを公開する。公開済み0.9.0 packageをunpublishしたり、対応するGit tag／GitHub Releaseを削除したりしない。
