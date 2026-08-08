//#region src/composition.ts
var e = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleCompositionError", this.code = e;
	}
}, t = /* @__PURE__ */ new Set(["say", "think"]), n = /* @__PURE__ */ new Set([
	"idle",
	"speaking",
	"waiting"
]);
function r(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function i(t, n, r, i) {
	let a = /* @__PURE__ */ new Set([...n, ...r]), o = n.filter((e) => !Object.prototype.hasOwnProperty.call(t, e)), s = Object.keys(t).filter((e) => !a.has(e));
	if (o.length > 0 || s.length > 0) throw new e("BUBBLE-COMPOSITION-001", `${i} has missing or unknown properties.`);
}
function a(t, n) {
	if (typeof t != "string" || t.trim().length === 0) throw new e("BUBBLE-COMPOSITION-001", `${n} must be a non-empty string.`);
	return t.trim();
}
function o(t, n, o) {
	if (!r(t)) throw new e("BUBBLE-COMPOSITION-001", `${n} must be an object.`);
	if (i(t, ["frames", "frameIntervalSeconds"], [], n), !Array.isArray(t.frames) || t.frames.length < o) throw new e("BUBBLE-COMPOSITION-001", `${n}.frames must contain at least ${o} image asset name${o === 1 ? "" : "s"}.`);
	let s = Object.freeze(t.frames.map((e, t) => a(e, `${n}.frames[${t}]`))), c = t.frameIntervalSeconds;
	if (typeof c != "number" || !Number.isFinite(c) || c <= 0) throw new e("BUBBLE-COMPOSITION-001", `${n}.frameIntervalSeconds must be a positive finite number.`);
	return Object.freeze({
		frames: s,
		frameIntervalSeconds: c
	});
}
function s(t) {
	if (!r(t)) throw new e("BUBBLE-COMPOSITION-001", "Bubble portrait must be an object.");
	i(t, ["base"], ["blink", "talk"], "Bubble portrait");
	let n = t.blink === void 0 ? void 0 : o(t.blink, "Bubble portrait blink", 1), s = t.talk === void 0 ? void 0 : o(t.talk, "Bubble portrait talk", 1);
	return Object.freeze({
		base: a(t.base, "Bubble portrait base"),
		...n === void 0 ? {} : { blink: n },
		...s === void 0 ? {} : { talk: s }
	});
}
function c(t) {
	if (!r(t)) throw new e("BUBBLE-COMPOSITION-001", "Bubble style must be an object.");
	i(t, ["name", "textStyle"], ["portrait", "advanceIndicator"], "Bubble style");
	let n = t.portrait === void 0 ? void 0 : s(t.portrait), c = t.advanceIndicator === void 0 ? void 0 : o(t.advanceIndicator, "Bubble advance indicator", 2);
	return Object.freeze({
		name: a(t.name, "Bubble style name"),
		textStyle: a(t.textStyle, "Bubble text style name"),
		...n === void 0 ? {} : { portrait: n },
		...c === void 0 ? {} : { advanceIndicator: c }
	});
}
function l(e) {
	if (!r(e) || typeof e.applyToTarget != "function" || typeof e.getMimeType != "function" || typeof e.isRegistered != "function") throw TypeError("Bubble asset manager must provide applyToTarget, getMimeType, and isRegistered.");
	return e;
}
function u(e) {
	if (!r(e) || typeof e.setText != "function" || typeof e.releaseTarget != "function") throw TypeError("Bubble SVG Text composition must provide setText and releaseTarget.");
	return e;
}
function d() {
	return Object.freeze({
		setTimeout: (e, t) => globalThis.setTimeout(e, t),
		clearTimeout: (e) => globalThis.clearTimeout(e)
	});
}
function f(e) {
	if (!r(e) || typeof e.setTimeout != "function" || typeof e.clearTimeout != "function") throw TypeError("Bubble scheduler must provide setTimeout and clearTimeout.");
	return e;
}
function p(t, n) {
	if (!r(t) || typeof t.id != "string" || t.id.length === 0 || typeof t.isStage != "boolean") throw new e("BUBBLE-COMPOSITION-004", `${n} must provide id and isStage.`);
	return t;
}
function m(t) {
	if (!r(t) || typeof t.drawableID != "number" || !Number.isInteger(t.drawableID) || t.drawableID < 0) throw new e("BUBBLE-COMPOSITION-004", "Bubble text target must provide a non-negative integer drawableID.");
	return t;
}
function h(t, n) {
	if (!r(t) || !r(t.targets) || typeof t.setLayerVisible != "function" || typeof t.show != "function" || typeof t.hide != "function" || typeof t.dispose != "function") throw new e("BUBBLE-COMPOSITION-004", "Bubble surface is invalid.");
	let i = t.targets;
	m(i.text);
	let a = /* @__PURE__ */ new Set(), o = (t, n) => {
		let r = i[t];
		if (!n && r === void 0) return;
		let o = p(r, `Bubble surface ${t}`);
		if (a.has(o.id)) throw new e("BUBBLE-COMPOSITION-004", "Bubble image layers must use distinct target IDs.");
		a.add(o.id);
	};
	return o("portraitBase", n.portrait !== void 0), o("portraitBlink", n.portrait?.blink !== void 0), o("portraitTalk", n.portrait?.talk !== void 0), o("advanceIndicator", n.advanceIndicator !== void 0), t;
}
function g(t, n) {
	if (!t.isRegistered(n)) throw new e("BUBBLE-COMPOSITION-003", `Bubble image asset is not registered: ${n}`);
	if (!t.getMimeType(n).startsWith("image/")) throw new e("BUBBLE-COMPOSITION-003", `Bubble asset is not an image: ${n}`);
}
function _(e) {
	return [...e.portrait === void 0 ? [] : [
		e.portrait.base,
		...e.portrait.blink?.frames ?? [],
		...e.portrait.talk?.frames ?? []
	], ...e.advanceIndicator?.frames ?? []];
}
function v(e, t) {
	if (e.length === 1) throw e[0];
	if (e.length > 1) throw AggregateError(e, t);
}
function y(e) {
	let t = !1, n = 0, r = 0, i, a = Promise.resolve(), o = async (t) => {
		let n = e.animation.frames[t];
		n !== void 0 && await e.assetManager.applyToTarget(n, e.target);
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
function b(o) {
	if (!r(o)) throw new e("BUBBLE-COMPOSITION-001", "Show bubble input must be an object.");
	if (i(o, [
		"actor",
		"actorKey",
		"kind",
		"text",
		"styleName"
	], ["phase"], "Show bubble input"), !t.has(o.kind)) throw new e("BUBBLE-COMPOSITION-001", "Bubble kind must be say or think.");
	if (typeof o.text != "string") throw new e("BUBBLE-COMPOSITION-001", "Bubble text must be a string.");
	let s = o.phase ?? "speaking";
	if (!n.has(s)) throw new e("BUBBLE-COMPOSITION-001", "Bubble phase is invalid.");
	return {
		actor: o.actor,
		actorKey: a(o.actorKey, "Bubble actor key"),
		kind: o.kind,
		text: o.text,
		styleName: a(o.styleName, "Bubble style name"),
		phase: s
	};
}
function x(t) {
	if (!r(t)) throw TypeError("Bubble composition options must be an object.");
	let i = l(t.assetManager), o = u(t.svgText);
	if (typeof t.createSurface != "function") throw TypeError("Bubble composition createSurface must be a function.");
	if (t.onAnimationError !== void 0 && typeof t.onAnimationError != "function") throw TypeError("Bubble composition onAnimationError must be a function.");
	let s = f(t.scheduler ?? d()), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = !1, C = () => {
		if (S) throw new e("BUBBLE-COMPOSITION-005", "Bubble composition has been disposed.");
	}, w = async (e, t) => {
		let n = (x.get(e) ?? Promise.resolve()).catch(() => void 0).then(t);
		x.set(e, n);
		try {
			return await n;
		} finally {
			x.get(e) === n && x.delete(e);
		}
	}, T = async (r) => {
		C();
		let a = p.get(r.styleName);
		if (!a) throw new e("BUBBLE-COMPOSITION-002", `Bubble style is not defined: ${r.styleName}`);
		for (let e of new Set(_(a))) g(i, e);
		let c = m.get(r.actorKey);
		c && await c.close();
		let l, u = !1, d = !1;
		try {
			l = h(await t.createSurface(Object.freeze({
				actor: r.actor,
				actorKey: r.actorKey,
				kind: r.kind,
				style: a
			})), a), o.setText({
				styleName: a.textStyle,
				target: l.targets.text,
				text: r.text
			}), u = !0;
			let c = [];
			if (a.portrait) {
				c.push(i.applyToTarget(a.portrait.base, l.targets.portraitBase));
				let e = a.portrait.blink?.frames[0];
				e !== void 0 && c.push(i.applyToTarget(e, l.targets.portraitBlink));
				let t = a.portrait.talk?.frames[0];
				t !== void 0 && c.push(i.applyToTarget(t, l.targets.portraitTalk));
			}
			let f = a.advanceIndicator?.frames[0];
			f !== void 0 && c.push(i.applyToTarget(f, l.targets.advanceIndicator)), await Promise.all(c);
			let p = a.portrait?.blink === void 0 ? void 0 : y({
				actorKey: r.actorKey,
				layer: "portraitBlink",
				animation: a.portrait.blink,
				target: l.targets.portraitBlink,
				assetManager: i,
				scheduler: s,
				...t.onAnimationError === void 0 ? {} : { onError: t.onAnimationError }
			}), g = a.portrait?.talk === void 0 ? void 0 : y({
				actorKey: r.actorKey,
				layer: "portraitTalk",
				animation: a.portrait.talk,
				target: l.targets.portraitTalk,
				assetManager: i,
				scheduler: s,
				...t.onAnimationError === void 0 ? {} : { onError: t.onAnimationError }
			}), _ = a.advanceIndicator === void 0 ? void 0 : y({
				actorKey: r.actorKey,
				layer: "advanceIndicator",
				animation: a.advanceIndicator,
				target: l.targets.advanceIndicator,
				assetManager: i,
				scheduler: s,
				...t.onAnimationError === void 0 ? {} : { onError: t.onAnimationError }
			}), b = "idle", x = !1, S = Promise.resolve(), C = async (e) => {
				e !== b && (e === "speaking" ? (await _?.stop(), await l?.setLayerVisible("advanceIndicator", !1), await l?.setLayerVisible("portraitTalk", g !== void 0), await g?.start({ primed: !0 })) : e === "waiting" ? (await g?.stop({ reset: !0 }), await l?.setLayerVisible("portraitTalk", !1), await l?.setLayerVisible("advanceIndicator", _ !== void 0), await _?.start({ primed: !0 })) : (await Promise.all([g?.stop({ reset: !0 }), _?.stop()]), await Promise.all([l?.setLayerVisible("portraitTalk", !1), l?.setLayerVisible("advanceIndicator", !1)])), b = e);
			};
			await Promise.all([
				l.setLayerVisible("portraitBase", a.portrait !== void 0),
				l.setLayerVisible("portraitBlink", a.portrait?.blink !== void 0),
				l.setLayerVisible("portraitTalk", !1),
				l.setLayerVisible("advanceIndicator", !1)
			]), await l.show(), d = !0, await p?.start({ primed: !0 }), await C(r.phase);
			let w = Object.freeze({
				actorKey: r.actorKey,
				kind: r.kind,
				get phase() {
					return b;
				},
				setPhase(t) {
					return x ? Promise.reject(new e("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${r.actorKey}`)) : n.has(t) ? (S = S.then(() => C(t)), S) : Promise.reject(new e("BUBBLE-COMPOSITION-001", "Bubble phase is invalid."));
				},
				async close() {
					if (x) return;
					x = !0;
					let e = [];
					try {
						await S;
					} catch (t) {
						e.push(t);
					}
					for (let t of [
						() => p?.stop(),
						() => g?.stop(),
						() => _?.stop(),
						async () => {
							d && await l?.hide();
						},
						async () => {
							u && l && o.releaseTarget(l.targets.text);
						},
						async () => l?.dispose()
					]) try {
						await t();
					} catch (t) {
						e.push(t);
					}
					m.get(r.actorKey) === w && m.delete(r.actorKey), v(e, `Failed to close bubble: ${r.actorKey}`);
				}
			});
			return m.set(r.actorKey, w), w;
		} catch (e) {
			let t = [];
			if (d && l) try {
				await l.hide();
			} catch (e) {
				t.push(e);
			}
			if (u && l) try {
				o.releaseTarget(l.targets.text);
			} catch (e) {
				t.push(e);
			}
			if (l) try {
				await l.dispose();
			} catch (e) {
				t.push(e);
			}
			throw t.length > 0 ? AggregateError([e, ...t], `Failed to show and clean up bubble: ${r.actorKey}`, { cause: e }) : e;
		}
	};
	return Object.freeze({
		defineStyle(e) {
			C();
			let t = c(e);
			p.set(t.name, t);
		},
		hasActiveBubble(e) {
			return m.has(a(e, "Bubble actor key"));
		},
		async show(e) {
			C();
			let t = b(e);
			return w(t.actorKey, () => T(t));
		},
		releaseTarget(e) {
			C();
			let t = a(e, "Bubble actor key");
			return w(t, async () => {
				await m.get(t)?.close();
			});
		},
		async releaseAll() {
			C(), await Promise.allSettled([...x.values()]), v((await Promise.allSettled([...m.values()].map((e) => e.close()))).flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to release all bubbles");
		},
		async dispose() {
			if (S) return;
			S = !0, await Promise.allSettled([...x.values()]);
			let e = await Promise.allSettled([...m.values()].map((e) => e.close()));
			p.clear(), v(e.flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to dispose bubble composition");
		}
	});
}
//#endregion
export { e as BubbleCompositionError, x as createBubbleComposition };
