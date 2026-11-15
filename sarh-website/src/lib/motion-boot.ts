/**
 * Inline boot script, placed in <head> by app/layout.tsx so it runs before the first paint.
 *
 * It resolves the motion preference (the visitor's saved choice, else the operating-system setting) and
 * writes it to <html data-motion data-story>. The pinned scroll story is laid out by CSS from these
 * attributes, so nothing shifts after load. Without JavaScript the attributes are absent and the page
 * falls back to the static layout.
 */
export const MOTION_STORAGE_KEY = 'sarh-motion';

export const motionBootScript = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('${MOTION_STORAGE_KEY}');var r=s==='reduced'||(s!=='full'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);d.dataset.motion=r?'reduced':'full';d.dataset.story=r?'off':'on';}catch(e){d.dataset.motion='full';d.dataset.story='on';}})();`;
