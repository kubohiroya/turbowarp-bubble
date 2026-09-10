//#region src/content-run.ts
function e(e) {
	return e.every((e) => e.type === "text");
}
function t(e) {
	return e.map((e) => e.type === "ruby" ? e.base : e.text).join("");
}
function n(e) {
	let t = [];
	for (let n of e) {
		let e = t[t.length - 1];
		if (n.type === "text" && e?.type === "text") {
			t[t.length - 1] = Object.freeze({
				text: `${e.text}${n.text}`,
				type: "text"
			});
			continue;
		}
		t.push(n);
	}
	return Object.freeze(t);
}
//#endregion
//#region src/reveal.ts
var r = Object.freeze([
	"CHARACTER",
	"WORD",
	"LINE",
	"BLOCK"
]);
function i(e) {
	let t = globalThis.Intl?.Segmenter;
	return typeof t == "function" ? [...new t(void 0, { granularity: "grapheme" }).segment(e)].map(({ segment: e }) => e) : Array.from(e);
}
function a(e) {
	if (typeof e != "string" || !r.includes(e)) throw TypeError("Bubble reveal unit must be CHARACTER, WORD, LINE, or BLOCK.");
	return e;
}
function o(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError("Bubble reveal must be an object.");
	let t = e, n = /* @__PURE__ */ new Set([
		"unit",
		"delimiters",
		"showDelimiters",
		"layout",
		"intervalSeconds",
		"sound"
	]);
	if (Object.keys(t).filter((e) => !n.has(e)).length > 0 || t.unit === void 0) throw TypeError("Bubble reveal has unknown or missing properties.");
	let r = a(t.unit), i = t.delimiters ?? " 	\r\n";
	if (typeof i != "string" || i.length === 0) throw TypeError("Bubble WORD delimiters must be a non-empty string.");
	let o = t.showDelimiters ?? !1;
	if (typeof o != "boolean") throw TypeError("Bubble reveal showDelimiters must be boolean.");
	let s = t.layout ?? "DYNAMIC";
	if (s !== "DYNAMIC" && s !== "RESERVED") throw TypeError("Bubble reveal layout must be DYNAMIC or RESERVED.");
	let c = t.intervalSeconds ?? 0;
	if (typeof c != "number" || !Number.isFinite(c) || c < 0) throw TypeError("Bubble reveal intervalSeconds must be zero or greater.");
	let l = t.sound;
	if (l !== void 0 && (typeof l != "string" || l.length === 0)) throw TypeError("Bubble reveal sound must be a non-empty asset name.");
	return Object.freeze({
		unit: r,
		delimiters: i,
		showDelimiters: o,
		layout: s,
		intervalSeconds: c,
		...l === void 0 ? {} : { sound: l }
	});
}
function s(e, t, n) {
	let r = new Set(Array.from(t)), a = [], o = "";
	for (let t of i(e)) o += t, r.has(t) && ((n || o.slice(0, -t.length).length > 0) && a.push(n ? o : o.slice(0, -t.length)), o = "");
	return o.length > 0 && a.push(o), a.filter((e) => e.length > 0);
}
function c(e, t) {
	if (e.length === 0) return Object.freeze([""]);
	if (t.unit === "CHARACTER") return Object.freeze(i(e));
	if (t.unit === "WORD") {
		let n = s(e, t.delimiters, t.showDelimiters);
		if (t.showDelimiters) return Object.freeze(n);
		let r = [], i = 0;
		for (let a of n) {
			let n = e.indexOf(a, i);
			if (n < 0) r.push(a);
			else for (r.push(a), i = n + a.length; i < e.length && t.delimiters.includes(e[i] ?? "");) i += 1;
		}
		return Object.freeze(r);
	}
	let n = t.unit === "LINE" ? /(?<=\n)/u : /\n{2,}/u, r = e.split(n).filter((e) => e.length > 0);
	if (t.unit === "BLOCK") {
		let t = [...e.matchAll(/\n{2,}/gu)].map(([e]) => e), n = r.map((e, n) => n < t.length ? `${e}${t[n] ?? ""}` : e);
		return Object.freeze(n.length > 0 ? n : [e]);
	}
	let a = r;
	return Object.freeze(a.length > 0 ? a : [e]);
}
function l(e, t) {
	return e.slice(0, Math.max(0, Math.min(t, e.length))).join("");
}
function u(e) {
	return Object.freeze(n(Object.freeze([...e])));
}
function d(e) {
	return Object.freeze({
		text: e,
		type: "text"
	});
}
function f(e, t) {
	let n = [], r = [], i = () => {
		r.length !== 0 && (n.push(u(r)), r = []);
	};
	for (let n of e) {
		if (n.type === "ruby") {
			r.push(n);
			continue;
		}
		if (t === "LINE") {
			for (let e of n.text.split(/(?<=\n)/u)) e.length !== 0 && (r.push(d(e)), e.endsWith("\n") && i());
			continue;
		}
		let e = n.text.split(/(\n{2,})/u);
		for (let [t, n] of e.entries()) n.length !== 0 && (r.push(d(n)), t % 2 == 1 && i());
	}
	return i(), Object.freeze(n.length > 0 ? n : [u(e)]);
}
function p(n, r) {
	if (e(n)) return Object.freeze(c(t(n), r).map((e) => Object.freeze([d(e)])));
	if (r.unit === "LINE" || r.unit === "BLOCK") return f(n, r.unit);
	let a = [];
	for (let e of n) {
		if (e.type === "ruby") {
			a.push(Object.freeze([e]));
			continue;
		}
		let t = r.unit === "CHARACTER" ? i(e.text) : s(e.text, r.delimiters, r.showDelimiters);
		for (let e of t) a.push(Object.freeze([d(e)]));
	}
	return Object.freeze(a.length > 0 ? a : [Object.freeze([d("")])]);
}
function m(e, t) {
	let r = e.slice(0, Math.max(0, Math.min(t, e.length)));
	return n(Object.freeze(r.flat()));
}
//#endregion
export { r as bubbleRevealUnits, o as normalizeBubbleReveal, m as revealedBubbleContent, l as revealedBubbleText, p as splitBubbleContent, c as splitBubbleText };
