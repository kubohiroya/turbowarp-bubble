import type { BubbleMotionInput, BubbleScheduler } from "./composition.js";
export declare function clampMotionProgress(value: number): number;
export declare function easeMotionProgress(value: number, ease: BubbleMotionInput["ease"]): number;
/**
 * Drive a motion with Bubble's scheduler so tests and non-browser hosts can
 * provide deterministic time without requestAnimationFrame.
 */
export declare function runMotionTimeline(scheduler: BubbleScheduler, durationSeconds: number, onFrame: (progress: number) => void): Promise<void>;
