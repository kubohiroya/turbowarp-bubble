import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(projectRoot, "docs", "block-manual.md");
const outputPath = resolve(projectRoot, "docs", "index.html");

async function renderPage() {
  const markdown = await readFile(sourcePath, "utf8");
  const content = await marked.parse(markdown, { gfm: true });
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="TurboWarp Bubble機能拡張のブロック利用マニュアル。吹き出し形状、配置、表情、目パチ、口パク、入力待ちアイコンを図解します。">
  <title>TurboWarp Bubble ブロック利用マニュアル</title>
  <style>
    :root { color-scheme: light; --ink: #25283a; --muted: #667085; --accent: #d94b68; --line: #d9deea; --panel: #fff; --page: #f2f4f8; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; color: var(--ink); background: var(--page); font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif; line-height: 1.75; }
    .site-header { position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .8rem max(1rem, calc((100vw - 1080px) / 2)); color: #fff; background: #25283a; box-shadow: 0 2px 10px #25283a33; }
    .site-header a { color: #fff; text-decoration: none; }
    .brand { font-weight: 800; letter-spacing: .02em; }
    .repo-link { padding: .35rem .75rem; border: 1px solid #ffffff66; border-radius: 999px; font-size: .9rem; }
    .manual { width: min(1080px, calc(100% - 2rem)); margin: 2rem auto 4rem; padding: clamp(1rem, 4vw, 3.5rem); background: var(--panel); border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 12px 36px #25283a12; }
    h1, h2, h3 { line-height: 1.35; scroll-margin-top: 5rem; }
    h1 { margin-top: 0; font-size: clamp(1.9rem, 4vw, 2.8rem); }
    h2 { margin-top: 2.8rem; padding-bottom: .4rem; border-bottom: 2px solid #ff6680; font-size: clamp(1.45rem, 3vw, 2rem); }
    h3 { margin-top: 2rem; font-size: 1.25rem; }
    a { color: #b83255; text-underline-offset: .18em; }
    img { display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 12px; }
    table { display: block; width: 100%; overflow-x: auto; border-collapse: collapse; margin: 1.2rem 0; }
    th, td { padding: .65rem .8rem; border: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { background: #fff0f4; }
    pre { overflow-x: auto; padding: 1rem 1.1rem; color: #f8fafc; background: #25283a; border-radius: 12px; line-height: 1.55; }
    code { padding: .12em .35em; background: #f1e9ff; border-radius: 5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .92em; }
    pre code { padding: 0; color: inherit; background: transparent; }
    blockquote { margin-left: 0; padding: .25rem 1rem; color: var(--muted); border-left: 4px solid #ff6680; }
    .site-footer { padding: 0 1rem 3rem; color: var(--muted); text-align: center; font-size: .9rem; }
    @media (max-width: 640px) { .site-header { position: static; } .manual { width: 100%; margin-top: 0; border-width: 0; border-radius: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="./">TurboWarp Bubble</a>
    <a class="repo-link" href="https://github.com/kubohiroya/turbowarp-bubble">GitHub</a>
  </header>
  <main class="manual">
${content}  </main>
  <footer class="site-footer">Source code is available under MPL-2.0.</footer>
</body>
</html>
`;
}

const expected = await renderPage();
if (argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== expected) {
    throw new Error("docs/index.html is stale. Run pnpm docs:pages.");
  }
} else {
  await writeFile(outputPath, expected, "utf8");
}
