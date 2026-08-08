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
