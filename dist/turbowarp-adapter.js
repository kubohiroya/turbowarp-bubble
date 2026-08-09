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
}) : o, n)), l = [
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
], u = [
	"HEADER_LIKE",
	"CENTER",
	"FOOTER_LIKE"
], d = /* @__PURE__ */ new Map([
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
]), f = new Set(l), p = new Set(u), m = Math.SQRT2 - 1, h = Object.freeze({
	down: {
		x: 0,
		y: -1
	},
	"down-down-left": {
		x: -m,
		y: -1
	},
	"down-down-right": {
		x: m,
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
		y: -m
	},
	"left-up-left": {
		x: -1,
		y: m
	},
	right: {
		x: 1,
		y: 0
	},
	"right-down-right": {
		x: 1,
		y: -m
	},
	"right-up-right": {
		x: 1,
		y: m
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
		x: -m,
		y: 1
	},
	"up-up-right": {
		x: m,
		y: 1
	}
});
function g(e) {
	return Math.abs(e) < 1e-12 ? 0 : Math.abs(1 - Math.abs(e)) < 1e-12 ? Math.sign(e) : e;
}
function _(e) {
	if (typeof e == "number") {
		if (!Number.isFinite(e) || e < 0 || e > 360) throw TypeError("Bubble placement angle must be from 0 through 360.");
		return Object.freeze({
			basis: "actor",
			direction: e === 360 ? 0 : e
		});
	}
	if (typeof e != "string" || e.trim().length === 0) throw TypeError("Bubble placement must be a direction, angle, or region.");
	let t = e.trim(), n = t.toUpperCase();
	if (p.has(n)) return Object.freeze({
		basis: "background",
		region: n
	});
	let r = t.toLowerCase();
	if (f.has(r)) return Object.freeze({
		basis: "actor",
		direction: r
	});
	let i = d.get(r);
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
function v(e) {
	if (typeof e == "string") return h[e];
	let t = e * Math.PI / 180;
	return Object.freeze({
		x: g(Math.sin(t)),
		y: g(Math.cos(t))
	});
}
//#endregion
//#region src/actor-transform.ts
var y = Object.freeze({
	x: 0,
	y: 0,
	scalePercent: 100
});
function b(e, t) {
	if (typeof e != "number" || !Number.isFinite(e)) throw TypeError(`${t} must be a finite number.`);
	return e;
}
function x(e) {
	let t = b(e, "Bubble distance");
	if (t < 0) throw TypeError("Bubble distance must be zero or greater.");
	return t;
}
function S(e) {
	let t = b(e, "Bubble tail length");
	if (t <= 0) throw TypeError("Bubble tail length must be greater than zero.");
	return t;
}
function C(e) {
	if (!Array.isArray(e) || e.length !== 2 && e.length !== 3) throw TypeError("Bubble offset must be [x, y] or [x, y, scale].");
	let t = b(e[0], "Bubble offset x"), n = b(e[1], "Bubble offset y"), r = b(e.length === 3 ? e[2] : 100, "Bubble offset scale");
	if (r <= 0) throw TypeError("Bubble offset scale must be greater than zero.");
	return Object.freeze({
		x: t,
		y: n,
		scalePercent: r
	});
}
function ee(e) {
	let t = (e.bounds.left + e.bounds.right) / 2, n = (e.bounds.top + e.bounds.bottom) / 2, r = v(e.direction), i = e.distance + e.tailLength, a = r.x < 0 ? t - e.bounds.left + i + e.bubbleWidth / 2 : e.bounds.right - t + i + e.bubbleWidth / 2, o = r.y < 0 ? n - e.bounds.bottom + i + e.bubbleHeight / 2 : e.bounds.top - n + i + e.bubbleHeight / 2, s = Math.min(r.x === 0 ? Infinity : a / Math.abs(r.x), r.y === 0 ? Infinity : o / Math.abs(r.y));
	return Object.freeze({
		x: t + r.x * s + e.offset.x,
		y: n + r.y * s + e.offset.y
	});
}
//#endregion
//#region node_modules/.pnpm/jsclipper@https+++codeload.github.com+platener+jsclipper+tar.gz+56aed19845113e1939d8971c47233054659436b1/node_modules/jsclipper/jsclipper.js
var w = /* @__PURE__ */ o(((e, t) => {
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
		function ee() {
			for (var e = this.s & this.DM; this.t > 0 && this[this.t - 1] == e;) --this.t;
		}
		function w(e) {
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
		function te() {
			var e = l();
			return c.ZERO.subTo(this, e), e;
		}
		function T() {
			return this.s < 0 ? this.negate() : this;
		}
		function ne(e) {
			var t = this.s - e.s;
			if (t != 0) return t;
			var n = this.t;
			if (t = n - e.t, t != 0) return this.s < 0 ? -t : t;
			for (; --n >= 0;) if ((t = this[n] - e[n]) != 0) return t;
			return 0;
		}
		function re(e) {
			var t = 1, n;
			return (n = e >>> 16) != 0 && (e = n, t += 16), (n = e >> 8) != 0 && (e = n, t += 8), (n = e >> 4) != 0 && (e = n, t += 4), (n = e >> 2) != 0 && (e = n, t += 2), (n = e >> 1) != 0 && (e = n, t += 1), t;
		}
		function ie() {
			return this.t <= 0 ? 0 : this.DB * (this.t - 1) + re(this[this.t - 1] ^ this.s & this.DM);
		}
		function ae(e, t) {
			var n;
			for (n = this.t - 1; n >= 0; --n) t[n + e] = this[n];
			for (n = e - 1; n >= 0; --n) t[n] = 0;
			t.t = this.t + e, t.s = this.s;
		}
		function E(e, t) {
			for (var n = e; n < this.t; ++n) t[n - e] = this[n];
			t.t = Math.max(this.t - e, 0), t.s = this.s;
		}
		function D(e, t) {
			var n = e % this.DB, r = this.DB - n, i = (1 << r) - 1, a = Math.floor(e / this.DB), o = this.s << n & this.DM, s;
			for (s = this.t - 1; s >= 0; --s) t[s + a + 1] = this[s] >> r | o, o = (this[s] & i) << n;
			for (s = a - 1; s >= 0; --s) t[s] = 0;
			t[a] = o, t.t = this.t + a + 1, t.s = this.s, t.clamp();
		}
		function oe(e, t) {
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
		function O(e, t) {
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
		function k(e, t) {
			var n = this.abs(), r = e.abs(), i = n.t;
			for (t.t = i + r.t; --i >= 0;) t[i] = 0;
			for (i = 0; i < r.t; ++i) t[i + n.t] = n.am(0, r[i], t, i, 0, n.t);
			t.s = 0, t.clamp(), this.s != e.s && c.ZERO.subTo(t, t);
		}
		function A(e) {
			for (var t = this.abs(), n = e.t = 2 * t.t; --n >= 0;) e[n] = 0;
			for (n = 0; n < t.t - 1; ++n) {
				var r = t.am(n, t[n], e, 2 * n, 0, 1);
				(e[n + t.t] += t.am(n + 1, 2 * t[n], e, 2 * n + 1, r, t.t - n - 1)) >= t.DV && (e[n + t.t] -= t.DV, e[n + t.t + 1] = 1);
			}
			e.t > 0 && (e[e.t - 1] += t.am(n, t[n], e, 2 * n, 0, 1)), e.s = 0, e.clamp();
		}
		function j(e, t, n) {
			var r = e.abs();
			if (!(r.t <= 0)) {
				var i = this.abs();
				if (i.t < r.t) {
					t?.fromInt(0), n != null && this.copyTo(n);
					return;
				}
				n ??= l();
				var a = l(), o = this.s, s = e.s, u = this.DB - re(r[r.t - 1]);
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
		function M(e) {
			var t = l();
			return this.abs().divRemTo(e, null, t), this.s < 0 && t.compareTo(c.ZERO) > 0 && e.subTo(t, t), t;
		}
		function N(e) {
			this.m = e;
		}
		function P(e) {
			return e.s < 0 || e.compareTo(this.m) >= 0 ? e.mod(this.m) : e;
		}
		function se(e) {
			return e;
		}
		function F(e) {
			e.divRemTo(this.m, null, e);
		}
		function ce(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		function le(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		N.prototype.convert = P, N.prototype.revert = se, N.prototype.reduce = F, N.prototype.mulTo = ce, N.prototype.sqrTo = le;
		function ue() {
			if (this.t < 1) return 0;
			var e = this[0];
			if (!(e & 1)) return 0;
			var t = e & 3;
			return t = t * (2 - (e & 15) * t) & 15, t = t * (2 - (e & 255) * t) & 255, t = t * (2 - ((e & 65535) * t & 65535)) & 65535, t = t * (2 - e * t % this.DV) % this.DV, t > 0 ? this.DV - t : -t;
		}
		function de(e) {
			this.m = e, this.mp = e.invDigit(), this.mpl = this.mp & 32767, this.mph = this.mp >> 15, this.um = (1 << e.DB - 15) - 1, this.mt2 = 2 * e.t;
		}
		function fe(e) {
			var t = l();
			return e.abs().dlShiftTo(this.m.t, t), t.divRemTo(this.m, null, t), e.s < 0 && t.compareTo(c.ZERO) > 0 && this.m.subTo(t, t), t;
		}
		function pe(e) {
			var t = l();
			return e.copyTo(t), this.reduce(t), t;
		}
		function me(e) {
			for (; e.t <= this.mt2;) e[e.t++] = 0;
			for (var t = 0; t < this.m.t; ++t) {
				var n = e[t] & 32767, r = n * this.mpl + ((n * this.mph + (e[t] >> 15) * this.mpl & this.um) << 15) & e.DM;
				for (n = t + this.m.t, e[n] += this.m.am(0, r, e, t, 0, this.m.t); e[n] >= e.DV;) e[n] -= e.DV, e[++n]++;
			}
			e.clamp(), e.drShiftTo(this.m.t, e), e.compareTo(this.m) >= 0 && e.subTo(this.m, e);
		}
		function he(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		function ge(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		de.prototype.convert = fe, de.prototype.revert = pe, de.prototype.reduce = me, de.prototype.mulTo = ge, de.prototype.sqrTo = he;
		function _e() {
			return (this.t > 0 ? this[0] & 1 : this.s) == 0;
		}
		function ve(e, t) {
			if (e > 4294967295 || e < 1) return c.ONE;
			var n = l(), r = l(), i = t.convert(this), a = re(e) - 1;
			for (i.copyTo(n); --a >= 0;) if (t.sqrTo(n, r), (e & 1 << a) > 0) t.mulTo(r, i, n);
			else {
				var o = n;
				n = r, r = o;
			}
			return t.revert(n);
		}
		function ye(e, t) {
			var n = e < 256 || t.isEven() ? new N(t) : new de(t);
			return this.exp(e, n);
		}
		c.prototype.copyTo = b, c.prototype.fromInt = x, c.prototype.fromString = C, c.prototype.clamp = ee, c.prototype.dlShiftTo = ae, c.prototype.drShiftTo = E, c.prototype.lShiftTo = D, c.prototype.rShiftTo = oe, c.prototype.subTo = O, c.prototype.multiplyTo = k, c.prototype.squareTo = A, c.prototype.divRemTo = j, c.prototype.invDigit = ue, c.prototype.isEven = _e, c.prototype.exp = ve, c.prototype.toString = w, c.prototype.negate = te, c.prototype.abs = T, c.prototype.compareTo = ne, c.prototype.bitLength = ie, c.prototype.mod = M, c.prototype.modPowInt = ye, c.ZERO = S(0), c.ONE = S(1);
		function be() {
			var e = l();
			return this.copyTo(e), e;
		}
		function xe() {
			if (this.s < 0) {
				if (this.t == 1) return this[0] - this.DV;
				if (this.t == 0) return -1;
			} else if (this.t == 1) return this[0];
			else if (this.t == 0) return 0;
			return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
		}
		function I() {
			return this.t == 0 ? this.s : this[0] << 24 >> 24;
		}
		function Se() {
			return this.t == 0 ? this.s : this[0] << 16 >> 16;
		}
		function Ce(e) {
			return Math.floor(Math.LN2 * this.DB / Math.log(e));
		}
		function we() {
			return this.s < 0 ? -1 : this.t <= 0 || this.t == 1 && this[0] <= 0 ? 0 : 1;
		}
		function Te(e) {
			if (e ??= 10, this.signum() == 0 || e < 2 || e > 36) return "0";
			var t = this.chunkSize(e), n = e ** +t, r = S(n), i = l(), a = l(), o = "";
			for (this.divRemTo(r, i, a); i.signum() > 0;) o = (n + a.intValue()).toString(e).substr(1) + o, i.divRemTo(r, i, a);
			return a.intValue().toString(e) + o;
		}
		function Ee(e, t) {
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
		function De(e, t, n) {
			if (typeof t == "number") {
				if (e < 2) this.fromInt(1);
				else for (this.fromNumber(e, n), this.testBit(e - 1) || this.bitwiseTo(c.ONE.shiftLeft(e - 1), R, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(t);) this.dAddOffset(2, 0), this.bitLength() > e && this.subTo(c.ONE.shiftLeft(e - 1), this);
			} else {
				var r = [], i = e & 7;
				r.length = (e >> 3) + 1, t.nextBytes(r), i > 0 ? r[0] &= (1 << i) - 1 : r[0] = 0, this.fromString(r, 256);
			}
		}
		function Oe() {
			var e = this.t, t = [];
			t[0] = this.s;
			var n = this.DB - e * this.DB % 8, r, i = 0;
			if (e-- > 0) for (n < this.DB && (r = this[e] >> n) != (this.s & this.DM) >> n && (t[i++] = r | this.s << this.DB - n); e >= 0;) n < 8 ? (r = (this[e] & (1 << n) - 1) << 8 - n, r |= this[--e] >> (n += this.DB - 8)) : (r = this[e] >> (n -= 8) & 255, n <= 0 && (n += this.DB, --e)), r & 128 && (r |= -256), i == 0 && (this.s & 128) != (r & 128) && ++i, (i > 0 || r != this.s) && (t[i++] = r);
			return t;
		}
		function ke(e) {
			return this.compareTo(e) == 0;
		}
		function Ae(e) {
			return this.compareTo(e) < 0 ? this : e;
		}
		function je(e) {
			return this.compareTo(e) > 0 ? this : e;
		}
		function Me(e, t, n) {
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
		function Ne(e, t) {
			return e & t;
		}
		function L(e) {
			var t = l();
			return this.bitwiseTo(e, Ne, t), t;
		}
		function R(e, t) {
			return e | t;
		}
		function Pe(e) {
			var t = l();
			return this.bitwiseTo(e, R, t), t;
		}
		function Fe(e, t) {
			return e ^ t;
		}
		function Ie(e) {
			var t = l();
			return this.bitwiseTo(e, Fe, t), t;
		}
		function Le(e, t) {
			return e & ~t;
		}
		function Re(e) {
			var t = l();
			return this.bitwiseTo(e, Le, t), t;
		}
		function ze() {
			for (var e = l(), t = 0; t < this.t; ++t) e[t] = this.DM & ~this[t];
			return e.t = this.t, e.s = ~this.s, e;
		}
		function z(e) {
			var t = l();
			return e < 0 ? this.rShiftTo(-e, t) : this.lShiftTo(e, t), t;
		}
		function Be(e) {
			var t = l();
			return e < 0 ? this.lShiftTo(-e, t) : this.rShiftTo(e, t), t;
		}
		function Ve(e) {
			if (e == 0) return -1;
			var t = 0;
			return e & 65535 || (e >>= 16, t += 16), e & 255 || (e >>= 8, t += 8), e & 15 || (e >>= 4, t += 4), e & 3 || (e >>= 2, t += 2), e & 1 || ++t, t;
		}
		function He() {
			for (var e = 0; e < this.t; ++e) if (this[e] != 0) return e * this.DB + Ve(this[e]);
			return this.s < 0 ? this.t * this.DB : -1;
		}
		function Ue(e) {
			for (var t = 0; e != 0;) e &= e - 1, ++t;
			return t;
		}
		function B() {
			for (var e = 0, t = this.s & this.DM, n = 0; n < this.t; ++n) e += Ue(this[n] ^ t);
			return e;
		}
		function We(e) {
			var t = Math.floor(e / this.DB);
			return t >= this.t ? this.s != 0 : !!(this[t] & 1 << e % this.DB);
		}
		function Ge(e, t) {
			var n = c.ONE.shiftLeft(e);
			return this.bitwiseTo(n, t, n), n;
		}
		function Ke(e) {
			return this.changeBit(e, R);
		}
		function qe(e) {
			return this.changeBit(e, Le);
		}
		function Je(e) {
			return this.changeBit(e, Fe);
		}
		function Ye(e, t) {
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
		function Xe(e) {
			var t = l();
			return this.addTo(e, t), t;
		}
		function Ze(e) {
			var t = l();
			return this.subTo(e, t), t;
		}
		function Qe(e) {
			var t = l();
			return this.multiplyTo(e, t), t;
		}
		function $e() {
			var e = l();
			return this.squareTo(e), e;
		}
		function et(e) {
			var t = l();
			return this.divRemTo(e, t, null), t;
		}
		function tt(e) {
			var t = l();
			return this.divRemTo(e, null, t), t;
		}
		function nt(e) {
			var t = l(), n = l();
			return this.divRemTo(e, t, n), [t, n];
		}
		function rt(e) {
			this[this.t] = this.am(0, e - 1, this, 0, 0, this.t), ++this.t, this.clamp();
		}
		function it(e, t) {
			if (e != 0) {
				for (; this.t <= t;) this[this.t++] = 0;
				for (this[t] += e; this[t] >= this.DV;) this[t] -= this.DV, ++t >= this.t && (this[this.t++] = 0), ++this[t];
			}
		}
		function at() {}
		function ot(e) {
			return e;
		}
		function st(e, t, n) {
			e.multiplyTo(t, n);
		}
		function ct(e, t) {
			e.squareTo(t);
		}
		at.prototype.convert = ot, at.prototype.revert = ot, at.prototype.mulTo = st, at.prototype.sqrTo = ct;
		function lt(e) {
			return this.exp(e, new at());
		}
		function ut(e, t, n) {
			var r = Math.min(this.t + e.t, t);
			for (n.s = 0, n.t = r; r > 0;) n[--r] = 0;
			var i;
			for (i = n.t - this.t; r < i; ++r) n[r + this.t] = this.am(0, e[r], n, r, 0, this.t);
			for (i = Math.min(e.t, t); r < i; ++r) this.am(0, e[r], n, r, 0, t - r);
			n.clamp();
		}
		function dt(e, t, n) {
			--t;
			var r = n.t = this.t + e.t - t;
			for (n.s = 0; --r >= 0;) n[r] = 0;
			for (r = Math.max(t - this.t, 0); r < e.t; ++r) n[this.t + r - t] = this.am(t - r, e[r], n, 0, 0, this.t + r - t);
			n.clamp(), n.drShiftTo(1, n);
		}
		function ft(e) {
			this.r2 = l(), this.q3 = l(), c.ONE.dlShiftTo(2 * e.t, this.r2), this.mu = this.r2.divide(e), this.m = e;
		}
		function pt(e) {
			if (e.s < 0 || e.t > 2 * this.m.t) return e.mod(this.m);
			if (e.compareTo(this.m) < 0) return e;
			var t = l();
			return e.copyTo(t), this.reduce(t), t;
		}
		function mt(e) {
			return e;
		}
		function ht(e) {
			for (e.drShiftTo(this.m.t - 1, this.r2), e.t > this.m.t + 1 && (e.t = this.m.t + 1, e.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); e.compareTo(this.r2) < 0;) e.dAddOffset(1, this.m.t + 1);
			for (e.subTo(this.r2, e); e.compareTo(this.m) >= 0;) e.subTo(this.m, e);
		}
		function gt(e, t) {
			e.squareTo(t), this.reduce(t);
		}
		function _t(e, t, n) {
			e.multiplyTo(t, n), this.reduce(n);
		}
		ft.prototype.convert = pt, ft.prototype.revert = mt, ft.prototype.reduce = ht, ft.prototype.mulTo = _t, ft.prototype.sqrTo = gt;
		function vt(e, t) {
			var n = e.bitLength(), r, i = S(1), a;
			if (n <= 0) return i;
			r = n < 18 ? 1 : n < 48 ? 3 : n < 144 ? 4 : n < 768 ? 5 : 6, a = n < 8 ? new N(t) : t.isEven() ? new ft(t) : new de(t);
			var o = [], s = 3, c = r - 1, u = (1 << r) - 1;
			if (o[1] = a.convert(this), r > 1) {
				var d = l();
				for (a.sqrTo(o[1], d); s <= u;) o[s] = l(), a.mulTo(d, o[s - 2], o[s]), s += 2;
			}
			var f = e.t - 1, p, m = !0, h = l(), g;
			for (n = re(e[f]) - 1; f >= 0;) {
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
		function V(e) {
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
		function yt(e) {
			if (e <= 0) return 0;
			var t = this.DV % e, n = this.s < 0 ? e - 1 : 0;
			if (this.t > 0) {
				if (t == 0) n = this[0] % e;
				else for (var r = this.t - 1; r >= 0; --r) n = (t * n + this[r]) % e;
			}
			return n;
		}
		function bt(e) {
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
		var H = [
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
		], xt = (1 << 26) / H[H.length - 1];
		function St(e) {
			var t, n = this.abs();
			if (n.t == 1 && n[0] <= H[H.length - 1]) {
				for (t = 0; t < H.length; ++t) if (n[0] == H[t]) return !0;
				return !1;
			}
			if (n.isEven()) return !1;
			for (t = 1; t < H.length;) {
				for (var r = H[t], i = t + 1; i < H.length && r < xt;) r *= H[i++];
				for (r = n.modInt(r); t < i;) if (r % H[t++] == 0) return !1;
			}
			return n.millerRabin(e);
		}
		function Ct(e) {
			var t = this.subtract(c.ONE), n = t.getLowestSetBit();
			if (n <= 0) return !1;
			var r = t.shiftRight(n);
			e = e + 1 >> 1, e > H.length && (e = H.length);
			for (var i = l(), a = 0; a < e; ++a) {
				i.fromInt(H[Math.floor(Math.random() * H.length)]);
				var o = i.modPow(r, this);
				if (o.compareTo(c.ONE) != 0 && o.compareTo(t) != 0) {
					for (var s = 1; s++ < n && o.compareTo(t) != 0;) if (o = o.modPowInt(2, this), o.compareTo(c.ONE) == 0) return !1;
					if (o.compareTo(t) != 0) return !1;
				}
			}
			return !0;
		}
		c.prototype.chunkSize = Ce, c.prototype.toRadix = Te, c.prototype.fromRadix = Ee, c.prototype.fromNumber = De, c.prototype.bitwiseTo = Me, c.prototype.changeBit = Ge, c.prototype.addTo = Ye, c.prototype.dMultiply = rt, c.prototype.dAddOffset = it, c.prototype.multiplyLowerTo = ut, c.prototype.multiplyUpperTo = dt, c.prototype.modInt = yt, c.prototype.millerRabin = Ct, c.prototype.clone = be, c.prototype.intValue = xe, c.prototype.byteValue = I, c.prototype.shortValue = Se, c.prototype.signum = we, c.prototype.toByteArray = Oe, c.prototype.equals = ke, c.prototype.min = Ae, c.prototype.max = je, c.prototype.and = L, c.prototype.or = Pe, c.prototype.xor = Ie, c.prototype.andNot = Re, c.prototype.not = ze, c.prototype.shiftLeft = z, c.prototype.shiftRight = Be, c.prototype.getLowestSetBit = He, c.prototype.bitCount = B, c.prototype.testBit = We, c.prototype.setBit = Ke, c.prototype.clearBit = qe, c.prototype.flipBit = Je, c.prototype.add = Xe, c.prototype.subtract = Ze, c.prototype.multiply = Qe, c.prototype.divide = et, c.prototype.remainder = tt, c.prototype.divideAndRemainder = nt, c.prototype.modPow = vt, c.prototype.modInverse = bt, c.prototype.pow = lt, c.prototype.gcd = V, c.prototype.isProbablePrime = St, c.prototype.square = $e;
		var U = c;
		if (U.prototype.IsNegative = function() {
			return this.compareTo(U.ZERO) == -1;
		}, U.op_Equality = function(e, t) {
			return e.compareTo(t) == 0;
		}, U.op_Inequality = function(e, t) {
			return e.compareTo(t) != 0;
		}, U.op_GreaterThan = function(e, t) {
			return e.compareTo(t) > 0;
		}, U.op_LessThan = function(e, t) {
			return e.compareTo(t) < 0;
		}, U.op_Addition = function(e, t) {
			return new U(e).add(new U(t));
		}, U.op_Subtraction = function(e, t) {
			return new U(e).subtract(new U(t));
		}, U.Int128Mul = function(e, t) {
			return new U(e).multiply(new U(t));
		}, U.op_Division = function(e, t) {
			return e.divide(t);
		}, U.prototype.ToDouble = function() {
			return parseFloat(this.toString());
		}, wt === void 0) var wt = function(e, t) {
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
		}, wt(e.PolyTree, e.PolyNode), e.Math_Abs_Int64 = e.Math_Abs_Int32 = e.Math_Abs_Double = function(e) {
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
			return r ? e.X == t.X && e.Y == t.Y || e.X == n.X && e.Y == n.Y || e.X > t.X == e.X < n.X && e.Y > t.Y == e.Y < n.Y && U.op_Equality(U.Int128Mul(e.X - t.X, n.Y - t.Y), U.Int128Mul(n.X - t.X, e.Y - t.Y)) : e.X == t.X && e.Y == t.Y || e.X == n.X && e.Y == n.Y || e.X > t.X == e.X < n.X && e.Y > t.Y == e.Y < n.Y && (e.X - t.X) * (n.Y - t.Y) == (n.X - t.X) * (e.Y - t.Y);
		}, e.ClipperBase.prototype.PointOnPolygon = function(e, t, n) {
			for (var r = t;;) {
				if (this.PointOnLineSegment(e, r.Pt, r.Next.Pt, n)) return !0;
				if (r = r.Next, r == t) break;
			}
			return !1;
		}, e.ClipperBase.prototype.SlopesEqual = e.ClipperBase.SlopesEqual = function() {
			var t = arguments, n = t.length, r, i, a, o, s, c, l;
			return n == 3 ? (r = t[0], i = t[1], l = t[2], l ? U.op_Equality(U.Int128Mul(r.Delta.Y, i.Delta.X), U.Int128Mul(r.Delta.X, i.Delta.Y)) : e.Cast_Int64(r.Delta.Y * i.Delta.X) == e.Cast_Int64(r.Delta.X * i.Delta.Y)) : n == 4 ? (a = t[0], o = t[1], s = t[2], l = t[3], l ? U.op_Equality(U.Int128Mul(a.Y - o.Y, o.X - s.X), U.Int128Mul(a.X - o.X, o.Y - s.Y)) : e.Cast_Int64((a.Y - o.Y) * (o.X - s.X)) - e.Cast_Int64((a.X - o.X) * (o.Y - s.Y)) === 0) : (a = t[0], o = t[1], s = t[2], c = t[3], l = t[4], l ? U.op_Equality(U.Int128Mul(a.Y - o.Y, s.X - c.X), U.Int128Mul(a.X - o.X, s.Y - c.Y)) : e.Cast_Int64((a.Y - o.Y) * (s.X - c.X)) - e.Cast_Int64((a.X - o.X) * (s.Y - c.Y)) === 0);
		}, e.ClipperBase.SlopesEqual3 = function(t, n, r) {
			return r ? U.op_Equality(U.Int128Mul(t.Delta.Y, n.Delta.X), U.Int128Mul(t.Delta.X, n.Delta.Y)) : e.Cast_Int64(t.Delta.Y * n.Delta.X) == e.Cast_Int64(t.Delta.X * n.Delta.Y);
		}, e.ClipperBase.SlopesEqual4 = function(t, n, r, i) {
			return i ? U.op_Equality(U.Int128Mul(t.Y - n.Y, n.X - r.X), U.Int128Mul(t.X - n.X, n.Y - r.Y)) : e.Cast_Int64((t.Y - n.Y) * (n.X - r.X)) - e.Cast_Int64((t.X - n.X) * (n.Y - r.Y)) === 0;
		}, e.ClipperBase.SlopesEqual5 = function(t, n, r, i, a) {
			return a ? U.op_Equality(U.Int128Mul(t.Y - n.Y, r.X - i.X), U.Int128Mul(t.X - n.X, r.Y - i.Y)) : e.Cast_Int64((t.Y - n.Y) * (r.X - i.X)) - e.Cast_Int64((t.X - n.X) * (r.Y - i.Y)) === 0;
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
		var Tt = function(e) {
			return e < 0 ? Math.ceil(e - .5) : Math.round(e);
		}, Et = function(e) {
			return e < 0 ? Math.ceil(e - .5) : Math.floor(e + .5);
		}, Dt = function(e) {
			return e < 0 ? -Math.round(Math.abs(e)) : Math.round(e);
		}, Ot = function(e) {
			return e < 0 ? (e -= .5, e < -2147483648 ? Math.ceil(e) : e | 0) : (e += .5, e > 2147483647 ? Math.floor(e) : e | 0);
		};
		a.msie ? e.Clipper.Round = Tt : a.chromium ? e.Clipper.Round = Dt : a.safari ? e.Clipper.Round = Ot : e.Clipper.Round = Et, e.Clipper.TopX = function(t, n) {
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
		}, wt(e.Clipper, e.ClipperBase), e.Clipper.NodeType = {
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
})), te = /* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	var n = w(), r = 10 ** 5;
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
})))(), 1), T = 18, ne = Object.freeze({
	x: 0,
	y: 0,
	scalePercent: 100
});
function re(e) {
	if (typeof e != "number" || !Number.isFinite(e) || e <= 0) throw TypeError("Bubble tail length must be greater than zero.");
	return e;
}
function ie(e) {
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
var ae = Object.freeze([
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
function E(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
function D(e, t) {
	let n = e ?? t;
	if (!Number.isFinite(n) || n <= 0) throw TypeError("Bubble SVG dimensions must be positive and finite.");
	return n;
}
function oe(e) {
	if (e === null) return null;
	let t = e ?? 180;
	if (!Number.isFinite(t)) throw TypeError("tailDirection must be finite.");
	return (t % 360 + 360) % 360;
}
function O(e, t, n = 18) {
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
function k(e, t) {
	return e.x * t.y - e.y * t.x;
}
function A(e, t) {
	return {
		x: e.x - t.x,
		y: e.y - t.y
	};
}
function j(e, t) {
	return Math.hypot(e.x - t.x, e.y - t.y);
}
function M(e, t, n, r) {
	let i = t, a = r;
	for (; a > 0;) {
		let t = (i + n + e.length) % e.length, r = e[i], o = e[t];
		if (!r || !o) throw Error("Bubble border path is invalid.");
		let s = j(r, o);
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
function N(e, t, n, r, i) {
	let a;
	for (let r = 0; r < e.length; r += 1) {
		let i = e[r], o = e[(r + 1) % e.length];
		if (!i || !o) continue;
		let s = A(o, i), c = k(n, s);
		if (Math.abs(c) < 1e-9) continue;
		let l = A(i, t), u = k(l, s) / c, d = k(l, n) / c;
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
		base: [M(o, s, -1, 9), M(o, s, 1, 9)],
		tip: {
			x: i?.x ?? t.x + n.x * (a.rayScale + r),
			y: i?.y ?? t.y + n.y * (a.rayScale + r)
		}
	};
}
function P(e) {
	let t = e * Math.PI / 180;
	return {
		x: Math.sin(t),
		y: -Math.cos(t)
	};
}
function se(e, t, n, r) {
	return {
		x: n.x + (e.x - t.x) * r,
		y: n.y + (e.y - t.y) * r
	};
}
function F(e, t, n, r, i, a) {
	let o = {
		x: t / 2,
		y: n / 2
	}, s = P(r), c = N(e, o, s, i), l = j(o, c.borderPoint), u = a.scalePercent / 100, d = {
		x: o.x - s.x * l * (u - 1) + a.x,
		y: o.y - s.y * l * (u - 1) - a.y
	};
	return {
		body: e.map((e) => se(e, o, d, u)),
		bodyCenter: d,
		tip: c.tip
	};
}
function ce(e) {
	let t = e[0];
	if (!t) throw Error("Bubble polygon is empty.");
	return `M ${t.x.toFixed(4)} ${t.y.toFixed(4)} ${e.slice(1).map(({ x: e, y: t }) => `L ${e.toFixed(4)} ${t.toFixed(4)}`).join(" ")} Z`;
}
function le(e) {
	return Math.abs(e.reduce((t, n, r) => {
		let i = e[(r + 1) % e.length];
		return i ? t + n.x * i.y - i.x * n.y : t;
	}, 0) / 2);
}
function ue(e, t, n, r = "") {
	return `<path d="${ce(e)}" fill="${t}" stroke="${n}" stroke-width="3" stroke-linejoin="round" ${r}/>`;
}
function de(e, t, n, r, i, a = "") {
	let o = A(n, t), s = Math.hypot(o.x, o.y);
	if (!(s > 0)) throw TypeError("Bubble body center and tail tip must differ.");
	let c = N(e, t, {
		x: o.x / s,
		y: o.y / s
	}, 0, n), l = (e) => e.map(({ x: e, y: t }) => [e, t]), u = te.default.union([l(e)], [[l([
		c.base[0],
		c.tip,
		c.base[1]
	])]]);
	if (!u || u.length === 0) throw Error("JSClipper failed to union Bubble body and tail.");
	let d = u.map((e) => e.map(([e, t]) => ({
		x: e,
		y: t
	}))).sort((e, t) => le(t) - le(e))[0];
	if (!d) throw Error("JSClipper returned an empty Bubble outline.");
	return `<path d="${ce(d)}" fill="${r}" stroke="${i}" stroke-width="3" stroke-linejoin="round" data-boolean-operation="union" data-tail-base-on-border="true" ${a}/>`;
}
function fe(e, t, n, r) {
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
function pe(e, t, n, r, i, a) {
	let o = A(n, t), s = Math.hypot(o.x, o.y), c = N(e, t, {
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
function me(e, t) {
	let n = e / 2, r = t / 2;
	return Array.from({ length: 28 }, (i, a) => {
		let o = a * Math.PI * 2 / 28 - Math.PI / 2, s = a % 2 == 0, c = s ? e / 2 - 6 : e / 2 - 22, l = s ? t / 2 - 6 : t / 2 - 22;
		return {
			x: n + Math.cos(o) * c,
			y: r + Math.sin(o) * l
		};
	});
}
function he(e, t) {
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
function ge(e, t, n) {
	return e === "YELLING" ? me(t, n) : e === "WAVY" ? he(t, n) : O(t, n);
}
function _e(e) {
	let t = D(e.width, 220), n = D(e.height, 112), r = oe(e.tailDirection);
	if (r === null) throw TypeError("Bubble body center offset requires a tail direction.");
	let i = re(e.tailLength ?? T), a = ie(e.offset), o = {
		x: t / 2,
		y: n / 2
	}, s = F(ge(e.style, t, n), t, n, r, i, a);
	return Object.freeze({
		x: s.bodyCenter.x - o.x,
		y: s.bodyCenter.y - o.y
	});
}
function ve(e, t, n, r, i, a, o, s) {
	let c = O(t, n), l = (e) => r === null ? e : F(e, t, n, r, o, s).body, u = (e, c = "") => {
		if (r === null) return ue(e, i, a, c);
		let l = F(e, t, n, r, o, s);
		return de(l.body, l.bodyCenter, l.tip, i, a, c);
	};
	switch (e) {
		case "NO_BUBBLE": return "";
		case "THINKING":
		case "DREAMING": {
			if (r === null) return fe(t, n, i, a);
			let l = F(c, t, n, r, o, s), u = s.scalePercent / 100, d = {
				x: t / 2,
				y: n / 2
			}, f = l.bodyCenter.x - d.x * u, p = l.bodyCenter.y - d.y * u;
			return `${pe(l.body, l.bodyCenter, l.tip, i, a, e === "DREAMING")}<g transform="translate(${f} ${p}) scale(${u})">${fe(t, n, i, a)}</g>`;
		}
		case "YELLING": return u(me(t, n));
		case "WAVY": return u(he(t, n));
		case "WHISPERING": return u(c, "stroke-dasharray=\"5 5\"");
		case "ANNOUNCEMENT": return `${u(c)}<rect x="30" y="30" width="${t - 60}" height="${n - 60}" rx="13" fill="none" stroke="${a}" stroke-width="1.5"/>`;
		case "NARRATION": return ue(l(c), i, a);
		case "OFF_PANEL": return u(c);
		case "NORMAL": return u(c);
	}
}
function ye(e) {
	if (!ae.includes(e.style)) throw TypeError(`Unsupported Bubble visual style: ${String(e.style)}`);
	if (!Array.isArray(e.lines) || e.lines.some((e) => typeof e != "string")) throw TypeError("lines must be an array of strings.");
	let t = D(e.width, 220), n = D(e.height, 112), r = D(e.fontSize, 15), i = oe(e.tailDirection), a = re(e.tailLength ?? T), o = e.offset === void 0 ? ne : ie(e.offset), s = e.fillColor ?? "#fff4cc", c = e.borderColor ?? "#6f5b45", l = e.textColor ?? "#25283a", u = e.fontFamily ?? "Noto Sans JP, sans-serif", d = r * 1.35, f = n / 2 - (e.lines.length - 1) * d / 2 + r * .35, p = i === null ? 1 : o.scalePercent / 100, m = i === null ? {
		x: t / 2,
		y: n / 2
	} : F(O(t, n), t, n, i, a, o).bodyCenter, h = e.lines.map((e, t) => `<text x="${m.x}" y="${m.y + (f + t * d - n / 2) * p}" text-anchor="middle" fill="${E(l)}" font-family="${E(u)}" font-size="${r * p}">${E(e)}</text>`).join(""), g = E(e.title ?? `${e.style} bubble`);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${n}" viewBox="0 0 ${t} ${n}" role="img" data-bubble-renderer="canonical" data-bubble-style="${e.style}"><title>${g}</title>${ve(e.style, t, n, i, s, c, a, o)}${h}</svg>`;
}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/constants.js
var be = 2048, xe = 2112, I = Uint8Array, Se = Uint16Array, Ce = Int32Array, we = new I([
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
]), Te = new I([
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
]), Ee = new I([
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
]), De = function(e, t) {
	for (var n = new Se(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new Ce(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, Oe = De(we, 2), ke = Oe.b, Ae = Oe.r;
ke[28] = 258, Ae[258] = 28;
var je = De(Te, 0), Me = je.b;
je.r;
for (var Ne = new Se(32768), L = 0; L < 32768; ++L) {
	var R = (L & 43690) >> 1 | (L & 21845) << 1;
	R = (R & 52428) >> 2 | (R & 13107) << 2, R = (R & 61680) >> 4 | (R & 3855) << 4, Ne[L] = ((R & 65280) >> 8 | (R & 255) << 8) >> 1;
}
for (var Pe = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new Se(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new Se(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new Se(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[Ne[d] >> c] = l;
	} else for (s = new Se(r), i = 0; i < r; ++i) e[i] && (s[i] = Ne[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), Fe = new I(288), L = 0; L < 144; ++L) Fe[L] = 8;
for (var L = 144; L < 256; ++L) Fe[L] = 9;
for (var L = 256; L < 280; ++L) Fe[L] = 7;
for (var L = 280; L < 288; ++L) Fe[L] = 8;
for (var Ie = new I(32), L = 0; L < 32; ++L) Ie[L] = 5;
var Le = /*#__PURE__*/ Pe(Fe, 9, 1), Re = /*#__PURE__*/ Pe(Ie, 5, 1), ze = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, z = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, Be = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, Ve = function(e) {
	return (e + 7) / 8 | 0;
}, He = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new I(e.subarray(t, n));
}, Ue = [
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
], B = function(e, t, n) {
	var r = Error(t || Ue[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, B), !n) throw r;
	return r;
}, We = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new I(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new I(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new I(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = z(e, d, 1);
			var v = z(e, d + 1, 3);
			if (d += 3, !v) {
				var y = Ve(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && B(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			}
			if (v == 1) p = Le, m = Re, h = 9, g = 5;
			else if (v == 2) {
				var S = z(e, d, 31) + 257, C = z(e, d + 10, 15) + 4, ee = S + z(e, d + 5, 31) + 1;
				d += 14;
				for (var w = new I(ee), te = new I(19), T = 0; T < C; ++T) te[Ee[T]] = z(e, d + T * 3, 7);
				d += C * 3;
				for (var ne = ze(te), re = (1 << ne) - 1, ie = Pe(te, ne, 1), T = 0; T < ee;) {
					var ae = ie[z(e, d, re)];
					d += ae & 15;
					var y = ae >> 4;
					if (y < 16) w[T++] = y;
					else {
						var E = 0, D = 0;
						for (y == 16 ? (D = 3 + z(e, d, 3), d += 2, E = w[T - 1]) : y == 17 ? (D = 3 + z(e, d, 7), d += 3) : y == 18 && (D = 11 + z(e, d, 127), d += 7); D--;) w[T++] = E;
					}
				}
				var oe = w.subarray(0, S), O = w.subarray(S);
				h = ze(oe), g = ze(O), p = Pe(oe, h, 1), m = Pe(O, g, 1);
			} else B(1);
			if (d > _) {
				c && B(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var k = (1 << h) - 1, A = (1 << g) - 1, j = d;; j = d) {
			var E = p[Be(e, d) & k], M = E >> 4;
			if (d += E & 15, d > _) {
				c && B(0);
				break;
			}
			if (E || B(2), M < 256) n[f++] = M;
			else if (M == 256) {
				j = d, p = null;
				break;
			} else {
				var N = M - 254;
				if (M > 264) {
					var T = M - 257, P = we[T];
					N = z(e, d, (1 << P) - 1) + ke[T], d += P;
				}
				var se = m[Be(e, d) & A], F = se >> 4;
				se || B(3), d += se & 15;
				var O = Me[F];
				if (F > 3) {
					var P = Te[F];
					O += Be(e, d) & (1 << P) - 1, d += P;
				}
				if (d > _) {
					c && B(0);
					break;
				}
				s && l(f + 131072);
				var ce = f + N;
				if (f < O) {
					var le = a - O, ue = Math.min(O, ce);
					for (le + f < 0 && B(3); f < ue; ++f) n[f] = r[le + f];
				}
				for (; f < ce; ++f) n[f] = n[f - O];
			}
		}
		t.l = p, t.p = j, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? He(n, 0, f) : n.subarray(0, f);
}, Ge = /*#__PURE__*/ new I(0), Ke = function(e) {
	(e[0] != 31 || e[1] != 139 || e[2] != 8) && B(6, "invalid gzip data");
	var t = e[3], n = 10;
	t & 4 && (n += (e[10] | e[11] << 8) + 2);
	for (var r = (t >> 3 & 1) + (t >> 4 & 1); r > 0; r -= !e[n++]);
	return n + (t & 2);
}, qe = function(e) {
	var t = e.length;
	return (e[t - 4] | e[t - 3] << 8 | e[t - 2] << 16 | e[t - 1] << 24) >>> 0;
};
function Je(e, t) {
	var n = Ke(e);
	return n + 8 > e.length && B(6, "invalid gzip data"), We(e.subarray(n, -8), { i: 2 }, t && t.out || new I(qe(e)), t && t.dictionary);
}
var Ye = typeof TextDecoder < "u" && /*#__PURE__*/ new TextDecoder();
try {
	Ye.decode(Ge, { stream: !0 });
} catch {}
//#endregion
//#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/swap.js
var Xe = new Uint8Array(new Uint32Array([305419896]).buffer)[0] === 18;
function Ze(e) {
	let t = e.length;
	for (let n = 0; n < t; n += 4) [e[n], e[n + 1], e[n + 2], e[n + 3]] = [
		e[n + 3],
		e[n + 2],
		e[n + 1],
		e[n]
	];
}
function Qe(e) {}
var $e = Xe ? Ze : Qe, et = new TextDecoder(), tt = class e {
	constructor(e) {
		if (e instanceof Uint8Array) {
			let t = 0, n = new DataView(e.buffer);
			if (this.highStart = n.getUint32(0, !0), this.errorValue = n.getUint32(4, !0), t = n.getUint32(8, !0), t !== 4294967295) throw Error("Trie created with old version of @cto.af/unicode-trie.");
			if (t = n.getUint32(12, !0), 16 + t > e.byteLength) throw RangeError("Invalid input length");
			let r = e.subarray(16 + t);
			this.values = r.length ? JSON.parse(et.decode(Je(r))) : [], e = Je(e.subarray(16, 16 + t)), $e(e), this.data = new Int32Array(e.buffer);
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
			let n = (this.data[be + (e - 55296 >> 5)] << 2) + (e & 31);
			t = this.data[n];
		} else if (e < this.highStart) {
			let n = this.data[xe - 32 + (e >> 11)];
			n = this.data[n + (e >> 5 & 63)], n = (n << 2) + (e & 31), t = this.data[n];
		} else t = this.data[this.data.length - 4];
		return t;
	}
	getString(e) {
		let t = this.get(e);
		return this.values[t] ?? t;
	}
}, nt = tt.fromBase64("AAgOAAEAAAD/////nRQAAB+LCAC4xcFoAgPtnQnwlkUdx1+URLxABcUUghTEEK8Cmwp0LJAa\n   MRrFbBSPSXHSAUYNdFQoBWMKyQrUCo/EyMIjD3TIAxXJM5NBHBm0RDSPzDOVdAz7/nB/07bt\n   s8/e+/zhfef9zD7HPs/e129/u8/yzVutVWANeBl079xq9QJ9wUCwDxjqYQ4DI8BoMBYcBY4D\n   48FEw3NTwDTp/BxwAZgJLgaXgCvAAnADuA3cDe4Hj0rPLQerwLPgJfAaeBe8Az4EnT/Ram0D\n   eoBdwe5gENgX0DsOhHkQGAlGgTHgaHACGA8mgilgGpgBLgJzweVgPlgIbgF3iPOl4BGwAqwG\n   a8Er4C2wDnwEumzRanUDPUFv0B8MBgeAL4BDwNfAN8C3wIngO+A0cCZowd/nwrwA/Eic/wzm\n   L8EMHM+HuRDcDP4g7t8Hk3hYmI8BCv+TwvwLTOZvglfBawKyQ7wrjv8Ns1OXVqsroPNuwuwJ\n   szfoL86JwTgeIp3HYJj0vhE4Hg3GgnHgZMDhnYDjyWCqZP9CHM8Gc8S1y2BeBa4FvweLxPN3\n   wVwq7Dwirp0KVuB4NVgLXgSvg/fA+6C1Jf6gO+gF+oI9wQa3YQ4FwwDlwREwR4Mj+L6GY3Dv\n   eMN9OY7JPAV2Jwn7Z8E8F0wHs8AcMA9cA64Dt4I7wT3gQfA4eAI8DdaKd7wizLdgvg86dUWa\n   g+1BL0D3+sIcAAaLc5X9xfUDYR4EDlUYJR2PAUeCY8FJ4DRwJjgXTAezwBwwD1wDrgO3gjuF\n   G/fAfBA8Js5XwnwaPF/htypeFfbfhvm+w7OdtkL6Axe3thP2uSzuhPM+YICA6tZ9YA4FwwGV\n   55F0XTBGOlY5GhwHxoOJYAqYBn4AfiyOLwVXgvnSc9dKxzeC28XxEoNbbdq0iQvXEe24aNOm\n   TZs2bdq0aePC0ob55yFhPg5IHlI3Rl4Je8+I/vALMN+T7v3DMN5+B/c+BJ23hhwQ0LUeMM+G\n   OQrshuM9AMkJ94b5WfBF8GVwKPg6+CYgOc7xME8BLFsiJuH8LPA9MFO8/yJhMnNxfjm4AlwJ\n   rgK/AleD+e177Xvte+177XvR7/0O3ARuBSQzLcmd8ENJSoe/TZsmE9qfvR9l7FHwhNL3c+Ep\n   zbPP4trz4FXwT/AB2Gyb/7WzJc67g16gLxgIBgOasxkCcxgoXf/c2+1jDu7ean0fLDbwDvjc\n   9pi7Aj8H8r1V4vxlmLvtgLlCMBesBNvs+PG9g2GeBxaB5aB7j1brOczh9UN8nAiuBs8BGg8c\n   BqgP/xOqI2n+VvAQzile53T6L6NwLts5G+eLwSpxfT3M4dtiTg0sAevB8O1wDuT35GZJA9yX\n   461NmzZtNiXWow6cTrpKaCNGU3uhtPNjcW0cOEFq28fjeAI4HUwWz8iQbIvsrYM5VTw3HSbp\n   Fs2EebG4dpnGPYL0hM4n3SfcXyDsLhTmzTBvA3eI86VKn6MK0lshfao/kt9x/pjk7ydFW7lG\n   vIt0rl4W99+EuQ58BEh3jP3bBW1oVxHObjjeCfQB7B7bG8DXYJ5OelYwvwS+Ath9fuY0KT4O\n   E88dKcxjYJIs8NswT5WeVSG/k/0zYOcccL54nuLvh+QHmD8V5jJA8fILnP8Lz10N87eAdMRu\n   grlY9Bfo/AGYfwYrxPl9eOdqHK8l/+D47zDfFv76AOZmyFeTcLwVzB1AL9AXDAT7gSFgGBgB\n   yH87ks4ZjseK86+CcdQ+a8JI90/GvQniPtufjPOp4vkLYc4Gc8Hl4NfgesP7Fin3OE3uwvVl\n   4BGwQrKzGsd/BS+C18Hb4APhdif0J7sC1unbHsf83C7SMd3vh/O9yC4YCoaBQ8Aoyd4YHB8J\n   jgUngVMBlQ8qG2dI9nScg/sXgJngYsnupTi+EvxG+DMnXI7UuCZuNPjn9pqwboxQOeXwc50Q\n   gyUinh8wxPfDFfeW4/qqAvmmaVDb6PvsGiX+XvLM2/1Qb76xEZeLGOlEdTC1i+tEnNMx1Z8f\n   ivPOGJtvDXYEJNfw9eeueL4uHLvDziBA/Rb5+gG4Rvq0n5feQTKJXHp8rlBfaiT8R7KcKnnV\n   4Yb42BQ4wjL9joG9E8Apjul9uBL3TS+/kxC+74LzGpAvTHl7BvznUyYuwnM05iGoLM/F+Tzl\n   XdyHqStbZM4S5/PxjoXgJvEuWqvAdkmuKIeL6hV5TET9e6r/qsJPazHIvBfveQgsF248BXMF\n   1YcOcXGERXv4AslIPeNXhuL3TVFnroO5HmwB2WtT8j21Mdsa/NMT93qDDevFkJ79Fbsb1s7g\n   2hDLMFE/cZh434iAeKD3jDY8T/fHGu5TuMfVuH+y8KeOCeJZPp+cIU1JD4fcmiq5NVvIIaqe\n   oXJyIezPBpeAK8AC8Xxvi/5YXd1+A951C6C1R4uFeTdMurdMmC78Cc+sBM+ANdLzNF/xBlgH\n   PpKud8G8xXagB9gZ9AF0fQ+Yg8QxcQCOh4rz4TBHimM5TQ/HNT5egHDQfdZFOkrcI/nEcTge\n   Dyh+JsKcIt41TZgzYM5S3j9H8gsxD+dXSe4x10rXrleeyc2iwu6XhsJ/F8WBqMeJ/ysfBpaJ\n   PNKReXzzThvYDKd1YFn0hscg/tsALZ21ec4GsTS0hWLZou4kDX9oaELHdI1EeiT24ntUtVGX\n   g0yq7igpbCD7BL2HIXfl89RQWCgMHJ7ckPuUlpj63XBO8Y9pyE2aTf2nK5NQC4hWvuvoKfIl\n   lXkqGwzlz50EfMx1BOVhztP8HNvdWXlWhp6Xz8ndlOWN/V6K0u43Dc4fch7gc9s4U/OU/Azn\n   vZLkKrdNheqTKnzeVxff/FOvc19D/dW9SzZjkuKdMfPmxlrn5Ix3mzzWBKhs9NL4l9rxqj5J\n   06HwcD6W8zQf01iDzLrfLhmpc1vNVza/qvGXnP7UZ2PUcZlLnHOcksk0KZ+nyGe2412KW13c\n   p65rOQ3qwmCyo8afzi7bsY2PmPV4yfYqZl7qKO1F6nhyreNs6rvY+S9XnOjaai7TssxAHqfn\n   8GuV/9XrVfZi5PVcZaXK367u636hfuP8bCtL8u3np+6vURhK9BObUPZjxm+scZ0810DkrFfV\n   8uY6zgotWy5ygSq35DJYlyZqedWVX5s2UTeeqQqT6pZr+vJ4QRc/fF1uj6rCZYprU1hypG/d\n   sRznpnS1Sd+6dKzLa3X5wzZ9dfWEa5/Mtfzq0qRE+vqWX10eqErfkL6tOubxLb8s1zG54RLO\n   nPWzb/3pkl9z1J8ufcQqP9fl9ao6w9Re6cKsS7u6a3Xto2s81NWvpjxqW/5s5IEpxpncTtr2\n   4XPWpbHGWa79Idv0NMWZKR5i1aemn+38oxwum2dKpm+M9jJm+pr6RrHSV9eH9dXnyN0XijEO\n   i5GedX16VzluqvZXHr9UpY1P/9a1zSs176m2kbb+NY13qvKLjYwqtP1V/eLT//5kQ1B/1G8I\n   eZ/LfA3LgUzxw8dVcZYiLuvcjB33IX7wybe6NKM+gox8jfRq+JjSi87l+ViGrut0buvaqdhy\n   QPKj3MawSbqApBfLZoi81kcuXqV3XXc9VHbeBH0L+nF5N7W/Nm2NnBer+rasD9bEute1flTD\n   lst9Ux1vK8PWjZFD+x27Fma3wvQujG/fMFQ/0iX/hD7f9PClnr9OHX8+Mh65PTS1Iyn9UULX\n   M/b8vq9uKf9ID7KkjkvOtOe+om/8cxvu6meXubpY+jcuc0Wx3TeNBVOH33e+LKQ+rZM55pQd\n   cNz3kc4578rygFhy7Fj1H4872f88FpD1hNV1Iy76tbnr35Dyn1v3yCT3KhEnJdpnG1mui46u\n   ryzBNNaiH5eH0HFfbPlWqvouVX0ZKjdW65S68XQqfWC1nJSUO8eoj0OfjxGGUjI1V/erZGIh\n   P507n8qIa7z1tXinLK/sZwnb/7TS7+drNtj43+Y9sttN00121aMOnR+wTb/UuIZ/d4FrfydV\n   PSOXCRmf+jfl/E9KuUMpuVPMfnKMdQIucze69X6m8YPvngAl9yOwqWNt5Wsu+hSp9xRoytr0\n   UN3tunhPHQ91brDsoqqOZSivyed7iDzXX8p/JJ8le2QSA4C8lwntkcP7bvGxfC7bJfaUIDd5\n   j7CqsiCv/dYh+4HcIbkTYdpLgOWwbNdk31R/k/tqnKpy2oGB43o1H9js0cPhk/ebUfegsZVT\n   h8pW5D2aVNQ9nFzQPStf4+MQN4jYfZ4Q+TDndzUNTfqAVfs7uazFtc03KfaP0u3LZYvP877u\n   ++6zpf5SuOfiJ9+w6PylXtPdZ1Pdx80UZ1VxoYahLl/Y7tflUxbqwhyr7OjioCpuTOexymmM\n   99vGWe5960LdoT5PrDlkNn39yrIdFzdTxKkqa0o9n5NyfjbFL6T9i03O9jTEjVT9CZt61qWe\n   DAmTbX1rkw4ubWysflyu/Uh19Utdv8QUb/wevs/vlN3YK0J95hvGWP26FP0CXV0ix6XOfmi8\n   lNw7tlSc284PqXnZlKf5umpfVx7Ue3K5q4onnT9079H5h8ubyX5VGZHfIVOiPynLz2RkPSTV\n   /2p/0NZM2Ufw7dPm3tveJp46kn5prDC7miXDUCoOc7QdKeU9KeZZbNZTsw6ZKjPna6G6jLZ6\n   v6Y9S0rqHMbaN8j3flUbVIdpnonTleaP+JsiapunntfVOer7WUdXNw+jCyvNYxE6P9Ix+7Mu\n   TCa3uM3mb9JUmfLe1q59N19yulXnD5dfU/yRyn/8vR2Cr9H8JB/btsm29undfCw/56tbVmVX\n   d53nXtV0+Iw4rjNTk8udOvdtwl13j1B1YuT5b04HMpsW/7HCr8t/dF0Of846J3W9HPtdNnUf\n   x7UvpdsiV1mJjawiFLWODEm73G1mLF1J2/GB7X7UtvqhJeeTfPc4T7mPtLpuWqWJ66malIZV\n   Oq6uerCp9Oh1dlzCzrpIudKf92/hsZbP+hIbHa0Q/fQYe/v4lmd5T5s6veq6vYViyzJT69KV\n   2t/FlN451zKFrm3i9U0264J0fQOX9U5Vfe6S+xPRL8VaHJe8rK69qpNJqe92jX81XX3X2fr8\n   XPaHsq1PdPWWa12Sag1GaXmwT98pZ/2vy8+h7e8gsHdGcrvn+ou5l5j6K7GfmPobXJiY4xLb\n   d9C3GKnM2H7Xkd7j+z1I03X5ftWxjd9KwDLy0mNPV/fUtSCh4wyeF5DXS8nzWnSd9Jqrfrye\n   UWfa3NP1O131E9TnTDItvs/rn9Qwm9y3lS/yuiSdDK2J32LmH61l4/l7DpMcFl0cy/HpKvNU\n   5Z6yuzmgsPj4PZX78jydfMzx1BFk7Gr61smlU9yXf7w+UL7Pa5Fc9pe3lTntI+YJYvTvQ9Y9\n   x9gbNOU66lxyYJPsuqPtBRpjvW7uX6n9Y3LpfMUe8+fYy6sJ+99x2QyVR1TJrEvlz9Lxmzq8\n   Kct+jO8mpnIrV35pYv3rso+6j2w1RzkxpWeOslpV38Xey7lJ7XVVnDdFVyDn2o2m7A1s871r\n   U3+hbp661LfjbL6l6vL9O5v5uiqdcd/9mG3sVrlrktHl3m+5Ln46Qply/f51rDq2afV3U92P\n   9Z2CVPu71+kExf4uhm265Mpfcrjl9S+p/WGjb9FEeYmrHlhsXTLb772b2v3U8bKvoAk6VaQ3\n   ZdqvWf2FytNd9g1W/c57VNf9+JuMuXT+ZJ1tnZ6T7U+un1PXpSm/BxKiZ+b6nUC5P+bybdoU\n   3wWR9zP1WcOrrtc06dG7rA9gf6lzCCVlQKl1cKvW16r7MjdxPqHue3m55l5M6yRy1q8p6i+d\n   GzbfR5Dtqeeu1D2rulVlp+67ulXfzlDPqS/AP52us+kb5aoetdp226wrqOtHuvxc9InlsMrX\n   5HCkgvtULt80VtPB5tvHlLbU51R1leQ+nW0ftknjClM7Ktf7Pt9n161FKfULHbeU/P5brO/5\n   8PeveZ2l+s31OpmmizxP5z/VrssvNP7Vb9XbUGr+LWSdWKr4c/lemct7U/1KfJcs5nfiXNcz\n   Va3lCf2OXi75c+gaSd/4SyH/pmds+8G2fWCbvmwMeZapf6v2g9hU16vF7l/65K8cc6uh7bIs\n   W8jdLyyxp4BPPOru6+Qx8rd8beIyhew8xjoMtU8l90dcyldseUOJPpPLevpc7ZnvL8f4oaRO\n   ad34WVeefPYVSdG+27T7vPdESj0VV5leyvXoufQvffKZTpZmGy+27UNKfYCc5dWmj2fbp44Z\n   P6G/WN9X1cl8beoieS7ad7+PGP14nz1ATO1q3Xx2jHnpWO1xR1uPovumYQndrFD9uyrdvpD4\n   b9L8Yaz9wxl5bbVu/XlT9j2X/Rr6Hl7brYPd0V1jM5bOk+84oUn7xpeeH7IhVJ7j25+IrU9s\n   ig+XOi7lGMtGj9pGB903/kuMQVPuORpjv7+c35AvvYYkNO1CviFvU4/HkF+qe2ZTG+VTn1bt\n   fV7y5/PtqNR76oeuy4zlH3n/9ND3qPuxu7xb3cuj7heahiXq4ljrC1R5vm5M39HGFz7yzRLr\n   k1PoMMfcPzeGvDPWPssxw6Rzo8QcXmp3XGSSHX2/Et08k67f5dtmuupKN2FvMpOsKObeDnVx\n   k3ofp1h6VrFIVVdV7T2fYm9013l7k/5rbNlKaBuXso7LLV+K1d67uuWiJ19ShhcjvUP97FsO\n   Q+V7pdfDpy5rtv2qEPkU7XFY0v3Q+Oc8FpqHdHV9Xf415XFbPTPfPk7qNWsufow9vkqlz6v+\n   eA4udH9l3XxtiA5ZyN5XpvxSNzdetRdQlWnKjzbP695Xt9+WTz/bJk5y6tDVlYHUe0Crv9Bv\n   vMf+bnzq79DHenfs/ZD3y4TO7b0S7vPM8Z5yL2mTG1XXKcyMLh5093OzvwbVfzr/1hHDby7u\n   ufhH5z/Vrm1YZPsheUtn2pQh+RnfMmCqy3PN7aSeN0oRtrp8m6oONOXflHVfrnj0ccdU1lVS\n   yYu7Ssjz96ZwxEgz13rX1c3Y+Sp2vJve7eN+zP3nYsojYunAhMq1cs2vM1X9J99+Q2g+d+1z\n   5OznpXJD1zcKcc/U33KN39TzgCnr4lz95Fz1cW79kxT6SDF00UruT5ZDZ8Xl9x83MV0I0CwB\n   AB+LCAC4xcFoAgMdjksWhCAMBO/CelYzJ4gMCqiI4t/n/a9hyk29JN3p5DL7bj7GTQrbKypR\n   dDVVywyhZCz4xkUhnSIj5EExoFoQisIfbICE2WJOoAESSK7wecCscDJSxRXMbBAlfLCyIbTh\n   T8tr5/YikvVFSYq3dURbKo/gf+Q3zBCELycCXW/uB2mPjCb8AAAA"), rt = Object.fromEntries(nt.values.map((e, t) => [e, t])), { values: it } = nt, { AI: at, AL: ot, CJ: st, CM: ct, NS: lt, SA: ut, SG: dt, SP: ft, XX: pt } = rt;
function mt(e) {
	switch (e) {
		case null: return null;
		case -1: return "sot";
		case -2: return "eot";
		default: return it[e];
	}
}
function ht(e, t) {
	switch (e) {
		case at:
		case dt:
		case pt: return ot;
		case ut: return /^[\p{gc=Mn}\p{gc=Mc}]$/u.test(t) ? ct : ot;
		case st: return lt;
	}
	return e;
}
var gt = class {
	cp = -Infinity;
	cls = -1;
	char = "";
	len = 0;
	ignored = !1;
	constructor(e, t, n, r) {
		this.cls = e, this.cp = t, this.char = n, this.len = r;
	}
	[Symbol.for("nodejs.util.inspect.custom")](e, t, n) {
		return `${mt(this.cls)}(${this.cp.toString(16).padStart(4, "0")}:${JSON.stringify(this.char)})${this.ignored ? "Ig" : ""}`;
	}
}, _t = class {
	str = "";
	len = 0;
	prevChunk = 0;
	prev = new gt(-1, -Infinity, "", 0);
	cur = new gt(-1, -Infinity, "", 0);
	next = new gt(-1, -Infinity, "", 0);
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
		this.push(new gt(-2, Infinity, "", this.next.len));
	}
	*codePoints(e, t = !0) {
		if (t) for (; e < this.len;) if (e === this.cur.len && this.next.cls >= 0) yield this.next, e += this.next.char.length;
		else {
			let t = this.str.codePointAt(e), n = String.fromCodePoint(t), r = nt.get(t);
			e += n.length, yield new gt(ht(r, n), t, n, e);
		}
		else for (; e > 0;) if (e === this.cur.len) yield this.cur, e -= this.cur.char.length;
		else if (e === this.prev.len) yield this.prev, e -= this.prev.char.length;
		else {
			let t = e - 1, n = this.str.charCodeAt(t);
			n >= 56320 && n <= 57343 && t--;
			let r = this.str.codePointAt(t), i = String.fromCodePoint(r);
			yield new gt(ht(nt.get(r), i), r, i, e), e = t;
		}
	}
	classAfterSpaces(e) {
		for (let { cls: t } of this.codePoints(e)) if (t !== ft) return t;
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
}, vt = class {
	string = void 0;
	props = void 0;
	constructor(e, t = !1) {
		this.position = e, this.required = t;
	}
}, V = tt.fromBase64("AAAEAAAAAAD/////wQIAAB+LCAC1xcFoAgPtmj1IHUEQxzd5FiaEkMLSKqQIViEQCEmTjyqk\n   SUgR7OySTrHxdVoIYqUg2AgqFhYWFhYidpYqKDaClVZaqJWF2qj/xT1cjjtv772Z3T1uHvzY\n   753d2b252ds3+1SpRbAMVkGSrlMo5LNjIfqoB/uEfR2Ao5yy4zb7PgUX4Brcgo6GUi9AF+gG\n   r0EPeAc+AN3mM8KvJu6DH0bWb08yeyEneV77rHia/yjbMvEBxJum7mCqzQjSo1beuBWfRFy3\n   1fHpR2QJgiAIgiAIgiAIQpoZc45c8HhGd2WJYUyy5oIgCP5oRPhuEQQh7vvPVuAe34q5x1lH\n   uJFh15J7HRt9Z7MJ9iKwg1fP72kG4osqz3ynUlNPHjhC2i5/9UypX8DOa6bSa0hfAbsf33zE\n   /EPLr7NtOYj4zlTfD+v7dG0r8uzhXM39qEPH9TtBvTNwUXK9dyv0frzE3DSxje8mZ0yNjuz8\n   zlT+S6T1OnQh7M5oo+f+Bvk67EGY/OfiPeKfTL5+hr6ZuM13k/cT4R/QC86tMfdZbf4a2Un6\n   H9L9OXNIGCoo12yDYdR7mzG+tP8yhjoTpt607tuh/6r7b1VG7yv5ya/OP7iZQXEdYyi9UNel\n   WKM83YTQE/f8qftudz9y7G/OdWlXLxTPYRm9cu+ZMutMaYuK2tnjyqpb5jnPa8+xH7n3eJFO\n   ivRGbTNC6su3PeHYM0V7OxZ/hUtWLP5ZFfzDmMYQSieU8qj78rF3fMsI+axX5fwWYvw+5t9u\n   f0VnNR964yh31bdLOce8qfYb11ndVWeUvibHfCj8tZD2LNZvTRyyW/GfQr1/OM8gob/LcPn8\n   If3iVmVT23Iu/69KaxHzOYn6XenTNw1551DW/3V5X7v6c9Tfh7jPX9TrFtqOhjgPttqeW28u\n   33192kvqs2vW7w7BeyuJcEoAAB+LCAC1xcFoAgOLVvJT0lGKVIoFANHfAiwJAAAA");
Object.fromEntries(V.values.map((e, t) => [e, t]));
var { values: yt } = V, { AK: bt, AL: H, AP: xt, AS: St, B2: Ct, BA: U, BB: wt, BK: Tt, CB: Et, CL: Dt, CM: Ot, CP: kt, CR: At, EB: jt, EM: Mt, EX: Nt, GL: Pt, H2: Ft, H3: It, HH: Lt, HL: W, HY: Rt, ID: zt, IN: Bt, IS: Vt, JL: Ht, JT: Ut, JV: Wt, LF: Gt, NU: G, OP: Kt, NL: qt, NS: Jt, PO: Yt, PR: Xt, RI: Zt, SP: K, SY: Qt, QU: q, VF: $t, VI: en, WJ: tn, ZW: nn, ZWJ: rn } = rt, an = /* @__PURE__ */ new Set([
	H,
	W,
	G
]), on = /* @__PURE__ */ new Set([
	Tt,
	At,
	Gt,
	qt,
	K,
	nn
]), sn = /* @__PURE__ */ new Set([
	zt,
	jt,
	Mt
]), cn = /* @__PURE__ */ new Set([
	Ht,
	Wt,
	Ft,
	It
]), ln = /* @__PURE__ */ new Set([
	Ht,
	Wt,
	Ut,
	Ft,
	It
]), un = /* @__PURE__ */ new Set([Wt, Ut]), dn = /* @__PURE__ */ new Set([
	K,
	Pt,
	tn,
	Dt,
	q,
	kt,
	Nt,
	Vt,
	Qt,
	Tt,
	At,
	Gt,
	qt,
	nn
]), fn = /* @__PURE__ */ new Set([
	-1,
	Tt,
	At,
	Gt,
	qt,
	Kt,
	q,
	Pt,
	K,
	nn
]), J = Symbol("PASS"), Y = Symbol("NO_BREAK"), pn = Symbol("MAY_BREAK"), mn = Symbol("MUST_BREAK");
function hn(e) {
	return e.cur.cls === -1 && e.next.cls !== -2 ? Y : J;
}
function gn(e) {
	return e.next.cls === -2 && (e.cur.len === 0 || e.cur.len !== e.prevChunk) ? mn : J;
}
function _n(e) {
	return e.cur.cls === Tt ? mn : J;
}
function vn(e) {
	switch (e.cur.cls) {
		case At: return e.next.cls === Gt ? Y : mn;
		case Gt:
		case qt: return mn;
	}
	return J;
}
function yn(e) {
	switch (e.next.cls) {
		case Tt:
		case At:
		case Gt:
		case qt: return Y;
	}
	return J;
}
function bn(e) {
	return e.cur.cls !== Zt && (e.RI = 0), e.spaces ? (e.next.cls !== K && (e.spaces = !1), Y) : J;
}
function xn(e) {
	if (e.next.cls === nn) return Y;
	if (e.next.cls === K) switch (e.cur.cls) {
		case nn:
		case Kt:
		case q:
		case Dt:
		case kt:
		case Ct: break;
		default: return Y;
	}
	return J;
}
function Sn(e) {
	return e.LB8 ? (e.LB8 = !1, pn) : e.cur.cls === nn ? e.next.cls === K ? (e.LB8 = !0, Y) : pn : J;
}
function Cn(e) {
	return e.cur.cls === rn ? Y : J;
}
function wn(e) {
	return !on.has(e.cur.cls) && (e.next.cls === Ot || e.next.cls === rn) ? (e.next.ignored = !0, Y) : J;
}
function Tn(e) {
	return e.cur.cls === Ot && (e.cur.cls = H), e.next.cls === Ot && (e.next.cls = H), J;
}
function En(e) {
	return e.next.cls === tn || e.cur.cls === tn ? Y : J;
}
function Dn(e) {
	return e.cur.cls === Pt ? Y : J;
}
function On(e) {
	if (e.next.cls === Pt) switch (e.cur.cls) {
		case K:
		case U:
		case Rt:
		case Lt: return J;
		default: return Y;
	}
	return J;
}
function kn(e) {
	switch (e.next.cls) {
		case Dt:
		case kt:
		case Nt:
		case Qt: return Y;
	}
	return J;
}
function An(e) {
	return e.cur.cls === Kt ? (e.next.cls === K && (e.spaces = !0), Y) : J;
}
function jn(e) {
	return fn.has(e.prev.cls) && /^\p{Pi}$/u.test(e.cur.char) && e.cur.cls === q ? (e.spaces = !0, Y) : J;
}
function Mn(e) {
	if (/^\p{gc=Pf}$/u.test(e.next.char) && e.next.cls === q) {
		let t = e.afterNext();
		if (!t || dn.has(t.cls)) return Y;
	}
	return J;
}
function Nn(e) {
	return e.cur.cls === K && e.next.cls === Vt && e.afterNext()?.cls === G ? pn : J;
}
function Pn(e) {
	return e.next.cls === Vt ? Y : J;
}
function Fn(e) {
	if (e.cur.cls === Dt || e.cur.cls === kt) {
		if (e.classAfterSpaces(e.cur.len) === Jt) return e.next.cls === K && (e.spaces = !0), Y;
		if (e.next.cls === K) return Y;
	}
	return J;
}
function In(e) {
	if (e.cur.cls === Ct) {
		if (e.classAfterSpaces(e.cur.len) === Ct) return e.next.cls === K && (e.spaces = !0), Y;
		if (e.next.cls === K) return Y;
	}
	return J;
}
function Ln(e) {
	return e.cur.cls === K ? pn : J;
}
function Rn(e) {
	return e.next.cls === q && !/^\p{Pi}$/u.test(e.next.char) || e.cur.cls === q && !/^\p{Pf}$/u.test(e.cur.char) ? Y : J;
}
function zn(e) {
	if (!V.get(e.cur.cp) && e.next.cls === q) return Y;
	if (e.next.cls === q) {
		let t = e.afterNext();
		if (!t || !V.get(t.cp)) return Y;
	}
	return e.cur.cls === q && !V.get(e.next.cp) || (e.prev.cls === -1 || !V.get(e.prev.cp)) && e.cur.cls === q ? Y : J;
}
function Bn(e) {
	return e.cur.cls === Et || e.next.cls === Et ? pn : J;
}
var Vn = /* @__PURE__ */ new Set([
	-1,
	Tt,
	At,
	Gt,
	qt,
	K,
	nn,
	Et,
	Pt
]);
function Hn(e) {
	return Vn.has(e.prev.cls) && (e.cur.cls === Rt || e.cur.cls === Lt) && (e.next.cls === H || e.next.cls === W) ? Y : J;
}
function Un(e) {
	if (e.cur.cls === wt) return Y;
	switch (e.next.cls) {
		case U:
		case Lt:
		case Rt:
		case Jt: return Y;
	}
	return J;
}
function Wn(e) {
	return e.prev.cls === W && (e.cur.cls === Rt || e.cur.cls === Lt) && e.next.cls !== W ? Y : J;
}
function Gn(e) {
	return e.cur.cls === Qt && e.next.cls === W ? Y : J;
}
function Kn(e) {
	return e.next.cls === Bt ? Y : J;
}
function qn(e) {
	switch (e.cur.cls) {
		case H:
		case W:
			if (e.next.cls === G) return Y;
			break;
		case G: if (e.next.cls === H || e.next.cls === W) return Y;
	}
	return J;
}
function Jn(e) {
	return e.cur.cls === Xt && sn.has(e.next.cls) || e.next.cls === Yt && sn.has(e.cur.cls) ? Y : J;
}
function Yn(e) {
	return (e.cur.cls === Xt || e.cur.cls === Yt) && (e.next.cls === H || e.next.cls === W) || (e.cur.cls === H || e.cur.cls === W) && (e.next.cls === Xt || e.next.cls === Yt) ? Y : J;
}
var Xn = /* @__PURE__ */ new Set([Yt, Xt]), Zn = /* @__PURE__ */ new Set([Dt, kt]);
function Qn(e) {
	let t = null;
	if (Xn.has(e.next.cls) ? t = Zn.has(e.cur.cls) ? e.prev.len : e.cur.len : e.next.cls === G && (t = e.cur.len), t !== null) SyIsLoop: for (let { cls: n } of e.codePoints(t, !1)) switch (n) {
		case Qt:
		case Vt: continue;
		case G: return Y;
		default: break SyIsLoop;
	}
	if (e.cur.cls === Yt || e.cur.cls === Xt) {
		if (e.next.cls === Kt) {
			let t = e.afterNext();
			if (t && (t.cls === G || t.cls === Vt && e.afterNext(2)?.cls === G)) return Y;
		} else if (e.next.cls === G) return Y;
	}
	return e.cur.cls === Rt && e.next.cls === G || e.cur.cls === Vt && e.next.cls === G ? Y : J;
}
function $n(e) {
	switch (e.cur.cls) {
		case Ht:
			if (cn.has(e.next.cls)) return Y;
			break;
		case Wt:
		case Ft:
			if (un.has(e.next.cls)) return Y;
			break;
		case Ut:
		case It: if (e.next.cls === Ut) return Y;
	}
	return J;
}
function er(e) {
	switch (e.cur.cls) {
		case Ht:
		case Wt:
		case Ut:
		case Ft:
		case It:
			if (e.next.cls === Yt) return Y;
			break;
		case Xt: if (ln.has(e.next.cls)) return Y;
	}
	return J;
}
function tr(e) {
	return (e.cur.cls === H || e.cur.cls === W) && (e.next.cls === H || e.next.cls === W) ? Y : J;
}
function nr(e) {
	let { prev: t, cur: n, next: r } = e;
	function i(e) {
		return e.cls === bt || e.char === "◌" || e.cls === St;
	}
	return n.cls === xt && i(r) || i(n) && (r.cls === $t || r.cls === en) || i(t) && n.cls === en && (r.cls === bt || r.char === "◌") || i(n) && i(r) && e.afterNext()?.cls === $t ? Y : J;
}
function rr(e) {
	return e.cur.cls === Vt && (e.next.cls === H || e.next.cls === W) ? Y : J;
}
function ar(e) {
	switch (e.cur.cls) {
		case H:
		case W:
		case G:
			if (e.next.cls === Kt && !V.get(e.next.cp)) return Y;
			break;
		case kt: if (!V.get(e.cur.cp) && an.has(e.next.cls)) return Y;
	}
	return J;
}
function or(e) {
	if (e.cur.cls === Zt) {
		if (e.next.cls === Zt && ++e.RI % 2 != 0) return Y;
	} else e.RI = 0;
	return J;
}
function sr(e) {
	return e.cur.cls === jt && e.next.cls === Mt || e.next.cls === Mt && /^\p{ExtPict}$/u.test(e.cur.char) && /^\p{gc=Cn}$/u.test(e.cur.char) ? Y : J;
}
function cr() {
	return pn;
}
var lr = [
	hn,
	gn,
	_n,
	vn,
	yn,
	bn,
	xn,
	Sn,
	Cn,
	wn,
	Tn,
	En,
	Dn,
	On,
	kn,
	An,
	jn,
	Mn,
	Nn,
	Pn,
	Fn,
	In,
	Ln,
	Rn,
	zn,
	Bn,
	Hn,
	Wn,
	Un,
	Gn,
	Kn,
	qn,
	Jn,
	Yn,
	Qn,
	$n,
	er,
	tr,
	nr,
	rr,
	ar,
	or,
	sr,
	cr
], ur = class {
	#e;
	constructor(e = {}) {
		if (this.#e = {
			string: !1,
			example7: !1,
			verbose: !1,
			...e
		}, this.rules = [...lr], this.#e.example7) throw Error("'example7' flag deprecated");
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
				case pn: return this.#e.verbose && console.log(`  ${t.name}: MAY_BREAK`), new vt(e.cur.len);
				case mn: return this.#e.verbose && console.log(`  ${t.name}: MUST_BREAK`), new vt(e.cur.len, !0);
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
		let t = new _t(e);
		for (let e of t.codePoints(0)) t.push(e), yield* this.#n(t);
		t.pushEnd(), yield* this.#n(t);
	}
};
//#endregion
//#region src/text-layout.ts
function dr(e, t) {
	let n = new Intl.Segmenter(t, { granularity: "grapheme" }), r = /* @__PURE__ */ new Set([0]);
	for (let t of n.segment(e)) r.add(t.index + t.segment.length);
	return r;
}
var fr = class {
	#e = new ur();
	#t;
	constructor(e = "ja") {
		this.#t = e;
	}
	getBreakOpportunities(e) {
		let t = dr(e, this.#t), n = /* @__PURE__ */ new Map();
		for (let r of this.#e.breaks(e)) t.has(r.position) && n.set(r.position, (n.get(r.position) ?? !1) || r.required);
		return Object.freeze([...n].sort(([e], [t]) => e - t).map(([e, t]) => Object.freeze({
			position: e,
			required: t
		})));
	}
}, pr = /* @__PURE__ */ new Map(), mr = /\r\n|[\n\r\v\f\u0085\u2028\u2029]/gu;
function hr(e) {
	let t = pr.get(e);
	if (t) return t;
	let n = new fr(e);
	return pr.set(e, n), n;
}
function gr(e, t) {
	if (!Number.isFinite(e) || e < 0) throw TypeError(`${t} must return a non-negative finite number.`);
	return e;
}
function _r(e, t, n) {
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
function vr(e, t, n, r, i) {
	if (e.length === 0) return [{
		text: "",
		start: t,
		end: t,
		width: 0
	}];
	let a = dr(e, i), o = [...a].sort((e, t) => e - t), s = _r(e, r, a), c = [], l = 0;
	for (; l < e.length;) {
		let r = s.find((e) => e.position > l && e.required)?.position ?? e.length, i, a = 0;
		for (let t of s) {
			if (t.position <= l || t.position > r) continue;
			let o = e.slice(l, t.position), s = gr(n.measureText(o), "measureText");
			s <= n.maxWidth && (i = t.position, a = s);
		}
		if (i === void 0) {
			let t = o.filter((e) => e > l && e <= r);
			for (let r of t) {
				let t = e.slice(l, r), o = gr(n.measureText(t), "measureText");
				o <= n.maxWidth && (i = r, a = o);
			}
			i === void 0 && (i = t[0] ?? r, a = gr(n.measureText(e.slice(l, i)), "measureText"));
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
function yr(e) {
	if (typeof e.text != "string") throw TypeError("text must be a string.");
	if (!Number.isFinite(e.maxWidth) || e.maxWidth <= 0) throw TypeError("maxWidth must be a positive finite number.");
	if (typeof e.measureText != "function") throw TypeError("measureText must be a function.");
	let t = e.locale ?? "ja", n = e.lineBreakProvider ?? hr(t), r = [], i = 0;
	for (let a of e.text.matchAll(mr)) {
		let o = a.index;
		r.push(...vr(e.text.slice(i, o), i, e, n, t)), i = o + a[0].length;
	}
	return r.push(...vr(e.text.slice(i), i, e, n, t)), Object.freeze({
		lines: Object.freeze(r.map((e) => Object.freeze(e))),
		maxLineWidth: Math.max(0, ...r.map((e) => e.width))
	});
}
//#endregion
//#region src/composition.ts
var X = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleCompositionError", this.code = e;
	}
}, br = /* @__PURE__ */ new Set(["say", "think"]), xr = /* @__PURE__ */ new Set([
	"idle",
	"talking",
	"awaiting-continue"
]);
function Z(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Sr(e, t, n, r) {
	let i = /* @__PURE__ */ new Set([...t, ...n]), a = t.filter((t) => !Object.prototype.hasOwnProperty.call(e, t)), o = Object.keys(e).filter((e) => !i.has(e));
	if (a.length > 0 || o.length > 0) throw new X("BUBBLE-COMPOSITION-001", `${r} has missing or unknown properties.`);
}
function Q(e, t) {
	if (typeof e != "string" || e.trim().length === 0) throw new X("BUBBLE-COMPOSITION-001", `${t} must be a non-empty string.`);
	return e.trim();
}
function Cr(e, t, n) {
	if (!Z(e)) throw new X("BUBBLE-COMPOSITION-001", `${t} must be an object.`);
	if (Sr(e, ["frames", "frameIntervalSeconds"], [], t), !Array.isArray(e.frames) || e.frames.length < n) throw new X("BUBBLE-COMPOSITION-001", `${t}.frames must contain at least ${n} image asset name${n === 1 ? "" : "s"}.`);
	let r = Object.freeze(e.frames.map((e, n) => Q(e, `${t}.frames[${n}]`))), i = e.frameIntervalSeconds;
	if (typeof i != "number" || !Number.isFinite(i) || i <= 0) throw new X("BUBBLE-COMPOSITION-001", `${t}.frameIntervalSeconds must be a positive finite number.`);
	return Object.freeze({
		frames: r,
		frameIntervalSeconds: i
	});
}
function wr(e) {
	if (!Z(e)) throw new X("BUBBLE-COMPOSITION-001", "Bubble portrait must be an object.");
	Sr(e, ["base"], ["blink", "lipSync"], "Bubble portrait");
	let t = e.blink === void 0 ? void 0 : Cr(e.blink, "Bubble portrait blink", 1), n = e.lipSync === void 0 ? void 0 : Cr(e.lipSync, "Bubble portrait lip-sync", 1);
	return Object.freeze({
		base: Q(e.base, "Bubble portrait base"),
		...t === void 0 ? {} : { blink: t },
		...n === void 0 ? {} : { lipSync: n }
	});
}
function Tr(e) {
	if (!Z(e)) throw new X("BUBBLE-COMPOSITION-001", "Bubble style must be an object.");
	Sr(e, ["name", "textStyle"], [
		"placement",
		"maxWidth",
		"textLocale",
		"distance",
		"tailLength",
		"offset",
		"visualStyle",
		"portrait",
		"continueIndicator"
	], "Bubble style");
	let t = e.portrait === void 0 ? void 0 : wr(e.portrait), n = e.continueIndicator === void 0 ? void 0 : Cr(e.continueIndicator, "Bubble continue indicator", 2), r;
	try {
		r = _(e.placement ?? "up-right");
	} catch (e) {
		throw new X("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble placement is invalid.");
	}
	let i, a, o;
	try {
		i = x(e.distance ?? 12), a = S(e.tailLength ?? 18), o = e.offset === void 0 ? y : C(e.offset);
	} catch (e) {
		throw new X("BUBBLE-COMPOSITION-001", e instanceof Error ? e.message : "Bubble actor-relative transform is invalid.");
	}
	let s = e.visualStyle ?? "NORMAL";
	if (typeof s != "string" || !ae.includes(s)) throw new X("BUBBLE-COMPOSITION-001", `Unsupported Bubble visual style: ${String(s)}`);
	let c;
	if (e.maxWidth !== void 0) {
		if (typeof e.maxWidth != "number" || !Number.isFinite(e.maxWidth) || e.maxWidth <= 0) throw new X("BUBBLE-COMPOSITION-001", "Bubble style maxWidth must be a positive finite number.");
		c = e.maxWidth;
	}
	let l = e.textLocale === void 0 ? void 0 : Q(e.textLocale, "Bubble style text locale");
	return Object.freeze({
		name: Q(e.name, "Bubble style name"),
		textStyle: Q(e.textStyle, "Bubble text style name"),
		...c === void 0 ? {} : { maxWidth: c },
		...l === void 0 ? {} : { textLocale: l },
		placement: r,
		distance: i,
		tailLength: a,
		offset: o,
		visualStyle: s,
		...t === void 0 ? {} : { portrait: t },
		...n === void 0 ? {} : { continueIndicator: n }
	});
}
function Er(e) {
	if (e !== void 0) {
		if (!Z(e) || typeof e.applyToTarget != "function" || typeof e.getMimeType != "function" || typeof e.isRegistered != "function") throw TypeError("Bubble image capability must provide applyToTarget, getMimeType, and isRegistered.");
		return e;
	}
}
function Dr(e) {
	if (e === void 0) throw new X("BUBBLE-COMPOSITION-006", "Bubble image assets require an image capability. Provide options.imageResolver.");
	return e;
}
function Or(e) {
	if (!Z(e) || typeof e.setText != "function" || typeof e.releaseTarget != "function") throw TypeError("Bubble SVG Text composition must provide setText and releaseTarget.");
	return e;
}
function kr() {
	return Object.freeze({
		setTimeout: (e, t) => globalThis.setTimeout(e, t),
		clearTimeout: (e) => globalThis.clearTimeout(e)
	});
}
function Ar(e) {
	if (!Z(e) || typeof e.setTimeout != "function" || typeof e.clearTimeout != "function") throw TypeError("Bubble scheduler must provide setTimeout and clearTimeout.");
	return e;
}
function jr(e, t) {
	if (!Z(e) || typeof e.id != "string" || e.id.length === 0 || typeof e.isStage != "boolean") throw new X("BUBBLE-COMPOSITION-004", `${t} must provide id and isStage.`);
	return e;
}
function Mr(e) {
	if (!Z(e) || typeof e.drawableID != "number" || !Number.isInteger(e.drawableID) || e.drawableID < 0) throw new X("BUBBLE-COMPOSITION-004", "Bubble text target must provide a non-negative integer drawableID.");
	return e;
}
function Nr(e, t) {
	if (!Z(e) || !Z(e.targets) || typeof e.setLayerVisible != "function" || typeof e.updateStyle != "function" || typeof e.show != "function" || typeof e.hide != "function" || typeof e.dispose != "function") throw new X("BUBBLE-COMPOSITION-004", "Bubble surface is invalid.");
	let n = e.targets;
	Mr(n.text);
	let r = /* @__PURE__ */ new Set(), i = (e, t) => {
		let i = n[e];
		if (!t && i === void 0) return;
		let a = jr(i, `Bubble surface ${e}`);
		if (r.has(a.id)) throw new X("BUBBLE-COMPOSITION-004", "Bubble image layers must use distinct target IDs.");
		r.add(a.id);
	};
	return i("portraitBase", t.portrait !== void 0), i("portraitBlink", t.portrait?.blink !== void 0), i("portraitLipSync", t.portrait?.lipSync !== void 0), i("continueIndicator", t.continueIndicator !== void 0), e;
}
function Pr(e, t) {
	if (e === void 0) throw new X("BUBBLE-COMPOSITION-006", `Bubble image capability is required for: ${t}. Provide options.imageResolver.`);
	if (!e.isRegistered(t)) throw new X("BUBBLE-COMPOSITION-003", `Bubble image asset is not registered: ${t}`);
	if (!e.getMimeType(t).startsWith("image/")) throw new X("BUBBLE-COMPOSITION-003", `Bubble asset is not an image: ${t}`);
}
function Fr(e) {
	return [...e.portrait === void 0 ? [] : [
		e.portrait.base,
		...e.portrait.blink?.frames ?? [],
		...e.portrait.lipSync?.frames ?? []
	], ...e.continueIndicator?.frames ?? []];
}
function Ir(e, t, n) {
	if (t.maxWidth === void 0) return e;
	if (typeof n.measureText != "function") throw new X("BUBBLE-COMPOSITION-007", "Bubble style maxWidth requires the text capability measureText method.");
	return yr({
		text: e,
		maxWidth: t.maxWidth,
		...t.textLocale === void 0 ? {} : { locale: t.textLocale },
		measureText: (e) => n.measureText?.({
			styleName: t.textStyle,
			text: e
		}) ?? 0
	}).lines.map(({ text: e }) => e).join("\n");
}
function Lr(e, t) {
	if (e.length === 1) throw e[0];
	if (e.length > 1) throw AggregateError(e, t);
}
function Rr(e) {
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
function zr(e) {
	if (!Z(e)) throw new X("BUBBLE-COMPOSITION-001", "Show bubble input must be an object.");
	if (Sr(e, [
		"actor",
		"actorKey",
		"kind",
		"text",
		"styleName"
	], ["animationMode"], "Show bubble input"), !br.has(e.kind)) throw new X("BUBBLE-COMPOSITION-001", "Bubble kind must be say or think.");
	if (typeof e.text != "string") throw new X("BUBBLE-COMPOSITION-001", "Bubble text must be a string.");
	let t = e.animationMode ?? "talking";
	if (!xr.has(t)) throw new X("BUBBLE-COMPOSITION-001", "Bubble animation mode is invalid.");
	return {
		actor: e.actor,
		actorKey: Q(e.actorKey, "Bubble actor key"),
		kind: e.kind,
		text: e.text,
		styleName: Q(e.styleName, "Bubble style name"),
		animationMode: t
	};
}
function Br(e) {
	if (!Z(e)) throw TypeError("Bubble composition options must be an object.");
	let t = Er(e.imageResolver), n = Or(e.svgText);
	if (typeof e.createSurface != "function") throw TypeError("Bubble composition createSurface must be a function.");
	if (e.onAnimationError !== void 0 && typeof e.onAnimationError != "function") throw TypeError("Bubble composition onAnimationError must be a function.");
	let r = Ar(e.scheduler ?? kr()), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = !1, c = () => {
		if (s) throw new X("BUBBLE-COMPOSITION-005", "Bubble composition has been disposed.");
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
		if (!s) throw new X("BUBBLE-COMPOSITION-002", `Bubble style is not defined: ${o.styleName}`);
		let l = s, u = o.text, d = (e) => {
			let n = new Set(Fr(e)), r = n.size === 0 ? void 0 : Dr(t);
			for (let e of n) Pr(r, e);
			return r;
		}, f = d(l), p = async (e, t, n) => {
			let r = Fr(e).length === 0 ? void 0 : Dr(t), i = [];
			if (e.portrait) {
				let t = Dr(r);
				i.push(Promise.resolve(t.applyToTarget(e.portrait.base, n.targets.portraitBase)));
				let a = e.portrait.blink?.frames[0];
				a !== void 0 && i.push(Promise.resolve(t.applyToTarget(a, n.targets.portraitBlink)));
				let o = e.portrait.lipSync?.frames[0];
				o !== void 0 && i.push(Promise.resolve(t.applyToTarget(o, n.targets.portraitLipSync)));
			}
			let a = e.continueIndicator?.frames[0];
			if (a !== void 0) {
				let e = Dr(r);
				i.push(Promise.resolve(e.applyToTarget(a, n.targets.continueIndicator)));
			}
			await Promise.all(i);
		}, m = (t, n, i) => {
			y = t.portrait?.blink === void 0 ? void 0 : Rr({
				actorKey: o.actorKey,
				layer: "portraitBlink",
				animation: t.portrait.blink,
				target: i.targets.portraitBlink,
				imageResolver: Dr(n),
				scheduler: r,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), b = t.portrait?.lipSync === void 0 ? void 0 : Rr({
				actorKey: o.actorKey,
				layer: "portraitLipSync",
				animation: t.portrait.lipSync,
				target: i.targets.portraitLipSync,
				imageResolver: Dr(n),
				scheduler: r,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			}), x = t.continueIndicator === void 0 ? void 0 : Rr({
				actorKey: o.actorKey,
				layer: "continueIndicator",
				animation: t.continueIndicator,
				target: i.targets.continueIndicator,
				imageResolver: Dr(n),
				scheduler: r,
				...e.onAnimationError === void 0 ? {} : { onError: e.onAnimationError }
			});
		}, h = a.get(o.actorKey);
		h && await h.close();
		let g, _ = !1, v = !1, y, b, x;
		try {
			g = Nr(await e.createSurface(Object.freeze({
				actor: o.actor,
				actorKey: o.actorKey,
				kind: o.kind,
				style: l
			})), l), n.setText({
				styleName: l.textStyle,
				target: g.targets.text,
				text: Ir(o.text, l, n)
			}), _ = !0, await p(l, f, g), m(l, f, g);
			let t = "idle", r = !1, i = Promise.resolve(), s = async (e) => {
				e !== t && (e === "talking" ? (await x?.stop(), await g?.setLayerVisible("continueIndicator", !1), await g?.setLayerVisible("portraitLipSync", b !== void 0), await b?.start({ primed: !0 })) : e === "awaiting-continue" ? (await b?.stop({ reset: !0 }), await g?.setLayerVisible("portraitLipSync", !1), await g?.setLayerVisible("continueIndicator", x !== void 0), await x?.start({ primed: !0 })) : (await Promise.all([b?.stop({ reset: !0 }), x?.stop()]), await Promise.all([g?.setLayerVisible("portraitLipSync", !1), g?.setLayerVisible("continueIndicator", !1)])), t = e);
			};
			await Promise.all([
				g.setLayerVisible("portraitBase", l.portrait !== void 0),
				g.setLayerVisible("portraitBlink", l.portrait?.blink !== void 0),
				g.setLayerVisible("portraitLipSync", !1),
				g.setLayerVisible("continueIndicator", !1)
			]), await g.show(), v = !0, await y?.start({ primed: !0 }), await s(o.animationMode);
			let c = Object.freeze({
				actorKey: o.actorKey,
				kind: o.kind,
				get animationMode() {
					return t;
				},
				setText(e) {
					return r ? Promise.reject(new X("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${o.actorKey}`)) : typeof e == "string" ? (i = i.then(async () => {
						g && (n.setText({
							styleName: l.textStyle,
							target: g.targets.text,
							text: Ir(e, l, n)
						}), u = e, await g.show());
					}), i) : Promise.reject(new X("BUBBLE-COMPOSITION-001", "Bubble text must be a string."));
				},
				updateStyle(e) {
					if (r) return Promise.reject(new X("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${o.actorKey}`));
					let a;
					try {
						a = Tr(e);
					} catch (e) {
						return Promise.reject(e);
					}
					return i = i.then(async () => {
						if (!g) return;
						Nr(g, a);
						let e = d(a);
						await Promise.all([
							y?.stop(),
							b?.stop(),
							x?.stop()
						]), await p(a, e, g), await g.updateStyle(a), l = a, n.setText({
							styleName: a.textStyle,
							target: g.targets.text,
							text: Ir(u, a, n)
						}), m(a, e, g), await Promise.all([
							g.setLayerVisible("portraitBase", a.portrait !== void 0),
							g.setLayerVisible("portraitBlink", a.portrait?.blink !== void 0),
							g.setLayerVisible("portraitLipSync", !1),
							g.setLayerVisible("continueIndicator", !1)
						]);
						let r = t;
						t = "idle", await y?.start({ primed: !0 }), await s(r), await g.show();
					}), i;
				},
				setAnimationMode(e) {
					return r ? Promise.reject(new X("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${o.actorKey}`)) : xr.has(e) ? (i = i.then(() => s(e)), i) : Promise.reject(new X("BUBBLE-COMPOSITION-001", "Bubble animation mode is invalid."));
				},
				async close() {
					if (r) return;
					r = !0;
					let e = [];
					try {
						await i;
					} catch (t) {
						e.push(t);
					}
					for (let t of [
						() => y?.stop(),
						() => b?.stop(),
						() => x?.stop(),
						async () => {
							v && await g?.hide();
						},
						async () => {
							_ && g && n.releaseTarget(g.targets.text);
						},
						async () => g?.dispose()
					]) try {
						await t();
					} catch (t) {
						e.push(t);
					}
					a.get(o.actorKey) === c && a.delete(o.actorKey), Lr(e, `Failed to close bubble: ${o.actorKey}`);
				}
			});
			return a.set(o.actorKey, c), c;
		} catch (e) {
			let t = [], r = await Promise.allSettled([
				y?.stop(),
				b?.stop(),
				x?.stop()
			]);
			if (t.push(...r.flatMap((e) => e.status === "rejected" ? [e.reason] : [])), v && g) try {
				await g.hide();
			} catch (e) {
				t.push(e);
			}
			if (_ && g) try {
				n.releaseTarget(g.targets.text);
			} catch (e) {
				t.push(e);
			}
			if (g) try {
				await g.dispose();
			} catch (e) {
				t.push(e);
			}
			throw t.length > 0 ? AggregateError([e, ...t], `Failed to show and clean up bubble: ${o.actorKey}`, { cause: e }) : e;
		}
	};
	return Object.freeze({
		defineStyle(e) {
			c();
			let t = Tr(e);
			i.set(t.name, t);
		},
		hasActiveBubble(e) {
			return a.has(Q(e, "Bubble actor key"));
		},
		async show(e) {
			c();
			let t = zr(e);
			return l(t.actorKey, () => u(t));
		},
		releaseTarget(e) {
			c();
			let t = Q(e, "Bubble actor key");
			return l(t, async () => {
				await a.get(t)?.close();
			});
		},
		async releaseAll() {
			c(), await Promise.allSettled([...o.values()]), Lr((await Promise.allSettled([...a.values()].map((e) => e.close()))).flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to release all bubbles");
		},
		async dispose() {
			if (s) return;
			s = !0, await Promise.allSettled([...o.values()]);
			let e = await Promise.allSettled([...a.values()].map((e) => e.close()));
			i.clear(), Lr(e.flatMap((e) => e.status === "rejected" ? [e.reason] : []), "Failed to dispose bubble composition");
		}
	});
}
//#endregion
//#region src/turbowarp-adapter.ts
var Vr = "sprite", Hr = 96, Ur = 18, Wr = 8, Gr = 16, Kr = 0, $ = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "BubbleRuntimeAdapterError", this.code = e;
	}
};
function qr(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Jr(e) {
	if (!qr(e)) throw new $("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp renderer.");
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
function Yr(e) {
	if (!qr(e) || typeof e.isLoaded != "function" || typeof e.getAssetMimeType != "function" || typeof e.resolveSkin != "function") throw new $("BUBBLE-RUNTIME-002", "Bubble image assets require an imageResolver capability. Load @kubohiroya/turbowarp-asset-manager or provide options.imageResolver before using image features.");
	return e;
}
function Xr(e) {
	if (!qr(e) || typeof e.setText != "function" || typeof e.releaseTextActor != "function") throw new $("BUBBLE-RUNTIME-003", "Bubble requires SVG Text. Load @kubohiroya/turbowarp-svg-text before using Bubble blocks.");
	return e;
}
function Zr(e) {
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
function Qr(e, t, n) {
	let r = e.getCurrentSkinSize(t.drawableID);
	if (!Array.isArray(r) || r.length < 2) return n;
	let i = Number(r[0]), a = Number(r[1]);
	return !(i > 0) || !(a > 0) ? n : {
		width: i,
		height: a
	};
}
function $r(e, t, n, r = 1) {
	let i = Qr(e, t, {
		width: n,
		height: n
	}), a = Math.min(n / i.width, n / i.height) * r;
	return e.updateDrawableScale(t.drawableID, [a * 100, a * 100]), {
		width: i.width * a,
		height: i.height * a
	};
}
function ei(e, t, n) {
	return n < t ? (t + n) / 2 : Math.min(n, Math.max(t, e));
}
function ti(e, t, n, r, i) {
	let a = t + r * 2, o = n + i * 2;
	return e.replace(/<svg\b[^>]*>/u, (e) => e.replace(/\bwidth="[^"]*"/u, `width="${a}"`).replace(/\bheight="[^"]*"/u, `height="${o}"`).replace(/\bviewBox="[^"]*"/u, `viewBox="${-r} ${-i} ${a} ${o}"`));
}
function ni(e) {
	let t = v(e);
	return (Math.atan2(-t.x, -t.y) * 180 / Math.PI % 360 + 360) % 360;
}
function ri(e, t, n, r) {
	let i = e.renderer, a = Kr;
	Kr += 1;
	let o = [], s, c = (e) => {
		let t = i.createDrawable(Vr);
		if (!Number.isInteger(t) || t < 0) throw new $("BUBBLE-RUNTIME-001", `TurboWarp did not create the Bubble ${e} drawable.`);
		let r = Object.freeze({
			id: `bubble:${n}:${a}:${e}`,
			isStage: !1,
			drawableID: t
		});
		return o.push(r), i.updateDrawableVisible(t, !1), i.setDrawableOrder?.(t, Infinity, Vr), r;
	};
	try {
		let n = c("body"), a = r.portrait ? c("portrait-base") : void 0, l = r.portrait?.blink ? c("portrait-blink") : void 0, u = r.portrait?.lipSync ? c("portrait-lip-sync") : void 0, d = c("text"), f = r.continueIndicator ? c("continue-indicator") : void 0, p = Object.freeze({
			text: d,
			...a ? { portraitBase: a } : {},
			...l ? { portraitBlink: l } : {},
			...u ? { portraitLipSync: u } : {},
			...f ? { continueIndicator: f } : {}
		}), m = /* @__PURE__ */ new Map();
		a && m.set("portraitBase", a), l && m.set("portraitBlink", l), u && m.set("portraitLipSync", u), f && m.set("continueIndicator", f);
		let h = /* @__PURE__ */ new Map(), g = !1, _ = !1, v = "", y = r, b = () => {
			let r = y.placement.basis === "background" || t.visible !== !1;
			i.updateDrawableVisible(n.drawableID, g && r && y.visualStyle !== "NO_BUBBLE"), i.updateDrawableVisible(d.drawableID, g && r);
			for (let [e, t] of m) i.updateDrawableVisible(t.drawableID, g && r && (h.get(e) ?? !1));
			e.requestRedraw?.();
		}, x = () => {
			if (_) return;
			let e = y.placement.basis === "actor" ? y.offset.scalePercent / 100 : 1, r = Qr(i, d, {
				width: 180,
				height: 48
			});
			i.updateDrawableScale(d.drawableID, [e * 100, e * 100]);
			let o = {
				width: r.width * e,
				height: r.height * e
			}, c = a ? $r(i, a, Hr, e) : {
				width: 0,
				height: 0
			};
			for (let t of [l, u]) t && $r(i, t, Hr, e);
			let p = f ? $r(i, f, Ur, e) : {
				width: 0,
				height: 0
			}, m = c.width + (a ? Wr * e : 0) + o.width, h = Math.max(c.height, o.height), g = m / e + 48, x = h / e + 48, S = m, C = h, w = i.getNativeSize(), te = Array.isArray(w) && Number(w[0]) > 0 ? Number(w[0]) : 480, T = Array.isArray(w) && Number(w[1]) > 0 ? Number(w[1]) : 360, ne = -te / 2, re = te / 2, ie = T / 2, ae = -T / 2, E = ne + S / 2, D = re - S / 2, oe = ae + C / 2, O = ie - C / 2, k, A;
			if (y.placement.basis === "background") k = 0, A = y.placement.region === "HEADER_LIKE" ? ie - Gr - C / 2 : y.placement.region === "FOOTER_LIKE" ? ae + Gr + C / 2 : 0;
			else {
				let e = ee({
					bounds: Zr(t),
					bubbleWidth: S,
					bubbleHeight: C,
					direction: y.placement.direction,
					distance: y.distance,
					tailLength: y.tailLength,
					offset: y.offset
				});
				k = e.x, A = e.y;
			}
			k = ei(k, E, D), A = ei(A, oe, O);
			let j = y.placement.basis === "actor" ? ni(y.placement.direction) : null, M = y.placement.basis === "actor" ? [
				y.offset.x,
				y.offset.y,
				y.offset.scalePercent
			] : [
				0,
				0,
				100
			], N = j === null ? {
				x: 0,
				y: 0
			} : _e({
				style: y.visualStyle,
				width: g,
				height: x,
				tailDirection: j,
				tailLength: y.tailLength,
				offset: M
			}), P = Math.abs(M[0]) + g * Math.abs(e - 1) + Math.max(0, y.tailLength - 18) + 8, se = Math.abs(M[1]) + x * Math.abs(e - 1) + Math.max(0, y.tailLength - 18) + 8, F = JSON.stringify({
				baseBubbleHeight: x,
				baseBubbleWidth: g,
				bodyOffset: M,
				tailDirection: j,
				tailLength: y.tailLength,
				viewportExtraX: P,
				viewportExtraY: se,
				visualStyle: y.visualStyle
			});
			if (F !== v) {
				let e = ti(ye({
					style: y.visualStyle,
					lines: [],
					width: g,
					height: x,
					tailDirection: j,
					tailLength: y.tailLength,
					offset: M,
					title: `${y.name} Bubble body`
				}), g, x, P, se), t = i.createSVGSkin(e);
				if (!Number.isInteger(t) || t < 0) throw new $("BUBBLE-RUNTIME-001", "TurboWarp did not create the Bubble body SVG skin.");
				try {
					i.updateDrawableSkinId(n.drawableID, t);
				} catch (e) {
					throw i.destroySkin(t), e;
				}
				let r = s;
				s = t, v = F, r !== void 0 && i.destroySkin(r);
			}
			i.updateDrawableScale(n.drawableID, [100, 100]), i.updateDrawablePosition(n.drawableID, [k - N.x, A + N.y]);
			let ce = k - m / 2, le = ce + c.width / 2, ue = ce + c.width + (a ? Wr * e : 0) + o.width / 2;
			for (let e of [
				a,
				l,
				u
			]) e && i.updateDrawablePosition(e.drawableID, [le, A]);
			i.updateDrawablePosition(d.drawableID, [ue, A]), f && i.updateDrawablePosition(f.drawableID, [ue + o.width / 2 - p.width / 2 - Wr * e, A - o.height / 2 + p.height / 2 + Wr * e]), b();
		}, S = t.onTargetVisualChange, C = (e) => {
			S?.(e), x();
		};
		return y.placement.basis === "actor" && (t.onTargetVisualChange = C), Object.freeze({
			targets: p,
			setLayerVisible(e, t) {
				_ || (h.set(e, t), b());
			},
			updateStyle(e) {
				if (_) return;
				let n = y.placement.basis === "actor";
				y = e;
				let r = y.placement.basis === "actor";
				n && !r ? t.onTargetVisualChange === C && (t.onTargetVisualChange = S ?? null) : !n && r && (t.onTargetVisualChange = C), x();
			},
			show() {
				_ || (g = !0, x());
			},
			hide() {
				_ || (g = !1, b());
			},
			dispose() {
				if (!_) {
					_ = !0, y.placement.basis === "actor" && t.onTargetVisualChange === C && (t.onTargetVisualChange = S ?? null);
					for (let e of [...o].reverse()) i.destroyDrawable(e.drawableID, Vr);
					s !== void 0 && (i.destroySkin(s), s = void 0), e.requestRedraw?.();
				}
			}
		});
	} catch (e) {
		for (let e of [...o].reverse()) i.destroyDrawable(e.drawableID, Vr);
		throw s !== void 0 && i.destroySkin(s), e;
	}
}
function ii(e, t = {}) {
	if (!qr(e)) throw new $("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp runtime.");
	let n = e, r = Jr(n.renderer), i = () => Yr(n.ext_kubohiroyaassetmanager), a = t.svgText ? null : Xr(n.ext_kubohiroyasvgtext);
	return Br({
		imageResolver: t.imageResolver ?? {
			isRegistered(e) {
				return i().isLoaded({ NAME: e });
			},
			getMimeType(e) {
				return i().getAssetMimeType({ NAME: e });
			},
			async applyToTarget(e, t) {
				let a = t.drawableID;
				if (!Number.isInteger(a) || a < 0) throw new $("BUBBLE-RUNTIME-001", "Bubble image target drawable is invalid.");
				let o = await i().resolveSkin(e);
				if (!qr(o) || !Number.isInteger(o.skinId) || o.skinId < 0) throw new $("BUBBLE-RUNTIME-002", `Asset Manager did not resolve an image skin: ${String(e)}`);
				r.updateDrawableSkinId(a, o.skinId), n.requestRedraw?.();
			}
		},
		audio: t.audio ?? { async playSound(e, t = {}) {
			let n = i(), r = t.untilDone ? n?.playSoundUntilDone : n?.playSound;
			if (typeof r != "function") throw new $("BUBBLE-RUNTIME-002", "TurboWarp Asset Manager does not provide audio playback.");
			await r.call(n, { NAME: e });
		} },
		svgText: t.svgText ?? {
			setText({ styleName: e, target: t, text: n }) {
				a?.setText({
					STYLE: e,
					TEXT: n
				}, { target: t });
			},
			releaseTarget(e) {
				a?.releaseTextActor(e);
			},
			measureText({ styleName: e, text: t }) {
				let n = a?.measureText;
				if (typeof n != "function") throw new $("BUBBLE-RUNTIME-003", "SVG Text does not provide text measurement.");
				return n.call(a, e, t);
			}
		},
		createSurface({ actor: e, actorKey: t, style: r }) {
			if (!qr(e) || typeof e.id != "string") throw new $("BUBBLE-RUNTIME-001", "Bubble actor target is invalid.");
			return ri(n, e, t, r);
		},
		...t.scheduler === void 0 ? {} : { scheduler: t.scheduler },
		...t.onAnimationError === void 0 ? {} : { onAnimationError: t.onAnimationError }
	});
}
//#endregion
export { $ as BubbleRuntimeAdapterError, ii as createTurboWarpBubbleComposition };
