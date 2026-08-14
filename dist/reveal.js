//#region src/reveal.ts
var e = Object.freeze([
	"CHARACTER",
	"WORD",
	"LINE",
	"BLOCK"
]);
function t(e) {
	let t = globalThis.Intl?.Segmenter;
	return typeof t == "function" ? [...new t(void 0, { granularity: "grapheme" }).segment(e)].map(({ segment: e }) => e) : Array.from(e);
}
function n(t) {
	if (typeof t != "string" || !e.includes(t)) throw TypeError("Bubble reveal unit must be CHARACTER, WORD, LINE, or BLOCK.");
	return t;
}
function r(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError("Bubble reveal must be an object.");
	let t = e, r = /* @__PURE__ */ new Set([
		"unit",
		"delimiters",
		"showDelimiters",
		"layout",
		"intervalSeconds",
		"sound"
	]);
	if (Object.keys(t).filter((e) => !r.has(e)).length > 0 || t.unit === void 0) throw TypeError("Bubble reveal has unknown or missing properties.");
	let i = n(t.unit), a = t.delimiters ?? " 	\r\n";
	if (typeof a != "string" || a.length === 0) throw TypeError("Bubble WORD delimiters must be a non-empty string.");
	let o = t.showDelimiters ?? !1;
	if (typeof o != "boolean") throw TypeError("Bubble reveal showDelimiters must be boolean.");
	let s = t.layout ?? "DYNAMIC";
	if (s !== "DYNAMIC" && s !== "RESERVED") throw TypeError("Bubble reveal layout must be DYNAMIC or RESERVED.");
	let c = t.intervalSeconds ?? 0;
	if (typeof c != "number" || !Number.isFinite(c) || c < 0) throw TypeError("Bubble reveal intervalSeconds must be zero or greater.");
	let l = t.sound;
	if (l !== void 0 && (typeof l != "string" || l.length === 0)) throw TypeError("Bubble reveal sound must be a non-empty asset name.");
	return Object.freeze({
		unit: i,
		delimiters: a,
		showDelimiters: o,
		layout: s,
		intervalSeconds: c,
		...l === void 0 ? {} : { sound: l }
	});
}
function i(e, n, r) {
	let i = new Set(Array.from(n)), a = [], o = "";
	for (let n of t(e)) o += n, i.has(n) && ((r || o.slice(0, -n.length).length > 0) && a.push(r ? o : o.slice(0, -n.length)), o = "");
	return o.length > 0 && a.push(o), a.filter((e) => e.length > 0);
}
function a(e, n) {
	if (e.length === 0) return Object.freeze([""]);
	if (n.unit === "CHARACTER") return Object.freeze(t(e));
	if (n.unit === "WORD") {
		let t = i(e, n.delimiters, n.showDelimiters);
		if (n.showDelimiters) return Object.freeze(t);
		let r = [], a = 0;
		for (let i of t) {
			let t = e.indexOf(i, a);
			if (t < 0) r.push(i);
			else for (r.push(i), a = t + i.length; a < e.length && n.delimiters.includes(e[a] ?? "");) a += 1;
		}
		return Object.freeze(r);
	}
	let r = n.unit === "LINE" ? /(?<=\n)/u : /\n{2,}/u, a = e.split(r).filter((e) => e.length > 0);
	if (n.unit === "BLOCK") {
		let t = [...e.matchAll(/\n{2,}/gu)].map(([e]) => e), n = a.map((e, n) => n < t.length ? `${e}${t[n] ?? ""}` : e);
		return Object.freeze(n.length > 0 ? n : [e]);
	}
	let o = a;
	return Object.freeze(o.length > 0 ? o : [e]);
}
function o(e, t) {
	return e.slice(0, Math.max(0, Math.min(t, e.length))).join("");
}
//#endregion
export { e as bubbleRevealUnits, r as normalizeBubbleReveal, o as revealedBubbleText, a as splitBubbleText };
