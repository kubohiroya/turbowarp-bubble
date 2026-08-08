import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = resolve(projectRoot, "docs");
const sectionIds = [
  "requirements",
  "portrait",
  "text-style",
  "bubble-style",
  "lifecycle",
  "phases",
  "say-think",
  "clones",
  "reference",
  "troubleshooting",
  "cleanup",
  "regeneration",
];

const locales = [
  {
    lang: "en",
    source: resolve(docsRoot, "block-manual.md"),
    output: resolve(docsRoot, "index.html"),
    title: "TurboWarp Bubble Block Manual",
    description:
      "Block manual for TurboWarp Bubble, including shapes, placement, portraits, blinking, lip-sync, and the animated advance indicator.",
    skip: "Skip to the manual",
    brandLabel: "Bubble manual home",
    navLabel: "Manual sections",
    nav: [
      ["Get started", "requirements"],
      ["Styles", "bubble-style"],
      ["Display & wait", "lifecycle"],
      ["Block reference", "reference"],
    ],
    languageLabel: "Language",
    englishHref: "./",
    japaneseHref: "./ja/",
    currentLanguage: "en",
    assetPrefix: "./assets/",
    footer: "Source code is available under MPL-2.0.",
  },
  {
    lang: "ja",
    source: resolve(docsRoot, "block-manual.ja.md"),
    output: resolve(docsRoot, "ja", "index.html"),
    title: "TurboWarp Bubble ブロック利用マニュアル",
    description:
      "TurboWarp Bubble機能拡張のブロック利用マニュアル。吹き出し形状、配置、表情、目パチ、口パク、入力待ちアイコンを図解します。",
    skip: "マニュアル本文へ移動",
    brandLabel: "Bubble日本語マニュアルの先頭",
    navLabel: "マニュアルの章",
    nav: [
      ["使い始める", "requirements"],
      ["スタイル", "bubble-style"],
      ["表示と待機", "lifecycle"],
      ["ブロック一覧", "reference"],
    ],
    languageLabel: "言語",
    englishHref: "../",
    japaneseHref: "./",
    currentLanguage: "ja",
    assetPrefix: "../assets/",
    footer: "ソースコードはMPL-2.0で公開されています。",
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function addSectionIds(content) {
  let index = 0;
  return content.replaceAll("<h2>", () => {
    const id = sectionIds[index];
    index += 1;
    return id === undefined ? "<h2>" : `<h2 id="${id}">`;
  });
}

async function renderPage(locale) {
  const markdown = await readFile(locale.source, "utf8");
  let content = await marked.parse(markdown, { gfm: true });
  content = addSectionIds(content).replaceAll(
    'src="./assets/',
    `src="${locale.assetPrefix}`,
  );
  const nav = locale.nav
    .map(([label, id]) => `<a href="#${id}">${escapeHtml(label)}</a>`)
    .join("\n          ");
  const englishCurrent =
    locale.currentLanguage === "en" ? ' aria-current="page"' : "";
  const japaneseCurrent =
    locale.currentLanguage === "ja" ? ' aria-current="page"' : "";

  return `<!doctype html>
<html lang="${locale.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(locale.description)}">
  <title>${escapeHtml(locale.title)}</title>
  <style>
    :root { color-scheme: light dark; --ink: #25283a; --muted: #667085; --accent: #d94b68; --accent-strong: #b83255; --accent-soft: #fff0f4; --line: #d9deea; --panel: #fff; --page: #f2f4f8; --code: #25283a; }
    @media (prefers-color-scheme: dark) { :root { --ink: #f7edf1; --muted: #c8bcc2; --accent: #ff8ca3; --accent-strong: #ffb2c1; --accent-soft: #48252f; --line: #50434a; --panel: #211c20; --page: #151215; --code: #100d10; } }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; scroll-padding-top: 6rem; }
    body { margin: 0; color: var(--ink); background: radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 28rem), var(--page); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif; line-height: 1.75; }
    a { color: var(--accent-strong); text-underline-offset: .18em; }
    a:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; border-radius: .2rem; }
    .skip-link { position: absolute; top: -5rem; left: 1rem; z-index: 20; padding: .65rem .9rem; color: var(--ink); background: var(--panel); border-radius: .5rem; }
    .skip-link:focus { top: 1rem; }
    .site-header { position: sticky; top: 0; z-index: 10; border-bottom: 1px solid color-mix(in srgb, var(--line) 80%, transparent); background: color-mix(in srgb, var(--page) 86%, transparent); backdrop-filter: blur(16px); box-shadow: 0 2px 10px #25283a14; }
    .header-inner { display: flex; width: min(70rem, calc(100% - 2rem)); min-height: 4.25rem; margin-inline: auto; align-items: center; gap: 1rem; }
    .brand { display: inline-flex; align-items: center; gap: .65rem; color: var(--ink); font-weight: 800; text-decoration: none; white-space: nowrap; }
    .brand-mark { display: grid; width: 2rem; height: 2rem; place-items: center; color: #fff; background: linear-gradient(145deg, #ff6680, #b83255); border-radius: .7rem .7rem .7rem .25rem; box-shadow: 0 7px 18px #b8325559; }
    .primary-nav { display: flex; align-items: center; gap: 1rem; margin-left: auto; font-size: .9rem; }
    .primary-nav a, .github-link { color: var(--muted); text-decoration: none; }
    .primary-nav a:hover, .github-link:hover { color: var(--ink); }
    .github-link { padding: .38rem .55rem; border-radius: .6rem; font-size: .84rem; font-weight: 750; }
    .language-switch { display: inline-flex; flex: 0 0 auto; padding: .2rem; border: 1px solid var(--line); border-radius: 99rem; background: var(--panel); white-space: nowrap; }
    .language-switch a { padding: .26rem .58rem; border-radius: 99rem; color: var(--muted); font-size: .82rem; font-weight: 750; text-decoration: none; }
    .language-switch a[aria-current="page"] { color: var(--ink); background: var(--accent-soft); }
    .manual { width: min(1080px, calc(100% - 2rem)); margin: 2rem auto 4rem; padding: clamp(1rem, 4vw, 3.5rem); background: var(--panel); border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 12px 36px #25283a12; }
    h1, h2, h3 { line-height: 1.35; scroll-margin-top: 5rem; }
    h1 { margin-top: 0; font-size: clamp(1.9rem, 4vw, 2.8rem); }
    h2 { margin-top: 2.8rem; padding-bottom: .4rem; border-bottom: 2px solid var(--accent); font-size: clamp(1.45rem, 3vw, 2rem); }
    h3 { margin-top: 2rem; font-size: 1.25rem; }
    img { display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 12px; }
    table { display: block; width: 100%; overflow-x: auto; border-collapse: collapse; margin: 1.2rem 0; }
    th, td { padding: .65rem .8rem; border: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { background: var(--accent-soft); }
    pre { overflow-x: auto; padding: 1rem 1.1rem; color: #f8fafc; background: var(--code); border-radius: 12px; line-height: 1.55; }
    code { padding: .12em .35em; background: var(--accent-soft); border-radius: 5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .92em; }
    pre code { padding: 0; color: inherit; background: transparent; }
    blockquote { margin-left: 0; padding: .25rem 1rem; color: var(--muted); border-left: 4px solid var(--accent); }
    .site-footer { padding: 0 1rem 3rem; color: var(--muted); text-align: center; font-size: .9rem; }
    @media (max-width: 850px) { .primary-nav { display: none; } .github-link { margin-left: auto; } }
    @media (max-width: 620px) { .brand-text { display: none; } .header-inner { gap: .4rem; } .github-link { padding-inline: .3rem; } .language-switch a { padding-inline: .45rem; } .manual { width: 100%; margin-top: 0; border-width: 0; border-radius: 0; box-shadow: none; } }
    @media print { .site-header, .skip-link { display: none; } body { background: #fff; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#manual">${escapeHtml(locale.skip)}</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="./" aria-label="${escapeHtml(locale.brandLabel)}">
        <span class="brand-mark" aria-hidden="true">B</span>
        <span class="brand-text">TurboWarp Bubble</span>
      </a>
      <nav class="primary-nav" aria-label="${escapeHtml(locale.navLabel)}">
        ${nav}
      </nav>
      <a class="github-link" href="https://github.com/kubohiroya/turbowarp-bubble">GitHub</a>
      <nav class="language-switch" aria-label="${escapeHtml(locale.languageLabel)}">
        <a href="${locale.englishHref}" lang="en" hreflang="en"${englishCurrent}>English</a>
        <a href="${locale.japaneseHref}" lang="ja" hreflang="ja"${japaneseCurrent}>日本語</a>
      </nav>
    </div>
  </header>
  <main id="manual" class="manual">
${content}  </main>
  <footer class="site-footer">${escapeHtml(locale.footer)}</footer>
</body>
</html>
`;
}

const renderedPages = await Promise.all(
  locales.map(async (locale) => ({
    locale,
    html: await renderPage(locale),
  })),
);

if (argv.includes("--check")) {
  for (const { locale, html } of renderedPages) {
    const current = await readFile(locale.output, "utf8").catch(() => "");
    if (current !== html) {
      throw new Error(`${locale.output} is stale. Run pnpm docs:pages.`);
    }
  }
} else {
  for (const { locale, html } of renderedPages) {
    await mkdir(dirname(locale.output), { recursive: true });
    await writeFile(locale.output, html, "utf8");
  }
}
