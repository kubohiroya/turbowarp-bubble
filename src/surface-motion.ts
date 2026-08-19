import type { BubbleMotionInput, BubbleScheduler } from "./composition.js";

export function clampMotionProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function easeMotionProgress(
  value: number,
  ease: BubbleMotionInput["ease"],
): number {
  const progress = clampMotionProgress(value);
  switch (ease) {
    case "linear":
      return progress;
    case "easeIn":
      return progress * progress;
    case "easeOut":
      return 1 - (1 - progress) * (1 - progress);
    case "easeInOut":
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    default:
      return progress;
  }
}

/**
 * Drive a motion with Bubble's scheduler so tests and non-browser hosts can
 * provide deterministic time without requestAnimationFrame.
 */
export function runMotionTimeline(
  scheduler: BubbleScheduler,
  durationSeconds: number,
  onFrame: (progress: number) => void,
): Promise<void> {
  const durationMilliseconds = Math.max(0, durationSeconds * 1000);
  if (durationMilliseconds === 0) {
    onFrame(1);
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    let elapsed = 0;
    let timer: unknown;
    const tick = (): void => {
      const step = Math.min(16, durationMilliseconds - elapsed);
      elapsed += step;
      try {
        onFrame(clampMotionProgress(elapsed / durationMilliseconds));
      } catch (error) {
        if (timer !== undefined) scheduler.clearTimeout(timer);
        reject(error);
        return;
      }
      if (elapsed >= durationMilliseconds) {
        resolve();
        return;
      }
      timer = scheduler.setTimeout(
        tick,
        Math.min(16, durationMilliseconds - elapsed),
      );
    };
    timer = scheduler.setTimeout(tick, Math.min(16, durationMilliseconds));
  });
}
