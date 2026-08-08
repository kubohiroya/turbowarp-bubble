import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bubbleVisualStyles, renderBubbleSvg } from "../src/bubble-svg.ts";
import { renderTextActorSvg } from "../src/text-engine.ts";
import { wrapText } from "../src/text-layout.ts";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDirectory = join(projectRoot, "docs", "assets");
const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif';

const colors = Object.freeze({
  asset: "#5b7cfa",
  asyncInput: "#2f9d8f",
  bubble: "#ff6680",
  bubbleDark: "#d94b68",
  control: "#ffab19",
  event: "#ffbf00",
  ink: "#25283a",
  muted: "#667085",
  panel: "#ffffff",
  page: "#f2f4f8",
  svgText: "#9966ff",
  temporaryVariables: "#ff8c1a",
});

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function svgDocument({ width, height, title, description, body }) {
  const source = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(title)}</title>
  <desc id="description">${escapeXml(description)}</desc>
  <style>
    text { font-family: ${fontFamily}; }
    .heading { fill: ${colors.ink}; font-size: 28px; font-weight: 700; }
    .subheading { fill: ${colors.ink}; font-size: 20px; font-weight: 700; }
    .body { fill: ${colors.ink}; font-size: 16px; }
    .small { fill: ${colors.muted}; font-size: 13px; }
    .block-text { fill: #ffffff; font-size: 13px; font-weight: 600; }
    .input-text { fill: ${colors.ink}; font-size: 13px; font-weight: 500; }
  </style>
${body}
</svg>
`;
  return source.replace(/[\t ]+$/gmu, "");
}

function embedRenderedSvg(renderedSvg, x, y, width, height) {
  const widthMatch = renderedSvg.match(/\bwidth="([0-9.]+)"/u);
  const heightMatch = renderedSvg.match(/\bheight="([0-9.]+)"/u);
  if (!widthMatch || !heightMatch) {
    throw new Error("Rendered SVG Text skin has no numeric dimensions.");
  }
  const sourceWidth = Number(widthMatch[1]);
  const sourceHeight = Number(heightMatch[1]);
  const innerSvg = renderedSvg
    .replace(/^<svg[^>]*>/u, "")
    .replace(/<\/svg>\s*$/u, "");
  const rendererMatch = renderedSvg.match(/data-bubble-renderer="([^"]+)"/u);
  const styleMatch = renderedSvg.match(/data-bubble-style="([^"]+)"/u);
  const presentationMatch = renderedSvg.match(
    /data-bubble-presentation="([^"]+)"/u,
  );
  return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 ${sourceWidth} ${sourceHeight}" data-bubble-renderer="${rendererMatch?.[1] ?? "unknown"}"${styleMatch ? ` data-bubble-style="${styleMatch[1]}"` : ""}${presentationMatch ? ` data-bubble-presentation="${presentationMatch[1]}"` : ""} overflow="visible">
    ${innerSvg}
  </svg>`;
}

function panel(x, y, width, height, title) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="${colors.panel}" stroke="#d9deea" stroke-width="2"/>
    <text x="${x + 24}" y="${y + 38}" class="subheading">${escapeXml(title)}</text>
  </g>`;
}

function presentationModeGuideSvg() {
  const body = renderBubbleSvg({
    style: "NORMAL",
    lines: [],
    width: 250,
    height: 105,
    tailDirection: 225,
    tailLength: 24,
    title: "POP_OUT_BUBBLE body",
  });
  const popupText = renderTextActorSvg("Hello!", {
    name: "guide-popup",
    backgroundColor: "#ffffff00",
    fontPercent: 110,
    textColor: "#25283a",
  });
  const actorText = renderTextActorSvg("Chapter 1", {
    name: "guide-actor",
    alignment: "center",
    backgroundColor: "#20263a",
    font: "Noto Sans JP",
    fontPercent: 130,
    textColor: "#ffffff",
  });
  const actor = (x, label) => `<g data-guide-actor="${label}">
    <circle cx="${x}" cy="270" r="48" fill="#ffe0bd" stroke="#704d34" stroke-width="4"/>
    <circle cx="${x - 16}" cy="260" r="4" fill="#25283a"/><circle cx="${x + 16}" cy="260" r="4" fill="#25283a"/>
    <path d="M ${x - 15} 286 Q ${x} 296 ${x + 15} 286" fill="none" stroke="#704d34" stroke-width="4" stroke-linecap="round"/>
  </g>`;
  const page = `
  <rect width="1200" height="430" fill="${colors.page}"/>
  <text x="30" y="48" class="heading">presentationMode と shape は別の指定</text>
  ${panel(24, 78, 360, 320, "POP_OUT_BUBBLE + NORMAL")}
  ${panel(420, 78, 360, 320, "POP_OUT_BUBBLE + NO_BUBBLE")}
  ${panel(816, 78, 360, 320, "TEXT_ACTOR")}
  ${actor(105, "popup-normal")}
  ${embedRenderedSvg(body, 130, 130, 220, 120)}
  ${embedRenderedSvg(popupText, 207, 168, 92, 55)}
  ${actor(505, "popup-no-bubble")}
  ${embedRenderedSvg(popupText, 594, 178, 110, 66)}
  <text x="600" y="355" text-anchor="middle" class="small">Actorは残り、別drawableの文字だけを表示</text>
  ${embedRenderedSvg(actorText, 887, 205, 220, 90)}
  <text x="996" y="330" text-anchor="middle" class="small">Actor自身のskinをSVG textへ置換</text>
  <text x="204" y="375" text-anchor="middle" class="small">Actor + body + tail + text</text>`;
  return svgDocument({
    width: 1200,
    height: 430,
    title: "Bubble presentation modes",
    description:
      "Production SVG renderers compare popup bubble, popup text without a body, and text actor presentation.",
    body: page,
  });
}

function estimateTextWidth(value, fontSize = 13) {
  return [...String(value)].reduce(
    (width, character) =>
      width + (character.codePointAt(0) > 0xff ? fontSize : fontSize * 0.62),
    0,
  );
}

function blockLine(segments, x, baseline, fontSize) {
  let cursor = x;
  const output = [];
  for (const segment of segments) {
    if (segment.input !== undefined) {
      const width = Math.max(
        34,
        estimateTextWidth(segment.input, fontSize) + 16,
      );
      output.push(
        `<rect x="${cursor}" y="${baseline - fontSize - 7}" width="${width}" height="${fontSize + 13}" rx="${(fontSize + 13) / 2}" fill="#ffffff" fill-opacity="0.96"/>`,
        `<text x="${cursor + 8}" y="${baseline}" class="input-text" style="font-size:${fontSize}px">${escapeXml(segment.input)}</text>`,
      );
      cursor += width + 7;
    } else {
      const value = segment.text ?? "";
      output.push(
        `<text x="${cursor}" y="${baseline}" class="block-text" style="font-size:${fontSize}px">${escapeXml(value)}</text>`,
      );
      cursor += estimateTextWidth(value, fontSize) + 7;
    }
  }
  return output.join("\n");
}

function block({
  x,
  y,
  width,
  color,
  lines,
  fontSize = 13,
  height = lines.length === 1 ? 50 : 72,
  ariaLabel,
}) {
  const baselines =
    lines.length === 1
      ? [y + 31]
      : lines.map((_, index) => y + 27 + index * 25);
  return `<g role="group" aria-label="${escapeXml(ariaLabel)}">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="${color}" stroke="#000000" stroke-opacity="0.14" stroke-width="2"/>
    <rect x="${x + 18}" y="${y}" width="28" height="6" rx="3" fill="#000000" fill-opacity="0.18"/>
    ${lines.map((line, index) => blockLine(line, x + 17, baselines[index], fontSize)).join("\n")}
  </g>`;
}

function quickStartSvg() {
  const mappings = [
    ["costume:Assets:HeroFace", "HeroFace", "顔・髪などのベース"],
    ["costume:Assets:HeroEyesOpen", "HeroEyesOpen", "目（開）"],
    ["costume:Assets:HeroEyesClosed", "HeroEyesClosed", "目（閉）"],
    ["costume:Assets:HeroMouthClosed", "HeroMouthClosed", "口（閉）"],
    ["costume:Assets:HeroMouthOpen", "HeroMouthOpen", "口（開）"],
    ["costume:Assets:Next1", "Next1", "次へアイコン 1枚目"],
    ["costume:Assets:Next2", "Next2", "次へアイコン 2枚目"],
  ];
  const mappingRows = mappings
    .map(
      (
        [resource, asset, purpose],
        index,
      ) => `<g transform="translate(0 ${index * 25})">
        <text x="58" y="302" class="small">${escapeXml(resource)}</text>
        <text x="312" y="302" class="small">${escapeXml(asset)}</text>
        <text x="443" y="302" class="small">${escapeXml(purpose)}</text>
      </g>`,
    )
    .join("\n");

  const body = `
  <rect width="1200" height="880" fill="${colors.page}"/>
  <text x="32" y="48" class="heading">Bubbleブロック：最小構成</text>
  <text x="32" y="74" class="body">緑の旗でstyleと入力を準備し、セリフごとに say → Bubble内蔵待機 → close を実行します。</text>
  ${panel(24, 96, 560, 752, "1. 緑の旗で準備")}
  ${panel(616, 96, 560, 752, "2. セリフを表示して入力待ち")}
  ${block({
    x: 48,
    y: 150,
    width: 260,
    color: colors.event,
    ariaLabel: "緑の旗が押されたとき",
    lines: [[{ text: "when green flag clicked" }]],
  })}
  ${block({
    x: 48,
    y: 214,
    width: 510,
    color: colors.asset,
    fontSize: 12,
    ariaLabel: "Asset Managerで表情ベースを登録",
    lines: [
      [
        { text: "register resource" },
        { input: "costume:Assets:HeroFace" },
        { text: "as asset" },
        { input: "HeroFace" },
      ],
    ],
  })}
  <text x="50" y="281" class="small">同じブロックで、透明差分を含む7つの画像を登録</text>
  <rect x="46" y="292" width="514" height="195" rx="12" fill="#eef1ff" stroke="#cbd3ff"/>
  <text x="58" y="316" class="small" style="font-weight:700">RESOURCE_ID</text>
  <text x="312" y="316" class="small" style="font-weight:700">アセット名</text>
  <text x="443" y="316" class="small" style="font-weight:700">用途</text>
  <g transform="translate(0 27)">${mappingRows}</g>
  ${block({
    x: 48,
    y: 506,
    width: 510,
    height: 30,
    color: colors.bubble,
    fontSize: 11,
    ariaLabel: "dialogue-text styleのdraftを開始",
    lines: [[{ text: "begin text style" }, { input: "dialogue-text" }]],
  })}
  ${block({
    x: 48,
    y: 538,
    width: 510,
    height: 30,
    color: colors.bubble,
    fontSize: 11,
    ariaLabel: "dialogue-text styleへfontを設定",
    lines: [[{ text: "set text font" }, { input: "Noto Sans JP" }]],
  })}
  ${block({
    x: 48,
    y: 570,
    width: 510,
    height: 30,
    color: colors.bubble,
    fontSize: 11,
    ariaLabel: "dialogue-text styleを保存",
    lines: [[{ text: "save text style" }]],
  })}
  ${block({
    x: 48,
    y: 612,
    width: 510,
    color: colors.bubble,
    fontSize: 12,
    ariaLabel: "Bubble styleを定義",
    lines: [
      [
        { text: "define bubble style" },
        { input: "hero-dialogue" },
        { text: "using text style" },
        { input: "dialogue-text" },
      ],
    ],
  })}
  ${block({
    x: 48,
    y: 672,
    width: 510,
    color: colors.bubble,
    fontSize: 12,
    ariaLabel: "Bubbleの配置を設定",
    lines: [
      [
        { text: "set bubble placement" },
        { input: "up-right" },
        { text: "for bubble style" },
        { input: "hero-dialogue" },
      ],
    ],
  })}
  ${block({
    x: 48,
    y: 732,
    width: 510,
    color: colors.bubble,
    fontSize: 12,
    ariaLabel: "表情ベースを設定",
    lines: [
      [
        { text: "set portrait base" },
        { input: "HeroFace" },
        { text: "for bubble style" },
        { input: "hero-dialogue" },
      ],
    ],
  })}
  <text x="52" y="804" class="body">続けて blink・talk・advance のフレームを設定</text>
  <text x="52" y="832" class="small">目パチ 0.4秒 ／ 口パク 0.1秒 ／ 次へ 0.2秒</text>
  ${block({
    x: 640,
    y: 150,
    width: 510,
    height: 70,
    color: colors.bubble,
    fontSize: 12,
    ariaLabel: "目パチフレームを設定",
    lines: [
      [{ text: "set blink frames" }, { input: "HeroEyesOpen,HeroEyesClosed" }],
      [
        { text: "every" },
        { input: "0.4" },
        { text: "seconds for bubble style" },
        { input: "hero-dialogue" },
      ],
    ],
  })}
  ${block({
    x: 640,
    y: 230,
    width: 510,
    height: 70,
    color: colors.bubble,
    fontSize: 12,
    ariaLabel: "口パクフレームを設定",
    lines: [
      [{ text: "set talk frames" }, { input: "HeroMouthClosed,HeroMouthOpen" }],
      [
        { text: "every" },
        { input: "0.1" },
        { text: "seconds for bubble style" },
        { input: "hero-dialogue" },
      ],
    ],
  })}
  ${block({
    x: 640,
    y: 310,
    width: 510,
    height: 70,
    color: colors.bubble,
    fontSize: 12,
    ariaLabel: "次へアイコンフレームを設定",
    lines: [
      [{ text: "set advance frames" }, { input: "Next1,Next2" }],
      [
        { text: "every" },
        { input: "0.2" },
        { text: "seconds for bubble style" },
        { input: "hero-dialogue" },
      ],
    ],
  })}
  ${block({
    x: 640,
    y: 390,
    width: 510,
    color: colors.temporaryVariables,
    fontSize: 12,
    ariaLabel: "Temporary Variablesでinput変数を初期化",
    lines: [
      [
        { text: "set runtime variable" },
        { input: "input" },
        { text: "to" },
        { input: "" },
      ],
    ],
  })}
  ${block({
    x: 640,
    y: 448,
    width: 510,
    color: colors.asyncInput,
    fontSize: 12,
    ariaLabel: "Async InputでSpaceキーをinput変数へ登録",
    lines: [
      [
        { text: "listen for key" },
        { input: "Space" },
        { text: "set runtime var" },
        { input: "input" },
        { text: "to" },
        { input: "pressed" },
      ],
    ],
  })}
  ${block({
    x: 668,
    y: 506,
    width: 454,
    color: colors.bubble,
    fontSize: 14,
    ariaLabel: "sayブロックでセリフを表示",
    lines: [
      [
        { text: "say" },
        { input: "海へ出発！" },
        { text: "with bubble style" },
        { input: "hero-dialogue" },
      ],
    ],
  })}
  ${block({
    x: 668,
    y: 568,
    width: 454,
    height: 72,
    color: colors.bubble,
    fontSize: 12,
    ariaLabel: "Bubbleで条件成立またはタイムアウトまで待機",
    lines: [
      [
        { text: "wait with this bubble until condition" },
        { input: 'input == "pressed"' },
      ],
      [{ text: "or timeout after" }, { input: "10" }, { text: "seconds" }],
    ],
  })}
  ${block({
    x: 668,
    y: 652,
    width: 454,
    color: colors.bubble,
    fontSize: 14,
    ariaLabel: "Bubbleを閉じる",
    lines: [[{ text: "close this bubble" }]],
  })}
  <rect x="644" y="720" width="502" height="112" rx="16" fill="#fff3f6" stroke="#ffc4d1"/>
  <text x="668" y="750" class="body" style="font-weight:700">Bubbleが条件成立またはtimeoutまで待機</text>
  <text x="668" y="779" class="body">待機中はadvance framesをループし、口パクを停止。</text>
  <text x="668" y="808" class="body">待機後はidleへ移り、次のcloseを実行します。</text>`;

  return svgDocument({
    width: 1200,
    height: 880,
    title: "TurboWarp Bubbleブロックの最小構成",
    description:
      "各Next画像を個別登録し、Async InputとRuntime Expressionを介したBubble内蔵待機を使うブロック例。",
    body,
  });
}

function placementGuideSvg() {
  const directionNames = [
    "up",
    "up-up-right",
    "up-right",
    "right-up-right",
    "right",
    "right-down-right",
    "down-right",
    "down-down-right",
    "down",
    "down-down-left",
    "down-left",
    "left-down-left",
    "left",
    "left-up-left",
    "up-left",
    "up-up-left",
  ];
  const actorScenes = directionNames
    .map((name, index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const cardX = 32 + column * 392;
      const cardY = 146 + row * 218;
      const stageX = cardX + 12;
      const stageY = cardY + 42;
      const stageWidth = 356;
      const stageHeight = 158;
      const sceneCenterX = stageX + stageWidth / 2;
      const sceneCenterY = stageY + stageHeight / 2;
      const direction = index * 22.5;
      const radians = (direction * Math.PI) / 180;
      const dx = Math.sin(radians);
      const dy = -Math.cos(radians);
      const bubbleCenterX = sceneCenterX + dx * 54;
      const bubbleCenterY = sceneCenterY + dy * 48;
      const actorX = sceneCenterX - dx * 55;
      const actorY = sceneCenterY - dy * 48;
      const bubbleWidth = 166;
      const bubbleHeight = 94;
      const bubbleSvg = renderBubbleSvg({
        style: "NORMAL",
        lines: ["こんにちは"],
        width: bubbleWidth,
        height: bubbleHeight,
        tailDirection: direction + 180,
        fontSize: 12,
        title: `${name} placement preview`,
      });
      return `<g data-placement-scene="${name}">
        <rect x="${cardX}" y="${cardY}" width="380" height="208" rx="16" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
        <text x="${cardX + 14}" y="${cardY + 27}" style="fill:${colors.ink};font-size:15px;font-weight:700">${name}</text>
        <text x="${cardX + 366}" y="${cardY + 27}" text-anchor="end" class="small">${direction}°</text>
        <rect x="${stageX}" y="${stageY}" width="${stageWidth}" height="${stageHeight}" rx="10" fill="#edf3fa" stroke="#aebdd0"/>
        <path d="M ${actorX} ${actorY} L ${bubbleCenterX} ${bubbleCenterY}" stroke="#ff9bad" stroke-width="2" stroke-dasharray="4 4"/>
        ${embedRenderedSvg(
          bubbleSvg,
          bubbleCenterX - bubbleWidth / 2,
          bubbleCenterY - bubbleHeight / 2,
          bubbleWidth,
          bubbleHeight,
        )}
        <circle cx="${actorX}" cy="${actorY}" r="21" fill="#ffd5b5" stroke="#b85d63" stroke-width="2"/>
        <circle cx="${actorX - 7}" cy="${actorY - 4}" r="2" fill="#3b2d3c"/>
        <circle cx="${actorX + 7}" cy="${actorY - 4}" r="2" fill="#3b2d3c"/>
        <path d="M ${actorX - 7} ${actorY + 7} Q ${actorX} ${actorY + 12} ${actorX + 7} ${actorY + 7}" fill="none" stroke="#7c2945" stroke-width="2" stroke-linecap="round"/>
      </g>`;
    })
    .join("\n");
  const backgroundPlacements = [
    {
      name: "HEADER_LIKE",
      height: 96,
      lines: ["章タイトル", "上端を基準に配置"],
      rule: "外形上端 = safe top",
    },
    {
      name: "CENTER",
      height: 132,
      lines: ["場面の説明を", "画面中央へ表示", "高さが変わっても中心維持"],
      rule: "外形中心 = Stage中心",
    },
    {
      name: "FOOTER_LIKE",
      height: 110,
      lines: ["字幕のような説明", "下端を基準に配置"],
      rule: "外形下端 = safe bottom",
    },
  ];
  const backgroundScenes = backgroundPlacements
    .map(({ name, height, lines, rule }, index) => {
      const cardX = 32 + index * 520;
      const cardY = 1100;
      const stageX = cardX + 24;
      const stageY = cardY + 58;
      const stageWidth = 472;
      const stageHeight = 300;
      const safeInset = 18;
      const safeTop = stageY + safeInset;
      const safeBottom = stageY + stageHeight - safeInset;
      const stageCenterY = stageY + stageHeight / 2;
      const bubbleWidth = 290;
      const bubbleX = stageX + stageWidth / 2 - bubbleWidth / 2;
      const bubbleY =
        name === "HEADER_LIKE"
          ? safeTop - 24
          : name === "CENTER"
            ? stageCenterY - height / 2
            : safeBottom - height + 24;
      const referenceY =
        name === "HEADER_LIKE"
          ? safeTop
          : name === "CENTER"
            ? stageCenterY
            : safeBottom;
      const bubbleSvg = renderBubbleSvg({
        style: "NORMAL",
        lines,
        width: bubbleWidth,
        height,
        tailDirection: null,
        fontSize: 12,
        title: `${name} background placement preview`,
      });
      return `<g data-background-placement-scene="${name}">
        <rect x="${cardX}" y="${cardY}" width="504" height="428" rx="18" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
        <text x="${cardX + 18}" y="${cardY + 32}" style="fill:${colors.ink};font-size:17px;font-weight:700">${name}</text>
        <text x="${cardX + 486}" y="${cardY + 31}" text-anchor="end" class="small">safe margin = 16px相当</text>
        <rect x="${stageX}" y="${stageY}" width="${stageWidth}" height="${stageHeight}" rx="8" fill="#dce9f7" stroke="#7895b5" stroke-width="3"/>
        <rect x="${stageX + safeInset}" y="${safeTop}" width="${stageWidth - safeInset * 2}" height="${stageHeight - safeInset * 2}" fill="none" stroke="#4f78a4" stroke-width="1.5" stroke-dasharray="6 4"/>
        <line x1="${stageX + stageWidth / 2}" y1="${stageY}" x2="${stageX + stageWidth / 2}" y2="${stageY + stageHeight}" stroke="#7f93aa" stroke-dasharray="4 4"/>
        <line x1="${stageX + safeInset}" y1="${referenceY}" x2="${stageX + stageWidth - safeInset}" y2="${referenceY}" stroke="#ef476f" stroke-width="2"/>
        ${embedRenderedSvg(bubbleSvg, bubbleX, bubbleY, bubbleWidth, height)}
        <line x1="${stageX + 9}" y1="${stageY}" x2="${stageX + 9}" y2="${safeTop}" stroke="#25283a"/>
        <path d="M ${stageX + 5} ${stageY + 5} L ${stageX + 9} ${stageY} L ${stageX + 13} ${stageY + 5} M ${stageX + 5} ${safeTop - 5} L ${stageX + 9} ${safeTop} L ${stageX + 13} ${safeTop - 5}" fill="none" stroke="#25283a"/>
        <text x="${cardX + 252}" y="${cardY + 386}" text-anchor="middle" style="fill:#ef476f;font-size:14px;font-weight:700">${rule}</text>
        <text x="${cardX + 252}" y="${cardY + 410}" text-anchor="middle" class="small">外形 ${bubbleWidth - 48} × ${height - 48}px相当／水平中央</text>
      </g>`;
    })
    .join("\n");
  const body = `
  <rect width="1600" height="1560" fill="${colors.page}"/>
  <text x="32" y="48" class="heading">Bubble placement：Actor相対と背景相対</text>
  <text x="32" y="76" class="body">各ミニシーンは、Actor、実際のBubble外形、tail、文字を同じ縮尺で表示します。</text>
  <text x="32" y="114" class="subheading">Actor相対：ActorからBubble中心への16方向</text>
  ${actorScenes}
  <text x="32" y="1058" class="subheading">背景相対：Stage縁・安全領域・Bubble外形の配置関係</text>
  ${backgroundScenes}`;
  return svgDocument({
    width: 1600,
    height: 1560,
    title: "Bubble placementの二つの基準",
    description:
      "Actorと実際の吹き出し外形による16方向のミニシーン、およびStage安全領域と背景相対配置の寸法関係。",
    body,
  });
}

function actorTransformGuideSvg() {
  const examples = [
    {
      key: "distance-tail",
      title: "distance 12 / tail length 18",
      subtitle: "Actor bounds → tail tip → Bubble border",
      offset: [0, 0, 100],
      lines: ["基準サイズ", "100%"],
    },
    {
      key: "offset",
      title: "offset [10, -10]",
      subtitle: "tail tipを固定し、本体を右10・下10へ移動",
      offset: [10, -10, 100],
      lines: ["位置補正", "10, -10"],
    },
    {
      key: "scale",
      title: "offset [0, 0, 120]",
      subtitle: "文字を含む全体を120%化し、Actor側の間隔を維持",
      offset: [0, 0, 120],
      lines: ["文字も外形も", "120%"],
    },
  ];
  const scenes = examples
    .map(({ key, title, subtitle, offset, lines }, index) => {
      const cardX = 32 + index * 500;
      const cardY = 112;
      const stageX = cardX + 18;
      const stageY = cardY + 72;
      const bubbleX = stageX + 128;
      const bubbleY = stageY + 34;
      const bubbleWidth = 260;
      const bubbleHeight = 130;
      const actorRight = bubbleX - 6;
      const actorLeft = actorRight - 66;
      const actorTop = stageY + 62;
      const actorBottom = actorTop + 92;
      const tailTipX = bubbleX + 6;
      const tailTipY = bubbleY + bubbleHeight / 2;
      const bubbleSvg = renderBubbleSvg({
        style: "NORMAL",
        lines,
        width: bubbleWidth,
        height: bubbleHeight,
        tailDirection: 270,
        tailLength: 18,
        offset,
        fontSize: 15,
        title: `${title} preview`,
      });
      return `<g data-actor-transform-scene="${key}">
        <rect x="${cardX}" y="${cardY}" width="472" height="340" rx="18" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
        <text x="${cardX + 20}" y="${cardY + 34}" class="subheading">${escapeXml(title)}</text>
        <text x="${cardX + 20}" y="${cardY + 58}" class="small">${escapeXml(subtitle)}</text>
        <rect x="${stageX}" y="${stageY}" width="436" height="202" rx="10" fill="#edf3fa" stroke="#aebdd0"/>
        <rect x="${actorLeft}" y="${actorTop}" width="66" height="92" rx="12" fill="#ffd5b5" stroke="#b85d63" stroke-width="2" data-actor-bounds="true"/>
        <text x="${(actorLeft + actorRight) / 2}" y="${actorBottom + 22}" text-anchor="middle" class="small">Actor bounds</text>
        ${embedRenderedSvg(bubbleSvg, bubbleX, bubbleY, bubbleWidth, bubbleHeight)}
        <circle cx="${tailTipX}" cy="${tailTipY}" r="4" fill="#ef476f"/>
        <line x1="${actorRight}" y1="${tailTipY + 35}" x2="${tailTipX}" y2="${tailTipY + 35}" stroke="#ef476f" stroke-width="2"/>
        <path d="M ${actorRight + 5} ${tailTipY + 31} L ${actorRight} ${tailTipY + 35} L ${actorRight + 5} ${tailTipY + 39} M ${tailTipX - 5} ${tailTipY + 31} L ${tailTipX} ${tailTipY + 35} L ${tailTipX - 5} ${tailTipY + 39}" fill="none" stroke="#ef476f"/>
        <text x="${(actorRight + tailTipX) / 2}" y="${tailTipY + 55}" text-anchor="middle" style="fill:#ef476f;font-size:12px;font-weight:700">distance 12</text>
        <line x1="${tailTipX}" y1="${tailTipY - 42}" x2="${bubbleX + 24}" y2="${tailTipY - 42}" stroke="#5b7cfa" stroke-width="2"/>
        <text x="${(tailTipX + bubbleX + 24) / 2}" y="${tailTipY - 50}" text-anchor="middle" style="fill:#4767d8;font-size:12px;font-weight:700">tail 18</text>
      </g>`;
    })
    .join("\n");
  return svgDocument({
    width: 1532,
    height: 486,
    title: "Actor相対のdistance、tail length、offset、scale",
    description:
      "実際のBubble SVG rendererで、Actor boundsからtail tipまでのdistance、本体borderまでのtail length、offsetと文字を含むscaleを比較する図。",
    body: `<rect width="1532" height="486" fill="${colors.page}"/>
      <text x="32" y="48" class="heading">Actor相対：distance・tail・offset・scale</text>
      <text x="32" y="78" class="body">赤い点のtail tipを基準に本体を再生成。scaleはフォント、表情、アイコン、余白にも適用します。</text>
      ${scenes}`,
  });
}

const guideSegmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

function measureGuideText(text) {
  return [...guideSegmenter.segment(text)].reduce((width, { segment }) => {
    if (/^[\x20-\x7e]+$/u.test(segment)) return width + 8;
    return width + 16;
  }, 0);
}

function wrapGuideText(text, maxWidth) {
  return wrapText({ text, maxWidth, measureText: measureGuideText }).lines.map(
    ({ text: line }) => line,
  );
}

function widthLinebreakGuideSvg() {
  const sample = "新しいキャラクターが、静かな夜の港へ歩いてきました。";
  const widths = [128, 224, 320];
  const widthCards = widths
    .map((maxWidth, index) => {
      const cardX = 32 + index * 520;
      const cardY = 130;
      const lines = wrapGuideText(sample, maxWidth);
      const bubbleWidth = maxWidth + 48;
      const bubbleHeight = Math.max(106, 64 + lines.length * 22);
      const bubbleSvg = renderBubbleSvg({
        style: "NORMAL",
        lines,
        width: bubbleWidth,
        height: bubbleHeight,
        tailDirection: 205,
        fontSize: 14,
        title: `maxWidth ${maxWidth} wrapping example`,
      });
      const bubbleX = cardX + 250 - bubbleWidth / 2;
      const bubbleY = cardY + 82;
      return `<g data-layout-engine="wrapText" data-max-width="${maxWidth}">
        <rect x="${cardX}" y="${cardY}" width="504" height="390" rx="18" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
        <text x="${cardX + 20}" y="${cardY + 36}" style="fill:${colors.ink};font-size:19px;font-weight:700">maxWidth = ${maxWidth}px</text>
        <text x="${cardX + 484}" y="${cardY + 35}" text-anchor="end" class="small">${lines.length} lines</text>
        ${embedRenderedSvg(bubbleSvg, bubbleX, bubbleY, bubbleWidth, bubbleHeight)}
        <line x1="${bubbleX + 24}" y1="${cardY + 338}" x2="${bubbleX + bubbleWidth - 24}" y2="${cardY + 338}" stroke="#ef476f" stroke-width="2"/>
        <path d="M ${bubbleX + 30} ${cardY + 333} L ${bubbleX + 24} ${cardY + 338} L ${bubbleX + 30} ${cardY + 343} M ${bubbleX + bubbleWidth - 30} ${cardY + 333} L ${bubbleX + bubbleWidth - 24} ${cardY + 338} L ${bubbleX + bubbleWidth - 30} ${cardY + 343}" fill="none" stroke="#ef476f" stroke-width="2"/>
        <text x="${cardX + 252}" y="${cardY + 370}" text-anchor="middle" class="small">文字領域の上限 ${maxWidth}px（padding・tailは別）</text>
      </g>`;
    })
    .join("\n");
  const kinsokuExamples = [
    {
      title: "行頭禁則",
      text: "これは、とても重要です。",
      maxWidth: 64,
      note: "、。）」を次行の先頭にしない",
    },
    {
      title: "行末禁則",
      text: "次は「新しい場面」です。",
      maxWidth: 64,
      note: "（「を行末に残さない",
    },
    {
      title: "小書き・長音",
      text: "新しいキャラクターです。",
      maxWidth: 72,
      note: "ゃゅょっーの直前で改行しない",
    },
    {
      title: "書記素cluster",
      text: "家族👨‍👩‍👧‍👦で出発します。",
      maxWidth: 64,
      note: "結合emojiの途中を分割しない",
    },
  ];
  const kinsokuCards = kinsokuExamples
    .map(({ title, text, maxWidth, note }, index) => {
      const cardX = 32 + index * 392;
      const cardY = 610;
      const lines = wrapGuideText(text, maxWidth);
      return `<g data-layout-engine="wrapText" data-kinsoku-example="${title}">
        <rect x="${cardX}" y="${cardY}" width="376" height="306" rx="18" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
        <text x="${cardX + 18}" y="${cardY + 34}" style="fill:${colors.ink};font-size:18px;font-weight:700">${title}</text>
        <rect x="${cardX + 18}" y="${cardY + 56}" width="340" height="154" rx="13" fill="#fff4cc" stroke="#6f5b45" stroke-width="2"/>
        ${lines
          .map(
            (line, lineIndex) =>
              `<text x="${cardX + 188}" y="${cardY + 91 + lineIndex * 27}" text-anchor="middle" style="fill:${colors.ink};font-size:16px">${escapeXml(line)}</text>`,
          )
          .join("\n")}
        <text x="${cardX + 188}" y="${cardY + 240}" text-anchor="middle" class="body" style="font-weight:700">✓ ${note}</text>
        <text x="${cardX + 188}" y="${cardY + 270}" text-anchor="middle" class="small">@cto.af/linebreak → UAX #14候補</text>
        <text x="${cardX + 188}" y="${cardY + 290}" text-anchor="middle" class="small">Intl.Segmenter → 書記素境界で絞り込み</text>
      </g>`;
    })
    .join("\n");
  const body = `
  <rect width="1600" height="950" fill="${colors.page}"/>
  <text x="32" y="48" class="heading">Bubble幅とUnicode禁則処理</text>
  <text x="32" y="78" class="body">同じセリフでもmaxWidthに応じて高さを自動計算し、最後に収まる合法な改行候補を選びます。</text>
  <text x="32" y="112" class="subheading">1. maxWidthによる自動改行</text>
  ${widthCards}
  <text x="32" y="572" class="subheading">2. 禁則と書記素cluster保護（実際のwrapText出力）</text>
  ${kinsokuCards}`;
  return svgDocument({
    width: 1600,
    height: 950,
    title: "Bubble幅と禁則処理の例",
    description:
      "三つのmaxWidthによる自動改行と、行頭禁則、行末禁則、小書き仮名、絵文字書記素clusterの保護を示す図。",
    body,
  });
}

function bubbleStyleGallerySvg() {
  const descriptions = Object.freeze({
    NORMAL: ["通常の会話", "丸い本体＋話者を指すtail"],
    THINKING: ["思考", "雲形本体＋小さな丸のtrail"],
    DREAMING: ["夢・回想", "柔らかな雲形＋長い丸trail"],
    YELLING: ["叫び", "鋭いburst輪郭で強調"],
    OFF_PANEL: ["画面外の話者", "tailを画面端方向へ伸ばす"],
    WAVY: ["不安・弱り", "揺れる輪郭"],
    WHISPERING: ["ささやき", "破線の弱い輪郭"],
    ANNOUNCEMENT: ["放送・告知", "二重の強い輪郭"],
    NARRATION: ["地の文", "tailなしの矩形panel"],
    NO_BUBBLE: ["本体もtailも描かず", "文字だけ表示"],
  });
  const examples = Object.freeze({
    NORMAL: ["今日はいい天気だね"],
    THINKING: ["どうしようかな…"],
    DREAMING: ["いつか空の向こうへ"],
    YELLING: ["危ない！"],
    OFF_PANEL: ["こっちだよ！"],
    WAVY: ["なんだか不安…"],
    WHISPERING: ["静かにしてね"],
    ANNOUNCEMENT: ["まもなく開演します"],
    NARRATION: ["その夜、港は静かだった。"],
    NO_BUBBLE: ["吹き出しなしの文字表示"],
  });
  const cards = bubbleVisualStyles
    .map((style, index) => {
      const column = index % 5;
      const row = Math.floor(index / 5);
      const cardX = 32 + column * 312;
      const cardY = 118 + row * 300;
      const bubbleWidth = 280;
      const bubbleHeight = 170;
      const tailDirection =
        style === "NARRATION" || style === "NO_BUBBLE"
          ? null
          : style === "OFF_PANEL"
            ? 270
            : 215;
      const svg = renderBubbleSvg({
        style,
        lines: examples[style],
        width: bubbleWidth,
        height: bubbleHeight,
        tailDirection,
        fontSize: 14,
        title: `${style} visual style example`,
      });
      return `<g data-style-gallery-card="${style}">
        <rect x="${cardX}" y="${cardY}" width="296" height="280" rx="18" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
        <text x="${cardX + 16}" y="${cardY + 32}" style="fill:${colors.ink};font-size:18px;font-weight:700">${style}</text>
        ${embedRenderedSvg(svg, cardX + 8, cardY + 44, bubbleWidth, bubbleHeight)}
        ${descriptions[style]
          .map(
            (line, lineIndex) =>
              `<text x="${cardX + 148}" y="${cardY + 232 + lineIndex * 18}" text-anchor="middle" class="small">${line}</text>`,
          )
          .join("\n")}
        <text x="${cardX + 148}" y="${cardY + 270}" text-anchor="middle" class="small">fill／border色は別指定</text>
      </g>`;
    })
    .join("\n");
  const body = `
  <rect width="1600" height="750" fill="${colors.page}"/>
  <text x="32" y="48" class="heading">Bubble visual style：形状の使い分け</text>
  <text x="32" y="78" class="body">すべてBubble側の共有SVG形状rendererから生成。NEGATIVEは色指定で表現するため独立styleにしません。</text>
  <text x="32" y="101" class="small">形状renderer基盤の仕様例です。standalone surfaceへのstyle block/API接続は後続実装です。</text>
  ${cards}
  <text x="32" y="724" class="small">orientation／segmentsは指定せず、幅・フォント・改行後の行数から外形寸法を自動計算します。</text>`;
  return svgDocument({
    width: 1600,
    height: 750,
    title: "Bubble visual style一覧",
    description:
      "NORMAL、THINKING、DREAMING、YELLING、OFF_PANEL、WAVY、WHISPERING、ANNOUNCEMENT、NARRATION、NO_BUBBLEのSVG形状例。",
    body,
  });
}

function face({ centerX, centerY, eyesClosed, mouthOpen, scale = 1 }) {
  const eyeY = centerY - 12 * scale;
  const leftEyeX = centerX - 18 * scale;
  const rightEyeX = centerX + 18 * scale;
  const eyes = eyesClosed
    ? `<path d="M ${leftEyeX - 7 * scale} ${eyeY} Q ${leftEyeX} ${eyeY + 6 * scale} ${leftEyeX + 7 * scale} ${eyeY}" fill="none" stroke="#3b2d3c" stroke-width="${3 * scale}" stroke-linecap="round"/>
       <path d="M ${rightEyeX - 7 * scale} ${eyeY} Q ${rightEyeX} ${eyeY + 6 * scale} ${rightEyeX + 7 * scale} ${eyeY}" fill="none" stroke="#3b2d3c" stroke-width="${3 * scale}" stroke-linecap="round"/>`
    : `<ellipse cx="${leftEyeX}" cy="${eyeY}" rx="${4 * scale}" ry="${7 * scale}" fill="#3b2d3c"/>
       <ellipse cx="${rightEyeX}" cy="${eyeY}" rx="${4 * scale}" ry="${7 * scale}" fill="#3b2d3c"/>`;
  const mouth = mouthOpen
    ? `<ellipse cx="${centerX}" cy="${centerY + 20 * scale}" rx="${9 * scale}" ry="${12 * scale}" fill="#7c2945"/>`
    : `<path d="M ${centerX - 10 * scale} ${centerY + 21 * scale} Q ${centerX} ${centerY + 26 * scale} ${centerX + 10 * scale} ${centerY + 21 * scale}" fill="none" stroke="#7c2945" stroke-width="${3 * scale}" stroke-linecap="round"/>`;
  return `<g>
    <circle cx="${centerX}" cy="${centerY}" r="${52 * scale}" fill="#ffd5b5" stroke="#b85d63" stroke-width="${4 * scale}"/>
    <path d="M ${centerX - 48 * scale} ${centerY - 23 * scale} Q ${centerX} ${centerY - 78 * scale} ${centerX + 48 * scale} ${centerY - 23 * scale} Q ${centerX + 25 * scale} ${centerY - 47 * scale} ${centerX} ${centerY - 34 * scale} Q ${centerX - 25 * scale} ${centerY - 47 * scale} ${centerX - 48 * scale} ${centerY - 23 * scale}" fill="#50354f"/>
    ${eyes}
    ${mouth}
  </g>`;
}

function speechBubble({
  x,
  y,
  width,
  height,
  message,
  indicator = false,
  indicatorOffset = 0,
}) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="28" fill="#fff4cc" stroke="#725a42" stroke-width="3"/>
    <path d="M ${x + 30} ${y + height - 6} L ${x + 4} ${y + height + 30} L ${x + 78} ${y + height - 3} Z" fill="#fff4cc" stroke="#725a42" stroke-width="3" stroke-linejoin="round"/>
    <path d="M ${x + 26} ${y + height} H ${x + 82}" stroke="#fff4cc" stroke-width="8"/>
    <text x="${x + 36}" y="${y + 70}" style="fill:${colors.ink};font-size:28px;font-weight:700">${escapeXml(message)}</text>
    ${
      indicator
        ? `<g transform="translate(0 ${indicatorOffset})">
             <path d="M ${x + width - 58} ${y + height - 54} l 18 0 l -9 12 z" fill="${colors.bubble}"/>
             <path d="M ${x + width - 58} ${y + height - 35} l 18 0 l -9 12 z" fill="${colors.bubbleDark}"/>
           </g>`
        : ""
    }
  </g>`;
}

function phaseCard({
  x,
  title,
  subtitle,
  phase,
  eyesClosed,
  mouthOpen,
  indicator,
  labels,
}) {
  return `<g>
    <rect x="${x}" y="86" width="360" height="382" rx="20" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
    <rect x="${x + 20}" y="106" width="170" height="34" rx="17" fill="${phase === "awaiting-advance" ? colors.bubble : "#e8ebf2"}"/>
    <text x="${x + 105}" y="129" text-anchor="middle" style="fill:${phase === "awaiting-advance" ? "#ffffff" : colors.ink};font-size:15px;font-weight:700">${escapeXml(title)}</text>
    <text x="${x + 20}" y="164" class="small">${escapeXml(subtitle)}</text>
    ${face({ centerX: x + 76, centerY: 253, eyesClosed, mouthOpen, scale: 0.72 })}
    ${speechBubble({
      x: x + 139,
      y: 196,
      width: 190,
      height: 112,
      message: "海へ出発！",
      indicator,
      indicatorOffset: 0,
    }).replace("font-size:28px", "font-size:17px")}
    ${labels
      .map(
        (
          [name, value, active],
          index,
        ) => `<g transform="translate(0 ${index * 35})">
          <circle cx="${x + 32}" cy="355" r="7" fill="${active ? "#20a464" : "#c7ccd8"}"/>
          <text x="${x + 50}" y="361" class="body">${escapeXml(name)}</text>
          <text x="${x + 328}" y="361" text-anchor="end" class="body" style="font-weight:700">${escapeXml(value)}</text>
        </g>`,
      )
      .join("\n")}
  </g>`;
}

function phaseGuideSvg() {
  const body = `
  <rect width="1200" height="500" fill="${colors.page}"/>
  <text x="32" y="47" class="heading">animation modeで表示中の動きを切り替える</text>
  <text x="32" y="72" class="small">緑は実行中、灰色は停止・非表示です。目パチはBubbleが表示されている間継続します。</text>
  ${phaseCard({
    x: 24,
    title: "talking",
    subtitle: "say／think直後",
    phase: "talking",
    eyesClosed: false,
    mouthOpen: true,
    indicator: false,
    labels: [
      ["目パチ", "実行", true],
      ["口パク", "実行", true],
      ["次へ", "非表示", false],
    ],
  })}
  ${phaseCard({
    x: 420,
    title: "awaiting-advance",
    subtitle: "ユーザの「次へ」操作待ち",
    phase: "awaiting-advance",
    eyesClosed: true,
    mouthOpen: false,
    indicator: true,
    labels: [
      ["目パチ", "実行", true],
      ["口パク", "停止", false],
      ["次へ", "ループ", true],
    ],
  })}
  ${phaseCard({
    x: 816,
    title: "idle",
    subtitle: "表示したまま静止",
    phase: "idle",
    eyesClosed: false,
    mouthOpen: false,
    indicator: false,
    labels: [
      ["目パチ", "実行", true],
      ["口パク", "停止", false],
      ["次へ", "非表示", false],
    ],
  })}`;
  return svgDocument({
    width: 1200,
    height: 500,
    title: "Bubble animation mode比較",
    description:
      "talking、awaiting-advance、idleにおける目パチ、口パク、advance framesの動作比較。",
    body,
  });
}

function timelineSegment(x, width, label, active) {
  return `<g>
    <rect x="${x}" y="72" width="${width}" height="38" rx="19" fill="${active ? colors.bubble : "#dfe3eb"}"/>
    <text x="${x + width / 2}" y="97" text-anchor="middle" style="fill:${active ? "#ffffff" : colors.muted};font-size:14px;font-weight:700">${escapeXml(label)}</text>
  </g>`;
}

function lifecycleFrameSvg(index) {
  const phase =
    index < 8
      ? "talking"
      : index < 14
        ? "awaiting-advance"
        : index === 14
          ? "input"
          : "closed";
  const mouthOpen = phase === "talking" && index % 2 === 1;
  const eyesClosed = index === 3 || index === 11;
  const indicator = phase === "awaiting-advance" || phase === "input";
  const indicatorOffset = index % 2 === 0 ? 0 : 7;
  const activeIndex =
    phase === "talking"
      ? 0
      : phase === "awaiting-advance"
        ? 1
        : phase === "input"
          ? 2
          : 3;
  const stateText =
    phase === "talking"
      ? "talking：目パチ＋口パク"
      : phase === "awaiting-advance"
        ? "awaiting-advance：口パク停止＋次へループ"
        : phase === "input"
          ? "キー入力／タップ成立"
          : "close：timer・skin・drawableを解放";
  const blockText =
    phase === "talking"
      ? "say  [海へ出発！]  with bubble style  [hero-dialogue]"
      : phase === "awaiting-advance"
        ? 'wait with this bubble until  [input == "pressed"]  or timeout  [10] seconds'
        : phase === "input"
          ? 'Runtime Expression:  input == "pressed"  → true'
          : "close this bubble";
  const blockColor = phase === "input" ? colors.control : colors.bubble;

  const body = `
  <rect width="960" height="540" fill="${colors.page}"/>
  <text x="30" y="42" class="heading">Bubble表示の1サイクル</text>
  <text x="30" y="64" class="small">Async Inputがruntime変数を更新し、BubbleはRuntime Expressionの条件成立またはtimeoutまで待ちます。</text>
  ${timelineSegment(30, 205, "1  say / talking", activeIndex === 0)}
  ${timelineSegment(250, 205, "2  Bubble内蔵待機", activeIndex === 1)}
  ${timelineSegment(470, 205, "3  条件成立", activeIndex === 2)}
  ${timelineSegment(690, 205, "4  close", activeIndex === 3)}
  <rect x="30" y="132" width="900" height="288" rx="24" fill="#ffffff" stroke="#d9deea" stroke-width="2"/>
  ${face({ centerX: 194, centerY: 278, eyesClosed, mouthOpen, scale: 1.18 })}
  ${
    phase === "closed"
      ? `<g>
           <circle cx="610" cy="272" r="62" fill="#e7f7ef"/>
           <path d="M 580 271 l 20 20 l 42 -49" fill="none" stroke="#20a464" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
           <text x="610" y="363" text-anchor="middle" style="fill:${colors.ink};font-size:20px;font-weight:700">Bubbleは画面から消えます</text>
         </g>`
      : speechBubble({
          x: 345,
          y: 178,
          width: 505,
          height: 180,
          message: "海へ出発！",
          indicator,
          indicatorOffset,
        })
  }
  ${
    phase === "input"
      ? `<g>
           <circle cx="817" cy="143" r="33" fill="${colors.control}"/>
           <path d="M 805 143 h 24 M 817 131 v 24" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
         </g>`
      : ""
  }
  <text x="480" y="400" text-anchor="middle" style="fill:${colors.ink};font-size:18px;font-weight:700">${escapeXml(stateText)}</text>
  <rect x="160" y="452" width="640" height="58" rx="14" fill="${blockColor}" stroke="#000000" stroke-opacity="0.14" stroke-width="2"/>
  <rect x="182" y="452" width="32" height="7" rx="4" fill="#000000" fill-opacity="0.18"/>
  <text x="480" y="489" text-anchor="middle" style="fill:#ffffff;font-size:17px;font-weight:700">${escapeXml(blockText)}</text>`;

  return svgDocument({
    width: 960,
    height: 540,
    title: `Bubble lifecycle ${phase}`,
    description: stateText,
    body,
  });
}

async function run(command, args) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function main() {
  await mkdir(assetsDirectory, { recursive: true });
  await writeFile(
    join(assetsDirectory, "block-quick-start.svg"),
    quickStartSvg(),
    "utf8",
  );
  await writeFile(
    join(assetsDirectory, "animation-mode-guide.svg"),
    phaseGuideSvg(),
    "utf8",
  );
  await writeFile(
    join(assetsDirectory, "presentation-mode-guide.svg"),
    presentationModeGuideSvg(),
    "utf8",
  );
  await writeFile(
    join(assetsDirectory, "placement-guide.svg"),
    placementGuideSvg(),
    "utf8",
  );
  await writeFile(
    join(assetsDirectory, "actor-transform-guide.svg"),
    actorTransformGuideSvg(),
    "utf8",
  );
  await writeFile(
    join(assetsDirectory, "width-linebreak-guide.svg"),
    widthLinebreakGuideSvg(),
    "utf8",
  );
  await writeFile(
    join(assetsDirectory, "bubble-style-gallery.svg"),
    bubbleStyleGallerySvg(),
    "utf8",
  );

  const frameDirectory = await mkdtemp(
    join(tmpdir(), "turbowarp-bubble-manual-"),
  );
  try {
    const delays = [
      22, 22, 22, 36, 22, 22, 22, 50, 25, 25, 25, 35, 25, 45, 55, 90,
    ];
    const imageArguments = [];
    for (const [index, delay] of delays.entries()) {
      const framePath = join(
        frameDirectory,
        `frame-${String(index).padStart(2, "0")}.svg`,
      );
      await writeFile(framePath, lifecycleFrameSvg(index), "utf8");
      imageArguments.push("-delay", String(delay), framePath);
    }
    await run("magick", [
      ...imageArguments,
      "-loop",
      "0",
      "-layers",
      "Optimize",
      "-colors",
      "64",
      "-dither",
      "None",
      join(assetsDirectory, "bubble-lifecycle.gif"),
    ]);
  } finally {
    await rm(frameDirectory, { recursive: true, force: true });
  }
}

await main();
