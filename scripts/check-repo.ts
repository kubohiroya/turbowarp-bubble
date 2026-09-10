import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

interface PackageManifest {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  files?: string[];
  [key: string]: unknown;
}

interface RepoPolicy {
  profile: string;
  packageName: string;
  extensionId: string;
  standaloneBundle: string;
  compositionBundle: string;
  typesEntry: string;
  readmes: {
    english: string;
    japanese: string;
  };
  companionVersions: {
    "@kubohiroya/turbowarp-svg-text": string;
    "@kubohiroya/turbowarp-asset-manager": string;
    "@kubohiroya/turbowarp-async-input": string;
    "@kubohiroya/turbowarp-runtime-expression": string;
  };
  minimumRuntimeCapabilities: {
    "@kubohiroya/turbowarp-asset-manager": string;
  };
  integrationIssues: string[];
}

type DependencySection =
  "dependencies" | "devDependencies" | "peerDependencies";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readText(path: string): Promise<string> {
  return readFile(resolve(projectRoot, path), "utf8");
}

async function readJson<T = unknown>(path: string): Promise<T> {
  return JSON.parse(await readText(path)) as T;
}

function requireText(source: string, expected: string, label: string) {
  if (!source.includes(expected)) {
    throw new Error(`${label} does not contain ${expected}.`);
  }
}

function forbidText(source: string, forbidden: string, label: string) {
  if (source.includes(forbidden)) {
    throw new Error(`${label} must not contain ${forbidden}.`);
  }
}

function requireDependencyVersion(
  manifest: PackageManifest,
  section: DependencySection,
  name: string,
  version: string,
) {
  const actual = manifest[section]?.[name];
  if (actual !== version) {
    throw new Error(
      `package.json ${section}.${name} must be ${version}, found ${String(actual)}.`,
    );
  }
}

function requirePeerRange(
  manifest: PackageManifest,
  name: string,
  range: string,
) {
  const actual = manifest.peerDependencies?.[name];
  if (actual !== range) {
    throw new Error(
      `package.json peerDependencies.${name} must be ${range}, found ${String(actual)}.`,
    );
  }
}

const [manifest, policy, readme, japaneseReadme, manual, japaneseManual] =
  await Promise.all([
    readJson<PackageManifest>("package.json"),
    readJson<RepoPolicy>("repo-policy.json"),
    readText("README.md"),
    readText("README.ja.md"),
    readText("docs/block-manual.md"),
    readText("docs/block-manual.ja.md"),
  ]);

const version = manifest.version;
if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/u.test(version)) {
  throw new Error("package.json must contain a stable semantic version.");
}

if (policy.profile !== "extension-composition-with-third-party-notices") {
  throw new Error("repo-policy.json has an unexpected profile.");
}
if (policy.packageName !== manifest.name) {
  throw new Error("repo-policy.json packageName must match package.json name.");
}
if (manifest.homepage !== "https://kubohiroya.github.io/turbowarp-bubble/") {
  throw new Error("package.json homepage must point to GitHub Pages.");
}
if (policy.readmes?.japanese !== "README.ja.md") {
  throw new Error("repo-policy.json must identify README.ja.md.");
}

if (manifest.files?.includes("README_ja.md")) {
  throw new Error("package.json files must not include README_ja.md.");
}
for (const requiredFile of [
  "README.md",
  "README.ja.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
]) {
  if (!manifest.files?.includes(requiredFile)) {
    throw new Error(`package.json files must include ${requiredFile}.`);
  }
}

requireText(readme, "**English** | [日本語](README.ja.md)", "README.md");
requireText(
  japaneseReadme,
  "[English](README.md) | **日本語**",
  "README.ja.md",
);
forbidText(readme, "README_ja.md", "README.md");
forbidText(japaneseReadme, "README_ja.md", "README.ja.md");

const bubbleCdn = `https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-bubble@${version}/dist/turbowarp-bubble.js`;
for (const [source, label] of [
  [readme, "README.md"],
  [japaneseReadme, "README.ja.md"],
  [manual, "docs/block-manual.md"],
  [japaneseManual, "docs/block-manual.ja.md"],
] as [string, string][]) {
  requireText(source, `Bubble ${version}`, label);
  requireText(source, bubbleCdn, label);
}

const companions = policy.companionVersions;
requireDependencyVersion(
  manifest,
  "dependencies",
  "@kubohiroya/turbowarp-svg-text",
  companions["@kubohiroya/turbowarp-svg-text"],
);
for (const name of [
  "@kubohiroya/turbowarp-async-input",
  "@kubohiroya/turbowarp-runtime-expression",
] as const) {
  requireDependencyVersion(manifest, "devDependencies", name, companions[name]);
  requirePeerRange(manifest, name, ">=0.3.0 <1");
}
requireDependencyVersion(
  manifest,
  "devDependencies",
  "@kubohiroya/turbowarp-asset-manager",
  companions["@kubohiroya/turbowarp-asset-manager"],
);
requirePeerRange(manifest, "@kubohiroya/turbowarp-asset-manager", ">=0.7.0 <1");

const companionLabels = [
  ["SVG Text", companions["@kubohiroya/turbowarp-svg-text"]],
  ["Asset Manager", companions["@kubohiroya/turbowarp-asset-manager"]],
  ["Async Input", companions["@kubohiroya/turbowarp-async-input"]],
  [
    "Runtime Expression",
    companions["@kubohiroya/turbowarp-runtime-expression"],
  ],
];
for (const [name, versionText] of companionLabels) {
  for (const [source, label] of [
    [readme, "README.md"],
    [japaneseReadme, "README.ja.md"],
    [manual, "docs/block-manual.md"],
    [japaneseManual, "docs/block-manual.ja.md"],
  ] as [string, string][]) {
    requireText(source, `${name} ${versionText}`, label);
  }
}

for (const [packageName, packageVersion] of Object.entries(companions)) {
  const bundleName = packageName.replace("@kubohiroya/turbowarp-", "");
  const fileName = bundleName === "bubble" ? "turbowarp-bubble" : bundleName;
  const cdnPrefix = `https://cdn.jsdelivr.net/npm/${packageName}@${packageVersion}/dist/`;
  const expected =
    packageName === "@kubohiroya/turbowarp-svg-text"
      ? `${packageName}@${packageVersion}`
      : `${cdnPrefix}${fileName}.js`;
  requireText(readme, expected, "README.md");
  requireText(japaneseReadme, expected, "README.ja.md");
}

for (const issueUrl of policy.integrationIssues) {
  requireText(JSON.stringify(policy), issueUrl, "repo-policy.json");
}

process.stdout.write("Repository policy is aligned.\n");
