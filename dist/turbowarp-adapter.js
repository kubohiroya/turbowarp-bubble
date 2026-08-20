//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = {
	extensionName: "SVG Text",
	blocks: [{
		opcode: "defineStyle",
		blockType: "COMMAND",
		text: "define text style [STYLE] background [BACKGROUND] text [TEXT_COLOR] font [FONT] size [SIZE] align [ALIGN]",
		description: "Defines or replaces a named text style for SVG text actors. Bubble shape and placement are owned by the host Bubble layer.",
		arguments: {
			STYLE: {
				type: "STRING",
				defaultValue: "default"
			},
			BACKGROUND: {
				type: "COLOR",
				defaultValue: "#ffffff"
			},
			TEXT_COLOR: {
				type: "COLOR",
				defaultValue: "#575e75"
			},
			FONT: {
				type: "STRING",
				defaultValue: "Helvetica"
			},
			SIZE: {
				type: "NUMBER",
				defaultValue: 100
			},
			ALIGN: {
				type: "STRING",
				defaultValue: "left",
				menu: "alignment"
			}
		}
	}, {
		opcode: "setText",
		blockType: "COMMAND",
		text: "set this sprite text [TEXT] with style [STYLE]",
		description: "Replaces this sprite's skin with responsive styled SVG text.",
		arguments: {
			TEXT: {
				type: "STRING",
				defaultValue: "Title\\nSubtitle"
			},
			STYLE: {
				type: "STRING",
				defaultValue: "default"
			}
		}
	}],
	menus: { alignment: {
		acceptReporters: !0,
		items: [
			"left",
			"center",
			"right"
		]
	} }
}, u = {
	id: "kubohiroyasvgtext",
	slug: "svg-text",
	name: "SVG Text",
	description: "Responsive named-style SVG text actors for TurboWarp.",
	author: "Hiroya Kubo",
	license: "MPL-2.0",
	unsandboxed: !0
}, d = 480, f = 360, p = 100, m = 50, h = 1, g = 128, _ = {
	fontSize: 14,
	lineHeight: 16,
	padding: 12,
	cornerRadius: 8
}, v = Object.freeze({
	alignment: "left",
	backgroundColor: "#ffffff",
	font: "Helvetica",
	fontPercent: p,
	textColor: "#575e75"
}), y = Object.freeze({
	...v,
	rubyFontPercent: m,
	rubyGap: h
});
function b(e, t, n) {
	let r = E(t, n), i = e.split("\n").map((e) => ({
		text: e,
		width: A(e, r.fontSize)
	})), a = Math.max(1, ...i.map((e) => e.width)), o = Math.max(1, Math.ceil(a + r.padding * 2)), s = Math.max(1, Math.ceil(r.lineHeight * i.length + r.padding * 2)), c = t.alignment === "center" ? o / 2 : t.alignment === "right" ? o - r.padding : r.padding, l = Object.freeze(i.map((e, t) => Object.freeze({
		baseline: r.padding + r.fontSize + r.lineHeight * t,
		text: e.text,
		width: e.width,
		x: c
	}))), u = D(t, r);
	return Object.freeze({
		height: s,
		lines: l,
		preserveWhitespace: !0,
		style: u,
		width: o
	});
}
function x(e, t, n, r) {
	let i = E(t, n), a = i.fontSize * (t.rubyFontPercent / p), o = t.rubyGap * i.fontScale, s = Object.freeze({
		...D(t, i),
		rubyFontPercent: t.rubyFontPercent,
		rubyFontSize: a,
		rubyGap: o
	}), c = e.map((e) => e.type === "ruby" ? e.base : e.text).join(""), l = e.map((e) => e.type === "ruby" ? e.reading : e.text).join(""), u = [], d = [];
	for (let [t, n] of e.entries()) {
		if (n.type === "ruby") {
			let e = Object.freeze({
				end: n.base.length,
				index: u.length,
				runIndex: t,
				start: 0,
				type: "ruby"
			});
			u.push(e);
			let r = A(n.base, i.fontSize), o = A(n.reading, a);
			d.push({
				base: n.base,
				baseWidth: r,
				reading: n.reading,
				readingWidth: o,
				reveal: e,
				type: "ruby",
				width: Math.max(r, o)
			});
			continue;
		}
		for (let e of O(n.text)) {
			if (e.segment === "\n") {
				d.push("break");
				continue;
			}
			let n = Object.freeze({
				end: e.end,
				index: u.length,
				runIndex: t,
				start: e.start,
				type: "text"
			});
			u.push(n), d.push({
				reveal: n,
				text: e.segment,
				type: "text",
				width: A(e.segment, i.fontSize)
			});
		}
	}
	let f = r === void 0 ? void 0 : Math.max(1, r - i.padding * 2), m = [], h = {
		units: [],
		width: 0
	}, g = () => {
		m.push(h), h = {
			units: [],
			width: 0
		};
	};
	for (let e of d) {
		if (e === "break") {
			g();
			continue;
		}
		f !== void 0 && h.units.length > 0 && h.width + e.width > f && g(), h.units.push(e), h.width += e.width;
	}
	g();
	let _ = Math.max(1, ...m.map((e) => e.width)) + i.padding * 2, v = Math.max(1, Math.ceil(r === void 0 ? _ : Math.max(r, _))), y = Math.max(0, i.lineHeight - i.fontSize), b = i.padding, x = Object.freeze(m.map((e) => {
		let n = e.units.some((e) => e.type === "ruby"), r = i.fontSize + (n ? a + o : 0), s = y, c = r + s, l = b + r, u = t.alignment === "center" ? (v - e.width) / 2 : t.alignment === "right" ? v - i.padding - e.width : i.padding, d = u, p = Object.freeze(e.units.map((e) => {
			if (e.type === "text") {
				let t = Object.freeze({
					baseline: l,
					revealIndex: e.reveal.index,
					text: e.text,
					type: "text",
					width: e.width,
					x: d
				});
				return d += e.width, t;
			}
			let t = d, n = Object.freeze({
				baseline: l,
				fontSize: i.fontSize,
				text: e.base,
				width: e.baseWidth,
				x: t + (e.width - e.baseWidth) / 2
			}), r = Object.freeze({
				baseline: l - i.fontSize - o,
				fontSize: a,
				text: e.reading,
				width: e.readingWidth,
				x: t + (e.width - e.readingWidth) / 2
			}), s = Object.freeze({
				base: n,
				reading: r,
				revealIndex: e.reveal.index,
				type: "ruby",
				width: e.width,
				x: t
			});
			return d += e.width, s;
		})), m = Object.freeze({
			ascent: r,
			baseline: l,
			descent: s,
			fragments: p,
			height: c,
			overflow: f !== void 0 && e.width > f,
			width: e.width,
			x: u
		});
		return b += c, m;
	})), S = Math.max(1, Math.ceil(b + i.padding)), C = x.some((e) => e.overflow);
	return Object.freeze({
		height: S,
		lines: x,
		overflow: C,
		plainText: c,
		preserveWhitespace: !0,
		readingText: l,
		revealUnits: Object.freeze(u),
		style: s,
		width: v
	});
}
function S(e) {
	let t = e.style.alignment === "center" ? "middle" : e.style.alignment === "right" ? "end" : "start", n = e.lines.map((e) => e.text).join("\n"), r = e.lines.map((e) => `<tspan x="${M(e.x)}" y="${M(e.baseline)}">${j(e.text)}</tspan>`).join(""), i = e.preserveWhitespace ? " xml:space=\"preserve\"" : "";
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}" role="img"><title>${j(n)}</title><rect width="${e.width}" height="${e.height}" rx="${M(e.style.cornerRadius)}" fill="${j(e.style.backgroundColor)}"/><text${i} fill="${j(e.style.textColor)}" font-family="${j(e.style.font)}" font-size="${M(e.style.fontSize)}" text-anchor="${t}">${r}</text></svg>`;
}
function C(e) {
	let t = e.lines.flatMap((t) => t.fragments.flatMap((t) => t.type === "text" ? [`<tspan x="${M(t.x)}" y="${M(t.baseline)}" font-size="${M(e.style.fontSize)}">${j(t.text)}</tspan>`] : [`<tspan x="${M(t.reading.x)}" y="${M(t.reading.baseline)}" font-size="${M(t.reading.fontSize)}">${j(t.reading.text)}</tspan>`, `<tspan x="${M(t.base.x)}" y="${M(t.base.baseline)}" font-size="${M(t.base.fontSize)}">${j(t.base.text)}</tspan>`])).join(""), n = e.preserveWhitespace ? " xml:space=\"preserve\"" : "";
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}" role="img"><title>${j(e.plainText)}</title><rect width="${e.width}" height="${e.height}" rx="${M(e.style.cornerRadius)}" fill="${j(e.style.backgroundColor)}"/><text${n} fill="${j(e.style.textColor)}" font-family="${j(e.style.font)}" text-anchor="start">${t}</text></svg>`;
}
function w(e, t) {
	let n = e.trim();
	return n === "" ? t : n.toLowerCase() === "transparent" || /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/iu.test(n) || globalThis.CSS?.supports?.("color", n) ? n : t;
}
function T(e) {
	let t = e.trim(), n = [...t].some((e) => {
		let t = e.codePointAt(0) ?? 0;
		return t <= 31 || t === 127 || ",;{}".includes(e);
	});
	return t === "" || t.length > g || n ? v.font : t;
}
function E(e, t) {
	let n = Math.min(t[0] / d, t[1] / f), r = n * (e.fontPercent / p);
	return {
		cornerRadius: _.cornerRadius * n,
		fontScale: r,
		fontSize: _.fontSize * r,
		lineHeight: _.lineHeight * r,
		padding: _.padding * n
	};
}
function D(e, t) {
	return Object.freeze({
		alignment: e.alignment,
		backgroundColor: e.backgroundColor,
		cornerRadius: t.cornerRadius,
		font: e.font,
		fontPercent: e.fontPercent,
		fontSize: t.fontSize,
		lineHeight: t.lineHeight,
		padding: t.padding,
		textColor: e.textColor
	});
}
function O(e) {
	let t = [], n = "", r = 0, i = !1, a = 0;
	for (let o of e) !(n !== "" && (i || o === "‍" || k(o))) && n !== "" && (t.push({
		end: a,
		segment: n,
		start: r
	}), n = ""), n === "" && (r = a), n += o, i = o === "‍", a += o.length;
	return n !== "" && t.push({
		end: a,
		segment: n,
		start: r
	}), t;
}
function k(e) {
	if (/\p{Mark}/u.test(e)) return !0;
	let t = e.codePointAt(0) ?? 0;
	return t >= 65024 && t <= 65039 || t >= 917760 && t <= 917999 || t >= 127995 && t <= 127999;
}
function A(e, t) {
	let n = 0;
	for (let t of e) {
		if (/\p{Mark}/u.test(t)) continue;
		if (/\s/u.test(t)) {
			n += .35;
			continue;
		}
		let e = t.codePointAt(0) ?? 0;
		n += e <= 127 ? .62 : 1;
	}
	return n * t;
}
function j(e) {
	return e.replace(/[&<>"']/gu, (e) => {
		switch (e) {
			case "&": return "&amp;";
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "\"": return "&quot;";
			default: return "&apos;";
		}
	});
}
function M(e) {
	return String(Math.round(e * 1e3) / 1e3);
}
var N = l.blocks, P = l.menus, F = "https://kubohiroya.github.io/turbowarp-svg-text/", I = "default", ee = 100, L = 50, R = 1, z = 1, B = 1e3, te = 10, ne = 100, re = 0, ie = 100, ae = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M13%2023V12h11M40%2012h11v11M13%2041v11h11M40%2052h11V41M22%2023h20M32%2023v23%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E", oe = class {
	constructor(e = Scratch.vm?.runtime, t = {}) {
		if (this.styles = /* @__PURE__ */ new Map([[I, y]]), this.textActors = /* @__PURE__ */ new Map(), !e) throw Error("SVG Text requires the TurboWarp VM.");
		this.runtime = e, this.castToString = t.castToString ?? Scratch.Cast.toString, (t.listenForRuntimeEvents ?? !0) && this.runtime.on("STAGE_SIZE_CHANGED", () => {
			this.restyleTextActors();
		});
	}
	getInfo() {
		return {
			id: u.id,
			name: Scratch.translate(l.extensionName),
			docsURI: F,
			blockIconURI: ae,
			color1: "#9966ff",
			blocks: N.map((e) => this.toScratchBlock(e)),
			menus: P
		};
	}
	defineStyle(e) {
		let t = this.normalizeStyleName(e.STYLE);
		this.styles.set(t, {
			alignment: this.normalizeAlignment(e.ALIGN),
			backgroundColor: this.normalizeColor(e.BACKGROUND, v.backgroundColor),
			font: this.normalizeFont(e.FONT),
			fontPercent: this.normalizeFontPercent(e.SIZE),
			rubyFontPercent: this.normalizeRubyFontPercent(e.RUBY_SIZE),
			rubyGap: this.normalizeRubyGap(e.RUBY_GAP),
			textColor: this.normalizeColor(e.TEXT_COLOR, v.textColor)
		}), this.restyleTextActors(t);
	}
	setText(e, t) {
		this.applyTextActor(t.target, {
			kind: "plain",
			text: this.normalizeMessage(e.TEXT)
		}, this.resolveStyle(e.STYLE));
	}
	measureText(e, t) {
		let n = this.resolveStyle(e), r = b(this.normalizeMessage(t), n.definition, this.getNativeSize());
		return Math.max(0, ...r.lines.map((e) => e.width));
	}
	getLayoutCapability() {
		return this.layoutCapabilityValue ??= Object.freeze({ layoutText: (e) => {
			if (typeof e != "object" || !e || typeof e.styleName != "string" || typeof e.text != "string") throw TypeError("SVG Text layout capability input is invalid.");
			let t = this.requireLayoutNativeSize(e.nativeSize), n = this.resolveStyle(e.styleName);
			return b(this.normalizeMessage(e.text), n.definition, t);
		} }), this.layoutCapabilityValue;
	}
	setCompositionText(e, t, n) {
		let r = Object.freeze({
			kind: "composition",
			render: t
		});
		this.applyTextActor(n, r, this.resolveStyle(e));
	}
	releaseTextActor(e) {
		let t = this.textActors.get(e);
		return t ? (this.textActors.delete(e), this.runtime.renderer?.destroySkin?.(t.skinId), this.runtime.requestRedraw?.(), !0) : !1;
	}
	toScratchBlock(e) {
		return {
			opcode: e.opcode,
			blockType: Scratch.BlockType[e.blockType],
			text: Scratch.translate(e.text),
			hideFromPalette: e.hideFromPalette ?? !1,
			arguments: Object.fromEntries(Object.entries(e.arguments).map(([e, t]) => [e, {
				type: Scratch.ArgumentType[t.type],
				defaultValue: t.defaultValue,
				...t.menu === void 0 ? {} : { menu: t.menu }
			}]))
		};
	}
	normalizeStyleName(e) {
		return this.castToString(e).trim() || I;
	}
	normalizeFontPercent(e) {
		if (typeof e == "string" && e.trim() === "") return ee;
		let t = Number(e);
		return Number.isFinite(t) ? Math.min(B, Math.max(z, t)) : ee;
	}
	normalizeRubyFontPercent(e) {
		if (typeof e == "string" && e.trim() === "") return L;
		let t = Number(e);
		return Number.isFinite(t) ? Math.min(ne, Math.max(te, t)) : L;
	}
	normalizeRubyGap(e) {
		if (typeof e == "string" && e.trim() === "") return R;
		let t = Number(e);
		return Number.isFinite(t) ? Math.min(ie, Math.max(re, t)) : R;
	}
	normalizeMessage(e) {
		return this.castToString(e).replace(/\\r\\n|\\n|\\r/gu, "\n");
	}
	normalizeAlignment(e) {
		let t = this.castToString(e).trim().toLowerCase();
		return t === "center" || t === "right" ? t : "left";
	}
	normalizeColor(e, t) {
		return w(this.castToString(e), t);
	}
	normalizeFont(e) {
		return T(this.castToString(e));
	}
	getNativeSize() {
		let e = this.runtime.renderer?.getNativeSize?.();
		if (!Array.isArray(e) || e.length < 2) return [480, 360];
		let t = Number(e[0]), n = Number(e[1]);
		return !Number.isFinite(t) || !Number.isFinite(n) || t <= 0 || n <= 0 ? [480, 360] : [t, n];
	}
	requireLayoutNativeSize(e) {
		if (!Array.isArray(e) || e.length !== 2 || e.some((e) => typeof e != "number" || !Number.isFinite(e) || e <= 0)) throw TypeError("SVG Text layout capability nativeSize must contain two positive finite numbers.");
		return e;
	}
	createTextActorSvg(e, t) {
		return e.kind === "composition" ? e.render(t, this.getNativeSize()) : S(b(e.text, t, this.getNativeSize()));
	}
	applyTextActor(e, t, n) {
		let r = this.runtime.renderer;
		if (typeof e.drawableID != "number" || typeof r?.createSVGSkin != "function" || typeof r.updateDrawableSkinId != "function") throw Error("SVG Text requires SVG skin APIs from TurboWarp.");
		let i = r.createSVGSkin(this.createTextActorSvg(t, n.definition));
		if (!Number.isInteger(i) || i < 0) throw Error("TurboWarp did not create an SVG text skin.");
		try {
			r.updateDrawableSkinId(e.drawableID, i);
		} catch (e) {
			throw r.destroySkin?.(i), e;
		}
		let a = this.textActors.get(e);
		this.textActors.set(e, {
			content: t,
			skinId: i,
			styleName: n.styleName
		}), a && a.skinId !== i && r.destroySkin?.(a.skinId), this.runtime.requestRedraw?.();
	}
	resolveStyle(e) {
		let t = this.normalizeStyleName(e), n = this.styles.get(t);
		return n ? {
			definition: n,
			styleName: t
		} : {
			definition: this.styles.get(I) ?? y,
			styleName: I
		};
	}
	restyleTextActors(e) {
		for (let [t, n] of [...this.textActors]) (e === void 0 || n.styleName === e) && this.applyTextActor(t, n.content, this.resolveStyle(n.styleName));
	}
}, se = "default", ce = 1e5, le = 1e3, V = 1024, ue = 1e4, de = 1e5, fe = 256, pe = 512;
function H(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function U(e, t) {
	let n = Error(t);
	return Object.defineProperty(n, "code", { value: e }), n;
}
function W(e, t, n, r) {
	let i = /* @__PURE__ */ new Set([...t, ...n]);
	if (t.some((t) => !Object.prototype.hasOwnProperty.call(e, t)) || Object.keys(e).some((e) => !i.has(e))) throw U("SVG-TEXT-COMPOSITION-001", `${r} has missing or unknown properties.`);
}
function me(e, t) {
	if (typeof e != "string" || e.trim().length === 0) throw U("SVG-TEXT-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e.trim();
}
function he(e) {
	if (!H(e) || !H(e.renderer)) throw TypeError("SVG Text composition runtime must provide a renderer.");
	let t = e.renderer, n = [
		"createSVGSkin",
		"destroySkin",
		"updateDrawableSkinId"
	];
	if (n.some((e) => typeof t[e] != "function")) throw TypeError(`SVG Text composition renderer must provide ${n.join(", ")}.`);
	if (e.requestRedraw !== void 0 && typeof e.requestRedraw != "function") throw TypeError("SVG Text composition requestRedraw must be a function.");
	return e;
}
function ge(e) {
	if (!H(e) || typeof e.drawableID != "number" || !Number.isInteger(e.drawableID) || e.drawableID < 0) throw U("SVG-TEXT-COMPOSITION-002", "SVG Text target must provide a non-negative integer drawableID.");
	return e;
}
function _e(e, t) {
	if (e !== void 0 && (typeof e != "string" || e.length === 0)) throw U("SVG-TEXT-COMPOSITION-001", `${t} must be a non-empty string when provided.`);
}
function ve(e) {
	if (!H(e)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text style must be an object.");
	W(e, ["name"], [
		"alignment",
		"backgroundColor",
		"font",
		"fontPercent",
		"rubyFontPercent",
		"rubyGap",
		"textColor"
	], "SVG Text style");
	let t = me(e.name, "SVG Text style name");
	if (e.alignment !== void 0 && e.alignment !== "left" && e.alignment !== "center" && e.alignment !== "right") throw U("SVG-TEXT-COMPOSITION-001", "SVG Text alignment is invalid.");
	if (_e(e.backgroundColor, "SVG Text backgroundColor"), _e(e.font, "SVG Text font"), _e(e.textColor, "SVG Text textColor"), e.fontPercent !== void 0 && (typeof e.fontPercent != "number" || !Number.isFinite(e.fontPercent) || e.fontPercent < 1 || e.fontPercent > 1e3)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text fontPercent must be a finite number from 1 to 1000.");
	if (e.rubyFontPercent !== void 0 && (typeof e.rubyFontPercent != "number" || !Number.isFinite(e.rubyFontPercent) || e.rubyFontPercent < 10 || e.rubyFontPercent > 100)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text rubyFontPercent must be a finite number from 10 to 100.");
	if (e.rubyGap !== void 0 && (typeof e.rubyGap != "number" || !Number.isFinite(e.rubyGap) || e.rubyGap < 0 || e.rubyGap > 100)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text rubyGap must be a finite number from 0 to 100.");
	return {
		...e,
		name: t
	};
}
function ye(e) {
	return Object.freeze({
		alignment: e.alignment ?? v.alignment,
		backgroundColor: w(e.backgroundColor ?? "", v.backgroundColor),
		font: T(e.font ?? ""),
		fontPercent: e.fontPercent ?? v.fontPercent,
		rubyFontPercent: e.rubyFontPercent ?? y.rubyFontPercent,
		rubyGap: e.rubyGap ?? y.rubyGap,
		textColor: w(e.textColor ?? "", v.textColor)
	});
}
function be(e) {
	if (!Array.isArray(e) || e.length !== 2 || e.some((e) => typeof e != "number" || !Number.isFinite(e) || e <= 0)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text nativeSize must be [width, height] with two positive finite numbers.");
	return e;
}
function xe(e) {
	let t = e.getNativeSize?.();
	if (!Array.isArray(t) || t.length < 2) return [480, 360];
	let n = Number(t[0]), r = Number(t[1]);
	return !Number.isFinite(n) || !Number.isFinite(r) || n <= 0 || r <= 0 ? [480, 360] : [n, r];
}
function Se(e) {
	return e.replace(/\\r\\n|\\n|\\r/gu, "\n");
}
function Ce(e) {
	return Se(e.replace(/\r\n?|\n/gu, "\n"));
}
function we(e) {
	return U("SVG-TEXT-COMPOSITION-007", e);
}
function Te(e) {
	if (!Array.isArray(e)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text rich content runs must be an array.");
	if (e.length > V) throw we(`SVG Text rich content exceeds ${V} runs.`);
	let t = 0, n = 0, r = 1, i = e.map((e, i) => {
		if (!H(e)) throw U("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} must be an object.`);
		if (e.type === "text") {
			if (W(e, ["type", "text"], [], `SVG Text rich content run ${i}`), typeof e.text != "string") throw U("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} text must be a string.`);
			let a = Ce(e.text);
			return t += a.length, r += a.split("\n").length - 1, n += [...a.replace(/\n/gu, "")].length, Object.freeze({
				text: a,
				type: "text"
			});
		}
		if (e.type === "ruby") {
			if (W(e, [
				"type",
				"base",
				"reading"
			], [], `SVG Text rich content run ${i}`), typeof e.base != "string" || typeof e.reading != "string") throw U("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} ruby base and reading must be strings.`);
			let r = Ce(e.base), a = Ce(e.reading);
			if (r.length === 0 || a.length === 0 || r.includes("\n") || a.includes("\n")) throw U("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} ruby base and reading must be non-empty single-line strings.`);
			if (r.length > fe) throw we(`SVG Text ruby base exceeds ${fe} characters.`);
			if (a.length > pe) throw we(`SVG Text ruby reading exceeds ${pe} characters.`);
			return t += r.length + a.length, n += 1, Object.freeze({
				base: r,
				reading: a,
				type: "ruby"
			});
		}
		throw U("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} type is invalid.`);
	});
	if (t > ce) throw we(`SVG Text rich content exceeds ${ce} characters.`);
	if (r > le) throw we(`SVG Text rich content exceeds ${le} lines.`);
	if (n > ue) throw we(`SVG Text rich content exceeds ${ue} layout fragments.`);
	return Object.freeze(i);
}
function Ee(e) {
	if (e !== void 0) {
		if (typeof e != "number" || !Number.isFinite(e) || e <= 0 || e > de) throw U("SVG-TEXT-COMPOSITION-001", `SVG Text maxWidth must be a finite number greater than 0 and no greater than ${de}.`);
		return e;
	}
}
function De(e, t) {
	if (!H(t)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text layout input is invalid.");
	W(t, [
		"styleName",
		"text",
		"nativeSize"
	], [], "SVG Text layout input");
	let n = me(t.styleName, "SVG Text styleName"), r = e.get(n);
	if (!r) throw U("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${n}`);
	if (typeof t.text != "string") throw U("SVG-TEXT-COMPOSITION-001", "SVG Text text must be a string.");
	return b(Se(t.text), r, be(t.nativeSize));
}
function Oe(e, t) {
	if (!H(t)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text rich layout input is invalid.");
	W(t, [
		"styleName",
		"runs",
		"nativeSize"
	], ["maxWidth"], "SVG Text rich layout input");
	let n = me(t.styleName, "SVG Text styleName"), r = e.get(n);
	if (!r) throw U("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${n}`);
	let i = Te(t.runs), a = be(t.nativeSize), o = Ee(t.maxWidth);
	return o === void 0 ? x(i, r, a) : x(i, r, a, o);
}
function ke() {
	let e = /* @__PURE__ */ new Map([[se, y]]);
	return Object.freeze({
		defineStyle(t) {
			let n = ve(t);
			e.set(n.name, ye(n));
		},
		layoutRichText(t) {
			return Oe(e, t);
		},
		layoutText(t) {
			return De(e, t);
		}
	});
}
function Ae(e) {
	if (!H(e)) throw TypeError("SVG Text composition options must be an object.");
	let t = he(e.runtime), n = new oe(t, {
		castToString: (e) => String(e),
		listenForRuntimeEvents: !1
	}), r = /* @__PURE__ */ new Map([[se, y]]), i = /* @__PURE__ */ new Set(), a = !1;
	function o() {
		if (a) throw U("SVG-TEXT-COMPOSITION-004", "SVG Text composition has been released.");
	}
	return Object.freeze({
		defineStyle(e) {
			o();
			let t = ve(e);
			n.defineStyle({
				ALIGN: t.alignment ?? "",
				BACKGROUND: t.backgroundColor ?? "",
				FONT: t.font ?? "",
				RUBY_GAP: t.rubyGap ?? "",
				RUBY_SIZE: t.rubyFontPercent ?? "",
				SIZE: t.fontPercent ?? "",
				STYLE: t.name,
				TEXT_COLOR: t.textColor ?? ""
			}), r.set(t.name, ye(t));
		},
		layoutRichText(e) {
			return o(), Oe(r, e);
		},
		layoutText(e) {
			return o(), De(r, e);
		},
		measureText(e) {
			if (o(), !H(e)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text measure input is invalid.");
			W(e, ["styleName", "text"], [], "SVG Text measure input");
			let t = me(e.styleName, "SVG Text styleName");
			if (!r.has(t)) throw U("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${t}`);
			if (typeof e.text != "string") throw U("SVG-TEXT-COMPOSITION-001", "SVG Text text must be a string.");
			return n.measureText(t, e.text);
		},
		measureRichText(e) {
			if (o(), !H(e)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text rich measure input is invalid.");
			W(e, ["styleName", "runs"], ["maxWidth"], "SVG Text rich measure input");
			let n = me(e.styleName, "SVG Text styleName"), i = r.get(n);
			if (!i) throw U("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${n}`);
			let a = Te(e.runs), s = Ee(e.maxWidth), c = xe(t.renderer), l = s === void 0 ? x(a, i, c) : x(a, i, c, s);
			return Math.max(0, ...l.lines.map((e) => e.width));
		},
		setRichText(e) {
			if (o(), !H(e)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text rich actor input is invalid.");
			W(e, [
				"styleName",
				"target",
				"runs"
			], ["maxWidth"], "SVG Text rich actor input");
			let t = ge(e.target), a = me(e.styleName, "SVG Text styleName");
			if (!r.has(a)) throw U("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${a}`);
			let s = Te(e.runs), c = Ee(e.maxWidth);
			n.setCompositionText(a, (e, t) => C(c === void 0 ? x(s, e, t) : x(s, e, t, c)), t), i.add(t);
		},
		setText(e) {
			if (o(), !H(e)) throw U("SVG-TEXT-COMPOSITION-001", "SVG Text actor input is invalid.");
			W(e, [
				"styleName",
				"target",
				"text"
			], [], "SVG Text actor input");
			let t = ge(e.target), a = me(e.styleName, "SVG Text styleName");
			if (!r.has(a)) throw U("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${a}`);
			if (typeof e.text != "string") throw U("SVG-TEXT-COMPOSITION-001", "SVG Text text must be a string.");
			n.setText({
				STYLE: a,
				TEXT: e.text
			}, { target: t }), i.add(t);
		},
		releaseTarget(e) {
			o();
			let t = ge(e);
			if (!i.delete(t)) throw U("SVG-TEXT-COMPOSITION-005", "SVG Text target is not owned by this composition.");
			if (!n.releaseTextActor(t)) throw U("SVG-TEXT-COMPOSITION-005", "SVG Text target ownership is inconsistent.");
		},
		releaseAll() {
			if (a) return;
			a = !0;
			let e = [];
			for (let t of i) try {
				n.releaseTextActor(t);
			} catch (t) {
				e.push(t);
			}
			if (i.clear(), r.clear(), e.length > 0) {
				let t = U("SVG-TEXT-COMPOSITION-006", "SVG Text composition failed to release one or more skins.");
				throw Object.defineProperty(t, "errors", { value: Object.freeze([...e]) }), t;
			}
		}
	});
}
//#endregion
//#region src/placement.ts
var je = [
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
	"up-up-left"
], Me = [
	"HEADER_LIKE",
	"CENTER",
	"FOOTER_LIKE"
], Ne = /* @__PURE__ */ new Map([
	["east", "right"],
	["east-northeast", "right-up-right"],
	["east-southeast", "right-down-right"],
	["north", "up"],
	["northeast", "up-right"],
	["north-northeast", "up-up-right"],
	["northwest", "up-left"],
	["north-northwest", "up-up-left"],
	["south", "down"],
	["southeast", "down-right"],
	["south-southeast", "down-down-right"],
	["southwest", "down-left"],
	["south-southwest", "down-down-left"],
	["west", "left"],
	["west-northwest", "left-up-left"],
	["west-southwest", "left-down-left"]
]), Pe = new Set(je), Fe = new Set(Me), Ie = Math.SQRT2 - 1, Le = Object.freeze({
	down: {
		x: 0,
		y: -1
	},
	"down-down-left": {
		x: -Ie,
		y: -1
	},
	"down-down-right": {
		x: Ie,
		y: -1
	},
	"down-left": {
		x: -1,
		y: -1
	},
	"down-right": {
		x: 1,
		y: -1
	},
	left: {
		x: -1,
		y: 0
	},
	"left-down-left": {
		x: -1,
		y: -Ie
	},
	"left-up-left": {
		x: -1,
		y: Ie
	},
	right: {
		x: 1,
		y: 0
	},
	"right-down-right": {
		x: 1,
		y: -Ie
	},
	"right-up-right": {
		x: 1,
		y: Ie
	},
	up: {
		x: 0,
		y: 1
	},
	"up-left": {
		x: -1,
		y: 1
	},
	"up-right": {
		x: 1,
		y: 1
	},
	"up-up-left": {
		x: -Ie,
		y: 1
	},
	"up-up-right": {
		x: Ie,
		y: 1
	}
});
function Re(e) {
	return Math.abs(e) < 1e-12 ? 0 : Math.abs(1 - Math.abs(e)) < 1e-12 ? Math.sign(e) : e;
}
function ze(e) {
	if (typeof e == "number") {
		if (!Number.isFinite(e) || e < 0 || e > 360) throw TypeError("Bubble placement angle must be from 0 through 360.");
		return Object.freeze({
			basis: "actor",
			direction: e === 360 ? 0 : e
		});
	}
	if (typeof e != "string" || e.trim().length === 0) throw TypeError("Bubble placement must be a direction, angle, or region.");
	let t = e.trim(), n = t.toUpperCase();
	if (Fe.has(n)) return Object.freeze({
		basis: "background",
		region: n
	});
	let r = t.toLowerCase();
	if (Pe.has(r)) return Object.freeze({
		basis: "actor",
		direction: r
	});
	let i = Ne.get(r);
	if (i) return Object.freeze({
		basis: "actor",
		direction: i
	});
	let a = Number(t);
	if (Number.isFinite(a) && a >= 0 && a <= 360) return Object.freeze({
		basis: "actor",
		direction: a === 360 ? 0 : a
	});
	throw TypeError("Bubble placement is invalid.");
}
function Be(e) {
	if (typeof e == "string") return Le[e];
	let t = e * Math.PI / 180;
	return Object.freeze({
		x: Re(Math.sin(t)),
		y: Re(Math.cos(t))
	});
}
//#endregion
//#region src/actor-transform.ts
var Ve = Object.freeze({
	x: 0,
	y: 0,
	scalePercent: 100
});
function He(e, t) {
	if (typeof e != "number" || !Number.isFinite(e)) throw TypeError(`${t} must be a finite number.`);
	return e;
}
function Ue(e) {
	let t = He(e, "Bubble distance");
	if (t < 0) throw TypeError("Bubble distance must be zero or greater.");
	return t;
}
function We(e) {
	let t = He(e, "Bubble tail length");
	if (t <= 0) throw TypeError("Bubble tail length must be greater than zero.");
	return t;
}
function Ge(e) {
	if (!Array.isArray(e) || e.length !== 2 && e.length !== 3) throw TypeError("Bubble offset must be [x, y] or [x, y, scale].");
	let t = He(e[0], "Bubble offset x"), n = He(e[1], "Bubble offset y"), r = He(e.length === 3 ? e[2] : 100, "Bubble offset scale");
	if (r <= 0) throw TypeError("Bubble offset scale must be greater than zero.");
	return Object.freeze({
		x: t,
		y: n,
		scalePercent: r
	});
}
function Ke(e) {
	let t = (e.bounds.left + e.bounds.right) / 2, n = (e.bounds.top + e.bounds.bottom) / 2, r = Be(e.direction), i = e.distance + e.tailLength, a = r.x < 0 ? t - e.bounds.left + i + e.bubbleWidth / 2 : e.bounds.right - t + i + e.bubbleWidth / 2, o = r.y < 0 ? n - e.bounds.bottom + i + e.bubbleHeight / 2 : e.bounds.top - n + i + e.bubbleHeight / 2, s = Math.min(r.x === 0 ? Infinity : a / Math.abs(r.x), r.y === 0 ? Infinity : o / Math.abs(r.y));
	return Object.freeze({
		x: t + r.x * s + e.offset.x,
		y: n + r.y * s + e.offset.y
	});
}
//#endregion
//#region node_modules/.pnpm/jsclipper@https+++codeload.github.com+platener+jsclipper+tar.gz+56aed19845113e1939d8971c47233054659436b1/node_modules/jsclipper/jsclipper.js
var qe = /* @__PURE__ */ o(((e, t) => {
	(function() {
		var e = {}, n = !1;
		t !== void 0 && t.exports ? (t.exports = e, n = !0) : typeof document < "u" ? window.ClipperLib = e : self.ClipperLib = e;
		var r;
		if (n) {
			var i = "chrome";
			r = "Netscape";
		} else {
			var i = navigator.userAgent.toString().toLowerCase();
			r = navigator.appName;
		}
		var a = {};
		a.chrome = +(i.indexOf("chrome") != -1 && i.indexOf("chromium") == -1), a.chromium = i.indexOf("chromium") == -1 ? 0 : 1, a.safari = +(i.indexOf("safari") != -1 && i.indexOf("chrome") == -1 && i.indexOf("chromium") == -1), a.firefox = i.indexOf("firefox") == -1 ? 0 : 1, a.firefox17 = i.indexOf("firefox/17") == -1 ? 0 : 1, a.firefox15 = i.indexOf("firefox/15") == -1 ? 0 : 1, a.firefox3 = i.indexOf("firefox/3") == -1 ? 0 : 1, a.opera = i.indexOf("opera") == -1 ? 0 : 1, a.msie10 = i.indexOf("msie 10") == -1 ? 0 : 1, a.msie9 = i.indexOf("msie 9") == -1 ? 0 : 1, a.msie8 = i.indexOf("msie 8") == -1 ? 0 : 1, a.msie7 = i.indexOf("msie 7") == -1 ? 0 : 1, a.msie = i.indexOf("msie ") == -1 ? 0 : 1, e.biginteger_used = null;
		var o, s = !0;
		function c(t, n, r) {
			e.biginteger_used = 1, t != null && (typeof t == "number" && n === void 0 ? this.fromInt(t) : typeof t == "number" ? this.fromNumber(t, n, r) : n == null && typeof t != "string" ? this.fromString(t, 256) : this.fromString(t, n));
		}
		function l() {
			return new c(null);
		}
		function u(e, t, n, r, i, a) {
			for (; --a >= 0;) {
				var o = t * this[e++] + n[r] + i;
				i = Math.floor(o / 67108864), n[r++] = o & 67108863;
			}
			return i;
		}
		function d(e, t, n, r, i, a) {
			for (var o = t & 32767, s = t >> 15; --a >= 0;) {
				var c = this[e] & 32767, l = this[e++] >> 15, u = s * c + l * o;
				c = o * c + ((u & 32767) << 15) + n[r] + (i & 1073741823), i = (c >>> 30) + (u >>> 15) + s * l + (i >>> 30), n[r++] = c & 1073741823;
			}
			return i;
		}
		function f(e, t, n, r, i, a) {
			for (var o = t & 16383, s = t >> 14; --a >= 0;) {
				var c = this[e] & 16383, l = this[e++] >> 14, u = s * c + l * o;
				c = o * c + ((u & 16383) << 14) + n[r] + i, i = (c >> 28) + (u >> 14) + s * l, n[r++] = c & 268435455;
			}
			return i;
		}
		s && r == "Microsoft Internet Explorer" ? (c.prototype.am = d, o = 30) : s && r != "Netscape" ? (c.prototype.am = u, o = 26) : (c.prototype.am = f, o = 28), c.prototype.DB = o, c.prototype.DM = (1 << o) - 1, c.prototype.DV = 1 << o;
		var p = 52;
		c.prototype.FV = 2 ** p, c.prototype.F1 = p - o, c.prototype.F2 = 2 * o - p;
		var m = "0123456789abcdefghijklmnopqrstuvwxyz", h = [], g = 48, _;
		for (_ = 0; _ <= 9; ++_) h[g++] = _;
		for (g = 97, _ = 10; _ < 36; ++_) h[g++] = _;
		for (g = 65, _ = 10; _ < 36; ++_) h[g++] = _;
		function v(e) {
			return m.charAt(e);
		}
		function y(e, t) {
			return h[e.charCodeAt(t)] ?? -1;
		}
		function b(e) {
			for (var t = this.t - 1; t >= 0; --t) e[t] = this[t];
			e.t = this.t, e.s = this.s;
		}
		function x(e) {
			this.t = 1, this.s = e < 0 ? -1 : 0, e > 0 ? this[0] = e : e < -1 ? this[0] = e + this.DV : this.t = 0;
		}
		function S(e) {
			var t = l();
			return t.fromInt(e), t;
		}
		function C(e, t) {
			var n;
			if (t == 16) n = 4;
			else if (t == 8) n = 3;
			else if (t == 256) n = 8;
			else if (t == 2) n = 1;
			else if (t == 32) n = 5;
			else if (t == 4) n = 2;
			else {
				this.fromRadix(e, t);
				return;
			}
			this.t = 0, this.s = 0;
			for (var r = e.length, i = !1, a = 0; --r >= 0;) {
				var o = n == 8 ? e[r] & 255 : y(e, r);
				if (o < 0) {
					e.charAt(r) == "-" && (i = !0);
					continue;
				}
				i = !1, a == 0 ? this[this.t++] = o : a + n > this.DB ? (this[this.t - 1] |= (o & (1 << this.DB - a) - 1) << a, this[this.t++] = o >> this.DB - a) : this[this.t - 1] |= o << a, a += n, a >= this.DB && (a -= this.DB);
			}
			n == 8 && e[0] & 128 && (this.s = -1, a > 0 && (this[this.t - 1] |= (1 << this.DB - a) - 1 << a)), this.clamp(), i && c.ZERO.subTo(this, this);
		}
		function w() {
			for (var e = this.s & this.DM; this.t > 0 && this[this.t - 1] == e;) --this.t;
		}
		function T(e) {
			if (this.s < 0) return "-" + this.negate().toString(e);
			var t;
			if (e == 16) t = 4;
			else if (e == 8) t = 3;
			else if (e == 2) t = 1;
			else if (e == 32) t = 5;
			else if (e == 4) t = 2;
			else return this.toRadix(e);
			var n = (1 << t) - 1, r, i = !1, a = "", o = this.t, s = this.DB - o * this.DB % t;
			if (o-- > 0) for (s < this.DB && (r = this[o] >> s) > 0 && (i = !0, a = v(r)); o >= 0;) s < t ? (r = (this[o] & (1 << s) - 1) << t - s, r |= this[--o] >> (s += this.DB - t)) : (r = this[o] >> (s -= t) & n, s <= 0 && (s += this.DB, --o)), r > 0 && (i = !0), i && (a += v(r));
			return i ? a : "0";
		}
		function E() {
			var e = l();
			return c.ZERO.subTo(this, e), e;
		}
		function D() {
			return this.s < 0 ? this.negate() : this;
		}
		function O(e) {
			var t = this.s - e.s;
			if (t != 0) return t;
			var n = this.t;
			if (t = n - e.t, t != 0) return this.s < 0 ? -t : t;
			for (; --n >= 0;) if ((t = this[n] - e[n]) != 0) return t;
			return 0;
		}
		function k(e) {
			var t = 1, n;
			return (n = e >>> 16) != 0 && (e = n, t += 16), (n = e >> 8) != 0 && (e = n, t += 8), (n = e >> 4) != 0 && (e = n, t += 4), (n = e >> 2) != 0 && (e = n, t += 2), (n = e >> 1) != 0 && (e = n, t += 1), t;
		}
		function A() {
			return this.t <= 0 ? 0 : this.DB * (this.t - 1) + k(this[this.t - 1] ^ this.s & this.DM);
		}
		function j(e, t) {
			var n;
			for (n = this.t - 1; n >= 0; --n) t[n + e] = this[n];
			for (n = e - 1; n >= 0; --n) t[n] = 0;
			t.t = this.t + e, t.s = this.s;
		}
		function M(e, t) {
			for (var n = e; n < this.t; ++n) t[n - e] = this[n];
			t.t = Math.max(this.t - e, 0), t.s = this.s;
		}
		function N(e, t) {
			var n = e % this.DB, r = this.DB - n, i = (1 << r) - 1, a = Math.floor(e / this.DB), o = this.s << n & this.DM, s;
			for (s = this.t - 1; s >= 0; --s) t[s + a + 1] = this[s] >> r | o, o = (this[s] & i) << n;
			for (s = a - 1; s >= 0; --s) t[s] = 0;
			t[a] = o, t.t = this.t + a + 1, t.s = this.s, t.clamp();
		}
		function P(e, t) {
			t.s = this.s;
			var n = Math.floor(e / this.DB);
			if (n >= this.t) {
				t.t = 0;
				return;
			}
			var r = e % this.DB, i = this.DB - r, a = (1 << r) - 1;
			t[0] = this[n] >> r;
			for (var o = n + 1; o < this.t; ++o) t[o - n - 1] |= (this[o] & a) << i, t[o - n] = this[o] >> r;
			r > 0 && (t[this.t - n - 1] |= (this.s & a) << i), t.t = this.t - n, t.clamp();
		}
		function F(e, t) {
			for (var n = 0, r = 0, i = Math.min(e.t, this.t); n < i;) r += this[n] - e[n], t[n++] = r & this.DM, r >>= this.DB;
			if (e.t < this.t) {
				for (r -= e.s; n < this.t;) r += this[n], t[n++] = r & this.DM, r >>= this.DB;
				r += this.s;
			} else {
				for (r += this.s; n < e.t;) r -= e[n], t[n++] = r & this.DM, r >>= this.DB;
				r -= e.s;
			}
			t.s = r < 0 ? -1 : 0, r < -1 ? t[n++] = this.DV + r : r > 0 && (t[n++] = r), t.t = n, t.clamp();
		}
		function I(e, t) {
			var n = this.abs(), r = e.abs(), i = n.t;
			for (t.t = i + r.t; --i >= 0;) t[i] = 0;
			for (i = 0; i < r.t; ++i) t[i + n.t] = n.am(0, r[i], t, i, 0, n.t);
			t.s = 0, t.clamp(), this.s != e.s && c.ZERO.subTo(t, t);
		}
		function ee(e) {
			for (var t = this.abs(), n = e.t = 2 * t.t; --n >= 0;) e[n] = 0;
			for (n = 0; n < t.t - 1; ++n) {
				var r = t.am(n, t[n], e, 2 * n, 0, 1);
				(e[n + t.t] += t.am(n + 1, 2 * t[n], e, 2 * n + 1, r, t.t - n - 1)) >= t.DV && (e[n + t.t] -= t.DV, e[n + t.t + 1] = 1);
			}
			e.t > 0 && (e[e.t - 1] += t.am(n, t[n], e, 2 * n, 0, 1)), e.s = 0, e.clamp();
		}
		function L(e, t, n) {
			var r = e.abs();
			if (!(r.t <= 0)) {
				var i = this.abs();
				if (i.t < r.t) {
					t?.fromInt(0), n != null && this.copyTo(n);
					return;
				}
				n ??= l();
				var a = l(), o = this.s, s = e.s, u = this.DB - k(r[r.t - 1]);
				u > 0 ? (r.lShiftTo(u, a), i.lShiftTo(u, n)) : (r.copyTo(a), i.copyTo(n));
				var d = a.t, f = a[d - 1];
				if (f != 0) {
					var p = f * (1 << this.F1) + (d > 1 ? a[d - 2] >> this.F2 : 0), m = this.FV / p, h = (1 << this.F1) / p, g = 1 << this.F2, _ = n.t, v = _ - d, y = t ?? l();
					for (a.dlShiftTo(v, y), n.compareTo(y) >= 0 && (n[n.t++] = 1, n.subTo(y, n)), c.ONE.dlShiftTo(d, y), y.subTo(a, a); a.t < d;) a[a.t++] = 0;
					for (; --v >= 0;) {
						var b = n[--_] == f ? this.DM : Math.floor(n[_] * m + (n[_ - 1] + g) * h);
						if ((n[_] += a.am(0, b, n, v, 0, d)) < b) for (a.dlShiftTo(v, y), n.subTo(y, n); n[_] < --b;) n.subTo(y, n);
					}
					t != null && (n.drShiftTo(d, t), o != s && c.ZERO.subTo(t, t)), n.t = d, n.clamp(), u > 0 && n.rShiftTo(u, n), o < 0 && c.ZERO.subTo(n, n);
				}
			}
		}
		function R(e) {
			var t = l();
			return this.abs().divRemTo(e, null, t), this.s < 0 && t.compareTo(c.ZERO) > 0 && e.subTo(t, t), t;
		}
		function z(e) {
			this.m = e;
		}
		function B(e) {
			return e.s < 0 || e.compareTo(this.m) >= 0 ? e.mod(this.m) : e;
		}
		function te(e) {
			return e;
		}
		function ne(e) {
			e.divRemTo(this.m, null, e);
		}
		function re(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		function ie(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		z.prototype.convert = B, z.prototype.revert = te, z.prototype.reduce = ne, z.prototype.mulTo = re, z.prototype.sqrTo = ie;
		function ae() {
			if (this.t < 1) return 0;
			var e = this[0];
			if (!(e & 1)) return 0;
			var t = e & 3;
			return t = t * (2 - (e & 15) * t) & 15, t = t * (2 - (e & 255) * t) & 255, t = t * (2 - ((e & 65535) * t & 65535)) & 65535, t = t * (2 - e * t % this.DV) % this.DV, t > 0 ? this.DV - t : -t;
		}
		function oe(e) {
			this.m = e, this.mp = e.invDigit(), this.mpl = this.mp & 32767, this.mph = this.mp >> 15, this.um = (1 << e.DB - 15) - 1, this.mt2 = 2 * e.t;
		}
		function se(e) {
			var t = l();
			return e.abs().dlShiftTo(this.m.t, t), t.divRemTo(this.m, null, t), e.s < 0 && t.compareTo(c.ZERO) > 0 && this.m.subTo(t, t), t;
		}
		function ce(e) {
			var t = l();
			return e.copyTo(t), this.reduce(t), t;
		}
		function le(e) {
			for (; e.t <= this.mt2;) e[e.t++] = 0;
			for (var t = 0; t < this.m.t; ++t) {
				var n = e[t] & 32767, r = n * this.mpl + ((n * this.mph + (e[t] >> 15) * this.mpl & this.um) << 15) & e.DM;
				for (n = t + this.m.t, e[n] += this.m.am(0, r, e, t, 0, this.m.t); e[n] >= e.DV;) e[n] -= e.DV, e[++n]++;
			}
			e.clamp(), e.drShiftTo(this.m.t, e), e.compareTo(this.m) >= 0 && e.subTo(this.m, e);
		}
		function V(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		function ue(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		oe.prototype.convert = se, oe.prototype.revert = ce, oe.prototype.reduce = le, oe.prototype.mulTo = ue, oe.prototype.sqrTo = V;
		function de() {
			return (this.t > 0 ? this[0] & 1 : this.s) == 0;
		}
		function fe(e, t) {
			if (e > 4294967295 || e < 1) return c.ONE;
			var n = l(), r = l(), i = t.convert(this), a = k(e) - 1;
			for (i.copyTo(n); --a >= 0;) if (t.sqrTo(n, r), (e & 1 << a) > 0) t.mulTo(r, i, n);
			else {
				var o = n;
				n = r, r = o;
			}
			return t.revert(n);
		}
		function pe(e, t) {
			var n = e < 256 || t.isEven() ? new z(t) : new oe(t);
			return this.exp(e, n);
		}
		c.prototype.copyTo = b, c.prototype.fromInt = x, c.prototype.fromString = C, c.prototype.clamp = w, c.prototype.dlShiftTo = j, c.prototype.drShiftTo = M, c.prototype.lShiftTo = N, c.prototype.rShiftTo = P, c.prototype.subTo = F, c.prototype.multiplyTo = I, c.prototype.squareTo = ee, c.prototype.divRemTo = L, c.prototype.invDigit = ae, c.prototype.isEven = de, c.prototype.exp = fe, c.prototype.toString = T, c.prototype.negate = E, c.prototype.abs = D, c.prototype.compareTo = O, c.prototype.bitLength = A, c.prototype.mod = R, c.prototype.modPowInt = pe, c.ZERO = S(0), c.ONE = S(1);
		function H() {
			var e = l();
			return this.copyTo(e), e;
		}
		function U() {
			if (this.s < 0) {
				if (this.t == 1) return this[0] - this.DV;
				if (this.t == 0) return -1;
			} else if (this.t == 1) return this[0];
			else if (this.t == 0) return 0;
			return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
		}
		function W() {
			return this.t == 0 ? this.s : this[0] << 24 >> 24;
		}
		function me() {
			return this.t == 0 ? this.s : this[0] << 16 >> 16;
		}
		function he(e) {
			return Math.floor(Math.LN2 * this.DB / Math.log(e));
		}
		function ge() {
			return this.s < 0 ? -1 : this.t <= 0 || this.t == 1 && this[0] <= 0 ? 0 : 1;
		}
		function _e(e) {
			if (e ??= 10, this.signum() == 0 || e < 2 || e > 36) return "0";
			var t = this.chunkSize(e), n = e ** +t, r = S(n), i = l(), a = l(), o = "";
			for (this.divRemTo(r, i, a); i.signum() > 0;) o = (n + a.intValue()).toString(e).substr(1) + o, i.divRemTo(r, i, a);
			return a.intValue().toString(e) + o;
		}
		function ve(e, t) {
			this.fromInt(0), t ??= 10;
			for (var n = this.chunkSize(t), r = t ** +n, i = !1, a = 0, o = 0, s = 0; s < e.length; ++s) {
				var l = y(e, s);
				if (l < 0) {
					e.charAt(s) == "-" && this.signum() == 0 && (i = !0);
					continue;
				}
				o = t * o + l, ++a >= n && (this.dMultiply(r), this.dAddOffset(o, 0), a = 0, o = 0);
			}
			a > 0 && (this.dMultiply(t ** +a), this.dAddOffset(o, 0)), i && c.ZERO.subTo(this, this);
		}
		function ye(e, t, n) {
			if (typeof t == "number") {
				if (e < 2) this.fromInt(1);
				else for (this.fromNumber(e, n), this.testBit(e - 1) || this.bitwiseTo(c.ONE.shiftLeft(e - 1), De, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(t);) this.dAddOffset(2, 0), this.bitLength() > e && this.subTo(c.ONE.shiftLeft(e - 1), this);
			} else {
				var r = [], i = e & 7;
				r.length = (e >> 3) + 1, t.nextBytes(r), i > 0 ? r[0] &= (1 << i) - 1 : r[0] = 0, this.fromString(r, 256);
			}
		}
		function be() {
			var e = this.t, t = [];
			t[0] = this.s;
			var n = this.DB - e * this.DB % 8, r, i = 0;
			if (e-- > 0) for (n < this.DB && (r = this[e] >> n) != (this.s & this.DM) >> n && (t[i++] = r | this.s << this.DB - n); e >= 0;) n < 8 ? (r = (this[e] & (1 << n) - 1) << 8 - n, r |= this[--e] >> (n += this.DB - 8)) : (r = this[e] >> (n -= 8) & 255, n <= 0 && (n += this.DB, --e)), r & 128 && (r |= -256), i == 0 && (this.s & 128) != (r & 128) && ++i, (i > 0 || r != this.s) && (t[i++] = r);
			return t;
		}
		function xe(e) {
			return this.compareTo(e) == 0;
		}
		function Se(e) {
			return this.compareTo(e) < 0 ? this : e;
		}
		function Ce(e) {
			return this.compareTo(e) > 0 ? this : e;
		}
		function we(e, t, n) {
			var r, i, a = Math.min(e.t, this.t);
			for (r = 0; r < a; ++r) n[r] = t(this[r], e[r]);
			if (e.t < this.t) {
				for (i = e.s & this.DM, r = a; r < this.t; ++r) n[r] = t(this[r], i);
				n.t = this.t;
			} else {
				for (i = this.s & this.DM, r = a; r < e.t; ++r) n[r] = t(i, e[r]);
				n.t = e.t;
			}
			n.s = t(this.s, e.s), n.clamp();
		}
		function Te(e, t) {
			return e & t;
		}
		function Ee(e) {
			var t = l();
			return this.bitwiseTo(e, Te, t), t;
		}
		function De(e, t) {
			return e | t;
		}
		function Oe(e) {
			var t = l();
			return this.bitwiseTo(e, De, t), t;
		}
		function ke(e, t) {
			return e ^ t;
		}
		function Ae(e) {
			var t = l();
			return this.bitwiseTo(e, ke, t), t;
		}
		function je(e, t) {
			return e & ~t;
		}
		function Me(e) {
			var t = l();
			return this.bitwiseTo(e, je, t), t;
		}
		function Ne() {
			for (var e = l(), t = 0; t < this.t; ++t) e[t] = this.DM & ~this[t];
			return e.t = this.t, e.s = ~this.s, e;
		}
		function Pe(e) {
			var t = l();
			return e < 0 ? this.rShiftTo(-e, t) : this.lShiftTo(e, t), t;
		}
		function Fe(e) {
			var t = l();
			return e < 0 ? this.lShiftTo(-e, t) : this.rShiftTo(e, t), t;
		}
		function Ie(e) {
			if (e == 0) return -1;
			var t = 0;
			return e & 65535 || (e >>= 16, t += 16), e & 255 || (e >>= 8, t += 8), e & 15 || (e >>= 4, t += 4), e & 3 || (e >>= 2, t += 2), e & 1 || ++t, t;
		}
		function Le() {
			for (var e = 0; e < this.t; ++e) if (this[e] != 0) return e * this.DB + Ie(this[e]);
			return this.s < 0 ? this.t * this.DB : -1;
		}
		function Re(e) {
			for (var t = 0; e != 0;) e &= e - 1, ++t;
			return t;
		}
		function ze() {
			for (var e = 0, t = this.s & this.DM, n = 0; n < this.t; ++n) e += Re(this[n] ^ t);
			return e;
		}
		function Be(e) {
			var t = Math.floor(e / this.DB);
			return t >= this.t ? this.s != 0 : !!(this[t] & 1 << e % this.DB);
		}
		function Ve(e, t) {
			var n = c.ONE.shiftLeft(e);
			return this.bitwiseTo(n, t, n), n;
		}
		function He(e) {
			return this.changeBit(e, De);
		}
		function Ue(e) {
			return this.changeBit(e, je);
		}
		function We(e) {
			return this.changeBit(e, ke);
		}
		function Ge(e, t) {
			for (var n = 0, r = 0, i = Math.min(e.t, this.t); n < i;) r += this[n] + e[n], t[n++] = r & this.DM, r >>= this.DB;
			if (e.t < this.t) {
				for (r += e.s; n < this.t;) r += this[n], t[n++] = r & this.DM, r >>= this.DB;
				r += this.s;
			} else {
				for (r += this.s; n < e.t;) r += e[n], t[n++] = r & this.DM, r >>= this.DB;
				r += e.s;
			}
			t.s = r < 0 ? -1 : 0, r > 0 ? t[n++] = r : r < -1 && (t[n++] = this.DV + r), t.t = n, t.clamp();
		}
		function Ke(e) {
			var t = l();
			return this.addTo(e, t), t;
		}
		function qe(e) {
			var t = l();
			return this.subTo(e, t), t;
		}
		function Je(e) {
			var t = l();
			return this.multiplyTo(e, t), t;
		}
		function Ye() {
			var e = l();
			return this.squareTo(e), e;
		}
		function Xe(e) {
			var t = l();
			return this.divRemTo(e, t, null), t;
		}
		function Ze(e) {
			var t = l();
			return this.divRemTo(e, null, t), t;
		}
		function Qe(e) {
			var t = l(), n = l();
			return this.divRemTo(e, t, n), [t, n];
		}
		function $e(e) {
			this[this.t] = this.am(0, e - 1, this, 0, 0, this.t), ++this.t, this.clamp();
		}
		function et(e, t) {
			if (e != 0) {
				for (; this.t <= t;) this[this.t++] = 0;
				for (this[t] += e; this[t] >= this.DV;) this[t] -= this.DV, ++t >= this.t && (this[this.t++] = 0), ++this[t];
			}
		}
		function tt() {}
		function nt(e) {
			return e;
		}
		function rt(e, t, n) {
			e.multiplyTo(t, n);
		}
		function it(e, t) {
			e.squareTo(t);
		}
		tt.prototype.convert = nt, tt.prototype.revert = nt, tt.prototype.mulTo = rt, tt.prototype.sqrTo = it;
		function at(e) {
			return this.exp(e, new tt());
		}
		function ot(e, t, n) {
			var r = Math.min(this.t + e.t, t);
			for (n.s = 0, n.t = r; r > 0;) n[--r] = 0;
			var i;
			for (i = n.t - this.t; r < i; ++r) n[r + this.t] = this.am(0, e[r], n, r, 0, this.t);
			for (i = Math.min(e.t, t); r < i; ++r) this.am(0, e[r], n, r, 0, t - r);
			n.clamp();
		}
		function st(e, t, n) {
			--t;
			var r = n.t = this.t + e.t - t;
			for (n.s = 0; --r >= 0;) n[r] = 0;
			for (r = Math.max(t - this.t, 0); r < e.t; ++r) n[this.t + r - t] = this.am(t - r, e[r], n, 0, 0, this.t + r - t);
			n.clamp(), n.drShiftTo(1, n);
		}
		function ct(e) {
			this.r2 = l(), this.q3 = l(), c.ONE.dlShiftTo(2 * e.t, this.r2), this.mu = this.r2.divide(e), this.m = e;
		}
		function lt(e) {
			if (e.s < 0 || e.t > 2 * this.m.t) return e.mod(this.m);
			if (e.compareTo(this.m) < 0) return e;
			var t = l();
			return e.copyTo(t), this.reduce(t), t;
		}
		function ut(e) {
			return e;
		}
		function dt(e) {
			for (e.drShiftTo(this.m.t - 1, this.r2), e.t > this.m.t + 1 && (e.t = this.m.t + 1, e.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); e.compareTo(this.r2) < 0;) e.dAddOffset(1, this.m.t + 1);
			for (e.subTo(this.r2, e); e.compareTo(this.m) >= 0;) e.subTo(this.m, e);
		}
		function ft(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		function pt(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		ct.prototype.convert = lt, ct.prototype.revert = ut, ct.prototype.reduce = dt, ct.prototype.mulTo = pt, ct.prototype.sqrTo = ft;
		function mt(e, t) {
			var n = e.bitLength(), r, i = S(1), a;
			if (n <= 0) return i;
			r = n < 18 ? 1 : n < 48 ? 3 : n < 144 ? 4 : n < 768 ? 5 : 6, a = n < 8 ? new z(t) : t.isEven() ? new ct(t) : new oe(t);
			var o = [], s = 3, c = r - 1, u = (1 << r) - 1;
			if (o[1] = a.convert(this), r > 1) {
				var d = l();
				for (a.sqrTo(o[1], d); s <= u;) o[s] = l(), a.mulTo(d, o[s - 2], o[s]), s += 2;
			}
			var f = e.t - 1, p, m = !0, h = l(), g;
			for (n = k(e[f]) - 1; f >= 0;) {
				for (n >= c ? p = e[f] >> n - c & u : (p = (e[f] & (1 << n + 1) - 1) << c - n, f > 0 && (p |= e[f - 1] >> this.DB + n - c)), s = r; !(p & 1);) p >>= 1, --s;
				if ((n -= s) < 0 && (n += this.DB, --f), m) o[p].copyTo(i), m = !1;
				else {
					for (; s > 1;) a.sqrTo(i, h), a.sqrTo(h, i), s -= 2;
					s > 0 ? a.sqrTo(i, h) : (g = i, i = h, h = g), a.mulTo(h, o[p], i);
				}
				for (; f >= 0 && !(e[f] & 1 << n);) a.sqrTo(i, h), g = i, i = h, h = g, --n < 0 && (n = this.DB - 1, --f);
			}
			return a.revert(i);
		}
		function ht(e) {
			var t = this.s < 0 ? this.negate() : this.clone(), n = e.s < 0 ? e.negate() : e.clone();
			if (t.compareTo(n) < 0) {
				var r = t;
				t = n, n = r;
			}
			var i = t.getLowestSetBit(), a = n.getLowestSetBit();
			if (a < 0) return t;
			for (i < a && (a = i), a > 0 && (t.rShiftTo(a, t), n.rShiftTo(a, n)); t.signum() > 0;) (i = t.getLowestSetBit()) > 0 && t.rShiftTo(i, t), (i = n.getLowestSetBit()) > 0 && n.rShiftTo(i, n), t.compareTo(n) >= 0 ? (t.subTo(n, t), t.rShiftTo(1, t)) : (n.subTo(t, n), n.rShiftTo(1, n));
			return a > 0 && n.lShiftTo(a, n), n;
		}
		function gt(e) {
			if (e <= 0) return 0;
			var t = this.DV % e, n = this.s < 0 ? e - 1 : 0;
			if (this.t > 0) {
				if (t == 0) n = this[0] % e;
				else for (var r = this.t - 1; r >= 0; --r) n = (t * n + this[r]) % e;
			}
			return n;
		}
		function _t(e) {
			var t = e.isEven();
			if (this.isEven() && t || e.signum() == 0) return c.ZERO;
			for (var n = e.clone(), r = this.clone(), i = S(1), a = S(0), o = S(0), s = S(1); n.signum() != 0;) {
				for (; n.isEven();) n.rShiftTo(1, n), t ? ((!i.isEven() || !a.isEven()) && (i.addTo(this, i), a.subTo(e, a)), i.rShiftTo(1, i)) : a.isEven() || a.subTo(e, a), a.rShiftTo(1, a);
				for (; r.isEven();) r.rShiftTo(1, r), t ? ((!o.isEven() || !s.isEven()) && (o.addTo(this, o), s.subTo(e, s)), o.rShiftTo(1, o)) : s.isEven() || s.subTo(e, s), s.rShiftTo(1, s);
				n.compareTo(r) >= 0 ? (n.subTo(r, n), t && i.subTo(o, i), a.subTo(s, a)) : (r.subTo(n, r), t && o.subTo(i, o), s.subTo(a, s));
			}
			if (r.compareTo(c.ONE) != 0) return c.ZERO;
			if (s.compareTo(e) >= 0) return s.subtract(e);
			if (s.signum() < 0) s.addTo(e, s);
			else return s;
			return s.signum() < 0 ? s.add(e) : s;
		}
		var G = [
			2,
			3,
			5,
			7,
			11,
			13,
			17,
			19,
			23,
			29,
			31,
			37,
			41,
			43,
			47,
			53,
			59,
			61,
			67,
			71,
			73,
			79,
			83,
			89,
			97,
			101,
			103,
			107,
			109,
			113,
			127,
			131,
			137,
			139,
			149,
			151,
			157,
			163,
			167,
			173,
			179,
			181,
			191,
			193,
			197,
			199,
			211,
			223,
			227,
			229,
			233,
			239,
			241,
			251,
			257,
			263,
			269,
			271,
			277,
			281,
			283,
			293,
			307,
			311,
			313,
			317,
			331,
			337,
			347,
			349,
			353,
			359,
			367,
			373,
			379,
			383,
			389,
			397,
			401,
			409,
			419,
			421,
			431,
			433,
			439,
			443,
			449,
			457,
			461,
			463,
			467,
			479,
			487,
			491,
			499,
			503,
			509,
			521,
			523,
			541,
			547,
			557,
			563,
			569,
			571,
			577,
			587,
			593,
			599,
			601,
			607,
			613,
			617,
			619,
			631,
			641,
			643,
			647,
			653,
			659,
			661,
			673,
			677,
			683,
			691,
			701,
			709,
			719,
			727,
			733,
			739,
			743,
			751,
			757,
			761,
			769,
			773,
			787,
			797,
			809,
			811,
			821,
			823,
			827,
			829,
			839,
			853,
			857,
			859,
			863,
			877,
			881,
			883,
			887,
			907,
			911,
			919,
			929,
			937,
			941,
			947,
			953,
			967,
			971,
			977,
			983,
			991,
			997
		], vt = (1 << 26) / G[G.length - 1];
		function yt(e) {
			var t, n = this.abs();
			if (n.t == 1 && n[0] <= G[G.length - 1]) {
				for (t = 0; t < G.length; ++t) if (n[0] == G[t]) return !0;
				return !1;
			}
			if (n.isEven()) return !1;
			for (t = 1; t < G.length;) {
				for (var r = G[t], i = t + 1; i < G.length && r < vt;) r *= G[i++];
				for (r = n.modInt(r); t < i;) if (r % G[t++] == 0) return !1;
			}
			return n.millerRabin(e);
		}
		function bt(e) {
			var t = this.subtract(c.ONE), n = t.getLowestSetBit();
			if (n <= 0) return !1;
			var r = t.shiftRight(n);
			e = e + 1 >> 1, e > G.length && (e = G.length);
			for (var i = l(), a = 0; a < e; ++a) {
				i.fromInt(G[Math.floor(Math.random() * G.length)]);
				var o = i.modPow(r, this);
				if (o.compareTo(c.ONE) != 0 && o.compareTo(t) != 0) {
					for (var s = 1; s++ < n && o.compareTo(t) != 0;) if (o = o.modPowInt(2, this), o.compareTo(c.ONE) == 0) return !1;
					if (o.compareTo(t) != 0) return !1;
				}
			}
			return !0;
		}
		c.prototype.chunkSize = he, c.prototype.toRadix = _e, c.prototype.fromRadix = ve, c.prototype.fromNumber = ye, c.prototype.bitwiseTo = we, c.prototype.changeBit = Ve, c.prototype.addTo = Ge, c.prototype.dMultiply = $e, c.prototype.dAddOffset = et, c.prototype.multiplyLowerTo = ot, c.prototype.multiplyUpperTo = st, c.prototype.modInt = gt, c.prototype.millerRabin = bt, c.prototype.clone = H, c.prototype.intValue = U, c.prototype.byteValue = W, c.prototype.shortValue = me, c.prototype.signum = ge, c.prototype.toByteArray = be, c.prototype.equals = xe, c.prototype.min = Se, c.prototype.max = Ce, c.prototype.and = Ee, c.prototype.or = Oe, c.prototype.xor = Ae, c.prototype.andNot = Me, c.prototype.not = Ne, c.prototype.shiftLeft = Pe, c.prototype.shiftRight = Fe, c.prototype.getLowestSetBit = Le, c.prototype.bitCount = ze, c.prototype.testBit = Be, c.prototype.setBit = He, c.prototype.clearBit = Ue, c.prototype.flipBit = We, c.prototype.add = Ke, c.prototype.subtract = qe, c.prototype.multiply = Je, c.prototype.divide = Xe, c.prototype.remainder = Ze, c.prototype.divideAndRemainder = Qe, c.prototype.modPow = mt, c.prototype.modInverse = _t, c.prototype.pow = at, c.prototype.gcd = ht, c.prototype.isProbablePrime = yt, c.prototype.square = Ye;
		var K = c;
		if (K.prototype.IsNegative = function() {
			return this.compareTo(K.ZERO) == -1;
		}, K.op_Equality = function(e, t) {
			return e.compareTo(t) == 0;
		}, K.op_Inequality = function(e, t) {
			return e.compareTo(t) != 0;
		}, K.op_GreaterThan = function(e, t) {
			return e.compareTo(t) > 0;
		}, K.op_LessThan = function(e, t) {
			return e.compareTo(t) < 0;
		}, K.op_Addition = function(e, t) {
			return new K(e).add(new K(t));
		}, K.op_Subtraction = function(e, t) {
			return new K(e).subtract(new K(t));
		}, K.Int128Mul = function(e, t) {
			return new K(e).multiply(new K(t));
		}, K.op_Division = function(e, t) {
			return e.divide(t);
		}, K.prototype.ToDouble = function() {
			return parseFloat(this.toString());
		}, xt === void 0) var xt = function(e, t) {
			var n;
			if (Object.getOwnPropertyNames === void 0) {
				for (n in t.prototype) (e.prototype[n] === void 0 || e.prototype[n] == Object.prototype[n]) && (e.prototype[n] = t.prototype[n]);
				for (n in t) e[n] === void 0 && (e[n] = t[n]);
				e.$baseCtor = t;
			} else {
				for (var r = Object.getOwnPropertyNames(t.prototype), i = 0; i < r.length; i++) Object.getOwnPropertyDescriptor(e.prototype, r[i]) === void 0 && Object.defineProperty(e.prototype, r[i], Object.getOwnPropertyDescriptor(t.prototype, r[i]));
				for (n in t) e[n] === void 0 && (e[n] = t[n]);
				e.$baseCtor = t;
			}
		};
		e.Path = function() {
			return [];
		}, e.Paths = function() {
			return [];
		}, e.DoublePoint = function() {
			var e = arguments;
			this.X = 0, this.Y = 0, e.length == 1 ? (this.X = e[0].X, this.Y = e[0].Y) : e.length == 2 && (this.X = e[0], this.Y = e[1]);
		}, e.DoublePoint0 = function() {
			this.X = 0, this.Y = 0;
		}, e.DoublePoint1 = function(e) {
			this.X = e.X, this.Y = e.Y;
		}, e.DoublePoint2 = function(e, t) {
			this.X = e, this.Y = t;
		}, e.PolyNode = function() {
			this.m_Parent = null, this.m_polygon = new e.Path(), this.m_Index = 0, this.m_jointype = 0, this.m_endtype = 0, this.m_Childs = [], this.IsOpen = !1;
		}, e.PolyNode.prototype.IsHoleNode = function() {
			for (var e = !0, t = this.m_Parent; t !== null;) e = !e, t = t.m_Parent;
			return e;
		}, e.PolyNode.prototype.ChildCount = function() {
			return this.m_Childs.length;
		}, e.PolyNode.prototype.Contour = function() {
			return this.m_polygon;
		}, e.PolyNode.prototype.AddChild = function(e) {
			var t = this.m_Childs.length;
			this.m_Childs.push(e), e.m_Parent = this, e.m_Index = t;
		}, e.PolyNode.prototype.GetNext = function() {
			return this.m_Childs.length > 0 ? this.m_Childs[0] : this.GetNextSiblingUp();
		}, e.PolyNode.prototype.GetNextSiblingUp = function() {
			return this.m_Parent === null ? null : this.m_Index == this.m_Parent.m_Childs.length - 1 ? this.m_Parent.GetNextSiblingUp() : this.m_Parent.m_Childs[this.m_Index + 1];
		}, e.PolyNode.prototype.Childs = function() {
			return this.m_Childs;
		}, e.PolyNode.prototype.Parent = function() {
			return this.m_Parent;
		}, e.PolyNode.prototype.IsHole = function() {
			return this.IsHoleNode();
		}, e.PolyTree = function() {
			this.m_AllPolys = [], e.PolyNode.call(this);
		}, e.PolyTree.prototype.Clear = function() {
			for (var e = 0, t = this.m_AllPolys.length; e < t; e++) this.m_AllPolys[e] = null;
			this.m_AllPolys.length = 0, this.m_Childs.length = 0;
		}, e.PolyTree.prototype.GetFirst = function() {
			return this.m_Childs.length > 0 ? this.m_Childs[0] : null;
		}, e.PolyTree.prototype.Total = function() {
			return this.m_AllPolys.length;
		}, xt(e.PolyTree, e.PolyNode), e.Math_Abs_Int64 = e.Math_Abs_Int32 = e.Math_Abs_Double = function(e) {
			return Math.abs(e);
		}, e.Math_Max_Int32_Int32 = function(e, t) {
			return Math.max(e, t);
		}, e.Cast_Int32 = a.msie || a.opera || a.safari ? function(e) {
			return e | 0;
		} : function(e) {
			return ~~e;
		}, e.Cast_Int64 = a.chrome ? function(e) {
			return e < -2147483648 || e > 2147483647 ? e < 0 ? Math.ceil(e) : Math.floor(e) : ~~e;
		} : a.firefox && typeof Number.toInteger == "function" ? function(e) {
			return Number.toInteger(e);
		} : a.msie7 || a.msie8 ? function(e) {
			return parseInt(e, 10);
		} : a.msie ? function(e) {
			return e < -2147483648 || e > 2147483647 ? e < 0 ? Math.ceil(e) : Math.floor(e) : e | 0;
		} : function(e) {
			return e < 0 ? Math.ceil(e) : Math.floor(e);
		}, e.Clear = function(e) {
			e.length = 0;
		}, e.PI = 3.141592653589793, e.PI2 = 6.283185307179586, e.IntPoint = function() {
			var t = arguments, n = t.length;
			if (this.X = 0, this.Y = 0, 0) var r, i;
			else if (n == 2) this.X = t[0], this.Y = t[1];
			else if (n == 1) {
				if (t[0] instanceof e.DoublePoint) {
					var r = t[0];
					this.X = e.Clipper.Round(r.X), this.Y = e.Clipper.Round(r.Y);
				} else {
					var i = t[0];
					this.X = i.X, this.Y = i.Y;
				}
			} else this.X = 0, this.Y = 0;
		}, e.IntPoint.op_Equality = function(e, t) {
			return e.X == t.X && e.Y == t.Y;
		}, e.IntPoint.op_Inequality = function(e, t) {
			return e.X != t.X || e.Y != t.Y;
		}, e.IntPoint0 = function() {
			this.X = 0, this.Y = 0;
		}, e.IntPoint1 = function(e) {
			this.X = e.X, this.Y = e.Y;
		}, e.IntPoint1dp = function(t) {
			this.X = e.Clipper.Round(t.X), this.Y = e.Clipper.Round(t.Y);
		}, e.IntPoint2 = function(e, t) {
			this.X = e, this.Y = t;
		}, e.IntRect = function() {
			var e = arguments, t = e.length;
			t == 4 ? (this.left = e[0], this.top = e[1], this.right = e[2], this.bottom = e[3]) : t == 1 ? (this.left = ir.left, this.top = ir.top, this.right = ir.right, this.bottom = ir.bottom) : (this.left = 0, this.top = 0, this.right = 0, this.bottom = 0);
		}, e.IntRect0 = function() {
			this.left = 0, this.top = 0, this.right = 0, this.bottom = 0;
		}, e.IntRect1 = function(e) {
			this.left = e.left, this.top = e.top, this.right = e.right, this.bottom = e.bottom;
		}, e.IntRect4 = function(e, t, n, r) {
			this.left = e, this.top = t, this.right = n, this.bottom = r;
		}, e.ClipType = {
			ctIntersection: 0,
			ctUnion: 1,
			ctDifference: 2,
			ctXor: 3
		}, e.PolyType = {
			ptSubject: 0,
			ptClip: 1
		}, e.PolyFillType = {
			pftEvenOdd: 0,
			pftNonZero: 1,
			pftPositive: 2,
			pftNegative: 3
		}, e.JoinType = {
			jtSquare: 0,
			jtRound: 1,
			jtMiter: 2
		}, e.EndType = {
			etOpenSquare: 0,
			etOpenRound: 1,
			etOpenButt: 2,
			etClosedLine: 3,
			etClosedPolygon: 4
		}, e.EdgeSide = {
			esLeft: 0,
			esRight: 1
		}, e.Direction = {
			dRightToLeft: 0,
			dLeftToRight: 1
		}, e.TEdge = function() {
			this.Bot = new e.IntPoint(), this.Curr = new e.IntPoint(), this.Top = new e.IntPoint(), this.Delta = new e.IntPoint(), this.Dx = 0, this.PolyTyp = e.PolyType.ptSubject, this.Side = e.EdgeSide.esLeft, this.WindDelta = 0, this.WindCnt = 0, this.WindCnt2 = 0, this.OutIdx = 0, this.Next = null, this.Prev = null, this.NextInLML = null, this.NextInAEL = null, this.PrevInAEL = null, this.NextInSEL = null, this.PrevInSEL = null;
		}, e.IntersectNode = function() {
			this.Edge1 = null, this.Edge2 = null, this.Pt = new e.IntPoint();
		}, e.MyIntersectNodeSort = function() {}, e.MyIntersectNodeSort.Compare = function(e, t) {
			return t.Pt.Y - e.Pt.Y;
		}, e.LocalMinima = function() {
			this.Y = 0, this.LeftBound = null, this.RightBound = null, this.Next = null;
		}, e.Scanbeam = function() {
			this.Y = 0, this.Next = null;
		}, e.OutRec = function() {
			this.Idx = 0, this.IsHole = !1, this.IsOpen = !1, this.FirstLeft = null, this.Pts = null, this.BottomPt = null, this.PolyNode = null;
		}, e.OutPt = function() {
			this.Idx = 0, this.Pt = new e.IntPoint(), this.Next = null, this.Prev = null;
		}, e.Join = function() {
			this.OutPt1 = null, this.OutPt2 = null, this.OffPt = new e.IntPoint();
		}, e.ClipperBase = function() {
			this.m_MinimaList = null, this.m_CurrentLM = null, this.m_edges = [], this.m_UseFullRange = !1, this.m_HasOpenPaths = !1, this.PreserveCollinear = !1, this.m_MinimaList = null, this.m_CurrentLM = null, this.m_UseFullRange = !1, this.m_HasOpenPaths = !1;
		}, e.ClipperBase.horizontal = -9007199254740992, e.ClipperBase.Skip = -2, e.ClipperBase.Unassigned = -1, e.ClipperBase.tolerance = 1e-20, e.ClipperBase.loRange = 47453132, e.ClipperBase.hiRange = 0xfffffffffffff, e.ClipperBase.near_zero = function(t) {
			return t > -e.ClipperBase.tolerance && t < e.ClipperBase.tolerance;
		}, e.ClipperBase.IsHorizontal = function(e) {
			return e.Delta.Y === 0;
		}, e.ClipperBase.prototype.PointIsVertex = function(t, n) {
			var r = n;
			do {
				if (e.IntPoint.op_Equality(r.Pt, t)) return !0;
				r = r.Next;
			} while (r != n);
			return !1;
		}, e.ClipperBase.prototype.PointOnLineSegment = function(e, t, n, r) {
			return r ? e.X == t.X && e.Y == t.Y || e.X == n.X && e.Y == n.Y || e.X > t.X == e.X < n.X && e.Y > t.Y == e.Y < n.Y && K.op_Equality(K.Int128Mul(e.X - t.X, n.Y - t.Y), K.Int128Mul(n.X - t.X, e.Y - t.Y)) : e.X == t.X && e.Y == t.Y || e.X == n.X && e.Y == n.Y || e.X > t.X == e.X < n.X && e.Y > t.Y == e.Y < n.Y && (e.X - t.X) * (n.Y - t.Y) == (n.X - t.X) * (e.Y - t.Y);
		}, e.ClipperBase.prototype.PointOnPolygon = function(e, t, n) {
			for (var r = t;;) {
				if (this.PointOnLineSegment(e, r.Pt, r.Next.Pt, n)) return !0;
				if (r = r.Next, r == t) break;
			}
			return !1;
		}, e.ClipperBase.prototype.SlopesEqual = e.ClipperBase.SlopesEqual = function() {
			var t = arguments, n = t.length, r, i, a, o, s, c, l;
			return n == 3 ? (r = t[0], i = t[1], l = t[2], l ? K.op_Equality(K.Int128Mul(r.Delta.Y, i.Delta.X), K.Int128Mul(r.Delta.X, i.Delta.Y)) : e.Cast_Int64(r.Delta.Y * i.Delta.X) == e.Cast_Int64(r.Delta.X * i.Delta.Y)) : n == 4 ? (a = t[0], o = t[1], s = t[2], l = t[3], l ? K.op_Equality(K.Int128Mul(a.Y - o.Y, o.X - s.X), K.Int128Mul(a.X - o.X, o.Y - s.Y)) : e.Cast_Int64((a.Y - o.Y) * (o.X - s.X)) - e.Cast_Int64((a.X - o.X) * (o.Y - s.Y)) === 0) : (a = t[0], o = t[1], s = t[2], c = t[3], l = t[4], l ? K.op_Equality(K.Int128Mul(a.Y - o.Y, s.X - c.X), K.Int128Mul(a.X - o.X, s.Y - c.Y)) : e.Cast_Int64((a.Y - o.Y) * (s.X - c.X)) - e.Cast_Int64((a.X - o.X) * (s.Y - c.Y)) === 0);
		}, e.ClipperBase.SlopesEqual3 = function(t, n, r) {
			return r ? K.op_Equality(K.Int128Mul(t.Delta.Y, n.Delta.X), K.Int128Mul(t.Delta.X, n.Delta.Y)) : e.Cast_Int64(t.Delta.Y * n.Delta.X) == e.Cast_Int64(t.Delta.X * n.Delta.Y);
		}, e.ClipperBase.SlopesEqual4 = function(t, n, r, i) {
			return i ? K.op_Equality(K.Int128Mul(t.Y - n.Y, n.X - r.X), K.Int128Mul(t.X - n.X, n.Y - r.Y)) : e.Cast_Int64((t.Y - n.Y) * (n.X - r.X)) - e.Cast_Int64((t.X - n.X) * (n.Y - r.Y)) === 0;
		}, e.ClipperBase.SlopesEqual5 = function(t, n, r, i, a) {
			return a ? K.op_Equality(K.Int128Mul(t.Y - n.Y, r.X - i.X), K.Int128Mul(t.X - n.X, r.Y - i.Y)) : e.Cast_Int64((t.Y - n.Y) * (r.X - i.X)) - e.Cast_Int64((t.X - n.X) * (r.Y - i.Y)) === 0;
		}, e.ClipperBase.prototype.Clear = function() {
			this.DisposeLocalMinimaList();
			for (var t = 0, n = this.m_edges.length; t < n; ++t) {
				for (var r = 0, i = this.m_edges[t].length; r < i; ++r) this.m_edges[t][r] = null;
				e.Clear(this.m_edges[t]);
			}
			e.Clear(this.m_edges), this.m_UseFullRange = !1, this.m_HasOpenPaths = !1;
		}, e.ClipperBase.prototype.DisposeLocalMinimaList = function() {
			for (; this.m_MinimaList !== null;) {
				var e = this.m_MinimaList.Next;
				this.m_MinimaList = null, this.m_MinimaList = e;
			}
			this.m_CurrentLM = null;
		}, e.ClipperBase.prototype.RangeTest = function(t, n) {
			n.Value ? (t.X > e.ClipperBase.hiRange || t.Y > e.ClipperBase.hiRange || -t.X > e.ClipperBase.hiRange || -t.Y > e.ClipperBase.hiRange) && e.Error("Coordinate outside allowed range in RangeTest().") : (t.X > e.ClipperBase.loRange || t.Y > e.ClipperBase.loRange || -t.X > e.ClipperBase.loRange || -t.Y > e.ClipperBase.loRange) && (n.Value = !0, this.RangeTest(t, n));
		}, e.ClipperBase.prototype.InitEdge = function(e, t, n, r) {
			e.Next = t, e.Prev = n, e.Curr.X = r.X, e.Curr.Y = r.Y, e.OutIdx = -1;
		}, e.ClipperBase.prototype.InitEdge2 = function(e, t) {
			e.Curr.Y >= e.Next.Curr.Y ? (e.Bot.X = e.Curr.X, e.Bot.Y = e.Curr.Y, e.Top.X = e.Next.Curr.X, e.Top.Y = e.Next.Curr.Y) : (e.Top.X = e.Curr.X, e.Top.Y = e.Curr.Y, e.Bot.X = e.Next.Curr.X, e.Bot.Y = e.Next.Curr.Y), this.SetDx(e), e.PolyTyp = t;
		}, e.ClipperBase.prototype.FindNextLocMin = function(t) {
			for (var n;;) {
				for (; e.IntPoint.op_Inequality(t.Bot, t.Prev.Bot) || e.IntPoint.op_Equality(t.Curr, t.Top);) t = t.Next;
				if (t.Dx != e.ClipperBase.horizontal && t.Prev.Dx != e.ClipperBase.horizontal) break;
				for (; t.Prev.Dx == e.ClipperBase.horizontal;) t = t.Prev;
				for (n = t; t.Dx == e.ClipperBase.horizontal;) t = t.Next;
				if (t.Top.Y != t.Prev.Bot.Y) {
					n.Prev.Bot.X < t.Bot.X && (t = n);
					break;
				}
			}
			return t;
		}, e.ClipperBase.prototype.ProcessBound = function(t, n) {
			var r = t, i = t, a, o;
			if (t.Dx == e.ClipperBase.horizontal && (o = n ? t.Prev.Bot.X : t.Next.Bot.X, t.Bot.X != o && this.ReverseHorizontal(t)), i.OutIdx != e.ClipperBase.Skip) {
				if (n) {
					for (; i.Top.Y == i.Next.Bot.Y && i.Next.OutIdx != e.ClipperBase.Skip;) i = i.Next;
					if (i.Dx == e.ClipperBase.horizontal && i.Next.OutIdx != e.ClipperBase.Skip) {
						for (a = i; a.Prev.Dx == e.ClipperBase.horizontal;) a = a.Prev;
						a.Prev.Top.X == i.Next.Top.X ? n || (i = a.Prev) : a.Prev.Top.X > i.Next.Top.X && (i = a.Prev);
					}
					for (; t != i;) t.NextInLML = t.Next, t.Dx == e.ClipperBase.horizontal && t != r && t.Bot.X != t.Prev.Top.X && this.ReverseHorizontal(t), t = t.Next;
					t.Dx == e.ClipperBase.horizontal && t != r && t.Bot.X != t.Prev.Top.X && this.ReverseHorizontal(t), i = i.Next;
				} else {
					for (; i.Top.Y == i.Prev.Bot.Y && i.Prev.OutIdx != e.ClipperBase.Skip;) i = i.Prev;
					if (i.Dx == e.ClipperBase.horizontal && i.Prev.OutIdx != e.ClipperBase.Skip) {
						for (a = i; a.Next.Dx == e.ClipperBase.horizontal;) a = a.Next;
						a.Next.Top.X == i.Prev.Top.X ? n || (i = a.Next) : a.Next.Top.X > i.Prev.Top.X && (i = a.Next);
					}
					for (; t != i;) t.NextInLML = t.Prev, t.Dx == e.ClipperBase.horizontal && t != r && t.Bot.X != t.Next.Top.X && this.ReverseHorizontal(t), t = t.Prev;
					t.Dx == e.ClipperBase.horizontal && t != r && t.Bot.X != t.Next.Top.X && this.ReverseHorizontal(t), i = i.Prev;
				}
			}
			if (i.OutIdx == e.ClipperBase.Skip) {
				if (t = i, n) {
					for (; t.Top.Y == t.Next.Bot.Y;) t = t.Next;
					for (; t != i && t.Dx == e.ClipperBase.horizontal;) t = t.Prev;
				} else {
					for (; t.Top.Y == t.Prev.Bot.Y;) t = t.Prev;
					for (; t != i && t.Dx == e.ClipperBase.horizontal;) t = t.Next;
				}
				if (t == i) i = n ? t.Next : t.Prev;
				else {
					t = n ? i.Next : i.Prev;
					var s = new e.LocalMinima();
					s.Next = null, s.Y = t.Bot.Y, s.LeftBound = null, s.RightBound = t, s.RightBound.WindDelta = 0, i = this.ProcessBound(s.RightBound, n), this.InsertLocalMinima(s);
				}
			}
			return i;
		}, e.ClipperBase.prototype.AddPath = function(t, n, r) {
			!r && n == e.PolyType.ptClip && e.Error("AddPath: Open paths must be subject.");
			var i = t.length - 1;
			if (r) for (; i > 0 && e.IntPoint.op_Equality(t[i], t[0]);) --i;
			for (; i > 0 && e.IntPoint.op_Equality(t[i], t[i - 1]);) --i;
			if (r && i < 2 || !r && i < 1) return !1;
			for (var a = [], o = 0; o <= i; o++) a.push(new e.TEdge());
			var s = !0;
			a[1].Curr.X = t[1].X, a[1].Curr.Y = t[1].Y;
			var c = { Value: this.m_UseFullRange };
			this.RangeTest(t[0], c), this.m_UseFullRange = c.Value, c.Value = this.m_UseFullRange, this.RangeTest(t[i], c), this.m_UseFullRange = c.Value, this.InitEdge(a[0], a[1], a[i], t[0]), this.InitEdge(a[i], a[0], a[i - 1], t[i]);
			for (var o = i - 1; o >= 1; --o) c.Value = this.m_UseFullRange, this.RangeTest(t[o], c), this.m_UseFullRange = c.Value, this.InitEdge(a[o], a[o + 1], a[o - 1], t[o]);
			for (var l = a[0], u = l, d = l;;) {
				if (e.IntPoint.op_Equality(u.Curr, u.Next.Curr)) {
					if (u == u.Next) break;
					u == l && (l = u.Next), u = this.RemoveEdge(u), d = u;
					continue;
				}
				if (u.Prev == u.Next) break;
				if (r && e.ClipperBase.SlopesEqual(u.Prev.Curr, u.Curr, u.Next.Curr, this.m_UseFullRange) && (!this.PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(u.Prev.Curr, u.Curr, u.Next.Curr))) {
					u == l && (l = u.Next), u = this.RemoveEdge(u), u = u.Prev, d = u;
					continue;
				}
				if (u = u.Next, u == d) break;
			}
			if (!r && u == u.Next || r && u.Prev == u.Next) return !1;
			r || (this.m_HasOpenPaths = !0, l.Prev.OutIdx = e.ClipperBase.Skip), u = l;
			do
				this.InitEdge2(u, n), u = u.Next, s && u.Curr.Y != l.Curr.Y && (s = !1);
			while (u != l);
			if (s) {
				if (r) return !1;
				u.Prev.OutIdx = e.ClipperBase.Skip, u.Prev.Bot.X < u.Prev.Top.X && this.ReverseHorizontal(u.Prev);
				var f = new e.LocalMinima();
				for (f.Next = null, f.Y = u.Bot.Y, f.LeftBound = null, f.RightBound = u, f.RightBound.Side = e.EdgeSide.esRight, f.RightBound.WindDelta = 0; u.Next.OutIdx != e.ClipperBase.Skip;) u.NextInLML = u.Next, u.Bot.X != u.Prev.Top.X && this.ReverseHorizontal(u), u = u.Next;
				return this.InsertLocalMinima(f), this.m_edges.push(a), !0;
			}
			this.m_edges.push(a);
			for (var p, m = null; u = this.FindNextLocMin(u), u != m;) {
				m ??= u;
				var f = new e.LocalMinima();
				f.Next = null, f.Y = u.Bot.Y, u.Dx < u.Prev.Dx ? (f.LeftBound = u.Prev, f.RightBound = u, p = !1) : (f.LeftBound = u, f.RightBound = u.Prev, p = !0), f.LeftBound.Side = e.EdgeSide.esLeft, f.RightBound.Side = e.EdgeSide.esRight, r ? f.LeftBound.Next == f.RightBound ? f.LeftBound.WindDelta = -1 : f.LeftBound.WindDelta = 1 : f.LeftBound.WindDelta = 0, f.RightBound.WindDelta = -f.LeftBound.WindDelta, u = this.ProcessBound(f.LeftBound, p);
				var h = this.ProcessBound(f.RightBound, !p);
				f.LeftBound.OutIdx == e.ClipperBase.Skip ? f.LeftBound = null : f.RightBound.OutIdx == e.ClipperBase.Skip && (f.RightBound = null), this.InsertLocalMinima(f), p || (u = h);
			}
			return !0;
		}, e.ClipperBase.prototype.AddPaths = function(e, t, n) {
			for (var r = !1, i = 0, a = e.length; i < a; ++i) this.AddPath(e[i], t, n) && (r = !0);
			return r;
		}, e.ClipperBase.prototype.Pt2IsBetweenPt1AndPt3 = function(t, n, r) {
			return e.IntPoint.op_Equality(t, r) || e.IntPoint.op_Equality(t, n) || e.IntPoint.op_Equality(r, n) ? !1 : t.X == r.X ? n.Y > t.Y == n.Y < r.Y : n.X > t.X == n.X < r.X;
		}, e.ClipperBase.prototype.RemoveEdge = function(e) {
			e.Prev.Next = e.Next, e.Next.Prev = e.Prev;
			var t = e.Next;
			return e.Prev = null, t;
		}, e.ClipperBase.prototype.SetDx = function(t) {
			t.Delta.X = t.Top.X - t.Bot.X, t.Delta.Y = t.Top.Y - t.Bot.Y, t.Dx = t.Delta.Y === 0 ? e.ClipperBase.horizontal : t.Delta.X / t.Delta.Y;
		}, e.ClipperBase.prototype.InsertLocalMinima = function(e) {
			if (this.m_MinimaList === null) this.m_MinimaList = e;
			else if (e.Y >= this.m_MinimaList.Y) e.Next = this.m_MinimaList, this.m_MinimaList = e;
			else {
				for (var t = this.m_MinimaList; t.Next !== null && e.Y < t.Next.Y;) t = t.Next;
				e.Next = t.Next, t.Next = e;
			}
		}, e.ClipperBase.prototype.PopLocalMinima = function() {
			this.m_CurrentLM !== null && (this.m_CurrentLM = this.m_CurrentLM.Next);
		}, e.ClipperBase.prototype.ReverseHorizontal = function(e) {
			var t = e.Top.X;
			e.Top.X = e.Bot.X, e.Bot.X = t;
		}, e.ClipperBase.prototype.Reset = function() {
			if (this.m_CurrentLM = this.m_MinimaList, this.m_CurrentLM != null) for (var t = this.m_MinimaList; t != null;) {
				var n = t.LeftBound;
				n != null && (n.Curr.X = n.Bot.X, n.Curr.Y = n.Bot.Y, n.Side = e.EdgeSide.esLeft, n.OutIdx = e.ClipperBase.Unassigned), n = t.RightBound, n != null && (n.Curr.X = n.Bot.X, n.Curr.Y = n.Bot.Y, n.Side = e.EdgeSide.esRight, n.OutIdx = e.ClipperBase.Unassigned), t = t.Next;
			}
		}, e.Clipper = function(t) {
			t === void 0 && (t = 0), this.m_PolyOuts = null, this.m_ClipType = e.ClipType.ctIntersection, this.m_Scanbeam = null, this.m_ActiveEdges = null, this.m_SortedEdges = null, this.m_IntersectList = null, this.m_IntersectNodeComparer = null, this.m_ExecuteLocked = !1, this.m_ClipFillType = e.PolyFillType.pftEvenOdd, this.m_SubjFillType = e.PolyFillType.pftEvenOdd, this.m_Joins = null, this.m_GhostJoins = null, this.m_UsingPolyTree = !1, this.ReverseSolution = !1, this.StrictlySimple = !1, e.ClipperBase.call(this), this.m_Scanbeam = null, this.m_ActiveEdges = null, this.m_SortedEdges = null, this.m_IntersectList = [], this.m_IntersectNodeComparer = e.MyIntersectNodeSort.Compare, this.m_ExecuteLocked = !1, this.m_UsingPolyTree = !1, this.m_PolyOuts = [], this.m_Joins = [], this.m_GhostJoins = [], this.ReverseSolution = !!(1 & t), this.StrictlySimple = !!(2 & t), this.PreserveCollinear = !!(4 & t);
		}, e.Clipper.ioReverseSolution = 1, e.Clipper.ioStrictlySimple = 2, e.Clipper.ioPreserveCollinear = 4, e.Clipper.prototype.Clear = function() {
			this.m_edges.length !== 0 && (this.DisposeAllPolyPts(), e.ClipperBase.prototype.Clear.call(this));
		}, e.Clipper.prototype.DisposeScanbeamList = function() {
			for (; this.m_Scanbeam !== null;) {
				var e = this.m_Scanbeam.Next;
				this.m_Scanbeam = null, this.m_Scanbeam = e;
			}
		}, e.Clipper.prototype.Reset = function() {
			e.ClipperBase.prototype.Reset.call(this), this.m_Scanbeam = null, this.m_ActiveEdges = null, this.m_SortedEdges = null;
			for (var t = this.m_MinimaList; t !== null;) this.InsertScanbeam(t.Y), t = t.Next;
		}, e.Clipper.prototype.InsertScanbeam = function(t) {
			if (this.m_Scanbeam === null) this.m_Scanbeam = new e.Scanbeam(), this.m_Scanbeam.Next = null, this.m_Scanbeam.Y = t;
			else if (t > this.m_Scanbeam.Y) {
				var n = new e.Scanbeam();
				n.Y = t, n.Next = this.m_Scanbeam, this.m_Scanbeam = n;
			} else {
				for (var r = this.m_Scanbeam; r.Next !== null && t <= r.Next.Y;) r = r.Next;
				if (t == r.Y) return;
				var n = new e.Scanbeam();
				n.Y = t, n.Next = r.Next, r.Next = n;
			}
		}, e.Clipper.prototype.Execute = function() {
			var t = arguments, n = t.length, r = t[1] instanceof e.PolyTree;
			if (n == 4 && !r) {
				var i = t[0], a = t[1], o = t[2], s = t[3];
				if (this.m_ExecuteLocked) return !1;
				this.m_HasOpenPaths && e.Error("Error: PolyTree struct is need for open path clipping."), this.m_ExecuteLocked = !0, e.Clear(a), this.m_SubjFillType = o, this.m_ClipFillType = s, this.m_ClipType = i, this.m_UsingPolyTree = !1;
				try {
					var c = this.ExecuteInternal();
					c && this.BuildResult(a);
				} finally {
					this.DisposeAllPolyPts(), this.m_ExecuteLocked = !1;
				}
				return c;
			}
			if (n == 4 && r) {
				var i = t[0], l = t[1], o = t[2], s = t[3];
				if (this.m_ExecuteLocked) return !1;
				this.m_ExecuteLocked = !0, this.m_SubjFillType = o, this.m_ClipFillType = s, this.m_ClipType = i, this.m_UsingPolyTree = !0;
				try {
					var c = this.ExecuteInternal();
					c && this.BuildResult2(l);
				} finally {
					this.DisposeAllPolyPts(), this.m_ExecuteLocked = !1;
				}
				return c;
			}
			if (n == 2 && !r) {
				var i = t[0], a = t[1];
				return this.Execute(i, a, e.PolyFillType.pftEvenOdd, e.PolyFillType.pftEvenOdd);
			}
			if (n == 2 && r) {
				var i = t[0], l = t[1];
				return this.Execute(i, l, e.PolyFillType.pftEvenOdd, e.PolyFillType.pftEvenOdd);
			}
		}, e.Clipper.prototype.FixHoleLinkage = function(e) {
			if (!(e.FirstLeft === null || e.IsHole != e.FirstLeft.IsHole && e.FirstLeft.Pts !== null)) {
				for (var t = e.FirstLeft; t !== null && (t.IsHole == e.IsHole || t.Pts === null);) t = t.FirstLeft;
				e.FirstLeft = t;
			}
		}, e.Clipper.prototype.ExecuteInternal = function() {
			try {
				if (this.Reset(), this.m_CurrentLM === null) return !1;
				var t = this.PopScanbeam();
				do {
					if (this.InsertLocalMinimaIntoAEL(t), e.Clear(this.m_GhostJoins), this.ProcessHorizontals(!1), this.m_Scanbeam === null) break;
					var n = this.PopScanbeam();
					if (!this.ProcessIntersections(t, n)) return !1;
					this.ProcessEdgesAtTopOfScanbeam(n), t = n;
				} while (this.m_Scanbeam !== null || this.m_CurrentLM !== null);
				for (var r = 0, i = this.m_PolyOuts.length; r < i; r++) {
					var a = this.m_PolyOuts[r];
					a.Pts === null || a.IsOpen || (a.IsHole ^ this.ReverseSolution) == this.Area(a) > 0 && this.ReversePolyPtLinks(a.Pts);
				}
				this.JoinCommonEdges();
				for (var r = 0, i = this.m_PolyOuts.length; r < i; r++) {
					var a = this.m_PolyOuts[r];
					a.Pts !== null && !a.IsOpen && this.FixupOutPolygon(a);
				}
				return this.StrictlySimple && this.DoSimplePolygons(), !0;
			} finally {
				e.Clear(this.m_Joins), e.Clear(this.m_GhostJoins);
			}
		}, e.Clipper.prototype.PopScanbeam = function() {
			var e = this.m_Scanbeam.Y;
			return this.m_Scanbeam, this.m_Scanbeam = this.m_Scanbeam.Next, e;
		}, e.Clipper.prototype.DisposeAllPolyPts = function() {
			for (var t = 0, n = this.m_PolyOuts.length; t < n; ++t) this.DisposeOutRec(t);
			e.Clear(this.m_PolyOuts);
		}, e.Clipper.prototype.DisposeOutRec = function(e) {
			var t = this.m_PolyOuts[e];
			t.Pts !== null && this.DisposeOutPts(t.Pts), t = null, this.m_PolyOuts[e] = null;
		}, e.Clipper.prototype.DisposeOutPts = function(e) {
			if (e !== null) for (e.Prev.Next = null; e !== null;) e = e.Next;
		}, e.Clipper.prototype.AddJoin = function(t, n, r) {
			var i = new e.Join();
			i.OutPt1 = t, i.OutPt2 = n, i.OffPt.X = r.X, i.OffPt.Y = r.Y, this.m_Joins.push(i);
		}, e.Clipper.prototype.AddGhostJoin = function(t, n) {
			var r = new e.Join();
			r.OutPt1 = t, r.OffPt.X = n.X, r.OffPt.Y = n.Y, this.m_GhostJoins.push(r);
		}, e.Clipper.prototype.InsertLocalMinimaIntoAEL = function(t) {
			for (; this.m_CurrentLM !== null && this.m_CurrentLM.Y == t;) {
				var n = this.m_CurrentLM.LeftBound, r = this.m_CurrentLM.RightBound;
				this.PopLocalMinima();
				var i = null;
				if (n === null ? (this.InsertEdgeIntoAEL(r, null), this.SetWindingCount(r), this.IsContributing(r) && (i = this.AddOutPt(r, r.Bot))) : r == null ? (this.InsertEdgeIntoAEL(n, null), this.SetWindingCount(n), this.IsContributing(n) && (i = this.AddOutPt(n, n.Bot)), this.InsertScanbeam(n.Top.Y)) : (this.InsertEdgeIntoAEL(n, null), this.InsertEdgeIntoAEL(r, n), this.SetWindingCount(n), r.WindCnt = n.WindCnt, r.WindCnt2 = n.WindCnt2, this.IsContributing(n) && (i = this.AddLocalMinPoly(n, r, n.Bot)), this.InsertScanbeam(n.Top.Y)), r != null && (e.ClipperBase.IsHorizontal(r) ? this.AddEdgeToSEL(r) : this.InsertScanbeam(r.Top.Y)), n != null && r != null) {
					if (i !== null && e.ClipperBase.IsHorizontal(r) && this.m_GhostJoins.length > 0 && r.WindDelta !== 0) for (var a = 0, o = this.m_GhostJoins.length; a < o; a++) {
						var s = this.m_GhostJoins[a];
						this.HorzSegmentsOverlap(s.OutPt1.Pt, s.OffPt, r.Bot, r.Top) && this.AddJoin(s.OutPt1, i, s.OffPt);
					}
					if (n.OutIdx >= 0 && n.PrevInAEL !== null && n.PrevInAEL.Curr.X == n.Bot.X && n.PrevInAEL.OutIdx >= 0 && e.ClipperBase.SlopesEqual(n.PrevInAEL, n, this.m_UseFullRange) && n.WindDelta !== 0 && n.PrevInAEL.WindDelta !== 0) {
						var c = this.AddOutPt(n.PrevInAEL, n.Bot);
						this.AddJoin(i, c, n.Top);
					}
					if (n.NextInAEL != r) {
						if (r.OutIdx >= 0 && r.PrevInAEL.OutIdx >= 0 && e.ClipperBase.SlopesEqual(r.PrevInAEL, r, this.m_UseFullRange) && r.WindDelta !== 0 && r.PrevInAEL.WindDelta !== 0) {
							var c = this.AddOutPt(r.PrevInAEL, r.Bot);
							this.AddJoin(i, c, r.Top);
						}
						var l = n.NextInAEL;
						if (l !== null) for (; l != r;) this.IntersectEdges(r, l, n.Curr, !1), l = l.NextInAEL;
					}
				}
			}
		}, e.Clipper.prototype.InsertEdgeIntoAEL = function(e, t) {
			if (this.m_ActiveEdges === null) e.PrevInAEL = null, e.NextInAEL = null, this.m_ActiveEdges = e;
			else if (t === null && this.E2InsertsBeforeE1(this.m_ActiveEdges, e)) e.PrevInAEL = null, e.NextInAEL = this.m_ActiveEdges, this.m_ActiveEdges.PrevInAEL = e, this.m_ActiveEdges = e;
			else {
				for (t === null && (t = this.m_ActiveEdges); t.NextInAEL !== null && !this.E2InsertsBeforeE1(t.NextInAEL, e);) t = t.NextInAEL;
				e.NextInAEL = t.NextInAEL, t.NextInAEL !== null && (t.NextInAEL.PrevInAEL = e), e.PrevInAEL = t, t.NextInAEL = e;
			}
		}, e.Clipper.prototype.E2InsertsBeforeE1 = function(t, n) {
			return n.Curr.X == t.Curr.X ? n.Top.Y > t.Top.Y ? n.Top.X < e.Clipper.TopX(t, n.Top.Y) : t.Top.X > e.Clipper.TopX(n, t.Top.Y) : n.Curr.X < t.Curr.X;
		}, e.Clipper.prototype.IsEvenOddFillType = function(t) {
			return t.PolyTyp == e.PolyType.ptSubject ? this.m_SubjFillType == e.PolyFillType.pftEvenOdd : this.m_ClipFillType == e.PolyFillType.pftEvenOdd;
		}, e.Clipper.prototype.IsEvenOddAltFillType = function(t) {
			return t.PolyTyp == e.PolyType.ptSubject ? this.m_ClipFillType == e.PolyFillType.pftEvenOdd : this.m_SubjFillType == e.PolyFillType.pftEvenOdd;
		}, e.Clipper.prototype.IsContributing = function(t) {
			var n, r;
			switch (t.PolyTyp == e.PolyType.ptSubject ? (n = this.m_SubjFillType, r = this.m_ClipFillType) : (n = this.m_ClipFillType, r = this.m_SubjFillType), n) {
				case e.PolyFillType.pftEvenOdd:
					if (t.WindDelta === 0 && t.WindCnt != 1) return !1;
					break;
				case e.PolyFillType.pftNonZero:
					if (Math.abs(t.WindCnt) != 1) return !1;
					break;
				case e.PolyFillType.pftPositive:
					if (t.WindCnt != 1) return !1;
					break;
				default: if (t.WindCnt != -1) return !1;
			}
			switch (this.m_ClipType) {
				case e.ClipType.ctIntersection: switch (r) {
					case e.PolyFillType.pftEvenOdd:
					case e.PolyFillType.pftNonZero: return t.WindCnt2 !== 0;
					case e.PolyFillType.pftPositive: return t.WindCnt2 > 0;
					default: return t.WindCnt2 < 0;
				}
				case e.ClipType.ctUnion: switch (r) {
					case e.PolyFillType.pftEvenOdd:
					case e.PolyFillType.pftNonZero: return t.WindCnt2 === 0;
					case e.PolyFillType.pftPositive: return t.WindCnt2 <= 0;
					default: return t.WindCnt2 >= 0;
				}
				case e.ClipType.ctDifference: if (t.PolyTyp == e.PolyType.ptSubject) switch (r) {
					case e.PolyFillType.pftEvenOdd:
					case e.PolyFillType.pftNonZero: return t.WindCnt2 === 0;
					case e.PolyFillType.pftPositive: return t.WindCnt2 <= 0;
					default: return t.WindCnt2 >= 0;
				}
				else switch (r) {
					case e.PolyFillType.pftEvenOdd:
					case e.PolyFillType.pftNonZero: return t.WindCnt2 !== 0;
					case e.PolyFillType.pftPositive: return t.WindCnt2 > 0;
					default: return t.WindCnt2 < 0;
				}
				case e.ClipType.ctXor: if (t.WindDelta === 0) switch (r) {
					case e.PolyFillType.pftEvenOdd:
					case e.PolyFillType.pftNonZero: return t.WindCnt2 === 0;
					case e.PolyFillType.pftPositive: return t.WindCnt2 <= 0;
					default: return t.WindCnt2 >= 0;
				}
				else return !0;
			}
			return !0;
		}, e.Clipper.prototype.SetWindingCount = function(t) {
			for (var n = t.PrevInAEL; n !== null && (n.PolyTyp != t.PolyTyp || n.WindDelta === 0);) n = n.PrevInAEL;
			if (n === null) t.WindCnt = t.WindDelta === 0 ? 1 : t.WindDelta, t.WindCnt2 = 0, n = this.m_ActiveEdges;
			else if (t.WindDelta === 0 && this.m_ClipType != e.ClipType.ctUnion) t.WindCnt = 1, t.WindCnt2 = n.WindCnt2, n = n.NextInAEL;
			else if (this.IsEvenOddFillType(t)) {
				if (t.WindDelta === 0) {
					for (var r = !0, i = n.PrevInAEL; i !== null;) i.PolyTyp == n.PolyTyp && i.WindDelta !== 0 && (r = !r), i = i.PrevInAEL;
					t.WindCnt = +!r;
				} else t.WindCnt = t.WindDelta;
				t.WindCnt2 = n.WindCnt2, n = n.NextInAEL;
			} else t.WindCnt = n.WindCnt * n.WindDelta < 0 ? Math.abs(n.WindCnt) > 1 ? n.WindDelta * t.WindDelta < 0 ? n.WindCnt : n.WindCnt + t.WindDelta : t.WindDelta === 0 ? 1 : t.WindDelta : t.WindDelta === 0 ? n.WindCnt < 0 ? n.WindCnt - 1 : n.WindCnt + 1 : n.WindDelta * t.WindDelta < 0 ? n.WindCnt : n.WindCnt + t.WindDelta, t.WindCnt2 = n.WindCnt2, n = n.NextInAEL;
			if (this.IsEvenOddAltFillType(t)) for (; n != t;) n.WindDelta !== 0 && (t.WindCnt2 = +(t.WindCnt2 === 0)), n = n.NextInAEL;
			else for (; n != t;) t.WindCnt2 += n.WindDelta, n = n.NextInAEL;
		}, e.Clipper.prototype.AddEdgeToSEL = function(e) {
			this.m_SortedEdges === null ? (this.m_SortedEdges = e, e.PrevInSEL = null, e.NextInSEL = null) : (e.NextInSEL = this.m_SortedEdges, e.PrevInSEL = null, this.m_SortedEdges.PrevInSEL = e, this.m_SortedEdges = e);
		}, e.Clipper.prototype.CopyAELToSEL = function() {
			var e = this.m_ActiveEdges;
			for (this.m_SortedEdges = e; e !== null;) e.PrevInSEL = e.PrevInAEL, e.NextInSEL = e.NextInAEL, e = e.NextInAEL;
		}, e.Clipper.prototype.SwapPositionsInAEL = function(e, t) {
			if (e.NextInAEL != e.PrevInAEL && t.NextInAEL != t.PrevInAEL) {
				if (e.NextInAEL == t) {
					var n = t.NextInAEL;
					n !== null && (n.PrevInAEL = e);
					var r = e.PrevInAEL;
					r !== null && (r.NextInAEL = t), t.PrevInAEL = r, t.NextInAEL = e, e.PrevInAEL = t, e.NextInAEL = n;
				} else if (t.NextInAEL == e) {
					var n = e.NextInAEL;
					n !== null && (n.PrevInAEL = t);
					var r = t.PrevInAEL;
					r !== null && (r.NextInAEL = e), e.PrevInAEL = r, e.NextInAEL = t, t.PrevInAEL = e, t.NextInAEL = n;
				} else {
					var n = e.NextInAEL, r = e.PrevInAEL;
					e.NextInAEL = t.NextInAEL, e.NextInAEL !== null && (e.NextInAEL.PrevInAEL = e), e.PrevInAEL = t.PrevInAEL, e.PrevInAEL !== null && (e.PrevInAEL.NextInAEL = e), t.NextInAEL = n, t.NextInAEL !== null && (t.NextInAEL.PrevInAEL = t), t.PrevInAEL = r, t.PrevInAEL !== null && (t.PrevInAEL.NextInAEL = t);
				}
				e.PrevInAEL === null ? this.m_ActiveEdges = e : t.PrevInAEL === null && (this.m_ActiveEdges = t);
			}
		}, e.Clipper.prototype.SwapPositionsInSEL = function(e, t) {
			if ((e.NextInSEL !== null || e.PrevInSEL !== null) && (t.NextInSEL !== null || t.PrevInSEL !== null)) {
				if (e.NextInSEL == t) {
					var n = t.NextInSEL;
					n !== null && (n.PrevInSEL = e);
					var r = e.PrevInSEL;
					r !== null && (r.NextInSEL = t), t.PrevInSEL = r, t.NextInSEL = e, e.PrevInSEL = t, e.NextInSEL = n;
				} else if (t.NextInSEL == e) {
					var n = e.NextInSEL;
					n !== null && (n.PrevInSEL = t);
					var r = t.PrevInSEL;
					r !== null && (r.NextInSEL = e), e.PrevInSEL = r, e.NextInSEL = t, t.PrevInSEL = e, t.NextInSEL = n;
				} else {
					var n = e.NextInSEL, r = e.PrevInSEL;
					e.NextInSEL = t.NextInSEL, e.NextInSEL !== null && (e.NextInSEL.PrevInSEL = e), e.PrevInSEL = t.PrevInSEL, e.PrevInSEL !== null && (e.PrevInSEL.NextInSEL = e), t.NextInSEL = n, t.NextInSEL !== null && (t.NextInSEL.PrevInSEL = t), t.PrevInSEL = r, t.PrevInSEL !== null && (t.PrevInSEL.NextInSEL = t);
				}
				e.PrevInSEL === null ? this.m_SortedEdges = e : t.PrevInSEL === null && (this.m_SortedEdges = t);
			}
		}, e.Clipper.prototype.AddLocalMaxPoly = function(e, t, n) {
			this.AddOutPt(e, n), t.WindDelta == 0 && this.AddOutPt(t, n), e.OutIdx == t.OutIdx ? (e.OutIdx = -1, t.OutIdx = -1) : e.OutIdx < t.OutIdx ? this.AppendPolygon(e, t) : this.AppendPolygon(t, e);
		}, e.Clipper.prototype.AddLocalMinPoly = function(t, n, r) {
			var i, a, o;
			if (e.ClipperBase.IsHorizontal(n) || t.Dx > n.Dx ? (i = this.AddOutPt(t, r), n.OutIdx = t.OutIdx, t.Side = e.EdgeSide.esLeft, n.Side = e.EdgeSide.esRight, a = t, o = a.PrevInAEL == n ? n.PrevInAEL : a.PrevInAEL) : (i = this.AddOutPt(n, r), t.OutIdx = n.OutIdx, t.Side = e.EdgeSide.esRight, n.Side = e.EdgeSide.esLeft, a = n, o = a.PrevInAEL == t ? t.PrevInAEL : a.PrevInAEL), o !== null && o.OutIdx >= 0 && e.Clipper.TopX(o, r.Y) == e.Clipper.TopX(a, r.Y) && e.ClipperBase.SlopesEqual(a, o, this.m_UseFullRange) && a.WindDelta !== 0 && o.WindDelta !== 0) {
				var s = this.AddOutPt(o, r);
				this.AddJoin(i, s, a.Top);
			}
			return i;
		}, e.Clipper.prototype.CreateOutRec = function() {
			var t = new e.OutRec();
			return t.Idx = -1, t.IsHole = !1, t.IsOpen = !1, t.FirstLeft = null, t.Pts = null, t.BottomPt = null, t.PolyNode = null, this.m_PolyOuts.push(t), t.Idx = this.m_PolyOuts.length - 1, t;
		}, e.Clipper.prototype.AddOutPt = function(t, n) {
			var r = t.Side == e.EdgeSide.esLeft;
			if (t.OutIdx < 0) {
				var i = this.CreateOutRec();
				i.IsOpen = t.WindDelta === 0;
				var a = new e.OutPt();
				return i.Pts = a, a.Idx = i.Idx, a.Pt.X = n.X, a.Pt.Y = n.Y, a.Next = a, a.Prev = a, i.IsOpen || this.SetHoleState(t, i), t.OutIdx = i.Idx, a;
			}
			var i = this.m_PolyOuts[t.OutIdx], o = i.Pts;
			if (r && e.IntPoint.op_Equality(n, o.Pt)) return o;
			if (!r && e.IntPoint.op_Equality(n, o.Prev.Pt)) return o.Prev;
			var a = new e.OutPt();
			return a.Idx = i.Idx, a.Pt.X = n.X, a.Pt.Y = n.Y, a.Next = o, a.Prev = o.Prev, a.Prev.Next = a, o.Prev = a, r && (i.Pts = a), a;
		}, e.Clipper.prototype.SwapPoints = function(t, n) {
			var r = new e.IntPoint(t.Value);
			t.Value.X = n.Value.X, t.Value.Y = n.Value.Y, n.Value.X = r.X, n.Value.Y = r.Y;
		}, e.Clipper.prototype.HorzSegmentsOverlap = function(e, t, n, r) {
			return e.X > n.X == e.X < r.X || t.X > n.X == t.X < r.X || n.X > e.X == n.X < t.X || r.X > e.X == r.X < t.X || e.X == n.X && t.X == r.X || e.X == r.X && t.X == n.X;
		}, e.Clipper.prototype.InsertPolyPtBetween = function(t, n, r) {
			var i = new e.OutPt();
			return i.Pt.X = r.X, i.Pt.Y = r.Y, n == t.Next ? (t.Next = i, n.Prev = i, i.Next = n, i.Prev = t) : (n.Next = i, t.Prev = i, i.Next = t, i.Prev = n), i;
		}, e.Clipper.prototype.SetHoleState = function(e, t) {
			for (var n = !1, r = e.PrevInAEL; r !== null;) r.OutIdx >= 0 && r.WindDelta != 0 && (n = !n, t.FirstLeft === null && (t.FirstLeft = this.m_PolyOuts[r.OutIdx])), r = r.PrevInAEL;
			n && (t.IsHole = !0);
		}, e.Clipper.prototype.GetDx = function(t, n) {
			return t.Y == n.Y ? e.ClipperBase.horizontal : (n.X - t.X) / (n.Y - t.Y);
		}, e.Clipper.prototype.FirstIsBottomPt = function(t, n) {
			for (var r = t.Prev; e.IntPoint.op_Equality(r.Pt, t.Pt) && r != t;) r = r.Prev;
			var i = Math.abs(this.GetDx(t.Pt, r.Pt));
			for (r = t.Next; e.IntPoint.op_Equality(r.Pt, t.Pt) && r != t;) r = r.Next;
			var a = Math.abs(this.GetDx(t.Pt, r.Pt));
			for (r = n.Prev; e.IntPoint.op_Equality(r.Pt, n.Pt) && r != n;) r = r.Prev;
			var o = Math.abs(this.GetDx(n.Pt, r.Pt));
			for (r = n.Next; e.IntPoint.op_Equality(r.Pt, n.Pt) && r != n;) r = r.Next;
			var s = Math.abs(this.GetDx(n.Pt, r.Pt));
			return i >= o && i >= s || a >= o && a >= s;
		}, e.Clipper.prototype.GetBottomPt = function(t) {
			for (var n = null, r = t.Next; r != t;) r.Pt.Y > t.Pt.Y ? (t = r, n = null) : r.Pt.Y == t.Pt.Y && r.Pt.X <= t.Pt.X && (r.Pt.X < t.Pt.X ? (n = null, t = r) : r.Next != t && r.Prev != t && (n = r)), r = r.Next;
			if (n !== null) for (; n != r;) for (this.FirstIsBottomPt(r, n) || (t = n), n = n.Next; e.IntPoint.op_Inequality(n.Pt, t.Pt);) n = n.Next;
			return t;
		}, e.Clipper.prototype.GetLowermostRec = function(e, t) {
			e.BottomPt === null && (e.BottomPt = this.GetBottomPt(e.Pts)), t.BottomPt === null && (t.BottomPt = this.GetBottomPt(t.Pts));
			var n = e.BottomPt, r = t.BottomPt;
			return n.Pt.Y > r.Pt.Y ? e : n.Pt.Y < r.Pt.Y ? t : n.Pt.X < r.Pt.X ? e : n.Pt.X > r.Pt.X || n.Next == n ? t : r.Next == r || this.FirstIsBottomPt(n, r) ? e : t;
		}, e.Clipper.prototype.Param1RightOfParam2 = function(e, t) {
			do
				if (e = e.FirstLeft, e == t) return !0;
			while (e !== null);
			return !1;
		}, e.Clipper.prototype.GetOutRec = function(e) {
			for (var t = this.m_PolyOuts[e]; t != this.m_PolyOuts[t.Idx];) t = this.m_PolyOuts[t.Idx];
			return t;
		}, e.Clipper.prototype.AppendPolygon = function(t, n) {
			var r = this.m_PolyOuts[t.OutIdx], i = this.m_PolyOuts[n.OutIdx], a = this.Param1RightOfParam2(r, i) ? i : this.Param1RightOfParam2(i, r) ? r : this.GetLowermostRec(r, i), o = r.Pts, s = o.Prev, c = i.Pts, l = c.Prev, u;
			t.Side == e.EdgeSide.esLeft ? (n.Side == e.EdgeSide.esLeft ? (this.ReversePolyPtLinks(c), c.Next = o, o.Prev = c, s.Next = l, l.Prev = s, r.Pts = l) : (l.Next = o, o.Prev = l, c.Prev = s, s.Next = c, r.Pts = c), u = e.EdgeSide.esLeft) : (n.Side == e.EdgeSide.esRight ? (this.ReversePolyPtLinks(c), s.Next = l, l.Prev = s, c.Next = o, o.Prev = c) : (s.Next = c, c.Prev = s, o.Prev = l, l.Next = o), u = e.EdgeSide.esRight), r.BottomPt = null, a == i && (i.FirstLeft != r && (r.FirstLeft = i.FirstLeft), r.IsHole = i.IsHole), i.Pts = null, i.BottomPt = null, i.FirstLeft = r;
			var d = t.OutIdx, f = n.OutIdx;
			t.OutIdx = -1, n.OutIdx = -1;
			for (var p = this.m_ActiveEdges; p !== null;) {
				if (p.OutIdx == f) {
					p.OutIdx = d, p.Side = u;
					break;
				}
				p = p.NextInAEL;
			}
			i.Idx = r.Idx;
		}, e.Clipper.prototype.ReversePolyPtLinks = function(e) {
			if (e !== null) {
				var t = e, n;
				do
					n = t.Next, t.Next = t.Prev, t.Prev = n, t = n;
				while (t != e);
			}
		}, e.Clipper.SwapSides = function(e, t) {
			var n = e.Side;
			e.Side = t.Side, t.Side = n;
		}, e.Clipper.SwapPolyIndexes = function(e, t) {
			var n = e.OutIdx;
			e.OutIdx = t.OutIdx, t.OutIdx = n;
		}, e.Clipper.prototype.IntersectEdges = function(t, n, r, i) {
			var a = !i && t.NextInLML === null && t.Top.X == r.X && t.Top.Y == r.Y, o = !i && n.NextInLML === null && n.Top.X == r.X && n.Top.Y == r.Y, s = t.OutIdx >= 0, c = n.OutIdx >= 0;
			if (t.WindDelta === 0 || n.WindDelta === 0) {
				t.WindDelta === 0 && n.WindDelta === 0 ? (a || o) && s && c && this.AddLocalMaxPoly(t, n, r) : t.PolyTyp == n.PolyTyp && t.WindDelta != n.WindDelta && this.m_ClipType == e.ClipType.ctUnion ? t.WindDelta === 0 ? c && (this.AddOutPt(t, r), s && (t.OutIdx = -1)) : s && (this.AddOutPt(n, r), c && (n.OutIdx = -1)) : t.PolyTyp != n.PolyTyp && (t.WindDelta === 0 && Math.abs(n.WindCnt) == 1 && (this.m_ClipType != e.ClipType.ctUnion || n.WindCnt2 === 0) ? (this.AddOutPt(t, r), s && (t.OutIdx = -1)) : n.WindDelta === 0 && Math.abs(t.WindCnt) == 1 && (this.m_ClipType != e.ClipType.ctUnion || t.WindCnt2 === 0) && (this.AddOutPt(n, r), c && (n.OutIdx = -1))), a && (t.OutIdx < 0 ? this.DeleteFromAEL(t) : e.Error("Error intersecting polylines")), o && (n.OutIdx < 0 ? this.DeleteFromAEL(n) : e.Error("Error intersecting polylines"));
				return;
			}
			if (t.PolyTyp == n.PolyTyp) {
				if (this.IsEvenOddFillType(t)) {
					var l = t.WindCnt;
					t.WindCnt = n.WindCnt, n.WindCnt = l;
				} else t.WindCnt + n.WindDelta === 0 ? t.WindCnt = -t.WindCnt : t.WindCnt += n.WindDelta, n.WindCnt - t.WindDelta === 0 ? n.WindCnt = -n.WindCnt : n.WindCnt -= t.WindDelta;
			} else this.IsEvenOddFillType(n) ? t.WindCnt2 = +(t.WindCnt2 === 0) : t.WindCnt2 += n.WindDelta, this.IsEvenOddFillType(t) ? n.WindCnt2 = +(n.WindCnt2 === 0) : n.WindCnt2 -= t.WindDelta;
			var u, d, f, p;
			t.PolyTyp == e.PolyType.ptSubject ? (u = this.m_SubjFillType, f = this.m_ClipFillType) : (u = this.m_ClipFillType, f = this.m_SubjFillType), n.PolyTyp == e.PolyType.ptSubject ? (d = this.m_SubjFillType, p = this.m_ClipFillType) : (d = this.m_ClipFillType, p = this.m_SubjFillType);
			var m, h;
			switch (u) {
				case e.PolyFillType.pftPositive:
					m = t.WindCnt;
					break;
				case e.PolyFillType.pftNegative:
					m = -t.WindCnt;
					break;
				default: m = Math.abs(t.WindCnt);
			}
			switch (d) {
				case e.PolyFillType.pftPositive:
					h = n.WindCnt;
					break;
				case e.PolyFillType.pftNegative:
					h = -n.WindCnt;
					break;
				default: h = Math.abs(n.WindCnt);
			}
			if (s && c) a || o || m !== 0 && m != 1 || h !== 0 && h != 1 || t.PolyTyp != n.PolyTyp && this.m_ClipType != e.ClipType.ctXor ? this.AddLocalMaxPoly(t, n, r) : (this.AddOutPt(t, r), this.AddOutPt(n, r), e.Clipper.SwapSides(t, n), e.Clipper.SwapPolyIndexes(t, n));
			else if (s) (h === 0 || h == 1) && (this.AddOutPt(t, r), e.Clipper.SwapSides(t, n), e.Clipper.SwapPolyIndexes(t, n));
			else if (c) (m === 0 || m == 1) && (this.AddOutPt(n, r), e.Clipper.SwapSides(t, n), e.Clipper.SwapPolyIndexes(t, n));
			else if ((m === 0 || m == 1) && (h === 0 || h == 1) && !a && !o) {
				var g, _;
				switch (f) {
					case e.PolyFillType.pftPositive:
						g = t.WindCnt2;
						break;
					case e.PolyFillType.pftNegative:
						g = -t.WindCnt2;
						break;
					default: g = Math.abs(t.WindCnt2);
				}
				switch (p) {
					case e.PolyFillType.pftPositive:
						_ = n.WindCnt2;
						break;
					case e.PolyFillType.pftNegative:
						_ = -n.WindCnt2;
						break;
					default: _ = Math.abs(n.WindCnt2);
				}
				if (t.PolyTyp != n.PolyTyp) this.AddLocalMinPoly(t, n, r);
				else if (m == 1 && h == 1) switch (this.m_ClipType) {
					case e.ClipType.ctIntersection:
						g > 0 && _ > 0 && this.AddLocalMinPoly(t, n, r);
						break;
					case e.ClipType.ctUnion:
						g <= 0 && _ <= 0 && this.AddLocalMinPoly(t, n, r);
						break;
					case e.ClipType.ctDifference:
						(t.PolyTyp == e.PolyType.ptClip && g > 0 && _ > 0 || t.PolyTyp == e.PolyType.ptSubject && g <= 0 && _ <= 0) && this.AddLocalMinPoly(t, n, r);
						break;
					case e.ClipType.ctXor:
						this.AddLocalMinPoly(t, n, r);
						break;
				}
				else e.Clipper.SwapSides(t, n);
			}
			a != o && (a && t.OutIdx >= 0 || o && n.OutIdx >= 0) && (e.Clipper.SwapSides(t, n), e.Clipper.SwapPolyIndexes(t, n)), a && this.DeleteFromAEL(t), o && this.DeleteFromAEL(n);
		}, e.Clipper.prototype.DeleteFromAEL = function(e) {
			var t = e.PrevInAEL, n = e.NextInAEL;
			(t !== null || n !== null || e == this.m_ActiveEdges) && (t === null ? this.m_ActiveEdges = n : t.NextInAEL = n, n !== null && (n.PrevInAEL = t), e.NextInAEL = null, e.PrevInAEL = null);
		}, e.Clipper.prototype.DeleteFromSEL = function(e) {
			var t = e.PrevInSEL, n = e.NextInSEL;
			(t !== null || n !== null || e == this.m_SortedEdges) && (t === null ? this.m_SortedEdges = n : t.NextInSEL = n, n !== null && (n.PrevInSEL = t), e.NextInSEL = null, e.PrevInSEL = null);
		}, e.Clipper.prototype.UpdateEdgeIntoAEL = function(t) {
			t.NextInLML === null && e.Error("UpdateEdgeIntoAEL: invalid call");
			var n = t.PrevInAEL, r = t.NextInAEL;
			return t.NextInLML.OutIdx = t.OutIdx, n === null ? this.m_ActiveEdges = t.NextInLML : n.NextInAEL = t.NextInLML, r !== null && (r.PrevInAEL = t.NextInLML), t.NextInLML.Side = t.Side, t.NextInLML.WindDelta = t.WindDelta, t.NextInLML.WindCnt = t.WindCnt, t.NextInLML.WindCnt2 = t.WindCnt2, t = t.NextInLML, t.Curr.X = t.Bot.X, t.Curr.Y = t.Bot.Y, t.PrevInAEL = n, t.NextInAEL = r, e.ClipperBase.IsHorizontal(t) || this.InsertScanbeam(t.Top.Y), t;
		}, e.Clipper.prototype.ProcessHorizontals = function(e) {
			for (var t = this.m_SortedEdges; t !== null;) this.DeleteFromSEL(t), this.ProcessHorizontal(t, e), t = this.m_SortedEdges;
		}, e.Clipper.prototype.GetHorzDirection = function(t, n) {
			t.Bot.X < t.Top.X ? (n.Left = t.Bot.X, n.Right = t.Top.X, n.Dir = e.Direction.dLeftToRight) : (n.Left = t.Top.X, n.Right = t.Bot.X, n.Dir = e.Direction.dRightToLeft);
		}, e.Clipper.prototype.PrepareHorzJoins = function(t, n) {
			var r = this.m_PolyOuts[t.OutIdx].Pts;
			t.Side != e.EdgeSide.esLeft && (r = r.Prev), n && (e.IntPoint.op_Equality(r.Pt, t.Top) ? this.AddGhostJoin(r, t.Bot) : this.AddGhostJoin(r, t.Top));
		}, e.Clipper.prototype.ProcessHorizontal = function(t, n) {
			var r = {
				Dir: null,
				Left: null,
				Right: null
			};
			this.GetHorzDirection(t, r);
			for (var i = r.Dir, a = r.Left, o = r.Right, s = t, c = null; s.NextInLML !== null && e.ClipperBase.IsHorizontal(s.NextInLML);) s = s.NextInLML;
			for (s.NextInLML === null && (c = this.GetMaximaPair(s));;) {
				for (var l = t == s, u = this.GetNextInAEL(t, i); u !== null && !(u.Curr.X == t.Top.X && t.NextInLML !== null && u.Dx < t.NextInLML.Dx);) {
					var d = this.GetNextInAEL(u, i);
					if (i == e.Direction.dLeftToRight && u.Curr.X <= o || i == e.Direction.dRightToLeft && u.Curr.X >= a) {
						if (t.OutIdx >= 0 && t.WindDelta != 0 && this.PrepareHorzJoins(t, n), u == c && l) {
							i == e.Direction.dLeftToRight ? this.IntersectEdges(t, u, u.Top, !1) : this.IntersectEdges(u, t, u.Top, !1), c.OutIdx >= 0 && e.Error("ProcessHorizontal error");
							return;
						}
						if (i == e.Direction.dLeftToRight) {
							var f = new e.IntPoint(u.Curr.X, t.Curr.Y);
							this.IntersectEdges(t, u, f, !0);
						} else {
							var f = new e.IntPoint(u.Curr.X, t.Curr.Y);
							this.IntersectEdges(u, t, f, !0);
						}
						this.SwapPositionsInAEL(t, u);
					} else if (i == e.Direction.dLeftToRight && u.Curr.X >= o || i == e.Direction.dRightToLeft && u.Curr.X <= a) break;
					u = d;
				}
				if (t.OutIdx >= 0 && t.WindDelta !== 0 && this.PrepareHorzJoins(t, n), t.NextInLML !== null && e.ClipperBase.IsHorizontal(t.NextInLML)) {
					t = this.UpdateEdgeIntoAEL(t), t.OutIdx >= 0 && this.AddOutPt(t, t.Bot);
					var r = {
						Dir: i,
						Left: a,
						Right: o
					};
					this.GetHorzDirection(t, r), i = r.Dir, a = r.Left, o = r.Right;
				} else break;
			}
			if (t.NextInLML !== null) {
				if (t.OutIdx >= 0) {
					var p = this.AddOutPt(t, t.Top);
					if (t = this.UpdateEdgeIntoAEL(t), t.WindDelta === 0) return;
					var m = t.PrevInAEL, d = t.NextInAEL;
					if (m !== null && m.Curr.X == t.Bot.X && m.Curr.Y == t.Bot.Y && m.WindDelta !== 0 && m.OutIdx >= 0 && m.Curr.Y > m.Top.Y && e.ClipperBase.SlopesEqual(t, m, this.m_UseFullRange)) {
						var h = this.AddOutPt(m, t.Bot);
						this.AddJoin(p, h, t.Top);
					} else if (d !== null && d.Curr.X == t.Bot.X && d.Curr.Y == t.Bot.Y && d.WindDelta !== 0 && d.OutIdx >= 0 && d.Curr.Y > d.Top.Y && e.ClipperBase.SlopesEqual(t, d, this.m_UseFullRange)) {
						var h = this.AddOutPt(d, t.Bot);
						this.AddJoin(p, h, t.Top);
					}
				} else t = this.UpdateEdgeIntoAEL(t);
			} else c === null ? (t.OutIdx >= 0 && this.AddOutPt(t, t.Top), this.DeleteFromAEL(t)) : c.OutIdx >= 0 ? (i == e.Direction.dLeftToRight ? this.IntersectEdges(t, c, t.Top, !1) : this.IntersectEdges(c, t, t.Top, !1), c.OutIdx >= 0 && e.Error("ProcessHorizontal error")) : (this.DeleteFromAEL(t), this.DeleteFromAEL(c));
		}, e.Clipper.prototype.GetNextInAEL = function(t, n) {
			return n == e.Direction.dLeftToRight ? t.NextInAEL : t.PrevInAEL;
		}, e.Clipper.prototype.IsMinima = function(e) {
			return e !== null && e.Prev.NextInLML != e && e.Next.NextInLML != e;
		}, e.Clipper.prototype.IsMaxima = function(e, t) {
			return e !== null && e.Top.Y == t && e.NextInLML === null;
		}, e.Clipper.prototype.IsIntermediate = function(e, t) {
			return e.Top.Y == t && e.NextInLML !== null;
		}, e.Clipper.prototype.GetMaximaPair = function(t) {
			var n = null;
			return e.IntPoint.op_Equality(t.Next.Top, t.Top) && t.Next.NextInLML === null ? n = t.Next : e.IntPoint.op_Equality(t.Prev.Top, t.Top) && t.Prev.NextInLML === null && (n = t.Prev), n !== null && (n.OutIdx == -2 || n.NextInAEL == n.PrevInAEL && !e.ClipperBase.IsHorizontal(n)) ? null : n;
		}, e.Clipper.prototype.ProcessIntersections = function(t, n) {
			if (this.m_ActiveEdges == null) return !0;
			try {
				if (this.BuildIntersectList(t, n), this.m_IntersectList.length == 0) return !0;
				if (this.m_IntersectList.length == 1 || this.FixupIntersectionOrder()) this.ProcessIntersectList();
				else return !1;
			} catch {
				this.m_SortedEdges = null, this.m_IntersectList.length = 0, e.Error("ProcessIntersections error");
			}
			return this.m_SortedEdges = null, !0;
		}, e.Clipper.prototype.BuildIntersectList = function(t, n) {
			if (this.m_ActiveEdges !== null) {
				var r = this.m_ActiveEdges;
				for (this.m_SortedEdges = r; r !== null;) r.PrevInSEL = r.PrevInAEL, r.NextInSEL = r.NextInAEL, r.Curr.X = e.Clipper.TopX(r, n), r = r.NextInAEL;
				for (var i = !0; i && this.m_SortedEdges !== null;) {
					for (i = !1, r = this.m_SortedEdges; r.NextInSEL !== null;) {
						var a = r.NextInSEL, o = new e.IntPoint();
						if (r.Curr.X > a.Curr.X) {
							!this.IntersectPoint(r, a, o) && r.Curr.X > a.Curr.X + 1 && e.Error("Intersection error"), o.Y > t && (o.Y = t, o.X = Math.abs(r.Dx) > Math.abs(a.Dx) ? e.Clipper.TopX(a, t) : e.Clipper.TopX(r, t));
							var s = new e.IntersectNode();
							s.Edge1 = r, s.Edge2 = a, s.Pt.X = o.X, s.Pt.Y = o.Y, this.m_IntersectList.push(s), this.SwapPositionsInSEL(r, a), i = !0;
						} else r = a;
					}
					if (r.PrevInSEL !== null) r.PrevInSEL.NextInSEL = null;
					else break;
				}
				this.m_SortedEdges = null;
			}
		}, e.Clipper.prototype.EdgesAdjacent = function(e) {
			return e.Edge1.NextInSEL == e.Edge2 || e.Edge1.PrevInSEL == e.Edge2;
		}, e.Clipper.IntersectNodeSort = function(e, t) {
			return t.Pt.Y - e.Pt.Y;
		}, e.Clipper.prototype.FixupIntersectionOrder = function() {
			this.m_IntersectList.sort(this.m_IntersectNodeComparer), this.CopyAELToSEL();
			for (var e = this.m_IntersectList.length, t = 0; t < e; t++) {
				if (!this.EdgesAdjacent(this.m_IntersectList[t])) {
					for (var n = t + 1; n < e && !this.EdgesAdjacent(this.m_IntersectList[n]);) n++;
					if (n == e) return !1;
					var r = this.m_IntersectList[t];
					this.m_IntersectList[t] = this.m_IntersectList[n], this.m_IntersectList[n] = r;
				}
				this.SwapPositionsInSEL(this.m_IntersectList[t].Edge1, this.m_IntersectList[t].Edge2);
			}
			return !0;
		}, e.Clipper.prototype.ProcessIntersectList = function() {
			for (var e = 0, t = this.m_IntersectList.length; e < t; e++) {
				var n = this.m_IntersectList[e];
				this.IntersectEdges(n.Edge1, n.Edge2, n.Pt, !0), this.SwapPositionsInAEL(n.Edge1, n.Edge2);
			}
			this.m_IntersectList.length = 0;
		};
		var St = function(e) {
			return e < 0 ? Math.ceil(e - .5) : Math.round(e);
		}, Ct = function(e) {
			return e < 0 ? Math.ceil(e - .5) : Math.floor(e + .5);
		}, wt = function(e) {
			return e < 0 ? -Math.round(Math.abs(e)) : Math.round(e);
		}, Tt = function(e) {
			return e < 0 ? (e -= .5, e < -2147483648 ? Math.ceil(e) : e | 0) : (e += .5, e > 2147483647 ? Math.floor(e) : e | 0);
		};
		a.msie ? e.Clipper.Round = St : a.chromium ? e.Clipper.Round = wt : a.safari ? e.Clipper.Round = Tt : e.Clipper.Round = Ct, e.Clipper.TopX = function(t, n) {
			return n == t.Top.Y ? t.Top.X : t.Bot.X + e.Clipper.Round(t.Dx * (n - t.Bot.Y));
		}, e.Clipper.prototype.IntersectPoint = function(t, n, r) {
			r.X = 0, r.Y = 0;
			var i, a;
			if (e.ClipperBase.SlopesEqual(t, n, this.m_UseFullRange) || t.Dx == n.Dx) return n.Bot.Y > t.Bot.Y ? (r.X = n.Bot.X, r.Y = n.Bot.Y) : (r.X = t.Bot.X, r.Y = t.Bot.Y), !1;
			if (t.Delta.X === 0) r.X = t.Bot.X, e.ClipperBase.IsHorizontal(n) ? r.Y = n.Bot.Y : (a = n.Bot.Y - n.Bot.X / n.Dx, r.Y = e.Clipper.Round(r.X / n.Dx + a));
			else if (n.Delta.X === 0) r.X = n.Bot.X, e.ClipperBase.IsHorizontal(t) ? r.Y = t.Bot.Y : (i = t.Bot.Y - t.Bot.X / t.Dx, r.Y = e.Clipper.Round(r.X / t.Dx + i));
			else {
				i = t.Bot.X - t.Bot.Y * t.Dx, a = n.Bot.X - n.Bot.Y * n.Dx;
				var o = (a - i) / (t.Dx - n.Dx);
				r.Y = e.Clipper.Round(o), r.X = Math.abs(t.Dx) < Math.abs(n.Dx) ? e.Clipper.Round(t.Dx * o + i) : e.Clipper.Round(n.Dx * o + a);
			}
			if (r.Y < t.Top.Y || r.Y < n.Top.Y) {
				if (t.Top.Y > n.Top.Y) return r.Y = t.Top.Y, r.X = e.Clipper.TopX(n, t.Top.Y), r.X < t.Top.X;
				r.Y = n.Top.Y, r.X = Math.abs(t.Dx) < Math.abs(n.Dx) ? e.Clipper.TopX(t, r.Y) : e.Clipper.TopX(n, r.Y);
			}
			return !0;
		}, e.Clipper.prototype.ProcessEdgesAtTopOfScanbeam = function(t) {
			for (var n = this.m_ActiveEdges; n !== null;) {
				var r = this.IsMaxima(n, t);
				if (r) {
					var i = this.GetMaximaPair(n);
					r = i === null || !e.ClipperBase.IsHorizontal(i);
				}
				if (r) {
					var a = n.PrevInAEL;
					this.DoMaxima(n), n = a === null ? this.m_ActiveEdges : a.NextInAEL;
				} else {
					if (this.IsIntermediate(n, t) && e.ClipperBase.IsHorizontal(n.NextInLML) ? (n = this.UpdateEdgeIntoAEL(n), n.OutIdx >= 0 && this.AddOutPt(n, n.Bot), this.AddEdgeToSEL(n)) : (n.Curr.X = e.Clipper.TopX(n, t), n.Curr.Y = t), this.StrictlySimple) {
						var a = n.PrevInAEL;
						if (n.OutIdx >= 0 && n.WindDelta !== 0 && a !== null && a.OutIdx >= 0 && a.Curr.X == n.Curr.X && a.WindDelta !== 0) {
							var o = this.AddOutPt(a, n.Curr), s = this.AddOutPt(n, n.Curr);
							this.AddJoin(o, s, n.Curr);
						}
					}
					n = n.NextInAEL;
				}
			}
			for (this.ProcessHorizontals(!0), n = this.m_ActiveEdges; n !== null;) {
				if (this.IsIntermediate(n, t)) {
					var o = null;
					n.OutIdx >= 0 && (o = this.AddOutPt(n, n.Top)), n = this.UpdateEdgeIntoAEL(n);
					var a = n.PrevInAEL, c = n.NextInAEL;
					if (a !== null && a.Curr.X == n.Bot.X && a.Curr.Y == n.Bot.Y && o !== null && a.OutIdx >= 0 && a.Curr.Y > a.Top.Y && e.ClipperBase.SlopesEqual(n, a, this.m_UseFullRange) && n.WindDelta !== 0 && a.WindDelta !== 0) {
						var s = this.AddOutPt(a, n.Bot);
						this.AddJoin(o, s, n.Top);
					} else if (c !== null && c.Curr.X == n.Bot.X && c.Curr.Y == n.Bot.Y && o !== null && c.OutIdx >= 0 && c.Curr.Y > c.Top.Y && e.ClipperBase.SlopesEqual(n, c, this.m_UseFullRange) && n.WindDelta !== 0 && c.WindDelta !== 0) {
						var s = this.AddOutPt(c, n.Bot);
						this.AddJoin(o, s, n.Top);
					}
				}
				n = n.NextInAEL;
			}
		}, e.Clipper.prototype.DoMaxima = function(t) {
			var n = this.GetMaximaPair(t);
			if (n === null) {
				t.OutIdx >= 0 && this.AddOutPt(t, t.Top), this.DeleteFromAEL(t);
				return;
			}
			for (var r = t.NextInAEL, i = !0; r !== null && r != n;) this.IntersectEdges(t, r, t.Top, !0), this.SwapPositionsInAEL(t, r), r = t.NextInAEL;
			t.OutIdx == -1 && n.OutIdx == -1 ? (this.DeleteFromAEL(t), this.DeleteFromAEL(n)) : t.OutIdx >= 0 && n.OutIdx >= 0 ? this.IntersectEdges(t, n, t.Top, !1) : i && t.WindDelta === 0 ? (t.OutIdx >= 0 && (this.AddOutPt(t, t.Top), t.OutIdx = -1), this.DeleteFromAEL(t), n.OutIdx >= 0 && (this.AddOutPt(n, t.Top), n.OutIdx = -1), this.DeleteFromAEL(n)) : e.Error("DoMaxima error");
		}, e.Clipper.ReversePaths = function(e) {
			for (var t = 0, n = e.length; t < n; t++) e[t].reverse();
		}, e.Clipper.Orientation = function(t) {
			return e.Clipper.Area(t) >= 0;
		}, e.Clipper.prototype.PointCount = function(e) {
			if (e === null) return 0;
			var t = 0, n = e;
			do
				t++, n = n.Next;
			while (n != e);
			return t;
		}, e.Clipper.prototype.BuildResult = function(t) {
			e.Clear(t);
			for (var n = 0, r = this.m_PolyOuts.length; n < r; n++) {
				var i = this.m_PolyOuts[n];
				if (i.Pts !== null) {
					var a = i.Pts.Prev, o = this.PointCount(a);
					if (!(o < 2)) {
						for (var s = Array(o), c = 0; c < o; c++) s[c] = a.Pt, a = a.Prev;
						t.push(s);
					}
				}
			}
		}, e.Clipper.prototype.BuildResult2 = function(t) {
			t.Clear();
			for (var n = 0, r = this.m_PolyOuts.length; n < r; n++) {
				var i = this.m_PolyOuts[n], a = this.PointCount(i.Pts);
				if (!(i.IsOpen && a < 2 || !i.IsOpen && a < 3)) {
					this.FixHoleLinkage(i);
					var o = new e.PolyNode();
					t.m_AllPolys.push(o), i.PolyNode = o, o.m_polygon.length = a;
					for (var s = i.Pts.Prev, c = 0; c < a; c++) o.m_polygon[c] = s.Pt, s = s.Prev;
				}
			}
			for (var n = 0, r = this.m_PolyOuts.length; n < r; n++) {
				var i = this.m_PolyOuts[n];
				i.PolyNode !== null && (i.IsOpen ? (i.PolyNode.IsOpen = !0, t.AddChild(i.PolyNode)) : i.FirstLeft !== null && i.FirstLeft.PolyNode != null ? i.FirstLeft.PolyNode.AddChild(i.PolyNode) : t.AddChild(i.PolyNode));
			}
		}, e.Clipper.prototype.FixupOutPolygon = function(t) {
			var n = null;
			t.BottomPt = null;
			for (var r = t.Pts;;) {
				if (r.Prev == r || r.Prev == r.Next) {
					this.DisposeOutPts(r), t.Pts = null;
					return;
				}
				if (e.IntPoint.op_Equality(r.Pt, r.Next.Pt) || e.IntPoint.op_Equality(r.Pt, r.Prev.Pt) || e.ClipperBase.SlopesEqual(r.Prev.Pt, r.Pt, r.Next.Pt, this.m_UseFullRange) && (!this.PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(r.Prev.Pt, r.Pt, r.Next.Pt))) n = null, r.Prev.Next = r.Next, r.Next.Prev = r.Prev, r = r.Prev;
				else if (r == n) break;
				else n === null && (n = r), r = r.Next;
			}
			t.Pts = r;
		}, e.Clipper.prototype.DupOutPt = function(t, n) {
			var r = new e.OutPt();
			return r.Pt.X = t.Pt.X, r.Pt.Y = t.Pt.Y, r.Idx = t.Idx, n ? (r.Next = t.Next, r.Prev = t, t.Next.Prev = r, t.Next = r) : (r.Prev = t.Prev, r.Next = t, t.Prev.Next = r, t.Prev = r), r;
		}, e.Clipper.prototype.GetOverlap = function(e, t, n, r, i) {
			return e < t ? n < r ? (i.Left = Math.max(e, n), i.Right = Math.min(t, r)) : (i.Left = Math.max(e, r), i.Right = Math.min(t, n)) : n < r ? (i.Left = Math.max(t, n), i.Right = Math.min(e, r)) : (i.Left = Math.max(t, r), i.Right = Math.min(e, n)), i.Left < i.Right;
		}, e.Clipper.prototype.JoinHorz = function(t, n, r, i, a, o) {
			var s = t.Pt.X > n.Pt.X ? e.Direction.dRightToLeft : e.Direction.dLeftToRight, c = r.Pt.X > i.Pt.X ? e.Direction.dRightToLeft : e.Direction.dLeftToRight;
			if (s == c) return !1;
			if (s == e.Direction.dLeftToRight) {
				for (; t.Next.Pt.X <= a.X && t.Next.Pt.X >= t.Pt.X && t.Next.Pt.Y == a.Y;) t = t.Next;
				o && t.Pt.X != a.X && (t = t.Next), n = this.DupOutPt(t, !o), e.IntPoint.op_Inequality(n.Pt, a) && (t = n, t.Pt.X = a.X, t.Pt.Y = a.Y, n = this.DupOutPt(t, !o));
			} else {
				for (; t.Next.Pt.X >= a.X && t.Next.Pt.X <= t.Pt.X && t.Next.Pt.Y == a.Y;) t = t.Next;
				!o && t.Pt.X != a.X && (t = t.Next), n = this.DupOutPt(t, o), e.IntPoint.op_Inequality(n.Pt, a) && (t = n, t.Pt.X = a.X, t.Pt.Y = a.Y, n = this.DupOutPt(t, o));
			}
			if (c == e.Direction.dLeftToRight) {
				for (; r.Next.Pt.X <= a.X && r.Next.Pt.X >= r.Pt.X && r.Next.Pt.Y == a.Y;) r = r.Next;
				o && r.Pt.X != a.X && (r = r.Next), i = this.DupOutPt(r, !o), e.IntPoint.op_Inequality(i.Pt, a) && (r = i, r.Pt.X = a.X, r.Pt.Y = a.Y, i = this.DupOutPt(r, !o));
			} else {
				for (; r.Next.Pt.X >= a.X && r.Next.Pt.X <= r.Pt.X && r.Next.Pt.Y == a.Y;) r = r.Next;
				!o && r.Pt.X != a.X && (r = r.Next), i = this.DupOutPt(r, o), e.IntPoint.op_Inequality(i.Pt, a) && (r = i, r.Pt.X = a.X, r.Pt.Y = a.Y, i = this.DupOutPt(r, o));
			}
			return s == e.Direction.dLeftToRight == o ? (t.Prev = r, r.Next = t, n.Next = i, i.Prev = n) : (t.Next = r, r.Prev = t, n.Prev = i, i.Next = n), !0;
		}, e.Clipper.prototype.JoinPoints = function(t, n, r) {
			var i = t.OutPt1, a = new e.OutPt(), o = t.OutPt2, s = new e.OutPt(), c = t.OutPt1.Pt.Y == t.OffPt.Y;
			if (c && e.IntPoint.op_Equality(t.OffPt, t.OutPt1.Pt) && e.IntPoint.op_Equality(t.OffPt, t.OutPt2.Pt)) {
				for (a = t.OutPt1.Next; a != i && e.IntPoint.op_Equality(a.Pt, t.OffPt);) a = a.Next;
				var l = a.Pt.Y > t.OffPt.Y;
				for (s = t.OutPt2.Next; s != o && e.IntPoint.op_Equality(s.Pt, t.OffPt);) s = s.Next;
				return l == s.Pt.Y > t.OffPt.Y ? !1 : l ? (a = this.DupOutPt(i, !1), s = this.DupOutPt(o, !0), i.Prev = o, o.Next = i, a.Next = s, s.Prev = a, t.OutPt1 = i, t.OutPt2 = a, !0) : (a = this.DupOutPt(i, !0), s = this.DupOutPt(o, !1), i.Next = o, o.Prev = i, a.Prev = s, s.Next = a, t.OutPt1 = i, t.OutPt2 = a, !0);
			}
			if (c) {
				for (a = i; i.Prev.Pt.Y == i.Pt.Y && i.Prev != a && i.Prev != o;) i = i.Prev;
				for (; a.Next.Pt.Y == a.Pt.Y && a.Next != i && a.Next != o;) a = a.Next;
				if (a.Next == i || a.Next == o) return !1;
				for (s = o; o.Prev.Pt.Y == o.Pt.Y && o.Prev != s && o.Prev != a;) o = o.Prev;
				for (; s.Next.Pt.Y == s.Pt.Y && s.Next != o && s.Next != i;) s = s.Next;
				if (s.Next == o || s.Next == i) return !1;
				var u = {
					Left: null,
					Right: null
				};
				if (!this.GetOverlap(i.Pt.X, a.Pt.X, o.Pt.X, s.Pt.X, u)) return !1;
				var d = u.Left, f = u.Right, p = new e.IntPoint(), m;
				return i.Pt.X >= d && i.Pt.X <= f ? (p.X = i.Pt.X, p.Y = i.Pt.Y, m = i.Pt.X > a.Pt.X) : o.Pt.X >= d && o.Pt.X <= f ? (p.X = o.Pt.X, p.Y = o.Pt.Y, m = o.Pt.X > s.Pt.X) : a.Pt.X >= d && a.Pt.X <= f ? (p.X = a.Pt.X, p.Y = a.Pt.Y, m = a.Pt.X > i.Pt.X) : (p.X = s.Pt.X, p.Y = s.Pt.Y, m = s.Pt.X > o.Pt.X), t.OutPt1 = i, t.OutPt2 = o, this.JoinHorz(i, a, o, s, p, m);
			}
			for (a = i.Next; e.IntPoint.op_Equality(a.Pt, i.Pt) && a != i;) a = a.Next;
			var h = a.Pt.Y > i.Pt.Y || !e.ClipperBase.SlopesEqual(i.Pt, a.Pt, t.OffPt, this.m_UseFullRange);
			if (h) {
				for (a = i.Prev; e.IntPoint.op_Equality(a.Pt, i.Pt) && a != i;) a = a.Prev;
				if (a.Pt.Y > i.Pt.Y || !e.ClipperBase.SlopesEqual(i.Pt, a.Pt, t.OffPt, this.m_UseFullRange)) return !1;
			}
			for (s = o.Next; e.IntPoint.op_Equality(s.Pt, o.Pt) && s != o;) s = s.Next;
			var g = s.Pt.Y > o.Pt.Y || !e.ClipperBase.SlopesEqual(o.Pt, s.Pt, t.OffPt, this.m_UseFullRange);
			if (g) {
				for (s = o.Prev; e.IntPoint.op_Equality(s.Pt, o.Pt) && s != o;) s = s.Prev;
				if (s.Pt.Y > o.Pt.Y || !e.ClipperBase.SlopesEqual(o.Pt, s.Pt, t.OffPt, this.m_UseFullRange)) return !1;
			}
			return a == i || s == o || a == s || n == r && h == g ? !1 : h ? (a = this.DupOutPt(i, !1), s = this.DupOutPt(o, !0), i.Prev = o, o.Next = i, a.Next = s, s.Prev = a, t.OutPt1 = i, t.OutPt2 = a, !0) : (a = this.DupOutPt(i, !0), s = this.DupOutPt(o, !1), i.Next = o, o.Prev = i, a.Prev = s, s.Next = a, t.OutPt1 = i, t.OutPt2 = a, !0);
		}, e.Clipper.GetBounds = function(t) {
			for (var n = 0, r = t.length; n < r && t[n].length == 0;) n++;
			if (n == r) return new e.IntRect(0, 0, 0, 0);
			var i = new e.IntRect();
			for (i.left = t[n][0].X, i.right = i.left, i.top = t[n][0].Y, i.bottom = i.top; n < r; n++) for (var a = 0, o = t[n].length; a < o; a++) t[n][a].X < i.left ? i.left = t[n][a].X : t[n][a].X > i.right && (i.right = t[n][a].X), t[n][a].Y < i.top ? i.top = t[n][a].Y : t[n][a].Y > i.bottom && (i.bottom = t[n][a].Y);
			return i;
		}, e.Clipper.prototype.GetBounds2 = function(t) {
			var n = t, r = new e.IntRect();
			for (r.left = t.Pt.X, r.right = t.Pt.X, r.top = t.Pt.Y, r.bottom = t.Pt.Y, t = t.Next; t != n;) t.Pt.X < r.left && (r.left = t.Pt.X), t.Pt.X > r.right && (r.right = t.Pt.X), t.Pt.Y < r.top && (r.top = t.Pt.Y), t.Pt.Y > r.bottom && (r.bottom = t.Pt.Y), t = t.Next;
			return r;
		}, e.Clipper.PointInPolygon = function(e, t) {
			var n = 0, r = t.length;
			if (r < 3) return 0;
			for (var i = t[0], a = 1; a <= r; ++a) {
				var o = a == r ? t[0] : t[a];
				if (o.Y == e.Y && (o.X == e.X || i.Y == e.Y && o.X > e.X == i.X < e.X)) return -1;
				if (i.Y < e.Y != o.Y < e.Y) {
					if (i.X >= e.X) {
						if (o.X > e.X) n = 1 - n;
						else {
							var s = (i.X - e.X) * (o.Y - e.Y) - (o.X - e.X) * (i.Y - e.Y);
							if (s == 0) return -1;
							s > 0 == o.Y > i.Y && (n = 1 - n);
						}
					} else if (o.X > e.X) {
						var s = (i.X - e.X) * (o.Y - e.Y) - (o.X - e.X) * (i.Y - e.Y);
						if (s == 0) return -1;
						s > 0 == o.Y > i.Y && (n = 1 - n);
					}
				}
				i = o;
			}
			return n;
		}, e.Clipper.prototype.PointInPolygon = function(e, t) {
			for (var n = 0, r = t;;) {
				var i = t.Pt.X, a = t.Pt.Y, o = t.Next.Pt.X, s = t.Next.Pt.Y;
				if (s == e.Y && (o == e.X || a == e.Y && o > e.X == i < e.X)) return -1;
				if (a < e.Y != s < e.Y) {
					if (i >= e.X) {
						if (o > e.X) n = 1 - n;
						else {
							var c = (i - e.X) * (s - e.Y) - (o - e.X) * (a - e.Y);
							if (c == 0) return -1;
							c > 0 == s > a && (n = 1 - n);
						}
					} else if (o > e.X) {
						var c = (i - e.X) * (s - e.Y) - (o - e.X) * (a - e.Y);
						if (c == 0) return -1;
						c > 0 == s > a && (n = 1 - n);
					}
				}
				if (t = t.Next, r == t) break;
			}
			return n;
		}, e.Clipper.prototype.Poly2ContainsPoly1 = function(e, t) {
			var n = e;
			do {
				var r = this.PointInPolygon(n.Pt, t);
				if (r >= 0) return r != 0;
				n = n.Next;
			} while (n != e);
			return !0;
		}, e.Clipper.prototype.FixupFirstLefts1 = function(e, t) {
			for (var n = 0, r = this.m_PolyOuts.length; n < r; n++) {
				var i = this.m_PolyOuts[n];
				i.Pts !== null && i.FirstLeft == e && this.Poly2ContainsPoly1(i.Pts, t.Pts) && (i.FirstLeft = t);
			}
		}, e.Clipper.prototype.FixupFirstLefts2 = function(e, t) {
			for (var n = 0, r = this.m_PolyOuts, i = r.length, a = r[n]; n < i; n++, a = r[n]) a.FirstLeft == e && (a.FirstLeft = t);
		}, e.Clipper.ParseFirstLeft = function(e) {
			for (; e != null && e.Pts == null;) e = e.FirstLeft;
			return e;
		}, e.Clipper.prototype.JoinCommonEdges = function() {
			for (var t = 0, n = this.m_Joins.length; t < n; t++) {
				var r = this.m_Joins[t], i = this.GetOutRec(r.OutPt1.Idx), a = this.GetOutRec(r.OutPt2.Idx);
				if (i.Pts != null && a.Pts != null) {
					var o = i == a ? i : this.Param1RightOfParam2(i, a) ? a : this.Param1RightOfParam2(a, i) ? i : this.GetLowermostRec(i, a);
					if (this.JoinPoints(r, i, a)) {
						if (i == a) {
							if (i.Pts = r.OutPt1, i.BottomPt = null, a = this.CreateOutRec(), a.Pts = r.OutPt2, this.UpdateOutPtIdxs(a), this.m_UsingPolyTree) for (var s = 0, c = this.m_PolyOuts.length; s < c - 1; s++) {
								var l = this.m_PolyOuts[s];
								l.Pts != null && e.Clipper.ParseFirstLeft(l.FirstLeft) == i && l.IsHole != i.IsHole && this.Poly2ContainsPoly1(l.Pts, r.OutPt2) && (l.FirstLeft = a);
							}
							this.Poly2ContainsPoly1(a.Pts, i.Pts) ? (a.IsHole = !i.IsHole, a.FirstLeft = i, this.m_UsingPolyTree && this.FixupFirstLefts2(a, i), (a.IsHole ^ this.ReverseSolution) == this.Area(a) > 0 && this.ReversePolyPtLinks(a.Pts)) : this.Poly2ContainsPoly1(i.Pts, a.Pts) ? (a.IsHole = i.IsHole, i.IsHole = !a.IsHole, a.FirstLeft = i.FirstLeft, i.FirstLeft = a, this.m_UsingPolyTree && this.FixupFirstLefts2(i, a), (i.IsHole ^ this.ReverseSolution) == this.Area(i) > 0 && this.ReversePolyPtLinks(i.Pts)) : (a.IsHole = i.IsHole, a.FirstLeft = i.FirstLeft, this.m_UsingPolyTree && this.FixupFirstLefts1(i, a));
						} else a.Pts = null, a.BottomPt = null, a.Idx = i.Idx, i.IsHole = o.IsHole, o == a && (i.FirstLeft = a.FirstLeft), a.FirstLeft = i, this.m_UsingPolyTree && this.FixupFirstLefts2(a, i);
					}
				}
			}
		}, e.Clipper.prototype.UpdateOutPtIdxs = function(e) {
			var t = e.Pts;
			do
				t.Idx = e.Idx, t = t.Prev;
			while (t != e.Pts);
		}, e.Clipper.prototype.DoSimplePolygons = function() {
			for (var t = 0; t < this.m_PolyOuts.length;) {
				var n = this.m_PolyOuts[t++], r = n.Pts;
				if (r !== null) do {
					for (var i = r.Next; i != n.Pts;) {
						if (e.IntPoint.op_Equality(r.Pt, i.Pt) && i.Next != r && i.Prev != r) {
							var a = r.Prev, o = i.Prev;
							r.Prev = o, o.Next = r, i.Prev = a, a.Next = i, n.Pts = r;
							var s = this.CreateOutRec();
							s.Pts = i, this.UpdateOutPtIdxs(s), this.Poly2ContainsPoly1(s.Pts, n.Pts) ? (s.IsHole = !n.IsHole, s.FirstLeft = n) : this.Poly2ContainsPoly1(n.Pts, s.Pts) ? (s.IsHole = n.IsHole, n.IsHole = !s.IsHole, s.FirstLeft = n.FirstLeft, n.FirstLeft = s) : (s.IsHole = n.IsHole, s.FirstLeft = n.FirstLeft), i = r;
						}
						i = i.Next;
					}
					r = r.Next;
				} while (r != n.Pts);
			}
		}, e.Clipper.Area = function(e) {
			var t = e.length;
			if (t < 3) return 0;
			for (var n = 0, r = 0, i = t - 1; r < t; ++r) n += (e[i].X + e[r].X) * (e[i].Y - e[r].Y), i = r;
			return -n * .5;
		}, e.Clipper.prototype.Area = function(e) {
			var t = e.Pts;
			if (t == null) return 0;
			var n = 0;
			do
				n += (t.Prev.Pt.X + t.Pt.X) * (t.Prev.Pt.Y - t.Pt.Y), t = t.Next;
			while (t != e.Pts);
			return n * .5;
		}, e.Clipper.SimplifyPolygon = function(t, n) {
			var r = [], i = new e.Clipper(0);
			return i.StrictlySimple = !0, i.AddPath(t, e.PolyType.ptSubject, !0), i.Execute(e.ClipType.ctUnion, r, n, n), r;
		}, e.Clipper.SimplifyPolygons = function(t, n) {
			n === void 0 && (n = e.PolyFillType.pftEvenOdd);
			var r = [], i = new e.Clipper(0);
			return i.StrictlySimple = !0, i.AddPaths(t, e.PolyType.ptSubject, !0), i.Execute(e.ClipType.ctUnion, r, n, n), r;
		}, e.Clipper.DistanceSqrd = function(e, t) {
			var n = e.X - t.X, r = e.Y - t.Y;
			return n * n + r * r;
		}, e.Clipper.DistanceFromLineSqrd = function(e, t, n) {
			var r = t.Y - n.Y, i = n.X - t.X, a = r * t.X + i * t.Y;
			return a = r * e.X + i * e.Y - a, a * a / (r * r + i * i);
		}, e.Clipper.SlopesNearCollinear = function(t, n, r, i) {
			return e.Clipper.DistanceFromLineSqrd(n, t, r) < i;
		}, e.Clipper.PointsAreClose = function(e, t, n) {
			var r = e.X - t.X, i = e.Y - t.Y;
			return r * r + i * i <= n;
		}, e.Clipper.ExcludeOp = function(e) {
			var t = e.Prev;
			return t.Next = e.Next, e.Next.Prev = t, t.Idx = 0, t;
		}, e.Clipper.CleanPolygon = function(t, n) {
			n === void 0 && (n = 1.415);
			var r = t.length;
			if (r == 0) return [];
			for (var i = Array(r), a = 0; a < r; ++a) i[a] = new e.OutPt();
			for (var a = 0; a < r; ++a) i[a].Pt = t[a], i[a].Next = i[(a + 1) % r], i[a].Next.Prev = i[a], i[a].Idx = 0;
			for (var o = n * n, s = i[0]; s.Idx == 0 && s.Next != s.Prev;) e.Clipper.PointsAreClose(s.Pt, s.Prev.Pt, o) ? (s = e.Clipper.ExcludeOp(s), r--) : e.Clipper.PointsAreClose(s.Prev.Pt, s.Next.Pt, o) ? (e.Clipper.ExcludeOp(s.Next), s = e.Clipper.ExcludeOp(s), r -= 2) : e.Clipper.SlopesNearCollinear(s.Prev.Pt, s.Pt, s.Next.Pt, o) ? (s = e.Clipper.ExcludeOp(s), r--) : (s.Idx = 1, s = s.Next);
			r < 3 && (r = 0);
			for (var c = Array(r), a = 0; a < r; ++a) c[a] = new e.IntPoint(s.Pt), s = s.Next;
			return i = null, c;
		}, e.Clipper.CleanPolygons = function(t, n) {
			for (var r = Array(t.length), i = 0, a = t.length; i < a; i++) r[i] = e.Clipper.CleanPolygon(t[i], n);
			return r;
		}, e.Clipper.Minkowski = function(t, n, r, i) {
			var a = +!!i, o = t.length, s = n.length, c = [];
			if (r) for (var l = 0; l < s; l++) {
				for (var u = Array(o), d = 0, f = t.length, p = t[d]; d < f; d++, p = t[d]) u[d] = new e.IntPoint(n[l].X + p.X, n[l].Y + p.Y);
				c.push(u);
			}
			else for (var l = 0; l < s; l++) {
				for (var u = Array(o), d = 0, f = t.length, p = t[d]; d < f; d++, p = t[d]) u[d] = new e.IntPoint(n[l].X - p.X, n[l].Y - p.Y);
				c.push(u);
			}
			for (var m = [], l = 0; l < s - 1 + a; l++) for (var d = 0; d < o; d++) {
				var h = [];
				h.push(c[l % s][d % o]), h.push(c[(l + 1) % s][d % o]), h.push(c[(l + 1) % s][(d + 1) % o]), h.push(c[l % s][(d + 1) % o]), e.Clipper.Orientation(h) || h.reverse(), m.push(h);
			}
			var g = new e.Clipper(0);
			return g.AddPaths(m, e.PolyType.ptSubject, !0), g.Execute(e.ClipType.ctUnion, c, e.PolyFillType.pftNonZero, e.PolyFillType.pftNonZero), c;
		}, e.Clipper.MinkowskiSum = function() {
			var t = arguments, n = t.length;
			if (n == 3) {
				var r = t[0], i = t[1], a = t[2];
				return e.Clipper.Minkowski(r, i, !0, a);
			}
			if (n == 4) {
				for (var r = t[0], o = t[1], s = t[2], a = t[3], c = new e.Clipper(), l, u = 0, d = o.length; u < d; ++u) {
					var l = e.Clipper.Minkowski(r, o[u], !0, a);
					c.AddPaths(l, e.PolyType.ptSubject, !0);
				}
				a && c.AddPaths(o, e.PolyType.ptClip, !0);
				var f = new e.Paths();
				return c.Execute(e.ClipType.ctUnion, f, s, s), f;
			}
		}, e.Clipper.MinkowskiDiff = function(t, n, r) {
			return e.Clipper.Minkowski(t, n, !1, r);
		}, e.Clipper.PolyTreeToPaths = function(t) {
			var n = [];
			return e.Clipper.AddPolyNodeToPaths(t, e.Clipper.NodeType.ntAny, n), n;
		}, e.Clipper.AddPolyNodeToPaths = function(t, n, r) {
			var i = !0;
			switch (n) {
				case e.Clipper.NodeType.ntOpen: return;
				case e.Clipper.NodeType.ntClosed: i = !t.IsOpen;
			}
			t.m_polygon.length > 0 && i && r.push(t.m_polygon);
			for (var a = 0, o = t.Childs(), s = o.length, c = o[a]; a < s; a++, c = o[a]) e.Clipper.AddPolyNodeToPaths(c, n, r);
		}, e.Clipper.OpenPathsFromPolyTree = function(t) {
			for (var n = new e.Paths(), r = 0, i = t.ChildCount(); r < i; r++) t.Childs()[r].IsOpen && n.push(t.Childs()[r].m_polygon);
			return n;
		}, e.Clipper.ClosedPathsFromPolyTree = function(t) {
			var n = new e.Paths();
			return e.Clipper.AddPolyNodeToPaths(t, e.Clipper.NodeType.ntClosed, n), n;
		}, xt(e.Clipper, e.ClipperBase), e.Clipper.NodeType = {
			ntAny: 0,
			ntOpen: 1,
			ntClosed: 2
		}, e.ClipperOffset = function(t, n) {
			t === void 0 && (t = 2), n === void 0 && (n = e.ClipperOffset.def_arc_tolerance), this.m_destPolys = new e.Paths(), this.m_srcPoly = new e.Path(), this.m_destPoly = new e.Path(), this.m_normals = [], this.m_delta = 0, this.m_sinA = 0, this.m_sin = 0, this.m_cos = 0, this.m_miterLim = 0, this.m_StepsPerRad = 0, this.m_lowest = new e.IntPoint(), this.m_polyNodes = new e.PolyNode(), this.MiterLimit = t, this.ArcTolerance = n, this.m_lowest.X = -1;
		}, e.ClipperOffset.two_pi = 6.28318530717959, e.ClipperOffset.def_arc_tolerance = .25, e.ClipperOffset.prototype.Clear = function() {
			e.Clear(this.m_polyNodes.Childs()), this.m_lowest.X = -1;
		}, e.ClipperOffset.Round = e.Clipper.Round, e.ClipperOffset.prototype.AddPath = function(t, n, r) {
			var i = t.length - 1;
			if (!(i < 0)) {
				var a = new e.PolyNode();
				if (a.m_jointype = n, a.m_endtype = r, r == e.EndType.etClosedLine || r == e.EndType.etClosedPolygon) for (; i > 0 && e.IntPoint.op_Equality(t[0], t[i]);) i--;
				a.m_polygon.push(t[0]);
				for (var o = 0, s = 0, c = 1; c <= i; c++) e.IntPoint.op_Inequality(a.m_polygon[o], t[c]) && (o++, a.m_polygon.push(t[c]), (t[c].Y > a.m_polygon[s].Y || t[c].Y == a.m_polygon[s].Y && t[c].X < a.m_polygon[s].X) && (s = o));
				if (!(r == e.EndType.etClosedPolygon && o < 2 || r != e.EndType.etClosedPolygon && o < 0) && (this.m_polyNodes.AddChild(a), r == e.EndType.etClosedPolygon)) {
					if (this.m_lowest.X < 0) this.m_lowest = new e.IntPoint(0, s);
					else {
						var l = this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon[this.m_lowest.Y];
						(a.m_polygon[s].Y > l.Y || a.m_polygon[s].Y == l.Y && a.m_polygon[s].X < l.X) && (this.m_lowest = new e.IntPoint(this.m_polyNodes.ChildCount() - 1, s));
					}
				}
			}
		}, e.ClipperOffset.prototype.AddPaths = function(e, t, n) {
			for (var r = 0, i = e.length; r < i; r++) this.AddPath(e[r], t, n);
		}, e.ClipperOffset.prototype.FixOrientations = function() {
			if (this.m_lowest.X >= 0 && !e.Clipper.Orientation(this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon)) for (var t = 0; t < this.m_polyNodes.ChildCount(); t++) {
				var n = this.m_polyNodes.Childs()[t];
				(n.m_endtype == e.EndType.etClosedPolygon || n.m_endtype == e.EndType.etClosedLine && e.Clipper.Orientation(n.m_polygon)) && n.m_polygon.reverse();
			}
			else for (var t = 0; t < this.m_polyNodes.ChildCount(); t++) {
				var n = this.m_polyNodes.Childs()[t];
				n.m_endtype == e.EndType.etClosedLine && !e.Clipper.Orientation(n.m_polygon) && n.m_polygon.reverse();
			}
		}, e.ClipperOffset.GetUnitNormal = function(t, n) {
			var r = n.X - t.X, i = n.Y - t.Y;
			if (r == 0 && i == 0) return new e.DoublePoint(0, 0);
			var a = 1 / Math.sqrt(r * r + i * i);
			return r *= a, i *= a, new e.DoublePoint(i, -r);
		}, e.ClipperOffset.prototype.DoOffset = function(t) {
			if (this.m_destPolys = [], this.m_delta = t, e.ClipperBase.near_zero(t)) {
				for (var n = 0; n < this.m_polyNodes.ChildCount(); n++) {
					var r = this.m_polyNodes.Childs()[n];
					r.m_endtype == e.EndType.etClosedPolygon && this.m_destPolys.push(r.m_polygon);
				}
				return;
			}
			this.m_miterLim = this.MiterLimit > 2 ? 2 / (this.MiterLimit * this.MiterLimit) : .5;
			var i = this.ArcTolerance <= 0 ? e.ClipperOffset.def_arc_tolerance : this.ArcTolerance > Math.abs(t) * e.ClipperOffset.def_arc_tolerance ? Math.abs(t) * e.ClipperOffset.def_arc_tolerance : this.ArcTolerance, a = 3.14159265358979 / Math.acos(1 - i / Math.abs(t));
			this.m_sin = Math.sin(e.ClipperOffset.two_pi / a), this.m_cos = Math.cos(e.ClipperOffset.two_pi / a), this.m_StepsPerRad = a / e.ClipperOffset.two_pi, t < 0 && (this.m_sin = -this.m_sin);
			for (var n = 0; n < this.m_polyNodes.ChildCount(); n++) {
				var r = this.m_polyNodes.Childs()[n];
				this.m_srcPoly = r.m_polygon;
				var o = this.m_srcPoly.length;
				if (!(o == 0 || t <= 0 && (o < 3 || r.m_endtype != e.EndType.etClosedPolygon))) {
					if (this.m_destPoly = [], o == 1) {
						if (r.m_jointype == e.JoinType.jtRound) for (var s = 1, c = 0, l = 1; l <= a; l++) {
							this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[0].X + s * t), e.ClipperOffset.Round(this.m_srcPoly[0].Y + c * t)));
							var u = s;
							s = s * this.m_cos - this.m_sin * c, c = u * this.m_sin + c * this.m_cos;
						}
						else for (var s = -1, c = -1, l = 0; l < 4; ++l) this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[0].X + s * t), e.ClipperOffset.Round(this.m_srcPoly[0].Y + c * t))), s < 0 ? s = 1 : c < 0 ? c = 1 : s = -1;
						this.m_destPolys.push(this.m_destPoly);
						continue;
					}
					this.m_normals.length = 0;
					for (var l = 0; l < o - 1; l++) this.m_normals.push(e.ClipperOffset.GetUnitNormal(this.m_srcPoly[l], this.m_srcPoly[l + 1]));
					if (r.m_endtype == e.EndType.etClosedLine || r.m_endtype == e.EndType.etClosedPolygon ? this.m_normals.push(e.ClipperOffset.GetUnitNormal(this.m_srcPoly[o - 1], this.m_srcPoly[0])) : this.m_normals.push(new e.DoublePoint(this.m_normals[o - 2])), r.m_endtype == e.EndType.etClosedPolygon) {
						for (var d = o - 1, l = 0; l < o; l++) d = this.OffsetPoint(l, d, r.m_jointype);
						this.m_destPolys.push(this.m_destPoly);
					} else if (r.m_endtype == e.EndType.etClosedLine) {
						for (var d = o - 1, l = 0; l < o; l++) d = this.OffsetPoint(l, d, r.m_jointype);
						this.m_destPolys.push(this.m_destPoly), this.m_destPoly = [];
						for (var f = this.m_normals[o - 1], l = o - 1; l > 0; l--) this.m_normals[l] = new e.DoublePoint(-this.m_normals[l - 1].X, -this.m_normals[l - 1].Y);
						this.m_normals[0] = new e.DoublePoint(-f.X, -f.Y), d = 0;
						for (var l = o - 1; l >= 0; l--) d = this.OffsetPoint(l, d, r.m_jointype);
						this.m_destPolys.push(this.m_destPoly);
					} else {
						for (var d = 0, l = 1; l < o - 1; ++l) d = this.OffsetPoint(l, d, r.m_jointype);
						var p;
						if (r.m_endtype == e.EndType.etOpenButt) {
							var l = o - 1;
							p = new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[l].X + this.m_normals[l].X * t), e.ClipperOffset.Round(this.m_srcPoly[l].Y + this.m_normals[l].Y * t)), this.m_destPoly.push(p), p = new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[l].X - this.m_normals[l].X * t), e.ClipperOffset.Round(this.m_srcPoly[l].Y - this.m_normals[l].Y * t)), this.m_destPoly.push(p);
						} else {
							var l = o - 1;
							d = o - 2, this.m_sinA = 0, this.m_normals[l] = new e.DoublePoint(-this.m_normals[l].X, -this.m_normals[l].Y), r.m_endtype == e.EndType.etOpenSquare ? this.DoSquare(l, d) : this.DoRound(l, d);
						}
						for (var l = o - 1; l > 0; l--) this.m_normals[l] = new e.DoublePoint(-this.m_normals[l - 1].X, -this.m_normals[l - 1].Y);
						this.m_normals[0] = new e.DoublePoint(-this.m_normals[1].X, -this.m_normals[1].Y), d = o - 1;
						for (var l = d - 1; l > 0; --l) d = this.OffsetPoint(l, d, r.m_jointype);
						r.m_endtype == e.EndType.etOpenButt ? (p = new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[0].X - this.m_normals[0].X * t), e.ClipperOffset.Round(this.m_srcPoly[0].Y - this.m_normals[0].Y * t)), this.m_destPoly.push(p), p = new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[0].X + this.m_normals[0].X * t), e.ClipperOffset.Round(this.m_srcPoly[0].Y + this.m_normals[0].Y * t)), this.m_destPoly.push(p)) : (d = 1, this.m_sinA = 0, r.m_endtype == e.EndType.etOpenSquare ? this.DoSquare(0, 1) : this.DoRound(0, 1)), this.m_destPolys.push(this.m_destPoly);
					}
				}
			}
		}, e.ClipperOffset.prototype.Execute = function() {
			var t = arguments;
			if (t[0] instanceof e.PolyTree) {
				var n = t[0], r = t[1];
				n.Clear(), this.FixOrientations(), this.DoOffset(r);
				var i = new e.Clipper(0);
				if (i.AddPaths(this.m_destPolys, e.PolyType.ptSubject, !0), r > 0) i.Execute(e.ClipType.ctUnion, n, e.PolyFillType.pftPositive, e.PolyFillType.pftPositive);
				else {
					var a = e.Clipper.GetBounds(this.m_destPolys), o = new e.Path();
					if (o.push(new e.IntPoint(a.left - 10, a.bottom + 10)), o.push(new e.IntPoint(a.right + 10, a.bottom + 10)), o.push(new e.IntPoint(a.right + 10, a.top - 10)), o.push(new e.IntPoint(a.left - 10, a.top - 10)), i.AddPath(o, e.PolyType.ptSubject, !0), i.ReverseSolution = !0, i.Execute(e.ClipType.ctUnion, n, e.PolyFillType.pftNegative, e.PolyFillType.pftNegative), n.ChildCount() == 1 && n.Childs()[0].ChildCount() > 0) {
						var s = n.Childs()[0];
						n.Childs()[0] = s.Childs()[0];
						for (var c = 1; c < s.ChildCount(); c++) n.AddChild(s.Childs()[c]);
					} else n.Clear();
				}
			} else {
				var n = t[0], r = t[1];
				e.Clear(n), this.FixOrientations(), this.DoOffset(r);
				var i = new e.Clipper(0);
				if (i.AddPaths(this.m_destPolys, e.PolyType.ptSubject, !0), r > 0) i.Execute(e.ClipType.ctUnion, n, e.PolyFillType.pftPositive, e.PolyFillType.pftPositive);
				else {
					var a = e.Clipper.GetBounds(this.m_destPolys), o = new e.Path();
					o.push(new e.IntPoint(a.left - 10, a.bottom + 10)), o.push(new e.IntPoint(a.right + 10, a.bottom + 10)), o.push(new e.IntPoint(a.right + 10, a.top - 10)), o.push(new e.IntPoint(a.left - 10, a.top - 10)), i.AddPath(o, e.PolyType.ptSubject, !0), i.ReverseSolution = !0, i.Execute(e.ClipType.ctUnion, n, e.PolyFillType.pftNegative, e.PolyFillType.pftNegative), n.length > 0 && n.splice(0, 1);
				}
			}
		}, e.ClipperOffset.prototype.OffsetPoint = function(t, n, r) {
			if (this.m_sinA = this.m_normals[n].X * this.m_normals[t].Y - this.m_normals[t].X * this.m_normals[n].Y, this.m_sinA < 5e-5 && this.m_sinA > -5e-5) return n;
			if (this.m_sinA > 1 ? this.m_sinA = 1 : this.m_sinA < -1 && (this.m_sinA = -1), this.m_sinA * this.m_delta < 0) this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_normals[n].X * this.m_delta), e.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_normals[n].Y * this.m_delta))), this.m_destPoly.push(new e.IntPoint(this.m_srcPoly[t])), this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_normals[t].X * this.m_delta), e.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_normals[t].Y * this.m_delta)));
			else switch (r) {
				case e.JoinType.jtMiter:
					var i = 1 + (this.m_normals[t].X * this.m_normals[n].X + this.m_normals[t].Y * this.m_normals[n].Y);
					i >= this.m_miterLim ? this.DoMiter(t, n, i) : this.DoSquare(t, n);
					break;
				case e.JoinType.jtSquare:
					this.DoSquare(t, n);
					break;
				case e.JoinType.jtRound:
					this.DoRound(t, n);
					break;
			}
			return n = t, n;
		}, e.ClipperOffset.prototype.DoSquare = function(t, n) {
			var r = Math.tan(Math.atan2(this.m_sinA, this.m_normals[n].X * this.m_normals[t].X + this.m_normals[n].Y * this.m_normals[t].Y) / 4);
			this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_delta * (this.m_normals[n].X - this.m_normals[n].Y * r)), e.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_delta * (this.m_normals[n].Y + this.m_normals[n].X * r)))), this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_delta * (this.m_normals[t].X + this.m_normals[t].Y * r)), e.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_delta * (this.m_normals[t].Y - this.m_normals[t].X * r))));
		}, e.ClipperOffset.prototype.DoMiter = function(t, n, r) {
			var i = this.m_delta / r;
			this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[t].X + (this.m_normals[n].X + this.m_normals[t].X) * i), e.ClipperOffset.Round(this.m_srcPoly[t].Y + (this.m_normals[n].Y + this.m_normals[t].Y) * i)));
		}, e.ClipperOffset.prototype.DoRound = function(t, n) {
			for (var r = Math.atan2(this.m_sinA, this.m_normals[n].X * this.m_normals[t].X + this.m_normals[n].Y * this.m_normals[t].Y), i = e.Cast_Int32(e.ClipperOffset.Round(this.m_StepsPerRad * Math.abs(r))), a = this.m_normals[n].X, o = this.m_normals[n].Y, s, c = 0; c < i; ++c) this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[t].X + a * this.m_delta), e.ClipperOffset.Round(this.m_srcPoly[t].Y + o * this.m_delta))), s = a, a = a * this.m_cos - this.m_sin * o, o = s * this.m_sin + o * this.m_cos;
			this.m_destPoly.push(new e.IntPoint(e.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_normals[t].X * this.m_delta), e.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_normals[t].Y * this.m_delta)));
		}, e.Error = function(e) {
			try {
				throw Error(e);
			} catch (e) {
				alert(e.message);
			}
		}, e.JS = {}, e.JS.AreaOfPolygon = function(t, n) {
			return n ||= 1, e.Clipper.Area(t) / (n * n);
		}, e.JS.AreaOfPolygons = function(t, n) {
			n ||= 1;
			for (var r = 0, i = 0; i < t.length; i++) r += e.Clipper.Area(t[i]);
			return r / (n * n);
		}, e.JS.BoundsOfPath = function(t, n) {
			return e.JS.BoundsOfPaths([t], n);
		}, e.JS.BoundsOfPaths = function(t, n) {
			n ||= 1;
			var r = e.Clipper.GetBounds(t);
			return r.left /= n, r.bottom /= n, r.right /= n, r.top /= n, r;
		}, e.JS.Clean = function(t, n) {
			if (!(t instanceof Array)) return [];
			var r = t[0] instanceof Array, t = e.JS.Clone(t);
			if (typeof n != "number" || n === null) return e.Error("Delta is not a number in Clean()."), t;
			if (t.length === 0 || t.length == 1 && t[0].length === 0 || n < 0) return t;
			r || (t = [t]);
			for (var i = t.length, a, o, s, c, l, u, d, f = [], p = 0; p < i; p++) if (o = t[p], a = o.length, a !== 0) {
				if (a < 3) {
					s = o, f.push(s);
					continue;
				}
				for (s = o, c = n * n, l = o[0], u = 1, d = 1; d < a; d++) (o[d].X - l.X) * (o[d].X - l.X) + (o[d].Y - l.Y) * (o[d].Y - l.Y) <= c || (s[u] = o[d], l = o[d], u++);
				l = o[u - 1], (o[0].X - l.X) * (o[0].X - l.X) + (o[0].Y - l.Y) * (o[0].Y - l.Y) <= c && u--, u < a && s.splice(u, a - u), s.length && f.push(s);
			}
			return !r && f.length ? f = f[0] : !r && f.length === 0 ? f = [] : r && f.length === 0 && (f = [[]]), f;
		}, e.JS.Clone = function(e) {
			if (!(e instanceof Array) || e.length === 0) return [];
			if (e.length == 1 && e[0].length === 0) return [[]];
			var t = e[0] instanceof Array;
			t || (e = [e]);
			var n = e.length, r, i, a, o, s = Array(n);
			for (i = 0; i < n; i++) {
				for (r = e[i].length, o = Array(r), a = 0; a < r; a++) o[a] = {
					X: e[i][a].X,
					Y: e[i][a].Y
				};
				s[i] = o;
			}
			return t || (s = s[0]), s;
		}, e.JS.Lighten = function(t, n) {
			if (!(t instanceof Array)) return [];
			if (typeof n != "number" || n === null) return e.Error("Tolerance is not a number in Lighten()."), e.JS.Clone(t);
			if (t.length === 0 || t.length == 1 && t[0].length === 0 || n < 0) return e.JS.Clone(t);
			t[0] instanceof Array || (t = [t]);
			var r, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y, b = t.length, x = n * n, S = [];
			for (r = 0; r < b; r++) if (a = t[r], c = a.length, c != 0) {
				for (o = 0; o < 1e6; o++) {
					for (s = [], c = a.length, a[c - 1].X != a[0].X || a[c - 1].Y != a[0].Y ? (m = 1, a.push({
						X: a[0].X,
						Y: a[0].Y
					}), c = a.length) : m = 0, p = [], i = 0; i < c - 2; i++) l = a[i], d = a[i + 1], u = a[i + 2], v = l.X, y = l.Y, h = u.X - v, g = u.Y - y, (h !== 0 || g !== 0) && (_ = ((d.X - v) * h + (d.Y - y) * g) / (h * h + g * g), _ > 1 ? (v = u.X, y = u.Y) : _ > 0 && (v += h * _, y += g * _)), h = d.X - v, g = d.Y - y, f = h * h + g * g, f <= x && (p[i + 1] = 1, i++);
					for (s.push({
						X: a[0].X,
						Y: a[0].Y
					}), i = 1; i < c - 1; i++) p[i] || s.push({
						X: a[i].X,
						Y: a[i].Y
					});
					if (s.push({
						X: a[c - 1].X,
						Y: a[c - 1].Y
					}), m && a.pop(), p.length) a = s;
					else break;
				}
				c = s.length, s[c - 1].X == s[0].X && s[c - 1].Y == s[0].Y && s.pop(), s.length > 2 && S.push(s);
			}
			return !t[0] instanceof Array && (S = S[0]), S === void 0 && (S = [[]]), S;
		}, e.JS.PerimeterOfPath = function(e, t, n) {
			if (e === void 0) return 0;
			var r = Math.sqrt, i = 0, a, o, s = 0, c = 0, l = 0, u = 0, d = e.length;
			if (d < 2) return 0;
			for (t && (e[d] = e[0], d++); --d;) a = e[d], s = a.X, c = a.Y, o = e[d - 1], l = o.X, u = o.Y, i += r((s - l) * (s - l) + (c - u) * (c - u));
			return t && e.pop(), i / n;
		}, e.JS.PerimeterOfPaths = function(t, n, r) {
			r ||= 1;
			for (var i = 0, a = 0; a < t.length; a++) i += e.JS.PerimeterOfPath(t[a], n, r);
			return i;
		}, e.JS.ScaleDownPath = function(e, t) {
			var n, r;
			for (t ||= 1, n = e.length; n--;) r = e[n], r.X /= t, r.Y /= t;
		}, e.JS.ScaleDownPaths = function(e, t) {
			var n, r, i;
			for (t ||= 1, n = e.length; n--;) for (r = e[n].length; r--;) i = e[n][r], i.X /= t, i.Y /= t;
		}, e.JS.ScaleUpPath = function(e, t) {
			var n, r, i = Math.round;
			for (t ||= 1, n = e.length; n--;) r = e[n], r.X = i(r.X * t), r.Y = i(r.Y * t);
		}, e.JS.ScaleUpPaths = function(e, t) {
			var n, r, i, a = Math.round;
			for (t ||= 1, n = e.length; n--;) for (r = e[n].length; r--;) i = e[n][r], i.X = a(i.X * t), i.Y = a(i.Y * t);
		}, e.ExPolygons = function() {
			return [];
		}, e.ExPolygon = function() {
			this.outer = null, this.holes = null;
		}, e.JS.AddOuterPolyNodeToExPolygons = function(t, n) {
			var r = new e.ExPolygon();
			r.outer = t.Contour();
			var i = t.Childs(), a = i.length;
			r.holes = Array(a);
			var o, s, c, l, u, d;
			for (c = 0; c < a; c++) for (o = i[c], r.holes[c] = o.Contour(), l = 0, u = o.Childs(), d = u.length; l < d; l++) s = u[l], e.JS.AddOuterPolyNodeToExPolygons(s, n);
			n.push(r);
		}, e.JS.ExPolygonsToPaths = function(t) {
			var n, r, i, a, o = new e.Paths();
			for (n = 0, i = t.length; n < i; n++) for (o.push(t[n].outer), r = 0, a = t[n].holes.length; r < a; r++) o.push(t[n].holes[r]);
			return o;
		}, e.JS.PolyTreeToExPolygons = function(t) {
			var n = new e.ExPolygons(), r, i, a, o;
			for (i = 0, a = t.Childs(), o = a.length; i < o; i++) r = a[i], e.JS.AddOuterPolyNodeToExPolygons(r, n);
			return n;
		};
	})();
})), Je = /* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	var n = qe(), r = 10 ** 5;
	function i(e) {
		return e.map(function(e) {
			return {
				X: e[0],
				Y: e[1]
			};
		});
	}
	function a(e) {
		return e.map(function(e) {
			return [e.X, e.Y];
		});
	}
	function o(e) {
		return e.map(i);
	}
	function s(e) {
		return e.map(a);
	}
	var c = {
		EVEN_ODD: n.PolyFillType.pftEvenOdd,
		NON_ZERO: n.PolyFillType.pftNonZero,
		NEGATIVE: n.PolyFillType.pftNegative,
		POSITIVE: n.PolyFillType.pftPositive
	}, l = {
		INTERSECTION: n.ClipType.ctIntersection,
		UNION: n.ClipType.ctUnion,
		DIFFERENCE: n.ClipType.ctDifference,
		XOR: n.ClipType.ctXor
	}, u = {
		ROUND: n.JoinType.jtRound,
		MITER: n.JoinType.jtMiter,
		SQUARE: n.JoinType.jtSquare
	};
	function d(e, t, i, a, l) {
		var a = a || r, l = l || c.NON_ZERO;
		if (!Array.isArray(e)) throw Error("Provide subject polygon as an array of paths.");
		if (!Array.isArray(t)) throw Error("Provide clip polygons as arrays of paths.");
		if (t.length == 0) throw Error("Provide at least one clip.");
		if (typeof i != "number" || !(0 <= i && i < 4)) throw Error("Provide a valid clip type!");
		var u = o(e), d = t.map(o), f = new n.Clipper();
		n.JS.ScaleUpPaths(u, a), f.AddPaths(u, n.PolyType.ptSubject, !0), d.forEach(function(e) {
			n.JS.ScaleUpPaths(e, a), f.AddPaths(e, n.PolyType.ptClip, !0);
		});
		var p = [];
		return f.Execute(i, p, l, l) ? (n.JS.ScaleDownPaths(p, a), s(p)) : !1;
	}
	function f(e, t) {
		return d(e, t, l.INTERSECTION);
	}
	function p(e, t) {
		return d(e, t, l.UNION);
	}
	function m(e, t) {
		return d(e, t, l.DIFFERENCE);
	}
	function h(e, t) {
		return d(e, t, l.XOR);
	}
	_.fromVector = function(e, t) {
		var n = e.map(function(e) {
			return [e.x, e.y];
		}), r = void 0;
		return t && (r = t.map(function(e) {
			return e.map(function(e) {
				return [e.x, e.y];
			});
		})), new _(n, r);
	};
	function g(e, t, i, a, l, d, f, p) {
		var i = i || r, a = a || c.NON_ZERO, l = l || 1 / i, d = d || 2, f = f || .25, p = p || u.MITER;
		if (!Array.isArray(e)) throw Error("Provide subject polygon as an array of paths.");
		var m = o(e);
		n.JS.ScaleUpPaths(m, i);
		var h = n.Clipper.SimplifyPolygons(m, a), g = n.JS.Clean(h, l), _ = new n.ClipperOffset();
		_.AddPaths(g, p, n.EndType.etClosedPolygon);
		var v = [];
		return _.Execute(v, t * i), n.JS.ScaleDownPaths(v, i), s(v);
	}
	function _(e, t) {
		if (!Array.isArray(e)) throw Error("Given shape should be an array of points [x,y].");
		if (t ||= [], !Array.isArray(t)) throw Error("Given holes should be an array of paths.");
		var n = e.concat(), r = t.concat();
		_.isCounterClockwise(n) || n.reverse(), r = r.map(function(e) {
			return _.isCounterClockwise(e) ? e.concat().reverse() : e;
		}), this._paths = [n].concat(r);
	}
	_.prototype.clone = function() {
		return clonedShape = this.getShape().map(function(e) {
			return e.concat();
		}), clonedHoles = this.getHoles().map((function(e) {
			return e.map(function(e) {
				return e.concat();
			});
		})), new _(clonedShape, clonedHoles);
	}, _.prototype.getPaths = function() {
		return this._paths.slice();
	}, _.prototype.getShape = function() {
		return this._paths.slice(0, 1)[0];
	}, _.prototype.getHoles = function() {
		return this._paths.slice(1);
	}, _.prototype.clipMultiple = function(e, t) {
		var n = e.map(function(e) {
			return e.getPaths();
		}), r = d(this.getPaths(), n, t);
		return r ? _.assignShapesAndHoles(r) : !1;
	}, _.prototype.diffMultiple = function(e) {
		return this.clipMultiple(e, l.DIFFERENCE);
	}, _.prototype.intersectMultiple = function(e) {
		return this.clipMultiple(e, l.INTERSECTION);
	}, _.prototype.unionMultiple = function(e) {
		return this.clipMultiple(e, l.UNION);
	}, _.prototype.xorMultiple = function(e) {
		return this.clipMultiple(e, l.XOR);
	}, _.prototype.diff = function(e) {
		return this.clipMultiple([e], l.DIFFERENCE);
	}, _.prototype.intersect = function(e) {
		return this.clipMultiple([e], l.INTERSECTION);
	}, _.prototype.union = function(e) {
		return this.clipMultiple([e], l.UNION);
	}, _.prototype.xor = function(e) {
		return this.clipMultiple([e], l.XOR);
	}, _.prototype.offset = function(e, t) {
		var n = g(this.getPaths(), e, t);
		return _.assignShapesAndHoles(n)[0];
	}, _.prototype.area = function(e) {
		e ||= r;
		var t = i(this.getShape());
		return n.JS.ScaleUpPath(t, e), n.Clipper.Area(t) / (e * e);
	}, _.prototype.containsPoint = function(e, t) {
		t ||= r;
		var n = this.getShape(), i = this.getHoles().some(function(n) {
			return _.containsPoint(n, e, t);
		});
		return _.containsPoint(n, e, t) && !i;
	}, _.assignShapesAndHoles = function(e) {
		function t(e) {
			var t = [], n = [];
			return e.forEach(function(e) {
				_.isCounterClockwise(e) ? n.push(e) : t.push(e);
			}), {
				shapes: n,
				holes: t
			};
		}
		function n(e) {
			return function(t) {
				return new _(t, e.filter(function(e) {
					return _.contains(t, e);
				}));
			};
		}
		var r = t(e);
		return r.shapes.map(n(r.holes));
	}, _.isCounterClockwise = function(e) {
		return n.Clipper.Orientation(i(e));
	}, _.contains = function(e, t) {
		var r = i(e);
		return i(t).reduce(function(e, t) {
			return e && n.Clipper.PointInPolygon(t, r) !== 0;
		}, !0);
	}, _.containsPoint = function(e, t, r) {
		return e = i(e), n.JS.ScaleUpPath(e, r), n.Clipper.PointInPolygon({
			X: t[0] * r,
			Y: t[1] * r
		}, e) !== 0;
	}, t.exports = {
		DEFAULT_SCALE: r,
		arrayToObjectNotation: i,
		objectToArrayNotation: a,
		arrayToClipperPaths: o,
		clipperPathsToArray: s,
		FillType: c,
		ClipType: l,
		JoinType: u,
		clip: d,
		intersect: f,
		union: p,
		diff: m,
		xor: h,
		offset: g,
		Polygon: _,
		ClipperLib: n
	};
})))(), 1), Ye = 18, Xe = Object.freeze({
	x: 0,
	y: 0,
	scalePercent: 100
});
function Ze(e) {
	if (typeof e != "number" || !Number.isFinite(e) || e <= 0) throw TypeError("Bubble tail length must be greater than zero.");
	return e;
}
function Qe(e) {
	if (e.length !== 2 && e.length !== 3) throw TypeError("Bubble offset must be [x, y] or [x, y, scale].");
	let [t, n, r = 100] = e;
	if (![
		t,
		n,
		r
	].every(Number.isFinite) || r <= 0) throw TypeError("Bubble offset values must be finite and scale positive.");
	return Object.freeze({
		x: t,
		y: n,
		scalePercent: r
	});
}
var $e = Object.freeze([
	"NORMAL",
	"THINKING",
	"DREAMING",
	"YELLING",
	"OFF_PANEL",
	"WAVY",
	"WHISPERING",
	"ANNOUNCEMENT",
	"NARRATION",
	"NO_BUBBLE"
]), et = Object.freeze({
	height: 96,
	width: 176
}), tt = Object.freeze({
	height: 0,
	width: 0
});
function nt(...e) {
	return e.some((e) => e === "THINKING" || e === "DREAMING") ? et : tt;
}
function rt(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function it(e, t) {
	let n = e ?? t;
	if (!Number.isFinite(n) || n <= 0) throw TypeError("Bubble SVG dimensions must be positive and finite.");
	return n;
}
function at(e) {
	if (e === null) return null;
	let t = e ?? 180;
	if (!Number.isFinite(t)) throw TypeError("tailDirection must be finite.");
	return (t % 360 + 360) % 360;
}
function ot(e, t, n = 18) {
	let r = e - 24, i = t - 24;
	return [
		{
			centerX: r - n,
			centerY: 24 + n,
			start: -90
		},
		{
			centerX: r - n,
			centerY: i - n,
			start: 0
		},
		{
			centerX: 24 + n,
			centerY: i - n,
			start: 90
		},
		{
			centerX: 24 + n,
			centerY: 24 + n,
			start: 180
		}
	].flatMap(({ centerX: e, centerY: t, start: r }) => Array.from({ length: 11 }, (i, a) => {
		let o = (r + a * 90 / 10) * Math.PI / 180;
		return {
			x: e + Math.cos(o) * n,
			y: t + Math.sin(o) * n
		};
	}));
}
function st(e, t) {
	return e.x * t.y - e.y * t.x;
}
function ct(e, t) {
	return {
		x: e.x - t.x,
		y: e.y - t.y
	};
}
function lt(e, t) {
	return Math.hypot(e.x - t.x, e.y - t.y);
}
function ut(e, t, n, r) {
	let i = t, a = r;
	for (; a > 0;) {
		let t = (i + n + e.length) % e.length, r = e[i], o = e[t];
		if (!r || !o) throw Error("Bubble border path is invalid.");
		let s = lt(r, o);
		if (a <= s) {
			let e = a / s;
			return {
				x: r.x + (o.x - r.x) * e,
				y: r.y + (o.y - r.y) * e
			};
		}
		a -= s, i = t;
	}
	let o = e[i];
	if (!o) throw Error("Bubble border path is empty.");
	return o;
}
function dt(e, t, n, r, i) {
	let a;
	for (let r = 0; r < e.length; r += 1) {
		let i = e[r], o = e[(r + 1) % e.length];
		if (!i || !o) continue;
		let s = ct(o, i), c = st(n, s);
		if (Math.abs(c) < 1e-9) continue;
		let l = ct(i, t), u = st(l, s) / c, d = st(l, n) / c;
		u < 0 || d < -1e-9 || d > 1 + 1e-9 || a && u >= a.rayScale || (a = {
			edgeIndex: r,
			point: {
				x: t.x + n.x * u,
				y: t.y + n.y * u
			},
			rayScale: u
		});
	}
	if (!a) throw Error("Tail ray does not intersect Bubble border.");
	let o = [
		...e.slice(0, a.edgeIndex + 1),
		a.point,
		...e.slice(a.edgeIndex + 1)
	], s = a.edgeIndex + 1;
	return {
		borderPoint: a.point,
		base: [ut(o, s, -1, 9), ut(o, s, 1, 9)],
		tip: {
			x: i?.x ?? t.x + n.x * (a.rayScale + r),
			y: i?.y ?? t.y + n.y * (a.rayScale + r)
		}
	};
}
function ft(e) {
	let t = e * Math.PI / 180;
	return {
		x: Math.sin(t),
		y: -Math.cos(t)
	};
}
function pt(e, t, n, r) {
	return {
		x: n.x + (e.x - t.x) * r,
		y: n.y + (e.y - t.y) * r
	};
}
function mt(e, t, n, r, i, a) {
	let o = {
		x: t / 2,
		y: n / 2
	}, s = ft(r), c = dt(e, o, s, i), l = lt(o, c.borderPoint), u = a.scalePercent / 100, d = {
		x: o.x - s.x * l * (u - 1) + a.x,
		y: o.y - s.y * l * (u - 1) - a.y
	};
	return {
		body: e.map((e) => pt(e, o, d, u)),
		bodyCenter: d,
		tip: c.tip
	};
}
function ht(e) {
	let t = e[0];
	if (!t) throw Error("Bubble polygon is empty.");
	return `M ${t.x.toFixed(4)} ${t.y.toFixed(4)} ${e.slice(1).map(({ x: e, y: t }) => `L ${e.toFixed(4)} ${t.toFixed(4)}`).join(" ")} Z`;
}
function gt(e) {
	return Math.abs(e.reduce((t, n, r) => {
		let i = e[(r + 1) % e.length];
		return i ? t + n.x * i.y - i.x * n.y : t;
	}, 0) / 2);
}
function _t(e, t, n, r = "") {
	return `<path d="${ht(e)}" fill="${t}" stroke="${n}" stroke-width="3" stroke-linejoin="round" ${r}/>`;
}
function G(e, t, n, r, i, a = "") {
	let o = ct(n, t), s = Math.hypot(o.x, o.y);
	if (!(s > 0)) throw TypeError("Bubble body center and tail tip must differ.");
	let c = dt(e, t, {
		x: o.x / s,
		y: o.y / s
	}, 0, n), l = (e) => e.map(({ x: e, y: t }) => [e, t]), u = Je.default.union([l(e)], [[l([
		c.base[0],
		c.tip,
		c.base[1]
	])]]);
	if (!u || u.length === 0) throw Error("JSClipper failed to union Bubble body and tail.");
	let d = u.map((e) => e.map(([e, t]) => ({
		x: e,
		y: t
	}))).sort((e, t) => gt(t) - gt(e))[0];
	if (!d) throw Error("JSClipper returned an empty Bubble outline.");
	return `<path d="${ht(d)}" fill="${r}" stroke="${i}" stroke-width="3" stroke-linejoin="round" data-boolean-operation="union" data-tail-base-on-border="true" ${a}/>`;
}
function vt(e) {
	let t = e[0];
	if (!t || e.length < 3) throw TypeError("Smooth Bubble path requires at least three points.");
	let n = (e) => e.toFixed(4), r = e.map((t, r) => {
		let i = e[(r - 1 + e.length) % e.length], a = e[(r + 1) % e.length], o = e[(r + 2) % e.length];
		if (!i || !a || !o) throw Error("Smooth Bubble path is invalid.");
		let s = {
			x: t.x + (a.x - i.x) / 6,
			y: t.y + (a.y - i.y) / 6
		}, c = {
			x: a.x - (o.x - t.x) / 6,
			y: a.y - (o.y - t.y) / 6
		};
		return `C ${n(s.x)} ${n(s.y)} ${n(c.x)} ${n(c.y)} ${n(a.x)} ${n(a.y)}`;
	});
	return `M ${n(t.x)} ${n(t.y)} ${r.join(" ")} Z`;
}
function yt(e, t, n, r) {
	let i = e - 24, a = t - 24, o = i - 24, s = a - 24, c = (e, t) => ({
		x: 24 + o * e,
		y: 24 + s * t
	});
	return `<path d="${vt([
		c(0, .5),
		c(.03, .3),
		c(.18, .2),
		c(.28, .04),
		c(.5, .16),
		c(.68, .03),
		c(.84, .18),
		c(.98, .3),
		c(1, .52),
		c(.95, .7),
		c(.82, .82),
		c(.68, .97),
		c(.5, .84),
		c(.32, .97),
		c(.18, .82),
		c(.03, .7)
	])}" fill="${n}" stroke="${r}" stroke-width="3" stroke-linejoin="round"/>`;
}
function bt(e, t, n, r, i, a) {
	let o = ct(n, t), s = Math.hypot(o.x, o.y), c = dt(e, t, {
		x: o.x / s,
		y: o.y / s
	}, 0, n), l = {
		x: (c.base[0].x + c.base[1].x) / 2,
		y: (c.base[0].y + c.base[1].y) / 2
	};
	return (a ? [
		{
			ratio: .45,
			radius: 7
		},
		{
			ratio: .78,
			radius: 4.5
		},
		{
			ratio: 1,
			radius: 3
		}
	] : [{
		ratio: .5,
		radius: 5
	}, {
		ratio: .82,
		radius: 3.5
	}]).map(({ ratio: e, radius: t }) => `<circle cx="${l.x + (c.tip.x - l.x) * e}" cy="${l.y + (c.tip.y - l.y) * e}" r="${t}" fill="${r}" stroke="${i}" stroke-width="2"/>`).join("");
}
function K(e, t) {
	let n = e / 2, r = t / 2;
	return Array.from({ length: 28 }, (i, a) => {
		let o = a * Math.PI * 2 / 28 - Math.PI / 2, s = a % 2 == 0, c = s ? e / 2 - 6 : e / 2 - 22, l = s ? t / 2 - 6 : t / 2 - 22;
		return {
			x: n + Math.cos(o) * c,
			y: r + Math.sin(o) * l
		};
	});
}
function xt(e, t) {
	let n = e - 24, r = t - 24, i = Array.from({ length: 21 }, (e, t) => {
		let n = t / 20;
		return {
			ratio: n,
			wave: Math.sin(n * Math.PI * 8) * 4
		};
	}), a = Array.from({ length: 9 }, (e, t) => {
		let n = (t + 1) / 10;
		return {
			ratio: n,
			wave: Math.sin(n * Math.PI * 4) * 4
		};
	});
	return [
		...i.map(({ ratio: e, wave: t }) => ({
			x: 24 + e * (n - 24),
			y: 24 + t
		})),
		...a.map(({ ratio: e, wave: t }) => ({
			x: n + t,
			y: 24 + e * (r - 24)
		})),
		...[...i].reverse().map(({ ratio: e, wave: t }) => ({
			x: 24 + e * (n - 24),
			y: r + t
		})),
		...[...a].reverse().map(({ ratio: e, wave: t }) => ({
			x: 24 + t,
			y: 24 + e * (r - 24)
		}))
	];
}
function St(e, t, n) {
	return e === "YELLING" ? K(t, n) : e === "WAVY" ? xt(t, n) : ot(t, n);
}
function Ct(e) {
	let t = nt(e.style), n = Math.max(it(e.width, 220), t.width), r = Math.max(it(e.height, 112), t.height), i = at(e.tailDirection);
	if (i === null) throw TypeError("Bubble body center offset requires a tail direction.");
	let a = Ze(e.tailLength ?? Ye), o = Qe(e.offset), s = {
		x: n / 2,
		y: r / 2
	}, c = mt(St(e.style, n, r), n, r, i, a, o);
	return Object.freeze({
		x: c.bodyCenter.x - s.x,
		y: c.bodyCenter.y - s.y
	});
}
function wt(e, t, n, r, i, a, o, s) {
	let c = ot(t, n), l = (e) => r === null ? e : mt(e, t, n, r, o, s).body, u = (e, c = "") => {
		if (r === null) return _t(e, i, a, c);
		let l = mt(e, t, n, r, o, s);
		return G(l.body, l.bodyCenter, l.tip, i, a, c);
	};
	switch (e) {
		case "NO_BUBBLE": return "";
		case "THINKING":
		case "DREAMING": {
			if (r === null) return yt(t, n, i, a);
			let l = mt(c, t, n, r, o, s), u = s.scalePercent / 100, d = {
				x: t / 2,
				y: n / 2
			}, f = l.bodyCenter.x - d.x * u, p = l.bodyCenter.y - d.y * u;
			return `${bt(l.body, l.bodyCenter, l.tip, i, a, e === "DREAMING")}<g transform="translate(${f} ${p}) scale(${u})">${yt(t, n, i, a)}</g>`;
		}
		case "YELLING": return u(K(t, n));
		case "WAVY": return u(xt(t, n));
		case "WHISPERING": return u(c, "stroke-dasharray=\"5 5\"");
		case "ANNOUNCEMENT": return `${u(c)}<rect x="30" y="30" width="${t - 60}" height="${n - 60}" rx="13" fill="none" stroke="${a}" stroke-width="1.5"/>`;
		case "NARRATION": return _t(l(c), i, a);
		case "OFF_PANEL": return u(c);
		case "NORMAL": return u(c);
	}
}
function Tt(e) {
	if (!$e.includes(e.style)) throw TypeError(`Unsupported Bubble visual style: ${String(e.style)}`);
	if (!Array.isArray(e.lines) || e.lines.some((e) => typeof e != "string")) throw TypeError("lines must be an array of strings.");
	let t = it(e.width, 220), n = it(e.height, 112), r = it(e.fontSize, 15), i = at(e.tailDirection), a = Ze(e.tailLength ?? Ye), o = e.offset === void 0 ? Xe : Qe(e.offset), s = e.shapeTransition;
	if (s !== void 0 && (!$e.includes(s.from) || !$e.includes(s.to) || !Number.isFinite(s.progress) || s.progress < 0 || s.progress > 1)) throw TypeError("Bubble shape transition is invalid.");
	let c = nt(e.style, ...s === void 0 ? [] : [s.from, s.to]), l = Math.max(t, c.width), u = Math.max(n, c.height), d = e.fillColor ?? "#fff4cc", f = e.borderColor ?? "#6f5b45", p = e.textColor ?? "#25283a", m = e.fontFamily ?? "Noto Sans JP, sans-serif", h = r * 1.35, g = u / 2 - (e.lines.length - 1) * h / 2 + r * .35, _ = i === null ? 1 : o.scalePercent / 100, v = i === null ? {
		x: l / 2,
		y: u / 2
	} : mt(ot(l, u), l, u, i, a, o).bodyCenter, y = e.lines.map((e, t) => `<text x="${v.x}" y="${v.y + (g + t * h - u / 2) * _}" text-anchor="middle" fill="${rt(p)}" font-family="${rt(m)}" font-size="${r * _}">${rt(e)}</text>`).join(""), b = s === void 0 ? wt(e.style, l, u, i, d, f, a, o) : `<g opacity="${(1 - s.progress).toFixed(4)}">${wt(s.from, l, u, i, d, f, a, o)}</g><g opacity="${s.progress.toFixed(4)}">${wt(s.to, l, u, i, d, f, a, o)}</g>`, x = rt(e.title ?? `${e.style} bubble`), S = s === void 0 ? "" : ` data-bubble-shape-transition-from="${s.from}" data-bubble-shape-transition-to="${s.to}" data-bubble-shape-transition-progress="${s.progress.toFixed(4)}"`;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${u}" viewBox="0 0 ${l} ${u}" role="img" data-bubble-renderer="canonical" data-bubble-style="${e.style}" data-bubble-body-width="${l}" data-bubble-body-height="${u}"${S}><title>${x}</title>${b}${y}</svg>`;
}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/constants.js
var Et = 2048, Dt = 2112, Ot = Uint8Array, kt = Uint16Array, At = Int32Array, jt = new Ot([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]), Mt = new Ot([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]), Nt = new Ot([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]), Pt = function(e, t) {
	for (var n = new kt(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new At(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, Ft = Pt(jt, 2), It = Ft.b, Lt = Ft.r;
It[28] = 258, Lt[258] = 28;
var Rt = Pt(Mt, 0), zt = Rt.b;
Rt.r;
for (var Bt = new kt(32768), q = 0; q < 32768; ++q) {
	var Vt = (q & 43690) >> 1 | (q & 21845) << 1;
	Vt = (Vt & 52428) >> 2 | (Vt & 13107) << 2, Vt = (Vt & 61680) >> 4 | (Vt & 3855) << 4, Bt[q] = ((Vt & 65280) >> 8 | (Vt & 255) << 8) >> 1;
}
for (var Ht = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new kt(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new kt(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new kt(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[Bt[d] >> c] = l;
	} else for (s = new kt(r), i = 0; i < r; ++i) e[i] && (s[i] = Bt[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), Ut = new Ot(288), q = 0; q < 144; ++q) Ut[q] = 8;
for (var q = 144; q < 256; ++q) Ut[q] = 9;
for (var q = 256; q < 280; ++q) Ut[q] = 7;
for (var q = 280; q < 288; ++q) Ut[q] = 8;
for (var Wt = new Ot(32), q = 0; q < 32; ++q) Wt[q] = 5;
var Gt = /*#__PURE__*/ Ht(Ut, 9, 1), Kt = /*#__PURE__*/ Ht(Wt, 5, 1), qt = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, Jt = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, Yt = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, Xt = function(e) {
	return (e + 7) / 8 | 0;
}, Zt = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new Ot(e.subarray(t, n));
}, Qt = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
], $t = function(e, t, n) {
	var r = Error(t || Qt[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, $t), !n) throw r;
	return r;
}, en = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new Ot(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new Ot(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new Ot(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = Jt(e, d, 1);
			var v = Jt(e, d + 1, 3);
			if (d += 3, !v) {
				var y = Xt(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && $t(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = Gt, m = Kt, h = 9, g = 5;
			else if (v == 2) {
				var S = Jt(e, d, 31) + 257, C = Jt(e, d + 10, 15) + 4, w = S + Jt(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new Ot(w), E = new Ot(19), D = 0; D < C; ++D) E[Nt[D]] = Jt(e, d + D * 3, 7);
				d += C * 3;
				for (var O = qt(E), k = (1 << O) - 1, A = Ht(E, O, 1), D = 0; D < w;) {
					var j = A[Jt(e, d, k)];
					d += j & 15;
					var y = j >> 4;
					if (y < 16) T[D++] = y;
					else {
						var M = 0, N = 0;
						for (y == 16 ? (N = 3 + Jt(e, d, 3), d += 2, M = T[D - 1]) : y == 17 ? (N = 3 + Jt(e, d, 7), d += 3) : y == 18 && (N = 11 + Jt(e, d, 127), d += 7); N--;) T[D++] = M;
					}
				}
				var P = T.subarray(0, S), F = T.subarray(S);
				h = qt(P), g = qt(F), p = Ht(P, h, 1), m = Ht(F, g, 1);
			} else $t(1);
			if (d > _) {
				c && $t(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var I = (1 << h) - 1, ee = (1 << g) - 1, L = d;; L = d) {
			var M = p[Yt(e, d) & I], R = M >> 4;
			if (d += M & 15, d > _) {
				c && $t(0);
				break;
			}
			if (M || $t(2), R < 256) n[f++] = R;
			else if (R == 256) {
				L = d, p = null;
				break;
			} else {
				var z = R - 254;
				if (R > 264) {
					var D = R - 257, B = jt[D];
					z = Jt(e, d, (1 << B) - 1) + It[D], d += B;
				}
				var te = m[Yt(e, d) & ee], ne = te >> 4;
				te || $t(3), d += te & 15;
				var F = zt[ne];
				if (ne > 3) {
					var B = Mt[ne];
					F += Yt(e, d) & (1 << B) - 1, d += B;
				}
				if (d > _) {
					c && $t(0);
					break;
				}
				s && l(f + 131072);
				var re = f + z;
				if (f < F) {
					var ie = a - F, ae = Math.min(F, re);
					for (ie + f < 0 && $t(3); f < ae; ++f) n[f] = r[ie + f];
				}
				for (; f < re; ++f) n[f] = n[f - F];
			}
		}
		t.l = p, t.p = L, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? Zt(n, 0, f) : n.subarray(0, f);
}, tn = /*#__PURE__*/ new Ot(0), nn = function(e) {
	(e[0] != 31 || e[1] != 139 || e[2] != 8) && $t(6, "invalid gzip data");
	var t = e[3], n = 10;
	t & 4 && (n += (e[10] | e[11] << 8) + 2);
	for (var r = (t >> 3 & 1) + (t >> 4 & 1); r > 0; r -= !e[n++]);
	return n + (t & 2);
}, rn = function(e) {
	var t = e.length;
	return (e[t - 4] | e[t - 3] << 8 | e[t - 2] << 16 | e[t - 1] << 24) >>> 0;
};
function an(e, t) {
	var n = nn(e);
	return n + 8 > e.length && $t(6, "invalid gzip data"), en(e.subarray(n, -8), { i: 2 }, t && t.out || new Ot(rn(e)), t && t.dictionary);
}
var on = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	on.decode(tn, { stream: !0 });
} catch {}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/swap.js
var sn = new Uint8Array(new Uint32Array([305419896]).buffer)[0] === 18;
function cn(e) {
	let t = e.length;
	for (let n = 0; n < t; n += 4) [e[n], e[n + 1], e[n + 2], e[n + 3]] = [
		e[n + 3],
		e[n + 2],
		e[n + 1],
		e[n]
	];
}
function ln(e) {}
var un = sn ? cn : ln, dn = new TextDecoder(), fn = class e {
	constructor(e) {
		if (e instanceof Uint8Array) {
			let t = 0, n = new DataView(e.buffer);
			if (this.highStart = n.getUint32(0, !0), this.errorValue = n.getUint32(4, !0), t = n.getUint32(8, !0), t !== 4294967295) throw Error("Trie created with old version of @cto.af/unicode-trie.");
			if (t = n.getUint32(12, !0), 16 + t > e.byteLength) throw RangeError("Invalid input length");
			let r = e.subarray(16 + t);
			this.values = r.length ? JSON.parse(dn.decode(an(r))) : [], e = an(e.subarray(16, 16 + t)), un(e), this.data = new Int32Array(e.buffer);
		} else ({data: this.data, highStart: this.highStart, errorValue: this.errorValue, values: this.values = []} = e);
	}
	static fromBase64(t) {
		return new e(new Uint8Array(atob(t).split("").map((e) => e.charCodeAt(0))));
	}
	get(e) {
		let t = this.errorValue;
		if (e < 0 || e > 1114111) t = this.errorValue;
		else if (e < 55296 || e > 56319 && e <= 65535) {
			let n = (this.data[e >> 5] << 2) + (e & 31);
			t = this.data[n];
		} else if (e <= 65535) {
			let n = (this.data[Et + (e - 55296 >> 5)] << 2) + (e & 31);
			t = this.data[n];
		} else if (e < this.highStart) {
			let n = this.data[Dt - 32 + (e >> 11)];
			n = this.data[n + (e >> 5 & 63)], n = (n << 2) + (e & 31), t = this.data[n];
		} else t = this.data[this.data.length - 4];
		return t;
	}
	getString(e) {
		let t = this.get(e);
		return this.values[t] ?? t;
	}
}, pn = fn.fromBase64("AAgOAAEAAAD/////nRQAAB+LCAC4xcFoAgPtnQnwlkUdx1+URLxABcUUghTEEK8Cmwp0LJAa\n   MRrFbBSPSXHSAUYNdFQoBWMKyQrUCo/EyMIjD3TIAxXJM5NBHBm0RDSPzDOVdAz7/nB/07bt\n   s8/e+/zhfef9zD7HPs/e129/u8/yzVutVWANeBl079xq9QJ9wUCwDxjqYQ4DI8BoMBYcBY4D\n   48FEw3NTwDTp/BxwAZgJLgaXgCvAAnADuA3cDe4Hj0rPLQerwLPgJfAaeBe8Az4EnT/Ram0D\n   eoBdwe5gENgX0DsOhHkQGAlGgTHgaHACGA8mgilgGpgBLgJzweVgPlgIbgF3iPOl4BGwAqwG\n   a8Er4C2wDnwEumzRanUDPUFv0B8MBgeAL4BDwNfAN8C3wIngO+A0cCZowd/nwrwA/Eic/wzm\n   L8EMHM+HuRDcDP4g7t8Hk3hYmI8BCv+TwvwLTOZvglfBawKyQ7wrjv8Ns1OXVqsroPNuwuwJ\n   szfoL86JwTgeIp3HYJj0vhE4Hg3GgnHgZMDhnYDjyWCqZP9CHM8Gc8S1y2BeBa4FvweLxPN3\n   wVwq7Dwirp0KVuB4NVgLXgSvg/fA+6C1Jf6gO+gF+oI9wQa3YQ4FwwDlwREwR4Mj+L6GY3Dv\n   eMN9OY7JPAV2Jwn7Z8E8F0wHs8AcMA9cA64Dt4I7wT3gQfA4eAI8DdaKd7wizLdgvg86dUWa\n   g+1BL0D3+sIcAAaLc5X9xfUDYR4EDlUYJR2PAUeCY8FJ4DRwJjgXTAezwBwwD1wDrgO3gjuF\n   G/fAfBA8Js5XwnwaPF/htypeFfbfhvm+w7OdtkL6Axe3thP2uSzuhPM+YICA6tZ9YA4FwwGV\n   55F0XTBGOlY5GhwHxoOJYAqYBn4AfiyOLwVXgvnSc9dKxzeC28XxEoNbbdq0iQvXEe24aNOm\n   TZs2bdq0aePC0ob55yFhPg5IHlI3Rl4Je8+I/vALMN+T7v3DMN5+B/c+BJ23hhwQ0LUeMM+G\n   OQrshuM9AMkJ94b5WfBF8GVwKPg6+CYgOc7xME8BLFsiJuH8LPA9MFO8/yJhMnNxfjm4AlwJ\n   rgK/AleD+e177Xvte+177XvR7/0O3ARuBSQzLcmd8ENJSoe/TZsmE9qfvR9l7FHwhNL3c+Ep\n   zbPP4trz4FXwT/AB2Gyb/7WzJc67g16gLxgIBgOasxkCcxgoXf/c2+1jDu7ean0fLDbwDvjc\n   9pi7Aj8H8r1V4vxlmLvtgLlCMBesBNvs+PG9g2GeBxaB5aB7j1brOczh9UN8nAiuBs8BGg8c\n   BqgP/xOqI2n+VvAQzile53T6L6NwLts5G+eLwSpxfT3M4dtiTg0sAevB8O1wDuT35GZJA9yX\n   461NmzZtNiXWow6cTrpKaCNGU3uhtPNjcW0cOEFq28fjeAI4HUwWz8iQbIvsrYM5VTw3HSbp\n   Fs2EebG4dpnGPYL0hM4n3SfcXyDsLhTmzTBvA3eI86VKn6MK0lshfao/kt9x/pjk7ydFW7lG\n   vIt0rl4W99+EuQ58BEh3jP3bBW1oVxHObjjeCfQB7B7bG8DXYJ5OelYwvwS+Ath9fuY0KT4O\n   E88dKcxjYJIs8NswT5WeVSG/k/0zYOcccL54nuLvh+QHmD8V5jJA8fILnP8Lz10N87eAdMRu\n   grlY9Bfo/AGYfwYrxPl9eOdqHK8l/+D47zDfFv76AOZmyFeTcLwVzB1AL9AXDAT7gSFgGBgB\n   yH87ks4ZjseK86+CcdQ+a8JI90/GvQniPtufjPOp4vkLYc4Gc8Hl4NfgesP7Fin3OE3uwvVl\n   4BGwQrKzGsd/BS+C18Hb4APhdif0J7sC1unbHsf83C7SMd3vh/O9yC4YCoaBQ8Aoyd4YHB8J\n   jgUngVMBlQ8qG2dI9nScg/sXgJngYsnupTi+EvxG+DMnXI7UuCZuNPjn9pqwboxQOeXwc50Q\n   gyUinh8wxPfDFfeW4/qqAvmmaVDb6PvsGiX+XvLM2/1Qb76xEZeLGOlEdTC1i+tEnNMx1Z8f\n   ivPOGJtvDXYEJNfw9eeueL4uHLvDziBA/Rb5+gG4Rvq0n5feQTKJXHp8rlBfaiT8R7KcKnnV\n   4Yb42BQ4wjL9joG9E8Apjul9uBL3TS+/kxC+74LzGpAvTHl7BvznUyYuwnM05iGoLM/F+Tzl\n   XdyHqStbZM4S5/PxjoXgJvEuWqvAdkmuKIeL6hV5TET9e6r/qsJPazHIvBfveQgsF248BXMF\n   1YcOcXGERXv4AslIPeNXhuL3TVFnroO5HmwB2WtT8j21Mdsa/NMT93qDDevFkJ79Fbsb1s7g\n   2hDLMFE/cZh434iAeKD3jDY8T/fHGu5TuMfVuH+y8KeOCeJZPp+cIU1JD4fcmiq5NVvIIaqe\n   oXJyIezPBpeAK8AC8Xxvi/5YXd1+A951C6C1R4uFeTdMurdMmC78Cc+sBM+ANdLzNF/xBlgH\n   PpKud8G8xXagB9gZ9AF0fQ+Yg8QxcQCOh4rz4TBHimM5TQ/HNT5egHDQfdZFOkrcI/nEcTge\n   Dyh+JsKcIt41TZgzYM5S3j9H8gsxD+dXSe4x10rXrleeyc2iwu6XhsJ/F8WBqMeJ/ysfBpaJ\n   PNKReXzzThvYDKd1YFn0hscg/tsALZ21ec4GsTS0hWLZou4kDX9oaELHdI1EeiT24ntUtVGX\n   g0yq7igpbCD7BL2HIXfl89RQWCgMHJ7ckPuUlpj63XBO8Y9pyE2aTf2nK5NQC4hWvuvoKfIl\n   lXkqGwzlz50EfMx1BOVhztP8HNvdWXlWhp6Xz8ndlOWN/V6K0u43Dc4fch7gc9s4U/OU/Azn\n   vZLkKrdNheqTKnzeVxff/FOvc19D/dW9SzZjkuKdMfPmxlrn5Ix3mzzWBKhs9NL4l9rxqj5J\n   06HwcD6W8zQf01iDzLrfLhmpc1vNVza/qvGXnP7UZ2PUcZlLnHOcksk0KZ+nyGe2412KW13c\n   p65rOQ3qwmCyo8afzi7bsY2PmPV4yfYqZl7qKO1F6nhyreNs6rvY+S9XnOjaai7TssxAHqfn\n   8GuV/9XrVfZi5PVcZaXK367u636hfuP8bCtL8u3np+6vURhK9BObUPZjxm+scZ0810DkrFfV\n   8uY6zgotWy5ygSq35DJYlyZqedWVX5s2UTeeqQqT6pZr+vJ4QRc/fF1uj6rCZYprU1hypG/d\n   sRznpnS1Sd+6dKzLa3X5wzZ9dfWEa5/Mtfzq0qRE+vqWX10eqErfkL6tOubxLb8s1zG54RLO\n   nPWzb/3pkl9z1J8ufcQqP9fl9ao6w9Re6cKsS7u6a3Xto2s81NWvpjxqW/5s5IEpxpncTtr2\n   4XPWpbHGWa79Idv0NMWZKR5i1aemn+38oxwum2dKpm+M9jJm+pr6RrHSV9eH9dXnyN0XijEO\n   i5GedX16VzluqvZXHr9UpY1P/9a1zSs176m2kbb+NY13qvKLjYwqtP1V/eLT//5kQ1B/1G8I\n   eZ/LfA3LgUzxw8dVcZYiLuvcjB33IX7wybe6NKM+gox8jfRq+JjSi87l+ViGrut0buvaqdhy\n   QPKj3MawSbqApBfLZoi81kcuXqV3XXc9VHbeBH0L+nF5N7W/Nm2NnBer+rasD9bEute1flTD\n   lst9Ux1vK8PWjZFD+x27Fma3wvQujG/fMFQ/0iX/hD7f9PClnr9OHX8+Mh65PTS1Iyn9UULX\n   M/b8vq9uKf9ID7KkjkvOtOe+om/8cxvu6meXubpY+jcuc0Wx3TeNBVOH33e+LKQ+rZM55pQd\n   cNz3kc4578rygFhy7Fj1H4872f88FpD1hNV1Iy76tbnr35Dyn1v3yCT3KhEnJdpnG1mui46u\n   ryzBNNaiH5eH0HFfbPlWqvouVX0ZKjdW65S68XQqfWC1nJSUO8eoj0OfjxGGUjI1V/erZGIh\n   P507n8qIa7z1tXinLK/sZwnb/7TS7+drNtj43+Y9sttN00121aMOnR+wTb/UuIZ/d4FrfydV\n   PSOXCRmf+jfl/E9KuUMpuVPMfnKMdQIucze69X6m8YPvngAl9yOwqWNt5Wsu+hSp9xRoytr0\n   UN3tunhPHQ91brDsoqqOZSivyed7iDzXX8p/JJ8le2QSA4C8lwntkcP7bvGxfC7bJfaUIDd5\n   j7CqsiCv/dYh+4HcIbkTYdpLgOWwbNdk31R/k/tqnKpy2oGB43o1H9js0cPhk/ebUfegsZVT\n   h8pW5D2aVNQ9nFzQPStf4+MQN4jYfZ4Q+TDndzUNTfqAVfs7uazFtc03KfaP0u3LZYvP877u\n   ++6zpf5SuOfiJ9+w6PylXtPdZ1Pdx80UZ1VxoYahLl/Y7tflUxbqwhyr7OjioCpuTOexymmM\n   99vGWe5960LdoT5PrDlkNn39yrIdFzdTxKkqa0o9n5NyfjbFL6T9i03O9jTEjVT9CZt61qWe\n   DAmTbX1rkw4ubWysflyu/Uh19Utdv8QUb/wevs/vlN3YK0J95hvGWP26FP0CXV0ix6XOfmi8\n   lNw7tlSc284PqXnZlKf5umpfVx7Ue3K5q4onnT9079H5h8ubyX5VGZHfIVOiPynLz2RkPSTV\n   /2p/0NZM2Ufw7dPm3tveJp46kn5prDC7miXDUCoOc7QdKeU9KeZZbNZTsw6ZKjPna6G6jLZ6\n   v6Y9S0rqHMbaN8j3flUbVIdpnonTleaP+JsiapunntfVOer7WUdXNw+jCyvNYxE6P9Ix+7Mu\n   TCa3uM3mb9JUmfLe1q59N19yulXnD5dfU/yRyn/8vR2Cr9H8JB/btsm29undfCw/56tbVmVX\n   d53nXtV0+Iw4rjNTk8udOvdtwl13j1B1YuT5b04HMpsW/7HCr8t/dF0Of846J3W9HPtdNnUf\n   x7UvpdsiV1mJjawiFLWODEm73G1mLF1J2/GB7X7UtvqhJeeTfPc4T7mPtLpuWqWJ66malIZV\n   Oq6uerCp9Oh1dlzCzrpIudKf92/hsZbP+hIbHa0Q/fQYe/v4lmd5T5s6veq6vYViyzJT69KV\n   2t/FlN451zKFrm3i9U0264J0fQOX9U5Vfe6S+xPRL8VaHJe8rK69qpNJqe92jX81XX3X2fr8\n   XPaHsq1PdPWWa12Sag1GaXmwT98pZ/2vy8+h7e8gsHdGcrvn+ou5l5j6K7GfmPobXJiY4xLb\n   d9C3GKnM2H7Xkd7j+z1I03X5ftWxjd9KwDLy0mNPV/fUtSCh4wyeF5DXS8nzWnSd9Jqrfrye\n   UWfa3NP1O131E9TnTDItvs/rn9Qwm9y3lS/yuiSdDK2J32LmH61l4/l7DpMcFl0cy/HpKvNU\n   5Z6yuzmgsPj4PZX78jydfMzx1BFk7Gr61smlU9yXf7w+UL7Pa5Fc9pe3lTntI+YJYvTvQ9Y9\n   x9gbNOU66lxyYJPsuqPtBRpjvW7uX6n9Y3LpfMUe8+fYy6sJ+99x2QyVR1TJrEvlz9Lxmzq8\n   Kct+jO8mpnIrV35pYv3rso+6j2w1RzkxpWeOslpV38Xey7lJ7XVVnDdFVyDn2o2m7A1s871r\n   U3+hbp661LfjbL6l6vL9O5v5uiqdcd/9mG3sVrlrktHl3m+5Ln46Qply/f51rDq2afV3U92P\n   9Z2CVPu71+kExf4uhm265Mpfcrjl9S+p/WGjb9FEeYmrHlhsXTLb772b2v3U8bKvoAk6VaQ3\n   ZdqvWf2FytNd9g1W/c57VNf9+JuMuXT+ZJ1tnZ6T7U+un1PXpSm/BxKiZ+b6nUC5P+bybdoU\n   3wWR9zP1WcOrrtc06dG7rA9gf6lzCCVlQKl1cKvW16r7MjdxPqHue3m55l5M6yRy1q8p6i+d\n   GzbfR5Dtqeeu1D2rulVlp+67ulXfzlDPqS/AP52us+kb5aoetdp226wrqOtHuvxc9InlsMrX\n   5HCkgvtULt80VtPB5tvHlLbU51R1leQ+nW0ftknjClM7Ktf7Pt9n161FKfULHbeU/P5brO/5\n   8PeveZ2l+s31OpmmizxP5z/VrssvNP7Vb9XbUGr+LWSdWKr4c/lemct7U/1KfJcs5nfiXNcz\n   Va3lCf2OXi75c+gaSd/4SyH/pmds+8G2fWCbvmwMeZapf6v2g9hU16vF7l/65K8cc6uh7bIs\n   W8jdLyyxp4BPPOru6+Qx8rd8beIyhew8xjoMtU8l90dcyldseUOJPpPLevpc7ZnvL8f4oaRO\n   ad34WVeefPYVSdG+27T7vPdESj0VV5leyvXoufQvffKZTpZmGy+27UNKfYCc5dWmj2fbp44Z\n   P6G/WN9X1cl8beoieS7ad7+PGP14nz1ATO1q3Xx2jHnpWO1xR1uPovumYQndrFD9uyrdvpD4\n   b9L8Yaz9wxl5bbVu/XlT9j2X/Rr6Hl7brYPd0V1jM5bOk+84oUn7xpeeH7IhVJ7j25+IrU9s\n   ig+XOi7lGMtGj9pGB903/kuMQVPuORpjv7+c35AvvYYkNO1CviFvU4/HkF+qe2ZTG+VTn1bt\n   fV7y5/PtqNR76oeuy4zlH3n/9ND3qPuxu7xb3cuj7heahiXq4ljrC1R5vm5M39HGFz7yzRLr\n   k1PoMMfcPzeGvDPWPssxw6Rzo8QcXmp3XGSSHX2/Et08k67f5dtmuupKN2FvMpOsKObeDnVx\n   k3ofp1h6VrFIVVdV7T2fYm9013l7k/5rbNlKaBuXso7LLV+K1d67uuWiJ19ShhcjvUP97FsO\n   Q+V7pdfDpy5rtv2qEPkU7XFY0v3Q+Oc8FpqHdHV9Xf415XFbPTPfPk7qNWsufow9vkqlz6v+\n   eA4udH9l3XxtiA5ZyN5XpvxSNzdetRdQlWnKjzbP695Xt9+WTz/bJk5y6tDVlYHUe0Crv9Bv\n   vMf+bnzq79DHenfs/ZD3y4TO7b0S7vPM8Z5yL2mTG1XXKcyMLh5093OzvwbVfzr/1hHDby7u\n   ufhH5z/Vrm1YZPsheUtn2pQh+RnfMmCqy3PN7aSeN0oRtrp8m6oONOXflHVfrnj0ccdU1lVS\n   yYu7Ssjz96ZwxEgz13rX1c3Y+Sp2vJve7eN+zP3nYsojYunAhMq1cs2vM1X9J99+Q2g+d+1z\n   5OznpXJD1zcKcc/U33KN39TzgCnr4lz95Fz1cW79kxT6SDF00UruT5ZDZ8Xl9x83MV0I0CwB\n   AB+LCAC4xcFoAgMdjksWhCAMBO/CelYzJ4gMCqiI4t/n/a9hyk29JN3p5DL7bj7GTQrbKypR\n   dDVVywyhZCz4xkUhnSIj5EExoFoQisIfbICE2WJOoAESSK7wecCscDJSxRXMbBAlfLCyIbTh\n   T8tr5/YikvVFSYq3dURbKo/gf+Q3zBCELycCXW/uB2mPjCb8AAAA"), mn = Object.fromEntries(pn.values.map((e, t) => [e, t])), { values: hn } = pn, { AI: gn, AL: _n, CJ: vn, CM: yn, NS: bn, SA: xn, SG: Sn, SP: Cn, XX: wn } = mn;
function Tn(e) {
	switch (e) {
		case null: return null;
		case -1: return "sot";
		case -2: return "eot";
		default: return hn[e];
	}
}
function En(e, t) {
	switch (e) {
		case gn:
		case Sn:
		case wn: return _n;
		case xn: return /^[\p{gc=Mn}\p{gc=Mc}]$/u.test(t) ? yn : _n;
		case vn: return bn;
	}
	return e;
}
var Dn = class {
	cp = -Infinity;
	cls = -1;
	char = "";
	len = 0;
	ignored = !1;
	constructor(e, t, n, r) {
		this.cls = e, this.cp = t, this.char = n, this.len = r;
	}
	[Symbol.for("nodejs.util.inspect.custom")](e, t, n) {
		return `${Tn(this.cls)}(${this.cp.toString(16).padStart(4, "0")}:${JSON.stringify(this.char)})${this.ignored ? "Ig" : ""}`;
	}
}, On = class {
	str = "";
	len = 0;
	prevChunk = 0;
	prev = new Dn(-1, -Infinity, "", 0);
	cur = new Dn(-1, -Infinity, "", 0);
	next = new Dn(-1, -Infinity, "", 0);
	LB8 = !1;
	spaces = !1;
	RI = 0;
	props = void 0;
	extra = {};
	constructor(e) {
		this.str = e, this.len = e.length;
	}
	push(e) {
		this.next.ignored ? this.cur.len = this.next.len : (this.prev = this.cur, this.cur = this.next), this.next = e;
	}
	pushEnd() {
		this.push(new Dn(-2, Infinity, "", this.next.len));
	}
	*codePoints(e, t = !0) {
		if (t) for (; e < this.len;) if (e === this.cur.len && this.next.cls >= 0) yield this.next, e += this.next.char.length;
		else {
			let t = this.str.codePointAt(e), n = String.fromCodePoint(t), r = pn.get(t);
			e += n.length, yield new Dn(En(r, n), t, n, e);
		}
		else for (; e > 0;) if (e === this.cur.len) yield this.cur, e -= this.cur.char.length;
		else if (e === this.prev.len) yield this.prev, e -= this.prev.char.length;
		else {
			let t = e - 1, n = this.str.charCodeAt(t);
			n >= 56320 && n <= 57343 && t--;
			let r = this.str.codePointAt(t), i = String.fromCodePoint(r);
			yield new Dn(En(pn.get(r), i), r, i, e), e = t;
		}
	}
	classAfterSpaces(e) {
		for (let { cls: t } of this.codePoints(e)) if (t !== Cn) return t;
		return -2;
	}
	afterNext(e = 1) {
		for (let t of this.codePoints(this.next.len)) if (--e <= 0) return t;
		return null;
	}
	setProp(e, t) {
		this.props ||= {}, this.props[e] = t;
	}
	[Symbol.for("nodejs.util.inspect.custom")](e, t, n) {
		let r = `${n(this.prev)} => ${n(this.cur)} => ${n(this.next)}`;
		return this.LB8 && (r += " LB8"), this.spaces && (r += " spaces"), this.RI > 0 && (r += ` RI: ${this.RI}`), this.props && (r += ` ${JSON.stringify(this.props)}`), r;
	}
}, kn = class {
	string = void 0;
	props = void 0;
	constructor(e, t = !1) {
		this.position = e, this.required = t;
	}
}, An = fn.fromBase64("AAAEAAAAAAD/////wQIAAB+LCAC1xcFoAgPtmj1IHUEQxzd5FiaEkMLSKqQIViEQCEmTjyqk\n   SUgR7OySTrHxdVoIYqUg2AgqFhYWFhYidpYqKDaClVZaqJWF2qj/xT1cjjtv772Z3T1uHvzY\n   753d2b252ds3+1SpRbAMVkGSrlMo5LNjIfqoB/uEfR2Ao5yy4zb7PgUX4Brcgo6GUi9AF+gG\n   r0EPeAc+AN3mM8KvJu6DH0bWb08yeyEneV77rHia/yjbMvEBxJum7mCqzQjSo1beuBWfRFy3\n   1fHpR2QJgiAIgiAIgiAIQpoZc45c8HhGd2WJYUyy5oIgCP5oRPhuEQQh7vvPVuAe34q5x1lH\n   uJFh15J7HRt9Z7MJ9iKwg1fP72kG4osqz3ynUlNPHjhC2i5/9UypX8DOa6bSa0hfAbsf33zE\n   /EPLr7NtOYj4zlTfD+v7dG0r8uzhXM39qEPH9TtBvTNwUXK9dyv0frzE3DSxje8mZ0yNjuz8\n   zlT+S6T1OnQh7M5oo+f+Bvk67EGY/OfiPeKfTL5+hr6ZuM13k/cT4R/QC86tMfdZbf4a2Un6\n   H9L9OXNIGCoo12yDYdR7mzG+tP8yhjoTpt607tuh/6r7b1VG7yv5ya/OP7iZQXEdYyi9UNel\n   WKM83YTQE/f8qftudz9y7G/OdWlXLxTPYRm9cu+ZMutMaYuK2tnjyqpb5jnPa8+xH7n3eJFO\n   ivRGbTNC6su3PeHYM0V7OxZ/hUtWLP5ZFfzDmMYQSieU8qj78rF3fMsI+axX5fwWYvw+5t9u\n   f0VnNR964yh31bdLOce8qfYb11ndVWeUvibHfCj8tZD2LNZvTRyyW/GfQr1/OM8gob/LcPn8\n   If3iVmVT23Iu/69KaxHzOYn6XenTNw1551DW/3V5X7v6c9Tfh7jPX9TrFtqOhjgPttqeW28u\n   33192kvqs2vW7w7BeyuJcEoAAB+LCAC1xcFoAgOLVvJT0lGKVIoFANHfAiwJAAAA");
Object.fromEntries(An.values.map((e, t) => [e, t]));
var { values: jn } = An, { AK: Mn, AL: Nn, AP: Pn, AS: Fn, B2: In, BA: Ln, BB: Rn, BK: zn, CB: Bn, CL: Vn, CM: Hn, CP: Un, CR: Wn, EB: Gn, EM: Kn, EX: qn, GL: Jn, H2: Yn, H3: Xn, HH: Zn, HL: Qn, HY: $n, ID: er, IN: tr, IS: nr, JL: rr, JT: ar, JV: or, LF: sr, NU: cr, OP: lr, NL: ur, NS: dr, PO: fr, PR: pr, RI: mr, SP: J, SY: hr, QU: gr, VF: _r, VI: vr, WJ: yr, ZW: br, ZWJ: xr } = mn, Sr = /* @__PURE__ */ new Set([
	Nn,
	Qn,
	cr
]), Cr = /* @__PURE__ */ new Set([
	zn,
	Wn,
	sr,
	ur,
	J,
	br
]), wr = /* @__PURE__ */ new Set([
	er,
	Gn,
	Kn
]), Tr = /* @__PURE__ */ new Set([
	rr,
	or,
	Yn,
	Xn
]), Er = /* @__PURE__ */ new Set([
	rr,
	or,
	ar,
	Yn,
	Xn
]), Dr = /* @__PURE__ */ new Set([or, ar]), Or = /* @__PURE__ */ new Set([
	J,
	Jn,
	yr,
	Vn,
	gr,
	Un,
	qn,
	nr,
	hr,
	zn,
	Wn,
	sr,
	ur,
	br
]), kr = /* @__PURE__ */ new Set([
	-1,
	zn,
	Wn,
	sr,
	ur,
	lr,
	gr,
	Jn,
	J,
	br
]), Y = Symbol("PASS"), X = Symbol("NO_BREAK"), Ar = Symbol("MAY_BREAK"), jr = Symbol("MUST_BREAK");
function Mr(e) {
	return e.cur.cls === -1 && e.next.cls !== -2 ? X : Y;
}
function Nr(e) {
	return e.next.cls === -2 && (e.cur.len === 0 || e.cur.len !== e.prevChunk) ? jr : Y;
}
function Pr(e) {
	return e.cur.cls === zn ? jr : Y;
}
function Fr(e) {
	switch (e.cur.cls) {
		case Wn: return e.next.cls === sr ? X : jr;
		case sr:
		case ur: return jr;
	}
	return Y;
}
function Ir(e) {
	switch (e.next.cls) {
		case zn:
		case Wn:
		case sr:
		case ur: return X;
	}
	return Y;
}
function Lr(e) {
	return e.cur.cls !== mr && (e.RI = 0), e.spaces ? (e.next.cls !== J && (e.spaces = !1), X) : Y;
}
function Rr(e) {
	if (e.next.cls === br) return X;
	if (e.next.cls === J) switch (e.cur.cls) {
		case br:
		case lr:
		case gr:
		case Vn:
		case Un:
		case In: break;
		default: return X;
	}
	return Y;
}
function zr(e) {
	return e.LB8 ? (e.LB8 = !1, Ar) : e.cur.cls === br ? e.next.cls === J ? (e.LB8 = !0, X) : Ar : Y;
}
function Br(e) {
	return e.cur.cls === xr ? X : Y;
}
function Vr(e) {
	return !Cr.has(e.cur.cls) && (e.next.cls === Hn || e.next.cls === xr) ? (e.next.ignored = !0, X) : Y;
}
function Hr(e) {
	return e.cur.cls === Hn && (e.cur.cls = Nn), e.next.cls === Hn && (e.next.cls = Nn), Y;
}
function Ur(e) {
	return e.next.cls === yr || e.cur.cls === yr ? X : Y;
}
function Wr(e) {
	return e.cur.cls === Jn ? X : Y;
}
function Gr(e) {
	if (e.next.cls === Jn) switch (e.cur.cls) {
		case J:
		case Ln:
		case $n:
		case Zn: return Y;
		default: return X;
	}
	return Y;
}
function Kr(e) {
	switch (e.next.cls) {
		case Vn:
		case Un:
		case qn:
		case hr: return X;
	}
	return Y;
}
function qr(e) {
	return e.cur.cls === lr ? (e.next.cls === J && (e.spaces = !0), X) : Y;
}
function Jr(e) {
	return kr.has(e.prev.cls) && /^\p{Pi}$/u.test(e.cur.char) && e.cur.cls === gr ? (e.spaces = !0, X) : Y;
}
function Yr(e) {
	if (/^\p{gc=Pf}$/u.test(e.next.char) && e.next.cls === gr) {
		let t = e.afterNext();
		if (!t || Or.has(t.cls)) return X;
	}
	return Y;
}
function Xr(e) {
	return e.cur.cls === J && e.next.cls === nr && e.afterNext()?.cls === cr ? Ar : Y;
}
function Zr(e) {
	return e.next.cls === nr ? X : Y;
}
function Qr(e) {
	if (e.cur.cls === Vn || e.cur.cls === Un) {
		if (e.classAfterSpaces(e.cur.len) === dr) return e.next.cls === J && (e.spaces = !0), X;
		if (e.next.cls === J) return X;
	}
	return Y;
}
function $r(e) {
	if (e.cur.cls === In) {
		if (e.classAfterSpaces(e.cur.len) === In) return e.next.cls === J && (e.spaces = !0), X;
		if (e.next.cls === J) return X;
	}
	return Y;
}
function ei(e) {
	return e.cur.cls === J ? Ar : Y;
}
function ti(e) {
	return e.next.cls === gr && !/^\p{Pi}$/u.test(e.next.char) || e.cur.cls === gr && !/^\p{Pf}$/u.test(e.cur.char) ? X : Y;
}
function ni(e) {
	if (!An.get(e.cur.cp) && e.next.cls === gr) return X;
	if (e.next.cls === gr) {
		let t = e.afterNext();
		if (!t || !An.get(t.cp)) return X;
	}
	return e.cur.cls === gr && !An.get(e.next.cp) || (e.prev.cls === -1 || !An.get(e.prev.cp)) && e.cur.cls === gr ? X : Y;
}
function ri(e) {
	return e.cur.cls === Bn || e.next.cls === Bn ? Ar : Y;
}
var ii = /* @__PURE__ */ new Set([
	-1,
	zn,
	Wn,
	sr,
	ur,
	J,
	br,
	Bn,
	Jn
]);
function ai(e) {
	return ii.has(e.prev.cls) && (e.cur.cls === $n || e.cur.cls === Zn) && (e.next.cls === Nn || e.next.cls === Qn) ? X : Y;
}
function oi(e) {
	if (e.cur.cls === Rn) return X;
	switch (e.next.cls) {
		case Ln:
		case Zn:
		case $n:
		case dr: return X;
	}
	return Y;
}
function si(e) {
	return e.prev.cls === Qn && (e.cur.cls === $n || e.cur.cls === Zn) && e.next.cls !== Qn ? X : Y;
}
function ci(e) {
	return e.cur.cls === hr && e.next.cls === Qn ? X : Y;
}
function li(e) {
	return e.next.cls === tr ? X : Y;
}
function ui(e) {
	switch (e.cur.cls) {
		case Nn:
		case Qn:
			if (e.next.cls === cr) return X;
			break;
		case cr: if (e.next.cls === Nn || e.next.cls === Qn) return X;
	}
	return Y;
}
function di(e) {
	return e.cur.cls === pr && wr.has(e.next.cls) || e.next.cls === fr && wr.has(e.cur.cls) ? X : Y;
}
function fi(e) {
	return (e.cur.cls === pr || e.cur.cls === fr) && (e.next.cls === Nn || e.next.cls === Qn) || (e.cur.cls === Nn || e.cur.cls === Qn) && (e.next.cls === pr || e.next.cls === fr) ? X : Y;
}
var pi = /* @__PURE__ */ new Set([fr, pr]), mi = /* @__PURE__ */ new Set([Vn, Un]);
function hi(e) {
	let t = null;
	if (pi.has(e.next.cls) ? t = mi.has(e.cur.cls) ? e.prev.len : e.cur.len : e.next.cls === cr && (t = e.cur.len), t !== null) SyIsLoop: for (let { cls: n } of e.codePoints(t, !1)) switch (n) {
		case hr:
		case nr: continue;
		case cr: return X;
		default: break SyIsLoop;
	}
	if (e.cur.cls === fr || e.cur.cls === pr) {
		if (e.next.cls === lr) {
			let t = e.afterNext();
			if (t && (t.cls === cr || t.cls === nr && e.afterNext(2)?.cls === cr)) return X;
		} else if (e.next.cls === cr) return X;
	}
	return e.cur.cls === $n && e.next.cls === cr || e.cur.cls === nr && e.next.cls === cr ? X : Y;
}
function gi(e) {
	switch (e.cur.cls) {
		case rr:
			if (Tr.has(e.next.cls)) return X;
			break;
		case or:
		case Yn:
			if (Dr.has(e.next.cls)) return X;
			break;
		case ar:
		case Xn: if (e.next.cls === ar) return X;
	}
	return Y;
}
function _i(e) {
	switch (e.cur.cls) {
		case rr:
		case or:
		case ar:
		case Yn:
		case Xn:
			if (e.next.cls === fr) return X;
			break;
		case pr: if (Er.has(e.next.cls)) return X;
	}
	return Y;
}
function vi(e) {
	return (e.cur.cls === Nn || e.cur.cls === Qn) && (e.next.cls === Nn || e.next.cls === Qn) ? X : Y;
}
function yi(e) {
	let { prev: t, cur: n, next: r } = e;
	function i(e) {
		return e.cls === Mn || e.char === "◌" || e.cls === Fn;
	}
	return n.cls === Pn && i(r) || i(n) && (r.cls === _r || r.cls === vr) || i(t) && n.cls === vr && (r.cls === Mn || r.char === "◌") || i(n) && i(r) && e.afterNext()?.cls === _r ? X : Y;
}
function bi(e) {
	return e.cur.cls === nr && (e.next.cls === Nn || e.next.cls === Qn) ? X : Y;
}
function xi(e) {
	switch (e.cur.cls) {
		case Nn:
		case Qn:
		case cr:
			if (e.next.cls === lr && !An.get(e.next.cp)) return X;
			break;
		case Un: if (!An.get(e.cur.cp) && Sr.has(e.next.cls)) return X;
	}
	return Y;
}
function Si(e) {
	if (e.cur.cls === mr) {
		if (e.next.cls === mr && ++e.RI % 2 != 0) return X;
	} else e.RI = 0;
	return Y;
}
function Ci(e) {
	return e.cur.cls === Gn && e.next.cls === Kn || e.next.cls === Kn && /^\p{ExtPict}$/u.test(e.cur.char) && /^\p{gc=Cn}$/u.test(e.cur.char) ? X : Y;
}
function wi() {
	return Ar;
}
var Ti = [
	Mr,
	Nr,
	Pr,
	Fr,
	Ir,
	Lr,
	Rr,
	zr,
	Br,
	Vr,
	Hr,
	Ur,
	Wr,
	Gr,
	Kr,
	qr,
	Jr,
	Yr,
	Xr,
	Zr,
	Qr,
	$r,
	ei,
	ti,
	ni,
	ri,
	ai,
	si,
	oi,
	ci,
	li,
	ui,
	di,
	fi,
	hi,
	gi,
	_i,
	vi,
	yi,
	bi,
	xi,
	Si,
	Ci,
	wi
], Ei = class {
	#e;
	constructor(e = {}) {
		if (this.#e = {
			string: !1,
			example7: !1,
			verbose: !1,
			...e
		}, this.rules = [...Ti], this.#e.example7) throw Error("'example7' flag deprecated");
		this.#e.verbose && this.rules.unshift((e) => (console.log(e.cur.len, e), Y));
	}
	removeRule(...e) {
		let t = [];
		return this.rules = this.rules.filter((n) => !e.includes(n.name) || (t.push(n), !1)), t;
	}
	addRuleAfter(e, ...t) {
		let n = this.rules.findIndex((t) => t.name === e);
		if (n === -1) throw Error(`Rule not found: "${e}"`);
		return this.rules.splice(n + 1, 0, ...t), n + 1;
	}
	addRuleBefore(e, ...t) {
		let n = this.rules.findIndex((t) => t.name === e);
		if (n === -1) throw Error(`Rule not found: "${e}"`);
		return this.rules.splice(n, 0, ...t), n;
	}
	replaceRule(e, ...t) {
		let n = this.rules.findIndex((t) => t.name === e);
		if (n === -1) throw Error(`Rule not found: "${e}"`);
		return this.rules.splice(n, 1, ...t);
	}
	#t(e) {
		for (let t of this.rules) {
			let n = t.call(this, e);
			switch (n) {
				case Y: break;
				case X: return this.#e.verbose && console.log(`  ${t.name}: NO_BREAK`), null;
				case Ar: return this.#e.verbose && console.log(`  ${t.name}: MAY_BREAK`), new kn(e.cur.len);
				case jr: return this.#e.verbose && console.log(`  ${t.name}: MUST_BREAK`), new kn(e.cur.len, !0);
				default: throw Error(`Invalid state: "${n}"`);
			}
		}
		return null;
	}
	*#n(e) {
		let t = this.#t(e);
		t && (this.#e.string && (t.string = e.str.slice(e.prevChunk, e.cur.len)), e.props &&= (t.props = e.props, void 0), yield t, e.prevChunk = e.cur.len);
	}
	*breaks(e) {
		let t = new On(e);
		for (let e of t.codePoints(0)) t.push(e), yield* this.#n(t);
		t.pushEnd(), yield* this.#n(t);
	}
};
//#endregion
//#region src/text-layout.ts
function Di(e, t) {
	let n = new Intl.Segmenter(t, { granularity: "grapheme" }), r = /* @__PURE__ */ new Set([0]);
	for (let t of n.segment(e)) r.add(t.index + t.segment.length);
	return r;
}
var Oi = class {
	#e = new Ei();
	#t;
	constructor(e = "ja") {
		this.#t = e;
	}
	getBreakOpportunities(e) {
		let t = Di(e, this.#t), n = /* @__PURE__ */ new Map();
		for (let r of this.#e.breaks(e)) t.has(r.position) && n.set(r.position, (n.get(r.position) ?? !1) || r.required);
		return Object.freeze([...n].sort(([e], [t]) => e - t).map(([e, t]) => Object.freeze({
			position: e,
			required: t
		})));
	}
}, ki = /* @__PURE__ */ new Map(), Ai = /\r\n|[\n\r\v\f\u0085\u2028\u2029]/gu;
function ji(e) {
	let t = ki.get(e);
	if (t) return t;
	let n = new Oi(e);
	return ki.set(e, n), n;
}
function Mi(e, t) {
	if (!Number.isFinite(e) || e < 0) throw TypeError(`${t} must return a non-negative finite number.`);
	return e;
}
function Ni(e, t, n) {
	let r = /* @__PURE__ */ new Map();
	for (let i of t.getBreakOpportunities(e)) {
		let { position: t, required: a } = i;
		!Number.isInteger(t) || t <= 0 || t > e.length || !n.has(t) || r.set(t, (r.get(t) ?? !1) || a);
	}
	return r.set(e.length, !0), [...r].sort(([e], [t]) => e - t).map(([e, t]) => ({
		position: e,
		required: t
	}));
}
function Pi(e, t, n, r, i) {
	if (e.length === 0) return [{
		text: "",
		start: t,
		end: t,
		width: 0
	}];
	let a = Di(e, i), o = [...a].sort((e, t) => e - t), s = Ni(e, r, a), c = [], l = 0;
	for (; l < e.length;) {
		let r = s.find((e) => e.position > l && e.required)?.position ?? e.length, i, a = 0;
		for (let t of s) {
			if (t.position <= l || t.position > r) continue;
			let o = e.slice(l, t.position), s = Mi(n.measureText(o), "measureText");
			s <= n.maxWidth && (i = t.position, a = s);
		}
		if (i === void 0) {
			let t = o.filter((e) => e > l && e <= r);
			for (let r of t) {
				let t = e.slice(l, r), o = Mi(n.measureText(t), "measureText");
				o <= n.maxWidth && (i = r, a = o);
			}
			i === void 0 && (i = t[0] ?? r, a = Mi(n.measureText(e.slice(l, i)), "measureText"));
		}
		c.push({
			text: e.slice(l, i),
			start: t + l,
			end: t + i,
			width: a
		}), l = i;
	}
	return c;
}
function Fi(e) {
	if (typeof e.text != "string") throw TypeError("text must be a string.");
	if (!Number.isFinite(e.maxWidth) || e.maxWidth <= 0) throw TypeError("maxWidth must be a positive finite number.");
	if (typeof e.measureText != "function") throw TypeError("measureText must be a function.");
	let t = e.locale ?? "ja", n = e.lineBreakProvider ?? ji(t), r = [], i = 0;
	for (let a of e.text.matchAll(Ai)) {
		let o = a.index;
		r.push(...Pi(e.text.slice(i, o), i, e, n, t)), i = o + a[0].length;
	}
	return r.push(...Pi(e.text.slice(i), i, e, n, t)), Object.freeze({
		lines: Object.freeze(r.map((e) => Object.freeze(e))),
		maxLineWidth: Math.max(0, ...r.map((e) => e.width))
	});
}
//#endregion
//#region src/reveal.ts
var Ii = Object.freeze([
	"CHARACTER",
	"WORD",
	"LINE",
	"BLOCK"
]);
function Li(e) {
	let t = globalThis.Intl?.Segmenter;
	return typeof t == "function" ? [...new t(void 0, { granularity: "grapheme" }).segment(e)].map(({ segment: e }) => e) : Array.from(e);
}
function Ri(e) {
	if (typeof e != "string" || !Ii.includes(e)) throw TypeError("Bubble reveal unit must be CHARACTER, WORD, LINE, or BLOCK.");
	return e;
}
function zi(e) {
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
	let r = Ri(t.unit), i = t.delimiters ?? " 	\r\n";
	if (typeof i != "string" || i.length === 0) throw TypeError("Bubble WORD delimiters must be a non-empty string.");
	let a = t.showDelimiters ?? !1;
	if (typeof a != "boolean") throw TypeError("Bubble reveal showDelimiters must be boolean.");
	let o = t.layout ?? "DYNAMIC";
	if (o !== "DYNAMIC" && o !== "RESERVED") throw TypeError("Bubble reveal layout must be DYNAMIC or RESERVED.");
	let s = t.intervalSeconds ?? 0;
	if (typeof s != "number" || !Number.isFinite(s) || s < 0) throw TypeError("Bubble reveal intervalSeconds must be zero or greater.");
	let c = t.sound;
	if (c !== void 0 && (typeof c != "string" || c.length === 0)) throw TypeError("Bubble reveal sound must be a non-empty asset name.");
	return Object.freeze({
		unit: r,
		delimiters: i,
		showDelimiters: a,
		layout: o,
		intervalSeconds: s,
		...c === void 0 ? {} : { sound: c }
	});
}
function Bi(e, t, n) {
	let r = new Set(Array.from(t)), i = [], a = "";
	for (let t of Li(e)) a += t, r.has(t) && ((n || a.slice(0, -t.length).length > 0) && i.push(n ? a : a.slice(0, -t.length)), a = "");
	return a.length > 0 && i.push(a), i.filter((e) => e.length > 0);
}
function Vi(e, t) {
	if (e.length === 0) return Object.freeze([""]);
	if (t.unit === "CHARACTER") return Object.freeze(Li(e));
	if (t.unit === "WORD") {
		let n = Bi(e, t.delimiters, t.showDelimiters);
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
	let i = r;
	return Object.freeze(i.length > 0 ? i : [e]);
}
function Hi(e, t) {
	return e.slice(0, Math.max(0, Math.min(t, e.length))).join("");
}
//#endregion
//#region src/portrait-layout.ts
var Ui = Object.freeze([
	"left",
	"right",
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right"
]), Wi = Object.freeze({
	x: 0,
	y: 0,
	zoomPercent: 100
});
function Gi(e) {
	if (typeof e != "string") throw TypeError("Bubble portrait placement must be a string.");
	let t = e.trim().toLowerCase().replaceAll("_", "-");
	if (!Ui.includes(t)) throw TypeError(`Unsupported Bubble portrait placement: ${e}`);
	return t;
}
function Ki(e) {
	if (!Array.isArray(e) || e.length !== 2 && e.length !== 3) throw TypeError("Bubble portrait offset must be [x, y] or [x, y, zoom].");
	let [t, n, r = 100] = e;
	if (![
		t,
		n,
		r
	].every(Number.isFinite) || r <= 0) throw TypeError("Bubble portrait offset values must be finite and zoom positive.");
	return Object.freeze({
		x: t,
		y: n,
		zoomPercent: r
	});
}
function qi(e) {
	if (typeof e != "number" || !Number.isFinite(e) || e < 0) throw TypeError("Bubble portrait corner radius must be zero or greater.");
	return e;
}
var Ji = Object.freeze([
	"placement",
	"maxWidth",
	"textLocale",
	"distance",
	"tailLength",
	"offset",
	"visualStyle",
	"portrait",
	"continueIndicator",
	"reveal",
	"audio",
	"showAnimation",
	"hideAnimation"
]);
function Yi(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Xi(e) {
	return !Yi(e) || typeof e.textStyle != "string" || e.textStyle.trim() !== "default" ? "custom" : Ji.every((t) => e[t] === void 0) ? "scratch-default" : "custom";
}
function Zi(e) {
	let t = 0;
	for (let n of e) if (!/\p{Mark}/u.test(n)) {
		if (/\s/u.test(n)) {
			t += .35;
			continue;
		}
		t += (n.codePointAt(0) ?? 0) <= 127 ? .62 : 1;
	}
	return t * 14;
}
function Qi(e, t = Zi) {
	let n = Fi({
		text: e.slice(0, 330),
		maxWidth: 170,
		measureText: (e) => {
			let n;
			try {
				n = t(e);
			} catch {
				return Zi(e);
			}
			return Number.isFinite(n) && n >= 0 ? n : Zi(e);
		}
	}), r = Object.freeze(n.lines.map((e) => Object.freeze({
		text: e.text,
		width: e.width
	})));
	return Object.freeze({
		lines: r,
		maxLineWidth: Math.max(0, ...r.map((e) => e.width)),
		text: r.map((e) => e.text).join("\n")
	});
}
function $i(e) {
	let t = Math.max(1, e.lines.length), n = Math.max(e.maxLineWidth, 50) + 20, r = 16 * t + 20;
	return Object.freeze({
		bodyHeight: r + 4,
		bodyWidth: n + 4,
		height: r + 4 + 12,
		paddedHeight: r,
		paddedWidth: n,
		width: n + 4
	});
}
function ea(e) {
	let t = -e.stageWidth / 2, n = e.stageWidth / 2, r = e.stageHeight / 2, i = e.pointsLeft;
	!i && e.width + e.bounds.right > n && e.bounds.left - e.width > t ? i = !0 : i && e.bounds.left - e.width < t && e.width + e.bounds.right < n && (i = !1);
	let a = i ? Math.min(n - e.width, Math.max(t, e.bounds.left - e.width)) : Math.max(t, Math.min(n - e.width, e.bounds.right)), o = Math.min(r, e.bounds.bottom + e.height);
	return Object.freeze({
		centerX: a + e.width / 2,
		centerY: o - e.height / 2,
		left: a,
		pointsLeft: i,
		top: o
	});
}
function ta(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function na(e) {
	let { paddedHeight: t, paddedWidth: n } = e, r = Math.min(16, n / 2, t / 2);
	return [
		`M ${r} ${t}`,
		`Q 0 ${t} 0 ${t - r}`,
		`L 0 ${r}`,
		`Q 0 0 ${r} 0`,
		`L ${n - r} 0`,
		`Q ${n} 0 ${n} ${r}`,
		`L ${n} ${t - r}`,
		`Q ${n} ${t} ${n - r} ${t}`
	].join(" ");
}
function ra(e) {
	let { paddedHeight: t, paddedWidth: n } = e;
	return `<path d="${`${na(e)} C ${n - 16} ${t + 4} ${n - 12} ${t + 8} ${n - 12} ${t + 10} Q ${n - 12} ${t + 12} ${n - 14} ${t + 12} C ${n - 17} ${t + 12} ${n - 27} ${t + 8} ${n - 32} ${t} Z`}" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4" stroke-linejoin="round"/>`;
}
function ia(e) {
	let { paddedHeight: t, paddedWidth: n } = e;
	return `<path d="${`${na(e)} L ${n - 28} ${t} A 4 4 0 0 1 ${n - 36} ${t} Z`}" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4" stroke-linejoin="round"/><circle cx="${n - 25.25}" cy="${t + 7.25}" r="2.25" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4"/><circle cx="${n - 17.5}" cy="${t + 9.5}" r="1.5" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4"/>`;
}
function aa(e) {
	let t = $i(e.layout), n = e.kind === "say" ? ra(t) : ia(t), r = e.pointsLeft ? `translate(${t.width} 0) scale(-1 1) translate(2 2)` : "translate(2 2)", i = e.layout.lines.map((e, t) => `<text x="12" y="${24.6 + 16 * t}" fill="#575E75" font-family="Helvetica, sans-serif" font-size="14" xml:space="preserve">${ta(e.text)}</text>`).join(""), a = ta(e.title ?? `${e.kind} bubble`);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t.width}" height="${t.height}" viewBox="0 0 ${t.width} ${t.height}" role="img" data-bubble-profile="scratch-default" data-bubble-kind="${e.kind}"><title>${a}</title><g transform="${r}">${n}</g>${i}</svg>`;
}
//#endregion
//#region src/composition.ts
var Z = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleCompositionError", this.code = e;
	}
}, oa = /* @__PURE__ */ new Set(["say", "think"]), sa = /* @__PURE__ */ new Set([
	"idle",
	"talking",
	"awaiting-continue"
]), ca = /* @__PURE__ */ new Set([
	"fadeIn",
	"fadeOut",
	"floatIn",
	"floatOut",
	"zoomIn",
	"zoomOut",
	"riseUp",
	"sink",
	"shake",
	"explode",
	"animateBubbleShape"
]), la = /* @__PURE__ */ new Set([
	"linear",
	"easeIn",
	"easeOut",
	"easeInOut"
]);
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function ua(e, t, n, r) {
	let i = /* @__PURE__ */ new Set([...t, ...n]), a = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t)), o = Object.keys(e).filter((e) => !i.has(e));
	if (a.length > 0 || o.length > 0) throw new Z("BUBBLE-COMPOSITION-001", `${r} has missing or unknown properties.`);
}
function da(e, t) {
	if (typeof e != "string" || e.trim().length === 0) throw new Z("BUBBLE-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e.trim();
}
function fa(e, t) {
	if (typeof e != "string" || e.length === 0) throw new Z("BUBBLE-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e;
}
function pa(e, t, n) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", `${t} must be an object.`);
	if (ua(e, ["frames", "frameIntervalSeconds"], [], t), !Array.isArray(e.frames) || e.frames.length < n) throw new Z("BUBBLE-COMPOSITION-001", `${t}.frames must contain at least ${n} image asset name${n === 1 ? "" : "s"}.`);
	let r = Object.freeze(e.frames.map((e, n) => fa(e, `${t}.frames[${n}]`))), i = e.frameIntervalSeconds;
	if (typeof i != "number" || !Number.isFinite(i) || i <= 0) throw new Z("BUBBLE-COMPOSITION-001", `${t}.frameIntervalSeconds must be a positive finite number.`);
	return Object.freeze({
		frames: r,
		frameIntervalSeconds: i
	});
}
function ma(e) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble portrait must be an object.");
	ua(e, ["base"], [
		"blink",
		"lipSync",
		"placement",
		"offset",
		"cornerRadius"
	], "Bubble portrait");
	let t = e.blink === void 0 ? void 0 : pa(e.blink, "Bubble portrait blink", 1), n = e.lipSync === void 0 ? void 0 : pa(e.lipSync, "Bubble portrait lip-sync", 1), r, i, a;
	try {
		r = Gi(e.placement ?? "left"), i = e.offset === void 0 ? Wi : Ki(e.offset), a = qi(e.cornerRadius ?? 0);
	} catch (e) {
		throw new Z("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble portrait layout is invalid.");
	}
	return Object.freeze({
		base: fa(e.base, "Bubble portrait base"),
		...t === void 0 ? {} : { blink: t },
		...n === void 0 ? {} : { lipSync: n },
		placement: r,
		offset: i,
		cornerRadius: a
	});
}
function ha(e, t) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", `${t} must be an object.`);
	if (ua(e, ["name"], [
		"durationSeconds",
		"ease",
		"direction",
		"count",
		"relativeScale",
		"speed",
		"visualStyle"
	], t), !ca.has(e.name)) throw new Z("BUBBLE-COMPOSITION-001", `${t}.name is not a supported Bubble motion.`);
	let n = (n, r, i = !1) => {
		let a = e[n];
		if (a !== void 0) {
			if (typeof a != "number" || !Number.isFinite(a) || a < r || i && !Number.isInteger(a)) throw new Z("BUBBLE-COMPOSITION-001", `${t}.${n} is invalid.`);
			return a;
		}
	}, r = n("durationSeconds", 0), i = n("count", 1, !0), a = n("relativeScale", 0), o = n("speed", 0), s = e.direction;
	if (s !== void 0 && typeof s != "number" && typeof s != "string") throw new Z("BUBBLE-COMPOSITION-001", `${t}.direction is invalid.`);
	let c = e.ease ?? "easeInOut";
	if (typeof c != "string" || !la.has(c)) throw new Z("BUBBLE-COMPOSITION-001", `${t}.ease is invalid.`);
	let l = e.visualStyle;
	if (l !== void 0 && (typeof l != "string" || !$e.includes(l))) throw new Z("BUBBLE-COMPOSITION-001", `${t}.visualStyle is invalid.`);
	return Object.freeze({
		name: e.name,
		...r === void 0 ? {} : { durationSeconds: r },
		ease: c,
		...s === void 0 ? {} : { direction: s },
		...i === void 0 ? {} : { count: i },
		...a === void 0 ? {} : { relativeScale: a },
		...o === void 0 ? {} : { speed: o },
		...l === void 0 ? {} : { visualStyle: l }
	});
}
function ga(e) {
	if (e === void 0) return;
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble audio must be an object.");
	ua(e, [], [
		"voice",
		"reveal",
		"finish"
	], "Bubble audio");
	let t = {};
	for (let n of [
		"voice",
		"reveal",
		"finish"
	]) {
		let r = e[n];
		r !== void 0 && (t[n] = fa(r, `Bubble audio ${n}`));
	}
	return Object.freeze(t);
}
function _a(e) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble style must be an object.");
	ua(e, ["name", "textStyle"], [
		"placement",
		"maxWidth",
		"textLocale",
		"distance",
		"tailLength",
		"offset",
		"visualStyle",
		"portrait",
		"continueIndicator",
		"reveal",
		"audio",
		"showAnimation",
		"hideAnimation"
	], "Bubble style");
	let t = e.portrait === void 0 ? void 0 : ma(e.portrait), n = e.continueIndicator === void 0 ? void 0 : pa(e.continueIndicator, "Bubble continue indicator", 2), r;
	if (e.reveal !== void 0) try {
		r = zi(e.reveal);
	} catch (e) {
		throw new Z("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble reveal is invalid.");
	}
	let i = ga(e.audio), a = e.showAnimation === void 0 ? void 0 : ha(e.showAnimation, "Bubble showAnimation"), o = e.hideAnimation === void 0 ? void 0 : ha(e.hideAnimation, "Bubble hideAnimation"), s;
	try {
		s = ze(e.placement ?? "up-right");
	} catch (e) {
		throw new Z("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble placement is invalid.");
	}
	let c, l, u;
	try {
		c = Ue(e.distance ?? 12), l = We(e.tailLength ?? 18), u = e.offset === void 0 ? Ve : Ge(e.offset);
	} catch (e) {
		throw new Z("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble actor-relative transform is invalid.");
	}
	let d = e.visualStyle ?? "NORMAL";
	if (typeof d != "string" || !$e.includes(d)) throw new Z("BUBBLE-COMPOSITION-001", `Unsupported Bubble visual style: ${String(d)}`);
	let f;
	if (e.maxWidth !== void 0) {
		if (typeof e.maxWidth != "number" || !Number.isFinite(e.maxWidth) || e.maxWidth <= 0) throw new Z("BUBBLE-COMPOSITION-001", "Bubble style maxWidth must be a positive finite number.");
		f = e.maxWidth;
	}
	let p = e.textLocale === void 0 ? void 0 : da(e.textLocale, "Bubble style text locale"), m = Xi(e);
	return Object.freeze({
		name: da(e.name, "Bubble style name"),
		textStyle: da(e.textStyle, "Bubble text style name"),
		layoutProfile: m,
		...f === void 0 ? {} : { maxWidth: f },
		...p === void 0 ? {} : { textLocale: p },
		placement: s,
		distance: c,
		tailLength: l,
		offset: u,
		visualStyle: d,
		...t === void 0 ? {} : { portrait: t },
		...n === void 0 ? {} : { continueIndicator: n },
		...r === void 0 ? {} : { reveal: r },
		...i === void 0 ? {} : { audio: i },
		...a === void 0 ? {} : { showAnimation: a },
		...o === void 0 ? {} : { hideAnimation: o }
	});
}
function va(e) {
	if (e !== void 0) {
		if (!Q(e) || typeof e.applyToTarget != "function" || typeof e.getMimeType != "function" || typeof e.isRegistered != "function") throw TypeError("Bubble image capability must provide applyToTarget, getMimeType, and isRegistered.");
		return e;
	}
}
function ya(e) {
	if (e !== void 0) {
		if (!Q(e) || typeof e.playSound != "function") throw TypeError("Bubble audio capability must provide playSound.");
		if (e.isRegistered !== void 0 && typeof e.isRegistered != "function") throw TypeError("Bubble audio capability isRegistered must be a function.");
		if (e.getMimeType !== void 0 && typeof e.getMimeType != "function") throw TypeError("Bubble audio capability getMimeType must be a function.");
		return e;
	}
}
function ba(e) {
	if (e === void 0) throw new Z("BUBBLE-COMPOSITION-006", "Bubble image assets require an image capability. Provide options.imageResolver.");
	return e;
}
function xa(e) {
	if (!Q(e) || typeof e.setText != "function" || typeof e.releaseTarget != "function") throw TypeError("Bubble text capability must provide setText and releaseTarget.");
	return e;
}
function Sa() {
	return Object.freeze({
		setTimeout: (e, t) => globalThis.setTimeout(e, t),
		clearTimeout: (e) => globalThis.clearTimeout(e)
	});
}
function Ca(e) {
	if (!Q(e) || typeof e.setTimeout != "function" || typeof e.clearTimeout != "function") throw TypeError("Bubble scheduler must provide setTimeout and clearTimeout.");
	return e;
}
function wa(e, t) {
	if (!Q(e) || typeof e.id != "string" || e.id.length === 0 || typeof e.isStage != "boolean") throw new Z("BUBBLE-COMPOSITION-004", `${t} must provide id and isStage.`);
	return e;
}
function Ta(e) {
	if (typeof e != "object" || !e) throw new Z("BUBBLE-COMPOSITION-004", "Bubble text target must be a non-null object.");
	return e;
}
function Ea(e, t) {
	if (!Q(e) || !Q(e.targets) || typeof e.setLayerVisible != "function" || typeof e.updateStyle != "function" || typeof e.show != "function" || typeof e.hide != "function" || typeof e.dispose != "function") throw new Z("BUBBLE-COMPOSITION-004", "Bubble surface is invalid.");
	let n = e.targets;
	Ta(n.text);
	let r = /* @__PURE__ */ new Set(), i = (e, t) => {
		let i = n[e];
		if (!t && i === void 0) return;
		let a = wa(i, `Bubble surface ${e}`);
		if (r.has(a.id)) throw new Z("BUBBLE-COMPOSITION-004", "Bubble image layers must use distinct target IDs.");
		r.add(a.id);
	};
	return i("portraitBase", t.portrait !== void 0), i("portraitBlink", t.portrait?.blink !== void 0), i("portraitLipSync", t.portrait?.lipSync !== void 0), i("continueIndicator", t.continueIndicator !== void 0), e;
}
function Da(e, t) {
	if (e === void 0) throw new Z("BUBBLE-COMPOSITION-006", `Bubble image capability is required for: ${t}. Provide options.imageResolver.`);
	if (!e.isRegistered(t)) throw new Z("BUBBLE-COMPOSITION-003", `Bubble image asset is not registered: ${t}`);
	if (!e.getMimeType(t).startsWith("image/")) throw new Z("BUBBLE-COMPOSITION-003", `Bubble asset is not an image: ${t}`);
}
function Oa(e, t) {
	if (e === void 0) throw new Z("BUBBLE-COMPOSITION-006", `Bubble audio assets require an audio capability: ${t}. Provide options.audio.`);
	if (e.isRegistered?.(t) === !1) throw new Z("BUBBLE-COMPOSITION-003", `Bubble audio asset is not registered: ${t}`);
	let n = e.getMimeType?.(t);
	if (n !== void 0 && !n.startsWith("audio/")) throw new Z("BUBBLE-COMPOSITION-003", `Bubble asset is not audio: ${t}`);
}
function ka(e) {
	return [...e.portrait === void 0 ? [] : [
		e.portrait.base,
		...e.portrait.blink?.frames ?? [],
		...e.portrait.lipSync?.frames ?? []
	], ...e.continueIndicator?.frames ?? []];
}
function Aa(e, t, n) {
	if (t.layoutProfile === "scratch-default") return Qi(e, (e) => typeof n.measureText == "function" ? n.measureText({
		styleName: t.textStyle,
		text: e
	}) : NaN).text;
	if (t.maxWidth === void 0) return e;
	if (typeof n.measureText != "function") throw new Z("BUBBLE-COMPOSITION-007", "Bubble style maxWidth requires the text capability measureText method.");
	return Fi({
		text: e,
		maxWidth: t.maxWidth,
		...t.textLocale === void 0 ? {} : { locale: t.textLocale },
		measureText: (e) => n.measureText?.({
			styleName: t.textStyle,
			text: e
		}) ?? 0
	}).lines.map(({ text: e }) => e).join("\n");
}
function ja(e, t) {
	if (e.length === 1) throw e[0];
	if (e.length > 1) throw AggregateError(e, t);
}
function Ma(e) {
	let t = !1, n = 0, r = 0, i, a = Promise.resolve(), o = async (t) => {
		let n = e.animation.frames[t];
		n !== void 0 && await e.imageResolver.applyToTarget(n, e.target);
	}, s = (t, n) => {
		e.onError?.(t, Object.freeze({
			actorKey: e.actorKey,
			layer: e.layer,
			assetName: n
		}));
	}, c = (l) => {
		i = e.scheduler.setTimeout(() => {
			if (i = void 0, !t || n !== l) return;
			r = (r + 1) % e.animation.frames.length;
			let u = e.animation.frames[r];
			a = a.then(() => o(r)).catch((e) => {
				t = !1, n += 1, s(e, u ?? "");
			}).then(() => {
				t && n === l && c(l);
			});
		}, e.animation.frameIntervalSeconds * 1e3);
	};
	return Object.freeze({
		async start(e = {}) {
			if (t) return;
			t = !0, n += 1;
			let i = n;
			r = 0, (e.primed ?? !1) || await o(r), !(!t || n !== i) && c(i);
		},
		async stop(s = {}) {
			let c = t;
			t = !1, n += 1, i !== void 0 && e.scheduler.clearTimeout(i), i = void 0, await a, (s.reset ?? !1) && (c || r !== 0) && (r = 0, await o(r));
		}
	});
}
function Na(e) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", "Show bubble input must be an object.");
	if (ua(e, [
		"actor",
		"actorKey",
		"kind",
		"text",
		"styleName"
	], ["animationMode", "reveal"], "Show bubble input"), !oa.has(e.kind)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble kind must be say or think.");
	if (typeof e.text != "string") throw new Z("BUBBLE-COMPOSITION-001", "Bubble text must be a string.");
	let t = e.animationMode ?? "talking";
	if (!sa.has(t)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble animation mode is invalid.");
	let n;
	if (e.reveal !== void 0) try {
		n = zi(e.reveal);
	} catch (e) {
		throw new Z("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble reveal is invalid.");
	}
	return {
		actor: e.actor,
		actorKey: da(e.actorKey, "Bubble actor key"),
		kind: e.kind,
		text: e.text,
		styleName: da(e.styleName, "Bubble style name"),
		animationMode: t,
		...n === void 0 ? {} : { reveal: n }
	};
}
function Pa(e) {
	if (!Q(e)) throw TypeError("Bubble composition options must be an object.");
	let t = va(e.imageResolver), n = ya(e.audio), r = xa(e.textCapability);
	if (typeof e.createSurface != "function") throw TypeError("Bubble composition createSurface must be a function.");
	if (e.onAnimationError !== void 0 && typeof e.onAnimationError != "function") throw TypeError("Bubble composition onAnimationError must be a function.");
	let i = Ca(e.scheduler ?? Sa()), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), c = !1, l = () => {
		if (c) throw new Z("BUBBLE-COMPOSITION-005", "Bubble composition has been disposed.");
	}, u = async (e, t) => {
		let n = (s.get(e) ?? Promise.resolve()).catch(() => void 0).then(t);
		s.set(e, n);
		try {
			return await n;
		} finally {
			s.get(e) === n && s.delete(e);
		}
	}, d = async (s) => {
		l();
		let c = a.get(s.styleName);
		if (!c) throw new Z("BUBBLE-COMPOSITION-002", `Bubble style is not defined: ${s.styleName}`);
		let u = c;
		s.reveal !== void 0 && (u = Object.freeze({
			...c,
			layoutProfile: "custom",
			reveal: s.reveal
		}));
		let d = s.text, f = (e) => {
			let n = new Set(ka(e)), r = n.size === 0 ? void 0 : ba(t);
			for (let e of n) Da(r, e);
			return r;
		}, p = f(u);
		for (let e of [
			u.audio?.voice,
			u.audio?.reveal,
			u.audio?.finish,
			u.reveal?.sound
		]) e !== void 0 && Oa(n, e);
		let m = async (e, t = !1) => {
			e !== void 0 && n !== void 0 && await n.playSound(e, { untilDone: t });
		}, h = async (e, t, n) => {
			let r = ka(e).length === 0 ? void 0 : ba(t), i = [];
			if (e.portrait) {
				let t = ba(r);
				i.push(Promise.resolve(t.applyToTarget(e.portrait.base, n.targets.portraitBase)));
				let a = e.portrait.blink?.frames[0];
				a !== void 0 && i.push(Promise.resolve(t.applyToTarget(a, n.targets.portraitBlink)));
				let o = e.portrait.lipSync?.frames[0];
				o !== void 0 && i.push(Promise.resolve(t.applyToTarget(o, n.targets.portraitLipSync)));
			}
			let a = e.continueIndicator?.frames[0];
			if (a !== void 0) {
				let e = ba(r);
				i.push(Promise.resolve(e.applyToTarget(a, n.targets.continueIndicator)));
			}
			await Promise.all(i);
		}, g = (t, n, r) => {
			x = t.portrait?.blink === void 0 ? void 0 : Ma({
				actorKey: s.actorKey,
				layer: "portraitBlink",
				animation: t.portrait.blink,
				target: r.targets.portraitBlink,
				imageResolver: ba(n),
				scheduler: i,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), S = t.portrait?.lipSync === void 0 ? void 0 : Ma({
				actorKey: s.actorKey,
				layer: "portraitLipSync",
				animation: t.portrait.lipSync,
				target: r.targets.portraitLipSync,
				imageResolver: ba(n),
				scheduler: i,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), C = t.continueIndicator === void 0 ? void 0 : Ma({
				actorKey: s.actorKey,
				layer: "continueIndicator",
				animation: t.continueIndicator,
				target: r.targets.continueIndicator,
				imageResolver: ba(n),
				scheduler: i,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			});
		}, _ = o.get(s.actorKey);
		_ && await _.close();
		let v, y = !1, b = !1, x, S, C, w = u.reveal, T = w ? Vi(s.text, w) : Object.freeze([s.text]), E = w ? Math.min(1, T.length) : 1, D, O = 0;
		try {
			v = Ea(await e.createSurface(Object.freeze({
				actor: s.actor,
				actorKey: s.actorKey,
				kind: s.kind,
				style: u
			})), u);
			let t = async (e, t = u) => {
				if (t.layoutProfile === "scratch-default" && v?.renderScratchText) {
					let n = Qi(e, (e) => typeof r.measureText == "function" ? r.measureText({
						styleName: t.textStyle,
						text: e
					}) : NaN);
					await v.renderScratchText(n);
					return;
				}
				v && (r.setText({
					styleName: t.textStyle,
					target: v.targets.text,
					text: Aa(e, t, r)
				}), y = !0);
			};
			if (w?.layout === "RESERVED") {
				let e = Aa(s.text, u, r);
				r.setText({
					styleName: u.textStyle,
					target: v.targets.text,
					text: e
				}), y = !0, v.captureTextLayout?.();
			}
			await t(w ? Hi(T, E) : s.text), await h(u, p, v), g(u, p, v);
			let a = "idle", c = !1, l = Promise.resolve(), _ = async () => {
				if (!v) return;
				let e = w ? Hi(T, E) : d;
				await t(e), await v.show();
			}, k = () => {
				O += 1, D !== void 0 && i.clearTimeout(D), D = void 0;
			}, A = async () => !w || E >= T.length ? !1 : (E += 1, await _(), await m(w.sound ?? u.audio?.reveal), E >= T.length && k(), !0), j = () => {
				if (!w || w.intervalSeconds <= 0 || E >= T.length) return;
				let e = O;
				D = i.setTimeout(() => {
					D = void 0, !(c || e !== O) && (l = l.then(() => A()).then(() => j()));
				}, w.intervalSeconds * 1e3);
			}, M = async (e) => {
				e !== a && (e === "talking" ? (await C?.stop(), await v?.setLayerVisible("continueIndicator", !1), await v?.setLayerVisible("portraitLipSync", S !== void 0), await S?.start({ primed: !0 })) : e === "awaiting-continue" ? (await S?.stop({ reset: !0 }), await v?.setLayerVisible("portraitLipSync", !1), await v?.setLayerVisible("continueIndicator", C !== void 0), await C?.start({ primed: !0 })) : (await Promise.all([S?.stop({ reset: !0 }), C?.stop()]), await Promise.all([v?.setLayerVisible("portraitLipSync", !1), v?.setLayerVisible("continueIndicator", !1)])), a = e);
			};
			await Promise.all([
				v.setLayerVisible("portraitBase", u.portrait !== void 0),
				v.setLayerVisible("portraitBlink", u.portrait?.blink !== void 0),
				v.setLayerVisible("portraitLipSync", !1),
				v.setLayerVisible("continueIndicator", !1)
			]), await v.show(), b = !0, await m(u.audio?.voice), w !== void 0 && await m(w.sound ?? u.audio?.reveal), await x?.start({ primed: !0 }), await M(s.animationMode);
			let N = Object.freeze({
				actorKey: s.actorKey,
				kind: s.kind,
				get animationMode() {
					return a;
				},
				setText(e) {
					return c ? Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`)) : typeof e == "string" ? (l = l.then(async () => {
						v && (k(), d = e, w ? (T = Vi(e, w), E = Math.min(1, T.length), w.layout === "RESERVED" && (r.setText({
							styleName: u.textStyle,
							target: v.targets.text,
							text: Aa(e, u, r)
						}), y = !0, v.captureTextLayout?.()), await _(), j()) : await _());
					}), l) : Promise.reject(new Z("BUBBLE-COMPOSITION-001", "Bubble text must be a string."));
				},
				updateStyle(e) {
					if (c) return Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let i;
					try {
						i = _a(e);
					} catch (e) {
						return Promise.reject(e);
					}
					return l = l.then(async () => {
						if (!v) return;
						Ea(v, i);
						let e = f(i);
						for (let e of [
							i.audio?.voice,
							i.audio?.reveal,
							i.audio?.finish,
							i.reveal?.sound
						]) e !== void 0 && Oa(n, e);
						await Promise.all([
							x?.stop(),
							S?.stop(),
							C?.stop()
						]), await h(i, e, v), await v.updateStyle(i), u = i, w = i.reveal, T = w ? Vi(d, w) : Object.freeze([d]), E = w ? Math.min(1, T.length) : 1, k(), w?.layout === "RESERVED" && (r.setText({
							styleName: i.textStyle,
							target: v.targets.text,
							text: Aa(d, i, r)
						}), y = !0, v.captureTextLayout?.()), await t(d, i), g(i, e, v), await Promise.all([
							v.setLayerVisible("portraitBase", i.portrait !== void 0),
							v.setLayerVisible("portraitBlink", i.portrait?.blink !== void 0),
							v.setLayerVisible("portraitLipSync", !1),
							v.setLayerVisible("continueIndicator", !1)
						]);
						let o = a;
						a = "idle", await x?.start({ primed: !0 }), await M(o), await _(), j(), await m(u.audio?.voice);
					}), l;
				},
				setAnimationMode(e) {
					return c ? Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`)) : sa.has(e) ? (l = l.then(() => M(e)), l) : Promise.reject(new Z("BUBBLE-COMPOSITION-001", "Bubble animation mode is invalid."));
				},
				revealNext() {
					if (c) return Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let e = !1;
					return l = l.then(async () => {
						e = await A(), e && j();
					}), l.then(() => e);
				},
				revealAll() {
					return c ? Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`)) : (l = l.then(async () => {
						if (k(), w) for (; await A(););
					}), l);
				},
				finish(e = {}) {
					if (c) return Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let t = e.timeoutSeconds ?? 0;
					return !Number.isFinite(t) || t < 0 ? Promise.reject(new Z("BUBBLE-COMPOSITION-001", "Bubble finish timeoutSeconds must be zero or greater.")) : e.condition !== void 0 && typeof e.condition != "function" ? Promise.reject(new Z("BUBBLE-COMPOSITION-001", "Bubble finish condition must be a function.")) : (l = l.then(async () => {
						if (k(), e.unit !== void 0 && (w = zi({
							...w ?? {},
							unit: e.unit
						}), T = Vi(d, w), E = Math.min(1, T.length), w.layout === "RESERVED" && v && (r.setText({
							styleName: u.textStyle,
							target: v.targets.text,
							text: Aa(d, u, r)
						}), y = !0, v.captureTextLayout?.())), w) for (; await A(););
						let n = e.condition;
						if (n === void 0 && t === 0) {
							await m(u.audio?.finish);
							return;
						}
						await new Promise((e, r) => {
							let a = !1, o, s, c = () => {
								a || (a = !0, o !== void 0 && i.clearTimeout(o), s !== void 0 && i.clearTimeout(s), m(u.audio?.finish).then(e, r));
							};
							if (t > 0 && (o = i.setTimeout(c, t * 1e3)), !n) return;
							let l = () => {
								let e;
								try {
									e = n();
								} catch (e) {
									a || (a = !0, o !== void 0 && i.clearTimeout(o), s !== void 0 && i.clearTimeout(s), r(e));
									return;
								}
								Promise.resolve(e).then((e) => {
									e ? c() : a || (s = i.setTimeout(l, 16));
								}, (e) => {
									a || (a = !0, o !== void 0 && i.clearTimeout(o), s !== void 0 && i.clearTimeout(s), r(e));
								});
							};
							l();
						});
					}), l);
				},
				animate(e) {
					if (c) return Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let n;
					try {
						n = ha(e, "Bubble motion");
					} catch (e) {
						return Promise.reject(e);
					}
					return l = l.then(async () => {
						if (n.name === "animateBubbleShape" && n.visualStyle) {
							let e = Object.freeze({
								...u,
								layoutProfile: "custom"
							}), r = Object.freeze({
								...e,
								visualStyle: n.visualStyle
							});
							u.layoutProfile === "scratch-default" && (await v?.updateStyle(e), await t(d, e), await v?.show()), await v?.animate?.(n), u = r, await v?.updateStyle(u);
							return;
						}
						await v?.animate?.(n);
					}), l;
				},
				async close() {
					if (c) return;
					c = !0;
					let e = [];
					k();
					try {
						await l;
					} catch (t) {
						e.push(t);
					}
					for (let t of [
						() => u.hideAnimation === void 0 ? void 0 : v?.animate?.(u.hideAnimation),
						() => x?.stop(),
						() => S?.stop(),
						() => C?.stop(),
						async () => {
							b && await v?.hide();
						},
						async () => {
							y && v && r.releaseTarget(v.targets.text);
						},
						async () => v?.dispose()
					]) try {
						await t();
					} catch (t) {
						e.push(t);
					}
					o.get(s.actorKey) === N && o.delete(s.actorKey), ja(e, `Failed to close bubble: ${s.actorKey}`);
				}
			});
			return o.set(s.actorKey, N), j(), u.showAnimation !== void 0 && await N.animate(u.showAnimation), N;
		} catch (e) {
			o.delete(s.actorKey);
			let t = [], n = await Promise.allSettled([
				x?.stop(),
				S?.stop(),
				C?.stop()
			]);
			if (t.push(...n.flatMap((e) => e.status === "rejected" ? [e.reason] : [])), b && v) try {
				await v.hide();
			} catch (e) {
				t.push(e);
			}
			if (y && v) try {
				r.releaseTarget(v.targets.text);
			} catch (e) {
				t.push(e);
			}
			if (v) try {
				await v.dispose();
			} catch (e) {
				t.push(e);
			}
			throw t.length > 0 ? AggregateError([e, ...t], `Failed to show and clean up bubble: ${s.actorKey}`, { cause: e }) : e;
		}
	};
	return Object.freeze({
		defineStyle(e) {
			l();
			let t = _a(e);
			a.set(t.name, t);
		},
		hasActiveBubble(e) {
			return o.has(da(e, "Bubble actor key"));
		},
		async show(e) {
			l();
			let t = Na(e);
			return u(t.actorKey, () => d(t));
		},
		releaseTarget(e) {
			l();
			let t = da(e, "Bubble actor key");
			return u(t, async () => {
				await o.get(t)?.close();
			});
		},
		async releaseAll() {
			l(), await Promise.allSettled([...s.values()]), ja((await Promise.allSettled([...o.values()].map((e) => e.close()))).flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to release all bubbles");
		},
		async dispose() {
			if (c) return;
			c = !0, await Promise.allSettled([...s.values()]);
			let e = await Promise.allSettled([...o.values()].map((e) => e.close()));
			a.clear(), ja(e.flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to dispose bubble composition");
		}
	});
}
//#endregion
//#region src/turbowarp-svg-text-adapter.ts
function Fa(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Ia(e) {
	if (!Fa(e) || typeof e.setText != "function" || typeof e.releaseTextActor != "function") throw TypeError("TurboWarp SVG Text adapter requires setText and releaseTextActor.");
	return e;
}
function La(e) {
	if (!Fa(e) || typeof e.setText != "function" || typeof e.releaseTarget != "function") throw TypeError("SVG Text composition adapter requires setText and releaseTarget.");
	return e;
}
function Ra(e) {
	if (!Fa(e) || typeof e.layoutText != "function") throw TypeError("SVG Text overlay adapter requires the layoutText composition API.");
	return e;
}
function za(e, t) {
	let n = Number(e);
	if (!Number.isFinite(n)) throw TypeError(`${t} must be a finite number.`);
	return n;
}
function Ba(e) {
	if (!Fa(e) || !Fa(e.style) || !Array.isArray(e.lines)) throw TypeError("SVG Text layout result is invalid.");
	let t = e.style, n = t.alignment;
	if (n !== "left" && n !== "center" && n !== "right") throw TypeError("SVG Text layout alignment is invalid.");
	let r = za(e.width, "SVG Text layout width"), i = za(e.height, "SVG Text layout height"), a = Object.freeze(e.lines.map((e) => {
		if (!Fa(e) || typeof e.text != "string") throw TypeError("SVG Text layout line is invalid.");
		return Object.freeze({
			baseline: za(e.baseline, "SVG Text line baseline") - i / 2,
			text: e.text,
			x: za(e.x, "SVG Text line x") - r / 2
		});
	}));
	return Object.freeze({
		alignment: n,
		backgroundColor: String(t.backgroundColor),
		backgroundCornerRadius: za(t.cornerRadius, "SVG Text corner radius"),
		fill: String(t.textColor),
		fontFamily: String(t.font),
		fontSize: za(t.fontSize, "SVG Text font size"),
		height: i,
		lineHeight: za(t.lineHeight, "SVG Text line height"),
		lines: a,
		preserveWhitespace: e.preserveWhitespace !== !1,
		width: r
	});
}
function Va(e) {
	let t = Ia(e);
	return Object.freeze({
		setText({ styleName: e, target: n, text: r }) {
			t.setText({
				STYLE: e,
				TEXT: r
			}, { target: n });
		},
		releaseTarget(e) {
			t.releaseTextActor(e);
		},
		measureText({ styleName: e, text: n }) {
			if (typeof t.measureText != "function") throw Error("TurboWarp SVG Text does not provide text measurement.");
			return t.measureText(e, n);
		}
	});
}
function Ha(e) {
	let t = La(e), n = {
		setText({ styleName: e, target: n, text: r }) {
			t.setText({
				styleName: e,
				target: n,
				text: r
			});
		},
		releaseTarget(e) {
			t.releaseTarget(e);
		}
	};
	return typeof t.measureText == "function" && (n.measureText = ({ styleName: e, text: n }) => t.measureText?.({
		styleName: e,
		text: n
	}) ?? 0), Object.freeze(n);
}
function Ua(e) {
	let t = Ra(e);
	return Object.freeze({
		layoutText({ nativeSize: e, styleName: n, text: r }) {
			return Ba(t.layoutText({
				nativeSize: [e.width, e.height],
				styleName: n,
				text: r
			}));
		},
		measureText({ nativeSize: e, styleName: n, text: r }) {
			let i = t.layoutText({
				nativeSize: [e.width, e.height],
				styleName: n,
				text: r
			});
			return Math.max(1, ...i.lines.map((e) => za(e.width, "SVG Text line width")));
		}
	});
}
function Wa(e) {
	if (!Fa(e) || typeof e.getLayoutCapability != "function") throw TypeError("TurboWarp SVG Text overlay adapter requires SVG Text 0.8.1 getLayoutCapability().");
	return Ua(e.getLayoutCapability());
}
//#endregion
//#region src/asset-manager-image-adapter.ts
var Ga = /* @__PURE__ */ new Set([
	"image/avif",
	"image/gif",
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"image/webp"
]);
function Ka(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function qa(e) {
	let t = e.split(";", 1)[0]?.trim().toLowerCase() ?? "";
	return t === "image/jpg" || t === "image/pjpeg" ? "image/jpeg" : t === "image/x-png" ? "image/png" : t;
}
function Ja(e) {
	return Ga.has(qa(e));
}
function Ya(e) {
	if (!Ka(e) || typeof e.url != "string" || !e.url.startsWith("blob:") || typeof e.mimeType != "string" || !Ja(e.mimeType) || typeof e.width != "number" || !Number.isFinite(e.width) || e.width <= 0 || typeof e.height != "number" || !Number.isFinite(e.height) || e.height <= 0 || typeof e.release != "function") throw TypeError("Asset Manager DOM image resources must provide a supported MIME type, positive intrinsic dimensions, a blob URL, and release().");
	return e;
}
function Xa(e) {
	if (!Ka(e) || typeof e.isRegistered != "function" || typeof e.getMimeType != "function" || typeof e.resolveDOMImageResource != "function") throw TypeError("Asset Manager DOM image capability is invalid.");
	let t = e;
	return Object.freeze({
		isRegistered(e) {
			return t.isRegistered(e) && Ja(t.getMimeType(e));
		},
		getMimeType(e) {
			return qa(t.getMimeType(e));
		},
		async resolveImage(e) {
			let n = qa(t.getMimeType(e));
			if (!t.isRegistered(e) || !Ja(n)) throw TypeError("Asset Manager image is not registered with a Bubble-compatible MIME type.");
			let r = await t.resolveDOMImageResource(e);
			try {
				Ya(r);
				let e = qa(r.mimeType);
				if (e !== n) throw TypeError("Asset Manager DOM image resource MIME type changed during resolution.");
				return Object.freeze({
					height: r.height,
					mimeType: e,
					src: r.url,
					width: r.width,
					release: () => r.release(),
					...e === "image/svg+xml" ? { svgSecurity: "sanitized" } : {}
				});
			} catch (e) {
				throw r?.release?.(), e;
			}
		}
	});
}
//#endregion
//#region src/surface-motion.ts
function Za(e) {
	return Math.max(0, Math.min(1, e));
}
function Qa(e, t) {
	let n = Za(e);
	switch (t) {
		case "linear": return n;
		case "easeIn": return n * n;
		case "easeOut": return 1 - (1 - n) * (1 - n);
		case "easeInOut": return n < .5 ? 2 * n * n : 1 - (-2 * n + 2) ** 2 / 2;
		default: return n;
	}
}
function $a(e, t, n) {
	let r = Math.max(0, t * 1e3);
	return r === 0 ? (n(1), Promise.resolve()) : new Promise((t, i) => {
		let a = 0, o, s = () => {
			let c = Math.min(16, r - a);
			a += c;
			try {
				n(Za(a / r));
			} catch (t) {
				o !== void 0 && e.clearTimeout(o), i(t);
				return;
			}
			if (a >= r) {
				t();
				return;
			}
			o = e.setTimeout(s, Math.min(16, r - a));
		};
		o = e.setTimeout(s, Math.min(16, r));
	});
}
//#endregion
//#region src/svg-overlay-surface.ts
var eo = "http://www.w3.org/2000/svg", to = "http://www.w3.org/XML/1998/namespace", no = 96, ro = 18, io = 8, ao = 16, oo = Symbol("BubbleSvgOverlayTextTarget"), so = Symbol("BubbleSvgOverlayImageTarget"), co = 0, lo = Object.freeze(["scratch-render", "svg-overlay"]), uo = "svg-overlay", fo = "error";
function po(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function mo(e) {
	let t = e.getNativeSize(), n = Array.isArray(t) ? Number(t[0]) : NaN, r = Array.isArray(t) ? Number(t[1]) : NaN;
	return Object.freeze({
		width: n > 0 ? n : 480,
		height: r > 0 ? r : 360
	});
}
function ho(e, t) {
	let n = Number(e);
	if (!Number.isFinite(n) || n <= 0) throw TypeError(`${t} must be a positive finite number.`);
	return n;
}
function go(e, t) {
	if (typeof e != "string" || e.length === 0 || e.length > 128) throw TypeError(`${t} must be a non-empty color string.`);
	if (/url\s*\(|[<>;]/iu.test(e)) throw TypeError(`${t} contains a disallowed SVG value.`);
	return e;
}
function _o(e) {
	if (typeof e != "string" || e.length === 0 || e.length > 256 || /url\s*\(|[<>{};]/iu.test(e)) throw TypeError("SVG overlay fontFamily is invalid.");
	return e;
}
function vo(e) {
	if (!po(e) || !Array.isArray(e.lines)) throw TypeError("SVG overlay text layout is invalid.");
	let t = e.alignment;
	if (t !== "left" && t !== "center" && t !== "right") throw TypeError("SVG overlay text alignment is invalid.");
	let n = e.fontStyle;
	if (n !== void 0 && n !== "normal" && n !== "italic") throw TypeError("SVG overlay fontStyle is invalid.");
	let r = e.fontWeight;
	if (r !== void 0 && r !== "normal" && r !== "bold" && (!Number.isFinite(r) || Number(r) < 1 || Number(r) > 1e3)) throw TypeError("SVG overlay fontWeight is invalid.");
	let i = Object.freeze(e.lines.map((e) => {
		if (typeof e == "string") return e;
		if (!po(e) || typeof e.text != "string") throw TypeError("SVG overlay text lines must be strings or positioned line records.");
		let t = e.x !== void 0;
		if (t !== (e.baseline !== void 0)) throw TypeError("SVG overlay positioned text lines require both x and baseline.");
		if (t && (!Number.isFinite(e.x) || !Number.isFinite(e.baseline))) throw TypeError("SVG overlay text line coordinates must be finite numbers.");
		return Object.freeze({
			text: e.text,
			...t ? {
				x: Number(e.x),
				baseline: Number(e.baseline)
			} : {}
		});
	})), a = e.backgroundColor === void 0 ? void 0 : go(e.backgroundColor, "SVG overlay backgroundColor"), o = e.backgroundCornerRadius === void 0 ? void 0 : Number(e.backgroundCornerRadius);
	if (o !== void 0 && (!Number.isFinite(o) || o < 0)) throw TypeError("SVG overlay backgroundCornerRadius must be a non-negative finite number.");
	let s = e.preserveWhitespace;
	if (s !== void 0 && typeof s != "boolean") throw TypeError("SVG overlay preserveWhitespace must be a boolean.");
	return Object.freeze({
		alignment: t,
		fill: go(e.fill, "SVG overlay text fill"),
		fontFamily: _o(e.fontFamily),
		fontSize: ho(e.fontSize, "SVG overlay fontSize"),
		height: ho(e.height, "SVG overlay text height"),
		lineHeight: ho(e.lineHeight, "SVG overlay lineHeight"),
		lines: i,
		width: ho(e.width, "SVG overlay text width"),
		...a === void 0 ? {} : { backgroundColor: a },
		...o === void 0 ? {} : { backgroundCornerRadius: o },
		...n === void 0 ? {} : { fontStyle: n },
		...r === void 0 ? {} : { fontWeight: r },
		...s === void 0 ? {} : { preserveWhitespace: s }
	});
}
function yo(e, t) {
	let n = {
		width: 180,
		height: 48
	}, r, i, a, o = (r) => {
		let i = vo(r), a = [];
		if (i.backgroundColor !== void 0 && i.backgroundColor !== "transparent") {
			let t = e.createElementNS(eo, "rect");
			t.setAttribute("x", String(-i.width / 2)), t.setAttribute("y", String(-i.height / 2)), t.setAttribute("width", String(i.width)), t.setAttribute("height", String(i.height)), t.setAttribute("fill", i.backgroundColor), i.backgroundCornerRadius !== void 0 && t.setAttribute("rx", String(i.backgroundCornerRadius)), a.push(t);
		}
		let o = e.createElementNS(eo, "text"), s = i.alignment === "left" ? "start" : i.alignment === "right" ? "end" : "middle", c = i.alignment === "left" ? -i.width / 2 : i.alignment === "right" ? i.width / 2 : 0;
		o.setAttribute("text-anchor", s), o.setAttribute("fill", i.fill), o.setAttribute("font-family", i.fontFamily), o.setAttribute("font-size", String(i.fontSize)), i.preserveWhitespace !== !1 && o.setAttributeNS(to, "xml:space", "preserve"), i.fontStyle !== void 0 && o.setAttribute("font-style", i.fontStyle), i.fontWeight !== void 0 && o.setAttribute("font-weight", String(i.fontWeight));
		let l = -Math.max(i.fontSize, (i.lines.length - 1) * i.lineHeight + i.fontSize) / 2 + i.fontSize;
		i.lines.forEach((t, n) => {
			let r = e.createElementNS(eo, "tspan"), a = typeof t == "string" ? void 0 : t;
			r.setAttribute("x", String(a?.x ?? c)), r.setAttribute("y", String(a?.baseline ?? l + n * i.lineHeight)), r.textContent = typeof t == "string" ? t : t.text, o.appendChild(r);
		}), a.push(o), t.replaceChildren(...a), n = {
			width: i.width,
			height: i.height
		};
	};
	return Object.freeze({
		[oo]: !0,
		group: t,
		captureLayout() {
			i = r, a = { ...n };
		},
		clear() {
			t.replaceChildren(), n = {
				width: 180,
				height: 48
			}, r = void 0, i = void 0, a = void 0;
		},
		clearCapturedLayout() {
			i = void 0, a = void 0;
		},
		getCapturedSize() {
			return a;
		},
		getSize() {
			return n;
		},
		refresh() {
			if (i !== void 0) {
				let e = vo(i());
				a = {
					width: e.width,
					height: e.height
				};
			}
			r !== void 0 && o(r());
		},
		render(e, t) {
			r = t, o(e);
		}
	});
}
function bo(e) {
	let t = e;
	if (t?.[oo] !== !0) throw TypeError("SVG overlay text target is invalid.");
	return t;
}
function xo(e, t) {
	if (!po(e) || typeof e.layoutText != "function") throw TypeError("SVG overlay backend requires a text layout capability.");
	let n = e;
	return Object.freeze({
		setText({ styleName: e, target: r, text: i }) {
			let a = bo(r), o = () => n.layoutText({
				nativeSize: mo(t),
				styleName: e,
				text: i
			});
			a.render(o(), o);
		},
		releaseTarget(e) {
			bo(e).clear();
		},
		measureText({ styleName: e, text: r }) {
			let i = mo(t);
			return ho(n.measureText?.({
				nativeSize: i,
				styleName: e,
				text: r
			}) ?? n.layoutText({
				nativeSize: i,
				styleName: e,
				text: r
			}).width, "SVG overlay measured text width");
		}
	});
}
function So(e) {
	return !(/* @__PURE__ */ new Set([
		"image/avif",
		"image/gif",
		"image/jpeg",
		"image/png",
		"image/svg+xml",
		"image/webp"
	])).has(e.mimeType.toLowerCase()) || e.mimeType.toLowerCase() === "image/svg+xml" && e.svgSecurity !== "sanitized" ? !1 : e.src.startsWith("blob:") ? typeof e.release == "function" : /^data:image\/(?:avif|gif|jpeg|png|webp);base64,/iu.test(e.src);
}
async function Co(e) {
	await e?.release?.();
}
function wo(e, t, n) {
	let r = e.createElementNS(eo, "image");
	r.setAttribute("preserveAspectRatio", "xMidYMid meet"), n.appendChild(r);
	let i, a = {
		width: 1,
		height: 1
	}, o = 0, s = () => {
		r.setAttribute("x", String(-a.width / 2)), r.setAttribute("y", String(-a.height / 2)), r.setAttribute("width", String(a.width)), r.setAttribute("height", String(a.height));
	};
	return s(), Object.freeze({
		id: t,
		isStage: !1,
		[so]: !0,
		group: n,
		async applyResource(e) {
			let t = o + 1;
			o = t;
			try {
				if (ho(e.width, "SVG overlay image width"), ho(e.height, "SVG overlay image height"), typeof e.mimeType != "string" || !e.mimeType.startsWith("image/") || typeof e.src != "string" || !So(e)) throw TypeError("SVG overlay image resources must use a supported MIME type, a releasable blob URL or approved raster data URL, and sanitized SVG metadata when applicable.");
			} catch (t) {
				throw await Co(e), t;
			}
			if (t !== o) {
				await Co(e);
				return;
			}
			let n = i;
			i = e, r.setAttribute("href", e.src), await Co(n);
		},
		getSize() {
			return i ? {
				width: i.width,
				height: i.height
			} : {
				width: 1,
				height: 1
			};
		},
		async release() {
			o += 1;
			let e = i;
			i = void 0, r.removeAttribute("href"), await Co(e);
		},
		setDisplaySize(e) {
			a = e, s();
		},
		setVisible(e) {
			n.setAttribute("visibility", e ? "visible" : "hidden");
		}
	});
}
function To(e) {
	let t = e;
	if (t?.[so] !== !0) throw TypeError("SVG overlay image target is invalid.");
	return t;
}
function Eo(e) {
	if (!po(e) || typeof e.isRegistered != "function" || typeof e.getMimeType != "function" || typeof e.resolveImage != "function") throw TypeError("SVG overlay image capability is invalid.");
	let t = e;
	return Object.freeze({
		isRegistered(e) {
			return t.isRegistered(e);
		},
		getMimeType(e) {
			return t.getMimeType(e);
		},
		async applyToTarget(e, n) {
			await To(n).applyResource(await t.resolveImage(e));
		}
	});
}
function Do(e, t) {
	let n = t.createElementNS(eo, "svg");
	n.setAttribute("xmlns", eo), n.setAttribute("aria-hidden", "true"), n.setAttribute("focusable", "false"), n.setAttribute("data-bubble-render-backend", "svg-overlay"), n.style.display = "block", n.style.overflow = "hidden", n.style.pointerEvents = "none";
	let r = /* @__PURE__ */ new Set(), i = !1, a = () => {
		let t = mo(e);
		return n.setAttribute("width", String(t.width)), n.setAttribute("height", String(t.height)), n.setAttribute("viewBox", `0 0 ${t.width} ${t.height}`), t;
	};
	return Object.freeze({
		document: t,
		renderer: e,
		acquire(t) {
			if (!r.has(t)) {
				if (a(), !i) try {
					e.addOverlay(n, "scale"), i = !0;
				} catch (t) {
					throw e.removeOverlay(n), t;
				}
				n.appendChild(t), r.add(t);
			}
		},
		release(t) {
			r.delete(t) && (t.remove(), r.size === 0 && i && (e.removeOverlay(n), i = !1));
		},
		updateNativeSize: a
	});
}
function Oo(e) {
	try {
		let t = e.getBoundsForBubble?.();
		if (t && [
			t.bottom,
			t.left,
			t.right,
			t.top
		].every((e) => Number.isFinite(e))) return t;
	} catch {}
	let t = Number.isFinite(e.x) ? Number(e.x) : 0, n = Number.isFinite(e.y) ? Number(e.y) : 0;
	return {
		bottom: n,
		left: t,
		right: t,
		top: n
	};
}
function ko(e, t, n) {
	return n < t ? (t + n) / 2 : Math.min(n, Math.max(t, e));
}
function Ao(e) {
	let t = Be(e);
	return (Math.atan2(-t.x, -t.y) * 180 / Math.PI % 360 + 360) % 360;
}
var jo = /* @__PURE__ */ new Set([
	"circle",
	"g",
	"path",
	"rect",
	"text",
	"title"
]), Mo = /* @__PURE__ */ new Set([
	"cx",
	"cy",
	"d",
	"data-boolean-operation",
	"data-tail-base-on-border",
	"fill",
	"fill-rule",
	"font-family",
	"font-size",
	"height",
	"opacity",
	"r",
	"rx",
	"stroke",
	"stroke-dasharray",
	"stroke-linejoin",
	"stroke-width",
	"transform",
	"width",
	"xml:space",
	"x",
	"y"
]);
function No(e, t) {
	let n = e.localName;
	if (!jo.has(n)) throw TypeError(`Bubble body SVG element is not allowed: ${n}`);
	let r = t.createElementNS(eo, n);
	for (let t of e.getAttributeNames()) {
		if (!Mo.has(t)) throw TypeError(`Bubble body SVG attribute is not allowed: ${t}`);
		let n = e.getAttribute(t) ?? "";
		if (/javascript:|url\s*\(/iu.test(n)) throw TypeError("Bubble body SVG contains an unsafe attribute value.");
		r.setAttribute(t, n);
	}
	(n === "title" || n === "text") && (r.textContent = e.textContent ?? "");
	for (let n of Array.from(e.children)) r.appendChild(No(n, t));
	return r;
}
function Po(e, t, n) {
	let r = n.defaultView?.DOMParser;
	if (!r) throw TypeError("SVG overlay backend requires DOMParser.");
	let i = new r().parseFromString(t, "image/svg+xml");
	if (i.querySelector("parsererror")) throw TypeError("Canonical Bubble body SVG could not be parsed.");
	let a = Array.from(i.documentElement.children).map((e) => No(e, n));
	e.replaceChildren(...a);
}
function Fo(e, t, n = 1) {
	let r = e.getSize(), i = Math.min(t / r.width, t / r.height), a = {
		width: r.width * i * n,
		height: r.height * i * n
	};
	return e.setDisplaySize(a), a;
}
function Io(e, t, n, r, i, a) {
	let { document: o, renderer: s } = e, c = co;
	co += 1;
	let l = o.createElementNS(eo, "g");
	l.setAttribute("data-bubble-surface", `${n}:${c}`);
	let u = o.createElementNS(eo, "g");
	u.setAttribute("data-bubble-layer", "body"), l.appendChild(u);
	let d = (e) => {
		let t = o.createElementNS(eo, "g");
		return t.setAttribute("data-bubble-layer", e), t.setAttribute("visibility", "hidden"), l.appendChild(t), t;
	}, f = wo(o, `bubble:${n}:${c}:portrait-base`, d("portrait-base")), p = wo(o, `bubble:${n}:${c}:portrait-blink`, d("portrait-blink")), m = wo(o, `bubble:${n}:${c}:portrait-lip-sync`, d("portrait-lip-sync")), h = d("text"), g = yo(o, h), _ = wo(o, `bubble:${n}:${c}:continue-indicator`, d("continue-indicator")), v = Object.freeze({
		text: g,
		portraitBase: f,
		portraitBlink: p,
		portraitLipSync: m,
		continueIndicator: _
	}), y = /* @__PURE__ */ new Map([
		["portraitBase", f],
		["portraitBlink", p],
		["portraitLipSync", m],
		["continueIndicator", _]
	]), b = /* @__PURE__ */ new Map(), x = `bubble-portrait-clip-${c}`, S = o.createElementNS(eo, "defs"), C = o.createElementNS(eo, "clipPath"), w = o.createElementNS(eo, "rect");
	C.setAttribute("id", x), C.appendChild(w), S.appendChild(C), l.insertBefore(S, u);
	let T = i, E = !1, D = !1, O = "", k = [0, 0], A = 1, j = 1, M = [0, 0], N, P, F = !1, I = (t = e.updateNativeSize()) => {
		let n = t.width / 2 + M[0], r = t.height / 2 - M[1], i = n + k[0], a = r - k[1];
		l.setAttribute("transform", `translate(${i} ${a}) scale(${A}) translate(${-n} ${-r})`), l.setAttribute("opacity", String(j));
	}, ee = (e) => e === "continueIndicator" ? T.continueIndicator !== void 0 : e === "portraitBase" ? T.portrait !== void 0 : e === "portraitBlink" ? T.portrait?.blink !== void 0 : T.portrait?.lipSync !== void 0, L = (e) => {
		let n = T.placement.basis === "background" || t.visible !== !1, r = D && n && j > 0, i = T.layoutProfile === "scratch-default" && P !== void 0;
		l.setAttribute("visibility", r ? "visible" : "hidden"), u.setAttribute("visibility", r && (i || T.visualStyle !== "NO_BUBBLE") ? "visible" : "hidden"), h.setAttribute("visibility", r && !i ? "visible" : "hidden");
		for (let [e, t] of y) t.setVisible(r && ee(e) && (b.get(e) ?? !1));
		I(e);
	}, R = () => {
		if (E) return;
		let n = e.updateNativeSize();
		if (T.layoutProfile === "scratch-default" && P !== void 0) {
			let e = $i(P), i = ea({
				bounds: Oo(t),
				height: e.height,
				pointsLeft: F,
				stageHeight: n.height,
				stageWidth: n.width,
				width: e.width
			});
			F = i.pointsLeft, M = [i.centerX, i.centerY];
			let a = JSON.stringify({
				kind: r,
				layout: P,
				pointsLeft: F
			});
			a !== O && (Po(u, aa({
				kind: r,
				layout: P,
				pointsLeft: F,
				title: `${T.name} ${r} Bubble`
			}), o), O = a), u.setAttribute("data-bubble-style", "SCRATCH_DEFAULT"), u.setAttribute("data-bubble-profile", "scratch-default"), u.setAttribute("data-bubble-kind", r), u.setAttribute("data-bubble-body-width", String(e.width)), u.setAttribute("data-bubble-body-height", String(e.height)), u.setAttribute("transform", `translate(${n.width / 2 + i.left} ${n.height / 2 - i.top})`), L(n);
			return;
		}
		u.removeAttribute("data-bubble-profile"), u.removeAttribute("data-bubble-kind");
		let i = T.placement.basis === "actor" ? T.offset.scalePercent / 100 : 1, a = g.getCapturedSize() ?? g.getSize(), s = {
			width: a.width * i,
			height: a.height * i
		}, c = (T.portrait?.offset.zoomPercent ?? 100) / 100, l = T.portrait !== void 0, d = l ? Fo(f, no * c, i) : {
			width: 0,
			height: 0
		};
		for (let e of [p, m]) l && Fo(e, no * c, i);
		let v = Fo(_, ro, i), y = d.width + (l ? io * i : 0) + s.width, b = Math.max(d.height, s.height), S = nt(T.visualStyle, ...N === void 0 ? [] : [N.from, N.to]), C = Math.max(y / i + 48, S.width), D = Math.max(b / i + 48, S.height), k = Math.max(y, (C - 48) * i), A = Math.max(b, (D - 48) * i), j = -n.width / 2, I = n.width / 2, ee = n.height / 2, R = -n.height / 2, z, B;
		if (T.placement.basis === "background") z = 0, B = T.placement.region === "HEADER_LIKE" ? ee - ao - A / 2 : T.placement.region === "FOOTER_LIKE" ? R + ao + A / 2 : 0;
		else {
			let e = Ke({
				bounds: Oo(t),
				bubbleWidth: k,
				bubbleHeight: A,
				direction: T.placement.direction,
				distance: T.distance,
				tailLength: T.tailLength,
				offset: T.offset
			});
			z = e.x, B = e.y;
		}
		z = ko(z, j + k / 2, I - k / 2), B = ko(B, R + A / 2, ee - A / 2), M = [z, B];
		let te = T.placement.basis === "actor" ? Ao(T.placement.direction) : null, ne = T.placement.basis === "actor" ? [
			T.offset.x,
			T.offset.y,
			T.offset.scalePercent
		] : [
			0,
			0,
			100
		], re = te === null ? {
			x: 0,
			y: 0
		} : Ct({
			style: T.visualStyle,
			width: C,
			height: D,
			tailDirection: te,
			tailLength: T.tailLength,
			offset: ne
		}), ie = JSON.stringify({
			baseBubbleHeight: D,
			baseBubbleWidth: C,
			bodyOffset: ne,
			shapeTransition: N,
			tailDirection: te,
			tailLength: T.tailLength,
			visualStyle: T.visualStyle
		});
		ie !== O && (Po(u, Tt({
			style: T.visualStyle,
			lines: [],
			width: C,
			height: D,
			tailDirection: te,
			tailLength: T.tailLength,
			offset: ne,
			title: `${T.name} Bubble body`,
			...N === void 0 ? {} : { shapeTransition: N }
		}), o), O = ie), u.setAttribute("data-bubble-style", T.visualStyle), u.setAttribute("data-bubble-body-width", String(C)), u.setAttribute("data-bubble-body-height", String(D)), N === void 0 ? (u.removeAttribute("data-bubble-shape-transition-from"), u.removeAttribute("data-bubble-shape-transition-to"), u.removeAttribute("data-bubble-shape-transition-progress")) : (u.setAttribute("data-bubble-shape-transition-from", N.from), u.setAttribute("data-bubble-shape-transition-to", N.to), u.setAttribute("data-bubble-shape-transition-progress", String(N.progress)));
		let ae = z - re.x, oe = B + re.y;
		u.setAttribute("transform", `translate(${n.width / 2 + ae - C / 2} ${n.height / 2 - oe - D / 2})`);
		let se = z - y / 2, ce = T.portrait?.placement ?? "left", le = ce.endsWith("right"), V = (T.portrait?.offset.x ?? 0) * i, ue = (T.portrait?.offset.y ?? 0) * i, de = (le ? se + s.width + io * i : se) + d.width / 2 + V, fe = B;
		ce.startsWith("top-") ? fe = B + b / 2 - d.height / 2 : ce.startsWith("bottom-") && (fe = B - b / 2 + d.height / 2), fe += ue;
		let pe = (le || !l ? se : se + d.width + io * i) + s.width / 2, H = (e, t) => `translate(${n.width / 2 + e} ${n.height / 2 - t})`;
		for (let e of [
			f,
			p,
			m
		]) e.group.setAttribute("transform", H(de, fe));
		h.setAttribute("transform", `${H(pe, B)} scale(${i})`);
		let U = pe + s.width / 2 - v.width / 2 - io * i, W = B - s.height / 2 + v.height / 2 + io * i;
		_.group.setAttribute("transform", H(U, W));
		let me = Math.min(T.portrait?.cornerRadius ?? 0, d.width / 2, d.height / 2);
		w.setAttribute("x", String(-d.width / 2)), w.setAttribute("y", String(-d.height / 2)), w.setAttribute("width", String(d.width)), w.setAttribute("height", String(d.height)), w.setAttribute("rx", String(me));
		for (let e of [
			f,
			p,
			m
		]) me > 0 ? e.group.setAttribute("clip-path", `url(#${x})`) : e.group.removeAttribute("clip-path");
		L(n);
	}, z = t.onTargetVisualChange, B = (e) => {
		z?.(e), R();
	}, te = () => {
		g.refresh(), R();
	};
	return e.acquire(l), T.placement.basis === "actor" && (t.onTargetVisualChange = B), s.on?.("NativeSizeChanged", te), Object.freeze({
		targets: v,
		setLayerVisible(e, t) {
			E || (b.set(e, t), L());
		},
		async updateStyle(e) {
			if (E) return;
			let n = [...e.portrait === void 0 ? [
				f,
				p,
				m
			] : [...e.portrait.blink === void 0 ? [p] : [], ...e.portrait.lipSync === void 0 ? [m] : []], ...e.continueIndicator === void 0 ? [_] : []];
			await Promise.all(n.map((e) => e.release()));
			let r = T.placement.basis === "actor";
			T = e, k = [0, 0], A = 1, j = 1, N = void 0, O = "", e.reveal?.layout !== "RESERVED" && g.clearCapturedLayout();
			let i = T.placement.basis === "actor";
			r && !i ? t.onTargetVisualChange === B && (t.onTargetVisualChange = z ?? null) : !r && i && (t.onTargetVisualChange = B), R();
		},
		captureTextLayout() {
			E || (g.captureLayout(), R());
		},
		clearTextLayout() {
			g.clearCapturedLayout(), R();
		},
		renderScratchText(e) {
			E || (P = e, O = "", R());
		},
		async animate(e) {
			if (E) return;
			let t = Math.max(0, e.durationSeconds ?? 0), n = () => {
				E || L();
			}, r = (t) => Qa(t, e.ease ?? "easeInOut");
			if (e.name === "fadeIn" || e.name === "floatIn" || e.name === "zoomIn" || e.name === "riseUp") {
				D = !0;
				let i = e.name === "floatIn" || e.name === "riseUp" ? [0, 16] : [0, 0], o = e.name === "zoomIn" ? .01 : 1;
				k = i, A = o, j = e.name === "fadeIn" ? 0 : 1, n(), await $a(a, t, (t) => {
					let a = r(t);
					k = [i[0] * (1 - a), i[1] * (1 - a)], A = o + (1 - o) * a, j = e.name === "fadeIn" ? a : 1, n();
				}), k = [0, 0], A = 1, j = 1, R();
				return;
			}
			if (e.name === "fadeOut" || e.name === "floatOut" || e.name === "zoomOut" || e.name === "sink") {
				let i = e.name === "floatOut" || e.name === "sink" ? [0, -16] : [0, 0], o = e.name === "zoomOut" ? .01 : 1;
				await $a(a, t, (t) => {
					let a = r(t);
					k = [i[0] * a, i[1] * a], A = 1 + (o - 1) * a, j = e.name === "fadeOut" ? 1 - a : 1, n();
				}), D = !1, L(), k = [0, 0], A = 1, j = 1;
				return;
			}
			if (e.name === "shake") {
				let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .08, s = Be(typeof e.direction == "number" ? e.direction : e.direction ?? "right");
				await $a(a, o, (e) => {
					let t = Math.sin(r(e) * i * Math.PI * 2) * 5;
					k = [s.x * t, s.y * t], n();
				}), k = [0, 0], R();
				return;
			}
			if (e.name === "explode") {
				let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .12, s = e.relativeScale ?? 1.15;
				await $a(a, o, (e) => {
					let t = Math.abs(Math.sin(r(e) * i * Math.PI));
					A = 1 + (s - 1) * t, n();
				}), A = 1, R();
				return;
			}
			if (e.name === "animateBubbleShape") {
				let n = e.visualStyle ?? T.visualStyle, r = T.visualStyle, i = e.speed === void 0 ? 1 : Math.max(0, e.speed);
				N = {
					from: r,
					to: n,
					progress: 0
				}, R(), await $a(a, t, (a) => {
					let o = t === 0 ? 1 : Za(a * Math.max(i, 1));
					N = {
						from: r,
						to: n,
						progress: Qa(o, e.ease ?? "easeInOut")
					}, O = "", R();
				}), N = void 0, O = "", R();
			}
		},
		show() {
			E || (D = !0, R());
		},
		hide() {
			E || (D = !1, L());
		},
		async dispose() {
			if (E) return;
			E = !0;
			let n = [], r = (e) => {
				try {
					e();
				} catch (e) {
					n.push(e);
				}
			};
			r(() => {
				t.onTargetVisualChange === B && (t.onTargetVisualChange = z ?? null);
			}), r(() => s.off?.("NativeSizeChanged", te)), r(() => e.release(l)), r(() => g.clear());
			let i = await Promise.allSettled([...y.values()].map((e) => e.release()));
			if (n.push(...i.flatMap((e) => e.status === "rejected" ? [e.reason] : [])), n.length === 1) throw n[0];
			if (n.length > 1) throw AggregateError(n, "Failed to dispose SVG overlay Bubble surface.");
		}
	});
}
//#endregion
//#region src/turbowarp-adapter.ts
var Lo = "sprite", Ro = 96, zo = 18, Bo = 8, Vo = 16, Ho = 0, $ = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleRuntimeAdapterError", this.code = e;
	}
};
function Uo(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Wo(e) {
	if (!Uo(e)) throw new $("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp renderer.");
	let t = [
		"createSVGSkin",
		"createDrawable",
		"destroyDrawable",
		"destroySkin",
		"getCurrentSkinSize",
		"getNativeSize",
		"updateDrawablePosition",
		"updateDrawableScale",
		"updateDrawableSkinId",
		"updateDrawableVisible"
	];
	if (t.some((t) => typeof e[t] != "function")) throw new $("BUBBLE-RUNTIME-001", `Bubble renderer must provide ${t.join(", ")}.`);
	return e;
}
function Go(e) {
	let t = e ?? "svg-overlay";
	if (t !== "scratch-render" && t !== "svg-overlay") throw new $("BUBBLE-RUNTIME-004", "Bubble bubbleRenderBackend must be scratch-render or svg-overlay.");
	return t;
}
function Ko(e) {
	let t = e ?? "error";
	if (t !== "error" && t !== "fallback") throw new $("BUBBLE-RUNTIME-004", "Bubble svgOverlayUnsupportedBehavior must be error or fallback.");
	return t;
}
function qo(e) {
	let t = e ?? (globalThis.document === void 0 ? void 0 : globalThis.document);
	if (t !== void 0) {
		if (!Uo(t) || typeof t.createElementNS != "function") throw new $("BUBBLE-RUNTIME-004", "Bubble SVG overlay document must provide createElementNS().");
		return t;
	}
}
function Jo(e, t, n) {
	if (typeof e.addOverlay != "function" || typeof e.removeOverlay != "function") return "the renderer does not provide addOverlay() and removeOverlay()";
	if (t === void 0) return "the host does not provide a DOM document";
	if (typeof t.defaultView?.DOMParser != "function") return "the host document does not provide DOMParser";
	if (!Uo(n) || typeof n.layoutText != "function") return "a host-neutral svgOverlayTextCapability is not available";
}
function Yo() {
	let e = ke(), t = /* @__PURE__ */ new Set(), n = (n) => {
		e.defineStyle({
			name: n,
			backgroundColor: "transparent"
		}), t.add(n);
	};
	return n("default"), Ua(Object.freeze({ layoutText(r) {
		return t.has(r.styleName) || n(r.styleName), e.layoutText(r);
	} }));
}
function Xo(e) {
	let t = Ae({ runtime: e }), n = /* @__PURE__ */ new Set(), r = (e) => {
		t.defineStyle({
			name: e,
			backgroundColor: "transparent"
		}), n.add(e);
	}, i = (e) => {
		n.has(e) || r(e);
	};
	return r("default"), Ha(Object.freeze({
		setText(e) {
			i(e.styleName), t.setText(e);
		},
		releaseTarget(e) {
			t.releaseTarget(e);
		},
		measureText(e) {
			return i(e.styleName), t.measureText(e);
		}
	}));
}
function Zo(e) {
	if (!Uo(e) || typeof e.isLoaded != "function" || typeof e.getAssetMimeType != "function" || typeof e.resolveSkin != "function") throw new $("BUBBLE-RUNTIME-002", "Bubble image assets require an imageResolver capability. Load @kubohiroya/turbowarp-asset-manager or provide options.imageResolver before using image features.");
	return e;
}
function Qo(e) {
	if (!Uo(e) || typeof e.getDOMImageCapability != "function") throw new $("BUBBLE-RUNTIME-002", "Bubble SVG overlay image assets require @kubohiroya/turbowarp-asset-manager 0.12.1 or a host-provided options.svgOverlayImageCapability.");
	let t = e.getDOMImageCapability();
	if (!Uo(t) || typeof t.isRegistered != "function" || typeof t.getMimeType != "function" || typeof t.resolveDOMImageResource != "function") throw new $("BUBBLE-RUNTIME-002", "Asset Manager did not provide a valid DOM image capability.");
	return t;
}
function $o(e) {
	try {
		let t = e.getBoundsForBubble?.();
		if (t && [
			t.bottom,
			t.left,
			t.right,
			t.top
		].every((e) => Number.isFinite(e))) return t;
	} catch {}
	let t = Number.isFinite(e.x) ? Number(e.x) : 0, n = Number.isFinite(e.y) ? Number(e.y) : 0;
	return {
		bottom: n,
		left: t,
		right: t,
		top: n
	};
}
function es(e, t, n) {
	let r = e.getCurrentSkinSize(t.drawableID);
	if (!Array.isArray(r) || r.length < 2) return n;
	let i = Number(r[0]), a = Number(r[1]);
	return !(i > 0) || !(a > 0) ? n : {
		width: i,
		height: a
	};
}
function ts(e, t, n, r = 1) {
	let i = es(e, t, {
		width: n,
		height: n
	}), a = Math.min(n / i.width, n / i.height) * r;
	return e.updateDrawableScale(t.drawableID, [a * 100, a * 100]), {
		width: i.width * a,
		height: i.height * a,
		scalePercent: a * 100
	};
}
function ns(e, t, n) {
	let r = Math.min(n, e / 2, t / 2), i = e - r, a = t - r;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${t}" viewBox="0 0 ${e} ${t}">
  <path d="M0 0H${e}V${t}H0Z M${r} 0H${i}A${r} ${r} 0 0 1 ${e} ${r}V${a}A${r} ${r} 0 0 1 ${i} ${t}H${r}A${r} ${r} 0 0 1 0 ${a}V${r}A${r} ${r} 0 0 1 ${r} 0Z" fill="#fff4cc" fill-rule="evenodd" data-bubble-portrait-corner-radius="${r}"/>
</svg>`;
}
function rs(e, t, n) {
	return n < t ? (t + n) / 2 : Math.min(n, Math.max(t, e));
}
function is(e, t, n, r, i) {
	let a = t + r * 2, o = n + i * 2;
	return e.replace(/<svg\b[^>]*>/u, (e) => e.replace(/\bwidth="[^"]*"/u, `width="${a}"`).replace(/\bheight="[^"]*"/u, `height="${o}"`).replace(/\bviewBox="[^"]*"/u, `viewBox="${-r} ${-i} ${a} ${o}"`));
}
function as(e) {
	let t = Be(e);
	return (Math.atan2(-t.x, -t.y) * 180 / Math.PI % 360 + 360) % 360;
}
function os(e, t, n, r, i, a) {
	let o = e.renderer, s = Ho;
	Ho += 1;
	let c = [], l, u, d = (e) => {
		let t = o.createDrawable(Lo);
		if (!Number.isInteger(t) || t < 0) throw new $("BUBBLE-RUNTIME-001", `TurboWarp did not create the Bubble ${e} drawable.`);
		let r = Object.freeze({
			id: `bubble:${n}:${s}:${e}`,
			isStage: !1,
			drawableID: t
		});
		return c.push(r), o.updateDrawableVisible(t, !1), o.setDrawableOrder?.(t, Infinity, Lo), r;
	};
	try {
		let n = d("body"), s = i.portrait ? d("portrait-base") : void 0, f = i.portrait?.blink ? d("portrait-blink") : void 0, p = i.portrait?.lipSync ? d("portrait-lip-sync") : void 0, m = i.portrait ? d("portrait-corner-mask") : void 0, h = d("text"), g = i.continueIndicator ? d("continue-indicator") : void 0, _ = Object.freeze({
			text: h,
			...s ? { portraitBase: s } : {},
			...f ? { portraitBlink: f } : {},
			...p ? { portraitLipSync: p } : {},
			...g ? { continueIndicator: g } : {}
		}), v = /* @__PURE__ */ new Map();
		s && v.set("portraitBase", s), f && v.set("portraitBlink", f), p && v.set("portraitLipSync", p), g && v.set("continueIndicator", g);
		let y = /* @__PURE__ */ new Map(), b = !1, x = !1, S = "", C = "", w = i, T, E = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), O = [0, 0], k = 1, A = 1, j, M, N = !1, P = () => {
			for (let e of c) {
				let t = E.get(e.drawableID);
				t && o.updateDrawablePosition(e.drawableID, [t[0] + O[0], t[1] + O[1]]);
				let n = D.get(e.drawableID);
				n && o.updateDrawableScale(e.drawableID, [n[0] * k, n[1] * k]), o.updateDrawableEffect?.(e.drawableID, "ghost", (1 - A) * 100);
			}
		}, F = () => {
			let r = w.placement.basis === "background" || t.visible !== !1, i = w.layoutProfile === "scratch-default" && M !== void 0;
			o.updateDrawableVisible(n.drawableID, b && r && (i || w.visualStyle !== "NO_BUBBLE") && (o.updateDrawableEffect !== void 0 || A > 0)), o.updateDrawableVisible(h.drawableID, b && r && !i && (o.updateDrawableEffect !== void 0 || A > 0));
			for (let [e, t] of v) o.updateDrawableVisible(t.drawableID, b && r && (y.get(e) ?? !1) && (o.updateDrawableEffect !== void 0 || A > 0));
			m && o.updateDrawableVisible(m.drawableID, b && r && w.portrait !== void 0 && w.portrait.cornerRadius > 0 && w.visualStyle !== "NO_BUBBLE" && (y.get("portraitBase") ?? !1) && (o.updateDrawableEffect !== void 0 || A > 0)), P(), e.requestRedraw?.();
		}, I = () => {
			if (x) return;
			if (w.layoutProfile === "scratch-default" && M !== void 0) {
				let e = o.getNativeSize(), i = Array.isArray(e) && Number(e[0]) > 0 ? Number(e[0]) : 480, a = Array.isArray(e) && Number(e[1]) > 0 ? Number(e[1]) : 360, s = $i(M), c = ea({
					bounds: $o(t),
					height: s.height,
					pointsLeft: N,
					stageHeight: a,
					stageWidth: i,
					width: s.width
				});
				N = c.pointsLeft;
				let u = JSON.stringify({
					kind: r,
					layout: M,
					pointsLeft: N
				});
				if (u !== S) {
					let e = o.createSVGSkin(aa({
						kind: r,
						layout: M,
						pointsLeft: N,
						title: `${w.name} ${r} Bubble`
					}));
					if (!Number.isInteger(e) || e < 0) throw new $("BUBBLE-RUNTIME-001", "TurboWarp did not create the Scratch-compatible Bubble SVG skin.");
					try {
						o.updateDrawableSkinId(n.drawableID, e);
					} catch (t) {
						throw o.destroySkin(e), t;
					}
					let t = l;
					l = e, S = u, t !== void 0 && o.destroySkin(t);
				}
				o.updateDrawableScale(n.drawableID, [100, 100]), o.updateDrawablePosition(n.drawableID, [c.centerX, c.centerY]), E.set(n.drawableID, [c.centerX, c.centerY]), D.set(n.drawableID, [100, 100]), F();
				return;
			}
			let e = w.placement.basis === "actor" ? w.offset.scalePercent / 100 : 1, i = T ?? es(o, h, {
				width: 180,
				height: 48
			});
			o.updateDrawableScale(h.drawableID, [e * 100, e * 100]);
			let a = {
				width: i.width * e,
				height: i.height * e
			}, c = Ro * ((w.portrait?.offset.zoomPercent ?? 100) / 100), d = s !== void 0 && w.portrait !== void 0, _ = d ? ts(o, s, c, e) : {
				width: 0,
				height: 0,
				scalePercent: 0
			}, v = /* @__PURE__ */ new Map();
			d && v.set(s.drawableID, _.scalePercent);
			for (let t of [f, p]) if (t && d) {
				let n = ts(o, t, c, e);
				v.set(t.drawableID, n.scalePercent);
			}
			let y = g ? ts(o, g, zo, e) : {
				width: 0,
				height: 0,
				scalePercent: 0
			}, b = _.width + (d ? Bo * e : 0) + a.width, O = Math.max(_.height, a.height), k = nt(w.visualStyle, ...j === void 0 ? [] : [j.from, j.to]), A = Math.max(b / e + 48, k.width), I = Math.max(O / e + 48, k.height), ee = Math.max(b, (A - 48) * e), L = Math.max(O, (I - 48) * e), R = o.getNativeSize(), z = Array.isArray(R) && Number(R[0]) > 0 ? Number(R[0]) : 480, B = Array.isArray(R) && Number(R[1]) > 0 ? Number(R[1]) : 360, te = -z / 2, ne = z / 2, re = B / 2, ie = -B / 2, ae = te + ee / 2, oe = ne - ee / 2, se = ie + L / 2, ce = re - L / 2, le, V;
			if (w.placement.basis === "background") le = 0, V = w.placement.region === "HEADER_LIKE" ? re - Vo - L / 2 : w.placement.region === "FOOTER_LIKE" ? ie + Vo + L / 2 : 0;
			else {
				let e = Ke({
					bounds: $o(t),
					bubbleWidth: ee,
					bubbleHeight: L,
					direction: w.placement.direction,
					distance: w.distance,
					tailLength: w.tailLength,
					offset: w.offset
				});
				le = e.x, V = e.y;
			}
			le = rs(le, ae, oe), V = rs(V, se, ce);
			let ue = w.placement.basis === "actor" ? as(w.placement.direction) : null, de = w.placement.basis === "actor" ? [
				w.offset.x,
				w.offset.y,
				w.offset.scalePercent
			] : [
				0,
				0,
				100
			], fe = ue === null ? {
				x: 0,
				y: 0
			} : Ct({
				style: w.visualStyle,
				width: A,
				height: I,
				tailDirection: ue,
				tailLength: w.tailLength,
				offset: de
			}), pe = Math.abs(de[0]) + A * Math.abs(e - 1) + Math.max(0, w.tailLength - 18) + 8, H = Math.abs(de[1]) + I * Math.abs(e - 1) + Math.max(0, w.tailLength - 18) + 8, U = JSON.stringify({
				baseBubbleHeight: I,
				baseBubbleWidth: A,
				bodyOffset: de,
				tailDirection: ue,
				tailLength: w.tailLength,
				viewportExtraX: pe,
				viewportExtraY: H,
				visualStyle: w.visualStyle,
				shapeTransition: j
			});
			if (U !== S) {
				let e = is(Tt({
					style: w.visualStyle,
					lines: [],
					width: A,
					height: I,
					tailDirection: ue,
					tailLength: w.tailLength,
					offset: de,
					title: `${w.name} Bubble body`,
					...j === void 0 ? {} : { shapeTransition: j }
				}), A, I, pe, H), t = o.createSVGSkin(e);
				if (!Number.isInteger(t) || t < 0) throw new $("BUBBLE-RUNTIME-001", "TurboWarp did not create the Bubble body SVG skin.");
				try {
					o.updateDrawableSkinId(n.drawableID, t);
				} catch (e) {
					throw o.destroySkin(t), e;
				}
				let r = l;
				l = t, S = U, r !== void 0 && o.destroySkin(r);
			}
			o.updateDrawableScale(n.drawableID, [100, 100]), o.updateDrawablePosition(n.drawableID, [le - fe.x, V + fe.y]);
			let W = le - b / 2, me = w.portrait?.placement ?? "left", he = me.endsWith("right"), ge = (w.portrait?.offset.x ?? 0) * e, _e = (w.portrait?.offset.y ?? 0) * e, ve = (he ? W + a.width + Bo * e : W) + _.width / 2 + ge, ye = V;
			me.startsWith("top-") ? ye = V + O / 2 - _.height / 2 : me.startsWith("bottom-") && (ye = V - O / 2 + _.height / 2), ye += _e;
			let be = (he || !d ? W : W + _.width + Bo * e) + a.width / 2;
			for (let e of [
				s,
				f,
				p
			]) e && o.updateDrawablePosition(e.drawableID, [ve, ye]);
			if (m) {
				let t = _.width / e, n = _.height / e, r = Math.min(w.portrait?.cornerRadius ?? 0, t / 2, n / 2), i = r > 0 ? JSON.stringify({
					maskHeight: n,
					maskWidth: t,
					radius: r
				}) : "";
				if (i !== C) {
					let e = u;
					if (u = void 0, C = i, r > 0) {
						let e = o.createSVGSkin(ns(t, n, r));
						if (!Number.isInteger(e) || e < 0) throw new $("BUBBLE-RUNTIME-001", "TurboWarp did not create the Bubble portrait corner mask SVG skin.");
						try {
							o.updateDrawableSkinId(m.drawableID, e), u = e;
						} catch (t) {
							throw o.destroySkin(e), t;
						}
					}
					e !== void 0 && o.destroySkin(e);
				}
				o.updateDrawablePosition(m.drawableID, [ve, ye]);
			}
			o.updateDrawablePosition(h.drawableID, [be, V]), g && o.updateDrawablePosition(g.drawableID, [be + a.width / 2 - y.width / 2 - Bo * e, V - a.height / 2 + y.height / 2 + Bo * e]);
			let xe = (e, t) => {
				e && E.set(e.drawableID, t);
			};
			xe(n, [le - fe.x, V + fe.y]), xe(h, [be, V]), xe(s, [ve, ye]), xe(f, [ve, ye]), xe(p, [ve, ye]), xe(m, [ve, ye]), D.set(n.drawableID, [100, 100]), D.set(h.drawableID, [e * 100, e * 100]);
			for (let e of [
				s,
				f,
				p
			]) {
				if (!e) continue;
				let t = v.get(e.drawableID) ?? 0;
				D.set(e.drawableID, [t, t]);
			}
			m && D.set(m.drawableID, [e * 100, e * 100]), g && D.set(g.drawableID, [y.scalePercent, y.scalePercent]), g && xe(g, [be + a.width / 2 - y.width / 2 - Bo * e, V - a.height / 2 + y.height / 2 + Bo * e]), P(), F();
		}, ee = t.onTargetVisualChange, L = (e) => {
			ee?.(e), I();
		}, R = () => I();
		return w.placement.basis === "actor" && (t.onTargetVisualChange = L), o.on?.("NativeSizeChanged", R), Object.freeze({
			targets: _,
			setLayerVisible(e, t) {
				x || (y.set(e, t), F());
			},
			updateStyle(e) {
				if (x) return;
				let n = w.placement.basis === "actor";
				w = e, O = [0, 0], k = 1, A = 1, j = void 0, e.reveal?.layout !== "RESERVED" && (T = void 0);
				let r = w.placement.basis === "actor";
				n && !r ? t.onTargetVisualChange === L && (t.onTargetVisualChange = ee ?? null) : !n && r && (t.onTargetVisualChange = L), I();
			},
			captureTextLayout() {
				x || (T = es(o, h, {
					width: 180,
					height: 48
				}), I());
			},
			clearTextLayout() {
				T = void 0, I();
			},
			renderScratchText(e) {
				x || (M = e, S = "", I());
			},
			async animate(e) {
				if (x) return;
				let t = Math.max(0, e.durationSeconds ?? 0), n = () => {
					x || (P(), F());
				}, r = (t) => Qa(t, e.ease ?? "easeInOut");
				if (e.name === "fadeIn" || e.name === "floatIn" || e.name === "zoomIn" || e.name === "riseUp") {
					b = !0;
					let i = e.name === "floatIn" || e.name === "riseUp" ? [0, 16] : [0, 0], o = e.name === "zoomIn" ? .01 : 1;
					O = i, k = o, A = e.name === "fadeIn" ? 0 : 1, n(), await $a(a, t, (t) => {
						let a = r(t);
						O = [i[0] * (1 - a), i[1] * (1 - a)], k = o + (1 - o) * a, A = e.name === "fadeIn" ? a : 1, n();
					}), O = [0, 0], k = 1, A = 1, I();
					return;
				}
				if (e.name === "fadeOut" || e.name === "floatOut" || e.name === "zoomOut" || e.name === "sink") {
					let i = e.name === "floatOut" || e.name === "sink" ? [0, -16] : [0, 0], o = e.name === "zoomOut" ? .01 : 1;
					O = [0, 0], k = 1, A = 1, n(), await $a(a, t, (t) => {
						let a = r(t);
						O = [i[0] * a, i[1] * a], k = 1 + (o - 1) * a, A = e.name === "fadeOut" ? 1 - a : 1, n();
					}), O = i, k = o, A = e.name === "fadeOut" ? 0 : 1, n(), b = !1, F(), O = [0, 0], k = 1, A = 1;
					return;
				}
				if (e.name === "shake") {
					let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .08, s = Be(typeof e.direction == "number" ? e.direction : e.direction ?? "right") ?? Be("right");
					O = [0, 0], await $a(a, o, (e) => {
						let t = r(e) * i * Math.PI * 2, a = Math.sin(t) * 5;
						O = [s.x * a, s.y * a], n();
					}), O = [0, 0], I();
					return;
				}
				if (e.name === "explode") {
					let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .12, s = e.relativeScale ?? 1.15;
					await $a(a, o, (e) => {
						let t = r(e), a = Math.abs(Math.sin(t * i * Math.PI));
						k = 1 + (s - 1) * a, n();
					}), k = 1, I();
					return;
				}
				if (e.name === "animateBubbleShape") {
					let n = e.visualStyle ?? w.visualStyle, r = w.visualStyle, i = e.speed === void 0 ? 1 : Math.max(0, e.speed);
					j = {
						from: r,
						to: n,
						progress: 0
					}, I(), await $a(a, t, (a) => {
						let o = t === 0 ? 1 : Za(a * Math.max(i, 1) / 1);
						j = {
							from: r,
							to: n,
							progress: Qa(o, e.ease ?? "easeInOut")
						}, I();
					}), j = void 0, I();
					return;
				}
			},
			show() {
				x || (b = !0, I());
			},
			hide() {
				x || (b = !1, F());
			},
			dispose() {
				if (!x) {
					x = !0, o.off?.("NativeSizeChanged", R), w.placement.basis === "actor" && t.onTargetVisualChange === L && (t.onTargetVisualChange = ee ?? null);
					for (let e of [...c].reverse()) o.destroyDrawable(e.drawableID, Lo);
					l !== void 0 && (o.destroySkin(l), l = void 0), u !== void 0 && (o.destroySkin(u), u = void 0), e.requestRedraw?.();
				}
			}
		});
	} catch (e) {
		for (let e of [...c].reverse()) o.destroyDrawable(e.drawableID, Lo);
		throw l !== void 0 && o.destroySkin(l), u !== void 0 && o.destroySkin(u), e;
	}
}
function ss(e, t = {}) {
	if (!Uo(e)) throw new $("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp runtime.");
	let n = e, r = Wo(n.renderer), i = Go(t.bubbleRenderBackend), a, o;
	if (i === "svg-overlay") {
		if (t.svgOverlayTextCapability !== void 0) a = t.svgOverlayTextCapability;
		else if (n.ext_kubohiroyasvgtext === void 0) a = Yo();
		else try {
			a = Wa(n.ext_kubohiroyasvgtext);
		} catch (e) {
			o = e instanceof Error ? e.message : String(e);
		}
	}
	let s = Ko(t.svgOverlayUnsupportedBehavior), c = i === "svg-overlay" ? qo(t.document) : void 0, l = i === "svg-overlay" ? o ?? Jo(r, c, a) : void 0;
	if (i === "svg-overlay" && l !== void 0 && s === "error") throw new $("BUBBLE-RUNTIME-004", `Bubble SVG overlay backend is unavailable because ${l}. Use scratch-render or install the required public upstream capability.`);
	let u = i === "svg-overlay" && l === void 0 ? "svg-overlay" : "scratch-render", d = t.scheduler ?? {
		setTimeout: (e, t) => globalThis.setTimeout(e, t),
		clearTimeout: (e) => globalThis.clearTimeout(e)
	}, f = () => Zo(n.ext_kubohiroyaassetmanager), p, m = () => (p ??= Qo(n.ext_kubohiroyaassetmanager), p), h;
	if (u === "svg-overlay") try {
		h = xo(a, r);
	} catch (e) {
		throw new $("BUBBLE-RUNTIME-004", `Bubble SVG overlay text capability is invalid: ${e instanceof Error ? e.message : String(e)}`);
	}
	else if (t.textCapability !== void 0) h = t.textCapability;
	else try {
		h = n.ext_kubohiroyasvgtext === void 0 ? Xo(n) : Va(n.ext_kubohiroyasvgtext);
	} catch (e) {
		throw new $("BUBBLE-RUNTIME-003", `Bubble could not initialize the scratch-render text provider: ${e instanceof Error ? e.message : String(e)}`);
	}
	let g;
	if (u === "svg-overlay") try {
		g = Eo(t.svgOverlayImageCapability ?? Xa(Object.freeze({
			isRegistered(e) {
				return m().isRegistered(e);
			},
			getMimeType(e) {
				return m().getMimeType(e);
			},
			resolveDOMImageResource(e) {
				return m().resolveDOMImageResource(e);
			}
		})));
	} catch (e) {
		throw new $("BUBBLE-RUNTIME-004", `Bubble SVG overlay image capability is invalid: ${e instanceof Error ? e.message : String(e)}`);
	}
	else g = t.imageResolver ?? {
		isRegistered(e) {
			return f().isLoaded({ NAME: e });
		},
		getMimeType(e) {
			return f().getAssetMimeType({ NAME: e });
		},
		async applyToTarget(e, t) {
			let i = t.drawableID;
			if (!Number.isInteger(i) || i < 0) throw new $("BUBBLE-RUNTIME-001", "Bubble image target drawable is invalid.");
			let a = await f().resolveSkin(e);
			if (!Uo(a) || !Number.isInteger(a.skinId) || a.skinId < 0) throw new $("BUBBLE-RUNTIME-002", `Asset Manager did not resolve an image skin: ${String(e)}`);
			r.updateDrawableSkinId(i, a.skinId), n.requestRedraw?.();
		}
	};
	let _ = t.audio ?? {
		isRegistered(e) {
			return f().isLoaded({ NAME: e });
		},
		getMimeType(e) {
			return f().getAssetMimeType({ NAME: e });
		},
		async playSound(e, t = {}) {
			let n = f(), r = t.untilDone ? n?.playSoundUntilDone : n?.playSound;
			if (typeof r != "function") throw new $("BUBBLE-RUNTIME-002", "TurboWarp Asset Manager does not provide audio playback.");
			await r.call(n, { NAME: e });
		}
	}, v = u === "svg-overlay" ? Do(r, c) : void 0;
	return Pa({
		...g === void 0 ? {} : { imageResolver: g },
		audio: _,
		textCapability: h,
		createSurface({ actor: e, actorKey: t, kind: r, style: i }) {
			if (!Uo(e) || typeof e.id != "string") throw new $("BUBBLE-RUNTIME-001", "Bubble actor target is invalid.");
			return u === "svg-overlay" ? Io(v, e, t, r, i, d) : os(n, e, t, r, i, d);
		},
		...t.scheduler === void 0 ? {} : { scheduler: t.scheduler },
		...t.onAnimationError === void 0 ? {} : { onAnimationError: t.onAnimationError }
	});
}
//#endregion
export { $ as BubbleRuntimeAdapterError, lo as bubbleRenderBackends, Xa as createAssetManagerSvgOverlayImageCapability, Eo as createSvgOverlayImageAdapter, Io as createSvgOverlaySurface, Do as createSvgOverlaySurfaceManager, xo as createSvgOverlayTextAdapter, Ha as createSvgTextCompositionCapability, Ua as createSvgTextOverlayTextCapability, ss as createTurboWarpBubbleComposition, Va as createTurboWarpSvgTextCapability, Wa as createTurboWarpSvgTextOverlayTextCapability, fo as defaultBubbleOverlayUnsupportedBehavior, uo as defaultBubbleRenderBackend };
