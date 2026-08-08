import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSvgTextComposition } from "@kubohiroya/turbowarp-svg-text/composition";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDirectory = join(projectRoot, "docs", "assets");
const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif';

const colors = Object.freeze({
  asset: "#5b7cfa",
  bubble: "#ff6680",
  bubbleDark: "#d94b68",
  control: "#ffab19",
  event: "#ffbf00",
  ink: "#25283a",
  muted: "#667085",
  panel: "#ffffff",
  page: "#f2f4f8",
  svgText: "#9966ff",
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

function renderBubbleTextSvg(message, fontPercent = 100) {
  let renderedSvg = "";
  const composition = createSvgTextComposition({
    runtime: {
      renderer: {
        createSVGSkin(source) {
          renderedSvg = source;
          return 1;
        },
        destroySkin() {},
        getNativeSize() {
          return [480, 360];
        },
        updateDrawableSkinId() {},
      },
    },
  });
  composition.defineStyle({
    name: "placement-guide",
    backgroundColor: "#fff4cc",
    textColor: colors.ink,
    font: "Noto Sans JP",
    fontPercent,
    alignment: "center",
  });
  composition.setText({
    styleName: "placement-guide",
    target: { drawableID: 1 },
    text: message,
  });
  composition.releaseAll();
  if (!renderedSvg) {
    throw new Error("SVG Text did not create a placement-guide skin.");
  }
  return renderedSvg;
}

function embedRenderedBubble(renderedSvg, centerX, centerY, scale = 1) {
  const widthMatch = renderedSvg.match(/\bwidth="([0-9.]+)"/u);
  const heightMatch = renderedSvg.match(/\bheight="([0-9.]+)"/u);
  if (!widthMatch || !heightMatch) {
    throw new Error("Rendered SVG Text skin has no numeric dimensions.");
  }
  const sourceWidth = Number(widthMatch[1]);
  const sourceHeight = Number(heightMatch[1]);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const innerSvg = renderedSvg
    .replace(/^<svg[^>]*>/u, "")
    .replace(/<\/svg>\s*$/u, "");
  return `<svg x="${centerX - width / 2}" y="${centerY - height / 2}" width="${width}" height="${height}" viewBox="0 0 ${sourceWidth} ${sourceHeight}" data-renderer="turbowarp-svg-text" overflow="visible">
    ${innerSvg}
  </svg>`;
}

function panel(x, y, width, height, title) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="20" fill="${colors.panel}" stroke="#d9deea" stroke-width="2"/>
    <text x="${x + 24}" y="${y + 38}" class="subheading">${escapeXml(title)}</text>
  </g>`;
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
    ["costume:Assets:Next1 / Next2", "Next1 / Next2", "次へアイコン"],
  ];
  const mappingRows = mappings
    .map(
      (
        [resource, asset, purpose],
        index,
      ) => `<g transform="translate(0 ${index * 29})">
        <text x="58" y="302" class="small">${escapeXml(resource)}</text>
        <text x="312" y="302" class="small">${escapeXml(asset)}</text>
        <text x="443" y="302" class="small">${escapeXml(purpose)}</text>
      </g>`,
    )
    .join("\n");

  const body = `
  <rect width="1200" height="880" fill="${colors.page}"/>
  <text x="32" y="48" class="heading">Bubbleブロック：最小構成</text>
  <text x="32" y="74" class="body">緑の旗でstyleを準備し、セリフごとに speaking → waiting → close を実行します。</text>
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
  <rect x="46" y="292" width="514" height="187" rx="12" fill="#eef1ff" stroke="#cbd3ff"/>
  <text x="58" y="316" class="small" style="font-weight:700">RESOURCE_ID</text>
  <text x="312" y="316" class="small" style="font-weight:700">アセット名</text>
  <text x="443" y="316" class="small" style="font-weight:700">用途</text>
  <g transform="translate(0 27)">${mappingRows}</g>
  ${block({
    x: 48,
    y: 506,
    width: 510,
    height: 94,
    color: colors.svgText,
    fontSize: 12,
    ariaLabel: "SVG Textでdialogue-text styleを定義",
    lines: [
      [
        { text: "define text style" },
        { input: "dialogue-text" },
        { text: "background" },
        { input: "#fff4cc" },
      ],
      [
        { text: "text" },
        { input: "#332200" },
        { text: "font" },
        { input: "Noto Sans JP" },
        { text: "size" },
        { input: "100" },
        { text: "align" },
        { input: "left" },
      ],
      [{ text: "bubble direction" }, { input: "up" }],
    ],
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
  <path d="M 690 390 V 412" stroke="#aab2c3" stroke-width="4" stroke-linecap="round"/>
  ${block({
    x: 668,
    y: 418,
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
    y: 480,
    width: 454,
    color: colors.bubble,
    fontSize: 14,
    ariaLabel: "Bubbleをwaiting phaseへ変更",
    lines: [[{ text: "set this bubble phase" }, { input: "waiting" }]],
  })}
  ${block({
    x: 668,
    y: 542,
    width: 454,
    color: colors.control,
    fontSize: 14,
    ariaLabel: "キー入力またはタップまで待つ",
    lines: [
      [{ text: "wait until" }, { input: "space key pressed? or mouse down?" }],
    ],
  })}
  ${block({
    x: 668,
    y: 604,
    width: 454,
    color: colors.bubble,
    fontSize: 14,
    ariaLabel: "Bubbleを閉じる",
    lines: [[{ text: "close this bubble" }]],
  })}
  <rect x="644" y="674" width="502" height="132" rx="16" fill="#fff3f6" stroke="#ffc4d1"/>
  <text x="668" y="704" class="body" style="font-weight:700">重要：Bubble自身は入力を待ちません</text>
  <text x="668" y="733" class="body">waitingで「次へ」を動かし、Scratch側で待機。</text>
  <text x="668" y="762" class="body">入力成立後にcloseを実行してください。</text>`;

  return svgDocument({
    width: 1200,
    height: 880,
    title: "TurboWarp Bubbleブロックの最小構成",
    description:
      "Asset ManagerとSVG Textで準備し、Bubbleのsay、waiting、closeを順に使うブロック例。",
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
  const centerX = 300;
  const centerY = 350;
  const radius = 162;
  const directionBubble = renderBubbleTextSvg("Aa", 70);
  const directions = directionNames
    .map((name, index) => {
      const radians = ((index * 22.5) / 180) * Math.PI;
      const x = centerX + Math.sin(radians) * radius;
      const y = centerY - Math.cos(radians) * radius;
      const labelX = centerX + Math.sin(radians) * (radius + 42);
      const labelY = centerY - Math.cos(radians) * (radius + 42);
      return `<g>
        <path d="M ${centerX} ${centerY} L ${x} ${y}" stroke="#f4a4b4" stroke-width="2"/>
        ${embedRenderedBubble(directionBubble, x, y, 0.72)}
        <text x="${labelX}" y="${labelY + 4}" text-anchor="middle" style="fill:${colors.muted};font-size:9px">${name}</text>
      </g>`;
    })
    .join("\n");
  const backgroundBubble = (centerY, label) =>
    embedRenderedBubble(renderBubbleTextSvg(label), 910, centerY, 1.15);
  const body = `
  <rect width="1200" height="650" fill="${colors.page}"/>
  <text x="32" y="48" class="heading">Bubble placement：Actor相対と背景相対</text>
  <text x="32" y="76" class="body">同じPLACEMENT入力で、Actorからの方向またはStage内の領域を選びます。</text>
  ${panel(24, 98, 560, 520, "Actor相対：方向あり")}
  <rect x="54" y="148" width="500" height="410" rx="18" fill="#f8f9fc" stroke="#cfd5e2" stroke-width="2"/>
  ${directions}
  <circle cx="${centerX}" cy="${centerY}" r="40" fill="#ffd5b5" stroke="#b85d63" stroke-width="3"/>
  <text x="${centerX}" y="${centerY + 6}" text-anchor="middle" style="fill:${colors.ink};font-size:15px;font-weight:700">Actor</text>
  <text x="300" y="591" text-anchor="middle" class="small">16正規方向＋16 alias／0〜360°（0=上、90=右）</text>
  ${panel(616, 98, 560, 520, "背景相対：方向なし")}
  <rect x="676" y="148" width="468" height="410" rx="18" fill="#dce9f7" stroke="#8fa8c4" stroke-width="3"/>
  <text x="692" y="176" class="small">Stage安全領域</text>
  ${backgroundBubble(226, "HEADER_LIKE")}
  ${backgroundBubble(353, "CENTER")}
  ${backgroundBubble(480, "FOOTER_LIKE")}
  <text x="910" y="591" text-anchor="middle" class="small">Actor座標・bounds・可視性に依存せず、tailを持たない配置</text>`;
  return svgDocument({
    width: 1200,
    height: 650,
    title: "Bubble placementの二つの基準",
    description:
      "Actor相対の16方向および角度指定と、背景相対のHEADER_LIKE、CENTER、FOOTER_LIKEを比較する図。",
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
    <rect x="${x + 20}" y="106" width="116" height="34" rx="17" fill="${phase === "waiting" ? colors.bubble : "#e8ebf2"}"/>
    <text x="${x + 78}" y="129" text-anchor="middle" style="fill:${phase === "waiting" ? "#ffffff" : colors.ink};font-size:15px;font-weight:700">${escapeXml(title)}</text>
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
  <text x="32" y="47" class="heading">phaseでアニメーションを切り替える</text>
  <text x="32" y="72" class="small">緑は実行中、灰色は停止・非表示です。目パチはBubbleが表示されている間継続します。</text>
  ${phaseCard({
    x: 24,
    title: "speaking",
    subtitle: "say／think直後",
    phase: "speaking",
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
    title: "waiting",
    subtitle: "キー入力／タップ待ち",
    phase: "waiting",
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
    title: "Bubble phase比較",
    description:
      "speaking、waiting、idleにおける目パチ、口パク、次へアイコンの動作比較。",
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
      ? "speaking"
      : index < 14
        ? "waiting"
        : index === 14
          ? "input"
          : "closed";
  const mouthOpen = phase === "speaking" && index % 2 === 1;
  const eyesClosed = index === 3 || index === 11;
  const indicator = phase === "waiting" || phase === "input";
  const indicatorOffset = index % 2 === 0 ? 0 : 7;
  const activeIndex =
    phase === "speaking"
      ? 0
      : phase === "waiting"
        ? 1
        : phase === "input"
          ? 2
          : 3;
  const stateText =
    phase === "speaking"
      ? "speaking：目パチ＋口パク"
      : phase === "waiting"
        ? "waiting：口パク停止＋次へループ"
        : phase === "input"
          ? "キー入力／タップ成立"
          : "close：timer・skin・drawableを解放";
  const blockText =
    phase === "speaking"
      ? "say  [海へ出発！]  with bubble style  [hero-dialogue]"
      : phase === "waiting"
        ? "set this bubble phase  [waiting]"
        : phase === "input"
          ? "space key pressed?  or  mouse down?"
          : "close this bubble";
  const blockColor = phase === "input" ? colors.control : colors.bubble;

  const body = `
  <rect width="960" height="540" fill="${colors.page}"/>
  <text x="30" y="42" class="heading">Bubble表示の1サイクル</text>
  <text x="30" y="64" class="small">Bubbleは入力判定を行わないため、waitingの後はScratch側で待ちます。</text>
  ${timelineSegment(30, 205, "1  say / speaking", activeIndex === 0)}
  ${timelineSegment(250, 205, "2  waiting", activeIndex === 1)}
  ${timelineSegment(470, 205, "3  キー／タップ", activeIndex === 2)}
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
    join(assetsDirectory, "phase-guide.svg"),
    phaseGuideSvg(),
    "utf8",
  );
  await writeFile(
    join(assetsDirectory, "placement-guide.svg"),
    placementGuideSvg(),
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
