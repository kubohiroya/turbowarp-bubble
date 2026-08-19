import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { Window } from "happy-dom";
import { createTurboWarpBubbleComposition } from "../dist/turbowarp-adapter.js";

const frameBudgetMilliseconds = 1000 / 60;
const typewriterUpdates = 1000;
const lifecycleIterations = 100;

function percentile(values, fraction) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * fraction) - 1),
  );
  return sorted[index];
}

function round(value) {
  return Number(value.toFixed(3));
}

function createImmediateScheduler(frameDurations) {
  let nextHandle = 0;
  const cancelled = new Set();
  return {
    clearTimeout(handle) {
      cancelled.add(handle);
    },
    setTimeout(callback) {
      const handle = ++nextHandle;
      Promise.resolve().then(() => {
        if (cancelled.has(handle)) return;
        const started = performance.now();
        callback();
        frameDurations.push(performance.now() - started);
      });
      return handle;
    },
  };
}

function createHarness() {
  const window = new Window({ url: "https://benchmark.invalid/" });
  const activeDrawables = new Set();
  const activeSkins = new Set();
  const listeners = new Map();
  const stats = {
    createDrawable: 0,
    createSvgSkin: 0,
    destroyDrawable: 0,
    destroySkin: 0,
    redraw: 0,
  };
  let nextDrawable = 0;
  let nextSkin = 0;

  const renderer = {
    addOverlay(element) {
      window.document.body.appendChild(element);
    },
    createDrawable() {
      const drawableId = ++nextDrawable;
      activeDrawables.add(drawableId);
      stats.createDrawable += 1;
      return drawableId;
    },
    createSVGSkin() {
      const skinId = ++nextSkin;
      activeSkins.add(skinId);
      stats.createSvgSkin += 1;
      return skinId;
    },
    destroyDrawable(drawableId) {
      activeDrawables.delete(drawableId);
      stats.destroyDrawable += 1;
    },
    destroySkin(skinId) {
      activeSkins.delete(skinId);
      stats.destroySkin += 1;
    },
    getCurrentSkinSize() {
      return [180, 48];
    },
    getNativeSize() {
      return [480, 360];
    },
    off(event, listener) {
      listeners.get(event)?.delete(listener);
    },
    on(event, listener) {
      const eventListeners = listeners.get(event) ?? new Set();
      eventListeners.add(listener);
      listeners.set(event, eventListeners);
    },
    removeOverlay(element) {
      element.remove();
    },
    setDrawableOrder() {},
    updateDrawableEffect() {},
    updateDrawablePosition() {},
    updateDrawableScale() {},
    updateDrawableSkinId() {},
    updateDrawableVisible() {},
  };
  const runtime = {
    renderer,
    requestRedraw() {
      stats.redraw += 1;
    },
  };

  return {
    activeDrawables,
    activeSkins,
    listenerCount() {
      return [...listeners.values()].reduce(
        (count, eventListeners) => count + eventListeners.size,
        0,
      );
    },
    renderer,
    runtime,
    stats,
    window,
  };
}

function createOverlayTextCapability() {
  return {
    layoutText({ text }) {
      const lines = String(text).split("\n");
      return {
        alignment: "left",
        fill: "#25283a",
        fontFamily: "Noto Sans JP, sans-serif",
        fontSize: 16,
        height: Math.max(24, lines.length * 22),
        lineHeight: 22,
        lines,
        width: Math.max(20, ...lines.map((line) => line.length * 9)),
      };
    },
    measureText({ text }) {
      return Math.max(1, String(text).length * 9);
    },
  };
}

function createScratchTextCapability(renderer) {
  const targetSkins = new WeakMap();
  return {
    measureText({ text }) {
      return Math.max(1, String(text).length * 9);
    },
    releaseTarget(target) {
      const skinId = targetSkins.get(target);
      if (skinId === undefined) return;
      targetSkins.delete(target);
      renderer.destroySkin(skinId);
    },
    setText({ target, text }) {
      const previousSkinId = targetSkins.get(target);
      if (previousSkinId !== undefined) renderer.destroySkin(previousSkinId);
      const skinId = renderer.createSVGSkin(
        `<svg xmlns="http://www.w3.org/2000/svg"><text>${String(text)}</text></svg>`,
      );
      targetSkins.set(target, skinId);
      if (typeof target.drawableID === "number") {
        renderer.updateDrawableSkinId(target.drawableID, skinId);
      }
    },
  };
}

function createActor() {
  return {
    getBoundsForBubble() {
      return { bottom: -20, left: -20, right: 20, top: 20 };
    },
    id: "benchmark-sprite",
    isStage: false,
    onTargetVisualChange: null,
    visible: true,
    x: 0,
    y: 0,
  };
}

function createBenchmarkComposition(backend) {
  const harness = createHarness();
  const frameDurations = [];
  const scheduler = createImmediateScheduler(frameDurations);
  const composition = createTurboWarpBubbleComposition(harness.runtime, {
    bubbleRenderBackend: backend,
    document: harness.window.document,
    scheduler,
    ...(backend === "svg-overlay"
      ? { svgOverlayTextCapability: createOverlayTextCapability() }
      : { textCapability: createScratchTextCapability(harness.renderer) }),
  });
  composition.defineStyle({
    name: "benchmark",
    textStyle: "benchmark-text",
  });
  return { composition, frameDurations, harness };
}

async function showBenchmarkBubble(composition, suffix = "") {
  return composition.show({
    actor: createActor(),
    actorKey: `benchmark-sprite${suffix}`,
    kind: "say",
    styleName: "benchmark",
    text: "Benchmark",
  });
}

function residuals(harness) {
  return {
    activeDrawables: harness.activeDrawables.size,
    activeSkins: harness.activeSkins.size,
    listenerCount: harness.listenerCount(),
    overlayRoots: harness.window.document.querySelectorAll(
      '[data-bubble-render-backend="svg-overlay"]',
    ).length,
  };
}

function assertReleased(result) {
  assert.deepEqual(result, {
    activeDrawables: 0,
    activeSkins: 0,
    listenerCount: 0,
    overlayRoots: 0,
  });
}

async function benchmarkTypewriter(backend) {
  const { composition, harness } = createBenchmarkComposition(backend);
  const handle = await showBenchmarkBubble(composition);
  const started = performance.now();
  for (let index = 0; index < typewriterUpdates; index += 1) {
    await handle.setText(`Update ${index}`);
  }
  const elapsed = performance.now() - started;
  await handle.close();
  await composition.dispose();
  const remaining = residuals(harness);
  assertReleased(remaining);
  harness.window.close();
  return {
    elapsedMs: round(elapsed),
    perUpdateMs: round(elapsed / typewriterUpdates),
    rendererCalls: harness.stats,
    residuals: remaining,
    updates: typewriterUpdates,
  };
}

async function benchmarkAnimations(backend) {
  const { composition, frameDurations, harness } =
    createBenchmarkComposition(backend);
  const handle = await showBenchmarkBubble(composition);
  const started = performance.now();
  await handle.animate({
    durationSeconds: 10,
    name: "animateBubbleShape",
    visualStyle: "WAVY",
  });
  await handle.animate({ count: 20, durationSeconds: 10, name: "shake" });
  await handle.animate({ durationSeconds: 10, name: "zoomIn" });
  const elapsed = performance.now() - started;
  await handle.close();
  await composition.dispose();
  const remaining = residuals(harness);
  assertReleased(remaining);
  harness.window.close();
  const callbacksOverBudget = frameDurations.filter(
    (duration) => duration > frameBudgetMilliseconds,
  ).length;
  return {
    cpuElapsedMs: round(elapsed),
    callbackBudgetOverrunRatePercent: round(
      frameDurations.length === 0
        ? 0
        : (callbacksOverBudget / frameDurations.length) * 100,
    ),
    frameCount: frameDurations.length,
    frameDurationP95Ms: round(percentile(frameDurations, 0.95)),
    frameDurationP99Ms: round(percentile(frameDurations, 0.99)),
    rendererCalls: harness.stats,
    residuals: remaining,
    simulatedDurationSeconds: 30,
  };
}

async function benchmarkLifecycle(backend) {
  globalThis.gc?.();
  const heapBefore = process.memoryUsage().heapUsed;
  const { composition, harness } = createBenchmarkComposition(backend);
  const started = performance.now();
  for (let index = 0; index < lifecycleIterations; index += 1) {
    const handle = await showBenchmarkBubble(composition, `-${index}`);
    await handle.setText(`Lifecycle ${index}`);
    await handle.updateStyle({
      name: "benchmark",
      textStyle: "benchmark-text",
      visualStyle: index % 2 === 0 ? "THINKING" : "NORMAL",
    });
    await handle.close();
  }
  await composition.dispose();
  const elapsed = performance.now() - started;
  globalThis.gc?.();
  const heapAfter = process.memoryUsage().heapUsed;
  const remaining = residuals(harness);
  assertReleased(remaining);
  harness.window.close();
  return {
    elapsedMs: round(elapsed),
    heapDeltaBytes: heapAfter - heapBefore,
    iterations: lifecycleIterations,
    rendererCalls: harness.stats,
    residuals: remaining,
  };
}

const results = {
  environment: {
    architecture: process.arch,
    node: process.version,
    platform: process.platform,
  },
  methodology: {
    animation:
      "Deterministic scheduler; shape, shake, and zoom each simulate 10 seconds at 16 ms ticks.",
    lifecycle: "Sequential show, text/style replace, and close cycles.",
    typewriter: "Sequential setText calls on one visible Bubble.",
  },
  results: {},
};

for (const backend of ["svg-overlay", "scratch-render"]) {
  results.results[backend] = {
    animations: await benchmarkAnimations(backend),
    lifecycle: await benchmarkLifecycle(backend),
    typewriter: await benchmarkTypewriter(backend),
  };
}

const overlayOverrun =
  results.results["svg-overlay"].animations.callbackBudgetOverrunRatePercent;
const scratchOverrun =
  results.results["scratch-render"].animations.callbackBudgetOverrunRatePercent;
results.acceptance = {
  callbackBudgetOverrunDifferencePercentagePoints: round(
    overlayOverrun - scratchOverrun,
  ),
  lifecycleResidualsZero: true,
  overlayWithinFivePercentagePoints: overlayOverrun - scratchOverrun <= 5,
};

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
