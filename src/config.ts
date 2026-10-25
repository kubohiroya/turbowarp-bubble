export const extensionConfig = {
  id: "kubohiroyabubble",
  slug: "turbowarp-bubble",
  name: "Bubble",
  description:
    "Layered say and think bubbles with portrait animation and continue indicators.",
  author: "Hiroya Kubo",
  license: "MPL-2.0",
  unsandboxed: true,
  blockIconURI: `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M9 8h17a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5H18l-7 5v-5H9a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5z" fill="#59C059"/><path d="M29 23h10a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5h-6l-6 4v-4a5 5 0 0 1-3-5v-5a5 5 0 0 1 5-5z" fill="#4C97FF"/></svg>',
  )}`,
} as const;

export const extensionDescriptions = {
  ja: "立ち絵のアニメーションや入力待ちの表示を伴う吹き出しを、重ねて表示します。",
} as const;
