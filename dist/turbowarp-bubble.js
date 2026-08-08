// Name: Bubble
// ID: kubohiroyabubble
// Description: Layered say and think bubbles with portrait animation and advance indicators.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  //#region src/config.ts
  var extensionConfig = {
    id: "kubohiroyabubble",
    slug: "turbowarp-bubble",
    name: "Bubble",
    description: "Layered say and think bubbles with portrait animation and advance indicators.",
    author: "Hiroya Kubo",
    license: "MPL-2.0",
    unsandboxed: true
  };
  var block_definitions_default = {
    extensionName: "Bubble",
    blocks: [
      {
        "opcode": "defineBubbleStyle",
        "blockType": "COMMAND",
        "text": "define bubble style [STYLE] using text style [TEXT_STYLE]",
        "description": "Defines or replaces a bubble style and references a named SVG Text style.",
        "arguments": {
          "STYLE": {
            "type": "STRING",
            "defaultValue": "dialogue"
          },
          "TEXT_STYLE": {
            "type": "STRING",
            "defaultValue": "default"
          }
        }
      },
      {
        "opcode": "setPortraitBase",
        "blockType": "COMMAND",
        "text": "set portrait base [ASSET] for bubble style [STYLE]",
        "description": "Sets the registered image asset used as the portrait base. An empty asset removes the complete portrait.",
        "arguments": {
          "ASSET": {
            "type": "STRING",
            "defaultValue": "HeroFace"
          },
          "STYLE": {
            "type": "STRING",
            "defaultValue": "dialogue"
          }
        }
      },
      {
        "opcode": "setBlinkFrames",
        "blockType": "COMMAND",
        "text": "set blink frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]",
        "description": "Sets comma-separated registered image assets for the portrait blink layer. An empty list removes blink animation.",
        "arguments": {
          "ASSETS": {
            "type": "STRING",
            "defaultValue": "EyesOpen,EyesClosed"
          },
          "SECONDS": {
            "type": "NUMBER",
            "defaultValue": .4
          },
          "STYLE": {
            "type": "STRING",
            "defaultValue": "dialogue"
          }
        }
      },
      {
        "opcode": "setTalkFrames",
        "blockType": "COMMAND",
        "text": "set talk frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]",
        "description": "Sets comma-separated registered image assets for the portrait talk layer. An empty list removes talk animation.",
        "arguments": {
          "ASSETS": {
            "type": "STRING",
            "defaultValue": "MouthClosed,MouthOpen"
          },
          "SECONDS": {
            "type": "NUMBER",
            "defaultValue": .1
          },
          "STYLE": {
            "type": "STRING",
            "defaultValue": "dialogue"
          }
        }
      },
      {
        "opcode": "setAdvanceFrames",
        "blockType": "COMMAND",
        "text": "set advance frames [ASSETS] every [SECONDS] seconds for bubble style [STYLE]",
        "description": "Sets at least two comma-separated registered image assets for the waiting indicator. An empty list removes the indicator.",
        "arguments": {
          "ASSETS": {
            "type": "STRING",
            "defaultValue": "Next1,Next2"
          },
          "SECONDS": {
            "type": "NUMBER",
            "defaultValue": .2
          },
          "STYLE": {
            "type": "STRING",
            "defaultValue": "dialogue"
          }
        }
      },
      {
        "opcode": "sayWithBubbleStyle",
        "blockType": "COMMAND",
        "text": "say [MESSAGE] with bubble style [STYLE]",
        "description": "Shows or replaces this sprite's layered say bubble in the speaking phase.",
        "arguments": {
          "MESSAGE": {
            "type": "STRING",
            "defaultValue": "Hello!"
          },
          "STYLE": {
            "type": "STRING",
            "defaultValue": "dialogue"
          }
        }
      },
      {
        "opcode": "thinkWithBubbleStyle",
        "blockType": "COMMAND",
        "text": "think [MESSAGE] with bubble style [STYLE]",
        "description": "Shows or replaces this sprite's layered think bubble in the speaking phase.",
        "arguments": {
          "MESSAGE": {
            "type": "STRING",
            "defaultValue": "Hmm..."
          },
          "STYLE": {
            "type": "STRING",
            "defaultValue": "dialogue"
          }
        }
      },
      {
        "opcode": "setBubblePhase",
        "blockType": "COMMAND",
        "text": "set this bubble phase [PHASE]",
        "description": "Changes this sprite's bubble phase. Waiting stops talk animation and starts the advance indicator.",
        "arguments": { "PHASE": {
          "type": "STRING",
          "defaultValue": "waiting",
          "menu": "phase"
        } }
      },
      {
        "opcode": "closeBubble",
        "blockType": "COMMAND",
        "text": "close this bubble",
        "description": "Closes this sprite's bubble and releases its timers, SVG text skin, and drawables.",
        "arguments": {}
      },
      {
        "opcode": "getVersion",
        "blockType": "REPORTER",
        "text": "Bubble version",
        "description": "Returns the Bubble implementation version.",
        "arguments": {}
      }
    ],
    menus: { "phase": {
      "acceptReporters": true,
      "items": [
        "speaking",
        "waiting",
        "idle"
      ]
    } }
  };
  //#endregion
  //#region \0@oxc-project+runtime@0.143.0/helpers/esm/typeof.js
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
      return typeof o;
    } : function(o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  //#endregion
  //#region \0@oxc-project+runtime@0.143.0/helpers/esm/toPrimitive.js
  function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  //#endregion
  //#region \0@oxc-project+runtime@0.143.0/helpers/esm/toPropertyKey.js
  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  //#endregion
  //#region \0@oxc-project+runtime@0.143.0/helpers/esm/defineProperty.js
  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }
  //#endregion
  //#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/constants.js
  var LSCP_INDEX_2_OFFSET = 2048;
  var INDEX_1_OFFSET = 2112;
  //#endregion
  //#region node_modules/.pnpm/fflate@0.8.3/node_modules/fflate/esm/browser.js
  var u8 = Uint8Array;
  var u16 = Uint16Array;
  var i32 = Int32Array;
  var fleb = new u8([
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
  ]);
  var fdeb = new u8([
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
  ]);
  var clim = new u8([
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
  ]);
  var freb = function(eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) b[i] = start += 1 << eb[i - 1];
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) for (var j = b[i]; j < b[i + 1]; ++j) r[j] = j - b[i] << 5 | i;
    return {
      b,
      r
    };
  };
  var _a = freb(fleb, 2);
  var fl = _a.b;
  var revfl = _a.r;
  fl[28] = 258, revfl[258] = 28;
  var _b = freb(fdeb, 0);
  var fd = _b.b;
  _b.r;
  var rev = new u16(32768);
  for (var i = 0; i < 32768; ++i) {
    var x = (i & 43690) >> 1 | (i & 21845) << 1;
    x = (x & 52428) >> 2 | (x & 13107) << 2;
    x = (x & 61680) >> 4 | (x & 3855) << 4;
    rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
  }
  var hMap = (function(cd, mb, r) {
    var s = cd.length;
    var i = 0;
    var l = new u16(mb);
    for (; i < s; ++i) if (cd[i]) ++l[cd[i] - 1];
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) le[i] = le[i - 1] + l[i - 1] << 1;
    var co;
    if (r) {
      co = new u16(1 << mb);
      var rvb = 15 - mb;
      for (i = 0; i < s; ++i) if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) co[rev[v] >> rvb] = sv;
      }
    } else {
      co = new u16(s);
      for (i = 0; i < s; ++i) if (cd[i]) co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
    }
    return co;
  });
  var flt = new u8(288);
  for (var i = 0; i < 144; ++i) flt[i] = 8;
  for (var i = 144; i < 256; ++i) flt[i] = 9;
  for (var i = 256; i < 280; ++i) flt[i] = 7;
  for (var i = 280; i < 288; ++i) flt[i] = 8;
  var fdt = new u8(32);
  for (var i = 0; i < 32; ++i) fdt[i] = 5;
  var flrm = /*#__PURE__*/ hMap(flt, 9, 1);
  var fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
  var max = function(a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) if (a[i] > m) m = a[i];
    return m;
  };
  var bits = function(d, p, m) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
  };
  var bits16 = function(d, p) {
    var o = p / 8 | 0;
    return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
  };
  var shft = function(p) {
    return (p + 7) / 8 | 0;
  };
  var slc = function(v, s, e) {
    if (s == null || s < 0) s = 0;
    if (e == null || e > v.length) e = v.length;
    return new u8(v.subarray(s, e));
  };
  var ec = [
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
  ];
  var err = function(ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace) Error.captureStackTrace(e, err);
    if (!nt) throw e;
    return e;
  };
  var inflt = function(dat, st, buf, dict) {
    var sl = dat.length, dl = dict ? dict.length : 0;
    if (!sl || st.f && !st.l) return buf || new u8(0);
    var noBuf = !buf;
    var resize = noBuf || st.i != 2;
    var noSt = st.i;
    if (noBuf) buf = new u8(sl * 3);
    var cbuf = function(l) {
      var bl = buf.length;
      if (l > bl) {
        var nbuf = new u8(Math.max(bl * 2, l));
        nbuf.set(buf);
        buf = nbuf;
      }
    };
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    var tbts = sl * 8;
    do {
      if (!lm) {
        final = bits(dat, pos, 1);
        var type = bits(dat, pos + 1, 3);
        pos += 3;
        if (!type) {
          var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
          if (t > sl) {
            if (noSt) err(0);
            break;
          }
          if (resize) cbuf(bt + l);
          buf.set(dat.subarray(s, t), bt);
          st.b = bt += l, st.p = pos = t * 8, st.f = final;
          continue;
        } else if (type == 1) lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
        else if (type == 2) {
          var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
          var tl = hLit + bits(dat, pos + 5, 31) + 1;
          pos += 14;
          var ldt = new u8(tl);
          var clt = new u8(19);
          for (var i = 0; i < hcLen; ++i) clt[clim[i]] = bits(dat, pos + i * 3, 7);
          pos += hcLen * 3;
          var clb = max(clt), clbmsk = (1 << clb) - 1;
          var clm = hMap(clt, clb, 1);
          for (var i = 0; i < tl;) {
            var r = clm[bits(dat, pos, clbmsk)];
            pos += r & 15;
            var s = r >> 4;
            if (s < 16) ldt[i++] = s;
            else {
              var c = 0, n = 0;
              if (s == 16) n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
              else if (s == 17) n = 3 + bits(dat, pos, 7), pos += 3;
              else if (s == 18) n = 11 + bits(dat, pos, 127), pos += 7;
              while (n--) ldt[i++] = c;
            }
          }
          var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
          lbt = max(lt);
          dbt = max(dt);
          lm = hMap(lt, lbt, 1);
          dm = hMap(dt, dbt, 1);
        } else err(1);
        if (pos > tbts) {
          if (noSt) err(0);
          break;
        }
      }
      if (resize) cbuf(bt + 131072);
      var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
      var lpos = pos;
      for (;; lpos = pos) {
        var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
        pos += c & 15;
        if (pos > tbts) {
          if (noSt) err(0);
          break;
        }
        if (!c) err(2);
        if (sym < 256) buf[bt++] = sym;
        else if (sym == 256) {
          lpos = pos, lm = null;
          break;
        } else {
          var add = sym - 254;
          if (sym > 264) {
            var i = sym - 257, b = fleb[i];
            add = bits(dat, pos, (1 << b) - 1) + fl[i];
            pos += b;
          }
          var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
          if (!d) err(3);
          pos += d & 15;
          var dt = fd[dsym];
          if (dsym > 3) {
            var b = fdeb[dsym];
            dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
          }
          if (pos > tbts) {
            if (noSt) err(0);
            break;
          }
          if (resize) cbuf(bt + 131072);
          var end = bt + add;
          if (bt < dt) {
            var shift = dl - dt, dend = Math.min(dt, end);
            if (shift + bt < 0) err(3);
            for (; bt < dend; ++bt) buf[bt] = dict[shift + bt];
          }
          for (; bt < end; ++bt) buf[bt] = buf[bt - dt];
        }
      }
      st.l = lm, st.p = lpos, st.b = bt, st.f = final;
      if (lm) final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
  };
  var et = /*#__PURE__*/ new u8(0);
  var gzs = function(d) {
    if (d[0] != 31 || d[1] != 139 || d[2] != 8) err(6, "invalid gzip data");
    var flg = d[3];
    var st = 10;
    if (flg & 4) st += (d[10] | d[11] << 8) + 2;
    for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++]);
    return st + (flg & 2);
  };
  var gzl = function(d) {
    var l = d.length;
    return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
  };
  function gunzipSync(data, opts) {
    var st = gzs(data);
    if (st + 8 > data.length) err(6, "invalid gzip data");
    return inflt(data.subarray(st, -8), { i: 2 }, opts && opts.out || new u8(gzl(data)), opts && opts.dictionary);
  }
  var td = typeof TextDecoder != "undefined" && /*#__PURE__*/ new TextDecoder();
  try {
    td.decode(et, { stream: true });
  } catch (e) {}
  //#endregion
  //#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/swap.js
  var isBigEndian = new Uint8Array(new Uint32Array([305419896]).buffer)[0] === 18;
  /**
  * Exported for testing
  * @param {Uint8Array} array
  * @private
  */
  function swap32(array) {
    const len = array.length;
    for (let i = 0; i < len; i += 4) [array[i], array[i + 1], array[i + 2], array[i + 3]] = [
      array[i + 3],
      array[i + 2],
      array[i + 1],
      array[i]
    ];
  }
  /**
  * No-op.
  *
  * @param {Uint8Array} _array Ingored
  * @private
  */
  function noOp(_array) {}
  var swap32LE = isBigEndian ? swap32 : noOp;
  //#endregion
  //#region node_modules/.pnpm/@cto.af+unicode-trie-runtime@3.2.9/node_modules/@cto.af/unicode-trie-runtime/index.js
  var DECODER = new TextDecoder();
  /**
  * @typedef {object} TrieValues
  * @prop {Int32Array} data
  * @prop {number} highStart
  * @prop {number} errorValue
  * @prop {string[]} [values]
  */
  var UnicodeTrie = class UnicodeTrie {
    /**
    * Creates a trie, either from compressed data or pre-parsed values.
    *
    * @param {Uint8Array|TrieValues} data
    */
    constructor(data) {
      if (data instanceof Uint8Array) {
        let uncompressedLength = 0;
        const view = new DataView(data.buffer);
        this.highStart = view.getUint32(0, true);
        this.errorValue = view.getUint32(4, true);
        uncompressedLength = view.getUint32(8, true);
        if (uncompressedLength !== 4294967295) throw new Error("Trie created with old version of @cto.af/unicode-trie.");
        uncompressedLength = view.getUint32(12, true);
        if (16 + uncompressedLength > data.byteLength) throw new RangeError("Invalid input length");
        const values = data.subarray(16 + uncompressedLength);
        /**
        * @type{string[]}
        */
        this.values = values.length ? JSON.parse(DECODER.decode(gunzipSync(values))) : [];
        data = gunzipSync(data.subarray(16, 16 + uncompressedLength));
        swap32LE(data);
        /**
        * @type {Int32Array}
        */
        this.data = new Int32Array(data.buffer);
      } else ({data: this.data, highStart: this.highStart, errorValue: this.errorValue, values: this.values = []} = data);
    }
    /**
    * Creates a trie from a base64-encoded string.
    * @param {string} base64 The base64-encoded trie to initialize.
    * @returns {UnicodeTrie} The decoded Unicode trie.
    */
    static fromBase64(base64) {
      return new UnicodeTrie(new Uint8Array(atob(base64).split("").map((c) => c.charCodeAt(0))));
    }
    /**
    * Get the value associated with a codepoint, or the default value, or the
    * error value if codePoint is out of range.
    *
    * @param {number} codePoint
    * @returns {number}
    */
    get(codePoint) {
      let val = this.errorValue;
      if (codePoint < 0 || codePoint > 1114111) val = this.errorValue;
      else if (codePoint < 55296 || codePoint > 56319 && codePoint <= 65535) {
        const index = (this.data[codePoint >> 5] << 2) + (codePoint & 31);
        val = this.data[index];
      } else if (codePoint <= 65535) {
        const index = (this.data[LSCP_INDEX_2_OFFSET + (codePoint - 55296 >> 5)] << 2) + (codePoint & 31);
        val = this.data[index];
      } else if (codePoint < this.highStart) {
        let index = this.data[INDEX_1_OFFSET - 32 + (codePoint >> 11)];
        index = this.data[index + (codePoint >> 5 & 63)];
        index = (index << 2) + (codePoint & 31);
        val = this.data[index];
      } else val = this.data[this.data.length - 4];
      return val;
    }
    /**
    * Get the value associated with the codePoint, stringified if possible.
    *
    * @param {number} codePoint
    * @returns {number|string}
    */
    getString(codePoint) {
      const val = this.get(codePoint);
      return this.values[val] ?? val;
    }
  };
  //#endregion
  //#region node_modules/.pnpm/@cto.af+linebreak@4.0.3/node_modules/@cto.af/linebreak/lib/LineBreak.js
  var LineBreak = UnicodeTrie.fromBase64(`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
     v6Y9S0rqHMbaN8j3flUbVIdpnonTleaP+JsiapunntfVOer7WUdXNw+jCyvNYxE6P9Ix+7Mu
     TCa3uM3mb9JUmfLe1q59N19yulXnD5dfU/yRyn/8vR2Cr9H8JB/btsm29undfCw/56tbVmVX
     d53nXtV0+Iw4rjNTk8udOvdtwl13j1B1YuT5b04HMpsW/7HCr8t/dF0Of846J3W9HPtdNnUf
     x7UvpdsiV1mJjawiFLWODEm73G1mLF1J2/GB7X7UtvqhJeeTfPc4T7mPtLpuWqWJ66malIZV
     Oq6uerCp9Oh1dlzCzrpIudKf92/hsZbP+hIbHa0Q/fQYe/v4lmd5T5s6veq6vYViyzJT69KV
     2t/FlN451zKFrm3i9U0264J0fQOX9U5Vfe6S+xPRL8VaHJe8rK69qpNJqe92jX81XX3X2fr8
     XPaHsq1PdPWWa12Sag1GaXmwT98pZ/2vy8+h7e8gsHdGcrvn+ou5l5j6K7GfmPobXJiY4xLb
     d9C3GKnM2H7Xkd7j+z1I03X5ftWxjd9KwDLy0mNPV/fUtSCh4wyeF5DXS8nzWnSd9Jqrfrye
     UWfa3NP1O131E9TnTDItvs/rn9Qwm9y3lS/yuiSdDK2J32LmH61l4/l7DpMcFl0cy/HpKvNU
     5Z6yuzmgsPj4PZX78jydfMzx1BFk7Gr61smlU9yXf7w+UL7Pa5Fc9pe3lTntI+YJYvTvQ9Y9
     x9gbNOU66lxyYJPsuqPtBRpjvW7uX6n9Y3LpfMUe8+fYy6sJ+99x2QyVR1TJrEvlz9Lxmzq8
     Kct+jO8mpnIrV35pYv3rso+6j2w1RzkxpWeOslpV38Xey7lJ7XVVnDdFVyDn2o2m7A1s871r
     U3+hbp661LfjbL6l6vL9O5v5uiqdcd/9mG3sVrlrktHl3m+5Ln46Qply/f51rDq2afV3U92P
     9Z2CVPu71+kExf4uhm265Mpfcrjl9S+p/WGjb9FEeYmrHlhsXTLb772b2v3U8bKvoAk6VaQ3
     ZdqvWf2FytNd9g1W/c57VNf9+JuMuXT+ZJ1tnZ6T7U+un1PXpSm/BxKiZ+b6nUC5P+bybdoU
     3wWR9zP1WcOrrtc06dG7rA9gf6lzCCVlQKl1cKvW16r7MjdxPqHue3m55l5M6yRy1q8p6i+d
     GzbfR5Dtqeeu1D2rulVlp+67ulXfzlDPqS/AP52us+kb5aoetdp226wrqOtHuvxc9InlsMrX
     5HCkgvtULt80VtPB5tvHlLbU51R1leQ+nW0ftknjClM7Ktf7Pt9n161FKfULHbeU/P5brO/5
     8PeveZ2l+s31OpmmizxP5z/VrssvNP7Vb9XbUGr+LWSdWKr4c/lemct7U/1KfJcs5nfiXNcz
     Va3lCf2OXi75c+gaSd/4SyH/pmds+8G2fWCbvmwMeZapf6v2g9hU16vF7l/65K8cc6uh7bIs
     W8jdLyyxp4BPPOru6+Qx8rd8beIyhew8xjoMtU8l90dcyldseUOJPpPLevpc7ZnvL8f4oaRO
     ad34WVeefPYVSdG+27T7vPdESj0VV5leyvXoufQvffKZTpZmGy+27UNKfYCc5dWmj2fbp44Z
     P6G/WN9X1cl8beoieS7ad7+PGP14nz1ATO1q3Xx2jHnpWO1xR1uPovumYQndrFD9uyrdvpD4
     b9L8Yaz9wxl5bbVu/XlT9j2X/Rr6Hl7brYPd0V1jM5bOk+84oUn7xpeeH7IhVJ7j25+IrU9s
     ig+XOi7lGMtGj9pGB903/kuMQVPuORpjv7+c35AvvYYkNO1CviFvU4/HkF+qe2ZTG+VTn1bt
     fV7y5/PtqNR76oeuy4zlH3n/9ND3qPuxu7xb3cuj7heahiXq4ljrC1R5vm5M39HGFz7yzRLr
     k1PoMMfcPzeGvDPWPssxw6Rzo8QcXmp3XGSSHX2/Et08k67f5dtmuupKN2FvMpOsKObeDnVx
     k3ofp1h6VrFIVVdV7T2fYm9013l7k/5rbNlKaBuXso7LLV+K1d67uuWiJ19ShhcjvUP97FsO
     Q+V7pdfDpy5rtv2qEPkU7XFY0v3Q+Oc8FpqHdHV9Xf415XFbPTPfPk7qNWsufow9vkqlz6v+
     eA4udH9l3XxtiA5ZyN5XpvxSNzdetRdQlWnKjzbP695Xt9+WTz/bJk5y6tDVlYHUe0Crv9Bv
     vMf+bnzq79DHenfs/ZD3y4TO7b0S7vPM8Z5yL2mTG1XXKcyMLh5093OzvwbVfzr/1hHDby7u
     ufhH5z/Vrm1YZPsheUtn2pQh+RnfMmCqy3PN7aSeN0oRtrp8m6oONOXflHVfrnj0ccdU1lVS
     yYu7Ssjz96ZwxEgz13rX1c3Y+Sp2vJve7eN+zP3nYsojYunAhMq1cs2vM1X9J99+Q2g+d+1z
     5OznpXJD1zcKcc/U33KN39TzgCnr4lz95Fz1cW79kxT6SDF00UruT5ZDZ8Xl9x83MV0I0CwB
     AB+LCAC4xcFoAgMdjksWhCAMBO/CelYzJ4gMCqiI4t/n/a9hyk29JN3p5DL7bj7GTQrbKypR
     dDVVywyhZCz4xkUhnSIj5EExoFoQisIfbICE2WJOoAESSK7wecCscDJSxRXMbBAlfLCyIbTh
     T8tr5/YikvVFSYq3dURbKo/gf+Q3zBCELycCXW/uB2mPjCb8AAAA`);
  /**
  * @type {Record<string, number>}
  */
  var names$1 = Object.fromEntries(LineBreak.values.map((v, i) => [v, i]));
  var { values: values$1 } = LineBreak;
  var { AI, AL: AL$1, CJ, CM: CM$1, NS: NS$1, SA, SG, SP: SP$1, XX } = names$1;
  //#endregion
  //#region node_modules/.pnpm/@cto.af+linebreak@4.0.3/node_modules/@cto.af/linebreak/lib/EastAsianWidth.js
  var EastAsianWidth = UnicodeTrie.fromBase64(`AAAEAAAAAAD/////wQIAAB+LCAC1xcFoAgPtmj1IHUEQxzd5FiaEkMLSKqQIViEQCEmTjyqk
     SUgR7OySTrHxdVoIYqUg2AgqFhYWFhYidpYqKDaClVZaqJWF2qj/xT1cjjtv772Z3T1uHvzY
     753d2b252ds3+1SpRbAMVkGSrlMo5LNjIfqoB/uEfR2Ao5yy4zb7PgUX4Brcgo6GUi9AF+gG
     r0EPeAc+AN3mM8KvJu6DH0bWb08yeyEneV77rHia/yjbMvEBxJum7mCqzQjSo1beuBWfRFy3
     1fHpR2QJgiAIgiAIgiAIQpoZc45c8HhGd2WJYUyy5oIgCP5oRPhuEQQh7vvPVuAe34q5x1lH
     uJFh15J7HRt9Z7MJ9iKwg1fP72kG4osqz3ynUlNPHjhC2i5/9UypX8DOa6bSa0hfAbsf33zE
     /EPLr7NtOYj4zlTfD+v7dG0r8uzhXM39qEPH9TtBvTNwUXK9dyv0frzE3DSxje8mZ0yNjuz8
     zlT+S6T1OnQh7M5oo+f+Bvk67EGY/OfiPeKfTL5+hr6ZuM13k/cT4R/QC86tMfdZbf4a2Un6
     H9L9OXNIGCoo12yDYdR7mzG+tP8yhjoTpt607tuh/6r7b1VG7yv5ya/OP7iZQXEdYyi9UNel
     WKM83YTQE/f8qftudz9y7G/OdWlXLxTPYRm9cu+ZMutMaYuK2tnjyqpb5jnPa8+xH7n3eJFO
     ivRGbTNC6su3PeHYM0V7OxZ/hUtWLP5ZFfzDmMYQSieU8qj78rF3fMsI+axX5fwWYvw+5t9u
     f0VnNR964yh31bdLOce8qfYb11ndVWeUvibHfCj8tZD2LNZvTRyyW/GfQr1/OM8gob/LcPn8
     If3iVmVT23Iu/69KaxHzOYn6XenTNw1551DW/3V5X7v6c9Tfh7jPX9TrFtqOhjgPttqeW28u
     33192kvqs2vW7w7BeyuJcEoAAB+LCAC1xcFoAgOLVvJT0lGKVIoFANHfAiwJAAAA`);
  Object.fromEntries(EastAsianWidth.values.map((v, i) => [v, i]));
  var { values } = EastAsianWidth;
  //#endregion
  //#region node_modules/.pnpm/@cto.af+linebreak@4.0.3/node_modules/@cto.af/linebreak/lib/index.js
  var { AK, AL, AP, AS, B2, BA, BB, BK, CB, CL, CM, CP, CR, EB, EM, EX, GL, H2, H3, HH, HL, HY, ID, IN, IS, JL, JT, JV, LF, NU, OP, NL, NS, PO, PR, RI, SP, SY, QU, VF, VI, WJ, ZW, ZWJ } = names$1;
  //#endregion
  //#region src/composition.ts
  var BubbleCompositionError = class extends Error {
    constructor(code, message) {
      super(message);
      _defineProperty(this, "code", void 0);
      this.name = "BubbleCompositionError";
      this.code = code;
    }
  };
  var validKinds = /* @__PURE__ */ new Set(["say", "think"]);
  var validPhases$1 = /* @__PURE__ */ new Set([
    "idle",
    "speaking",
    "waiting"
  ]);
  function isRecord$1(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function requireExactKeys(value, required, optional, label) {
    const allowed = /* @__PURE__ */ new Set([...required, ...optional]);
    const missing = required.filter((key) => !Object.prototype.hasOwnProperty.call(value, key));
    const unknown = Object.keys(value).filter((key) => !allowed.has(key));
    if (missing.length > 0 || unknown.length > 0) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", `${label} has missing or unknown properties.`);
  }
  function requireName(value, label) {
    if (typeof value !== "string" || value.trim().length === 0) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", `${label} must be a non-empty string.`);
    return value.trim();
  }
  function normalizeAnimation(value, label, minimumFrames) {
    if (!isRecord$1(value)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", `${label} must be an object.`);
    requireExactKeys(value, ["frames", "frameIntervalSeconds"], [], label);
    if (!Array.isArray(value.frames) || value.frames.length < minimumFrames) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", `${label}.frames must contain at least ${minimumFrames} image asset name${minimumFrames === 1 ? "" : "s"}.`);
    const frames = Object.freeze(value.frames.map((frame, index) => requireName(frame, `${label}.frames[${index}]`)));
    const interval = value.frameIntervalSeconds;
    if (typeof interval !== "number" || !Number.isFinite(interval) || interval <= 0) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", `${label}.frameIntervalSeconds must be a positive finite number.`);
    return Object.freeze({
      frames,
      frameIntervalSeconds: interval
    });
  }
  function normalizePortrait(value) {
    if (!isRecord$1(value)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", "Bubble portrait must be an object.");
    requireExactKeys(value, ["base"], ["blink", "talk"], "Bubble portrait");
    const blink = value.blink === void 0 ? void 0 : normalizeAnimation(value.blink, "Bubble portrait blink", 1);
    const talk = value.talk === void 0 ? void 0 : normalizeAnimation(value.talk, "Bubble portrait talk", 1);
    return Object.freeze({
      base: requireName(value.base, "Bubble portrait base"),
      ...blink === void 0 ? {} : { blink },
      ...talk === void 0 ? {} : { talk }
    });
  }
  function normalizeStyle(value) {
    if (!isRecord$1(value)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", "Bubble style must be an object.");
    requireExactKeys(value, ["name", "textStyle"], ["portrait", "advanceIndicator"], "Bubble style");
    const portrait = value.portrait === void 0 ? void 0 : normalizePortrait(value.portrait);
    const advanceIndicator = value.advanceIndicator === void 0 ? void 0 : normalizeAnimation(value.advanceIndicator, "Bubble advance indicator", 2);
    return Object.freeze({
      name: requireName(value.name, "Bubble style name"),
      textStyle: requireName(value.textStyle, "Bubble text style name"),
      ...portrait === void 0 ? {} : { portrait },
      ...advanceIndicator === void 0 ? {} : { advanceIndicator }
    });
  }
  function validateAssetManager(value) {
    if (!isRecord$1(value) || typeof value.applyToTarget !== "function" || typeof value.getMimeType !== "function" || typeof value.isRegistered !== "function") throw new TypeError("Bubble asset manager must provide applyToTarget, getMimeType, and isRegistered.");
    return value;
  }
  function validateSvgText(value) {
    if (!isRecord$1(value) || typeof value.setText !== "function" || typeof value.releaseTarget !== "function") throw new TypeError("Bubble SVG Text composition must provide setText and releaseTarget.");
    return value;
  }
  function defaultScheduler() {
    return Object.freeze({
      setTimeout: (callback, milliseconds) => globalThis.setTimeout(callback, milliseconds),
      clearTimeout: (handle) => globalThis.clearTimeout(handle)
    });
  }
  function validateScheduler(value) {
    if (!isRecord$1(value) || typeof value.setTimeout !== "function" || typeof value.clearTimeout !== "function") throw new TypeError("Bubble scheduler must provide setTimeout and clearTimeout.");
    return value;
  }
  function validateAssetTarget(value, label) {
    if (!isRecord$1(value) || typeof value.id !== "string" || value.id.length === 0 || typeof value.isStage !== "boolean") throw new BubbleCompositionError("BUBBLE-COMPOSITION-004", `${label} must provide id and isStage.`);
    return value;
  }
  function validateTextTarget(value) {
    if (!isRecord$1(value) || typeof value.drawableID !== "number" || !Number.isInteger(value.drawableID) || value.drawableID < 0) throw new BubbleCompositionError("BUBBLE-COMPOSITION-004", "Bubble text target must provide a non-negative integer drawableID.");
    return value;
  }
  function validateSurface(value, style) {
    if (!isRecord$1(value) || !isRecord$1(value.targets) || typeof value.setLayerVisible !== "function" || typeof value.show !== "function" || typeof value.hide !== "function" || typeof value.dispose !== "function") throw new BubbleCompositionError("BUBBLE-COMPOSITION-004", "Bubble surface is invalid.");
    const targets = value.targets;
    validateTextTarget(targets.text);
    const assetTargetIds = /* @__PURE__ */ new Set();
    const requireLayerTarget = (key, required) => {
      const target = targets[key];
      if (!required && target === void 0) return;
      const validated = validateAssetTarget(target, `Bubble surface ${key}`);
      if (assetTargetIds.has(validated.id)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-004", "Bubble image layers must use distinct target IDs.");
      assetTargetIds.add(validated.id);
    };
    requireLayerTarget("portraitBase", style.portrait !== void 0);
    requireLayerTarget("portraitBlink", style.portrait?.blink !== void 0);
    requireLayerTarget("portraitTalk", style.portrait?.talk !== void 0);
    requireLayerTarget("advanceIndicator", style.advanceIndicator !== void 0);
    return value;
  }
  function requireImageAsset(assetManager, name) {
    if (!assetManager.isRegistered(name)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-003", `Bubble image asset is not registered: ${name}`);
    if (!assetManager.getMimeType(name).startsWith("image/")) throw new BubbleCompositionError("BUBBLE-COMPOSITION-003", `Bubble asset is not an image: ${name}`);
  }
  function styleAssetNames(style) {
    return [...style.portrait === void 0 ? [] : [
      style.portrait.base,
      ...style.portrait.blink?.frames ?? [],
      ...style.portrait.talk?.frames ?? []
    ], ...style.advanceIndicator?.frames ?? []];
  }
  function aggregateErrors(errors, message) {
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) throw new AggregateError(errors, message);
  }
  function createFrameLoop(options) {
    let running = false;
    let generation = 0;
    let frameIndex = 0;
    let timer;
    let pending = Promise.resolve();
    const applyFrame = async (index) => {
      const assetName = options.animation.frames[index];
      if (assetName === void 0) return;
      await options.assetManager.applyToTarget(assetName, options.target);
    };
    const reportError = (error, assetName) => {
      options.onError?.(error, Object.freeze({
        actorKey: options.actorKey,
        layer: options.layer,
        assetName
      }));
    };
    const schedule = (expectedGeneration) => {
      timer = options.scheduler.setTimeout(() => {
        timer = void 0;
        if (!running || generation !== expectedGeneration) return;
        frameIndex = (frameIndex + 1) % options.animation.frames.length;
        const assetName = options.animation.frames[frameIndex];
        pending = pending.then(() => applyFrame(frameIndex)).catch((error) => {
          running = false;
          generation += 1;
          reportError(error, assetName ?? "");
        }).then(() => {
          if (running && generation === expectedGeneration) schedule(expectedGeneration);
        });
      }, options.animation.frameIntervalSeconds * 1e3);
    };
    return Object.freeze({
      async start(startOptions = {}) {
        if (running) return;
        running = true;
        generation += 1;
        const expectedGeneration = generation;
        frameIndex = 0;
        if (!(startOptions.primed ?? false)) await applyFrame(frameIndex);
        if (!running || generation !== expectedGeneration) return;
        schedule(expectedGeneration);
      },
      async stop(stopOptions = {}) {
        const wasRunning = running;
        running = false;
        generation += 1;
        if (timer !== void 0) options.scheduler.clearTimeout(timer);
        timer = void 0;
        await pending;
        if ((stopOptions.reset ?? false) && (wasRunning || frameIndex !== 0)) {
          frameIndex = 0;
          await applyFrame(frameIndex);
        }
      }
    });
  }
  function normalizeShowInput(value) {
    if (!isRecord$1(value)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", "Show bubble input must be an object.");
    requireExactKeys(value, [
      "actor",
      "actorKey",
      "kind",
      "text",
      "styleName"
    ], ["phase"], "Show bubble input");
    if (!validKinds.has(value.kind)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", "Bubble kind must be say or think.");
    if (typeof value.text !== "string") throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", "Bubble text must be a string.");
    const phase = value.phase ?? "speaking";
    if (!validPhases$1.has(phase)) throw new BubbleCompositionError("BUBBLE-COMPOSITION-001", "Bubble phase is invalid.");
    return {
      actor: value.actor,
      actorKey: requireName(value.actorKey, "Bubble actor key"),
      kind: value.kind,
      text: value.text,
      styleName: requireName(value.styleName, "Bubble style name"),
      phase
    };
  }
  function createBubbleComposition(options) {
    if (!isRecord$1(options)) throw new TypeError("Bubble composition options must be an object.");
    const assetManager = validateAssetManager(options.assetManager);
    const svgText = validateSvgText(options.svgText);
    if (typeof options.createSurface !== "function") throw new TypeError("Bubble composition createSurface must be a function.");
    if (options.onAnimationError !== void 0 && typeof options.onAnimationError !== "function") throw new TypeError("Bubble composition onAnimationError must be a function.");
    const scheduler = validateScheduler(options.scheduler ?? defaultScheduler());
    const styles = /* @__PURE__ */ new Map();
    const active = /* @__PURE__ */ new Map();
    const actorQueues = /* @__PURE__ */ new Map();
    let disposed = false;
    const ensureActive = () => {
      if (disposed) throw new BubbleCompositionError("BUBBLE-COMPOSITION-005", "Bubble composition has been disposed.");
    };
    const enqueueActor = async (actorKey, operation) => {
      const current = (actorQueues.get(actorKey) ?? Promise.resolve()).catch(() => void 0).then(operation);
      actorQueues.set(actorKey, current);
      try {
        return await current;
      } finally {
        if (actorQueues.get(actorKey) === current) actorQueues.delete(actorKey);
      }
    };
    const showNow = async (input) => {
      ensureActive();
      const style = styles.get(input.styleName);
      if (!style) throw new BubbleCompositionError("BUBBLE-COMPOSITION-002", `Bubble style is not defined: ${input.styleName}`);
      for (const assetName of new Set(styleAssetNames(style))) requireImageAsset(assetManager, assetName);
      const previous = active.get(input.actorKey);
      if (previous) await previous.close();
      let surface;
      let textOwned = false;
      let surfaceVisible = false;
      let blinkLoop;
      let talkLoop;
      let indicatorLoop;
      try {
        surface = validateSurface(await options.createSurface(Object.freeze({
          actor: input.actor,
          actorKey: input.actorKey,
          kind: input.kind,
          style
        })), style);
        svgText.setText({
          styleName: style.textStyle,
          target: surface.targets.text,
          text: input.text
        });
        textOwned = true;
        const primeOperations = [];
        if (style.portrait) {
          primeOperations.push(assetManager.applyToTarget(style.portrait.base, surface.targets.portraitBase));
          const blinkFirst = style.portrait.blink?.frames[0];
          if (blinkFirst !== void 0) primeOperations.push(assetManager.applyToTarget(blinkFirst, surface.targets.portraitBlink));
          const talkFirst = style.portrait.talk?.frames[0];
          if (talkFirst !== void 0) primeOperations.push(assetManager.applyToTarget(talkFirst, surface.targets.portraitTalk));
        }
        const indicatorFirst = style.advanceIndicator?.frames[0];
        if (indicatorFirst !== void 0) primeOperations.push(assetManager.applyToTarget(indicatorFirst, surface.targets.advanceIndicator));
        await Promise.all(primeOperations);
        blinkLoop = style.portrait?.blink === void 0 ? void 0 : createFrameLoop({
          actorKey: input.actorKey,
          layer: "portraitBlink",
          animation: style.portrait.blink,
          target: surface.targets.portraitBlink,
          assetManager,
          scheduler,
          ...options.onAnimationError === void 0 ? {} : { onError: options.onAnimationError }
        });
        talkLoop = style.portrait?.talk === void 0 ? void 0 : createFrameLoop({
          actorKey: input.actorKey,
          layer: "portraitTalk",
          animation: style.portrait.talk,
          target: surface.targets.portraitTalk,
          assetManager,
          scheduler,
          ...options.onAnimationError === void 0 ? {} : { onError: options.onAnimationError }
        });
        indicatorLoop = style.advanceIndicator === void 0 ? void 0 : createFrameLoop({
          actorKey: input.actorKey,
          layer: "advanceIndicator",
          animation: style.advanceIndicator,
          target: surface.targets.advanceIndicator,
          assetManager,
          scheduler,
          ...options.onAnimationError === void 0 ? {} : { onError: options.onAnimationError }
        });
        let currentPhase = "idle";
        let closed = false;
        let transitionTail = Promise.resolve();
        const applyPhase = async (phase) => {
          if (phase === currentPhase) return;
          if (phase === "speaking") {
            await indicatorLoop?.stop();
            await surface?.setLayerVisible("advanceIndicator", false);
            await surface?.setLayerVisible("portraitTalk", talkLoop !== void 0);
            await talkLoop?.start({ primed: true });
          } else if (phase === "waiting") {
            await talkLoop?.stop({ reset: true });
            await surface?.setLayerVisible("portraitTalk", false);
            await surface?.setLayerVisible("advanceIndicator", indicatorLoop !== void 0);
            await indicatorLoop?.start({ primed: true });
          } else {
            await Promise.all([talkLoop?.stop({ reset: true }), indicatorLoop?.stop()]);
            await Promise.all([surface?.setLayerVisible("portraitTalk", false), surface?.setLayerVisible("advanceIndicator", false)]);
          }
          currentPhase = phase;
        };
        await Promise.all([
          surface.setLayerVisible("portraitBase", style.portrait !== void 0),
          surface.setLayerVisible("portraitBlink", style.portrait?.blink !== void 0),
          surface.setLayerVisible("portraitTalk", false),
          surface.setLayerVisible("advanceIndicator", false)
        ]);
        await surface.show();
        surfaceVisible = true;
        await blinkLoop?.start({ primed: true });
        await applyPhase(input.phase);
        const handle = Object.freeze({
          actorKey: input.actorKey,
          kind: input.kind,
          get phase() {
            return currentPhase;
          },
          setPhase(phase) {
            if (closed) return Promise.reject(new BubbleCompositionError("BUBBLE-COMPOSITION-005", `Bubble is already closed: ${input.actorKey}`));
            if (!validPhases$1.has(phase)) return Promise.reject(new BubbleCompositionError("BUBBLE-COMPOSITION-001", "Bubble phase is invalid."));
            transitionTail = transitionTail.then(() => applyPhase(phase));
            return transitionTail;
          },
          async close() {
            if (closed) return;
            closed = true;
            const errors = [];
            try {
              await transitionTail;
            } catch (error) {
              errors.push(error);
            }
            for (const operation of [
              () => blinkLoop?.stop(),
              () => talkLoop?.stop(),
              () => indicatorLoop?.stop(),
              async () => {
                if (surfaceVisible) await surface?.hide();
              },
              async () => {
                if (textOwned && surface) svgText.releaseTarget(surface.targets.text);
              },
              async () => surface?.dispose()
            ]) try {
              await operation();
            } catch (error) {
              errors.push(error);
            }
            if (active.get(input.actorKey) === handle) active.delete(input.actorKey);
            aggregateErrors(errors, `Failed to close bubble: ${input.actorKey}`);
          }
        });
        active.set(input.actorKey, handle);
        return handle;
      } catch (error) {
        const cleanupErrors = [];
        const loopResults = await Promise.allSettled([
          blinkLoop?.stop(),
          talkLoop?.stop(),
          indicatorLoop?.stop()
        ]);
        cleanupErrors.push(...loopResults.flatMap((result) => result.status === "rejected" ? [result.reason] : []));
        if (surfaceVisible && surface) try {
          await surface.hide();
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
        if (textOwned && surface) try {
          svgText.releaseTarget(surface.targets.text);
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
        if (surface) try {
          await surface.dispose();
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
        if (cleanupErrors.length > 0) throw new AggregateError([error, ...cleanupErrors], `Failed to show and clean up bubble: ${input.actorKey}`, { cause: error });
        throw error;
      }
    };
    return Object.freeze({
      defineStyle(input) {
        ensureActive();
        const style = normalizeStyle(input);
        styles.set(style.name, style);
      },
      hasActiveBubble(actorKey) {
        return active.has(requireName(actorKey, "Bubble actor key"));
      },
      async show(input) {
        ensureActive();
        const normalized = normalizeShowInput(input);
        return enqueueActor(normalized.actorKey, () => showNow(normalized));
      },
      releaseTarget(actorKey) {
        ensureActive();
        const normalized = requireName(actorKey, "Bubble actor key");
        return enqueueActor(normalized, async () => {
          await active.get(normalized)?.close();
        });
      },
      async releaseAll() {
        ensureActive();
        await Promise.allSettled([...actorQueues.values()]);
        aggregateErrors((await Promise.allSettled([...active.values()].map((handle) => handle.close()))).flatMap((result) => result.status === "rejected" ? [result.reason] : []), "Failed to release all bubbles");
      },
      async dispose() {
        if (disposed) return;
        disposed = true;
        await Promise.allSettled([...actorQueues.values()]);
        const results = await Promise.allSettled([...active.values()].map((handle) => handle.close()));
        styles.clear();
        aggregateErrors(results.flatMap((result) => result.status === "rejected" ? [result.reason] : []), "Failed to dispose bubble composition");
      }
    });
  }
  //#endregion
  //#region src/turbowarp-adapter.ts
  var spriteLayer = "sprite";
  var portraitBoxSize = 96;
  var indicatorBoxSize = 18;
  var contentGap = 8;
  var actorGap = 12;
  var surfaceSequence = 0;
  var BubbleRuntimeAdapterError = class extends Error {
    constructor(code, message) {
      super(message);
      _defineProperty(this, "code", void 0);
      this.name = "BubbleRuntimeAdapterError";
      this.code = code;
    }
  };
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function requireRenderer(value) {
    if (!isRecord(value)) throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp renderer.");
    const methods = [
      "createDrawable",
      "destroyDrawable",
      "getCurrentSkinSize",
      "getNativeSize",
      "updateDrawablePosition",
      "updateDrawableScale",
      "updateDrawableSkinId",
      "updateDrawableVisible"
    ];
    if (methods.some((method) => typeof value[method] !== "function")) throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-001", `Bubble renderer must provide ${methods.join(", ")}.`);
    return value;
  }
  function requireAssetManager(value) {
    if (!isRecord(value) || typeof value.isLoaded !== "function" || typeof value.getAssetMimeType !== "function" || typeof value.resolveSkin !== "function") throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-002", "Bubble requires Asset Manager. Load @kubohiroya/turbowarp-asset-manager before using Bubble blocks.");
    return value;
  }
  function requireSvgText(value) {
    if (!isRecord(value) || typeof value.setText !== "function" || typeof value.releaseTextActor !== "function") throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-003", "Bubble requires SVG Text. Load @kubohiroya/turbowarp-svg-text before using Bubble blocks.");
    return value;
  }
  function targetBounds(target) {
    try {
      const bounds = target.getBoundsForBubble?.();
      if (bounds && [
        bounds.bottom,
        bounds.left,
        bounds.right,
        bounds.top
      ].every((value) => Number.isFinite(value))) return bounds;
    } catch {}
    const x = Number.isFinite(target.x) ? Number(target.x) : 0;
    const y = Number.isFinite(target.y) ? Number(target.y) : 0;
    return {
      bottom: y,
      left: x,
      right: x,
      top: y
    };
  }
  function readSize(renderer, target, fallback) {
    const raw = renderer.getCurrentSkinSize(target.drawableID);
    if (!Array.isArray(raw) || raw.length < 2) return fallback;
    const width = Number(raw[0]);
    const height = Number(raw[1]);
    if (!(width > 0) || !(height > 0)) return fallback;
    return {
      width,
      height
    };
  }
  function fitDrawable(renderer, target, boxSize) {
    const native = readSize(renderer, target, {
      width: boxSize,
      height: boxSize
    });
    const scale = Math.min(boxSize / native.width, boxSize / native.height);
    renderer.updateDrawableScale(target.drawableID, [scale * 100, scale * 100]);
    return {
      width: native.width * scale,
      height: native.height * scale
    };
  }
  function clamp(value, minimum, maximum) {
    if (maximum < minimum) return (minimum + maximum) / 2;
    return Math.min(maximum, Math.max(minimum, value));
  }
  function createSurface(runtime, actor, actorKey, style) {
    const renderer = runtime.renderer;
    const sequence = surfaceSequence;
    surfaceSequence += 1;
    const drawables = [];
    const createTarget = (layer) => {
      const drawableID = renderer.createDrawable(spriteLayer);
      if (!Number.isInteger(drawableID) || drawableID < 0) throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-001", `TurboWarp did not create the Bubble ${layer} drawable.`);
      const target = Object.freeze({
        id: `bubble:${actorKey}:${sequence}:${layer}`,
        isStage: false,
        drawableID
      });
      drawables.push(target);
      renderer.updateDrawableVisible(drawableID, false);
      renderer.setDrawableOrder?.(drawableID, Infinity, spriteLayer);
      return target;
    };
    try {
      const portraitBase = style.portrait ? createTarget("portrait-base") : void 0;
      const portraitBlink = style.portrait?.blink ? createTarget("portrait-blink") : void 0;
      const portraitTalk = style.portrait?.talk ? createTarget("portrait-talk") : void 0;
      const text = createTarget("text");
      const advanceIndicator = style.advanceIndicator ? createTarget("advance-indicator") : void 0;
      const targets = Object.freeze({
        text,
        ...portraitBase ? { portraitBase } : {},
        ...portraitBlink ? { portraitBlink } : {},
        ...portraitTalk ? { portraitTalk } : {},
        ...advanceIndicator ? { advanceIndicator } : {}
      });
      const layerTargets = /* @__PURE__ */ new Map();
      if (portraitBase) layerTargets.set("portraitBase", portraitBase);
      if (portraitBlink) layerTargets.set("portraitBlink", portraitBlink);
      if (portraitTalk) layerTargets.set("portraitTalk", portraitTalk);
      if (advanceIndicator) layerTargets.set("advanceIndicator", advanceIndicator);
      const layerVisibility = /* @__PURE__ */ new Map();
      let surfaceVisible = false;
      let disposed = false;
      const updateVisibility = () => {
        const actorVisible = actor.visible !== false;
        renderer.updateDrawableVisible(text.drawableID, surfaceVisible && actorVisible);
        for (const [layer, target] of layerTargets) renderer.updateDrawableVisible(target.drawableID, surfaceVisible && actorVisible && (layerVisibility.get(layer) ?? false));
        runtime.requestRedraw?.();
      };
      const position = () => {
        if (disposed) return;
        const textSize = readSize(renderer, text, {
          width: 180,
          height: 48
        });
        const portraitSize = portraitBase ? fitDrawable(renderer, portraitBase, portraitBoxSize) : {
          width: 0,
          height: 0
        };
        for (const target of [portraitBlink, portraitTalk]) if (target) fitDrawable(renderer, target, portraitBoxSize);
        const indicatorSize = advanceIndicator ? fitDrawable(renderer, advanceIndicator, indicatorBoxSize) : {
          width: 0,
          height: 0
        };
        const totalWidth = portraitSize.width + (portraitBase ? contentGap : 0) + textSize.width;
        const contentHeight = Math.max(portraitSize.height, textSize.height);
        const bounds = targetBounds(actor);
        const nativeSize = renderer.getNativeSize();
        const stageWidth = Array.isArray(nativeSize) && Number(nativeSize[0]) > 0 ? Number(nativeSize[0]) : 480;
        const stageHeight = Array.isArray(nativeSize) && Number(nativeSize[1]) > 0 ? Number(nativeSize[1]) : 360;
        const stageLeft = -stageWidth / 2;
        const stageRight = stageWidth / 2;
        const stageTop = stageHeight / 2;
        const stageBottom = -stageHeight / 2;
        const centerX = clamp((bounds.left + bounds.right) / 2, stageLeft + totalWidth / 2, stageRight - totalWidth / 2);
        let centerY = bounds.top + actorGap + contentHeight / 2;
        if (centerY + contentHeight / 2 > stageTop) centerY = bounds.bottom - actorGap - contentHeight / 2;
        centerY = clamp(centerY, stageBottom + contentHeight / 2, stageTop - contentHeight / 2);
        const left = centerX - totalWidth / 2;
        const portraitX = left + portraitSize.width / 2;
        const textX = left + portraitSize.width + (portraitBase ? contentGap : 0) + textSize.width / 2;
        for (const target of [
          portraitBase,
          portraitBlink,
          portraitTalk
        ]) if (target) renderer.updateDrawablePosition(target.drawableID, [portraitX, centerY]);
        renderer.updateDrawablePosition(text.drawableID, [textX, centerY]);
        if (advanceIndicator) renderer.updateDrawablePosition(advanceIndicator.drawableID, [textX + textSize.width / 2 - indicatorSize.width / 2 - contentGap, centerY - textSize.height / 2 + indicatorSize.height / 2 + contentGap]);
        updateVisibility();
      };
      const originalVisualChange = actor.onTargetVisualChange;
      const visualChangeHook = (changedTarget) => {
        originalVisualChange?.(changedTarget);
        position();
      };
      actor.onTargetVisualChange = visualChangeHook;
      return Object.freeze({
        targets,
        setLayerVisible(layer, visible) {
          if (disposed) return;
          layerVisibility.set(layer, visible);
          updateVisibility();
        },
        show() {
          if (disposed) return;
          surfaceVisible = true;
          position();
        },
        hide() {
          if (disposed) return;
          surfaceVisible = false;
          updateVisibility();
        },
        dispose() {
          if (disposed) return;
          disposed = true;
          if (actor.onTargetVisualChange === visualChangeHook) actor.onTargetVisualChange = originalVisualChange ?? null;
          for (const target of [...drawables].reverse()) renderer.destroyDrawable(target.drawableID, spriteLayer);
          runtime.requestRedraw?.();
        }
      });
    } catch (error) {
      for (const target of [...drawables].reverse()) renderer.destroyDrawable(target.drawableID, spriteLayer);
      throw error;
    }
  }
  function createTurboWarpBubbleComposition(runtimeInput, options = {}) {
    if (!isRecord(runtimeInput)) throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-001", "Bubble requires the TurboWarp runtime.");
    const runtime = runtimeInput;
    const renderer = requireRenderer(runtime.renderer);
    const assetExtension = requireAssetManager(runtime.ext_kubohiroyaassetmanager);
    const svgTextExtension = requireSvgText(runtime.ext_kubohiroyasvgtext);
    return createBubbleComposition({
      assetManager: {
        isRegistered(name) {
          return assetExtension.isLoaded({ NAME: name });
        },
        getMimeType(name) {
          return assetExtension.getAssetMimeType({ NAME: name });
        },
        async applyToTarget(name, target) {
          const drawableID = target.drawableID;
          if (!Number.isInteger(drawableID) || drawableID < 0) throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-001", "Bubble image target drawable is invalid.");
          const skin = await assetExtension.resolveSkin(name);
          if (!isRecord(skin) || !Number.isInteger(skin.skinId) || skin.skinId < 0) throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-002", `Asset Manager did not resolve an image skin: ${String(name)}`);
          renderer.updateDrawableSkinId(drawableID, skin.skinId);
          runtime.requestRedraw?.();
        }
      },
      svgText: {
        setText({ styleName, target, text }) {
          svgTextExtension.setText({
            STYLE: styleName,
            TEXT: text
          }, { target });
        },
        releaseTarget(target) {
          svgTextExtension.releaseTextActor(target);
        }
      },
      createSurface({ actor, actorKey, style }) {
        if (!isRecord(actor) || typeof actor.id !== "string") throw new BubbleRuntimeAdapterError("BUBBLE-RUNTIME-001", "Bubble actor target is invalid.");
        return createSurface(runtime, actor, actorKey, style);
      },
      ...options.scheduler === void 0 ? {} : { scheduler: options.scheduler },
      ...options.onAnimationError === void 0 ? {} : { onAnimationError: options.onAnimationError }
    });
  }
  //#endregion
  //#region src/extension.ts
  var blockDefinitions = block_definitions_default.blocks;
  var definitionMenus = block_definitions_default.menus;
  var validPhases = /* @__PURE__ */ new Set([
    "idle",
    "speaking",
    "waiting"
  ]);
  var EXTENSION_DOCS_URI = "https://github.com/kubohiroya/turbowarp-bubble#readme";
  var EXTENSION_VERSION = "0.1.0";
  function extensionError(message) {
    const error = /* @__PURE__ */ new Error(`[Bubble] ${message}`);
    Object.defineProperty(error, "code", { value: "BUBBLE-EXTENSION-001" });
    return error;
  }
  var BubbleExtension = class {
    constructor(runtime = Scratch.vm?.runtime, options = {}) {
      _defineProperty(this, "runtime", void 0);
      _defineProperty(this, "options", void 0);
      _defineProperty(this, "styles", /* @__PURE__ */ new Map());
      _defineProperty(this, "handles", /* @__PURE__ */ new Map());
      _defineProperty(this, "composition", null);
      _defineProperty(this, "disposed", false);
      if (!runtime) throw extensionError("TurboWarp runtime is unavailable.");
      this.runtime = runtime;
      this.options = options;
      const releaseAll = () => {
        this.releaseAll().catch(() => void 0);
      };
      const releaseTarget = (target) => {
        if (this.isTarget(target)) this.releaseOwnedTarget(target.id).catch(() => void 0);
      };
      runtime.on?.("PROJECT_START", releaseAll);
      runtime.on?.("PROJECT_STOP_ALL", releaseAll);
      runtime.on?.("STOP_FOR_TARGET", releaseTarget);
      runtime.on?.("RUNTIME_DISPOSED", () => {
        this.dispose().catch(() => void 0);
      });
    }
    getInfo() {
      return {
        id: extensionConfig.id,
        name: Scratch.translate(block_definitions_default.extensionName),
        docsURI: EXTENSION_DOCS_URI,
        color1: "#ff6680",
        blocks: blockDefinitions.map((block) => this.toScratchBlock(block)),
        menus: definitionMenus
      };
    }
    defineBubbleStyle(args) {
      const name = this.requireName(args.STYLE, "style");
      const style = Object.freeze({
        name,
        textStyle: this.requireName(args.TEXT_STYLE, "text style")
      });
      this.installStyle(style);
    }
    setPortraitBase(args) {
      const style = this.requireStyle(args.STYLE);
      const base = this.toString(args.ASSET).trim();
      const nextStyle = base ? Object.freeze({
        ...style,
        portrait: {
          ...style.portrait,
          base
        }
      }) : Object.freeze({
        name: style.name,
        textStyle: style.textStyle,
        ...style.advanceIndicator ? { advanceIndicator: style.advanceIndicator } : {}
      });
      this.installStyle(nextStyle);
    }
    setBlinkFrames(args) {
      this.setPortraitAnimation("blink", args);
    }
    setTalkFrames(args) {
      this.setPortraitAnimation("talk", args);
    }
    setAdvanceFrames(args) {
      const style = this.requireStyle(args.STYLE);
      const frames = this.parseFrames(args.ASSETS);
      if (frames.length === 1) throw extensionError("advance frames must contain at least two assets.");
      const advanceIndicator = frames.length === 0 ? void 0 : this.animationInput(frames, args.SECONDS, "advance");
      const nextStyle = Object.freeze({
        name: style.name,
        textStyle: style.textStyle,
        ...style.portrait ? { portrait: style.portrait } : {},
        ...advanceIndicator ? { advanceIndicator } : {}
      });
      this.installStyle(nextStyle);
    }
    sayWithBubbleStyle(args, util) {
      return this.show("say", args, util);
    }
    thinkWithBubbleStyle(args, util) {
      return this.show("think", args, util);
    }
    async setBubblePhase(args, util) {
      const target = this.requireTarget(util);
      const phase = this.toString(args.PHASE).trim().toLowerCase();
      if (!validPhases.has(phase)) throw extensionError("phase must be speaking, waiting, or idle.");
      const handle = this.handles.get(target.id);
      if (!handle) throw extensionError("this sprite does not have an active bubble.");
      await handle.setPhase(phase);
    }
    async closeBubble(_args, util) {
      const target = this.requireTarget(util);
      await this.releaseOwnedTarget(target.id);
    }
    getVersion() {
      return EXTENSION_VERSION;
    }
    async releaseAll() {
      if (!this.composition) return;
      await this.composition.releaseAll();
      this.handles.clear();
    }
    async dispose() {
      if (this.disposed) return;
      this.disposed = true;
      if (this.composition) await this.composition.dispose();
      this.handles.clear();
      this.styles.clear();
    }
    toScratchBlock(block) {
      return {
        opcode: block.opcode,
        blockType: Scratch.BlockType[block.blockType],
        text: Scratch.translate(block.text),
        arguments: Object.fromEntries(Object.entries(block.arguments).map(([name, argument]) => [name, {
          type: Scratch.ArgumentType[argument.type],
          defaultValue: argument.defaultValue,
          ...argument.menu === void 0 ? {} : { menu: argument.menu }
        }]))
      };
    }
    toString(value) {
      return Scratch.Cast.toString(value);
    }
    requireName(value, label) {
      const name = this.toString(value).trim();
      if (!name) throw extensionError(`${label} name is empty.`);
      return name;
    }
    requireStyle(value) {
      const name = this.requireName(value, "style");
      const style = this.styles.get(name);
      if (!style) throw extensionError(`bubble style is not defined: ${name}`);
      return style;
    }
    installStyle(style) {
      this.styles.set(style.name, style);
      this.composition?.defineStyle(style);
    }
    parseFrames(value) {
      const text = this.toString(value).trim();
      if (!text) return [];
      const frames = text.split(",").map((frame) => frame.trim()).filter(Boolean);
      if (frames.length === 0) throw extensionError("frame asset list is empty.");
      return frames;
    }
    animationInput(frames, secondsValue, label) {
      const seconds = Scratch.Cast.toNumber(secondsValue);
      if (!Number.isFinite(seconds) || seconds <= 0) throw extensionError(`${label} frame interval must be greater than zero.`);
      return Object.freeze({
        frames: Object.freeze(frames),
        frameIntervalSeconds: seconds
      });
    }
    setPortraitAnimation(field, args) {
      const style = this.requireStyle(args.STYLE);
      const portrait = style.portrait;
      if (!portrait?.base) throw extensionError("set the portrait base before portrait animation frames.");
      const frames = this.parseFrames(args.ASSETS);
      const animation = frames.length === 0 ? void 0 : this.animationInput(frames, args.SECONDS, field);
      const nextPortrait = Object.freeze({
        base: portrait.base,
        ...field === "blink" ? {
          ...animation ? { blink: animation } : {},
          ...portrait.talk ? { talk: portrait.talk } : {}
        } : {
          ...portrait.blink ? { blink: portrait.blink } : {},
          ...animation ? { talk: animation } : {}
        }
      });
      this.installStyle(Object.freeze({
        ...style,
        portrait: nextPortrait
      }));
    }
    isTarget(value) {
      return typeof value === "object" && value !== null && typeof value.id === "string";
    }
    requireTarget(util) {
      const target = util?.target;
      if (!this.isTarget(target) || target.isStage) throw extensionError("run this block from a sprite or clone.");
      return target;
    }
    getComposition() {
      if (this.disposed) throw extensionError("extension is disposed.");
      if (!this.composition) {
        this.composition = createTurboWarpBubbleComposition(this.runtime, this.options);
        for (const style of this.styles.values()) this.composition.defineStyle(style);
      }
      return this.composition;
    }
    async show(kind, args, util) {
      const target = this.requireTarget(util);
      const style = this.requireStyle(args.STYLE);
      const composition = this.getComposition();
      let handle;
      try {
        handle = await composition.show({
          actor: target,
          actorKey: target.id,
          kind,
          text: this.toString(args.MESSAGE),
          styleName: style.name
        });
      } catch (error) {
        if (!composition.hasActiveBubble(target.id)) this.handles.delete(target.id);
        throw error;
      }
      if (composition.hasActiveBubble(target.id)) this.handles.set(target.id, handle);
    }
    async releaseOwnedTarget(targetId) {
      this.handles.delete(targetId);
      if (this.composition) await this.composition.releaseTarget(targetId);
    }
  };
  //#endregion
  //#region src/index.ts
  if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  Scratch.extensions.register(new BubbleExtension());
  //#endregion

})(Scratch);
