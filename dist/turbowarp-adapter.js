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
	$schema: "http://json-schema.org/draft-07/schema#",
	$id: "https://kubohiroya.github.io/turbowarp-svg-text/schemas/block-editor-fixed-inputs.schema.json",
	title: "turbowarp-svg-text fixed editing contracts",
	$defs: { defineStyle: {
		type: "object",
		properties: {
			BACKGROUND: {
				type: "string",
				pattern: "^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$",
				description: "New native colour_picker candidate only. Common host commit485f0e550e622235624b5e9176820161aeeba252 src/turbowarp/fixed-fields.js restricts new candidates to 3/6-digit hex; the existing runtime also accepts #4/#8, transparent and CSS colours."
			},
			TEXT_COLOR: {
				type: "string",
				pattern: "^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$",
				description: "New native colour_picker candidate only. Common host commit485f0e550e622235624b5e9176820161aeeba252 src/turbowarp/fixed-fields.js restricts new candidates to 3/6-digit hex; the existing runtime also accepts #4/#8, transparent and CSS colours."
			},
			SIZE: { type: "number" },
			ALIGN: {
				type: "string",
				enum: [
					"left",
					"center",
					"right"
				]
			}
		},
		additionalProperties: !1
	} },
	description: "Fixed editing contract for changed standard native fields, not the complete runtime input domain. Colour candidates intersect the common host #RGB/#RRGGBB allowlist with owner validity; existing broader colour raw values are retained unchanged."
}, d = {
	id: "kubohiroyasvgtext",
	slug: "svg-text",
	name: "SVG Text",
	description: "Responsive named-style SVG text actors for TurboWarp.",
	author: "Hiroya Kubo",
	license: "MPL-2.0",
	unsandboxed: !0,
	blockIconURI: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2048%2048%22%3E%3Ctext%20x%3D%2221%22%20y%3D%2238%22%20font-family%3D%22system-ui%2C%20sans-serif%22%20font-size%3D%2230%22%20font-weight%3D%22700%22%20text-anchor%3D%22middle%22%20fill%3D%22%234C97FF%22%3EA%3C%2Ftext%3E%3Cg%20fill%3D%22%2359C059%22%3E%3Ccircle%20cx%3D%2231%22%20cy%3D%2213%22%20r%3D%222.6%22%2F%3E%3Ccircle%20cx%3D%2239%22%20cy%3D%2213%22%20r%3D%222.6%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"
}, f = u.$defs, p = "turbowarp-svg-text", m = {
	repository: p,
	path: "schemas/block-editor-fixed-inputs.schema.json"
}, h = "fixed-inputs-v1", g = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?$/u;
function _(e) {
	if (typeof e == "number" && Number.isFinite(e)) return e;
	if (typeof e != "string" || !g.test(e.trim())) throw TypeError("Invalid fixed number.");
	let t = Number(e);
	if (!Number.isFinite(t)) throw TypeError("Invalid fixed number.");
	return t;
}
function v(e) {
	if (typeof e != "string" && typeof e != "number") throw TypeError("Invalid numeric projection.");
	if (typeof e == "string" && e.trim() === "") throw TypeError("Unprojected existing numeric field.");
	let t = Number(e);
	if (!Number.isFinite(t)) throw TypeError("Invalid numeric projection.");
	return t;
}
function y(e, t, n) {
	return n.trim().toLowerCase();
}
function b(e, t) {
	let n = {
		...m,
		symbol: `/$defs/${e}/properties/${t}`
	};
	return {
		identity: {
			ownerId: p,
			contractId: `${e}.${t}`,
			revision: h,
			variantId: "fixed"
		},
		dialect: "draft-07",
		root: {
			retrievalUri: `${u.$id}?binding=${e}.${t}`,
			document: f[e].properties[t],
			artifact: {
				role: "canonical-schema",
				source: n
			}
		},
		resources: [],
		provenance: {
			canonicalSources: [
				n,
				{
					repository: p,
					path: "src/fixed-input-editors.ts",
					symbol: "fixedInputEditorOptions"
				},
				{
					repository: "turbowarp-extension-data-editor",
					path: "src/turbowarp/fixed-fields.js",
					version: "485f0e550e622235624b5e9176820161aeeba252",
					symbol: "prepareFixedChange"
				},
				{
					repository: p,
					path: "src/block-definitions.json"
				},
				{
					repository: p,
					path: "src/extension.ts",
					symbol: e
				}
			],
			generatedFiles: [],
			referenceSchemas: [],
			generationSources: []
		}
	};
}
function x() {
	return Object.entries(f).map(([e, t]) => {
		let n = Object.entries(t.properties).map(([t, n]) => ({
			argument: t,
			schemaBundle: b(e, t),
			control: n.enum ? {
				kind: "enum",
				choices: n.enum.map((e) => ({
					value: e,
					label: e
				}))
			} : { kind: n.type === "number" || n.type === "integer" ? "number" : "color" },
			read(r) {
				if (n.type === "number" || n.type === "integer") return v(r);
				if (typeof r != "string") throw TypeError("Invalid string projection.");
				return n.enum ? y(e, t, r) : r;
			},
			encode(e) {
				if (n.type === "number" || n.type === "integer") return _(e), typeof e == "number" ? Object.is(e, -0) ? "-0" : String(e) : e.trim();
				if (typeof e != "string") throw TypeError("Invalid fixed string.");
				return n.pattern && /^#[\da-f]{3}$/iu.test(e) ? `#${e[1]}${e[1]}${e[2]}${e[2]}${e[3]}${e[3]}` : e;
			},
			validateCandidate(e) {
				let r;
				try {
					if (n.type === "number" || n.type === "integer") {
						let t = v(e);
						r = (n.type !== "integer" || Number.isInteger(t)) && (n.minimum === void 0 || t >= n.minimum) && (n.maximum === void 0 || t <= n.maximum) && (n.exclusiveMinimum === void 0 || t > n.exclusiveMinimum);
					} else r = typeof e == "string" && (n.enum ? n.enum.includes(e) : new RegExp(n.pattern, "u").test(e));
				} catch {
					r = !1;
				}
				return r ? [] : [{
					path: t,
					message: "Check this value before saving."
				}];
			}
		}));
		return {
			apiVersion: 1,
			extensionId: d.id,
			editorId: `${d.id}.fixed.${e}`,
			opcodes: [`${d.id}_${e}`],
			contractId: `${p}.${e}.fixed`,
			contractRevision: h,
			bindings: n,
			validationContext: () => ({
				consumerId: p,
				nowMs: 0,
				settings: null
			})
		};
	});
}
function S(e, t) {
	let n = e.gui?.blockEditors;
	if (n?.apiVersion !== 1 || typeof n.registerFixedInputEditor != "function") return;
	let r = t, i = x(), a = [], o = "registered", s = () => {
		for (let e of a.splice(0).reverse()) e();
	}, c = () => {
		try {
			for (let e of i) a.push(n.registerFixedInputEditor.call(n, e));
		} catch (e) {
			throw s(), e;
		}
	}, l = () => {
		o === "registered" && (o = "released", s());
	}, u = () => {
		o === "released" && (c(), o = "registered");
	};
	return c(), r.on?.("RUNTIME_DISPOSED", l), r.on?.("PROJECT_LOADED", u), () => {
		o !== "disposed" && (o = "disposed", r.off?.("RUNTIME_DISPOSED", l), r.off?.("PROJECT_LOADED", u), s());
	};
}
var C = 480, w = 360, T = 100, E = 50, D = 1, O = 128, k = {
	fontSize: 14,
	lineHeight: 16,
	padding: 12,
	cornerRadius: 8
}, A = Object.freeze({
	alignment: "left",
	backgroundColor: "#ffffff",
	font: "Helvetica",
	fontPercent: T,
	textColor: "#575e75"
}), j = Object.freeze({
	...A,
	rubyFontPercent: E,
	rubyGap: D
});
function M(e, t, n) {
	let r = R(t, n), i = e.split("\n").map((e) => ({
		text: e,
		width: ee(e, r.fontSize)
	})), a = Math.max(1, ...i.map((e) => e.width)), o = Math.max(1, Math.ceil(a + r.padding * 2)), s = Math.max(1, Math.ceil(r.lineHeight * i.length + r.padding * 2)), c = t.alignment === "center" ? o / 2 : t.alignment === "right" ? o - r.padding : r.padding, l = Object.freeze(i.map((e, t) => Object.freeze({
		baseline: r.padding + r.fontSize + r.lineHeight * t,
		text: e.text,
		width: e.width,
		x: c
	}))), u = z(t, r);
	return Object.freeze({
		height: s,
		lines: l,
		preserveWhitespace: !0,
		style: u,
		width: o
	});
}
function N(e, t, n, r) {
	let i = R(t, n), a = i.fontSize * (t.rubyFontPercent / T), o = t.rubyGap * i.fontScale, s = Object.freeze({
		...z(t, i),
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
			let r = ee(n.base, i.fontSize), o = ee(n.reading, a);
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
		for (let e of B(n.text)) {
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
				width: ee(e.segment, i.fontSize)
			});
		}
	}
	let f = r === void 0 ? void 0 : Math.max(1, r - i.padding * 2), p = [], m = {
		units: [],
		width: 0
	}, h = () => {
		p.push(m), m = {
			units: [],
			width: 0
		};
	};
	for (let e of d) {
		if (e === "break") {
			h();
			continue;
		}
		f !== void 0 && m.units.length > 0 && m.width + e.width > f && h(), m.units.push(e), m.width += e.width;
	}
	h();
	let g = Math.max(1, ...p.map((e) => e.width)) + i.padding * 2, _ = Math.max(1, Math.ceil(r === void 0 ? g : Math.max(r, g))), v = Math.max(0, i.lineHeight - i.fontSize), y = i.padding, b = Object.freeze(p.map((e) => {
		let n = e.units.some((e) => e.type === "ruby"), r = i.fontSize + (n ? a + o : 0), s = v, c = r + s, l = y + r, u = t.alignment === "center" ? (_ - e.width) / 2 : t.alignment === "right" ? _ - i.padding - e.width : i.padding, d = u, p = Object.freeze(e.units.map((e) => {
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
		return y += c, m;
	})), x = Math.max(1, Math.ceil(y + i.padding)), S = b.some((e) => e.overflow);
	return Object.freeze({
		height: x,
		lines: b,
		overflow: S,
		plainText: c,
		preserveWhitespace: !0,
		readingText: l,
		revealUnits: Object.freeze(u),
		style: s,
		width: _
	});
}
function P(e) {
	let t = e.style.alignment === "center" ? "middle" : e.style.alignment === "right" ? "end" : "start", n = e.lines.map((e) => e.text).join("\n"), r = e.lines.map((e) => `<tspan x="${U(e.x)}" y="${U(e.baseline)}">${H(e.text)}</tspan>`).join(""), i = e.preserveWhitespace ? " xml:space=\"preserve\"" : "";
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}" role="img"><title>${H(n)}</title><rect width="${e.width}" height="${e.height}" rx="${U(e.style.cornerRadius)}" fill="${H(e.style.backgroundColor)}"/><text${i} fill="${H(e.style.textColor)}" font-family="${H(e.style.font)}" font-size="${U(e.style.fontSize)}" text-anchor="${t}">${r}</text></svg>`;
}
function F(e) {
	let t = e.lines.flatMap((t) => t.fragments.flatMap((t) => t.type === "text" ? [`<tspan x="${U(t.x)}" y="${U(t.baseline)}" font-size="${U(e.style.fontSize)}">${H(t.text)}</tspan>`] : [`<tspan x="${U(t.reading.x)}" y="${U(t.reading.baseline)}" font-size="${U(t.reading.fontSize)}">${H(t.reading.text)}</tspan>`, `<tspan x="${U(t.base.x)}" y="${U(t.base.baseline)}" font-size="${U(t.base.fontSize)}">${H(t.base.text)}</tspan>`])).join(""), n = e.preserveWhitespace ? " xml:space=\"preserve\"" : "";
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}" role="img"><title>${H(e.plainText)}</title><rect width="${e.width}" height="${e.height}" rx="${U(e.style.cornerRadius)}" fill="${H(e.style.backgroundColor)}"/><text${n} fill="${H(e.style.textColor)}" font-family="${H(e.style.font)}" text-anchor="start">${t}</text></svg>`;
}
function I(e, t) {
	let n = e.trim();
	return n === "" ? t : n.toLowerCase() === "transparent" || /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/iu.test(n) || globalThis.CSS?.supports?.("color", n) ? n : t;
}
function L(e) {
	let t = e.trim(), n = [...t].some((e) => {
		let t = e.codePointAt(0) ?? 0;
		return t <= 31 || t === 127 || ",;{}".includes(e);
	});
	return t === "" || t.length > O || n ? A.font : t;
}
function R(e, t) {
	let n = Math.min(t[0] / C, t[1] / w), r = n * (e.fontPercent / T);
	return {
		cornerRadius: k.cornerRadius * n,
		fontScale: r,
		fontSize: k.fontSize * r,
		lineHeight: k.lineHeight * r,
		padding: k.padding * n
	};
}
function z(e, t) {
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
function B(e) {
	let t = [], n = "", r = 0, i = !1, a = 0;
	for (let o of e) !(n !== "" && (i || o === "‍" || V(o))) && n !== "" && (t.push({
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
function V(e) {
	if (/\p{Mark}/u.test(e)) return !0;
	let t = e.codePointAt(0) ?? 0;
	return t >= 65024 && t <= 65039 || t >= 917760 && t <= 917999 || t >= 127995 && t <= 127999;
}
function ee(e, t) {
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
function H(e) {
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
function U(e) {
	return String(Math.round(e * 1e3) / 1e3);
}
var te = l.blocks, ne = l.menus, re = "https://kubohiroya.github.io/turbowarp-svg-text/", ie = "default", ae = 100, W = 50, oe = 1, se = 1, ce = 1e3, le = 10, ue = 100, de = 0, fe = 100, pe = d.blockIconURI, me = class {
	constructor(e = Scratch.vm?.runtime, t = {}) {
		if (this.styles = /* @__PURE__ */ new Map([[ie, j]]), this.textActors = /* @__PURE__ */ new Map(), !e) throw Error("SVG Text requires the TurboWarp VM.");
		this.runtime = e, this.castToString = t.castToString ?? Scratch.Cast.toString, (t.listenForRuntimeEvents ?? !0) && this.runtime.on("STAGE_SIZE_CHANGED", () => {
			this.restyleTextActors();
		});
	}
	getInfo() {
		return this.fixedEditorsDispose ??= S(Scratch, this.runtime), {
			id: d.id,
			name: Scratch.translate(l.extensionName),
			docsURI: re,
			blockIconURI: pe,
			color1: "#9966ff",
			blocks: te.map((e) => this.toScratchBlock(e)),
			menus: ne
		};
	}
	defineStyle(e) {
		let t = this.normalizeStyleName(e.STYLE);
		this.styles.set(t, {
			alignment: this.normalizeAlignment(e.ALIGN),
			backgroundColor: this.normalizeColor(e.BACKGROUND, A.backgroundColor),
			font: this.normalizeFont(e.FONT),
			fontPercent: this.normalizeFontPercent(e.SIZE),
			rubyFontPercent: this.normalizeRubyFontPercent(e.RUBY_SIZE),
			rubyGap: this.normalizeRubyGap(e.RUBY_GAP),
			textColor: this.normalizeColor(e.TEXT_COLOR, A.textColor)
		}), this.restyleTextActors(t);
	}
	setText(e, t) {
		this.applyTextActor(t.target, {
			kind: "plain",
			text: this.normalizeMessage(e.TEXT)
		}, this.resolveStyle(e.STYLE));
	}
	measureText(e, t) {
		let n = this.resolveStyle(e), r = M(this.normalizeMessage(t), n.definition, this.getNativeSize());
		return Math.max(0, ...r.lines.map((e) => e.width));
	}
	getLayoutCapability() {
		return this.layoutCapabilityValue ??= Object.freeze({
			layoutText: (e) => {
				if (typeof e != "object" || !e || typeof e.styleName != "string" || typeof e.text != "string") throw TypeError("SVG Text layout capability input is invalid.");
				let t = this.requireLayoutNativeSize(e.nativeSize), n = this.resolveStyle(e.styleName);
				return M(this.normalizeMessage(e.text), n.definition, t);
			},
			layoutRichText: (e) => {
				if (typeof e != "object" || !e || typeof e.styleName != "string") throw TypeError("SVG Text rich layout capability input is invalid.");
				this.requireLayoutNativeSize(e.nativeSize);
				let t = this.resolveStyle(e.styleName);
				return Re(/* @__PURE__ */ new Map([[e.styleName, t.definition]]), e);
			}
		}), this.layoutCapabilityValue;
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
		return this.castToString(e).trim() || ie;
	}
	normalizeFontPercent(e) {
		if (typeof e == "string" && e.trim() === "") return ae;
		let t = Number(e);
		return Number.isFinite(t) ? Math.min(ce, Math.max(se, t)) : ae;
	}
	normalizeRubyFontPercent(e) {
		if (typeof e == "string" && e.trim() === "") return W;
		let t = Number(e);
		return Number.isFinite(t) ? Math.min(ue, Math.max(le, t)) : W;
	}
	normalizeRubyGap(e) {
		if (typeof e == "string" && e.trim() === "") return oe;
		let t = Number(e);
		return Number.isFinite(t) ? Math.min(fe, Math.max(de, t)) : oe;
	}
	normalizeMessage(e) {
		return this.castToString(e).replace(/\\r\\n|\\n|\\r/gu, "\n");
	}
	normalizeAlignment(e) {
		let t = this.castToString(e).trim().toLowerCase();
		return t === "center" || t === "right" ? t : "left";
	}
	normalizeColor(e, t) {
		return I(this.castToString(e), t);
	}
	normalizeFont(e) {
		return L(this.castToString(e));
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
		return e.kind === "composition" ? e.render(t, this.getNativeSize()) : P(M(e.text, t, this.getNativeSize()));
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
			definition: this.styles.get(ie) ?? j,
			styleName: ie
		};
	}
	restyleTextActors(e) {
		for (let [t, n] of [...this.textActors]) (e === void 0 || n.styleName === e) && this.applyTextActor(t, n.content, this.resolveStyle(n.styleName));
	}
}, he = "default", ge = 1e5, _e = 1e3, ve = 1024, ye = 1e4, be = 1e5, xe = 256, Se = 512;
function G(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function K(e, t) {
	let n = Error(t);
	return Object.defineProperty(n, "code", { value: e }), n;
}
function Ce(e, t, n, r) {
	let i = /* @__PURE__ */ new Set([...t, ...n]);
	if (t.some((t) => !Object.prototype.hasOwnProperty.call(e, t)) || Object.keys(e).some((e) => !i.has(e))) throw K("SVG-TEXT-COMPOSITION-001", `${r} has missing or unknown properties.`);
}
function we(e, t) {
	if (typeof e != "string" || e.trim().length === 0) throw K("SVG-TEXT-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e.trim();
}
function Te(e) {
	if (!G(e) || !G(e.renderer)) throw TypeError("SVG Text composition runtime must provide a renderer.");
	let t = e.renderer, n = [
		"createSVGSkin",
		"destroySkin",
		"updateDrawableSkinId"
	];
	if (n.some((e) => typeof t[e] != "function")) throw TypeError(`SVG Text composition renderer must provide ${n.join(", ")}.`);
	if (e.requestRedraw !== void 0 && typeof e.requestRedraw != "function") throw TypeError("SVG Text composition requestRedraw must be a function.");
	return e;
}
function Ee(e) {
	if (!G(e) || typeof e.drawableID != "number" || !Number.isInteger(e.drawableID) || e.drawableID < 0) throw K("SVG-TEXT-COMPOSITION-002", "SVG Text target must provide a non-negative integer drawableID.");
	return e;
}
function De(e, t) {
	if (e !== void 0 && (typeof e != "string" || e.length === 0)) throw K("SVG-TEXT-COMPOSITION-001", `${t} must be a non-empty string when provided.`);
}
function Oe(e) {
	if (!G(e)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text style must be an object.");
	Ce(e, ["name"], [
		"alignment",
		"backgroundColor",
		"font",
		"fontPercent",
		"rubyFontPercent",
		"rubyGap",
		"textColor"
	], "SVG Text style");
	let t = we(e.name, "SVG Text style name");
	if (e.alignment !== void 0 && e.alignment !== "left" && e.alignment !== "center" && e.alignment !== "right") throw K("SVG-TEXT-COMPOSITION-001", "SVG Text alignment is invalid.");
	if (De(e.backgroundColor, "SVG Text backgroundColor"), De(e.font, "SVG Text font"), De(e.textColor, "SVG Text textColor"), e.fontPercent !== void 0 && (typeof e.fontPercent != "number" || !Number.isFinite(e.fontPercent) || e.fontPercent < 1 || e.fontPercent > 1e3)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text fontPercent must be a finite number from 1 to 1000.");
	if (e.rubyFontPercent !== void 0 && (typeof e.rubyFontPercent != "number" || !Number.isFinite(e.rubyFontPercent) || e.rubyFontPercent < 10 || e.rubyFontPercent > 100)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text rubyFontPercent must be a finite number from 10 to 100.");
	if (e.rubyGap !== void 0 && (typeof e.rubyGap != "number" || !Number.isFinite(e.rubyGap) || e.rubyGap < 0 || e.rubyGap > 100)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text rubyGap must be a finite number from 0 to 100.");
	return {
		...e,
		name: t
	};
}
function ke(e) {
	return Object.freeze({
		alignment: e.alignment ?? A.alignment,
		backgroundColor: I(e.backgroundColor ?? "", A.backgroundColor),
		font: L(e.font ?? ""),
		fontPercent: e.fontPercent ?? A.fontPercent,
		rubyFontPercent: e.rubyFontPercent ?? j.rubyFontPercent,
		rubyGap: e.rubyGap ?? j.rubyGap,
		textColor: I(e.textColor ?? "", A.textColor)
	});
}
function Ae(e) {
	if (!Array.isArray(e) || e.length !== 2 || e.some((e) => typeof e != "number" || !Number.isFinite(e) || e <= 0)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text nativeSize must be [width, height] with two positive finite numbers.");
	return e;
}
function je(e) {
	let t = e.getNativeSize?.();
	if (!Array.isArray(t) || t.length < 2) return [480, 360];
	let n = Number(t[0]), r = Number(t[1]);
	return !Number.isFinite(n) || !Number.isFinite(r) || n <= 0 || r <= 0 ? [480, 360] : [n, r];
}
function Me(e) {
	return e.replace(/\\r\\n|\\n|\\r/gu, "\n");
}
function Ne(e) {
	return Me(e.replace(/\r\n?|\n/gu, "\n"));
}
function Pe(e) {
	return K("SVG-TEXT-COMPOSITION-007", e);
}
function Fe(e) {
	if (!Array.isArray(e)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text rich content runs must be an array.");
	if (e.length > ve) throw Pe(`SVG Text rich content exceeds ${ve} runs.`);
	let t = 0, n = 0, r = 1, i = e.map((e, i) => {
		if (!G(e)) throw K("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} must be an object.`);
		if (e.type === "text") {
			if (Ce(e, ["type", "text"], [], `SVG Text rich content run ${i}`), typeof e.text != "string") throw K("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} text must be a string.`);
			let a = Ne(e.text);
			return t += a.length, r += a.split("\n").length - 1, n += [...a.replace(/\n/gu, "")].length, Object.freeze({
				text: a,
				type: "text"
			});
		}
		if (e.type === "ruby") {
			if (Ce(e, [
				"type",
				"base",
				"reading"
			], [], `SVG Text rich content run ${i}`), typeof e.base != "string" || typeof e.reading != "string") throw K("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} ruby base and reading must be strings.`);
			let r = Ne(e.base), a = Ne(e.reading);
			if (r.length === 0 || a.length === 0 || r.includes("\n") || a.includes("\n")) throw K("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} ruby base and reading must be non-empty single-line strings.`);
			if (r.length > xe) throw Pe(`SVG Text ruby base exceeds ${xe} characters.`);
			if (a.length > Se) throw Pe(`SVG Text ruby reading exceeds ${Se} characters.`);
			return t += r.length + a.length, n += 1, Object.freeze({
				base: r,
				reading: a,
				type: "ruby"
			});
		}
		throw K("SVG-TEXT-COMPOSITION-001", `SVG Text rich content run ${i} type is invalid.`);
	});
	if (t > ge) throw Pe(`SVG Text rich content exceeds ${ge} characters.`);
	if (r > _e) throw Pe(`SVG Text rich content exceeds ${_e} lines.`);
	if (n > ye) throw Pe(`SVG Text rich content exceeds ${ye} layout fragments.`);
	return Object.freeze(i);
}
function Ie(e) {
	if (e !== void 0) {
		if (typeof e != "number" || !Number.isFinite(e) || e <= 0 || e > be) throw K("SVG-TEXT-COMPOSITION-001", `SVG Text maxWidth must be a finite number greater than 0 and no greater than ${be}.`);
		return e;
	}
}
function Le(e, t) {
	if (!G(t)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text layout input is invalid.");
	Ce(t, [
		"styleName",
		"text",
		"nativeSize"
	], [], "SVG Text layout input");
	let n = we(t.styleName, "SVG Text styleName"), r = e.get(n);
	if (!r) throw K("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${n}`);
	if (typeof t.text != "string") throw K("SVG-TEXT-COMPOSITION-001", "SVG Text text must be a string.");
	return M(Me(t.text), r, Ae(t.nativeSize));
}
function Re(e, t) {
	if (!G(t)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text rich layout input is invalid.");
	Ce(t, [
		"styleName",
		"runs",
		"nativeSize"
	], ["maxWidth"], "SVG Text rich layout input");
	let n = we(t.styleName, "SVG Text styleName"), r = e.get(n);
	if (!r) throw K("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${n}`);
	let i = Fe(t.runs), a = Ae(t.nativeSize), o = Ie(t.maxWidth);
	return o === void 0 ? N(i, r, a) : N(i, r, a, o);
}
function ze() {
	let e = /* @__PURE__ */ new Map([[he, j]]);
	return Object.freeze({
		defineStyle(t) {
			let n = Oe(t);
			e.set(n.name, ke(n));
		},
		layoutRichText(t) {
			return Re(e, t);
		},
		layoutText(t) {
			return Le(e, t);
		}
	});
}
function Be(e) {
	if (!G(e)) throw TypeError("SVG Text composition options must be an object.");
	let t = Te(e.runtime), n = new me(t, {
		castToString: (e) => String(e),
		listenForRuntimeEvents: !1
	}), r = /* @__PURE__ */ new Map([[he, j]]), i = /* @__PURE__ */ new Set(), a = !1;
	function o() {
		if (a) throw K("SVG-TEXT-COMPOSITION-004", "SVG Text composition has been released.");
	}
	return Object.freeze({
		defineStyle(e) {
			o();
			let t = Oe(e);
			n.defineStyle({
				ALIGN: t.alignment ?? "",
				BACKGROUND: t.backgroundColor ?? "",
				FONT: t.font ?? "",
				RUBY_GAP: t.rubyGap ?? "",
				RUBY_SIZE: t.rubyFontPercent ?? "",
				SIZE: t.fontPercent ?? "",
				STYLE: t.name,
				TEXT_COLOR: t.textColor ?? ""
			}), r.set(t.name, ke(t));
		},
		layoutRichText(e) {
			return o(), Re(r, e);
		},
		layoutText(e) {
			return o(), Le(r, e);
		},
		measureText(e) {
			if (o(), !G(e)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text measure input is invalid.");
			Ce(e, ["styleName", "text"], [], "SVG Text measure input");
			let t = we(e.styleName, "SVG Text styleName");
			if (!r.has(t)) throw K("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${t}`);
			if (typeof e.text != "string") throw K("SVG-TEXT-COMPOSITION-001", "SVG Text text must be a string.");
			return n.measureText(t, e.text);
		},
		measureRichText(e) {
			if (o(), !G(e)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text rich measure input is invalid.");
			Ce(e, ["styleName", "runs"], ["maxWidth"], "SVG Text rich measure input");
			let n = we(e.styleName, "SVG Text styleName"), i = r.get(n);
			if (!i) throw K("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${n}`);
			let a = Fe(e.runs), s = Ie(e.maxWidth), c = je(t.renderer), l = s === void 0 ? N(a, i, c) : N(a, i, c, s);
			return Math.max(0, ...l.lines.map((e) => e.width));
		},
		setRichText(e) {
			if (o(), !G(e)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text rich actor input is invalid.");
			Ce(e, [
				"styleName",
				"target",
				"runs"
			], ["maxWidth"], "SVG Text rich actor input");
			let t = Ee(e.target), a = we(e.styleName, "SVG Text styleName");
			if (!r.has(a)) throw K("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${a}`);
			let s = Fe(e.runs), c = Ie(e.maxWidth);
			n.setCompositionText(a, (e, t) => F(c === void 0 ? N(s, e, t) : N(s, e, t, c)), t), i.add(t);
		},
		setText(e) {
			if (o(), !G(e)) throw K("SVG-TEXT-COMPOSITION-001", "SVG Text actor input is invalid.");
			Ce(e, [
				"styleName",
				"target",
				"text"
			], [], "SVG Text actor input");
			let t = Ee(e.target), a = we(e.styleName, "SVG Text styleName");
			if (!r.has(a)) throw K("SVG-TEXT-COMPOSITION-003", `SVG Text style is not defined: ${a}`);
			if (typeof e.text != "string") throw K("SVG-TEXT-COMPOSITION-001", "SVG Text text must be a string.");
			n.setText({
				STYLE: a,
				TEXT: e.text
			}, { target: t }), i.add(t);
		},
		releaseTarget(e) {
			o();
			let t = Ee(e);
			if (!i.delete(t)) throw K("SVG-TEXT-COMPOSITION-005", "SVG Text target is not owned by this composition.");
			if (!n.releaseTextActor(t)) throw K("SVG-TEXT-COMPOSITION-005", "SVG Text target ownership is inconsistent.");
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
				let t = K("SVG-TEXT-COMPOSITION-006", "SVG Text composition failed to release one or more skins.");
				throw Object.defineProperty(t, "errors", { value: Object.freeze([...e]) }), t;
			}
		}
	});
}
//#endregion
//#region src/placement.ts
var Ve = [
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
], He = [
	"HEADER_LIKE",
	"CENTER",
	"FOOTER_LIKE"
], Ue = /* @__PURE__ */ new Map([
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
]), We = new Set(Ve), Ge = new Set(He), Ke = Math.SQRT2 - 1, qe = Object.freeze({
	down: {
		x: 0,
		y: -1
	},
	"down-down-left": {
		x: -Ke,
		y: -1
	},
	"down-down-right": {
		x: Ke,
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
		y: -Ke
	},
	"left-up-left": {
		x: -1,
		y: Ke
	},
	right: {
		x: 1,
		y: 0
	},
	"right-down-right": {
		x: 1,
		y: -Ke
	},
	"right-up-right": {
		x: 1,
		y: Ke
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
		x: -Ke,
		y: 1
	},
	"up-up-right": {
		x: Ke,
		y: 1
	}
});
function Je(e) {
	return Math.abs(e) < 1e-12 ? 0 : Math.abs(1 - Math.abs(e)) < 1e-12 ? Math.sign(e) : e;
}
function Ye(e) {
	if (typeof e == "number") {
		if (!Number.isFinite(e) || e < 0 || e > 360) throw TypeError("Bubble placement angle must be from 0 through 360.");
		return Object.freeze({
			basis: "actor",
			direction: e === 360 ? 0 : e
		});
	}
	if (typeof e != "string" || e.trim().length === 0) throw TypeError("Bubble placement must be a direction, angle, or region.");
	let t = e.trim(), n = t.toUpperCase();
	if (Ge.has(n)) return Object.freeze({
		basis: "background",
		region: n
	});
	let r = t.toLowerCase();
	if (We.has(r)) return Object.freeze({
		basis: "actor",
		direction: r
	});
	let i = Ue.get(r);
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
function Xe(e) {
	if (typeof e == "string") return qe[e];
	let t = e * Math.PI / 180;
	return Object.freeze({
		x: Je(Math.sin(t)),
		y: Je(Math.cos(t))
	});
}
//#endregion
//#region src/actor-transform.ts
var Ze = Object.freeze({
	x: 0,
	y: 0,
	scalePercent: 100
});
function Qe(e, t) {
	if (typeof e != "number" || !Number.isFinite(e)) throw TypeError(`${t} must be a finite number.`);
	return e;
}
function $e(e) {
	let t = Qe(e, "Bubble distance");
	if (t < 0) throw TypeError("Bubble distance must be zero or greater.");
	return t;
}
function et(e) {
	let t = Qe(e, "Bubble tail length");
	if (t <= 0) throw TypeError("Bubble tail length must be greater than zero.");
	return t;
}
function tt(e) {
	if (!Array.isArray(e) || e.length !== 2 && e.length !== 3) throw TypeError("Bubble offset must be [x, y] or [x, y, scale].");
	let t = Qe(e[0], "Bubble offset x"), n = Qe(e[1], "Bubble offset y"), r = Qe(e.length === 3 ? e[2] : 100, "Bubble offset scale");
	if (r <= 0) throw TypeError("Bubble offset scale must be greater than zero.");
	return Object.freeze({
		x: t,
		y: n,
		scalePercent: r
	});
}
function nt(e) {
	let t = (e.bounds.left + e.bounds.right) / 2, n = (e.bounds.top + e.bounds.bottom) / 2, r = Xe(e.direction), i = e.distance + e.tailLength, a = r.x < 0 ? t - e.bounds.left + i + e.bubbleWidth / 2 : e.bounds.right - t + i + e.bubbleWidth / 2, o = r.y < 0 ? n - e.bounds.bottom + i + e.bubbleHeight / 2 : e.bounds.top - n + i + e.bubbleHeight / 2, s = Math.min(r.x === 0 ? Infinity : a / Math.abs(r.x), r.y === 0 ? Infinity : o / Math.abs(r.y));
	return Object.freeze({
		x: t + r.x * s + e.offset.x,
		y: n + r.y * s + e.offset.y
	});
}
//#endregion
//#region node_modules/.pnpm/jsclipper@https+++codeload.github.com+platener+jsclipper+tar.gz+56aed19845113e1939d8971c47233054659436b1/node_modules/jsclipper/jsclipper.js
var rt = /* @__PURE__ */ o(((e, t) => {
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
		function L(e) {
			for (var t = this.abs(), n = e.t = 2 * t.t; --n >= 0;) e[n] = 0;
			for (n = 0; n < t.t - 1; ++n) {
				var r = t.am(n, t[n], e, 2 * n, 0, 1);
				(e[n + t.t] += t.am(n + 1, 2 * t[n], e, 2 * n + 1, r, t.t - n - 1)) >= t.DV && (e[n + t.t] -= t.DV, e[n + t.t + 1] = 1);
			}
			e.t > 0 && (e[e.t - 1] += t.am(n, t[n], e, 2 * n, 0, 1)), e.s = 0, e.clamp();
		}
		function R(e, t, n) {
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
		function z(e) {
			var t = l();
			return this.abs().divRemTo(e, null, t), this.s < 0 && t.compareTo(c.ZERO) > 0 && e.subTo(t, t), t;
		}
		function B(e) {
			this.m = e;
		}
		function V(e) {
			return e.s < 0 || e.compareTo(this.m) >= 0 ? e.mod(this.m) : e;
		}
		function ee(e) {
			return e;
		}
		function H(e) {
			e.divRemTo(this.m, null, e);
		}
		function U(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		function te(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		B.prototype.convert = V, B.prototype.revert = ee, B.prototype.reduce = H, B.prototype.mulTo = U, B.prototype.sqrTo = te;
		function ne() {
			if (this.t < 1) return 0;
			var e = this[0];
			if (!(e & 1)) return 0;
			var t = e & 3;
			return t = t * (2 - (e & 15) * t) & 15, t = t * (2 - (e & 255) * t) & 255, t = t * (2 - ((e & 65535) * t & 65535)) & 65535, t = t * (2 - e * t % this.DV) % this.DV, t > 0 ? this.DV - t : -t;
		}
		function re(e) {
			this.m = e, this.mp = e.invDigit(), this.mpl = this.mp & 32767, this.mph = this.mp >> 15, this.um = (1 << e.DB - 15) - 1, this.mt2 = 2 * e.t;
		}
		function ie(e) {
			var t = l();
			return e.abs().dlShiftTo(this.m.t, t), t.divRemTo(this.m, null, t), e.s < 0 && t.compareTo(c.ZERO) > 0 && this.m.subTo(t, t), t;
		}
		function ae(e) {
			var t = l();
			return e.copyTo(t), this.reduce(t), t;
		}
		function W(e) {
			for (; e.t <= this.mt2;) e[e.t++] = 0;
			for (var t = 0; t < this.m.t; ++t) {
				var n = e[t] & 32767, r = n * this.mpl + ((n * this.mph + (e[t] >> 15) * this.mpl & this.um) << 15) & e.DM;
				for (n = t + this.m.t, e[n] += this.m.am(0, r, e, t, 0, this.m.t); e[n] >= e.DV;) e[n] -= e.DV, e[++n]++;
			}
			e.clamp(), e.drShiftTo(this.m.t, e), e.compareTo(this.m) >= 0 && e.subTo(this.m, e);
		}
		function oe(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		function se(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		re.prototype.convert = ie, re.prototype.revert = ae, re.prototype.reduce = W, re.prototype.mulTo = se, re.prototype.sqrTo = oe;
		function ce() {
			return (this.t > 0 ? this[0] & 1 : this.s) == 0;
		}
		function le(e, t) {
			if (e > 4294967295 || e < 1) return c.ONE;
			var n = l(), r = l(), i = t.convert(this), a = k(e) - 1;
			for (i.copyTo(n); --a >= 0;) if (t.sqrTo(n, r), (e & 1 << a) > 0) t.mulTo(r, i, n);
			else {
				var o = n;
				n = r, r = o;
			}
			return t.revert(n);
		}
		function ue(e, t) {
			var n = e < 256 || t.isEven() ? new B(t) : new re(t);
			return this.exp(e, n);
		}
		c.prototype.copyTo = b, c.prototype.fromInt = x, c.prototype.fromString = C, c.prototype.clamp = w, c.prototype.dlShiftTo = j, c.prototype.drShiftTo = M, c.prototype.lShiftTo = N, c.prototype.rShiftTo = P, c.prototype.subTo = F, c.prototype.multiplyTo = I, c.prototype.squareTo = L, c.prototype.divRemTo = R, c.prototype.invDigit = ne, c.prototype.isEven = ce, c.prototype.exp = le, c.prototype.toString = T, c.prototype.negate = E, c.prototype.abs = D, c.prototype.compareTo = O, c.prototype.bitLength = A, c.prototype.mod = z, c.prototype.modPowInt = ue, c.ZERO = S(0), c.ONE = S(1);
		function de() {
			var e = l();
			return this.copyTo(e), e;
		}
		function fe() {
			if (this.s < 0) {
				if (this.t == 1) return this[0] - this.DV;
				if (this.t == 0) return -1;
			} else if (this.t == 1) return this[0];
			else if (this.t == 0) return 0;
			return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
		}
		function pe() {
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
				else for (this.fromNumber(e, n), this.testBit(e - 1) || this.bitwiseTo(c.ONE.shiftLeft(e - 1), Te, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(t);) this.dAddOffset(2, 0), this.bitLength() > e && this.subTo(c.ONE.shiftLeft(e - 1), this);
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
		function G(e) {
			return this.compareTo(e) > 0 ? this : e;
		}
		function K(e, t, n) {
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
		function Ce(e, t) {
			return e & t;
		}
		function we(e) {
			var t = l();
			return this.bitwiseTo(e, Ce, t), t;
		}
		function Te(e, t) {
			return e | t;
		}
		function Ee(e) {
			var t = l();
			return this.bitwiseTo(e, Te, t), t;
		}
		function De(e, t) {
			return e ^ t;
		}
		function Oe(e) {
			var t = l();
			return this.bitwiseTo(e, De, t), t;
		}
		function ke(e, t) {
			return e & ~t;
		}
		function Ae(e) {
			var t = l();
			return this.bitwiseTo(e, ke, t), t;
		}
		function je() {
			for (var e = l(), t = 0; t < this.t; ++t) e[t] = this.DM & ~this[t];
			return e.t = this.t, e.s = ~this.s, e;
		}
		function Me(e) {
			var t = l();
			return e < 0 ? this.rShiftTo(-e, t) : this.lShiftTo(e, t), t;
		}
		function Ne(e) {
			var t = l();
			return e < 0 ? this.lShiftTo(-e, t) : this.rShiftTo(e, t), t;
		}
		function Pe(e) {
			if (e == 0) return -1;
			var t = 0;
			return e & 65535 || (e >>= 16, t += 16), e & 255 || (e >>= 8, t += 8), e & 15 || (e >>= 4, t += 4), e & 3 || (e >>= 2, t += 2), e & 1 || ++t, t;
		}
		function Fe() {
			for (var e = 0; e < this.t; ++e) if (this[e] != 0) return e * this.DB + Pe(this[e]);
			return this.s < 0 ? this.t * this.DB : -1;
		}
		function Ie(e) {
			for (var t = 0; e != 0;) e &= e - 1, ++t;
			return t;
		}
		function Le() {
			for (var e = 0, t = this.s & this.DM, n = 0; n < this.t; ++n) e += Ie(this[n] ^ t);
			return e;
		}
		function Re(e) {
			var t = Math.floor(e / this.DB);
			return t >= this.t ? this.s != 0 : !!(this[t] & 1 << e % this.DB);
		}
		function ze(e, t) {
			var n = c.ONE.shiftLeft(e);
			return this.bitwiseTo(n, t, n), n;
		}
		function Be(e) {
			return this.changeBit(e, Te);
		}
		function Ve(e) {
			return this.changeBit(e, ke);
		}
		function He(e) {
			return this.changeBit(e, De);
		}
		function Ue(e, t) {
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
		function We(e) {
			var t = l();
			return this.addTo(e, t), t;
		}
		function Ge(e) {
			var t = l();
			return this.subTo(e, t), t;
		}
		function Ke(e) {
			var t = l();
			return this.multiplyTo(e, t), t;
		}
		function qe() {
			var e = l();
			return this.squareTo(e), e;
		}
		function Je(e) {
			var t = l();
			return this.divRemTo(e, t, null), t;
		}
		function Ye(e) {
			var t = l();
			return this.divRemTo(e, null, t), t;
		}
		function Xe(e) {
			var t = l(), n = l();
			return this.divRemTo(e, t, n), [t, n];
		}
		function Ze(e) {
			this[this.t] = this.am(0, e - 1, this, 0, 0, this.t), ++this.t, this.clamp();
		}
		function Qe(e, t) {
			if (e != 0) {
				for (; this.t <= t;) this[this.t++] = 0;
				for (this[t] += e; this[t] >= this.DV;) this[t] -= this.DV, ++t >= this.t && (this[this.t++] = 0), ++this[t];
			}
		}
		function $e() {}
		function et(e) {
			return e;
		}
		function tt(e, t, n) {
			e.multiplyTo(t, n);
		}
		function nt(e, t) {
			e.squareTo(t);
		}
		$e.prototype.convert = et, $e.prototype.revert = et, $e.prototype.mulTo = tt, $e.prototype.sqrTo = nt;
		function rt(e) {
			return this.exp(e, new $e());
		}
		function it(e, t, n) {
			var r = Math.min(this.t + e.t, t);
			for (n.s = 0, n.t = r; r > 0;) n[--r] = 0;
			var i;
			for (i = n.t - this.t; r < i; ++r) n[r + this.t] = this.am(0, e[r], n, r, 0, this.t);
			for (i = Math.min(e.t, t); r < i; ++r) this.am(0, e[r], n, r, 0, t - r);
			n.clamp();
		}
		function at(e, t, n) {
			--t;
			var r = n.t = this.t + e.t - t;
			for (n.s = 0; --r >= 0;) n[r] = 0;
			for (r = Math.max(t - this.t, 0); r < e.t; ++r) n[this.t + r - t] = this.am(t - r, e[r], n, 0, 0, this.t + r - t);
			n.clamp(), n.drShiftTo(1, n);
		}
		function ot(e) {
			this.r2 = l(), this.q3 = l(), c.ONE.dlShiftTo(2 * e.t, this.r2), this.mu = this.r2.divide(e), this.m = e;
		}
		function st(e) {
			if (e.s < 0 || e.t > 2 * this.m.t) return e.mod(this.m);
			if (e.compareTo(this.m) < 0) return e;
			var t = l();
			return e.copyTo(t), this.reduce(t), t;
		}
		function ct(e) {
			return e;
		}
		function lt(e) {
			for (e.drShiftTo(this.m.t - 1, this.r2), e.t > this.m.t + 1 && (e.t = this.m.t + 1, e.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); e.compareTo(this.r2) < 0;) e.dAddOffset(1, this.m.t + 1);
			for (e.subTo(this.r2, e); e.compareTo(this.m) >= 0;) e.subTo(this.m, e);
		}
		function ut(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		function dt(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		ot.prototype.convert = st, ot.prototype.revert = ct, ot.prototype.reduce = lt, ot.prototype.mulTo = dt, ot.prototype.sqrTo = ut;
		function ft(e, t) {
			var n = e.bitLength(), r, i = S(1), a;
			if (n <= 0) return i;
			r = n < 18 ? 1 : n < 48 ? 3 : n < 144 ? 4 : n < 768 ? 5 : 6, a = n < 8 ? new B(t) : t.isEven() ? new ot(t) : new re(t);
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
		function pt(e) {
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
		function mt(e) {
			if (e <= 0) return 0;
			var t = this.DV % e, n = this.s < 0 ? e - 1 : 0;
			if (this.t > 0) {
				if (t == 0) n = this[0] % e;
				else for (var r = this.t - 1; r >= 0; --r) n = (t * n + this[r]) % e;
			}
			return n;
		}
		function ht(e) {
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
		var q = [
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
		], gt = (1 << 26) / q[q.length - 1];
		function _t(e) {
			var t, n = this.abs();
			if (n.t == 1 && n[0] <= q[q.length - 1]) {
				for (t = 0; t < q.length; ++t) if (n[0] == q[t]) return !0;
				return !1;
			}
			if (n.isEven()) return !1;
			for (t = 1; t < q.length;) {
				for (var r = q[t], i = t + 1; i < q.length && r < gt;) r *= q[i++];
				for (r = n.modInt(r); t < i;) if (r % q[t++] == 0) return !1;
			}
			return n.millerRabin(e);
		}
		function vt(e) {
			var t = this.subtract(c.ONE), n = t.getLowestSetBit();
			if (n <= 0) return !1;
			var r = t.shiftRight(n);
			e = e + 1 >> 1, e > q.length && (e = q.length);
			for (var i = l(), a = 0; a < e; ++a) {
				i.fromInt(q[Math.floor(Math.random() * q.length)]);
				var o = i.modPow(r, this);
				if (o.compareTo(c.ONE) != 0 && o.compareTo(t) != 0) {
					for (var s = 1; s++ < n && o.compareTo(t) != 0;) if (o = o.modPowInt(2, this), o.compareTo(c.ONE) == 0) return !1;
					if (o.compareTo(t) != 0) return !1;
				}
			}
			return !0;
		}
		c.prototype.chunkSize = he, c.prototype.toRadix = _e, c.prototype.fromRadix = ve, c.prototype.fromNumber = ye, c.prototype.bitwiseTo = K, c.prototype.changeBit = ze, c.prototype.addTo = Ue, c.prototype.dMultiply = Ze, c.prototype.dAddOffset = Qe, c.prototype.multiplyLowerTo = it, c.prototype.multiplyUpperTo = at, c.prototype.modInt = mt, c.prototype.millerRabin = vt, c.prototype.clone = de, c.prototype.intValue = fe, c.prototype.byteValue = pe, c.prototype.shortValue = me, c.prototype.signum = ge, c.prototype.toByteArray = be, c.prototype.equals = xe, c.prototype.min = Se, c.prototype.max = G, c.prototype.and = we, c.prototype.or = Ee, c.prototype.xor = Oe, c.prototype.andNot = Ae, c.prototype.not = je, c.prototype.shiftLeft = Me, c.prototype.shiftRight = Ne, c.prototype.getLowestSetBit = Fe, c.prototype.bitCount = Le, c.prototype.testBit = Re, c.prototype.setBit = Be, c.prototype.clearBit = Ve, c.prototype.flipBit = He, c.prototype.add = We, c.prototype.subtract = Ge, c.prototype.multiply = Ke, c.prototype.divide = Je, c.prototype.remainder = Ye, c.prototype.divideAndRemainder = Xe, c.prototype.modPow = ft, c.prototype.modInverse = ht, c.prototype.pow = rt, c.prototype.gcd = pt, c.prototype.isProbablePrime = _t, c.prototype.square = qe;
		var J = c;
		if (J.prototype.IsNegative = function() {
			return this.compareTo(J.ZERO) == -1;
		}, J.op_Equality = function(e, t) {
			return e.compareTo(t) == 0;
		}, J.op_Inequality = function(e, t) {
			return e.compareTo(t) != 0;
		}, J.op_GreaterThan = function(e, t) {
			return e.compareTo(t) > 0;
		}, J.op_LessThan = function(e, t) {
			return e.compareTo(t) < 0;
		}, J.op_Addition = function(e, t) {
			return new J(e).add(new J(t));
		}, J.op_Subtraction = function(e, t) {
			return new J(e).subtract(new J(t));
		}, J.Int128Mul = function(e, t) {
			return new J(e).multiply(new J(t));
		}, J.op_Division = function(e, t) {
			return e.divide(t);
		}, J.prototype.ToDouble = function() {
			return parseFloat(this.toString());
		}, yt === void 0) var yt = function(e, t) {
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
		}, yt(e.PolyTree, e.PolyNode), e.Math_Abs_Int64 = e.Math_Abs_Int32 = e.Math_Abs_Double = function(e) {
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
			return r ? e.X == t.X && e.Y == t.Y || e.X == n.X && e.Y == n.Y || e.X > t.X == e.X < n.X && e.Y > t.Y == e.Y < n.Y && J.op_Equality(J.Int128Mul(e.X - t.X, n.Y - t.Y), J.Int128Mul(n.X - t.X, e.Y - t.Y)) : e.X == t.X && e.Y == t.Y || e.X == n.X && e.Y == n.Y || e.X > t.X == e.X < n.X && e.Y > t.Y == e.Y < n.Y && (e.X - t.X) * (n.Y - t.Y) == (n.X - t.X) * (e.Y - t.Y);
		}, e.ClipperBase.prototype.PointOnPolygon = function(e, t, n) {
			for (var r = t;;) {
				if (this.PointOnLineSegment(e, r.Pt, r.Next.Pt, n)) return !0;
				if (r = r.Next, r == t) break;
			}
			return !1;
		}, e.ClipperBase.prototype.SlopesEqual = e.ClipperBase.SlopesEqual = function() {
			var t = arguments, n = t.length, r, i, a, o, s, c, l;
			return n == 3 ? (r = t[0], i = t[1], l = t[2], l ? J.op_Equality(J.Int128Mul(r.Delta.Y, i.Delta.X), J.Int128Mul(r.Delta.X, i.Delta.Y)) : e.Cast_Int64(r.Delta.Y * i.Delta.X) == e.Cast_Int64(r.Delta.X * i.Delta.Y)) : n == 4 ? (a = t[0], o = t[1], s = t[2], l = t[3], l ? J.op_Equality(J.Int128Mul(a.Y - o.Y, o.X - s.X), J.Int128Mul(a.X - o.X, o.Y - s.Y)) : e.Cast_Int64((a.Y - o.Y) * (o.X - s.X)) - e.Cast_Int64((a.X - o.X) * (o.Y - s.Y)) === 0) : (a = t[0], o = t[1], s = t[2], c = t[3], l = t[4], l ? J.op_Equality(J.Int128Mul(a.Y - o.Y, s.X - c.X), J.Int128Mul(a.X - o.X, s.Y - c.Y)) : e.Cast_Int64((a.Y - o.Y) * (s.X - c.X)) - e.Cast_Int64((a.X - o.X) * (s.Y - c.Y)) === 0);
		}, e.ClipperBase.SlopesEqual3 = function(t, n, r) {
			return r ? J.op_Equality(J.Int128Mul(t.Delta.Y, n.Delta.X), J.Int128Mul(t.Delta.X, n.Delta.Y)) : e.Cast_Int64(t.Delta.Y * n.Delta.X) == e.Cast_Int64(t.Delta.X * n.Delta.Y);
		}, e.ClipperBase.SlopesEqual4 = function(t, n, r, i) {
			return i ? J.op_Equality(J.Int128Mul(t.Y - n.Y, n.X - r.X), J.Int128Mul(t.X - n.X, n.Y - r.Y)) : e.Cast_Int64((t.Y - n.Y) * (n.X - r.X)) - e.Cast_Int64((t.X - n.X) * (n.Y - r.Y)) === 0;
		}, e.ClipperBase.SlopesEqual5 = function(t, n, r, i, a) {
			return a ? J.op_Equality(J.Int128Mul(t.Y - n.Y, r.X - i.X), J.Int128Mul(t.X - n.X, r.Y - i.Y)) : e.Cast_Int64((t.Y - n.Y) * (r.X - i.X)) - e.Cast_Int64((t.X - n.X) * (r.Y - i.Y)) === 0;
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
		var bt = function(e) {
			return e < 0 ? Math.ceil(e - .5) : Math.round(e);
		}, xt = function(e) {
			return e < 0 ? Math.ceil(e - .5) : Math.floor(e + .5);
		}, St = function(e) {
			return e < 0 ? -Math.round(Math.abs(e)) : Math.round(e);
		}, Ct = function(e) {
			return e < 0 ? (e -= .5, e < -2147483648 ? Math.ceil(e) : e | 0) : (e += .5, e > 2147483647 ? Math.floor(e) : e | 0);
		};
		a.msie ? e.Clipper.Round = bt : a.chromium ? e.Clipper.Round = St : a.safari ? e.Clipper.Round = Ct : e.Clipper.Round = xt, e.Clipper.TopX = function(t, n) {
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
		}, yt(e.Clipper, e.ClipperBase), e.Clipper.NodeType = {
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
})), it = /* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	var n = rt(), r = 10 ** 5;
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
})))(), 1), at = 18, ot = Object.freeze({
	x: 0,
	y: 0,
	scalePercent: 100
});
function st(e) {
	if (typeof e != "number" || !Number.isFinite(e) || e <= 0) throw TypeError("Bubble tail length must be greater than zero.");
	return e;
}
function ct(e) {
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
var lt = Object.freeze([
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
]), ut = Object.freeze({
	height: 96,
	width: 176
}), dt = Object.freeze({
	height: 0,
	width: 0
});
function ft(...e) {
	return e.some((e) => e === "THINKING" || e === "DREAMING") ? ut : dt;
}
var pt = 2, mt = 400, ht = /* @__PURE__ */ new Map(), q = 128;
function gt(e, t, n) {
	switch (e) {
		case "NO_BUBBLE": return;
		case "THINKING":
		case "DREAMING": return Lt(t, n);
		case "YELLING": return Bt(t, n);
		case "WAVY": return Vt(t, n);
		case "ANNOUNCEMENT": return St(t, n, 13, 30);
		case "NORMAL":
		case "OFF_PANEL":
		case "WHISPERING":
		case "NARRATION": return St(t, n);
	}
}
function _t(e, t) {
	let n = !1;
	for (let r = 0, i = t.length - 1; r < t.length; i = r, r += 1) {
		let a = t[r], o = t[i];
		!a || !o || a.y > e.y != o.y > e.y && e.x < (o.x - a.x) * (e.y - a.y) / (o.y - a.y) + a.x && (n = !n);
	}
	return n;
}
function vt(e, t, n, r, i) {
	let a = r / 2 + 6, o = i / 2 + 6, s = t / 2 - a, c = t / 2 + a, l = n / 2 - o, u = n / 2 + o, d = (t, n) => +!_t({
		x: t,
		y: n
	}, e), f = 0, p = Math.max(1, Math.ceil((c - s) / 4)), m = Math.max(1, Math.ceil((u - l) / 4));
	for (let e = 0; e <= p; e += 1) {
		let t = s + (c - s) * e / p;
		f += d(t, l) + d(t, u);
	}
	for (let e = 1; e < m; e += 1) {
		let t = l + (u - l) * e / m;
		f += d(s, t) + d(c, t);
	}
	for (let t of e) t.x > s && t.x < c && t.y > l && t.y < u && (f += 1);
	return f;
}
function J(e) {
	let t = Math.max(0, e.contentWidth), n = Math.max(0, e.contentHeight);
	if (!Number.isFinite(t) || !Number.isFinite(n)) throw TypeError("Bubble content size must be finite.");
	let r = [...new Set(e.styles)], i = `${r.join(",")}:${t}:${n}`, a = ht.get(i);
	if (a) return a;
	let o = (e, i) => r.reduce((r, a) => {
		let o = gt(a, e, i);
		return o ? r + vt(o, e, i, t, n) : r;
	}, 0), s = ft(...r), c = Math.max(t + 48, s.width), l = Math.max(n + 48, s.height);
	for (let e = 0; e < mt && o(c, l) > 0; e += 1) {
		let e = o(c + pt, l), t = o(c, l + pt);
		e <= t && (c += pt), t <= e && (l += pt);
	}
	let u = Object.freeze({
		height: l,
		width: c
	});
	if (ht.size >= q) {
		let e = ht.keys().next().value;
		e !== void 0 && ht.delete(e);
	}
	return ht.set(i, u), u;
}
function yt(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function bt(e, t) {
	let n = e ?? t;
	if (!Number.isFinite(n) || n <= 0) throw TypeError("Bubble SVG dimensions must be positive and finite.");
	return n;
}
function xt(e) {
	if (e === null) return null;
	let t = e ?? 180;
	if (!Number.isFinite(t)) throw TypeError("tailDirection must be finite.");
	return (t % 360 + 360) % 360;
}
function St(e, t, n = 18, r = 24) {
	let i = r, a = r, o = e - r, s = t - r;
	return [
		{
			centerX: o - n,
			centerY: a + n,
			start: -90
		},
		{
			centerX: o - n,
			centerY: s - n,
			start: 0
		},
		{
			centerX: i + n,
			centerY: s - n,
			start: 90
		},
		{
			centerX: i + n,
			centerY: a + n,
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
function Ct(e, t) {
	return e.x * t.y - e.y * t.x;
}
function wt(e, t) {
	return {
		x: e.x - t.x,
		y: e.y - t.y
	};
}
function Tt(e, t) {
	return Math.hypot(e.x - t.x, e.y - t.y);
}
function Et(e, t, n, r) {
	let i = t, a = r;
	for (; a > 0;) {
		let t = (i + n + e.length) % e.length, r = e[i], o = e[t];
		if (!r || !o) throw Error("Bubble border path is invalid.");
		let s = Tt(r, o);
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
function Dt(e, t, n, r, i) {
	let a;
	for (let r = 0; r < e.length; r += 1) {
		let i = e[r], o = e[(r + 1) % e.length];
		if (!i || !o) continue;
		let s = wt(o, i), c = Ct(n, s);
		if (Math.abs(c) < 1e-9) continue;
		let l = wt(i, t), u = Ct(l, s) / c, d = Ct(l, n) / c;
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
		base: [Et(o, s, -1, 9), Et(o, s, 1, 9)],
		tip: {
			x: i?.x ?? t.x + n.x * (a.rayScale + r),
			y: i?.y ?? t.y + n.y * (a.rayScale + r)
		}
	};
}
function Ot(e) {
	let t = e * Math.PI / 180;
	return {
		x: Math.sin(t),
		y: -Math.cos(t)
	};
}
function kt(e, t, n, r) {
	let i = wt(n, t), a = Math.hypot(i.x, i.y);
	if (a < 1e-9) return;
	let o = Dt(e, t, {
		x: i.x / a,
		y: i.y / a
	}, 0);
	if (a <= Tt(t, o.borderPoint)) return;
	let s = {
		x: (o.base[0].x + o.base[1].x) / 2,
		y: (o.base[0].y + o.base[1].y) / 2
	}, c = wt(n, s), l = Math.hypot(c.x, c.y), u = Math.min(r / l, 1);
	return {
		...o,
		tip: {
			x: s.x + c.x * u,
			y: s.y + c.y * u
		}
	};
}
function At(e, t, n, r) {
	return {
		x: n.x + (e.x - t.x) * r,
		y: n.y + (e.y - t.y) * r
	};
}
function jt(e, t, n, r, i, a) {
	let o = {
		x: t / 2,
		y: n / 2
	}, s = Ot(r), c = Dt(e, o, s, i), l = Tt(o, c.borderPoint), u = a.scalePercent / 100, d = {
		x: o.x - s.x * l * (u - 1) + a.x,
		y: o.y - s.y * l * (u - 1) - a.y
	};
	return {
		body: e.map((e) => At(e, o, d, u)),
		bodyCenter: d,
		tip: c.tip
	};
}
function Mt(e) {
	let t = e[0];
	if (!t) throw Error("Bubble polygon is empty.");
	return `M ${t.x.toFixed(4)} ${t.y.toFixed(4)} ${e.slice(1).map(({ x: e, y: t }) => `L ${e.toFixed(4)} ${t.toFixed(4)}`).join(" ")} Z`;
}
function Nt(e) {
	return Math.abs(e.reduce((t, n, r) => {
		let i = e[(r + 1) % e.length];
		return i ? t + n.x * i.y - i.x * n.y : t;
	}, 0) / 2);
}
function Pt(e, t, n, r = "") {
	return `<path d="${Mt(e)}" fill="${t}" stroke="${n}" stroke-width="3" stroke-linejoin="round" ${r}/>`;
}
function Ft(e, t, n, r, i, a = "", o, s = at) {
	let c = wt(n, t), l = Math.hypot(c.x, c.y);
	if (o === void 0 && !(l > 0)) throw TypeError("Bubble body center and tail tip must differ.");
	let u = o === void 0 ? Dt(e, t, {
		x: c.x / l,
		y: c.y / l
	}, 0, n) : kt(e, t, o, s);
	if (u === void 0) return Pt(e, r, i, a);
	let d = (e) => e.map(({ x: e, y: t }) => [e, t]), f = it.default.union([d(e)], [[d([
		u.base[0],
		u.tip,
		u.base[1]
	])]]);
	if (!f || f.length === 0) throw Error("JSClipper failed to union Bubble body and tail.");
	let p = f.map((e) => e.map(([e, t]) => ({
		x: e,
		y: t
	}))).sort((e, t) => Nt(t) - Nt(e))[0];
	if (!p) throw Error("JSClipper returned an empty Bubble outline.");
	return `<path d="${Mt(p)}" fill="${r}" stroke="${i}" stroke-width="3" stroke-linejoin="round" data-boolean-operation="union" data-tail-base-on-border="true" ${a}/>`;
}
var It = Object.freeze([
	1,
	.78,
	1.14,
	.88,
	1.06,
	.8,
	1.2,
	.92
]);
function Lt(e, t) {
	let n = e - 48, r = t - 48, i = e / 2, a = t / 2, o = Math.min(40, Math.max(22, 20 + Math.min(n, r) * .12 + Math.max(n, r) * .03)), s = o * .34, c = Math.max(1, n / 2 - s), l = Math.max(1, r / 2 - s), u = (e) => {
		let t = Math.cos(e), n = Math.sin(e);
		return {
			x: i + c * Math.sign(t) * Math.abs(t) ** (2 / 3),
			y: a + l * Math.sign(n) * Math.abs(n) ** (2 / 3)
		};
	}, d = [0], f = u(-Math.PI / 2);
	for (let e = 1; e <= 720; e += 1) {
		let t = u(-Math.PI / 2 + e * Math.PI * 2 / 720);
		d.push((d[e - 1] ?? 0) + Math.hypot(t.x - f.x, t.y - f.y)), f = t;
	}
	let p = d[720] ?? 0, m = It.reduce((e, t) => e + t, 0), h = Math.max(8, Math.round(p / (o * m) * It.length)), g = Array.from({ length: h }, (e, t) => It[t % It.length] ?? 1), _ = g.reduce((e, t) => e + t, 0), v = (e) => {
		let t = 0, n = 720;
		for (; n - t > 1;) {
			let r = t + n >> 1;
			(d[r] ?? 0) <= e ? t = r : n = r;
		}
		let r = d[t] ?? 0, i = d[n] ?? r, a = i > r ? (e - r) / (i - r) : 0;
		return u(-Math.PI / 2 + (t + a) * Math.PI * 2 / 720);
	}, y = 0;
	return g.map((e) => {
		let t = v(y / _ * p);
		return y += e, t;
	});
}
function Rt(e, t, n, r) {
	let i = (e) => e.toFixed(4), a = Lt(e, t), o = a[0];
	if (!o) throw Error("Cloud Bubble path is invalid.");
	let s = a.map((e, t) => {
		let n = a[t] ?? o, r = a[(t + 1) % a.length] ?? o, s = Math.hypot(r.x - n.x, r.y - n.y) * .56;
		return `A ${i(s)} ${i(s)} 0 0 1 ${i(r.x)} ${i(r.y)}`;
	});
	return `<path d="M ${i(o.x)} ${i(o.y)} ${s.join(" ")} Z" fill="${n}" stroke="${r}" stroke-width="3" stroke-linejoin="round"/>`;
}
function zt(e, t, n, r, i, a, o, s = at) {
	let c = wt(n, t), l = Math.hypot(c.x, c.y), u = o === void 0 ? Dt(e, t, {
		x: c.x / l,
		y: c.y / l
	}, 0, n) : kt(e, t, o, s);
	if (u === void 0) return "";
	let d = {
		x: (u.base[0].x + u.base[1].x) / 2,
		y: (u.base[0].y + u.base[1].y) / 2
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
	}]).map(({ ratio: e, radius: t }) => `<circle cx="${d.x + (u.tip.x - d.x) * e}" cy="${d.y + (u.tip.y - d.y) * e}" r="${t}" fill="${r}" stroke="${i}" stroke-width="2"/>`).join("");
}
function Bt(e, t) {
	let n = e / 2, r = t / 2;
	return Array.from({ length: 28 }, (i, a) => {
		let o = a * Math.PI * 2 / 28 - Math.PI / 2, s = a % 2 == 0, c = s ? e / 2 - 6 : e / 2 - 22, l = s ? t / 2 - 6 : t / 2 - 22;
		return {
			x: n + Math.cos(o) * c,
			y: r + Math.sin(o) * l
		};
	});
}
function Vt(e, t) {
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
function Ht(e, t, n) {
	return e === "YELLING" ? Bt(t, n) : e === "WAVY" ? Vt(t, n) : St(t, n);
}
function Ut(e) {
	let t = ft(e.style), n = Math.max(bt(e.width, 220), t.width), r = Math.max(bt(e.height, 112), t.height), i = xt(e.tailDirection);
	if (i === null) throw TypeError("Bubble body center offset requires a tail direction.");
	let a = st(e.tailLength ?? at), o = ct(e.offset), s = {
		x: n / 2,
		y: r / 2
	}, c = jt(Ht(e.style, n, r), n, r, i, a, o);
	return Object.freeze({
		x: c.bodyCenter.x - s.x,
		y: c.bodyCenter.y - s.y
	});
}
function Wt(e, t, n, r, i, a, o, s, c) {
	let l = St(t, n), u = (e) => r === null ? e : jt(e, t, n, r, o, s).body, d = (e, l = "") => {
		if (r === null) return Pt(e, i, a, l);
		let u = jt(e, t, n, r, o, s);
		return Ft(u.body, u.bodyCenter, u.tip, i, a, l, c, o);
	};
	switch (e) {
		case "NO_BUBBLE": return "";
		case "THINKING":
		case "DREAMING": {
			if (r === null) return Rt(t, n, i, a);
			let u = jt(l, t, n, r, o, s), d = s.scalePercent / 100, f = {
				x: t / 2,
				y: n / 2
			}, p = u.bodyCenter.x - f.x * d, m = u.bodyCenter.y - f.y * d;
			return `${zt(u.body, u.bodyCenter, u.tip, i, a, e === "DREAMING", c, o)}<g transform="translate(${p} ${m}) scale(${d})">${Rt(t, n, i, a)}</g>`;
		}
		case "YELLING": return d(Bt(t, n));
		case "WAVY": return d(Vt(t, n));
		case "WHISPERING": return d(l, "stroke-dasharray=\"5 5\"");
		case "ANNOUNCEMENT": {
			let e = St(t, n, 13, 30), i = r === null ? e : (() => {
				let { bodyCenter: i } = jt(l, t, n, r, o, s), a = {
					x: t / 2,
					y: n / 2
				}, c = s.scalePercent / 100;
				return e.map((e) => At(e, a, i, c));
			})();
			return `${d(l)}<path d="${Mt(i)}" fill="none" stroke="${a}" stroke-width="1.5" stroke-linejoin="round" data-bubble-inner-frame="true"/>`;
		}
		case "NARRATION": return Pt(u(l), i, a);
		case "OFF_PANEL": return d(l);
		case "NORMAL": return d(l);
	}
}
function Gt(e) {
	if (!lt.includes(e.style)) throw TypeError(`Unsupported Bubble visual style: ${String(e.style)}`);
	if (!Array.isArray(e.lines) || e.lines.some((e) => typeof e != "string")) throw TypeError("lines must be an array of strings.");
	let t = bt(e.width, 220), n = bt(e.height, 112), r = bt(e.fontSize, 15), i = xt(e.tailDirection), a = e.tailTarget;
	if (a !== void 0 && (!Number.isFinite(a.x) || !Number.isFinite(a.y))) throw TypeError("tailTarget coordinates must be finite.");
	let o = st(e.tailLength ?? at), s = e.offset === void 0 ? ot : ct(e.offset), c = e.shapeTransition;
	if (c !== void 0 && (!lt.includes(c.from) || !lt.includes(c.to) || !Number.isFinite(c.progress) || c.progress < 0 || c.progress > 1)) throw TypeError("Bubble shape transition is invalid.");
	let l = ft(e.style, ...c === void 0 ? [] : [c.from, c.to]), u = Math.max(t, l.width), d = Math.max(n, l.height), f = e.fillColor ?? "#fff4cc", p = e.borderColor ?? "#6f5b45", m = e.textColor ?? "#25283a", h = e.fontFamily ?? "Noto Sans JP, sans-serif", g = r * 1.35, _ = d / 2 - (e.lines.length - 1) * g / 2 + r * .35, v = i === null ? 1 : s.scalePercent / 100, y = i === null ? {
		x: u / 2,
		y: d / 2
	} : jt(St(u, d), u, d, i, o, s).bodyCenter, b = e.lines.map((e, t) => `<text x="${y.x}" y="${y.y + (_ + t * g - d / 2) * v}" text-anchor="middle" fill="${yt(m)}" font-family="${yt(h)}" font-size="${r * v}">${yt(e)}</text>`).join(""), x = c === void 0 ? Wt(e.style, u, d, i, f, p, o, s, a) : `<g opacity="${(1 - c.progress).toFixed(4)}">${Wt(c.from, u, d, i, f, p, o, s, a)}</g><g opacity="${c.progress.toFixed(4)}">${Wt(c.to, u, d, i, f, p, o, s, a)}</g>`, S = yt(e.title ?? `${e.style} bubble`), C = c === void 0 ? "" : ` data-bubble-shape-transition-from="${c.from}" data-bubble-shape-transition-to="${c.to}" data-bubble-shape-transition-progress="${c.progress.toFixed(4)}"`;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${u}" height="${d}" viewBox="0 0 ${u} ${d}" role="img" data-bubble-renderer="canonical" data-bubble-style="${e.style}" data-bubble-body-width="${u}" data-bubble-body-height="${d}"${C}><title>${S}</title>${x}${b}</svg>`;
}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/constants.js
var Kt = 2048, qt = 2112, Jt = Uint8Array, Yt = Uint16Array, Xt = Int32Array, Zt = new Jt([
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
]), Qt = new Jt([
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
]), $t = new Jt([
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
]), en = function(e, t) {
	for (var n = new Yt(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new Xt(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, tn = en(Zt, 2), nn = tn.b, rn = tn.r;
nn[28] = 258, rn[258] = 28;
var an = en(Qt, 0), on = an.b;
an.r;
for (var sn = new Yt(32768), Y = 0; Y < 32768; ++Y) {
	var cn = (Y & 43690) >> 1 | (Y & 21845) << 1;
	cn = (cn & 52428) >> 2 | (cn & 13107) << 2, cn = (cn & 61680) >> 4 | (cn & 3855) << 4, sn[Y] = ((cn & 65280) >> 8 | (cn & 255) << 8) >> 1;
}
for (var ln = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new Yt(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new Yt(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new Yt(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[sn[d] >> c] = l;
	} else for (s = new Yt(r), i = 0; i < r; ++i) e[i] && (s[i] = sn[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), un = new Jt(288), Y = 0; Y < 144; ++Y) un[Y] = 8;
for (var Y = 144; Y < 256; ++Y) un[Y] = 9;
for (var Y = 256; Y < 280; ++Y) un[Y] = 7;
for (var Y = 280; Y < 288; ++Y) un[Y] = 8;
for (var dn = new Jt(32), Y = 0; Y < 32; ++Y) dn[Y] = 5;
var fn = /*#__PURE__*/ ln(un, 9, 1), pn = /*#__PURE__*/ ln(dn, 5, 1), mn = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, hn = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, gn = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, _n = function(e) {
	return (e + 7) / 8 | 0;
}, vn = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new Jt(e.subarray(t, n));
}, yn = [
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
], bn = function(e, t, n) {
	var r = Error(t || yn[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, bn), !n) throw r;
	return r;
}, xn = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new Jt(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new Jt(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new Jt(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = hn(e, d, 1);
			var v = hn(e, d + 1, 3);
			if (d += 3, !v) {
				var y = _n(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && bn(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = fn, m = pn, h = 9, g = 5;
			else if (v == 2) {
				var S = hn(e, d, 31) + 257, C = hn(e, d + 10, 15) + 4, w = S + hn(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new Jt(w), E = new Jt(19), D = 0; D < C; ++D) E[$t[D]] = hn(e, d + D * 3, 7);
				d += C * 3;
				for (var O = mn(E), k = (1 << O) - 1, A = ln(E, O, 1), D = 0; D < w;) {
					var j = A[hn(e, d, k)];
					d += j & 15;
					var y = j >> 4;
					if (y < 16) T[D++] = y;
					else {
						var M = 0, N = 0;
						for (y == 16 ? (N = 3 + hn(e, d, 3), d += 2, M = T[D - 1]) : y == 17 ? (N = 3 + hn(e, d, 7), d += 3) : y == 18 && (N = 11 + hn(e, d, 127), d += 7); N--;) T[D++] = M;
					}
				}
				var P = T.subarray(0, S), F = T.subarray(S);
				h = mn(P), g = mn(F), p = ln(P, h, 1), m = ln(F, g, 1);
			} else bn(1);
			if (d > _) {
				c && bn(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var I = (1 << h) - 1, L = (1 << g) - 1, R = d;; R = d) {
			var M = p[gn(e, d) & I], z = M >> 4;
			if (d += M & 15, d > _) {
				c && bn(0);
				break;
			}
			if (M || bn(2), z < 256) n[f++] = z;
			else if (z == 256) {
				R = d, p = null;
				break;
			} else {
				var B = z - 254;
				if (z > 264) {
					var D = z - 257, V = Zt[D];
					B = hn(e, d, (1 << V) - 1) + nn[D], d += V;
				}
				var ee = m[gn(e, d) & L], H = ee >> 4;
				ee || bn(3), d += ee & 15;
				var F = on[H];
				if (H > 3) {
					var V = Qt[H];
					F += gn(e, d) & (1 << V) - 1, d += V;
				}
				if (d > _) {
					c && bn(0);
					break;
				}
				s && l(f + 131072);
				var U = f + B;
				if (f < F) {
					var te = a - F, ne = Math.min(F, U);
					for (te + f < 0 && bn(3); f < ne; ++f) n[f] = r[te + f];
				}
				for (; f < U; ++f) n[f] = n[f - F];
			}
		}
		t.l = p, t.p = R, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? vn(n, 0, f) : n.subarray(0, f);
}, Sn = /*#__PURE__*/ new Jt(0), Cn = function(e) {
	(e[0] != 31 || e[1] != 139 || e[2] != 8) && bn(6, "invalid gzip data");
	var t = e[3], n = 10;
	t & 4 && (n += (e[10] | e[11] << 8) + 2);
	for (var r = (t >> 3 & 1) + (t >> 4 & 1); r > 0; r -= !e[n++]);
	return n + (t & 2);
}, wn = function(e) {
	var t = e.length;
	return (e[t - 4] | e[t - 3] << 8 | e[t - 2] << 16 | e[t - 1] << 24) >>> 0;
};
function Tn(e, t) {
	var n = Cn(e);
	return n + 8 > e.length && bn(6, "invalid gzip data"), xn(e.subarray(n, -8), { i: 2 }, t && t.out || new Jt(wn(e)), t && t.dictionary);
}
var En = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	En.decode(Sn, { stream: !0 });
} catch {}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/swap.js
var Dn = new Uint8Array(new Uint32Array([305419896]).buffer)[0] === 18;
function On(e) {
	let t = e.length;
	for (let n = 0; n < t; n += 4) [e[n], e[n + 1], e[n + 2], e[n + 3]] = [
		e[n + 3],
		e[n + 2],
		e[n + 1],
		e[n]
	];
}
function kn(e) {}
var An = Dn ? On : kn, jn = new TextDecoder(), Mn = class e {
	constructor(e) {
		if (e instanceof Uint8Array) {
			let t = 0, n = new DataView(e.buffer);
			if (this.highStart = n.getUint32(0, !0), this.errorValue = n.getUint32(4, !0), t = n.getUint32(8, !0), t !== 4294967295) throw Error("Trie created with old version of @cto.af/unicode-trie.");
			if (t = n.getUint32(12, !0), 16 + t > e.byteLength) throw RangeError("Invalid input length");
			let r = e.subarray(16 + t);
			this.values = r.length ? JSON.parse(jn.decode(Tn(r))) : [], e = Tn(e.subarray(16, 16 + t)), An(e), this.data = new Int32Array(e.buffer);
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
			let n = (this.data[Kt + (e - 55296 >> 5)] << 2) + (e & 31);
			t = this.data[n];
		} else if (e < this.highStart) {
			let n = this.data[qt - 32 + (e >> 11)];
			n = this.data[n + (e >> 5 & 63)], n = (n << 2) + (e & 31), t = this.data[n];
		} else t = this.data[this.data.length - 4];
		return t;
	}
	getString(e) {
		let t = this.get(e);
		return this.values[t] ?? t;
	}
}, Nn = Mn.fromBase64("AAgOAAEAAAD/////nRQAAB+LCAC4xcFoAgPtnQnwlkUdx1+URLxABcUUghTEEK8Cmwp0LJAa\n   MRrFbBSPSXHSAUYNdFQoBWMKyQrUCo/EyMIjD3TIAxXJM5NBHBm0RDSPzDOVdAz7/nB/07bt\n   s8/e+/zhfef9zD7HPs/e129/u8/yzVutVWANeBl079xq9QJ9wUCwDxjqYQ4DI8BoMBYcBY4D\n   48FEw3NTwDTp/BxwAZgJLgaXgCvAAnADuA3cDe4Hj0rPLQerwLPgJfAaeBe8Az4EnT/Ram0D\n   eoBdwe5gENgX0DsOhHkQGAlGgTHgaHACGA8mgilgGpgBLgJzweVgPlgIbgF3iPOl4BGwAqwG\n   a8Er4C2wDnwEumzRanUDPUFv0B8MBgeAL4BDwNfAN8C3wIngO+A0cCZowd/nwrwA/Eic/wzm\n   L8EMHM+HuRDcDP4g7t8Hk3hYmI8BCv+TwvwLTOZvglfBawKyQ7wrjv8Ns1OXVqsroPNuwuwJ\n   szfoL86JwTgeIp3HYJj0vhE4Hg3GgnHgZMDhnYDjyWCqZP9CHM8Gc8S1y2BeBa4FvweLxPN3\n   wVwq7Dwirp0KVuB4NVgLXgSvg/fA+6C1Jf6gO+gF+oI9wQa3YQ4FwwDlwREwR4Mj+L6GY3Dv\n   eMN9OY7JPAV2Jwn7Z8E8F0wHs8AcMA9cA64Dt4I7wT3gQfA4eAI8DdaKd7wizLdgvg86dUWa\n   g+1BL0D3+sIcAAaLc5X9xfUDYR4EDlUYJR2PAUeCY8FJ4DRwJjgXTAezwBwwD1wDrgO3gjuF\n   G/fAfBA8Js5XwnwaPF/htypeFfbfhvm+w7OdtkL6Axe3thP2uSzuhPM+YICA6tZ9YA4FwwGV\n   55F0XTBGOlY5GhwHxoOJYAqYBn4AfiyOLwVXgvnSc9dKxzeC28XxEoNbbdq0iQvXEe24aNOm\n   TZs2bdq0aePC0ob55yFhPg5IHlI3Rl4Je8+I/vALMN+T7v3DMN5+B/c+BJ23hhwQ0LUeMM+G\n   OQrshuM9AMkJ94b5WfBF8GVwKPg6+CYgOc7xME8BLFsiJuH8LPA9MFO8/yJhMnNxfjm4AlwJ\n   rgK/AleD+e177Xvte+177XvR7/0O3ARuBSQzLcmd8ENJSoe/TZsmE9qfvR9l7FHwhNL3c+Ep\n   zbPP4trz4FXwT/AB2Gyb/7WzJc67g16gLxgIBgOasxkCcxgoXf/c2+1jDu7ean0fLDbwDvjc\n   9pi7Aj8H8r1V4vxlmLvtgLlCMBesBNvs+PG9g2GeBxaB5aB7j1brOczh9UN8nAiuBs8BGg8c\n   BqgP/xOqI2n+VvAQzile53T6L6NwLts5G+eLwSpxfT3M4dtiTg0sAevB8O1wDuT35GZJA9yX\n   461NmzZtNiXWow6cTrpKaCNGU3uhtPNjcW0cOEFq28fjeAI4HUwWz8iQbIvsrYM5VTw3HSbp\n   Fs2EebG4dpnGPYL0hM4n3SfcXyDsLhTmzTBvA3eI86VKn6MK0lshfao/kt9x/pjk7ydFW7lG\n   vIt0rl4W99+EuQ58BEh3jP3bBW1oVxHObjjeCfQB7B7bG8DXYJ5OelYwvwS+Ath9fuY0KT4O\n   E88dKcxjYJIs8NswT5WeVSG/k/0zYOcccL54nuLvh+QHmD8V5jJA8fILnP8Lz10N87eAdMRu\n   grlY9Bfo/AGYfwYrxPl9eOdqHK8l/+D47zDfFv76AOZmyFeTcLwVzB1AL9AXDAT7gSFgGBgB\n   yH87ks4ZjseK86+CcdQ+a8JI90/GvQniPtufjPOp4vkLYc4Gc8Hl4NfgesP7Fin3OE3uwvVl\n   4BGwQrKzGsd/BS+C18Hb4APhdif0J7sC1unbHsf83C7SMd3vh/O9yC4YCoaBQ8Aoyd4YHB8J\n   jgUngVMBlQ8qG2dI9nScg/sXgJngYsnupTi+EvxG+DMnXI7UuCZuNPjn9pqwboxQOeXwc50Q\n   gyUinh8wxPfDFfeW4/qqAvmmaVDb6PvsGiX+XvLM2/1Qb76xEZeLGOlEdTC1i+tEnNMx1Z8f\n   ivPOGJtvDXYEJNfw9eeueL4uHLvDziBA/Rb5+gG4Rvq0n5feQTKJXHp8rlBfaiT8R7KcKnnV\n   4Yb42BQ4wjL9joG9E8Apjul9uBL3TS+/kxC+74LzGpAvTHl7BvznUyYuwnM05iGoLM/F+Tzl\n   XdyHqStbZM4S5/PxjoXgJvEuWqvAdkmuKIeL6hV5TET9e6r/qsJPazHIvBfveQgsF248BXMF\n   1YcOcXGERXv4AslIPeNXhuL3TVFnroO5HmwB2WtT8j21Mdsa/NMT93qDDevFkJ79Fbsb1s7g\n   2hDLMFE/cZh434iAeKD3jDY8T/fHGu5TuMfVuH+y8KeOCeJZPp+cIU1JD4fcmiq5NVvIIaqe\n   oXJyIezPBpeAK8AC8Xxvi/5YXd1+A951C6C1R4uFeTdMurdMmC78Cc+sBM+ANdLzNF/xBlgH\n   PpKud8G8xXagB9gZ9AF0fQ+Yg8QxcQCOh4rz4TBHimM5TQ/HNT5egHDQfdZFOkrcI/nEcTge\n   Dyh+JsKcIt41TZgzYM5S3j9H8gsxD+dXSe4x10rXrleeyc2iwu6XhsJ/F8WBqMeJ/ysfBpaJ\n   PNKReXzzThvYDKd1YFn0hscg/tsALZ21ec4GsTS0hWLZou4kDX9oaELHdI1EeiT24ntUtVGX\n   g0yq7igpbCD7BL2HIXfl89RQWCgMHJ7ckPuUlpj63XBO8Y9pyE2aTf2nK5NQC4hWvuvoKfIl\n   lXkqGwzlz50EfMx1BOVhztP8HNvdWXlWhp6Xz8ndlOWN/V6K0u43Dc4fch7gc9s4U/OU/Azn\n   vZLkKrdNheqTKnzeVxff/FOvc19D/dW9SzZjkuKdMfPmxlrn5Ix3mzzWBKhs9NL4l9rxqj5J\n   06HwcD6W8zQf01iDzLrfLhmpc1vNVza/qvGXnP7UZ2PUcZlLnHOcksk0KZ+nyGe2412KW13c\n   p65rOQ3qwmCyo8afzi7bsY2PmPV4yfYqZl7qKO1F6nhyreNs6rvY+S9XnOjaai7TssxAHqfn\n   8GuV/9XrVfZi5PVcZaXK367u636hfuP8bCtL8u3np+6vURhK9BObUPZjxm+scZ0810DkrFfV\n   8uY6zgotWy5ygSq35DJYlyZqedWVX5s2UTeeqQqT6pZr+vJ4QRc/fF1uj6rCZYprU1hypG/d\n   sRznpnS1Sd+6dKzLa3X5wzZ9dfWEa5/Mtfzq0qRE+vqWX10eqErfkL6tOubxLb8s1zG54RLO\n   nPWzb/3pkl9z1J8ufcQqP9fl9ao6w9Re6cKsS7u6a3Xto2s81NWvpjxqW/5s5IEpxpncTtr2\n   4XPWpbHGWa79Idv0NMWZKR5i1aemn+38oxwum2dKpm+M9jJm+pr6RrHSV9eH9dXnyN0XijEO\n   i5GedX16VzluqvZXHr9UpY1P/9a1zSs176m2kbb+NY13qvKLjYwqtP1V/eLT//5kQ1B/1G8I\n   eZ/LfA3LgUzxw8dVcZYiLuvcjB33IX7wybe6NKM+gox8jfRq+JjSi87l+ViGrut0buvaqdhy\n   QPKj3MawSbqApBfLZoi81kcuXqV3XXc9VHbeBH0L+nF5N7W/Nm2NnBer+rasD9bEute1flTD\n   lst9Ux1vK8PWjZFD+x27Fma3wvQujG/fMFQ/0iX/hD7f9PClnr9OHX8+Mh65PTS1Iyn9UULX\n   M/b8vq9uKf9ID7KkjkvOtOe+om/8cxvu6meXubpY+jcuc0Wx3TeNBVOH33e+LKQ+rZM55pQd\n   cNz3kc4578rygFhy7Fj1H4872f88FpD1hNV1Iy76tbnr35Dyn1v3yCT3KhEnJdpnG1mui46u\n   ryzBNNaiH5eH0HFfbPlWqvouVX0ZKjdW65S68XQqfWC1nJSUO8eoj0OfjxGGUjI1V/erZGIh\n   P507n8qIa7z1tXinLK/sZwnb/7TS7+drNtj43+Y9sttN00121aMOnR+wTb/UuIZ/d4FrfydV\n   PSOXCRmf+jfl/E9KuUMpuVPMfnKMdQIucze69X6m8YPvngAl9yOwqWNt5Wsu+hSp9xRoytr0\n   UN3tunhPHQ91brDsoqqOZSivyed7iDzXX8p/JJ8le2QSA4C8lwntkcP7bvGxfC7bJfaUIDd5\n   j7CqsiCv/dYh+4HcIbkTYdpLgOWwbNdk31R/k/tqnKpy2oGB43o1H9js0cPhk/ebUfegsZVT\n   h8pW5D2aVNQ9nFzQPStf4+MQN4jYfZ4Q+TDndzUNTfqAVfs7uazFtc03KfaP0u3LZYvP877u\n   ++6zpf5SuOfiJ9+w6PylXtPdZ1Pdx80UZ1VxoYahLl/Y7tflUxbqwhyr7OjioCpuTOexymmM\n   99vGWe5960LdoT5PrDlkNn39yrIdFzdTxKkqa0o9n5NyfjbFL6T9i03O9jTEjVT9CZt61qWe\n   DAmTbX1rkw4ubWysflyu/Uh19Utdv8QUb/wevs/vlN3YK0J95hvGWP26FP0CXV0ix6XOfmi8\n   lNw7tlSc284PqXnZlKf5umpfVx7Ue3K5q4onnT9079H5h8ubyX5VGZHfIVOiPynLz2RkPSTV\n   /2p/0NZM2Ufw7dPm3tveJp46kn5prDC7miXDUCoOc7QdKeU9KeZZbNZTsw6ZKjPna6G6jLZ6\n   v6Y9S0rqHMbaN8j3flUbVIdpnonTleaP+JsiapunntfVOer7WUdXNw+jCyvNYxE6P9Ix+7Mu\n   TCa3uM3mb9JUmfLe1q59N19yulXnD5dfU/yRyn/8vR2Cr9H8JB/btsm29undfCw/56tbVmVX\n   d53nXtV0+Iw4rjNTk8udOvdtwl13j1B1YuT5b04HMpsW/7HCr8t/dF0Of846J3W9HPtdNnUf\n   x7UvpdsiV1mJjawiFLWODEm73G1mLF1J2/GB7X7UtvqhJeeTfPc4T7mPtLpuWqWJ66malIZV\n   Oq6uerCp9Oh1dlzCzrpIudKf92/hsZbP+hIbHa0Q/fQYe/v4lmd5T5s6veq6vYViyzJT69KV\n   2t/FlN451zKFrm3i9U0264J0fQOX9U5Vfe6S+xPRL8VaHJe8rK69qpNJqe92jX81XX3X2fr8\n   XPaHsq1PdPWWa12Sag1GaXmwT98pZ/2vy8+h7e8gsHdGcrvn+ou5l5j6K7GfmPobXJiY4xLb\n   d9C3GKnM2H7Xkd7j+z1I03X5ftWxjd9KwDLy0mNPV/fUtSCh4wyeF5DXS8nzWnSd9Jqrfrye\n   UWfa3NP1O131E9TnTDItvs/rn9Qwm9y3lS/yuiSdDK2J32LmH61l4/l7DpMcFl0cy/HpKvNU\n   5Z6yuzmgsPj4PZX78jydfMzx1BFk7Gr61smlU9yXf7w+UL7Pa5Fc9pe3lTntI+YJYvTvQ9Y9\n   x9gbNOU66lxyYJPsuqPtBRpjvW7uX6n9Y3LpfMUe8+fYy6sJ+99x2QyVR1TJrEvlz9Lxmzq8\n   Kct+jO8mpnIrV35pYv3rso+6j2w1RzkxpWeOslpV38Xey7lJ7XVVnDdFVyDn2o2m7A1s871r\n   U3+hbp661LfjbL6l6vL9O5v5uiqdcd/9mG3sVrlrktHl3m+5Ln46Qply/f51rDq2afV3U92P\n   9Z2CVPu71+kExf4uhm265Mpfcrjl9S+p/WGjb9FEeYmrHlhsXTLb772b2v3U8bKvoAk6VaQ3\n   ZdqvWf2FytNd9g1W/c57VNf9+JuMuXT+ZJ1tnZ6T7U+un1PXpSm/BxKiZ+b6nUC5P+bybdoU\n   3wWR9zP1WcOrrtc06dG7rA9gf6lzCCVlQKl1cKvW16r7MjdxPqHue3m55l5M6yRy1q8p6i+d\n   GzbfR5Dtqeeu1D2rulVlp+67ulXfzlDPqS/AP52us+kb5aoetdp226wrqOtHuvxc9InlsMrX\n   5HCkgvtULt80VtPB5tvHlLbU51R1leQ+nW0ftknjClM7Ktf7Pt9n161FKfULHbeU/P5brO/5\n   8PeveZ2l+s31OpmmizxP5z/VrssvNP7Vb9XbUGr+LWSdWKr4c/lemct7U/1KfJcs5nfiXNcz\n   Va3lCf2OXi75c+gaSd/4SyH/pmds+8G2fWCbvmwMeZapf6v2g9hU16vF7l/65K8cc6uh7bIs\n   W8jdLyyxp4BPPOru6+Qx8rd8beIyhew8xjoMtU8l90dcyldseUOJPpPLevpc7ZnvL8f4oaRO\n   ad34WVeefPYVSdG+27T7vPdESj0VV5leyvXoufQvffKZTpZmGy+27UNKfYCc5dWmj2fbp44Z\n   P6G/WN9X1cl8beoieS7ad7+PGP14nz1ATO1q3Xx2jHnpWO1xR1uPovumYQndrFD9uyrdvpD4\n   b9L8Yaz9wxl5bbVu/XlT9j2X/Rr6Hl7brYPd0V1jM5bOk+84oUn7xpeeH7IhVJ7j25+IrU9s\n   ig+XOi7lGMtGj9pGB903/kuMQVPuORpjv7+c35AvvYYkNO1CviFvU4/HkF+qe2ZTG+VTn1bt\n   fV7y5/PtqNR76oeuy4zlH3n/9ND3qPuxu7xb3cuj7heahiXq4ljrC1R5vm5M39HGFz7yzRLr\n   k1PoMMfcPzeGvDPWPssxw6Rzo8QcXmp3XGSSHX2/Et08k67f5dtmuupKN2FvMpOsKObeDnVx\n   k3ofp1h6VrFIVVdV7T2fYm9013l7k/5rbNlKaBuXso7LLV+K1d67uuWiJ19ShhcjvUP97FsO\n   Q+V7pdfDpy5rtv2qEPkU7XFY0v3Q+Oc8FpqHdHV9Xf415XFbPTPfPk7qNWsufow9vkqlz6v+\n   eA4udH9l3XxtiA5ZyN5XpvxSNzdetRdQlWnKjzbP695Xt9+WTz/bJk5y6tDVlYHUe0Crv9Bv\n   vMf+bnzq79DHenfs/ZD3y4TO7b0S7vPM8Z5yL2mTG1XXKcyMLh5093OzvwbVfzr/1hHDby7u\n   ufhH5z/Vrm1YZPsheUtn2pQh+RnfMmCqy3PN7aSeN0oRtrp8m6oONOXflHVfrnj0ccdU1lVS\n   yYu7Ssjz96ZwxEgz13rX1c3Y+Sp2vJve7eN+zP3nYsojYunAhMq1cs2vM1X9J99+Q2g+d+1z\n   5OznpXJD1zcKcc/U33KN39TzgCnr4lz95Fz1cW79kxT6SDF00UruT5ZDZ8Xl9x83MV0I0CwB\n   AB+LCAC4xcFoAgMdjksWhCAMBO/CelYzJ4gMCqiI4t/n/a9hyk29JN3p5DL7bj7GTQrbKypR\n   dDVVywyhZCz4xkUhnSIj5EExoFoQisIfbICE2WJOoAESSK7wecCscDJSxRXMbBAlfLCyIbTh\n   T8tr5/YikvVFSYq3dURbKo/gf+Q3zBCELycCXW/uB2mPjCb8AAAA"), Pn = Object.fromEntries(Nn.values.map((e, t) => [e, t])), { values: Fn } = Nn, { AI: In, AL: Ln, CJ: Rn, CM: zn, NS: Bn, SA: Vn, SG: Hn, SP: Un, XX: Wn } = Pn;
function Gn(e) {
	switch (e) {
		case null: return null;
		case -1: return "sot";
		case -2: return "eot";
		default: return Fn[e];
	}
}
function Kn(e, t) {
	switch (e) {
		case In:
		case Hn:
		case Wn: return Ln;
		case Vn: return /^[\p{gc=Mn}\p{gc=Mc}]$/u.test(t) ? zn : Ln;
		case Rn: return Bn;
	}
	return e;
}
var qn = class {
	cp = -Infinity;
	cls = -1;
	char = "";
	len = 0;
	ignored = !1;
	constructor(e, t, n, r) {
		this.cls = e, this.cp = t, this.char = n, this.len = r;
	}
	[Symbol.for("nodejs.util.inspect.custom")](e, t, n) {
		return `${Gn(this.cls)}(${this.cp.toString(16).padStart(4, "0")}:${JSON.stringify(this.char)})${this.ignored ? "Ig" : ""}`;
	}
}, Jn = class {
	str = "";
	len = 0;
	prevChunk = 0;
	prev = new qn(-1, -Infinity, "", 0);
	cur = new qn(-1, -Infinity, "", 0);
	next = new qn(-1, -Infinity, "", 0);
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
		this.push(new qn(-2, Infinity, "", this.next.len));
	}
	*codePoints(e, t = !0) {
		if (t) for (; e < this.len;) if (e === this.cur.len && this.next.cls >= 0) yield this.next, e += this.next.char.length;
		else {
			let t = this.str.codePointAt(e), n = String.fromCodePoint(t), r = Nn.get(t);
			e += n.length, yield new qn(Kn(r, n), t, n, e);
		}
		else for (; e > 0;) if (e === this.cur.len) yield this.cur, e -= this.cur.char.length;
		else if (e === this.prev.len) yield this.prev, e -= this.prev.char.length;
		else {
			let t = e - 1, n = this.str.charCodeAt(t);
			n >= 56320 && n <= 57343 && t--;
			let r = this.str.codePointAt(t), i = String.fromCodePoint(r);
			yield new qn(Kn(Nn.get(r), i), r, i, e), e = t;
		}
	}
	classAfterSpaces(e) {
		for (let { cls: t } of this.codePoints(e)) if (t !== Un) return t;
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
}, Yn = class {
	string = void 0;
	props = void 0;
	constructor(e, t = !1) {
		this.position = e, this.required = t;
	}
}, Xn = Mn.fromBase64("AAAEAAAAAAD/////wQIAAB+LCAC1xcFoAgPtmj1IHUEQxzd5FiaEkMLSKqQIViEQCEmTjyqk\n   SUgR7OySTrHxdVoIYqUg2AgqFhYWFhYidpYqKDaClVZaqJWF2qj/xT1cjjtv772Z3T1uHvzY\n   753d2b252ds3+1SpRbAMVkGSrlMo5LNjIfqoB/uEfR2Ao5yy4zb7PgUX4Brcgo6GUi9AF+gG\n   r0EPeAc+AN3mM8KvJu6DH0bWb08yeyEneV77rHia/yjbMvEBxJum7mCqzQjSo1beuBWfRFy3\n   1fHpR2QJgiAIgiAIgiAIQpoZc45c8HhGd2WJYUyy5oIgCP5oRPhuEQQh7vvPVuAe34q5x1lH\n   uJFh15J7HRt9Z7MJ9iKwg1fP72kG4osqz3ynUlNPHjhC2i5/9UypX8DOa6bSa0hfAbsf33zE\n   /EPLr7NtOYj4zlTfD+v7dG0r8uzhXM39qEPH9TtBvTNwUXK9dyv0frzE3DSxje8mZ0yNjuz8\n   zlT+S6T1OnQh7M5oo+f+Bvk67EGY/OfiPeKfTL5+hr6ZuM13k/cT4R/QC86tMfdZbf4a2Un6\n   H9L9OXNIGCoo12yDYdR7mzG+tP8yhjoTpt607tuh/6r7b1VG7yv5ya/OP7iZQXEdYyi9UNel\n   WKM83YTQE/f8qftudz9y7G/OdWlXLxTPYRm9cu+ZMutMaYuK2tnjyqpb5jnPa8+xH7n3eJFO\n   ivRGbTNC6su3PeHYM0V7OxZ/hUtWLP5ZFfzDmMYQSieU8qj78rF3fMsI+axX5fwWYvw+5t9u\n   f0VnNR964yh31bdLOce8qfYb11ndVWeUvibHfCj8tZD2LNZvTRyyW/GfQr1/OM8gob/LcPn8\n   If3iVmVT23Iu/69KaxHzOYn6XenTNw1551DW/3V5X7v6c9Tfh7jPX9TrFtqOhjgPttqeW28u\n   33192kvqs2vW7w7BeyuJcEoAAB+LCAC1xcFoAgOLVvJT0lGKVIoFANHfAiwJAAAA");
Object.fromEntries(Xn.values.map((e, t) => [e, t]));
var { values: Zn } = Xn, { AK: Qn, AL: $n, AP: er, AS: tr, B2: nr, BA: rr, BB: ar, BK: or, CB: sr, CL: cr, CM: lr, CP: ur, CR: dr, EB: fr, EM: pr, EX: mr, GL: hr, H2: gr, H3: _r, HH: vr, HL: yr, HY: br, ID: xr, IN: Sr, IS: Cr, JL: wr, JT: Tr, JV: Er, LF: Dr, NU: Or, OP: kr, NL: Ar, NS: jr, PO: Mr, PR: Nr, RI: Pr, SP: Fr, SY: Ir, QU: Lr, VF: Rr, VI: zr, WJ: Br, ZW: Vr, ZWJ: Hr } = Pn, Ur = /* @__PURE__ */ new Set([
	$n,
	yr,
	Or
]), Wr = /* @__PURE__ */ new Set([
	or,
	dr,
	Dr,
	Ar,
	Fr,
	Vr
]), Gr = /* @__PURE__ */ new Set([
	xr,
	fr,
	pr
]), Kr = /* @__PURE__ */ new Set([
	wr,
	Er,
	gr,
	_r
]), qr = /* @__PURE__ */ new Set([
	wr,
	Er,
	Tr,
	gr,
	_r
]), Jr = /* @__PURE__ */ new Set([Er, Tr]), Yr = /* @__PURE__ */ new Set([
	Fr,
	hr,
	Br,
	cr,
	Lr,
	ur,
	mr,
	Cr,
	Ir,
	or,
	dr,
	Dr,
	Ar,
	Vr
]), Xr = /* @__PURE__ */ new Set([
	-1,
	or,
	dr,
	Dr,
	Ar,
	kr,
	Lr,
	hr,
	Fr,
	Vr
]), X = Symbol("PASS"), Z = Symbol("NO_BREAK"), Zr = Symbol("MAY_BREAK"), Qr = Symbol("MUST_BREAK");
function $r(e) {
	return e.cur.cls === -1 && e.next.cls !== -2 ? Z : X;
}
function ei(e) {
	return e.next.cls === -2 && (e.cur.len === 0 || e.cur.len !== e.prevChunk) ? Qr : X;
}
function ti(e) {
	return e.cur.cls === or ? Qr : X;
}
function ni(e) {
	switch (e.cur.cls) {
		case dr: return e.next.cls === Dr ? Z : Qr;
		case Dr:
		case Ar: return Qr;
	}
	return X;
}
function ri(e) {
	switch (e.next.cls) {
		case or:
		case dr:
		case Dr:
		case Ar: return Z;
	}
	return X;
}
function ii(e) {
	return e.cur.cls !== Pr && (e.RI = 0), e.spaces ? (e.next.cls !== Fr && (e.spaces = !1), Z) : X;
}
function ai(e) {
	if (e.next.cls === Vr) return Z;
	if (e.next.cls === Fr) switch (e.cur.cls) {
		case Vr:
		case kr:
		case Lr:
		case cr:
		case ur:
		case nr: break;
		default: return Z;
	}
	return X;
}
function oi(e) {
	return e.LB8 ? (e.LB8 = !1, Zr) : e.cur.cls === Vr ? e.next.cls === Fr ? (e.LB8 = !0, Z) : Zr : X;
}
function si(e) {
	return e.cur.cls === Hr ? Z : X;
}
function ci(e) {
	return !Wr.has(e.cur.cls) && (e.next.cls === lr || e.next.cls === Hr) ? (e.next.ignored = !0, Z) : X;
}
function li(e) {
	return e.cur.cls === lr && (e.cur.cls = $n), e.next.cls === lr && (e.next.cls = $n), X;
}
function ui(e) {
	return e.next.cls === Br || e.cur.cls === Br ? Z : X;
}
function di(e) {
	return e.cur.cls === hr ? Z : X;
}
function fi(e) {
	if (e.next.cls === hr) switch (e.cur.cls) {
		case Fr:
		case rr:
		case br:
		case vr: return X;
		default: return Z;
	}
	return X;
}
function pi(e) {
	switch (e.next.cls) {
		case cr:
		case ur:
		case mr:
		case Ir: return Z;
	}
	return X;
}
function mi(e) {
	return e.cur.cls === kr ? (e.next.cls === Fr && (e.spaces = !0), Z) : X;
}
function hi(e) {
	return Xr.has(e.prev.cls) && /^\p{Pi}$/u.test(e.cur.char) && e.cur.cls === Lr ? (e.spaces = !0, Z) : X;
}
function gi(e) {
	if (/^\p{gc=Pf}$/u.test(e.next.char) && e.next.cls === Lr) {
		let t = e.afterNext();
		if (!t || Yr.has(t.cls)) return Z;
	}
	return X;
}
function _i(e) {
	return e.cur.cls === Fr && e.next.cls === Cr && e.afterNext()?.cls === Or ? Zr : X;
}
function vi(e) {
	return e.next.cls === Cr ? Z : X;
}
function yi(e) {
	if (e.cur.cls === cr || e.cur.cls === ur) {
		if (e.classAfterSpaces(e.cur.len) === jr) return e.next.cls === Fr && (e.spaces = !0), Z;
		if (e.next.cls === Fr) return Z;
	}
	return X;
}
function bi(e) {
	if (e.cur.cls === nr) {
		if (e.classAfterSpaces(e.cur.len) === nr) return e.next.cls === Fr && (e.spaces = !0), Z;
		if (e.next.cls === Fr) return Z;
	}
	return X;
}
function xi(e) {
	return e.cur.cls === Fr ? Zr : X;
}
function Si(e) {
	return e.next.cls === Lr && !/^\p{Pi}$/u.test(e.next.char) || e.cur.cls === Lr && !/^\p{Pf}$/u.test(e.cur.char) ? Z : X;
}
function Ci(e) {
	if (!Xn.get(e.cur.cp) && e.next.cls === Lr) return Z;
	if (e.next.cls === Lr) {
		let t = e.afterNext();
		if (!t || !Xn.get(t.cp)) return Z;
	}
	return e.cur.cls === Lr && !Xn.get(e.next.cp) || (e.prev.cls === -1 || !Xn.get(e.prev.cp)) && e.cur.cls === Lr ? Z : X;
}
function wi(e) {
	return e.cur.cls === sr || e.next.cls === sr ? Zr : X;
}
var Ti = /* @__PURE__ */ new Set([
	-1,
	or,
	dr,
	Dr,
	Ar,
	Fr,
	Vr,
	sr,
	hr
]);
function Ei(e) {
	return Ti.has(e.prev.cls) && (e.cur.cls === br || e.cur.cls === vr) && (e.next.cls === $n || e.next.cls === yr) ? Z : X;
}
function Di(e) {
	if (e.cur.cls === ar) return Z;
	switch (e.next.cls) {
		case rr:
		case vr:
		case br:
		case jr: return Z;
	}
	return X;
}
function Oi(e) {
	return e.prev.cls === yr && (e.cur.cls === br || e.cur.cls === vr) && e.next.cls !== yr ? Z : X;
}
function ki(e) {
	return e.cur.cls === Ir && e.next.cls === yr ? Z : X;
}
function Ai(e) {
	return e.next.cls === Sr ? Z : X;
}
function ji(e) {
	switch (e.cur.cls) {
		case $n:
		case yr:
			if (e.next.cls === Or) return Z;
			break;
		case Or: if (e.next.cls === $n || e.next.cls === yr) return Z;
	}
	return X;
}
function Mi(e) {
	return e.cur.cls === Nr && Gr.has(e.next.cls) || e.next.cls === Mr && Gr.has(e.cur.cls) ? Z : X;
}
function Ni(e) {
	return (e.cur.cls === Nr || e.cur.cls === Mr) && (e.next.cls === $n || e.next.cls === yr) || (e.cur.cls === $n || e.cur.cls === yr) && (e.next.cls === Nr || e.next.cls === Mr) ? Z : X;
}
var Pi = /* @__PURE__ */ new Set([Mr, Nr]), Fi = /* @__PURE__ */ new Set([cr, ur]);
function Ii(e) {
	let t = null;
	if (Pi.has(e.next.cls) ? t = Fi.has(e.cur.cls) ? e.prev.len : e.cur.len : e.next.cls === Or && (t = e.cur.len), t !== null) SyIsLoop: for (let { cls: n } of e.codePoints(t, !1)) switch (n) {
		case Ir:
		case Cr: continue;
		case Or: return Z;
		default: break SyIsLoop;
	}
	if (e.cur.cls === Mr || e.cur.cls === Nr) {
		if (e.next.cls === kr) {
			let t = e.afterNext();
			if (t && (t.cls === Or || t.cls === Cr && e.afterNext(2)?.cls === Or)) return Z;
		} else if (e.next.cls === Or) return Z;
	}
	return e.cur.cls === br && e.next.cls === Or || e.cur.cls === Cr && e.next.cls === Or ? Z : X;
}
function Li(e) {
	switch (e.cur.cls) {
		case wr:
			if (Kr.has(e.next.cls)) return Z;
			break;
		case Er:
		case gr:
			if (Jr.has(e.next.cls)) return Z;
			break;
		case Tr:
		case _r: if (e.next.cls === Tr) return Z;
	}
	return X;
}
function Ri(e) {
	switch (e.cur.cls) {
		case wr:
		case Er:
		case Tr:
		case gr:
		case _r:
			if (e.next.cls === Mr) return Z;
			break;
		case Nr: if (qr.has(e.next.cls)) return Z;
	}
	return X;
}
function zi(e) {
	return (e.cur.cls === $n || e.cur.cls === yr) && (e.next.cls === $n || e.next.cls === yr) ? Z : X;
}
function Bi(e) {
	let { prev: t, cur: n, next: r } = e;
	function i(e) {
		return e.cls === Qn || e.char === "◌" || e.cls === tr;
	}
	return n.cls === er && i(r) || i(n) && (r.cls === Rr || r.cls === zr) || i(t) && n.cls === zr && (r.cls === Qn || r.char === "◌") || i(n) && i(r) && e.afterNext()?.cls === Rr ? Z : X;
}
function Vi(e) {
	return e.cur.cls === Cr && (e.next.cls === $n || e.next.cls === yr) ? Z : X;
}
function Hi(e) {
	switch (e.cur.cls) {
		case $n:
		case yr:
		case Or:
			if (e.next.cls === kr && !Xn.get(e.next.cp)) return Z;
			break;
		case ur: if (!Xn.get(e.cur.cp) && Ur.has(e.next.cls)) return Z;
	}
	return X;
}
function Ui(e) {
	if (e.cur.cls === Pr) {
		if (e.next.cls === Pr && ++e.RI % 2 != 0) return Z;
	} else e.RI = 0;
	return X;
}
function Wi(e) {
	return e.cur.cls === fr && e.next.cls === pr || e.next.cls === pr && /^\p{ExtPict}$/u.test(e.cur.char) && /^\p{gc=Cn}$/u.test(e.cur.char) ? Z : X;
}
function Gi() {
	return Zr;
}
var Ki = [
	$r,
	ei,
	ti,
	ni,
	ri,
	ii,
	ai,
	oi,
	si,
	ci,
	li,
	ui,
	di,
	fi,
	pi,
	mi,
	hi,
	gi,
	_i,
	vi,
	yi,
	bi,
	xi,
	Si,
	Ci,
	wi,
	Ei,
	Oi,
	Di,
	ki,
	Ai,
	ji,
	Mi,
	Ni,
	Ii,
	Li,
	Ri,
	zi,
	Bi,
	Vi,
	Hi,
	Ui,
	Wi,
	Gi
], qi = class {
	#e;
	constructor(e = {}) {
		if (this.#e = {
			string: !1,
			example7: !1,
			verbose: !1,
			...e
		}, this.rules = [...Ki], this.#e.example7) throw Error("'example7' flag deprecated");
		this.#e.verbose && this.rules.unshift((e) => (console.log(e.cur.len, e), X));
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
				case X: break;
				case Z: return this.#e.verbose && console.log(`  ${t.name}: NO_BREAK`), null;
				case Zr: return this.#e.verbose && console.log(`  ${t.name}: MAY_BREAK`), new Yn(e.cur.len);
				case Qr: return this.#e.verbose && console.log(`  ${t.name}: MUST_BREAK`), new Yn(e.cur.len, !0);
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
		let t = new Jn(e);
		for (let e of t.codePoints(0)) t.push(e), yield* this.#n(t);
		t.pushEnd(), yield* this.#n(t);
	}
};
//#endregion
//#region src/text-layout.ts
function Ji(e, t) {
	let n = new Intl.Segmenter(t, { granularity: "grapheme" }), r = /* @__PURE__ */ new Set([0]);
	for (let t of n.segment(e)) r.add(t.index + t.segment.length);
	return r;
}
var Yi = class {
	#e = new qi();
	#t;
	constructor(e = "ja") {
		this.#t = e;
	}
	getBreakOpportunities(e) {
		let t = Ji(e, this.#t), n = /* @__PURE__ */ new Map();
		for (let r of this.#e.breaks(e)) t.has(r.position) && n.set(r.position, (n.get(r.position) ?? !1) || r.required);
		return Object.freeze([...n].sort(([e], [t]) => e - t).map(([e, t]) => Object.freeze({
			position: e,
			required: t
		})));
	}
}, Xi = /* @__PURE__ */ new Map(), Zi = /\r\n|[\n\r\v\f\u0085\u2028\u2029]/gu;
function Qi(e) {
	let t = Xi.get(e);
	if (t) return t;
	let n = new Yi(e);
	return Xi.set(e, n), n;
}
function $i(e, t) {
	if (!Number.isFinite(e) || e < 0) throw TypeError(`${t} must return a non-negative finite number.`);
	return e;
}
function ea(e, t, n) {
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
function ta(e, t, n, r, i) {
	if (e.length === 0) return [{
		text: "",
		start: t,
		end: t,
		width: 0
	}];
	let a = Ji(e, i), o = [...a].sort((e, t) => e - t), s = ea(e, r, a), c = [], l = 0;
	for (; l < e.length;) {
		let r = s.find((e) => e.position > l && e.required)?.position ?? e.length, i, a = 0;
		for (let t of s) {
			if (t.position <= l || t.position > r) continue;
			let o = e.slice(l, t.position), s = $i(n.measureText(o), "measureText");
			s <= n.maxWidth && (i = t.position, a = s);
		}
		if (i === void 0) {
			let t = o.filter((e) => e > l && e <= r);
			for (let r of t) {
				let t = e.slice(l, r), o = $i(n.measureText(t), "measureText");
				o <= n.maxWidth && (i = r, a = o);
			}
			i === void 0 && (i = t[0] ?? r, a = $i(n.measureText(e.slice(l, i)), "measureText"));
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
function na(e) {
	if (typeof e.text != "string") throw TypeError("text must be a string.");
	if (!Number.isFinite(e.maxWidth) || e.maxWidth <= 0) throw TypeError("maxWidth must be a positive finite number.");
	if (typeof e.measureText != "function") throw TypeError("measureText must be a function.");
	let t = e.locale ?? "ja", n = e.lineBreakProvider ?? Qi(t), r = [], i = 0;
	for (let a of e.text.matchAll(Zi)) {
		let o = a.index;
		r.push(...ta(e.text.slice(i, o), i, e, n, t)), i = o + a[0].length;
	}
	return r.push(...ta(e.text.slice(i), i, e, n, t)), Object.freeze({
		lines: Object.freeze(r.map((e) => Object.freeze(e))),
		maxLineWidth: Math.max(0, ...r.map((e) => e.width))
	});
}
//#endregion
//#region src/content-run.ts
function ra(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function ia(e, t) {
	let n = /* @__PURE__ */ new Set(["type", ...t]), r = Object.keys(e).filter((e) => !n.has(e));
	if (r.length > 0) throw TypeError(`Bubble content run has unknown properties: ${r.join(", ")}.`);
	for (let n of t) if (typeof e[n] != "string") throw TypeError(`Bubble content run ${n} must be a string.`);
}
function aa(e) {
	if (!ra(e)) throw TypeError("Bubble content run must be an object.");
	if (e.type === "text") return ia(e, ["text"]), Object.freeze({
		text: e.text,
		type: "text"
	});
	if (e.type === "ruby") {
		ia(e, ["base", "reading"]);
		let t = e.base, n = e.reading;
		if (t.length === 0) throw TypeError("Bubble ruby run base must not be empty.");
		if (n.length === 0) throw TypeError("Bubble ruby run reading must not be empty.");
		return Object.freeze({
			base: t,
			reading: n,
			type: "ruby"
		});
	}
	throw TypeError("Bubble content run type must be text or ruby.");
}
function oa(e) {
	if (typeof e == "string") return Object.freeze([Object.freeze({
		text: e,
		type: "text"
	})]);
	if (!Array.isArray(e)) throw TypeError("Bubble text must be a string or content run array.");
	let t = e.map((e) => aa(e)).filter((e) => e.type !== "text" || e.text.length > 0);
	return t.length === 0 ? Object.freeze([Object.freeze({
		text: "",
		type: "text"
	})]) : Object.freeze(t);
}
function sa(e) {
	return e.every((e) => e.type === "text");
}
function ca(e) {
	return e.map((e) => e.type === "ruby" ? e.base : e.text).join("");
}
function la(e) {
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
var ua = Object.freeze([
	"CHARACTER",
	"WORD",
	"LINE",
	"BLOCK"
]);
function da(e) {
	let t = globalThis.Intl?.Segmenter;
	return typeof t == "function" ? [...new t(void 0, { granularity: "grapheme" }).segment(e)].map(({ segment: e }) => e) : Array.from(e);
}
function fa(e) {
	if (typeof e != "string" || !ua.includes(e)) throw TypeError("Bubble reveal unit must be CHARACTER, WORD, LINE, or BLOCK.");
	return e;
}
function pa(e) {
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
	let r = fa(t.unit), i = t.delimiters ?? " 	\r\n";
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
function ma(e, t, n) {
	let r = new Set(Array.from(t)), i = [], a = "";
	for (let t of da(e)) a += t, r.has(t) && ((n || a.slice(0, -t.length).length > 0) && i.push(n ? a : a.slice(0, -t.length)), a = "");
	return a.length > 0 && i.push(a), i.filter((e) => e.length > 0);
}
function ha(e, t) {
	if (e.length === 0) return Object.freeze([""]);
	if (t.unit === "CHARACTER") return Object.freeze(da(e));
	if (t.unit === "WORD") {
		let n = ma(e, t.delimiters, t.showDelimiters);
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
function ga(e) {
	return Object.freeze(la(Object.freeze([...e])));
}
function _a(e) {
	return Object.freeze({
		text: e,
		type: "text"
	});
}
function va(e, t) {
	let n = [], r = [], i = () => {
		r.length !== 0 && (n.push(ga(r)), r = []);
	};
	for (let n of e) {
		if (n.type === "ruby") {
			r.push(n);
			continue;
		}
		if (t === "LINE") {
			for (let e of n.text.split(/(?<=\n)/u)) e.length !== 0 && (r.push(_a(e)), e.endsWith("\n") && i());
			continue;
		}
		let e = n.text.split(/(\n{2,})/u);
		for (let [t, n] of e.entries()) n.length !== 0 && (r.push(_a(n)), t % 2 == 1 && i());
	}
	return i(), Object.freeze(n.length > 0 ? n : [ga(e)]);
}
function ya(e, t) {
	if (sa(e)) return Object.freeze(ha(ca(e), t).map((e) => Object.freeze([_a(e)])));
	if (t.unit === "LINE" || t.unit === "BLOCK") return va(e, t.unit);
	let n = [];
	for (let r of e) {
		if (r.type === "ruby") {
			n.push(Object.freeze([r]));
			continue;
		}
		let e = t.unit === "CHARACTER" ? da(r.text) : ma(r.text, t.delimiters, t.showDelimiters);
		for (let t of e) n.push(Object.freeze([_a(t)]));
	}
	return Object.freeze(n.length > 0 ? n : [Object.freeze([_a("")])]);
}
function ba(e, t) {
	let n = e.slice(0, Math.max(0, Math.min(t, e.length)));
	return la(Object.freeze(n.flat()));
}
//#endregion
//#region src/portrait-layout.ts
var xa = Object.freeze([
	"left",
	"right",
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right"
]), Sa = Object.freeze({
	x: 0,
	y: 0,
	zoomPercent: 100
});
function Ca(e) {
	if (typeof e != "string") throw TypeError("Bubble portrait placement must be a string.");
	let t = e.trim().toLowerCase().replaceAll("_", "-");
	if (!xa.includes(t)) throw TypeError(`Unsupported Bubble portrait placement: ${e}`);
	return t;
}
function wa(e) {
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
function Ta(e) {
	if (typeof e != "number" || !Number.isFinite(e) || e < 0) throw TypeError("Bubble portrait corner radius must be zero or greater.");
	return e;
}
var Ea = Object.freeze([
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
function Da(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Oa(e) {
	return !Da(e) || typeof e.textStyle != "string" || e.textStyle.trim() !== "default" ? "custom" : Ea.every((t) => e[t] === void 0) ? "scratch-default" : "custom";
}
function ka(e) {
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
function Aa(e, t = ka) {
	let n = na({
		text: e.slice(0, 330),
		maxWidth: 170,
		measureText: (e) => {
			let n;
			try {
				n = t(e);
			} catch {
				return ka(e);
			}
			return Number.isFinite(n) && n >= 0 ? n : ka(e);
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
function ja(e) {
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
function Ma(e) {
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
function Na(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function Pa(e) {
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
function Fa(e) {
	let { paddedHeight: t, paddedWidth: n } = e;
	return `<path d="${`${Pa(e)} C ${n - 16} ${t + 4} ${n - 12} ${t + 8} ${n - 12} ${t + 10} Q ${n - 12} ${t + 12} ${n - 14} ${t + 12} C ${n - 17} ${t + 12} ${n - 27} ${t + 8} ${n - 32} ${t} Z`}" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4" stroke-linejoin="round" paint-order="stroke fill"/>`;
}
function Ia(e) {
	let { paddedHeight: t, paddedWidth: n } = e;
	return `<path d="${`${Pa(e)} L ${n - 28} ${t} A 4 4 0 0 1 ${n - 36} ${t} Z`}" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4" stroke-linejoin="round" paint-order="stroke fill"/><circle cx="${n - 25.25}" cy="${t + 7.25}" r="2.25" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4" paint-order="stroke fill"/><circle cx="${n - 17.5}" cy="${t + 9.5}" r="1.5" fill="white" stroke="rgba(0, 0, 0, 0.15)" stroke-width="4" paint-order="stroke fill"/>`;
}
function La(e) {
	let t = ja(e.layout), n = e.kind === "say" ? Fa(t) : Ia(t), r = e.pointsLeft ? "translate(2 2)" : `translate(${t.width} 0) scale(-1 1) translate(2 2)`, i = e.layout.lines.map((e, t) => `<text x="12" y="${24.6 + 16 * t}" fill="#575E75" font-family="Helvetica, sans-serif" font-size="14" xml:space="preserve">${Na(e.text)}</text>`).join(""), a = Na(e.title ?? `${e.kind} bubble`);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t.width}" height="${t.height}" viewBox="0 0 ${t.width} ${t.height}" role="img" data-bubble-profile="scratch-default" data-bubble-kind="${e.kind}"><title>${a}</title><g transform="${r}">${n}</g>${i}</svg>`;
}
//#endregion
//#region src/composition.ts
var Q = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleCompositionError", this.code = e;
	}
}, Ra = /* @__PURE__ */ new Set(["say", "think"]), za = /* @__PURE__ */ new Set([
	"idle",
	"talking",
	"awaiting-continue"
]), Ba = /* @__PURE__ */ new Set([
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
]), Va = /* @__PURE__ */ new Set([
	"linear",
	"easeIn",
	"easeOut",
	"easeInOut"
]);
function Ha(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Ua(e, t, n, r) {
	let i = /* @__PURE__ */ new Set([...t, ...n]), a = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t)), o = Object.keys(e).filter((e) => !i.has(e));
	if (a.length > 0 || o.length > 0) throw new Q("BUBBLE-COMPOSITION-001", `${r} has missing or unknown properties.`);
}
function Wa(e, t) {
	if (typeof e != "string" || e.trim().length === 0) throw new Q("BUBBLE-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e.trim();
}
function Ga(e, t) {
	if (typeof e != "string" || e.length === 0) throw new Q("BUBBLE-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e;
}
function Ka(e, t, n) {
	if (!Ha(e)) throw new Q("BUBBLE-COMPOSITION-001", `${t} must be an object.`);
	if (Ua(e, ["frames", "frameIntervalSeconds"], [], t), !Array.isArray(e.frames) || e.frames.length < n) throw new Q("BUBBLE-COMPOSITION-001", `${t}.frames must contain at least ${n} image asset name${n === 1 ? "" : "s"}.`);
	let r = Object.freeze(e.frames.map((e, n) => Ga(e, `${t}.frames[${n}]`))), i = e.frameIntervalSeconds;
	if (typeof i != "number" || !Number.isFinite(i) || i <= 0) throw new Q("BUBBLE-COMPOSITION-001", `${t}.frameIntervalSeconds must be a positive finite number.`);
	return Object.freeze({
		frames: r,
		frameIntervalSeconds: i
	});
}
function qa(e) {
	if (!Ha(e)) throw new Q("BUBBLE-COMPOSITION-001", "Bubble portrait must be an object.");
	Ua(e, ["base"], [
		"blink",
		"lipSync",
		"placement",
		"offset",
		"cornerRadius"
	], "Bubble portrait");
	let t = e.blink === void 0 ? void 0 : Ka(e.blink, "Bubble portrait blink", 1), n = e.lipSync === void 0 ? void 0 : Ka(e.lipSync, "Bubble portrait lip-sync", 1), r, i, a;
	try {
		r = Ca(e.placement ?? "left"), i = e.offset === void 0 ? Sa : wa(e.offset), a = Ta(e.cornerRadius ?? 0);
	} catch (e) {
		throw new Q("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble portrait layout is invalid.");
	}
	return Object.freeze({
		base: Ga(e.base, "Bubble portrait base"),
		...t === void 0 ? {} : { blink: t },
		...n === void 0 ? {} : { lipSync: n },
		placement: r,
		offset: i,
		cornerRadius: a
	});
}
function Ja(e, t) {
	if (!Ha(e)) throw new Q("BUBBLE-COMPOSITION-001", `${t} must be an object.`);
	if (Ua(e, ["name"], [
		"durationSeconds",
		"ease",
		"direction",
		"count",
		"relativeScale",
		"speed",
		"visualStyle"
	], t), !Ba.has(e.name)) throw new Q("BUBBLE-COMPOSITION-001", `${t}.name is not a supported Bubble motion.`);
	let n = (n, r, i = !1) => {
		let a = e[n];
		if (a !== void 0) {
			if (typeof a != "number" || !Number.isFinite(a) || a < r || i && !Number.isInteger(a)) throw new Q("BUBBLE-COMPOSITION-001", `${t}.${n} is invalid.`);
			return a;
		}
	}, r = n("durationSeconds", 0), i = n("count", 1, !0), a = n("relativeScale", 0), o = n("speed", 0), s = e.direction;
	if (s !== void 0 && typeof s != "number" && typeof s != "string") throw new Q("BUBBLE-COMPOSITION-001", `${t}.direction is invalid.`);
	let c = e.ease ?? "easeInOut";
	if (typeof c != "string" || !Va.has(c)) throw new Q("BUBBLE-COMPOSITION-001", `${t}.ease is invalid.`);
	let l = e.visualStyle;
	if (l !== void 0 && (typeof l != "string" || !lt.includes(l))) throw new Q("BUBBLE-COMPOSITION-001", `${t}.visualStyle is invalid.`);
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
function Ya(e) {
	if (e === void 0) return;
	if (!Ha(e)) throw new Q("BUBBLE-COMPOSITION-001", "Bubble audio must be an object.");
	Ua(e, [], [
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
		r !== void 0 && (t[n] = Ga(r, `Bubble audio ${n}`));
	}
	return Object.freeze(t);
}
function Xa(e) {
	if (!Ha(e)) throw new Q("BUBBLE-COMPOSITION-001", "Bubble style must be an object.");
	Ua(e, ["name", "textStyle"], [
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
	let t = e.portrait === void 0 ? void 0 : qa(e.portrait), n = e.continueIndicator === void 0 ? void 0 : Ka(e.continueIndicator, "Bubble continue indicator", 2), r;
	if (e.reveal !== void 0) try {
		r = pa(e.reveal);
	} catch (e) {
		throw new Q("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble reveal is invalid.");
	}
	let i = Ya(e.audio), a = e.showAnimation === void 0 ? void 0 : Ja(e.showAnimation, "Bubble showAnimation"), o = e.hideAnimation === void 0 ? void 0 : Ja(e.hideAnimation, "Bubble hideAnimation"), s;
	try {
		s = Ye(e.placement ?? "up-right");
	} catch (e) {
		throw new Q("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble placement is invalid.");
	}
	let c, l, u;
	try {
		c = $e(e.distance ?? 12), l = et(e.tailLength ?? 18), u = e.offset === void 0 ? Ze : tt(e.offset);
	} catch (e) {
		throw new Q("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble actor-relative transform is invalid.");
	}
	let d = e.visualStyle ?? "NORMAL";
	if (typeof d != "string" || !lt.includes(d)) throw new Q("BUBBLE-COMPOSITION-001", `Unsupported Bubble visual style: ${String(d)}`);
	let f;
	if (e.maxWidth !== void 0) {
		if (typeof e.maxWidth != "number" || !Number.isFinite(e.maxWidth) || e.maxWidth <= 0) throw new Q("BUBBLE-COMPOSITION-001", "Bubble style maxWidth must be a positive finite number.");
		f = e.maxWidth;
	}
	let p = e.textLocale === void 0 ? void 0 : Wa(e.textLocale, "Bubble style text locale"), m = Oa(e);
	return Object.freeze({
		name: Wa(e.name, "Bubble style name"),
		textStyle: Wa(e.textStyle, "Bubble text style name"),
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
function Za(e) {
	if (e !== void 0) {
		if (!Ha(e) || typeof e.applyToTarget != "function" || typeof e.getMimeType != "function" || typeof e.isRegistered != "function") throw TypeError("Bubble image capability must provide applyToTarget, getMimeType, and isRegistered.");
		return e;
	}
}
function Qa(e) {
	if (e !== void 0) {
		if (!Ha(e) || typeof e.playSound != "function") throw TypeError("Bubble audio capability must provide playSound.");
		if (e.isRegistered !== void 0 && typeof e.isRegistered != "function") throw TypeError("Bubble audio capability isRegistered must be a function.");
		if (e.getMimeType !== void 0 && typeof e.getMimeType != "function") throw TypeError("Bubble audio capability getMimeType must be a function.");
		return e;
	}
}
function $a(e) {
	if (e === void 0) throw new Q("BUBBLE-COMPOSITION-006", "Bubble image assets require an image capability. Provide options.imageResolver.");
	return e;
}
function eo(e) {
	if (!Ha(e) || typeof e.setText != "function" || typeof e.releaseTarget != "function") throw TypeError("Bubble text capability must provide setText and releaseTarget.");
	return e;
}
function to() {
	return Object.freeze({
		setTimeout: (e, t) => globalThis.setTimeout(e, t),
		clearTimeout: (e) => globalThis.clearTimeout(e)
	});
}
function no(e) {
	if (!Ha(e) || typeof e.setTimeout != "function" || typeof e.clearTimeout != "function") throw TypeError("Bubble scheduler must provide setTimeout and clearTimeout.");
	return e;
}
function ro(e, t) {
	if (!Ha(e) || typeof e.id != "string" || e.id.length === 0 || typeof e.isStage != "boolean") throw new Q("BUBBLE-COMPOSITION-004", `${t} must provide id and isStage.`);
	return e;
}
function io(e) {
	if (typeof e != "object" || !e) throw new Q("BUBBLE-COMPOSITION-004", "Bubble text target must be a non-null object.");
	return e;
}
function ao(e, t) {
	if (!Ha(e) || !Ha(e.targets) || typeof e.setLayerVisible != "function" || typeof e.updateStyle != "function" || typeof e.show != "function" || typeof e.hide != "function" || typeof e.dispose != "function") throw new Q("BUBBLE-COMPOSITION-004", "Bubble surface is invalid.");
	let n = e.targets;
	io(n.text);
	let r = /* @__PURE__ */ new Set(), i = (e, t) => {
		let i = n[e];
		if (!t && i === void 0) return;
		let a = ro(i, `Bubble surface ${e}`);
		if (r.has(a.id)) throw new Q("BUBBLE-COMPOSITION-004", "Bubble image layers must use distinct target IDs.");
		r.add(a.id);
	};
	return i("portraitBase", t.portrait !== void 0), i("portraitBlink", t.portrait?.blink !== void 0), i("portraitLipSync", t.portrait?.lipSync !== void 0), i("continueIndicator", t.continueIndicator !== void 0), e;
}
function oo(e, t) {
	if (e === void 0) throw new Q("BUBBLE-COMPOSITION-006", `Bubble image capability is required for: ${t}. Provide options.imageResolver.`);
	if (!e.isRegistered(t)) throw new Q("BUBBLE-COMPOSITION-003", `Bubble image asset is not registered: ${t}`);
	if (!e.getMimeType(t).startsWith("image/")) throw new Q("BUBBLE-COMPOSITION-003", `Bubble asset is not an image: ${t}`);
}
function so(e, t) {
	if (e === void 0) throw new Q("BUBBLE-COMPOSITION-006", `Bubble audio assets require an audio capability: ${t}. Provide options.audio.`);
	if (e.isRegistered?.(t) === !1) throw new Q("BUBBLE-COMPOSITION-003", `Bubble audio asset is not registered: ${t}`);
	let n = e.getMimeType?.(t);
	if (n !== void 0 && !n.startsWith("audio/")) throw new Q("BUBBLE-COMPOSITION-003", `Bubble asset is not audio: ${t}`);
}
function co(e) {
	return [...e.portrait === void 0 ? [] : [
		e.portrait.base,
		...e.portrait.blink?.frames ?? [],
		...e.portrait.lipSync?.frames ?? []
	], ...e.continueIndicator?.frames ?? []];
}
function lo(e) {
	let t = e.setRichText;
	if (typeof t != "function") throw new Q("BUBBLE-COMPOSITION-007", "Bubble ruby content requires the text capability setRichText method.");
	return t;
}
function uo(e, t, n, r) {
	return !sa(e) && typeof r.splitRichText == "function" ? r.splitRichText({
		reveal: t,
		runs: e,
		styleName: n
	}) : ya(e, t);
}
function fo(e, t, n) {
	if (t.layoutProfile === "scratch-default") return Aa(e, (e) => typeof n.measureText == "function" ? n.measureText({
		styleName: t.textStyle,
		text: e
	}) : NaN).text;
	if (t.maxWidth === void 0) return e;
	if (typeof n.measureText != "function") throw new Q("BUBBLE-COMPOSITION-007", "Bubble style maxWidth requires the text capability measureText method.");
	return na({
		text: e,
		maxWidth: t.maxWidth,
		...t.textLocale === void 0 ? {} : { locale: t.textLocale },
		measureText: (e) => n.measureText?.({
			styleName: t.textStyle,
			text: e
		}) ?? 0
	}).lines.map(({ text: e }) => e).join("\n");
}
function po(e, t) {
	if (e.length === 1) throw e[0];
	if (e.length > 1) throw AggregateError(e, t);
}
function mo(e) {
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
function ho(e) {
	if (!Ha(e)) throw new Q("BUBBLE-COMPOSITION-001", "Show bubble input must be an object.");
	if (Ua(e, [
		"actor",
		"actorKey",
		"kind",
		"text",
		"styleName"
	], ["animationMode", "reveal"], "Show bubble input"), !Ra.has(e.kind)) throw new Q("BUBBLE-COMPOSITION-001", "Bubble kind must be say or think.");
	let t;
	try {
		t = oa(e.text);
	} catch (e) {
		throw new Q("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble text is invalid.");
	}
	let n = e.animationMode ?? "talking";
	if (!za.has(n)) throw new Q("BUBBLE-COMPOSITION-001", "Bubble animation mode is invalid.");
	let r;
	if (e.reveal !== void 0) try {
		r = pa(e.reveal);
	} catch (e) {
		throw new Q("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble reveal is invalid.");
	}
	return {
		actor: e.actor,
		actorKey: Wa(e.actorKey, "Bubble actor key"),
		kind: e.kind,
		content: t,
		styleName: Wa(e.styleName, "Bubble style name"),
		animationMode: n,
		...r === void 0 ? {} : { reveal: r }
	};
}
function go(e) {
	if (!Ha(e)) throw TypeError("Bubble composition options must be an object.");
	let t = Za(e.imageResolver), n = Qa(e.audio), r = eo(e.textCapability);
	if (typeof e.createSurface != "function") throw TypeError("Bubble composition createSurface must be a function.");
	if (e.onAnimationError !== void 0 && typeof e.onAnimationError != "function") throw TypeError("Bubble composition onAnimationError must be a function.");
	let i = no(e.scheduler ?? to()), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), c = !1, l = () => {
		if (c) throw new Q("BUBBLE-COMPOSITION-005", "Bubble composition has been disposed.");
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
		if (!c) throw new Q("BUBBLE-COMPOSITION-002", `Bubble style is not defined: ${s.styleName}`);
		let u = c;
		s.reveal !== void 0 && (u = Object.freeze({
			...c,
			layoutProfile: "custom",
			reveal: s.reveal
		}));
		let d = s.content, f = (e) => {
			let n = new Set(co(e)), r = n.size === 0 ? void 0 : $a(t);
			for (let e of n) oo(r, e);
			return r;
		}, p = f(u);
		for (let e of [
			u.audio?.voice,
			u.audio?.reveal,
			u.audio?.finish,
			u.reveal?.sound
		]) e !== void 0 && so(n, e);
		let m = async (e, t = !1) => {
			e !== void 0 && n !== void 0 && await n.playSound(e, { untilDone: t });
		}, h = async (e, t, n) => {
			let r = co(e).length === 0 ? void 0 : $a(t), i = [];
			if (e.portrait) {
				let t = $a(r);
				i.push(Promise.resolve(t.applyToTarget(e.portrait.base, n.targets.portraitBase)));
				let a = e.portrait.blink?.frames[0];
				a !== void 0 && i.push(Promise.resolve(t.applyToTarget(a, n.targets.portraitBlink)));
				let o = e.portrait.lipSync?.frames[0];
				o !== void 0 && i.push(Promise.resolve(t.applyToTarget(o, n.targets.portraitLipSync)));
			}
			let a = e.continueIndicator?.frames[0];
			if (a !== void 0) {
				let e = $a(r);
				i.push(Promise.resolve(e.applyToTarget(a, n.targets.continueIndicator)));
			}
			await Promise.all(i);
		}, g = (t, n, r) => {
			x = t.portrait?.blink === void 0 ? void 0 : mo({
				actorKey: s.actorKey,
				layer: "portraitBlink",
				animation: t.portrait.blink,
				target: r.targets.portraitBlink,
				imageResolver: $a(n),
				scheduler: i,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), S = t.portrait?.lipSync === void 0 ? void 0 : mo({
				actorKey: s.actorKey,
				layer: "portraitLipSync",
				animation: t.portrait.lipSync,
				target: r.targets.portraitLipSync,
				imageResolver: $a(n),
				scheduler: i,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), C = t.continueIndicator === void 0 ? void 0 : mo({
				actorKey: s.actorKey,
				layer: "continueIndicator",
				animation: t.continueIndicator,
				target: r.targets.continueIndicator,
				imageResolver: $a(n),
				scheduler: i,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			});
		}, _ = o.get(s.actorKey);
		_ && await _.close();
		let v, y = !1, b = !1, x, S, C, w = u.reveal, T = w ? uo(s.content, w, u.textStyle, r) : Object.freeze([s.content]), E = w ? Math.min(1, T.length) : 1, D, O = 0;
		try {
			v = ao(await e.createSurface(Object.freeze({
				actor: s.actor,
				actorKey: s.actorKey,
				kind: s.kind,
				style: u
			})), u);
			let t = (e, t, n) => {
				lo(r)({
					runs: e,
					styleName: t.textStyle,
					target: n,
					...t.maxWidth === void 0 ? {} : { maxWidth: t.maxWidth }
				}), y = !0;
			}, a = () => !sa(d), c = (t, n) => {
				let i = e.getMaxTextWidth?.(n);
				if (i === void 0) return n;
				if (!Number.isFinite(i) || i <= 0) throw new Q("BUBBLE-COMPOSITION-007", "Host text width must be positive and finite.");
				return n.maxWidth === void 0 && a() && (r.measureRichText?.({
					runs: t,
					styleName: n.textStyle
				}) ?? Infinity) <= i ? n : {
					...n,
					maxWidth: Math.min(n.maxWidth ?? Infinity, i)
				};
			}, l = async (e, n = u) => {
				if (n = c(e, n), a()) {
					if (!v) return;
					if (n.layoutProfile === "scratch-default" && v.renderScratchText) throw new Q("BUBBLE-COMPOSITION-007", "Bubble ruby content requires a rich text capability; the scratch-default surface renders plain text only.");
					t(e, n, v.targets.text);
					return;
				}
				let i = ca(e);
				if (n.layoutProfile === "scratch-default" && v?.renderScratchText) {
					let e = Aa(i, (e) => typeof r.measureText == "function" ? r.measureText({
						styleName: n.textStyle,
						text: e
					}) : NaN);
					await v.renderScratchText(e);
					return;
				}
				v && (r.setText({
					styleName: n.textStyle,
					target: v.targets.text,
					text: fo(i, n, r)
				}), y = !0);
			}, _ = (e, n = u) => {
				v && (n = c(e, n), a() ? t(e, n, v.targets.text) : (r.setText({
					styleName: n.textStyle,
					target: v.targets.text,
					text: fo(ca(e), n, r)
				}), y = !0), v.captureTextLayout?.());
			};
			w?.layout === "RESERVED" && _(s.content), await l(w ? ba(T, E) : s.content), await h(u, p, v), g(u, p, v);
			let k = "idle", A = !1, j = Promise.resolve(), M = async () => {
				if (!v) return;
				let e = w ? ba(T, E) : d;
				await l(e), await v.show();
			}, N = () => {
				O += 1, D !== void 0 && i.clearTimeout(D), D = void 0;
			}, P = async () => !w || E >= T.length ? !1 : (E += 1, await M(), await m(w.sound ?? u.audio?.reveal), E >= T.length && N(), !0), F = () => {
				if (!w || w.intervalSeconds <= 0 || E >= T.length) return;
				let e = O;
				D = i.setTimeout(() => {
					D = void 0, !(A || e !== O) && (j = j.then(() => P()).then(() => F()));
				}, w.intervalSeconds * 1e3);
			}, I = async (e) => {
				e !== k && (e === "talking" ? (await C?.stop(), await v?.setLayerVisible("continueIndicator", !1), await v?.setLayerVisible("portraitLipSync", S !== void 0), await S?.start({ primed: !0 })) : e === "awaiting-continue" ? (await S?.stop({ reset: !0 }), await v?.setLayerVisible("portraitLipSync", !1), await v?.setLayerVisible("continueIndicator", C !== void 0), await C?.start({ primed: !0 })) : (await Promise.all([S?.stop({ reset: !0 }), C?.stop()]), await Promise.all([v?.setLayerVisible("portraitLipSync", !1), v?.setLayerVisible("continueIndicator", !1)])), k = e);
			};
			await Promise.all([
				v.setLayerVisible("portraitBase", u.portrait !== void 0),
				v.setLayerVisible("portraitBlink", u.portrait?.blink !== void 0),
				v.setLayerVisible("portraitLipSync", !1),
				v.setLayerVisible("continueIndicator", !1)
			]), await v.show(), b = !0, await m(u.audio?.voice), w !== void 0 && await m(w.sound ?? u.audio?.reveal), await x?.start({ primed: !0 }), await I(s.animationMode);
			let L = Object.freeze({
				actorKey: s.actorKey,
				kind: s.kind,
				get animationMode() {
					return k;
				},
				setText(e) {
					if (A) return Promise.reject(new Q("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let t;
					try {
						t = oa(e);
					} catch (e) {
						return Promise.reject(new Q("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble text is invalid."));
					}
					return j = j.then(async () => {
						v && (N(), d = t, w ? (T = uo(t, w, u.textStyle, r), E = Math.min(1, T.length), w.layout === "RESERVED" && _(t), await M(), F()) : await M());
					}), j;
				},
				updateStyle(e) {
					if (A) return Promise.reject(new Q("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let t;
					try {
						t = Xa(e);
					} catch (e) {
						return Promise.reject(e);
					}
					return j = j.then(async () => {
						if (!v) return;
						ao(v, t);
						let e = f(t);
						for (let e of [
							t.audio?.voice,
							t.audio?.reveal,
							t.audio?.finish,
							t.reveal?.sound
						]) e !== void 0 && so(n, e);
						await Promise.all([
							x?.stop(),
							S?.stop(),
							C?.stop()
						]), await h(t, e, v), await v.updateStyle(t), u = t, w = t.reveal, T = w ? uo(d, w, t.textStyle, r) : Object.freeze([d]), E = w ? Math.min(1, T.length) : 1, N(), w?.layout === "RESERVED" && _(d, t), await l(d, t), g(t, e, v), await Promise.all([
							v.setLayerVisible("portraitBase", t.portrait !== void 0),
							v.setLayerVisible("portraitBlink", t.portrait?.blink !== void 0),
							v.setLayerVisible("portraitLipSync", !1),
							v.setLayerVisible("continueIndicator", !1)
						]);
						let i = k;
						k = "idle", await x?.start({ primed: !0 }), await I(i), await M(), F(), await m(u.audio?.voice);
					}), j;
				},
				setAnimationMode(e) {
					return A ? Promise.reject(new Q("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`)) : za.has(e) ? (j = j.then(() => I(e)), j) : Promise.reject(new Q("BUBBLE-COMPOSITION-001", "Bubble animation mode is invalid."));
				},
				revealNext() {
					if (A) return Promise.reject(new Q("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let e = !1;
					return j = j.then(async () => {
						e = await P(), e && F();
					}), j.then(() => e);
				},
				revealAll() {
					return A ? Promise.reject(new Q("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`)) : (j = j.then(async () => {
						if (N(), w) for (; await P(););
					}), j);
				},
				finish(e = {}) {
					if (A) return Promise.reject(new Q("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let t = e.timeoutSeconds ?? 0;
					return !Number.isFinite(t) || t < 0 ? Promise.reject(new Q("BUBBLE-COMPOSITION-001", "Bubble finish timeoutSeconds must be zero or greater.")) : e.condition !== void 0 && typeof e.condition != "function" ? Promise.reject(new Q("BUBBLE-COMPOSITION-001", "Bubble finish condition must be a function.")) : (j = j.then(async () => {
						if (N(), e.unit !== void 0 && (w = pa({
							...w ?? {},
							unit: e.unit
						}), T = uo(d, w, u.textStyle, r), E = Math.min(1, T.length), w.layout === "RESERVED" && v && _(d)), w) for (; await P(););
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
					}), j);
				},
				animate(e) {
					if (A) return Promise.reject(new Q("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${s.actorKey}`));
					let t;
					try {
						t = Ja(e, "Bubble motion");
					} catch (e) {
						return Promise.reject(e);
					}
					return j = j.then(async () => {
						if (t.name === "animateBubbleShape" && t.visualStyle) {
							let e = Object.freeze({
								...u,
								layoutProfile: "custom"
							}), n = Object.freeze({
								...e,
								visualStyle: t.visualStyle
							});
							u.layoutProfile === "scratch-default" && (await v?.updateStyle(e), await l(d, e), await v?.show()), await v?.animate?.(t), u = n, await v?.updateStyle(u);
							return;
						}
						await v?.animate?.(t);
					}), j;
				},
				async close() {
					if (A) return;
					A = !0;
					let e = [];
					N();
					try {
						await j;
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
					o.get(s.actorKey) === L && o.delete(s.actorKey), po(e, `Failed to close bubble: ${s.actorKey}`);
				}
			});
			return o.set(s.actorKey, L), F(), u.showAnimation !== void 0 && await L.animate(u.showAnimation), L;
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
			let t = Xa(e);
			a.set(t.name, t);
		},
		hasActiveBubble(e) {
			return o.has(Wa(e, "Bubble actor key"));
		},
		async show(e) {
			l();
			let t = ho(e);
			return u(t.actorKey, () => d(t));
		},
		releaseTarget(e) {
			l();
			let t = Wa(e, "Bubble actor key");
			return u(t, async () => {
				await o.get(t)?.close();
			});
		},
		async releaseAll() {
			l(), await Promise.allSettled([...s.values()]), po((await Promise.allSettled([...o.values()].map((e) => e.close()))).flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to release all bubbles");
		},
		async dispose() {
			if (c) return;
			c = !0, await Promise.allSettled([...s.values()]);
			let e = await Promise.allSettled([...o.values()].map((e) => e.close()));
			a.clear(), po(e.flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to dispose bubble composition");
		}
	});
}
//#endregion
//#region src/turbowarp-svg-text-adapter.ts
function _o(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function vo(e) {
	if (!_o(e) || typeof e.setText != "function" || typeof e.releaseTextActor != "function") throw TypeError("TurboWarp-SVG-Text adapter requires setText and releaseTextActor.");
	return e;
}
function yo(e) {
	if (!_o(e) || typeof e.setText != "function" || typeof e.releaseTarget != "function") throw TypeError("SVG Text composition adapter requires setText and releaseTarget.");
	return e;
}
function bo(e) {
	if (!_o(e) || typeof e.layoutText != "function") throw TypeError("SVG Text overlay adapter requires the layoutText composition API.");
	return e;
}
function xo(e, t) {
	let n = Number(e);
	if (!Number.isFinite(n)) throw TypeError(`${t} must be a finite number.`);
	return n;
}
function So(e) {
	if (!_o(e) || !_o(e.style) || !Array.isArray(e.lines)) throw TypeError("SVG Text layout result is invalid.");
	let t = e.style, n = t.alignment;
	if (n !== "left" && n !== "center" && n !== "right") throw TypeError("SVG Text layout alignment is invalid.");
	let r = xo(e.width, "SVG Text layout width"), i = xo(e.height, "SVG Text layout height"), a = Object.freeze(e.lines.map((e) => {
		if (!_o(e) || typeof e.text != "string") throw TypeError("SVG Text layout line is invalid.");
		return Object.freeze({
			baseline: xo(e.baseline, "SVG Text line baseline") - i / 2,
			text: e.text,
			x: xo(e.x, "SVG Text line x") - r / 2
		});
	}));
	return Object.freeze({
		alignment: n,
		backgroundColor: String(t.backgroundColor),
		backgroundCornerRadius: xo(t.cornerRadius, "SVG Text corner radius"),
		fill: String(t.textColor),
		fontFamily: String(t.font),
		fontSize: xo(t.fontSize, "SVG Text font size"),
		height: i,
		lineHeight: xo(t.lineHeight, "SVG Text line height"),
		lines: a,
		preserveWhitespace: e.preserveWhitespace !== !1,
		width: r
	});
}
function Co(e) {
	if (!_o(e) || !Array.isArray(e.lines)) throw TypeError("SVG Text rich layout result is invalid.");
	let { lines: t, ...n } = So({
		...e,
		lines: []
	}), r = n.width / 2, i = n.height / 2, a = (e, t) => {
		if (!_o(e) || typeof e.text != "string") throw TypeError(`SVG Text ruby ${t} is invalid.`);
		return Object.freeze({
			baseline: xo(e.baseline, `SVG Text ruby ${t} baseline`) - i,
			fontSize: xo(e.fontSize, `SVG Text ruby ${t} font size`),
			text: e.text,
			x: xo(e.x, `SVG Text ruby ${t} x`) - r
		});
	}, o = (e) => {
		if (!_o(e)) throw TypeError("SVG Text rich layout fragment is invalid.");
		if (e.type === "ruby") return Object.freeze({
			base: a(e.base, "base"),
			reading: a(e.reading, "reading"),
			type: "ruby"
		});
		if (e.type !== "text" || typeof e.text != "string") throw TypeError("SVG Text rich layout fragment is invalid.");
		return Object.freeze({
			baseline: xo(e.baseline, "SVG Text fragment baseline") - i,
			text: e.text,
			type: "text",
			x: xo(e.x, "SVG Text fragment x") - r
		});
	}, s = Object.freeze(e.lines.map((e) => {
		if (!_o(e) || !Array.isArray(e.fragments)) throw TypeError("SVG Text rich layout line is invalid.");
		return Object.freeze({ fragments: Object.freeze(e.fragments.map(o)) });
	}));
	return Object.freeze({
		...n,
		lines: s
	});
}
function wo(e) {
	let t = vo(e);
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
			if (typeof t.measureText != "function") throw Error("TurboWarp-SVG-Text does not provide text measurement.");
			return t.measureText(e, n);
		}
	});
}
function To(e) {
	let t = yo(e), n = {
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
	}) ?? 0), typeof t.setRichText == "function" && (n.setRichText = ({ maxWidth: e, runs: n, styleName: r, target: i }) => {
		t.setRichText?.({
			runs: n,
			styleName: r,
			target: i,
			...e === void 0 ? {} : { maxWidth: e }
		});
	}), typeof t.measureRichText == "function" && (n.measureRichText = ({ maxWidth: e, runs: n, styleName: r }) => t.measureRichText?.({
		runs: n,
		styleName: r,
		...e === void 0 ? {} : { maxWidth: e }
	}) ?? 0), Object.freeze(n);
}
function Eo(e) {
	let t = bo(e), n = {
		layoutText({ nativeSize: e, styleName: n, text: r }) {
			return So(t.layoutText({
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
			return Math.max(1, ...i.lines.map((e) => xo(e.width, "SVG Text line width")));
		}
	};
	return typeof t.layoutRichText == "function" && (n.layoutRichText = ({ maxWidth: e, nativeSize: n, runs: r, styleName: i }) => Co(t.layoutRichText?.({
		nativeSize: [n.width, n.height],
		runs: r,
		styleName: i,
		...e === void 0 ? {} : { maxWidth: e }
	}))), Object.freeze(n);
}
function Do(e) {
	if (!_o(e) || typeof e.getLayoutCapability != "function") throw TypeError("TurboWarp-SVG-Text overlay adapter requires SVG Text 0.8.1 getLayoutCapability().");
	return Eo(e.getLayoutCapability());
}
//#endregion
//#region src/asset-manager-image-adapter.ts
var Oo = /* @__PURE__ */ new Set([
	"image/avif",
	"image/gif",
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"image/webp"
]);
function ko(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Ao(e) {
	let t = e.split(";", 1)[0]?.trim().toLowerCase() ?? "";
	return t === "image/jpg" || t === "image/pjpeg" ? "image/jpeg" : t === "image/x-png" ? "image/png" : t;
}
function jo(e) {
	return Oo.has(Ao(e));
}
function Mo(e) {
	if (!ko(e) || typeof e.url != "string" || !e.url.startsWith("blob:") || typeof e.mimeType != "string" || !jo(e.mimeType) || typeof e.width != "number" || !Number.isFinite(e.width) || e.width <= 0 || typeof e.height != "number" || !Number.isFinite(e.height) || e.height <= 0 || typeof e.release != "function") throw TypeError("Asset Manager DOM image resources must provide a supported MIME type, positive intrinsic dimensions, a blob URL, and release().");
	return e;
}
function No(e) {
	if (!ko(e) || typeof e.isRegistered != "function" || typeof e.getMimeType != "function" || typeof e.resolveDOMImageResource != "function") throw TypeError("Asset Manager DOM image capability is invalid.");
	let t = e;
	return Object.freeze({
		isRegistered(e) {
			return t.isRegistered(e) && jo(t.getMimeType(e));
		},
		getMimeType(e) {
			return Ao(t.getMimeType(e));
		},
		async resolveImage(e) {
			let n = Ao(t.getMimeType(e));
			if (!t.isRegistered(e) || !jo(n)) throw TypeError("Asset Manager image is not registered with a Bubble-compatible MIME type.");
			let r = await t.resolveDOMImageResource(e);
			try {
				Mo(r);
				let e = Ao(r.mimeType);
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
function Po(e) {
	return Math.max(0, Math.min(1, e));
}
function Fo(e, t) {
	let n = Po(e);
	switch (t) {
		case "linear": return n;
		case "easeIn": return n * n;
		case "easeOut": return 1 - (1 - n) * (1 - n);
		case "easeInOut": return n < .5 ? 2 * n * n : 1 - (-2 * n + 2) ** 2 / 2;
		default: return n;
	}
}
function Io(e, t, n) {
	let r = Math.max(0, t * 1e3);
	return r === 0 ? (n(1), Promise.resolve()) : new Promise((t, i) => {
		let a = 0, o, s = () => {
			let c = Math.min(16, r - a);
			a += c;
			try {
				n(Po(a / r));
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
var Lo = "http://www.w3.org/2000/svg", Ro = "http://www.w3.org/XML/1998/namespace", zo = 96, Bo = 18, Vo = 8, Ho = 16, Uo = Symbol("BubbleSvgOverlayTextTarget"), Wo = Symbol("BubbleSvgOverlayImageTarget"), Go = 0, Ko = Object.freeze(["scratch-render", "svg-overlay"]), qo = "svg-overlay", Jo = "error";
function Yo(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Xo(e) {
	let t = e.getNativeSize(), n = Array.isArray(t) ? Number(t[0]) : NaN, r = Array.isArray(t) ? Number(t[1]) : NaN;
	return Object.freeze({
		width: n > 0 ? n : 480,
		height: r > 0 ? r : 360
	});
}
function Zo(e, t) {
	let n = Number(e);
	if (!Number.isFinite(n) || n <= 0) throw TypeError(`${t} must be a positive finite number.`);
	return n;
}
function Qo(e, t) {
	if (typeof e != "string" || e.length === 0 || e.length > 128) throw TypeError(`${t} must be a non-empty color string.`);
	if (/url\s*\(|[<>;]/iu.test(e)) throw TypeError(`${t} contains a disallowed SVG value.`);
	return e;
}
function $o(e) {
	if (typeof e != "string" || e.length === 0 || e.length > 256 || /url\s*\(|[<>{};]/iu.test(e)) throw TypeError("SVG overlay fontFamily is invalid.");
	return e;
}
function es(e) {
	if (!Yo(e) || !Array.isArray(e.lines)) throw TypeError("SVG overlay text layout is invalid.");
	let t = e.alignment;
	if (t !== "left" && t !== "center" && t !== "right") throw TypeError("SVG overlay text alignment is invalid.");
	let n = e.fontStyle;
	if (n !== void 0 && n !== "normal" && n !== "italic") throw TypeError("SVG overlay fontStyle is invalid.");
	let r = e.fontWeight;
	if (r !== void 0 && r !== "normal" && r !== "bold" && (!Number.isFinite(r) || Number(r) < 1 || Number(r) > 1e3)) throw TypeError("SVG overlay fontWeight is invalid.");
	let i = Object.freeze(e.lines.map((e) => {
		if (typeof e == "string") return e;
		if (!Yo(e) || typeof e.text != "string") throw TypeError("SVG overlay text lines must be strings or positioned line records.");
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
	})), a = e.backgroundColor === void 0 ? void 0 : Qo(e.backgroundColor, "SVG overlay backgroundColor"), o = e.backgroundCornerRadius === void 0 ? void 0 : Number(e.backgroundCornerRadius);
	if (o !== void 0 && (!Number.isFinite(o) || o < 0)) throw TypeError("SVG overlay backgroundCornerRadius must be a non-negative finite number.");
	let s = e.preserveWhitespace;
	if (s !== void 0 && typeof s != "boolean") throw TypeError("SVG overlay preserveWhitespace must be a boolean.");
	return Object.freeze({
		alignment: t,
		fill: Qo(e.fill, "SVG overlay text fill"),
		fontFamily: $o(e.fontFamily),
		fontSize: Zo(e.fontSize, "SVG overlay fontSize"),
		height: Zo(e.height, "SVG overlay text height"),
		lineHeight: Zo(e.lineHeight, "SVG overlay lineHeight"),
		lines: i,
		width: Zo(e.width, "SVG overlay text width"),
		...a === void 0 ? {} : { backgroundColor: a },
		...o === void 0 ? {} : { backgroundCornerRadius: o },
		...n === void 0 ? {} : { fontStyle: n },
		...r === void 0 ? {} : { fontWeight: r },
		...s === void 0 ? {} : { preserveWhitespace: s }
	});
}
function ts(e, t) {
	let n = Number(e);
	if (typeof e != "number" || !Number.isFinite(n)) throw TypeError(`${t} must be a finite number.`);
	return n;
}
function ns(e, t) {
	if (!Yo(e) || typeof e.text != "string") throw TypeError(`SVG overlay ruby ${t} is invalid.`);
	return Object.freeze({
		baseline: ts(e.baseline, `SVG overlay ruby ${t} baseline`),
		fontSize: Zo(e.fontSize, `SVG overlay ruby ${t} fontSize`),
		text: e.text,
		x: ts(e.x, `SVG overlay ruby ${t} x`)
	});
}
function rs(e) {
	if (!Yo(e)) throw TypeError("SVG overlay rich text fragment is invalid.");
	if (e.type === "text") {
		if (typeof e.text != "string") throw TypeError("SVG overlay rich text fragment text is invalid.");
		return Object.freeze({
			baseline: ts(e.baseline, "SVG overlay rich text fragment baseline"),
			text: e.text,
			type: "text",
			x: ts(e.x, "SVG overlay rich text fragment x")
		});
	}
	if (e.type === "ruby") return Object.freeze({
		base: ns(e.base, "base"),
		reading: ns(e.reading, "reading"),
		type: "ruby"
	});
	throw TypeError("SVG overlay rich text fragment type must be text or ruby.");
}
function is(e) {
	if (!Yo(e) || !Array.isArray(e.lines)) throw TypeError("SVG overlay rich text layout is invalid.");
	let { lines: t, ...n } = es({
		...e,
		lines: []
	}), r = Object.freeze(e.lines.map((e) => {
		if (!Yo(e) || !Array.isArray(e.fragments)) throw TypeError("SVG overlay rich text line is invalid.");
		return Object.freeze({ fragments: Object.freeze(e.fragments.map((e) => rs(e))) });
	}));
	return Object.freeze({
		...n,
		lines: r
	});
}
function as(e) {
	return e.kind === "rich" ? Object.freeze({
		kind: "rich",
		layout: is(e.layout)
	}) : Object.freeze({
		kind: "plain",
		layout: es(e.layout)
	});
}
function os(e, t) {
	let n = {
		width: 180,
		height: 48
	}, r, i, a, o = (t) => {
		if (t.backgroundColor === void 0 || t.backgroundColor === "transparent") return;
		let n = e.createElementNS(Lo, "rect");
		return n.setAttribute("x", String(-t.width / 2)), n.setAttribute("y", String(-t.height / 2)), n.setAttribute("width", String(t.width)), n.setAttribute("height", String(t.height)), n.setAttribute("fill", t.backgroundColor), t.backgroundCornerRadius !== void 0 && n.setAttribute("rx", String(t.backgroundCornerRadius)), n;
	}, s = (t, n) => {
		let r = e.createElementNS(Lo, "text");
		return r.setAttribute("text-anchor", n), r.setAttribute("fill", t.fill), r.setAttribute("font-family", t.fontFamily), r.setAttribute("font-size", String(t.fontSize)), t.preserveWhitespace !== !1 && r.setAttributeNS(Ro, "xml:space", "preserve"), t.fontStyle !== void 0 && r.setAttribute("font-style", t.fontStyle), t.fontWeight !== void 0 && r.setAttribute("font-weight", String(t.fontWeight)), r;
	}, c = (r) => {
		let i = [], a = o(r);
		a !== void 0 && i.push(a);
		let c = s(r, "start"), l = (t, n, r, i, a) => {
			let o = e.createElementNS(Lo, "tspan");
			o.setAttribute("x", String(n)), o.setAttribute("y", String(r)), i !== void 0 && o.setAttribute("font-size", String(i)), a !== void 0 && o.setAttribute("data-bubble-ruby", a), o.textContent = t, c.appendChild(o);
		};
		for (let e of r.lines) for (let t of e.fragments) {
			if (t.type === "text") {
				l(t.text, t.x, t.baseline);
				continue;
			}
			let { base: e, reading: n } = t;
			l(n.text, n.x, n.baseline, n.fontSize, "reading"), l(e.text, e.x, e.baseline, e.fontSize, "base");
		}
		i.push(c), t.replaceChildren(...i), n = {
			width: r.width,
			height: r.height
		};
	}, l = (r) => {
		let i = es(r), a = [], c = o(i);
		c !== void 0 && a.push(c);
		let l = i.alignment === "left" ? "start" : i.alignment === "right" ? "end" : "middle", u = i.alignment === "left" ? -i.width / 2 : i.alignment === "right" ? i.width / 2 : 0, d = s(i, l), f = -Math.max(i.fontSize, (i.lines.length - 1) * i.lineHeight + i.fontSize) / 2 + i.fontSize;
		i.lines.forEach((t, n) => {
			let r = e.createElementNS(Lo, "tspan"), a = typeof t == "string" ? void 0 : t;
			r.setAttribute("x", String(a?.x ?? u)), r.setAttribute("y", String(a?.baseline ?? f + n * i.lineHeight)), r.textContent = typeof t == "string" ? t : t.text, d.appendChild(r);
		}), a.push(d), t.replaceChildren(...a), n = {
			width: i.width,
			height: i.height
		};
	}, u = (e) => {
		if (e.kind === "rich") {
			c(is(e.layout));
			return;
		}
		l(e.layout);
	}, d = (e) => e === void 0 ? void 0 : () => ({
		kind: "plain",
		layout: e()
	});
	return Object.freeze({
		[Uo]: !0,
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
				let { layout: e } = as(i());
				a = {
					width: e.width,
					height: e.height
				};
			}
			r !== void 0 && u(r());
		},
		render(e, t) {
			r = d(t), l(e);
		},
		renderRich(e, t) {
			r = t === void 0 ? void 0 : () => ({
				kind: "rich",
				layout: t()
			}), c(is(e));
		}
	});
}
function ss(e) {
	let t = e;
	if (t?.[Uo] !== !0) throw TypeError("SVG overlay text target is invalid.");
	return t;
}
function cs(e, t) {
	if (!Yo(e) || typeof e.layoutText != "function") throw TypeError("SVG overlay backend requires a text layout capability.");
	let n = e, r = {
		setText({ styleName: e, target: r, text: i }) {
			let a = ss(r), o = () => n.layoutText({
				nativeSize: Xo(t),
				styleName: e,
				text: i
			});
			a.render(o(), o);
		},
		releaseTarget(e) {
			ss(e).clear();
		},
		measureText({ styleName: e, text: r }) {
			let i = Xo(t);
			return Zo(n.measureText?.({
				nativeSize: i,
				styleName: e,
				text: r
			}) ?? n.layoutText({
				nativeSize: i,
				styleName: e,
				text: r
			}).width, "SVG overlay measured text width");
		},
		setRichText({ maxWidth: e, runs: r, styleName: i, target: a }) {
			let o = ss(a), s = ls(n), c = () => s({
				nativeSize: Xo(t),
				runs: r,
				styleName: i,
				...e === void 0 ? {} : { maxWidth: e }
			});
			o.renderRich(c(), c);
		}
	};
	return typeof n.layoutRichText == "function" && (r.measureRichText = ({ maxWidth: e, runs: r, styleName: i }) => Zo(ls(n)({
		nativeSize: Xo(t),
		runs: r,
		styleName: i,
		...e === void 0 ? {} : { maxWidth: e }
	}).width, "SVG overlay measured rich text width")), Object.freeze(r);
}
function ls(e) {
	let t = e.layoutRichText;
	if (typeof t != "function") throw new Q("BUBBLE-COMPOSITION-007", "Bubble ruby content on the SVG overlay requires the overlay text capability layoutRichText method.");
	return (n) => t.call(e, n);
}
function us(e) {
	return !(/* @__PURE__ */ new Set([
		"image/avif",
		"image/gif",
		"image/jpeg",
		"image/png",
		"image/svg+xml",
		"image/webp"
	])).has(e.mimeType.toLowerCase()) || e.mimeType.toLowerCase() === "image/svg+xml" && e.svgSecurity !== "sanitized" ? !1 : e.src.startsWith("blob:") ? typeof e.release == "function" : /^data:image\/(?:avif|gif|jpeg|png|webp);base64,/iu.test(e.src);
}
async function ds(e) {
	await e?.release?.();
}
function fs(e, t, n) {
	let r = e.createElementNS(Lo, "image");
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
		[Wo]: !0,
		group: n,
		async applyResource(e) {
			let t = o + 1;
			o = t;
			try {
				if (Zo(e.width, "SVG overlay image width"), Zo(e.height, "SVG overlay image height"), typeof e.mimeType != "string" || !e.mimeType.startsWith("image/") || typeof e.src != "string" || !us(e)) throw TypeError("SVG overlay image resources must use a supported MIME type, a releasable blob URL or approved raster data URL, and sanitized SVG metadata when applicable.");
			} catch (t) {
				throw await ds(e), t;
			}
			if (t !== o) {
				await ds(e);
				return;
			}
			let n = i;
			i = e, r.setAttribute("href", e.src), await ds(n);
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
			i = void 0, r.removeAttribute("href"), await ds(e);
		},
		setDisplaySize(e) {
			a = e, s();
		},
		setVisible(e) {
			n.setAttribute("visibility", e ? "visible" : "hidden");
		}
	});
}
function ps(e) {
	let t = e;
	if (t?.[Wo] !== !0) throw TypeError("SVG overlay image target is invalid.");
	return t;
}
function ms(e) {
	if (!Yo(e) || typeof e.isRegistered != "function" || typeof e.getMimeType != "function" || typeof e.resolveImage != "function") throw TypeError("SVG overlay image capability is invalid.");
	let t = e;
	return Object.freeze({
		isRegistered(e) {
			return t.isRegistered(e);
		},
		getMimeType(e) {
			return t.getMimeType(e);
		},
		async applyToTarget(e, n) {
			await ps(n).applyResource(await t.resolveImage(e));
		}
	});
}
function hs(e, t) {
	let n = t.createElementNS(Lo, "svg");
	n.setAttribute("xmlns", Lo), n.setAttribute("aria-hidden", "true"), n.setAttribute("focusable", "false"), n.setAttribute("data-bubble-render-backend", "svg-overlay"), n.style.display = "block", n.style.overflow = "hidden", n.style.pointerEvents = "none";
	let r = /* @__PURE__ */ new Set(), i = !1, a = () => {
		let t = Xo(e);
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
function gs(e) {
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
function _s(e, t, n) {
	return n < t ? (t + n) / 2 : Math.min(n, Math.max(t, e));
}
function vs(e) {
	let t = Xe(e);
	return (Math.atan2(-t.x, -t.y) * 180 / Math.PI % 360 + 360) % 360;
}
var ys = /* @__PURE__ */ new Set([
	"circle",
	"g",
	"path",
	"rect",
	"text",
	"title"
]), bs = /* @__PURE__ */ new Set([
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
	"paint-order",
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
function xs(e, t) {
	let n = e.localName;
	if (!ys.has(n)) throw TypeError(`Bubble body SVG element is not allowed: ${n}`);
	let r = t.createElementNS(Lo, n);
	for (let t of e.getAttributeNames()) {
		if (!bs.has(t)) throw TypeError(`Bubble body SVG attribute is not allowed: ${t}`);
		let n = e.getAttribute(t) ?? "";
		if (/javascript:|url\s*\(/iu.test(n)) throw TypeError("Bubble body SVG contains an unsafe attribute value.");
		r.setAttribute(t, n);
	}
	(n === "title" || n === "text") && (r.textContent = e.textContent ?? "");
	for (let n of Array.from(e.children)) r.appendChild(xs(n, t));
	return r;
}
function Ss(e, t, n) {
	let r = n.defaultView?.DOMParser;
	if (!r) throw TypeError("SVG overlay backend requires DOMParser.");
	let i = new r().parseFromString(t, "image/svg+xml");
	if (i.querySelector("parsererror")) throw TypeError("Canonical Bubble body SVG could not be parsed.");
	let a = Array.from(i.documentElement.children).map((e) => xs(e, n));
	e.replaceChildren(...a);
}
function Cs(e, t, n = 1) {
	let r = e.getSize(), i = Math.min(t / r.width, t / r.height), a = {
		width: r.width * i * n,
		height: r.height * i * n
	};
	return e.setDisplaySize(a), a;
}
function ws(e, t, n, r, i, a) {
	let { document: o, renderer: s } = e, c = Go;
	Go += 1;
	let l = o.createElementNS(Lo, "g");
	l.setAttribute("data-bubble-surface", `${n}:${c}`);
	let u = o.createElementNS(Lo, "g");
	u.setAttribute("data-bubble-layer", "body"), l.appendChild(u);
	let d = (e) => {
		let t = o.createElementNS(Lo, "g");
		return t.setAttribute("data-bubble-layer", e), t.setAttribute("visibility", "hidden"), l.appendChild(t), t;
	}, f = fs(o, `bubble:${n}:${c}:portrait-base`, d("portrait-base")), p = fs(o, `bubble:${n}:${c}:portrait-blink`, d("portrait-blink")), m = fs(o, `bubble:${n}:${c}:portrait-lip-sync`, d("portrait-lip-sync")), h = d("text"), g = os(o, h), _ = fs(o, `bubble:${n}:${c}:continue-indicator`, d("continue-indicator")), v = Object.freeze({
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
	]), b = /* @__PURE__ */ new Map(), x = `bubble-portrait-clip-${c}`, S = o.createElementNS(Lo, "defs"), C = o.createElementNS(Lo, "clipPath"), w = o.createElementNS(Lo, "rect");
	C.setAttribute("id", x), C.appendChild(w), S.appendChild(C), l.insertBefore(S, u);
	let T = i, E = !1, D = !1, O = "", k = [0, 0], A = 1, j = 1, M = [0, 0], N, P, F = !1, I = (t = e.updateNativeSize()) => {
		let n = t.width / 2 + M[0], r = t.height / 2 - M[1], i = n + k[0], a = r - k[1];
		l.setAttribute("transform", `translate(${i} ${a}) scale(${A}) translate(${-n} ${-r})`), l.setAttribute("opacity", String(j));
	}, L = (e) => e === "continueIndicator" ? T.continueIndicator !== void 0 : e === "portraitBase" ? T.portrait !== void 0 : e === "portraitBlink" ? T.portrait?.blink !== void 0 : T.portrait?.lipSync !== void 0, R = (e) => {
		let n = T.placement.basis === "background" || t.visible !== !1, r = D && n && j > 0, i = T.layoutProfile === "scratch-default" && P !== void 0;
		l.setAttribute("visibility", r ? "visible" : "hidden"), u.setAttribute("visibility", r && (i || T.visualStyle !== "NO_BUBBLE") ? "visible" : "hidden"), h.setAttribute("visibility", r && !i ? "visible" : "hidden");
		for (let [e, t] of y) t.setVisible(r && L(e) && (b.get(e) ?? !1));
		I(e);
	}, z = () => {
		if (E) return;
		let n = e.updateNativeSize();
		if (T.layoutProfile === "scratch-default" && P !== void 0) {
			let e = ja(P), i = Ma({
				bounds: gs(t),
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
			a !== O && (Ss(u, La({
				kind: r,
				layout: P,
				pointsLeft: F,
				title: `${T.name} ${r} Bubble`
			}), o), O = a), u.setAttribute("data-bubble-style", "SCRATCH_DEFAULT"), u.setAttribute("data-bubble-profile", "scratch-default"), u.setAttribute("data-bubble-kind", r), u.setAttribute("data-bubble-body-width", String(e.width)), u.setAttribute("data-bubble-body-height", String(e.height)), u.setAttribute("transform", `translate(${n.width / 2 + i.left} ${n.height / 2 - i.top})`), R(n);
			return;
		}
		u.removeAttribute("data-bubble-profile"), u.removeAttribute("data-bubble-kind");
		let i = T.placement.basis === "actor" ? T.offset.scalePercent / 100 : 1, a = g.getCapturedSize() ?? g.getSize(), s = {
			width: a.width * i,
			height: a.height * i
		}, c = (T.portrait?.offset.zoomPercent ?? 100) / 100, l = T.portrait !== void 0, d = l ? Cs(f, zo * c, i) : {
			width: 0,
			height: 0
		};
		for (let e of [p, m]) l && Cs(e, zo * c, i);
		let v = Cs(_, Bo, i), y = d.width + (l ? Vo * i : 0) + s.width, b = Math.max(d.height, s.height), { width: S, height: C } = J({
			contentWidth: y / i,
			contentHeight: b / i,
			styles: [T.visualStyle, ...N === void 0 ? [] : [N.from, N.to]]
		}), D = Math.max(y, (S - 48) * i), k = Math.max(b, (C - 48) * i), A = -n.width / 2, j = n.width / 2, I = n.height / 2, L = -n.height / 2, z, B;
		if (T.placement.basis === "background") z = 0, B = T.placement.region === "HEADER_LIKE" ? I - Ho - k / 2 : T.placement.region === "FOOTER_LIKE" ? L + Ho + k / 2 : 0;
		else {
			let e = nt({
				bounds: gs(t),
				bubbleWidth: D,
				bubbleHeight: k,
				direction: T.placement.direction,
				distance: T.distance,
				tailLength: T.tailLength,
				offset: T.offset
			});
			z = e.x, B = e.y;
		}
		z = _s(z, A + D / 2, j - D / 2), B = _s(B, L + k / 2, I - k / 2), M = [z, B];
		let V = T.placement.basis === "actor" ? vs(T.placement.direction) : null, ee = T.placement.basis === "actor" ? [
			T.offset.x,
			T.offset.y,
			T.offset.scalePercent
		] : [
			0,
			0,
			100
		], H = V === null ? {
			x: 0,
			y: 0
		} : Ut({
			style: T.visualStyle,
			width: S,
			height: C,
			tailDirection: V,
			tailLength: T.tailLength,
			offset: ee
		}), U = gs(t), te = Number.isFinite(t.x) ? Number(t.x) : (U.left + U.right) / 2, ne = Number.isFinite(t.y) ? Number(t.y) : (U.bottom + U.top) / 2, re = V === null ? void 0 : {
			x: S / 2 + H.x + te - z,
			y: C / 2 + H.y + B - ne
		}, ie = JSON.stringify({
			baseBubbleHeight: C,
			baseBubbleWidth: S,
			bodyOffset: ee,
			shapeTransition: N,
			tailDirection: V,
			tailTarget: re,
			tailLength: T.tailLength,
			visualStyle: T.visualStyle
		});
		ie !== O && (Ss(u, Gt({
			style: T.visualStyle,
			lines: [],
			width: S,
			height: C,
			tailDirection: V,
			...re === void 0 ? {} : { tailTarget: re },
			tailLength: T.tailLength,
			offset: ee,
			title: `${T.name} Bubble body`,
			...N === void 0 ? {} : { shapeTransition: N }
		}), o), O = ie), u.setAttribute("data-bubble-style", T.visualStyle), u.setAttribute("data-bubble-body-width", String(S)), u.setAttribute("data-bubble-body-height", String(C)), N === void 0 ? (u.removeAttribute("data-bubble-shape-transition-from"), u.removeAttribute("data-bubble-shape-transition-to"), u.removeAttribute("data-bubble-shape-transition-progress")) : (u.setAttribute("data-bubble-shape-transition-from", N.from), u.setAttribute("data-bubble-shape-transition-to", N.to), u.setAttribute("data-bubble-shape-transition-progress", String(N.progress)));
		let ae = z - H.x, W = B + H.y;
		u.setAttribute("transform", `translate(${n.width / 2 + ae - S / 2} ${n.height / 2 - W - C / 2})`);
		let oe = z - y / 2, se = T.portrait?.placement ?? "left", ce = se.endsWith("right"), le = (T.portrait?.offset.x ?? 0) * i, ue = (T.portrait?.offset.y ?? 0) * i, de = (ce ? oe + s.width + Vo * i : oe) + d.width / 2 + le, fe = B;
		se.startsWith("top-") ? fe = B + b / 2 - d.height / 2 : se.startsWith("bottom-") && (fe = B - b / 2 + d.height / 2), fe += ue;
		let pe = (ce || !l ? oe : oe + d.width + Vo * i) + s.width / 2, me = (e, t) => `translate(${n.width / 2 + e} ${n.height / 2 - t})`;
		for (let e of [
			f,
			p,
			m
		]) e.group.setAttribute("transform", me(de, fe));
		h.setAttribute("transform", `${me(pe, B)} scale(${i})`);
		let he = pe + s.width / 2 - v.width / 2 - Vo * i, ge = B - s.height / 2 + v.height / 2 + Vo * i;
		_.group.setAttribute("transform", me(he, ge));
		let _e = Math.min(T.portrait?.cornerRadius ?? 0, d.width / 2, d.height / 2);
		w.setAttribute("x", String(-d.width / 2)), w.setAttribute("y", String(-d.height / 2)), w.setAttribute("width", String(d.width)), w.setAttribute("height", String(d.height)), w.setAttribute("rx", String(_e));
		for (let e of [
			f,
			p,
			m
		]) _e > 0 ? e.group.setAttribute("clip-path", `url(#${x})`) : e.group.removeAttribute("clip-path");
		R(n);
	}, B = t.onTargetVisualChange, V = (e) => {
		B?.(e), z();
	}, ee = () => {
		g.refresh(), z();
	};
	return e.acquire(l), T.placement.basis === "actor" && (t.onTargetVisualChange = V), s.on?.("NativeSizeChanged", ee), Object.freeze({
		targets: v,
		setLayerVisible(e, t) {
			E || (b.set(e, t), R());
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
			r && !i ? t.onTargetVisualChange === V && (t.onTargetVisualChange = B ?? null) : !r && i && (t.onTargetVisualChange = V), z();
		},
		captureTextLayout() {
			E || (g.captureLayout(), z());
		},
		clearTextLayout() {
			g.clearCapturedLayout(), z();
		},
		renderScratchText(e) {
			E || (P = e, O = "", z());
		},
		async animate(e) {
			if (E) return;
			let t = Math.max(0, e.durationSeconds ?? 0), n = () => {
				E || R();
			}, r = (t) => Fo(t, e.ease ?? "easeInOut");
			if (e.name === "fadeIn" || e.name === "floatIn" || e.name === "zoomIn" || e.name === "riseUp") {
				D = !0;
				let i = e.name === "floatIn" || e.name === "riseUp" ? [0, 16] : [0, 0], o = e.name === "zoomIn" ? .01 : 1;
				k = i, A = o, j = e.name === "fadeIn" ? 0 : 1, n(), await Io(a, t, (t) => {
					let a = r(t);
					k = [i[0] * (1 - a), i[1] * (1 - a)], A = o + (1 - o) * a, j = e.name === "fadeIn" ? a : 1, n();
				}), k = [0, 0], A = 1, j = 1, z();
				return;
			}
			if (e.name === "fadeOut" || e.name === "floatOut" || e.name === "zoomOut" || e.name === "sink") {
				let i = e.name === "floatOut" || e.name === "sink" ? [0, -16] : [0, 0], o = e.name === "zoomOut" ? .01 : 1;
				await Io(a, t, (t) => {
					let a = r(t);
					k = [i[0] * a, i[1] * a], A = 1 + (o - 1) * a, j = e.name === "fadeOut" ? 1 - a : 1, n();
				}), D = !1, R(), k = [0, 0], A = 1, j = 1;
				return;
			}
			if (e.name === "shake") {
				let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .08, s = Xe(typeof e.direction == "number" ? e.direction : e.direction ?? "right");
				await Io(a, o, (e) => {
					let t = Math.sin(r(e) * i * Math.PI * 2) * 5;
					k = [s.x * t, s.y * t], n();
				}), k = [0, 0], z();
				return;
			}
			if (e.name === "explode") {
				let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .12, s = e.relativeScale ?? 1.15;
				await Io(a, o, (e) => {
					let t = Math.abs(Math.sin(r(e) * i * Math.PI));
					A = 1 + (s - 1) * t, n();
				}), A = 1, z();
				return;
			}
			if (e.name === "animateBubbleShape") {
				let n = e.visualStyle ?? T.visualStyle, r = T.visualStyle, i = e.speed === void 0 ? 1 : Math.max(0, e.speed);
				N = {
					from: r,
					to: n,
					progress: 0
				}, z(), await Io(a, t, (a) => {
					let o = t === 0 ? 1 : Po(a * Math.max(i, 1));
					N = {
						from: r,
						to: n,
						progress: Fo(o, e.ease ?? "easeInOut")
					}, O = "", z();
				}), N = void 0, O = "", z();
			}
		},
		show() {
			E || (D = !0, z());
		},
		hide() {
			E || (D = !1, R());
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
				t.onTargetVisualChange === V && (t.onTargetVisualChange = B ?? null);
			}), r(() => s.off?.("NativeSizeChanged", ee)), r(() => e.release(l)), r(() => g.clear());
			let i = await Promise.allSettled([...y.values()].map((e) => e.release()));
			if (n.push(...i.flatMap((e) => e.status === "rejected" ? [e.reason] : [])), n.length === 1) throw n[0];
			if (n.length > 1) throw AggregateError(n, "Failed to dispose SVG overlay Bubble surface.");
		}
	});
}
//#endregion
//#region src/turbowarp-adapter.ts
var Ts = "sprite", Es = 96, Ds = 18, Os = 8, ks = 16, As = 0, $ = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleRuntimeAdapterError", this.code = e;
	}
};
function js(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Ms(e) {
	if (!js(e)) throw new $("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp renderer.");
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
function Ns(e) {
	let t = e ?? "svg-overlay";
	if (t !== "scratch-render" && t !== "svg-overlay") throw new $("BUBBLE-RUNTIME-004", "Bubble bubbleRenderBackend must be scratch-render or svg-overlay.");
	return t;
}
function Ps(e) {
	let t = e ?? "error";
	if (t !== "error" && t !== "fallback") throw new $("BUBBLE-RUNTIME-004", "Bubble svgOverlayUnsupportedBehavior must be error or fallback.");
	return t;
}
function Fs(e) {
	let t = e ?? (globalThis.document === void 0 ? void 0 : globalThis.document);
	if (t !== void 0) {
		if (!js(t) || typeof t.createElementNS != "function") throw new $("BUBBLE-RUNTIME-004", "Bubble SVG overlay document must provide createElementNS().");
		return t;
	}
}
function Is(e, t, n) {
	if (typeof e.addOverlay != "function" || typeof e.removeOverlay != "function") return "the renderer does not provide addOverlay() and removeOverlay()";
	if (t === void 0) return "the host does not provide a DOM document";
	if (typeof t.defaultView?.DOMParser != "function") return "the host document does not provide DOMParser";
	if (!js(n) || typeof n.layoutText != "function") return "a host-neutral svgOverlayTextCapability is not available";
}
function Ls() {
	let e = ze(), t = /* @__PURE__ */ new Set(), n = (n) => {
		e.defineStyle({
			name: n,
			backgroundColor: "transparent"
		}), t.add(n);
	};
	return n("default"), Eo(Object.freeze({
		layoutText(r) {
			return t.has(r.styleName) || n(r.styleName), e.layoutText(r);
		},
		layoutRichText(r) {
			return t.has(r.styleName) || n(r.styleName), e.layoutRichText(r);
		}
	}));
}
function Rs(e) {
	let t = Be({ runtime: e }), n = /* @__PURE__ */ new Set(), r = (e) => {
		t.defineStyle({
			name: e,
			backgroundColor: "transparent"
		}), n.add(e);
	}, i = (e) => {
		n.has(e) || r(e);
	};
	return r("default"), To(Object.freeze({
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
function zs(e) {
	if (!js(e) || typeof e.isLoaded != "function" || typeof e.getAssetMimeType != "function" || typeof e.resolveSkin != "function") throw new $("BUBBLE-RUNTIME-002", "Bubble image assets require an imageResolver capability. Load @kubohiroya/turbowarp-asset-cache or provide options.imageResolver before using image features.");
	return e;
}
function Bs(e) {
	if (!js(e) || typeof e.getDOMImageCapability != "function") throw new $("BUBBLE-RUNTIME-002", "Bubble SVG overlay image assets require @kubohiroya/turbowarp-asset-cache 0.1.0 or a host-provided options.svgOverlayImageCapability.");
	let t = e.getDOMImageCapability();
	if (!js(t) || typeof t.isRegistered != "function" || typeof t.getMimeType != "function" || typeof t.resolveDOMImageResource != "function") throw new $("BUBBLE-RUNTIME-002", "Asset Manager did not provide a valid DOM image capability.");
	return t;
}
function Vs(e) {
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
function Hs(e, t, n) {
	let r = e.getCurrentSkinSize(t.drawableID);
	if (!Array.isArray(r) || r.length < 2) return n;
	let i = Number(r[0]), a = Number(r[1]);
	return !(i > 0) || !(a > 0) ? n : {
		width: i,
		height: a
	};
}
function Us(e, t, n, r = 1) {
	let i = Hs(e, t, {
		width: n,
		height: n
	}), a = Math.min(n / i.width, n / i.height) * r;
	return e.updateDrawableScale(t.drawableID, [a * 100, a * 100]), {
		width: i.width * a,
		height: i.height * a,
		scalePercent: a * 100
	};
}
function Ws(e, t, n) {
	let r = Math.min(n, e / 2, t / 2), i = e - r, a = t - r;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${t}" viewBox="0 0 ${e} ${t}">
  <path d="M0 0H${e}V${t}H0Z M${r} 0H${i}A${r} ${r} 0 0 1 ${e} ${r}V${a}A${r} ${r} 0 0 1 ${i} ${t}H${r}A${r} ${r} 0 0 1 0 ${a}V${r}A${r} ${r} 0 0 1 ${r} 0Z" fill="#fff4cc" fill-rule="evenodd" data-bubble-portrait-corner-radius="${r}"/>
</svg>`;
}
function Gs(e, t, n) {
	return n < t ? (t + n) / 2 : Math.min(n, Math.max(t, e));
}
function Ks(e) {
	let t = e.getNativeSize(), n = Array.isArray(t) ? Number(t[0]) : 0, r = Array.isArray(t) ? Number(t[1]) : 0;
	return {
		width: Number.isFinite(n) && n > 0 ? n : 480,
		height: Number.isFinite(r) && r > 0 ? r : 360
	};
}
function qs(e, t, n, r, i) {
	let a = t + r * 2, o = n + i * 2;
	return e.replace(/<svg\b[^>]*>/u, (e) => e.replace(/\bwidth="[^"]*"/u, `width="${a}"`).replace(/\bheight="[^"]*"/u, `height="${o}"`).replace(/\bviewBox="[^"]*"/u, `viewBox="${-r} ${-i} ${a} ${o}"`));
}
function Js(e) {
	let t = Xe(e);
	return (Math.atan2(-t.x, -t.y) * 180 / Math.PI % 360 + 360) % 360;
}
function Ys(e, t, n, r, i, a) {
	let o = e.renderer, s = As;
	As += 1;
	let c = [], l, u, d = (e) => {
		let t = o.createDrawable(Ts);
		if (!Number.isInteger(t) || t < 0) throw new $("BUBBLE-RUNTIME-001", `TurboWarp did not create the Bubble ${e} drawable.`);
		let r = Object.freeze({
			id: `bubble:${n}:${s}:${e}`,
			isStage: !1,
			drawableID: t
		});
		return c.push(r), o.updateDrawableVisible(t, !1), o.setDrawableOrder?.(t, Infinity, Ts), r;
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
				let e = o.getNativeSize(), i = Array.isArray(e) && Number(e[0]) > 0 ? Number(e[0]) : 480, a = Array.isArray(e) && Number(e[1]) > 0 ? Number(e[1]) : 360, s = ja(M), c = Ma({
					bounds: Vs(t),
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
					let e = o.createSVGSkin(La({
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
			let e = w.placement.basis === "actor" ? w.offset.scalePercent / 100 : 1, i = T ?? Hs(o, h, {
				width: 180,
				height: 48
			});
			o.updateDrawableScale(h.drawableID, [e * 100, e * 100]);
			let a = {
				width: i.width * e,
				height: i.height * e
			}, c = Es * ((w.portrait?.offset.zoomPercent ?? 100) / 100), d = s !== void 0 && w.portrait !== void 0, _ = d ? Us(o, s, c, e) : {
				width: 0,
				height: 0,
				scalePercent: 0
			}, v = /* @__PURE__ */ new Map();
			d && v.set(s.drawableID, _.scalePercent);
			for (let t of [f, p]) if (t && d) {
				let n = Us(o, t, c, e);
				v.set(t.drawableID, n.scalePercent);
			}
			let y = g ? Us(o, g, Ds, e) : {
				width: 0,
				height: 0,
				scalePercent: 0
			}, b = _.width + (d ? Os * e : 0) + a.width, O = Math.max(_.height, a.height), { width: k, height: A } = J({
				contentWidth: b / e,
				contentHeight: O / e,
				styles: [w.visualStyle, ...j === void 0 ? [] : [j.from, j.to]]
			}), I = Math.max(b, (k - 48) * e), L = Math.max(O, (A - 48) * e), R = o.getNativeSize(), z = Array.isArray(R) && Number(R[0]) > 0 ? Number(R[0]) : 480, B = Array.isArray(R) && Number(R[1]) > 0 ? Number(R[1]) : 360, V = -z / 2, ee = z / 2, H = B / 2, U = -B / 2, te = V + I / 2, ne = ee - I / 2, re = U + L / 2, ie = H - L / 2, ae, W;
			if (w.placement.basis === "background") ae = 0, W = w.placement.region === "HEADER_LIKE" ? H - ks - L / 2 : w.placement.region === "FOOTER_LIKE" ? U + ks + L / 2 : 0;
			else {
				let e = nt({
					bounds: Vs(t),
					bubbleWidth: I,
					bubbleHeight: L,
					direction: w.placement.direction,
					distance: w.distance,
					tailLength: w.tailLength,
					offset: w.offset
				});
				ae = e.x, W = e.y;
			}
			ae = Gs(ae, te, ne), W = Gs(W, re, ie);
			let oe = w.placement.basis === "actor" ? Js(w.placement.direction) : null, se = w.placement.basis === "actor" ? [
				w.offset.x,
				w.offset.y,
				w.offset.scalePercent
			] : [
				0,
				0,
				100
			], ce = oe === null ? {
				x: 0,
				y: 0
			} : Ut({
				style: w.visualStyle,
				width: k,
				height: A,
				tailDirection: oe,
				tailLength: w.tailLength,
				offset: se
			}), le = Vs(t), ue = Number.isFinite(t.x) ? Number(t.x) : (le.left + le.right) / 2, de = Number.isFinite(t.y) ? Number(t.y) : (le.bottom + le.top) / 2, fe = oe === null ? void 0 : {
				x: k / 2 + ce.x + ue - ae,
				y: A / 2 + ce.y + W - de
			}, pe = Math.abs(se[0]) + k * Math.abs(e - 1) + Math.max(0, w.tailLength - 18) + 8, me = Math.abs(se[1]) + A * Math.abs(e - 1) + Math.max(0, w.tailLength - 18) + 8, he = JSON.stringify({
				baseBubbleHeight: A,
				baseBubbleWidth: k,
				bodyOffset: se,
				tailDirection: oe,
				tailTarget: fe,
				tailLength: w.tailLength,
				viewportExtraX: pe,
				viewportExtraY: me,
				visualStyle: w.visualStyle,
				shapeTransition: j
			});
			if (he !== S) {
				let e = qs(Gt({
					style: w.visualStyle,
					lines: [],
					width: k,
					height: A,
					tailDirection: oe,
					...fe === void 0 ? {} : { tailTarget: fe },
					tailLength: w.tailLength,
					offset: se,
					title: `${w.name} Bubble body`,
					...j === void 0 ? {} : { shapeTransition: j }
				}), k, A, pe, me), t = o.createSVGSkin(e);
				if (!Number.isInteger(t) || t < 0) throw new $("BUBBLE-RUNTIME-001", "TurboWarp did not create the Bubble body SVG skin.");
				try {
					o.updateDrawableSkinId(n.drawableID, t);
				} catch (e) {
					throw o.destroySkin(t), e;
				}
				let r = l;
				l = t, S = he, r !== void 0 && o.destroySkin(r);
			}
			o.updateDrawableScale(n.drawableID, [100, 100]), o.updateDrawablePosition(n.drawableID, [ae - ce.x, W + ce.y]);
			let ge = ae - b / 2, _e = w.portrait?.placement ?? "left", ve = _e.endsWith("right"), ye = (w.portrait?.offset.x ?? 0) * e, be = (w.portrait?.offset.y ?? 0) * e, xe = (ve ? ge + a.width + Os * e : ge) + _.width / 2 + ye, Se = W;
			_e.startsWith("top-") ? Se = W + O / 2 - _.height / 2 : _e.startsWith("bottom-") && (Se = W - O / 2 + _.height / 2), Se += be;
			let G = (ve || !d ? ge : ge + _.width + Os * e) + a.width / 2;
			for (let e of [
				s,
				f,
				p
			]) e && o.updateDrawablePosition(e.drawableID, [xe, Se]);
			if (m) {
				let t = _.width / e, n = _.height / e, r = Math.min(w.portrait?.cornerRadius ?? 0, t / 2, n / 2), i = r > 0 ? JSON.stringify({
					maskHeight: n,
					maskWidth: t,
					radius: r
				}) : "";
				if (i !== C) {
					let e = u;
					if (u = void 0, C = i, r > 0) {
						let e = o.createSVGSkin(Ws(t, n, r));
						if (!Number.isInteger(e) || e < 0) throw new $("BUBBLE-RUNTIME-001", "TurboWarp did not create the Bubble portrait corner mask SVG skin.");
						try {
							o.updateDrawableSkinId(m.drawableID, e), u = e;
						} catch (t) {
							throw o.destroySkin(e), t;
						}
					}
					e !== void 0 && o.destroySkin(e);
				}
				o.updateDrawablePosition(m.drawableID, [xe, Se]);
			}
			o.updateDrawablePosition(h.drawableID, [G, W]), g && o.updateDrawablePosition(g.drawableID, [G + a.width / 2 - y.width / 2 - Os * e, W - a.height / 2 + y.height / 2 + Os * e]);
			let K = (e, t) => {
				e && E.set(e.drawableID, t);
			};
			K(n, [ae - ce.x, W + ce.y]), K(h, [G, W]), K(s, [xe, Se]), K(f, [xe, Se]), K(p, [xe, Se]), K(m, [xe, Se]), D.set(n.drawableID, [100, 100]), D.set(h.drawableID, [e * 100, e * 100]);
			for (let e of [
				s,
				f,
				p
			]) {
				if (!e) continue;
				let t = v.get(e.drawableID) ?? 0;
				D.set(e.drawableID, [t, t]);
			}
			m && D.set(m.drawableID, [e * 100, e * 100]), g && D.set(g.drawableID, [y.scalePercent, y.scalePercent]), g && K(g, [G + a.width / 2 - y.width / 2 - Os * e, W - a.height / 2 + y.height / 2 + Os * e]), P(), F();
		}, L = t.onTargetVisualChange, R = (e) => {
			L?.(e), I();
		}, z = () => I();
		return w.placement.basis === "actor" && (t.onTargetVisualChange = R), o.on?.("NativeSizeChanged", z), Object.freeze({
			targets: _,
			setLayerVisible(e, t) {
				x || (y.set(e, t), F());
			},
			updateStyle(e) {
				if (x) return;
				let n = w.placement.basis === "actor";
				w = e, O = [0, 0], k = 1, A = 1, j = void 0, e.reveal?.layout !== "RESERVED" && (T = void 0);
				let r = w.placement.basis === "actor";
				n && !r ? t.onTargetVisualChange === R && (t.onTargetVisualChange = L ?? null) : !n && r && (t.onTargetVisualChange = R), I();
			},
			captureTextLayout() {
				x || (T = Hs(o, h, {
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
				}, r = (t) => Fo(t, e.ease ?? "easeInOut");
				if (e.name === "fadeIn" || e.name === "floatIn" || e.name === "zoomIn" || e.name === "riseUp") {
					b = !0;
					let i = e.name === "floatIn" || e.name === "riseUp" ? [0, 16] : [0, 0], o = e.name === "zoomIn" ? .01 : 1;
					O = i, k = o, A = e.name === "fadeIn" ? 0 : 1, n(), await Io(a, t, (t) => {
						let a = r(t);
						O = [i[0] * (1 - a), i[1] * (1 - a)], k = o + (1 - o) * a, A = e.name === "fadeIn" ? a : 1, n();
					}), O = [0, 0], k = 1, A = 1, I();
					return;
				}
				if (e.name === "fadeOut" || e.name === "floatOut" || e.name === "zoomOut" || e.name === "sink") {
					let i = e.name === "floatOut" || e.name === "sink" ? [0, -16] : [0, 0], o = e.name === "zoomOut" ? .01 : 1;
					O = [0, 0], k = 1, A = 1, n(), await Io(a, t, (t) => {
						let a = r(t);
						O = [i[0] * a, i[1] * a], k = 1 + (o - 1) * a, A = e.name === "fadeOut" ? 1 - a : 1, n();
					}), O = i, k = o, A = e.name === "fadeOut" ? 0 : 1, n(), b = !1, F(), O = [0, 0], k = 1, A = 1;
					return;
				}
				if (e.name === "shake") {
					let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .08, s = Xe(typeof e.direction == "number" ? e.direction : e.direction ?? "right") ?? Xe("right");
					O = [0, 0], await Io(a, o, (e) => {
						let t = r(e) * i * Math.PI * 2, a = Math.sin(t) * 5;
						O = [s.x * a, s.y * a], n();
					}), O = [0, 0], I();
					return;
				}
				if (e.name === "explode") {
					let i = Math.max(1, Math.floor(e.count ?? 1)), o = t > 0 ? t : i * .12, s = e.relativeScale ?? 1.15;
					await Io(a, o, (e) => {
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
					}, I(), await Io(a, t, (a) => {
						let o = t === 0 ? 1 : Po(a * Math.max(i, 1) / 1);
						j = {
							from: r,
							to: n,
							progress: Fo(o, e.ease ?? "easeInOut")
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
					x = !0, o.off?.("NativeSizeChanged", z), w.placement.basis === "actor" && t.onTargetVisualChange === R && (t.onTargetVisualChange = L ?? null);
					for (let e of [...c].reverse()) o.destroyDrawable(e.drawableID, Ts);
					l !== void 0 && (o.destroySkin(l), l = void 0), u !== void 0 && (o.destroySkin(u), u = void 0), e.requestRedraw?.();
				}
			}
		});
	} catch (e) {
		for (let e of [...c].reverse()) o.destroyDrawable(e.drawableID, Ts);
		throw l !== void 0 && o.destroySkin(l), u !== void 0 && o.destroySkin(u), e;
	}
}
function Xs(e, t = {}) {
	if (!js(e)) throw new $("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp runtime.");
	let n = e, r = Ms(n.renderer), i = Ns(t.bubbleRenderBackend), a, o;
	if (i === "svg-overlay") {
		if (t.svgOverlayTextCapability !== void 0) a = t.svgOverlayTextCapability;
		else if (n.ext_kubohiroyasvgtext === void 0) a = Ls();
		else try {
			a = Do(n.ext_kubohiroyasvgtext);
		} catch (e) {
			o = e instanceof Error ? e.message : String(e);
		}
	}
	let s = Ps(t.svgOverlayUnsupportedBehavior), c = i === "svg-overlay" ? Fs(t.document) : void 0, l = i === "svg-overlay" ? o ?? Is(r, c, a) : void 0;
	if (i === "svg-overlay" && l !== void 0 && s === "error") throw new $("BUBBLE-RUNTIME-004", `Bubble SVG overlay backend is unavailable because ${l}. Use scratch-render or install the required public upstream capability.`);
	let u = i === "svg-overlay" && l === void 0 ? "svg-overlay" : "scratch-render", d = t.scheduler ?? {
		setTimeout: (e, t) => globalThis.setTimeout(e, t),
		clearTimeout: (e) => globalThis.clearTimeout(e)
	}, f = () => n.ext_kubohiroyaassetcache ?? n.ext_kubohiroyaassetmanager, p = () => zs(f()), m, h = () => (m ??= Bs(f()), m), g;
	if (u === "svg-overlay") try {
		g = cs(a, r);
	} catch (e) {
		throw new $("BUBBLE-RUNTIME-004", `Bubble SVG overlay text capability is invalid: ${e instanceof Error ? e.message : String(e)}`);
	}
	else if (t.textCapability !== void 0) g = t.textCapability;
	else try {
		g = n.ext_kubohiroyasvgtext === void 0 ? Rs(n) : wo(n.ext_kubohiroyasvgtext);
		let e = n.ext_kubohiroyasvgtext;
		if (js(e) && typeof e.measureText != "function") {
			if (typeof e.getLayoutCapability == "function") {
				let t = Do(e);
				g = {
					...g,
					measureText({ styleName: e, text: n }) {
						let i = Ks(r);
						return t.measureText?.({
							nativeSize: i,
							styleName: e,
							text: n
						}) ?? t.layoutText({
							nativeSize: i,
							styleName: e,
							text: n
						}).width;
					}
				};
			} else g = {
				setText: g.setText,
				releaseTarget: g.releaseTarget
			};
		}
	} catch (e) {
		throw new $("BUBBLE-RUNTIME-003", `Bubble could not initialize the scratch-render text provider: ${e instanceof Error ? e.message : String(e)}`);
	}
	let _;
	if (u === "svg-overlay") try {
		_ = ms(t.svgOverlayImageCapability ?? No(Object.freeze({
			isRegistered(e) {
				return h().isRegistered(e);
			},
			getMimeType(e) {
				return h().getMimeType(e);
			},
			resolveDOMImageResource(e) {
				return h().resolveDOMImageResource(e);
			}
		})));
	} catch (e) {
		throw new $("BUBBLE-RUNTIME-004", `Bubble SVG overlay image capability is invalid: ${e instanceof Error ? e.message : String(e)}`);
	}
	else _ = t.imageResolver ?? {
		isRegistered(e) {
			return p().isLoaded({ NAME: e });
		},
		getMimeType(e) {
			return p().getAssetMimeType({ NAME: e });
		},
		async applyToTarget(e, t) {
			let i = t.drawableID;
			if (!Number.isInteger(i) || i < 0) throw new $("BUBBLE-RUNTIME-001", "Bubble image target drawable is invalid.");
			let a = await p().resolveSkin(e);
			if (!js(a) || !Number.isInteger(a.skinId) || a.skinId < 0) throw new $("BUBBLE-RUNTIME-002", `Asset Manager did not resolve an image skin: ${String(e)}`);
			r.updateDrawableSkinId(i, a.skinId), n.requestRedraw?.();
		}
	};
	let v = t.audio ?? {
		isRegistered(e) {
			return p().isLoaded({ NAME: e });
		},
		getMimeType(e) {
			return p().getAssetMimeType({ NAME: e });
		},
		async playSound(e, t = {}) {
			let n = p(), r = t.untilDone ? n?.playSoundUntilDone : n?.playSound;
			if (typeof r != "function") throw new $("BUBBLE-RUNTIME-002", "TurboWarp-Asset-Manager does not provide audio playback.");
			await r.call(n, { NAME: e });
		}
	}, y = u === "svg-overlay" ? hs(r, c) : void 0;
	return go({
		..._ === void 0 ? {} : { imageResolver: _ },
		audio: v,
		textCapability: g,
		...typeof g.measureText == "function" ? { getMaxTextWidth(e) {
			let t = Ks(r).width, n = e.placement.basis === "actor" ? e.offset.scalePercent / 100 : 1, i = e.portrait === void 0 ? 0 : Es * (e.portrait.offset.zoomPercent / 100) + Os;
			return Math.max(1, (t - 32) / n - 48 - i);
		} } : {},
		createSurface({ actor: e, actorKey: t, kind: r, style: i }) {
			if (!js(e) || typeof e.id != "string") throw new $("BUBBLE-RUNTIME-001", "Bubble actor target is invalid.");
			return u === "svg-overlay" ? ws(y, e, t, r, i, d) : Ys(n, e, t, r, i, d);
		},
		...t.scheduler === void 0 ? {} : { scheduler: t.scheduler },
		...t.onAnimationError === void 0 ? {} : { onAnimationError: t.onAnimationError }
	});
}
//#endregion
export { $ as BubbleRuntimeAdapterError, Ko as bubbleRenderBackends, No as createAssetManagerSvgOverlayImageCapability, ms as createSvgOverlayImageAdapter, ws as createSvgOverlaySurface, hs as createSvgOverlaySurfaceManager, cs as createSvgOverlayTextAdapter, To as createSvgTextCompositionCapability, Eo as createSvgTextOverlayTextCapability, Xs as createTurboWarpBubbleComposition, wo as createTurboWarpSvgTextCapability, Do as createTurboWarpSvgTextOverlayTextCapability, Jo as defaultBubbleOverlayUnsupportedBehavior, qo as defaultBubbleRenderBackend };
