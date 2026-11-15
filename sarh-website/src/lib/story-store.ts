/**
 * The single source of truth for the scroll story.
 *
 * GSAP writes one eased progress value (0 → 1) here; the 3D scene, the captions and the stage indicator all
 * read it. Nothing else animates the camera or the model, so effects can never fight each other, and
 * scrolling back simply plays everything in reverse.
 */
export const storyStore = {
  /** Eased progress of the pinned section, 0 → 1. */
  progress: 0,
  /** Set by the 3D scene while it is mounted. Requests one new frame (the canvas renders on demand). */
  invalidate: null as null | (() => void),
  set(progress: number) {
    if (progress === this.progress) return;
    this.progress = progress;
    this.invalidate?.();
  }
};
