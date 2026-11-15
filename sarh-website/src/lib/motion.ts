/**
 * Motion tokens. Every duration, distance and stagger used on the site lives here so the motion language
 * stays consistent and can be tuned in one place.
 */
export const motion = {
  /** Regular reveals: opacity + transform, 400–700ms, 16–32px. */
  duration: 0.6,
  distance: 24,
  ease: 'power3.out',
  /** Sequential reveal of sibling items (80–100ms). */
  stagger: 0.09,
  /** Mask reveal of large images. */
  wipeDuration: 0.9,
  /** Tabs content swap (200–300ms). */
  tabs: 0.25,
  /** Scroll story: how far the eased progress lags behind the scrollbar, in seconds. */
  storyScrub: 0.7,
  /** Share of the viewport that must be crossed before a reveal starts. */
  threshold: 0.12
} as const;

/**
 * Where the pinned scroll story runs. These strings mirror the media queries in app/globals.css
 * ("Story layout"). Keep them in sync: CSS lays the section out, JavaScript measures it.
 */
export const storyMedia = {
  desktop: '(min-width: 1024px) and (min-height: 640px)',
  compact: '(max-width: 1023.98px) and (orientation: portrait), (max-width: 1023.98px) and (min-height: 540.02px)'
} as const;
