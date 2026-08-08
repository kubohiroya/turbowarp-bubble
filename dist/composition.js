//#region src/placement.ts
var e = [
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
], t = [
	"north",
	"north-northeast",
	"northeast",
	"east-northeast",
	"east",
	"east-southeast",
	"southeast",
	"south-southeast",
	"south",
	"south-southwest",
	"southwest",
	"west-southwest",
	"west",
	"west-northwest",
	"northwest",
	"north-northwest"
], n = [
	"HEADER_LIKE",
	"CENTER",
	"FOOTER_LIKE"
], r = "up-right", i = /* @__PURE__ */ new Map([
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
]), a = new Set(e), o = new Set(n), s = Math.SQRT2 - 1;
Object.freeze({
	down: {
		x: 0,
		y: -1
	},
	"down-down-left": {
		x: -s,
		y: -1
	},
	"down-down-right": {
		x: s,
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
		y: -s
	},
	"left-up-left": {
		x: -1,
		y: s
	},
	right: {
		x: 1,
		y: 0
	},
	"right-down-right": {
		x: 1,
		y: -s
	},
	"right-up-right": {
		x: 1,
		y: s
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
		x: -s,
		y: 1
	},
	"up-up-right": {
		x: s,
		y: 1
	}
});
function c(e) {
	if (typeof e == "number") {
		if (!Number.isFinite(e) || e < 0 || e > 360) throw TypeError("Bubble placement angle must be from 0 through 360.");
		return Object.freeze({
			basis: "actor",
			direction: e === 360 ? 0 : e
		});
	}
	if (typeof e != "string" || e.trim().length === 0) throw TypeError("Bubble placement must be a direction, angle, or region.");
	let t = e.trim(), n = t.toUpperCase();
	if (o.has(n)) return Object.freeze({
		basis: "background",
		region: n
	});
	let r = t.toLowerCase();
	if (a.has(r)) return Object.freeze({
		basis: "actor",
		direction: r
	});
	let s = i.get(r);
	if (s) return Object.freeze({
		basis: "actor",
		direction: s
	});
	let c = Number(t);
	if (Number.isFinite(c) && c >= 0 && c <= 360) return Object.freeze({
		basis: "actor",
		direction: c === 360 ? 0 : c
	});
	throw TypeError("Bubble placement is invalid.");
}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/constants.js
var l = 2048, u = 2112, d = Uint8Array, f = Uint16Array, p = Int32Array, m = new d([
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
]), h = new d([
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
]), ee = new d([
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
]), g = function(e, t) {
	for (var n = new f(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new p(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, _ = g(m, 2), te = _.b, v = _.r;
te[28] = 258, v[258] = 28;
var y = g(h, 0), ne = y.b;
y.r;
for (var b = new f(32768), x = 0; x < 32768; ++x) {
	var S = (x & 43690) >> 1 | (x & 21845) << 1;
	S = (S & 52428) >> 2 | (S & 13107) << 2, S = (S & 61680) >> 4 | (S & 3855) << 4, b[x] = ((S & 65280) >> 8 | (S & 255) << 8) >> 1;
}
for (var re = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new f(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new f(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new f(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, p = d | (1 << u) - 1; d <= p; ++d) s[b[d] >> c] = l;
	} else for (s = new f(r), i = 0; i < r; ++i) e[i] && (s[i] = b[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), C = new d(288), x = 0; x < 144; ++x) C[x] = 8;
for (var x = 144; x < 256; ++x) C[x] = 9;
for (var x = 256; x < 280; ++x) C[x] = 7;
for (var x = 280; x < 288; ++x) C[x] = 8;
for (var ie = new d(32), x = 0; x < 32; ++x) ie[x] = 5;
var ae = /*#__PURE__*/ re(C, 9, 1), oe = /*#__PURE__*/ re(ie, 5, 1), se = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, w = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, ce = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, le = function(e) {
	return (e + 7) / 8 | 0;
}, ue = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new d(e.subarray(t, n));
}, de = [
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
], T = function(e, t, n) {
	var r = Error(t || de[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, T), !n) throw r;
	return r;
}, fe = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new d(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new d(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new d(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, f = t.p || 0, p = t.b || 0, g = t.l, _ = t.d, v = t.m, y = t.n, b = i * 8;
	do {
		if (!g) {
			u = w(e, f, 1);
			var x = w(e, f + 1, 3);
			if (f += 3, !x) {
				var S = le(f) + 4, C = e[S - 4] | e[S - 3] << 8, ie = S + C;
				if (ie > i) {
					c && T(0);
					break;
				}
				s && l(p + C), n.set(e.subarray(S, ie), p), t.b = p += C, t.p = f = ie * 8, t.f = u;
				continue;
			}
			if (x == 1) g = ae, _ = oe, v = 9, y = 5;
			else if (x == 2) {
				var de = w(e, f, 31) + 257, fe = w(e, f + 10, 15) + 4, pe = de + w(e, f + 5, 31) + 1;
				f += 14;
				for (var E = new d(pe), me = new d(19), D = 0; D < fe; ++D) me[ee[D]] = w(e, f + D * 3, 7);
				f += fe * 3;
				for (var he = se(me), ge = (1 << he) - 1, _e = re(me, he, 1), D = 0; D < pe;) {
					var ve = _e[w(e, f, ge)];
					f += ve & 15;
					var S = ve >> 4;
					if (S < 16) E[D++] = S;
					else {
						var O = 0, ye = 0;
						for (S == 16 ? (ye = 3 + w(e, f, 3), f += 2, O = E[D - 1]) : S == 17 ? (ye = 3 + w(e, f, 7), f += 3) : S == 18 && (ye = 11 + w(e, f, 127), f += 7); ye--;) E[D++] = O;
					}
				}
				var be = E.subarray(0, de), k = E.subarray(de);
				v = se(be), y = se(k), g = re(be, v, 1), _ = re(k, y, 1);
			} else T(1);
			if (f > b) {
				c && T(0);
				break;
			}
		}
		s && l(p + 131072);
		for (var xe = (1 << v) - 1, Se = (1 << y) - 1, Ce = f;; Ce = f) {
			var O = g[ce(e, f) & xe], A = O >> 4;
			if (f += O & 15, f > b) {
				c && T(0);
				break;
			}
			if (O || T(2), A < 256) n[p++] = A;
			else if (A == 256) {
				Ce = f, g = null;
				break;
			} else {
				var we = A - 254;
				if (A > 264) {
					var D = A - 257, j = m[D];
					we = w(e, f, (1 << j) - 1) + te[D], f += j;
				}
				var Te = _[ce(e, f) & Se], Ee = Te >> 4;
				Te || T(3), f += Te & 15;
				var k = ne[Ee];
				if (Ee > 3) {
					var j = h[Ee];
					k += ce(e, f) & (1 << j) - 1, f += j;
				}
				if (f > b) {
					c && T(0);
					break;
				}
				s && l(p + 131072);
				var De = p + we;
				if (p < k) {
					var Oe = a - k, ke = Math.min(k, De);
					for (Oe + p < 0 && T(3); p < ke; ++p) n[p] = r[Oe + p];
				}
				for (; p < De; ++p) n[p] = n[p - k];
			}
		}
		t.l = g, t.p = Ce, t.b = p, t.f = u, g && (u = 1, t.m = v, t.d = _, t.n = y);
	} while (!u);
	return p != n.length && o ? ue(n, 0, p) : n.subarray(0, p);
}, pe = /*#__PURE__*/ new d(0), E = function(e) {
	(e[0] != 31 || e[1] != 139 || e[2] != 8) && T(6, "invalid gzip data");
	var t = e[3], n = 10;
	t & 4 && (n += (e[10] | e[11] << 8) + 2);
	for (var r = (t >> 3 & 1) + (t >> 4 & 1); r > 0; r -= !e[n++]);
	return n + (t & 2);
}, me = function(e) {
	var t = e.length;
	return (e[t - 4] | e[t - 3] << 8 | e[t - 2] << 16 | e[t - 1] << 24) >>> 0;
};
function D(e, t) {
	var n = E(e);
	return n + 8 > e.length && T(6, "invalid gzip data"), fe(e.subarray(n, -8), { i: 2 }, t && t.out || new d(me(e)), t && t.dictionary);
}
var he = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	he.decode(pe, { stream: !0 });
} catch {}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/swap.js
var ge = new Uint8Array(new Uint32Array([305419896]).buffer)[0] === 18;
function _e(e) {
	let t = e.length;
	for (let n = 0; n < t; n += 4) [e[n], e[n + 1], e[n + 2], e[n + 3]] = [
		e[n + 3],
		e[n + 2],
		e[n + 1],
		e[n]
	];
}
function ve(e) {}
var O = ge ? _e : ve, ye = new TextDecoder(), be = class e {
	constructor(e) {
		if (e instanceof Uint8Array) {
			let t = 0, n = new DataView(e.buffer);
			if (this.highStart = n.getUint32(0, !0), this.errorValue = n.getUint32(4, !0), t = n.getUint32(8, !0), t !== 4294967295) throw Error("Trie created with old version of @cto.af/unicode-trie.");
			if (t = n.getUint32(12, !0), 16 + t > e.byteLength) throw RangeError("Invalid input length");
			let r = e.subarray(16 + t);
			this.values = r.length ? JSON.parse(ye.decode(D(r))) : [], e = D(e.subarray(16, 16 + t)), O(e), this.data = new Int32Array(e.buffer);
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
			let n = (this.data[l + (e - 55296 >> 5)] << 2) + (e & 31);
			t = this.data[n];
		} else if (e < this.highStart) {
			let n = this.data[u - 32 + (e >> 11)];
			n = this.data[n + (e >> 5 & 63)], n = (n << 2) + (e & 31), t = this.data[n];
		} else t = this.data[this.data.length - 4];
		return t;
	}
	getString(e) {
		let t = this.get(e);
		return this.values[t] ?? t;
	}
}, k = be.fromBase64("AAgOAAEAAAD/////nRQAAB+LCAC4xcFoAgPtnQnwlkUdx1+URLxABcUUghTEEK8Cmwp0LJAa\n   MRrFbBSPSXHSAUYNdFQoBWMKyQrUCo/EyMIjD3TIAxXJM5NBHBm0RDSPzDOVdAz7/nB/07bt\n   s8/e+/zhfef9zD7HPs/e129/u8/yzVutVWANeBl079xq9QJ9wUCwDxjqYQ4DI8BoMBYcBY4D\n   48FEw3NTwDTp/BxwAZgJLgaXgCvAAnADuA3cDe4Hj0rPLQerwLPgJfAaeBe8Az4EnT/Ram0D\n   eoBdwe5gENgX0DsOhHkQGAlGgTHgaHACGA8mgilgGpgBLgJzweVgPlgIbgF3iPOl4BGwAqwG\n   a8Er4C2wDnwEumzRanUDPUFv0B8MBgeAL4BDwNfAN8C3wIngO+A0cCZowd/nwrwA/Eic/wzm\n   L8EMHM+HuRDcDP4g7t8Hk3hYmI8BCv+TwvwLTOZvglfBawKyQ7wrjv8Ns1OXVqsroPNuwuwJ\n   szfoL86JwTgeIp3HYJj0vhE4Hg3GgnHgZMDhnYDjyWCqZP9CHM8Gc8S1y2BeBa4FvweLxPN3\n   wVwq7Dwirp0KVuB4NVgLXgSvg/fA+6C1Jf6gO+gF+oI9wQa3YQ4FwwDlwREwR4Mj+L6GY3Dv\n   eMN9OY7JPAV2Jwn7Z8E8F0wHs8AcMA9cA64Dt4I7wT3gQfA4eAI8DdaKd7wizLdgvg86dUWa\n   g+1BL0D3+sIcAAaLc5X9xfUDYR4EDlUYJR2PAUeCY8FJ4DRwJjgXTAezwBwwD1wDrgO3gjuF\n   G/fAfBA8Js5XwnwaPF/htypeFfbfhvm+w7OdtkL6Axe3thP2uSzuhPM+YICA6tZ9YA4FwwGV\n   55F0XTBGOlY5GhwHxoOJYAqYBn4AfiyOLwVXgvnSc9dKxzeC28XxEoNbbdq0iQvXEe24aNOm\n   TZs2bdq0aePC0ob55yFhPg5IHlI3Rl4Je8+I/vALMN+T7v3DMN5+B/c+BJ23hhwQ0LUeMM+G\n   OQrshuM9AMkJ94b5WfBF8GVwKPg6+CYgOc7xME8BLFsiJuH8LPA9MFO8/yJhMnNxfjm4AlwJ\n   rgK/AleD+e177Xvte+177XvR7/0O3ARuBSQzLcmd8ENJSoe/TZsmE9qfvR9l7FHwhNL3c+Ep\n   zbPP4trz4FXwT/AB2Gyb/7WzJc67g16gLxgIBgOasxkCcxgoXf/c2+1jDu7ean0fLDbwDvjc\n   9pi7Aj8H8r1V4vxlmLvtgLlCMBesBNvs+PG9g2GeBxaB5aB7j1brOczh9UN8nAiuBs8BGg8c\n   BqgP/xOqI2n+VvAQzile53T6L6NwLts5G+eLwSpxfT3M4dtiTg0sAevB8O1wDuT35GZJA9yX\n   461NmzZtNiXWow6cTrpKaCNGU3uhtPNjcW0cOEFq28fjeAI4HUwWz8iQbIvsrYM5VTw3HSbp\n   Fs2EebG4dpnGPYL0hM4n3SfcXyDsLhTmzTBvA3eI86VKn6MK0lshfao/kt9x/pjk7ydFW7lG\n   vIt0rl4W99+EuQ58BEh3jP3bBW1oVxHObjjeCfQB7B7bG8DXYJ5OelYwvwS+Ath9fuY0KT4O\n   E88dKcxjYJIs8NswT5WeVSG/k/0zYOcccL54nuLvh+QHmD8V5jJA8fILnP8Lz10N87eAdMRu\n   grlY9Bfo/AGYfwYrxPl9eOdqHK8l/+D47zDfFv76AOZmyFeTcLwVzB1AL9AXDAT7gSFgGBgB\n   yH87ks4ZjseK86+CcdQ+a8JI90/GvQniPtufjPOp4vkLYc4Gc8Hl4NfgesP7Fin3OE3uwvVl\n   4BGwQrKzGsd/BS+C18Hb4APhdif0J7sC1unbHsf83C7SMd3vh/O9yC4YCoaBQ8Aoyd4YHB8J\n   jgUngVMBlQ8qG2dI9nScg/sXgJngYsnupTi+EvxG+DMnXI7UuCZuNPjn9pqwboxQOeXwc50Q\n   gyUinh8wxPfDFfeW4/qqAvmmaVDb6PvsGiX+XvLM2/1Qb76xEZeLGOlEdTC1i+tEnNMx1Z8f\n   ivPOGJtvDXYEJNfw9eeueL4uHLvDziBA/Rb5+gG4Rvq0n5feQTKJXHp8rlBfaiT8R7KcKnnV\n   4Yb42BQ4wjL9joG9E8Apjul9uBL3TS+/kxC+74LzGpAvTHl7BvznUyYuwnM05iGoLM/F+Tzl\n   XdyHqStbZM4S5/PxjoXgJvEuWqvAdkmuKIeL6hV5TET9e6r/qsJPazHIvBfveQgsF248BXMF\n   1YcOcXGERXv4AslIPeNXhuL3TVFnroO5HmwB2WtT8j21Mdsa/NMT93qDDevFkJ79Fbsb1s7g\n   2hDLMFE/cZh434iAeKD3jDY8T/fHGu5TuMfVuH+y8KeOCeJZPp+cIU1JD4fcmiq5NVvIIaqe\n   oXJyIezPBpeAK8AC8Xxvi/5YXd1+A951C6C1R4uFeTdMurdMmC78Cc+sBM+ANdLzNF/xBlgH\n   PpKud8G8xXagB9gZ9AF0fQ+Yg8QxcQCOh4rz4TBHimM5TQ/HNT5egHDQfdZFOkrcI/nEcTge\n   Dyh+JsKcIt41TZgzYM5S3j9H8gsxD+dXSe4x10rXrleeyc2iwu6XhsJ/F8WBqMeJ/ysfBpaJ\n   PNKReXzzThvYDKd1YFn0hscg/tsALZ21ec4GsTS0hWLZou4kDX9oaELHdI1EeiT24ntUtVGX\n   g0yq7igpbCD7BL2HIXfl89RQWCgMHJ7ckPuUlpj63XBO8Y9pyE2aTf2nK5NQC4hWvuvoKfIl\n   lXkqGwzlz50EfMx1BOVhztP8HNvdWXlWhp6Xz8ndlOWN/V6K0u43Dc4fch7gc9s4U/OU/Azn\n   vZLkKrdNheqTKnzeVxff/FOvc19D/dW9SzZjkuKdMfPmxlrn5Ix3mzzWBKhs9NL4l9rxqj5J\n   06HwcD6W8zQf01iDzLrfLhmpc1vNVza/qvGXnP7UZ2PUcZlLnHOcksk0KZ+nyGe2412KW13c\n   p65rOQ3qwmCyo8afzi7bsY2PmPV4yfYqZl7qKO1F6nhyreNs6rvY+S9XnOjaai7TssxAHqfn\n   8GuV/9XrVfZi5PVcZaXK367u636hfuP8bCtL8u3np+6vURhK9BObUPZjxm+scZ0810DkrFfV\n   8uY6zgotWy5ygSq35DJYlyZqedWVX5s2UTeeqQqT6pZr+vJ4QRc/fF1uj6rCZYprU1hypG/d\n   sRznpnS1Sd+6dKzLa3X5wzZ9dfWEa5/Mtfzq0qRE+vqWX10eqErfkL6tOubxLb8s1zG54RLO\n   nPWzb/3pkl9z1J8ufcQqP9fl9ao6w9Re6cKsS7u6a3Xto2s81NWvpjxqW/5s5IEpxpncTtr2\n   4XPWpbHGWa79Idv0NMWZKR5i1aemn+38oxwum2dKpm+M9jJm+pr6RrHSV9eH9dXnyN0XijEO\n   i5GedX16VzluqvZXHr9UpY1P/9a1zSs176m2kbb+NY13qvKLjYwqtP1V/eLT//5kQ1B/1G8I\n   eZ/LfA3LgUzxw8dVcZYiLuvcjB33IX7wybe6NKM+gox8jfRq+JjSi87l+ViGrut0buvaqdhy\n   QPKj3MawSbqApBfLZoi81kcuXqV3XXc9VHbeBH0L+nF5N7W/Nm2NnBer+rasD9bEute1flTD\n   lst9Ux1vK8PWjZFD+x27Fma3wvQujG/fMFQ/0iX/hD7f9PClnr9OHX8+Mh65PTS1Iyn9UULX\n   M/b8vq9uKf9ID7KkjkvOtOe+om/8cxvu6meXubpY+jcuc0Wx3TeNBVOH33e+LKQ+rZM55pQd\n   cNz3kc4578rygFhy7Fj1H4872f88FpD1hNV1Iy76tbnr35Dyn1v3yCT3KhEnJdpnG1mui46u\n   ryzBNNaiH5eH0HFfbPlWqvouVX0ZKjdW65S68XQqfWC1nJSUO8eoj0OfjxGGUjI1V/erZGIh\n   P507n8qIa7z1tXinLK/sZwnb/7TS7+drNtj43+Y9sttN00121aMOnR+wTb/UuIZ/d4FrfydV\n   PSOXCRmf+jfl/E9KuUMpuVPMfnKMdQIucze69X6m8YPvngAl9yOwqWNt5Wsu+hSp9xRoytr0\n   UN3tunhPHQ91brDsoqqOZSivyed7iDzXX8p/JJ8le2QSA4C8lwntkcP7bvGxfC7bJfaUIDd5\n   j7CqsiCv/dYh+4HcIbkTYdpLgOWwbNdk31R/k/tqnKpy2oGB43o1H9js0cPhk/ebUfegsZVT\n   h8pW5D2aVNQ9nFzQPStf4+MQN4jYfZ4Q+TDndzUNTfqAVfs7uazFtc03KfaP0u3LZYvP877u\n   ++6zpf5SuOfiJ9+w6PylXtPdZ1Pdx80UZ1VxoYahLl/Y7tflUxbqwhyr7OjioCpuTOexymmM\n   99vGWe5960LdoT5PrDlkNn39yrIdFzdTxKkqa0o9n5NyfjbFL6T9i03O9jTEjVT9CZt61qWe\n   DAmTbX1rkw4ubWysflyu/Uh19Utdv8QUb/wevs/vlN3YK0J95hvGWP26FP0CXV0ix6XOfmi8\n   lNw7tlSc284PqXnZlKf5umpfVx7Ue3K5q4onnT9079H5h8ubyX5VGZHfIVOiPynLz2RkPSTV\n   /2p/0NZM2Ufw7dPm3tveJp46kn5prDC7miXDUCoOc7QdKeU9KeZZbNZTsw6ZKjPna6G6jLZ6\n   v6Y9S0rqHMbaN8j3flUbVIdpnonTleaP+JsiapunntfVOer7WUdXNw+jCyvNYxE6P9Ix+7Mu\n   TCa3uM3mb9JUmfLe1q59N19yulXnD5dfU/yRyn/8vR2Cr9H8JB/btsm29undfCw/56tbVmVX\n   d53nXtV0+Iw4rjNTk8udOvdtwl13j1B1YuT5b04HMpsW/7HCr8t/dF0Of846J3W9HPtdNnUf\n   x7UvpdsiV1mJjawiFLWODEm73G1mLF1J2/GB7X7UtvqhJeeTfPc4T7mPtLpuWqWJ66malIZV\n   Oq6uerCp9Oh1dlzCzrpIudKf92/hsZbP+hIbHa0Q/fQYe/v4lmd5T5s6veq6vYViyzJT69KV\n   2t/FlN451zKFrm3i9U0264J0fQOX9U5Vfe6S+xPRL8VaHJe8rK69qpNJqe92jX81XX3X2fr8\n   XPaHsq1PdPWWa12Sag1GaXmwT98pZ/2vy8+h7e8gsHdGcrvn+ou5l5j6K7GfmPobXJiY4xLb\n   d9C3GKnM2H7Xkd7j+z1I03X5ftWxjd9KwDLy0mNPV/fUtSCh4wyeF5DXS8nzWnSd9Jqrfrye\n   UWfa3NP1O131E9TnTDItvs/rn9Qwm9y3lS/yuiSdDK2J32LmH61l4/l7DpMcFl0cy/HpKvNU\n   5Z6yuzmgsPj4PZX78jydfMzx1BFk7Gr61smlU9yXf7w+UL7Pa5Fc9pe3lTntI+YJYvTvQ9Y9\n   x9gbNOU66lxyYJPsuqPtBRpjvW7uX6n9Y3LpfMUe8+fYy6sJ+99x2QyVR1TJrEvlz9Lxmzq8\n   Kct+jO8mpnIrV35pYv3rso+6j2w1RzkxpWeOslpV38Xey7lJ7XVVnDdFVyDn2o2m7A1s871r\n   U3+hbp661LfjbL6l6vL9O5v5uiqdcd/9mG3sVrlrktHl3m+5Ln46Qply/f51rDq2afV3U92P\n   9Z2CVPu71+kExf4uhm265Mpfcrjl9S+p/WGjb9FEeYmrHlhsXTLb772b2v3U8bKvoAk6VaQ3\n   ZdqvWf2FytNd9g1W/c57VNf9+JuMuXT+ZJ1tnZ6T7U+un1PXpSm/BxKiZ+b6nUC5P+bybdoU\n   3wWR9zP1WcOrrtc06dG7rA9gf6lzCCVlQKl1cKvW16r7MjdxPqHue3m55l5M6yRy1q8p6i+d\n   GzbfR5Dtqeeu1D2rulVlp+67ulXfzlDPqS/AP52us+kb5aoetdp226wrqOtHuvxc9InlsMrX\n   5HCkgvtULt80VtPB5tvHlLbU51R1leQ+nW0ftknjClM7Ktf7Pt9n161FKfULHbeU/P5brO/5\n   8PeveZ2l+s31OpmmizxP5z/VrssvNP7Vb9XbUGr+LWSdWKr4c/lemct7U/1KfJcs5nfiXNcz\n   Va3lCf2OXi75c+gaSd/4SyH/pmds+8G2fWCbvmwMeZapf6v2g9hU16vF7l/65K8cc6uh7bIs\n   W8jdLyyxp4BPPOru6+Qx8rd8beIyhew8xjoMtU8l90dcyldseUOJPpPLevpc7ZnvL8f4oaRO\n   ad34WVeefPYVSdG+27T7vPdESj0VV5leyvXoufQvffKZTpZmGy+27UNKfYCc5dWmj2fbp44Z\n   P6G/WN9X1cl8beoieS7ad7+PGP14nz1ATO1q3Xx2jHnpWO1xR1uPovumYQndrFD9uyrdvpD4\n   b9L8Yaz9wxl5bbVu/XlT9j2X/Rr6Hl7brYPd0V1jM5bOk+84oUn7xpeeH7IhVJ7j25+IrU9s\n   ig+XOi7lGMtGj9pGB903/kuMQVPuORpjv7+c35AvvYYkNO1CviFvU4/HkF+qe2ZTG+VTn1bt\n   fV7y5/PtqNR76oeuy4zlH3n/9ND3qPuxu7xb3cuj7heahiXq4ljrC1R5vm5M39HGFz7yzRLr\n   k1PoMMfcPzeGvDPWPssxw6Rzo8QcXmp3XGSSHX2/Et08k67f5dtmuupKN2FvMpOsKObeDnVx\n   k3ofp1h6VrFIVVdV7T2fYm9013l7k/5rbNlKaBuXso7LLV+K1d67uuWiJ19ShhcjvUP97FsO\n   Q+V7pdfDpy5rtv2qEPkU7XFY0v3Q+Oc8FpqHdHV9Xf415XFbPTPfPk7qNWsufow9vkqlz6v+\n   eA4udH9l3XxtiA5ZyN5XpvxSNzdetRdQlWnKjzbP695Xt9+WTz/bJk5y6tDVlYHUe0Crv9Bv\n   vMf+bnzq79DHenfs/ZD3y4TO7b0S7vPM8Z5yL2mTG1XXKcyMLh5093OzvwbVfzr/1hHDby7u\n   ufhH5z/Vrm1YZPsheUtn2pQh+RnfMmCqy3PN7aSeN0oRtrp8m6oONOXflHVfrnj0ccdU1lVS\n   yYu7Ssjz96ZwxEgz13rX1c3Y+Sp2vJve7eN+zP3nYsojYunAhMq1cs2vM1X9J99+Q2g+d+1z\n   5OznpXJD1zcKcc/U33KN39TzgCnr4lz95Fz1cW79kxT6SDF00UruT5ZDZ8Xl9x83MV0I0CwB\n   AB+LCAC4xcFoAgMdjksWhCAMBO/CelYzJ4gMCqiI4t/n/a9hyk29JN3p5DL7bj7GTQrbKypR\n   dDVVywyhZCz4xkUhnSIj5EExoFoQisIfbICE2WJOoAESSK7wecCscDJSxRXMbBAlfLCyIbTh\n   T8tr5/YikvVFSYq3dURbKo/gf+Q3zBCELycCXW/uB2mPjCb8AAAA"), xe = Object.fromEntries(k.values.map((e, t) => [e, t])), { values: Se } = k, { AI: Ce, AL: A, CJ: we, CM: j, NS: Te, SA: Ee, SG: De, SP: Oe, XX: ke } = xe;
function Ae(e) {
	switch (e) {
		case null: return null;
		case -1: return "sot";
		case -2: return "eot";
		default: return Se[e];
	}
}
function je(e, t) {
	switch (e) {
		case Ce:
		case De:
		case ke: return A;
		case Ee: return /^[\p{gc=Mn}\p{gc=Mc}]$/u.test(t) ? j : A;
		case we: return Te;
	}
	return e;
}
var M = class {
	cp = -Infinity;
	cls = -1;
	char = "";
	len = 0;
	ignored = !1;
	constructor(e, t, n, r) {
		this.cls = e, this.cp = t, this.char = n, this.len = r;
	}
	[Symbol.for("nodejs.util.inspect.custom")](e, t, n) {
		return `${Ae(this.cls)}(${this.cp.toString(16).padStart(4, "0")}:${JSON.stringify(this.char)})${this.ignored ? "Ig" : ""}`;
	}
}, Me = class {
	str = "";
	len = 0;
	prevChunk = 0;
	prev = new M(-1, -Infinity, "", 0);
	cur = new M(-1, -Infinity, "", 0);
	next = new M(-1, -Infinity, "", 0);
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
		this.push(new M(-2, Infinity, "", this.next.len));
	}
	*codePoints(e, t = !0) {
		if (t) for (; e < this.len;) if (e === this.cur.len && this.next.cls >= 0) yield this.next, e += this.next.char.length;
		else {
			let t = this.str.codePointAt(e), n = String.fromCodePoint(t), r = k.get(t);
			e += n.length, yield new M(je(r, n), t, n, e);
		}
		else for (; e > 0;) if (e === this.cur.len) yield this.cur, e -= this.cur.char.length;
		else if (e === this.prev.len) yield this.prev, e -= this.prev.char.length;
		else {
			let t = e - 1, n = this.str.charCodeAt(t);
			n >= 56320 && n <= 57343 && t--;
			let r = this.str.codePointAt(t), i = String.fromCodePoint(r);
			yield new M(je(k.get(r), i), r, i, e), e = t;
		}
	}
	classAfterSpaces(e) {
		for (let { cls: t } of this.codePoints(e)) if (t !== Oe) return t;
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
}, Ne = class {
	string = void 0;
	props = void 0;
	constructor(e, t = !1) {
		this.position = e, this.required = t;
	}
}, N = be.fromBase64("AAAEAAAAAAD/////wQIAAB+LCAC1xcFoAgPtmj1IHUEQxzd5FiaEkMLSKqQIViEQCEmTjyqk\n   SUgR7OySTrHxdVoIYqUg2AgqFhYWFhYidpYqKDaClVZaqJWF2qj/xT1cjjtv772Z3T1uHvzY\n   753d2b252ds3+1SpRbAMVkGSrlMo5LNjIfqoB/uEfR2Ao5yy4zb7PgUX4Brcgo6GUi9AF+gG\n   r0EPeAc+AN3mM8KvJu6DH0bWb08yeyEneV77rHia/yjbMvEBxJum7mCqzQjSo1beuBWfRFy3\n   1fHpR2QJgiAIgiAIgiAIQpoZc45c8HhGd2WJYUyy5oIgCP5oRPhuEQQh7vvPVuAe34q5x1lH\n   uJFh15J7HRt9Z7MJ9iKwg1fP72kG4osqz3ynUlNPHjhC2i5/9UypX8DOa6bSa0hfAbsf33zE\n   /EPLr7NtOYj4zlTfD+v7dG0r8uzhXM39qEPH9TtBvTNwUXK9dyv0frzE3DSxje8mZ0yNjuz8\n   zlT+S6T1OnQh7M5oo+f+Bvk67EGY/OfiPeKfTL5+hr6ZuM13k/cT4R/QC86tMfdZbf4a2Un6\n   H9L9OXNIGCoo12yDYdR7mzG+tP8yhjoTpt607tuh/6r7b1VG7yv5ya/OP7iZQXEdYyi9UNel\n   WKM83YTQE/f8qftudz9y7G/OdWlXLxTPYRm9cu+ZMutMaYuK2tnjyqpb5jnPa8+xH7n3eJFO\n   ivRGbTNC6su3PeHYM0V7OxZ/hUtWLP5ZFfzDmMYQSieU8qj78rF3fMsI+axX5fwWYvw+5t9u\n   f0VnNR964yh31bdLOce8qfYb11ndVWeUvibHfCj8tZD2LNZvTRyyW/GfQr1/OM8gob/LcPn8\n   If3iVmVT23Iu/69KaxHzOYn6XenTNw1551DW/3V5X7v6c9Tfh7jPX9TrFtqOhjgPttqeW28u\n   33192kvqs2vW7w7BeyuJcEoAAB+LCAC1xcFoAgOLVvJT0lGKVIoFANHfAiwJAAAA");
Object.fromEntries(N.values.map((e, t) => [e, t]));
var { values: Pe } = N, { AK: Fe, AL: P, AP: Ie, AS: Le, B2: Re, BA: ze, BB: Be, BK: F, CB: Ve, CL: He, CM: Ue, CP: I, CR: L, EB: We, EM: Ge, EX: Ke, GL: qe, H2: Je, H3: Ye, HH: Xe, HL: R, HY: Ze, ID: Qe, IN: $e, IS: z, JL: et, JT: tt, JV: nt, LF: B, NU: V, OP: rt, NL: H, NS: it, PO: U, PR: W, RI: at, SP: G, SY: ot, QU: K, VF: st, VI: ct, WJ: lt, ZW: q, ZWJ: ut } = xe, dt = /* @__PURE__ */ new Set([
	P,
	R,
	V
]), ft = /* @__PURE__ */ new Set([
	F,
	L,
	B,
	H,
	G,
	q
]), pt = /* @__PURE__ */ new Set([
	Qe,
	We,
	Ge
]), mt = /* @__PURE__ */ new Set([
	et,
	nt,
	Je,
	Ye
]), ht = /* @__PURE__ */ new Set([
	et,
	nt,
	tt,
	Je,
	Ye
]), gt = /* @__PURE__ */ new Set([nt, tt]), _t = /* @__PURE__ */ new Set([
	G,
	qe,
	lt,
	He,
	K,
	I,
	Ke,
	z,
	ot,
	F,
	L,
	B,
	H,
	q
]), vt = /* @__PURE__ */ new Set([
	-1,
	F,
	L,
	B,
	H,
	rt,
	K,
	qe,
	G,
	q
]), J = Symbol("PASS"), Y = Symbol("NO_BREAK"), X = Symbol("MAY_BREAK"), yt = Symbol("MUST_BREAK");
function bt(e) {
	return e.cur.cls === -1 && e.next.cls !== -2 ? Y : J;
}
function xt(e) {
	return e.next.cls === -2 && (e.cur.len === 0 || e.cur.len !== e.prevChunk) ? yt : J;
}
function St(e) {
	return e.cur.cls === F ? yt : J;
}
function Ct(e) {
	switch (e.cur.cls) {
		case L: return e.next.cls === B ? Y : yt;
		case B:
		case H: return yt;
	}
	return J;
}
function wt(e) {
	switch (e.next.cls) {
		case F:
		case L:
		case B:
		case H: return Y;
	}
	return J;
}
function Tt(e) {
	return e.cur.cls !== at && (e.RI = 0), e.spaces ? (e.next.cls !== G && (e.spaces = !1), Y) : J;
}
function Et(e) {
	if (e.next.cls === q) return Y;
	if (e.next.cls === G) switch (e.cur.cls) {
		case q:
		case rt:
		case K:
		case He:
		case I:
		case Re: break;
		default: return Y;
	}
	return J;
}
function Dt(e) {
	return e.LB8 ? (e.LB8 = !1, X) : e.cur.cls === q ? e.next.cls === G ? (e.LB8 = !0, Y) : X : J;
}
function Ot(e) {
	return e.cur.cls === ut ? Y : J;
}
function kt(e) {
	return !ft.has(e.cur.cls) && (e.next.cls === Ue || e.next.cls === ut) ? (e.next.ignored = !0, Y) : J;
}
function At(e) {
	return e.cur.cls === Ue && (e.cur.cls = P), e.next.cls === Ue && (e.next.cls = P), J;
}
function jt(e) {
	return e.next.cls === lt || e.cur.cls === lt ? Y : J;
}
function Mt(e) {
	return e.cur.cls === qe ? Y : J;
}
function Nt(e) {
	if (e.next.cls === qe) switch (e.cur.cls) {
		case G:
		case ze:
		case Ze:
		case Xe: return J;
		default: return Y;
	}
	return J;
}
function Pt(e) {
	switch (e.next.cls) {
		case He:
		case I:
		case Ke:
		case ot: return Y;
	}
	return J;
}
function Ft(e) {
	return e.cur.cls === rt ? (e.next.cls === G && (e.spaces = !0), Y) : J;
}
function It(e) {
	return vt.has(e.prev.cls) && /^\p{Pi}$/u.test(e.cur.char) && e.cur.cls === K ? (e.spaces = !0, Y) : J;
}
function Lt(e) {
	if (/^\p{gc=Pf}$/u.test(e.next.char) && e.next.cls === K) {
		let t = e.afterNext();
		if (!t || _t.has(t.cls)) return Y;
	}
	return J;
}
function Rt(e) {
	return e.cur.cls === G && e.next.cls === z && e.afterNext()?.cls === V ? X : J;
}
function zt(e) {
	return e.next.cls === z ? Y : J;
}
function Bt(e) {
	if (e.cur.cls === He || e.cur.cls === I) {
		if (e.classAfterSpaces(e.cur.len) === it) return e.next.cls === G && (e.spaces = !0), Y;
		if (e.next.cls === G) return Y;
	}
	return J;
}
function Vt(e) {
	if (e.cur.cls === Re) {
		if (e.classAfterSpaces(e.cur.len) === Re) return e.next.cls === G && (e.spaces = !0), Y;
		if (e.next.cls === G) return Y;
	}
	return J;
}
function Ht(e) {
	return e.cur.cls === G ? X : J;
}
function Ut(e) {
	return e.next.cls === K && !/^\p{Pi}$/u.test(e.next.char) || e.cur.cls === K && !/^\p{Pf}$/u.test(e.cur.char) ? Y : J;
}
function Wt(e) {
	if (!N.get(e.cur.cp) && e.next.cls === K) return Y;
	if (e.next.cls === K) {
		let t = e.afterNext();
		if (!t || !N.get(t.cp)) return Y;
	}
	return e.cur.cls === K && !N.get(e.next.cp) || (e.prev.cls === -1 || !N.get(e.prev.cp)) && e.cur.cls === K ? Y : J;
}
function Gt(e) {
	return e.cur.cls === Ve || e.next.cls === Ve ? X : J;
}
var Kt = /* @__PURE__ */ new Set([
	-1,
	F,
	L,
	B,
	H,
	G,
	q,
	Ve,
	qe
]);
function qt(e) {
	return Kt.has(e.prev.cls) && (e.cur.cls === Ze || e.cur.cls === Xe) && (e.next.cls === P || e.next.cls === R) ? Y : J;
}
function Jt(e) {
	if (e.cur.cls === Be) return Y;
	switch (e.next.cls) {
		case ze:
		case Xe:
		case Ze:
		case it: return Y;
	}
	return J;
}
function Yt(e) {
	return e.prev.cls === R && (e.cur.cls === Ze || e.cur.cls === Xe) && e.next.cls !== R ? Y : J;
}
function Xt(e) {
	return e.cur.cls === ot && e.next.cls === R ? Y : J;
}
function Zt(e) {
	return e.next.cls === $e ? Y : J;
}
function Qt(e) {
	switch (e.cur.cls) {
		case P:
		case R:
			if (e.next.cls === V) return Y;
			break;
		case V: if (e.next.cls === P || e.next.cls === R) return Y;
	}
	return J;
}
function $t(e) {
	return e.cur.cls === W && pt.has(e.next.cls) || e.next.cls === U && pt.has(e.cur.cls) ? Y : J;
}
function en(e) {
	return (e.cur.cls === W || e.cur.cls === U) && (e.next.cls === P || e.next.cls === R) || (e.cur.cls === P || e.cur.cls === R) && (e.next.cls === W || e.next.cls === U) ? Y : J;
}
var tn = /* @__PURE__ */ new Set([U, W]), nn = /* @__PURE__ */ new Set([He, I]);
function rn(e) {
	let t = null;
	if (tn.has(e.next.cls) ? t = nn.has(e.cur.cls) ? e.prev.len : e.cur.len : e.next.cls === V && (t = e.cur.len), t !== null) SyIsLoop: for (let { cls: n } of e.codePoints(t, !1)) switch (n) {
		case ot:
		case z: continue;
		case V: return Y;
		default: break SyIsLoop;
	}
	if (e.cur.cls === U || e.cur.cls === W) {
		if (e.next.cls === rt) {
			let t = e.afterNext();
			if (t && (t.cls === V || t.cls === z && e.afterNext(2)?.cls === V)) return Y;
		} else if (e.next.cls === V) return Y;
	}
	return e.cur.cls === Ze && e.next.cls === V || e.cur.cls === z && e.next.cls === V ? Y : J;
}
function an(e) {
	switch (e.cur.cls) {
		case et:
			if (mt.has(e.next.cls)) return Y;
			break;
		case nt:
		case Je:
			if (gt.has(e.next.cls)) return Y;
			break;
		case tt:
		case Ye: if (e.next.cls === tt) return Y;
	}
	return J;
}
function on(e) {
	switch (e.cur.cls) {
		case et:
		case nt:
		case tt:
		case Je:
		case Ye:
			if (e.next.cls === U) return Y;
			break;
		case W: if (ht.has(e.next.cls)) return Y;
	}
	return J;
}
function sn(e) {
	return (e.cur.cls === P || e.cur.cls === R) && (e.next.cls === P || e.next.cls === R) ? Y : J;
}
function cn(e) {
	let { prev: t, cur: n, next: r } = e;
	function i(e) {
		return e.cls === Fe || e.char === "◌" || e.cls === Le;
	}
	return n.cls === Ie && i(r) || i(n) && (r.cls === st || r.cls === ct) || i(t) && n.cls === ct && (r.cls === Fe || r.char === "◌") || i(n) && i(r) && e.afterNext()?.cls === st ? Y : J;
}
function ln(e) {
	return e.cur.cls === z && (e.next.cls === P || e.next.cls === R) ? Y : J;
}
function un(e) {
	switch (e.cur.cls) {
		case P:
		case R:
		case V:
			if (e.next.cls === rt && !N.get(e.next.cp)) return Y;
			break;
		case I: if (!N.get(e.cur.cp) && dt.has(e.next.cls)) return Y;
	}
	return J;
}
function dn(e) {
	if (e.cur.cls === at) {
		if (e.next.cls === at && ++e.RI % 2 != 0) return Y;
	} else e.RI = 0;
	return J;
}
function fn(e) {
	return e.cur.cls === We && e.next.cls === Ge || e.next.cls === Ge && /^\p{ExtPict}$/u.test(e.cur.char) && /^\p{gc=Cn}$/u.test(e.cur.char) ? Y : J;
}
function pn() {
	return X;
}
var mn = [
	bt,
	xt,
	St,
	Ct,
	wt,
	Tt,
	Et,
	Dt,
	Ot,
	kt,
	At,
	jt,
	Mt,
	Nt,
	Pt,
	Ft,
	It,
	Lt,
	Rt,
	zt,
	Bt,
	Vt,
	Ht,
	Ut,
	Wt,
	Gt,
	qt,
	Yt,
	Jt,
	Xt,
	Zt,
	Qt,
	$t,
	en,
	rn,
	an,
	on,
	sn,
	cn,
	ln,
	un,
	dn,
	fn,
	pn
], hn = class {
	#e;
	constructor(e = {}) {
		if (this.#e = {
			string: !1,
			example7: !1,
			verbose: !1,
			...e
		}, this.rules = [...mn], this.#e.example7) throw Error("'example7' flag deprecated");
		this.#e.verbose && this.rules.unshift((e) => (console.log(e.cur.len, e), J));
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
				case J: break;
				case Y: return this.#e.verbose && console.log(`  ${t.name}: NO_BREAK`), null;
				case X: return this.#e.verbose && console.log(`  ${t.name}: MAY_BREAK`), new Ne(e.cur.len);
				case yt: return this.#e.verbose && console.log(`  ${t.name}: MUST_BREAK`), new Ne(e.cur.len, !0);
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
		let t = new Me(e);
		for (let e of t.codePoints(0)) t.push(e), yield* this.#n(t);
		t.pushEnd(), yield* this.#n(t);
	}
};
//#endregion
//#region src/text-layout.ts
function gn(e, t) {
	let n = new Intl.Segmenter(t, { granularity: "grapheme" }), r = /* @__PURE__ */ new Set([0]);
	for (let t of n.segment(e)) r.add(t.index + t.segment.length);
	return r;
}
var _n = class {
	#e = new hn();
	#t;
	constructor(e = "ja") {
		this.#t = e;
	}
	getBreakOpportunities(e) {
		let t = gn(e, this.#t), n = /* @__PURE__ */ new Map();
		for (let r of this.#e.breaks(e)) t.has(r.position) && n.set(r.position, (n.get(r.position) ?? !1) || r.required);
		return Object.freeze([...n].sort(([e], [t]) => e - t).map(([e, t]) => Object.freeze({
			position: e,
			required: t
		})));
	}
}, vn = /* @__PURE__ */ new Map(), yn = /\r\n|[\n\r\v\f\u0085\u2028\u2029]/gu;
function bn(e) {
	let t = vn.get(e);
	if (t) return t;
	let n = new _n(e);
	return vn.set(e, n), n;
}
function xn(e, t) {
	if (!Number.isFinite(e) || e < 0) throw TypeError(`${t} must return a non-negative finite number.`);
	return e;
}
function Sn(e, t, n) {
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
function Cn(e, t, n, r, i) {
	if (e.length === 0) return [{
		text: "",
		start: t,
		end: t,
		width: 0
	}];
	let a = gn(e, i), o = [...a].sort((e, t) => e - t), s = Sn(e, r, a), c = [], l = 0;
	for (; l < e.length;) {
		let r = s.find((e) => e.position > l && e.required)?.position ?? e.length, i, a = 0;
		for (let t of s) {
			if (t.position <= l || t.position > r) continue;
			let o = e.slice(l, t.position), s = xn(n.measureText(o), "measureText");
			s <= n.maxWidth && (i = t.position, a = s);
		}
		if (i === void 0) {
			let t = o.filter((e) => e > l && e <= r);
			for (let r of t) {
				let t = e.slice(l, r), o = xn(n.measureText(t), "measureText");
				o <= n.maxWidth && (i = r, a = o);
			}
			i === void 0 && (i = t[0] ?? r, a = xn(n.measureText(e.slice(l, i)), "measureText"));
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
function wn(e) {
	if (typeof e.text != "string") throw TypeError("text must be a string.");
	if (!Number.isFinite(e.maxWidth) || e.maxWidth <= 0) throw TypeError("maxWidth must be a positive finite number.");
	if (typeof e.measureText != "function") throw TypeError("measureText must be a function.");
	let t = e.locale ?? "ja", n = e.lineBreakProvider ?? bn(t), r = [], i = 0;
	for (let a of e.text.matchAll(yn)) {
		let o = a.index;
		r.push(...Cn(e.text.slice(i, o), i, e, n, t)), i = o + a[0].length;
	}
	return r.push(...Cn(e.text.slice(i), i, e, n, t)), Object.freeze({
		lines: Object.freeze(r.map((e) => Object.freeze(e))),
		maxLineWidth: Math.max(0, ...r.map((e) => e.width))
	});
}
//#endregion
//#region src/bubble-svg.ts
var Tn = Object.freeze([
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
]);
function En(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function Dn(e, t) {
	let n = e ?? t;
	if (!Number.isFinite(n) || n <= 0) throw TypeError("Bubble SVG dimensions must be positive and finite.");
	return n;
}
function On(e) {
	if (e === null) return null;
	let t = e ?? 180;
	if (!Number.isFinite(t)) throw TypeError("tailDirection must be finite.");
	return (t % 360 + 360) % 360;
}
function kn(e) {
	return e.map(({ x: e, y: t }) => `${e.toFixed(2)},${t.toFixed(2)}`).join(" ");
}
function An(e, t, n) {
	let r = e / 2, i = t / 2, a = n * Math.PI / 180, o = Math.sin(a), s = -Math.cos(a), c = e / 2 - 25, l = t / 2 - 25, u = Math.abs(o) < 1e-9 ? Infinity : c / Math.abs(o), d = Math.abs(s) < 1e-9 ? Infinity : l / Math.abs(s), f = Math.min(u, d), p = {
		x: r + o * f,
		y: i + s * f
	}, m = {
		x: -s,
		y: o
	};
	return {
		base: [{
			x: p.x + m.x * 8,
			y: p.y + m.y * 8
		}, {
			x: p.x - m.x * 8,
			y: p.y - m.y * 8
		}],
		tip: {
			x: r + o * (f + 18),
			y: i + s * (f + 18)
		}
	};
}
function jn(e, t, n, r, i = "") {
	return `<rect x="24" y="24" width="${e - 48}" height="${t - 48}" rx="18" fill="${n}" stroke="${r}" stroke-width="3" ${i}/>`;
}
function Mn(e, t, n, r, i) {
	let a = An(e, t, n);
	return `<polygon points="${kn([
		a.base[0],
		a.tip,
		a.base[1]
	])}" fill="${r}" stroke="${i}" stroke-width="3" stroke-linejoin="round"/>`;
}
function Nn(e, t, n, r) {
	let i = e - 24, a = t - 24, o = e / 2, s = t / 2;
	return `<path d="M 42 ${s}
    C 22 ${s - 20}, 32 42, 60 44
    C 68 22, ${o - 18} 19, ${o} 37
    C ${o + 24} 16, ${i - 28} 24, ${i - 30} 48
    C ${i + 2} 42, ${i + 7} ${s - 3}, ${i - 3} ${s + 15}
    C ${i + 8} ${a - 10}, ${i - 20} ${a + 7}, ${i - 42} ${a - 7}
    C ${i - 55} ${a + 12}, ${o + 12} ${a + 7}, ${o} ${a - 7}
    C ${o - 24} ${a + 12}, 66 ${a + 7}, 62 ${a - 12}
    C 31 ${a + 2}, 17 ${s + 20}, 42 ${s} Z"
    fill="${n}" stroke="${r}" stroke-width="3" stroke-linejoin="round"/>`;
}
function Pn(e, t, n, r, i, a) {
	let o = An(e, t, n), s = {
		x: (o.base[0].x + o.base[1].x) / 2,
		y: (o.base[0].y + o.base[1].y) / 2
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
	}]).map(({ ratio: e, radius: t }) => `<circle cx="${s.x + (o.tip.x - s.x) * e}" cy="${s.y + (o.tip.y - s.y) * e}" r="${t}" fill="${r}" stroke="${i}" stroke-width="2"/>`).join("");
}
function Fn(e, t, n, r) {
	let i = e / 2, a = t / 2;
	return `<polygon points="${kn(Array.from({ length: 28 }, (n, r) => {
		let o = r * Math.PI * 2 / 28 - Math.PI / 2, s = r % 2 == 0, c = s ? e / 2 - 6 : e / 2 - 22, l = s ? t / 2 - 6 : t / 2 - 22;
		return {
			x: i + Math.cos(o) * c,
			y: a + Math.sin(o) * l
		};
	}))}" fill="${n}" stroke="${r}" stroke-width="3" stroke-linejoin="round"/>`;
}
function In(e, t, n, r) {
	let i = e - 24, a = t - 24;
	return `<path d="M 38 24
    Q 51 32 64 24
    T 90 24 T 116 24 T 142 24
    T ${i - 14} 24 Q ${i} 24 ${i} 38
    Q ${i - 8} 51 ${i} 64
    T ${i} ${a - 14} Q ${i} ${a} ${i - 14} ${a}
    Q ${i - 27} ${a - 8} ${i - 40} ${a}
    T 90 ${a} T 64 ${a} T 38 ${a}
    Q 24 ${a} 24 ${a - 14}
    Q 32 ${a - 27} 24 ${a - 40}
    T 24 38 Q 24 24 38 24 Z"
    fill="${n}" stroke="${r}" stroke-width="3"/>`;
}
function Ln(e, t, n, r, i, a) {
	switch (e) {
		case "NO_BUBBLE": return "";
		case "THINKING": return `${r === null ? "" : Pn(t, n, r, i, a, !1)}${Nn(t, n, i, a)}`;
		case "DREAMING": return `${r === null ? "" : Pn(t, n, r, i, a, !0)}${Nn(t, n, i, a)}`;
		case "YELLING": return Fn(t, n, i, a);
		case "WAVY": return `${r === null ? "" : Mn(t, n, r, i, a)}${In(t, n, i, a)}`;
		case "WHISPERING": return `${r === null ? "" : Mn(t, n, r, i, a)}${jn(t, n, i, a, "stroke-dasharray=\"5 5\"")}`;
		case "ANNOUNCEMENT": return `${r === null ? "" : Mn(t, n, r, i, a)}${jn(t, n, i, a)}<rect x="30" y="30" width="${t - 60}" height="${n - 60}" rx="13" fill="none" stroke="${a}" stroke-width="1.5"/>`;
		case "NARRATION": return `<rect x="24" y="24" width="${t - 48}" height="${n - 48}" fill="${i}" stroke="${a}" stroke-width="3"/>`;
		case "OFF_PANEL": return `${r === null ? "" : Mn(t, n, r, i, a)}${jn(t, n, i, a)}`;
		case "NORMAL": return `${r === null ? "" : Mn(t, n, r, i, a)}${jn(t, n, i, a)}`;
	}
}
function Rn(e) {
	if (!Tn.includes(e.style)) throw TypeError(`Unsupported Bubble visual style: ${String(e.style)}`);
	if (!Array.isArray(e.lines) || e.lines.some((e) => typeof e != "string")) throw TypeError("lines must be an array of strings.");
	let t = Dn(e.width, 220), n = Dn(e.height, 112), r = Dn(e.fontSize, 15), i = On(e.tailDirection), a = e.fillColor ?? "#fff4cc", o = e.borderColor ?? "#6f5b45", s = e.textColor ?? "#25283a", c = e.fontFamily ?? "Noto Sans JP, sans-serif", l = r * 1.35, u = n / 2 - (e.lines.length - 1) * l / 2 + r * .35, d = e.lines.map((e, n) => `<text x="${t / 2}" y="${u + n * l}" text-anchor="middle" fill="${En(s)}" font-family="${En(c)}" font-size="${r}">${En(e)}</text>`).join(""), f = En(e.title ?? `${e.style} bubble`);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${n}" viewBox="0 0 ${t} ${n}" role="img" data-bubble-renderer="canonical" data-bubble-style="${e.style}"><title>${f}</title>${Ln(e.style, t, n, i, a, o)}${d}</svg>`;
}
//#endregion
//#region src/composition.ts
var Z = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleCompositionError", this.code = e;
	}
}, zn = /* @__PURE__ */ new Set(["say", "think"]), Bn = /* @__PURE__ */ new Set([
	"idle",
	"speaking",
	"waiting"
]);
function Q(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Vn(e, t, n, r) {
	let i = /* @__PURE__ */ new Set([...t, ...n]), a = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t)), o = Object.keys(e).filter((e) => !i.has(e));
	if (a.length > 0 || o.length > 0) throw new Z("BUBBLE-COMPOSITION-001", `${r} has missing or unknown properties.`);
}
function $(e, t) {
	if (typeof e != "string" || e.trim().length === 0) throw new Z("BUBBLE-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e.trim();
}
function Hn(e, t, n) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", `${t} must be an object.`);
	if (Vn(e, ["frames", "frameIntervalSeconds"], [], t), !Array.isArray(e.frames) || e.frames.length < n) throw new Z("BUBBLE-COMPOSITION-001", `${t}.frames must contain at least ${n} image asset name${n === 1 ? "" : "s"}.`);
	let r = Object.freeze(e.frames.map((e, n) => $(e, `${t}.frames[${n}]`))), i = e.frameIntervalSeconds;
	if (typeof i != "number" || !Number.isFinite(i) || i <= 0) throw new Z("BUBBLE-COMPOSITION-001", `${t}.frameIntervalSeconds must be a positive finite number.`);
	return Object.freeze({
		frames: r,
		frameIntervalSeconds: i
	});
}
function Un(e) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble portrait must be an object.");
	Vn(e, ["base"], ["blink", "talk"], "Bubble portrait");
	let t = e.blink === void 0 ? void 0 : Hn(e.blink, "Bubble portrait blink", 1), n = e.talk === void 0 ? void 0 : Hn(e.talk, "Bubble portrait talk", 1);
	return Object.freeze({
		base: $(e.base, "Bubble portrait base"),
		...t === void 0 ? {} : { blink: t },
		...n === void 0 ? {} : { talk: n }
	});
}
function Wn(e) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble style must be an object.");
	Vn(e, ["name", "textStyle"], [
		"placement",
		"portrait",
		"advanceIndicator"
	], "Bubble style");
	let t = e.portrait === void 0 ? void 0 : Un(e.portrait), n = e.advanceIndicator === void 0 ? void 0 : Hn(e.advanceIndicator, "Bubble advance indicator", 2), r;
	try {
		r = c(e.placement ?? "up-right");
	} catch (e) {
		throw new Z("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble placement is invalid.");
	}
	return Object.freeze({
		name: $(e.name, "Bubble style name"),
		textStyle: $(e.textStyle, "Bubble text style name"),
		placement: r,
		...t === void 0 ? {} : { portrait: t },
		...n === void 0 ? {} : { advanceIndicator: n }
	});
}
function Gn(e) {
	if (!Q(e) || typeof e.applyToTarget != "function" || typeof e.getMimeType != "function" || typeof e.isRegistered != "function") throw TypeError("Bubble asset manager must provide applyToTarget, getMimeType, and isRegistered.");
	return e;
}
function Kn(e) {
	if (!Q(e) || typeof e.setText != "function" || typeof e.releaseTarget != "function") throw TypeError("Bubble SVG Text composition must provide setText and releaseTarget.");
	return e;
}
function qn() {
	return Object.freeze({
		setTimeout: (e, t) => globalThis.setTimeout(e, t),
		clearTimeout: (e) => globalThis.clearTimeout(e)
	});
}
function Jn(e) {
	if (!Q(e) || typeof e.setTimeout != "function" || typeof e.clearTimeout != "function") throw TypeError("Bubble scheduler must provide setTimeout and clearTimeout.");
	return e;
}
function Yn(e, t) {
	if (!Q(e) || typeof e.id != "string" || e.id.length === 0 || typeof e.isStage != "boolean") throw new Z("BUBBLE-COMPOSITION-004", `${t} must provide id and isStage.`);
	return e;
}
function Xn(e) {
	if (!Q(e) || typeof e.drawableID != "number" || !Number.isInteger(e.drawableID) || e.drawableID < 0) throw new Z("BUBBLE-COMPOSITION-004", "Bubble text target must provide a non-negative integer drawableID.");
	return e;
}
function Zn(e, t) {
	if (!Q(e) || !Q(e.targets) || typeof e.setLayerVisible != "function" || typeof e.show != "function" || typeof e.hide != "function" || typeof e.dispose != "function") throw new Z("BUBBLE-COMPOSITION-004", "Bubble surface is invalid.");
	let n = e.targets;
	Xn(n.text);
	let r = /* @__PURE__ */ new Set(), i = (e, t) => {
		let i = n[e];
		if (!t && i === void 0) return;
		let a = Yn(i, `Bubble surface ${e}`);
		if (r.has(a.id)) throw new Z("BUBBLE-COMPOSITION-004", "Bubble image layers must use distinct target IDs.");
		r.add(a.id);
	};
	return i("portraitBase", t.portrait !== void 0), i("portraitBlink", t.portrait?.blink !== void 0), i("portraitTalk", t.portrait?.talk !== void 0), i("advanceIndicator", t.advanceIndicator !== void 0), e;
}
function Qn(e, t) {
	if (!e.isRegistered(t)) throw new Z("BUBBLE-COMPOSITION-003", `Bubble image asset is not registered: ${t}`);
	if (!e.getMimeType(t).startsWith("image/")) throw new Z("BUBBLE-COMPOSITION-003", `Bubble asset is not an image: ${t}`);
}
function $n(e) {
	return [...e.portrait === void 0 ? [] : [
		e.portrait.base,
		...e.portrait.blink?.frames ?? [],
		...e.portrait.talk?.frames ?? []
	], ...e.advanceIndicator?.frames ?? []];
}
function er(e, t) {
	if (e.length === 1) throw e[0];
	if (e.length > 1) throw AggregateError(e, t);
}
function tr(e) {
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
function nr(e) {
	if (!Q(e)) throw new Z("BUBBLE-COMPOSITION-001", "Show bubble input must be an object.");
	if (Vn(e, [
		"actor",
		"actorKey",
		"kind",
		"text",
		"styleName"
	], ["phase"], "Show bubble input"), !zn.has(e.kind)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble kind must be say or think.");
	if (typeof e.text != "string") throw new Z("BUBBLE-COMPOSITION-001", "Bubble text must be a string.");
	let t = e.phase ?? "speaking";
	if (!Bn.has(t)) throw new Z("BUBBLE-COMPOSITION-001", "Bubble phase is invalid.");
	return {
		actor: e.actor,
		actorKey: $(e.actorKey, "Bubble actor key"),
		kind: e.kind,
		text: e.text,
		styleName: $(e.styleName, "Bubble style name"),
		phase: t
	};
}
function rr(e) {
	if (!Q(e)) throw TypeError("Bubble composition options must be an object.");
	let t = Gn(e.assetManager), n = Kn(e.svgText);
	if (typeof e.createSurface != "function") throw TypeError("Bubble composition createSurface must be a function.");
	if (e.onAnimationError !== void 0 && typeof e.onAnimationError != "function") throw TypeError("Bubble composition onAnimationError must be a function.");
	let r = Jn(e.scheduler ?? qn()), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = !1, c = () => {
		if (s) throw new Z("BUBBLE-COMPOSITION-005", "Bubble composition has been disposed.");
	}, l = async (e, t) => {
		let n = (o.get(e) ?? Promise.resolve()).catch(() => void 0).then(t);
		o.set(e, n);
		try {
			return await n;
		} finally {
			o.get(e) === n && o.delete(e);
		}
	}, u = async (o) => {
		c();
		let s = i.get(o.styleName);
		if (!s) throw new Z("BUBBLE-COMPOSITION-002", `Bubble style is not defined: ${o.styleName}`);
		for (let e of new Set($n(s))) Qn(t, e);
		let l = a.get(o.actorKey);
		l && await l.close();
		let u, d = !1, f = !1, p, m, h;
		try {
			u = Zn(await e.createSurface(Object.freeze({
				actor: o.actor,
				actorKey: o.actorKey,
				kind: o.kind,
				style: s
			})), s), n.setText({
				styleName: s.textStyle,
				target: u.targets.text,
				text: o.text
			}), d = !0;
			let i = [];
			if (s.portrait) {
				i.push(t.applyToTarget(s.portrait.base, u.targets.portraitBase));
				let e = s.portrait.blink?.frames[0];
				e !== void 0 && i.push(t.applyToTarget(e, u.targets.portraitBlink));
				let n = s.portrait.talk?.frames[0];
				n !== void 0 && i.push(t.applyToTarget(n, u.targets.portraitTalk));
			}
			let c = s.advanceIndicator?.frames[0];
			c !== void 0 && i.push(t.applyToTarget(c, u.targets.advanceIndicator)), await Promise.all(i), p = s.portrait?.blink === void 0 ? void 0 : tr({
				actorKey: o.actorKey,
				layer: "portraitBlink",
				animation: s.portrait.blink,
				target: u.targets.portraitBlink,
				assetManager: t,
				scheduler: r,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), m = s.portrait?.talk === void 0 ? void 0 : tr({
				actorKey: o.actorKey,
				layer: "portraitTalk",
				animation: s.portrait.talk,
				target: u.targets.portraitTalk,
				assetManager: t,
				scheduler: r,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), h = s.advanceIndicator === void 0 ? void 0 : tr({
				actorKey: o.actorKey,
				layer: "advanceIndicator",
				animation: s.advanceIndicator,
				target: u.targets.advanceIndicator,
				assetManager: t,
				scheduler: r,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			});
			let l = "idle", ee = !1, g = Promise.resolve(), _ = async (e) => {
				e !== l && (e === "speaking" ? (await h?.stop(), await u?.setLayerVisible("advanceIndicator", !1), await u?.setLayerVisible("portraitTalk", m !== void 0), await m?.start({ primed: !0 })) : e === "waiting" ? (await m?.stop({ reset: !0 }), await u?.setLayerVisible("portraitTalk", !1), await u?.setLayerVisible("advanceIndicator", h !== void 0), await h?.start({ primed: !0 })) : (await Promise.all([m?.stop({ reset: !0 }), h?.stop()]), await Promise.all([u?.setLayerVisible("portraitTalk", !1), u?.setLayerVisible("advanceIndicator", !1)])), l = e);
			};
			await Promise.all([
				u.setLayerVisible("portraitBase", s.portrait !== void 0),
				u.setLayerVisible("portraitBlink", s.portrait?.blink !== void 0),
				u.setLayerVisible("portraitTalk", !1),
				u.setLayerVisible("advanceIndicator", !1)
			]), await u.show(), f = !0, await p?.start({ primed: !0 }), await _(o.phase);
			let te = Object.freeze({
				actorKey: o.actorKey,
				kind: o.kind,
				get phase() {
					return l;
				},
				setPhase(e) {
					return ee ? Promise.reject(new Z("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${o.actorKey}`)) : Bn.has(e) ? (g = g.then(() => _(e)), g) : Promise.reject(new Z("BUBBLE-COMPOSITION-001", "Bubble phase is invalid."));
				},
				async close() {
					if (ee) return;
					ee = !0;
					let e = [];
					try {
						await g;
					} catch (t) {
						e.push(t);
					}
					for (let t of [
						() => p?.stop(),
						() => m?.stop(),
						() => h?.stop(),
						async () => {
							f && await u?.hide();
						},
						async () => {
							d && u && n.releaseTarget(u.targets.text);
						},
						async () => u?.dispose()
					]) try {
						await t();
					} catch (t) {
						e.push(t);
					}
					a.get(o.actorKey) === te && a.delete(o.actorKey), er(e, `Failed to close bubble: ${o.actorKey}`);
				}
			});
			return a.set(o.actorKey, te), te;
		} catch (e) {
			let t = [], r = await Promise.allSettled([
				p?.stop(),
				m?.stop(),
				h?.stop()
			]);
			if (t.push(...r.flatMap((e) => e.status === "rejected" ? [e.reason] : [])), f && u) try {
				await u.hide();
			} catch (e) {
				t.push(e);
			}
			if (d && u) try {
				n.releaseTarget(u.targets.text);
			} catch (e) {
				t.push(e);
			}
			if (u) try {
				await u.dispose();
			} catch (e) {
				t.push(e);
			}
			throw t.length > 0 ? AggregateError([e, ...t], `Failed to show and clean up bubble: ${o.actorKey}`, { cause: e }) : e;
		}
	};
	return Object.freeze({
		defineStyle(e) {
			c();
			let t = Wn(e);
			i.set(t.name, t);
		},
		hasActiveBubble(e) {
			return a.has($(e, "Bubble actor key"));
		},
		async show(e) {
			c();
			let t = nr(e);
			return l(t.actorKey, () => u(t));
		},
		releaseTarget(e) {
			c();
			let t = $(e, "Bubble actor key");
			return l(t, async () => {
				await a.get(t)?.close();
			});
		},
		async releaseAll() {
			c(), await Promise.allSettled([...o.values()]), er((await Promise.allSettled([...a.values()].map((e) => e.close()))).flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to release all bubbles");
		},
		async dispose() {
			if (s) return;
			s = !0, await Promise.allSettled([...o.values()]);
			let e = await Promise.allSettled([...a.values()].map((e) => e.close()));
			i.clear(), er(e.flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to dispose bubble composition");
		}
	});
}
//#endregion
export { Z as BubbleCompositionError, _n as UnicodeLineBreakProvider, n as bubbleBackgroundRegions, t as bubbleDirectionAliases, e as bubbleDirectionNames, Tn as bubbleVisualStyles, rr as createBubbleComposition, r as defaultBubblePlacementInput, c as normalizeBubblePlacement, Rn as renderBubbleSvg, wn as wrapText };
