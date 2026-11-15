'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import { Component, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import posterDesktop from '@/assets/images/hero-poster.jpg';
import posterMobile from '@/assets/images/hero-poster-mobile.jpg';
import ShinyText from '@/components/react-bits/ShinyText';
import { ButtonLink } from '@/components/ui/Button';
import { hero, story } from '@/content/home';
import { site } from '@/content/site';
import { motion, storyMedia } from '@/lib/motion';
import { useMediaQuery, useReducedMotion } from '@/lib/motion-preference';
import { storyStore } from '@/lib/story-store';
import StorySequence from './StorySequence';

gsap.registerPlugin(ScrollTrigger, useGSAP);
// The stage is sized in svh units, which do not change when a phone's address bar slides away.
ScrollTrigger.config({ ignoreMobileResize: true });

// The 3D bundle (three.js + the scene) is loaded only in the browser, after the text and poster are on screen.
const BuildingCanvas = dynamic(() => import('./scene/BuildingCanvas'), { ssr: false });

/** The hero entrance plays once per page load: coming back to the home page does not replay it. */
let introPlayed = false;

/**
 * What draws the story on the stage:
 *  - `webgl`: the live 3D scene;
 *  - `frames`: the same story as an image sequence, when the 3D scene cannot run or is too slow;
 *  - `none`: nothing yet (or the visitor asked to save data): the poster stays.
 */
type Renderer = 'none' | 'webgl' | 'frames';

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Asks the browser what it can do before anything is downloaded.
 * `gpu`: hardware WebGL 2. `software`: WebGL 2 on the CPU only (allowed, but started at the lightest quality
 * and judged by measured frame time). `none`: no WebGL 2, the image sequence is used instead.
 */
function detectWebgl(): 'gpu' | 'software' | 'none' {
  const attempt = (failIfMajorPerformanceCaveat: boolean) => {
    try {
      const context = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat });
      if (!context) return false;
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch {
      return false;
    }
  };
  if (attempt(true)) return 'gpu';
  return attempt(false) ? 'software' : 'none';
}

const captions = story.stages.filter(stage => stage.caption);
const STORY_QUERY = `${storyMedia.desktop}, ${storyMedia.compact}`;

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  const reduced = useReducedMotion();
  const roomForStory = useMediaQuery(STORY_QUERY);
  const storyOn = !reduced && roomForStory;

  const desktopStage = useMediaQuery(storyMedia.desktop);
  const [renderer, setRenderer] = useState<Renderer>('none');
  const [ready, setReady] = useState(false);
  const [scene, setScene] = useState<{ force: boolean; software: boolean; maxDpr?: number }>({ force: false, software: false });
  const [introDone] = useState(() => introPlayed);
  const live = useRef({ sceneReady: false });

  useEffect(() => {
    introPlayed = true;
  }, []);

  // Cross-fade between the poster and the canvas. Until the scene is ready the poster simply stays.
  const paintStage = useCallback((progress: number) => {
    const reveal = live.current.sceneReady ? smoothstep(0.005, 0.085, progress) : 0;
    if (posterRef.current) posterRef.current.style.opacity = String(1 - reveal);
    if (canvasRef.current) canvasRef.current.style.opacity = String(reveal);
  }, []);

  useEffect(() => {
    live.current.sceneReady = storyOn && ready;
    paintStage(storyStore.progress);
  }, [ready, storyOn, paintStage]);

  /** The 3D scene could not start, was lost, or is too slow: hand the story over to the image sequence. */
  const switchToFrames = useCallback(() => {
    setReady(false);
    setRenderer('frames');
  }, []);

  // Decide how to draw the story once the browser is idle: never before the hero text and poster, never with
  // reduced motion, and not at all when the visitor asked to save data.
  // Testing aids: ?3d=force holds the best 3D quality, ?3d=frames shows the image sequence.
  useEffect(() => {
    if (!storyOn) {
      const reset = window.setTimeout(() => setReady(false), 0);
      return () => window.clearTimeout(reset);
    }
    const query = new URLSearchParams(window.location.search);
    const flag = query.get('3d');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData && !flag) return undefined;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      if (flag === 'force') {
        // Lets the capture script set the progress directly.
        (window as Window & { __sarhStory?: typeof storyStore }).__sarhStory = storyStore;
      }
      const support = flag === 'frames' ? 'none' : detectWebgl();
      const maxDpr = flag === 'force' ? Number(query.get('dpr')) || undefined : undefined;
      setScene({ force: flag === 'force', software: support === 'software', maxDpr });
      setRenderer(current => (current === 'none' ? (support === 'none' ? 'frames' : 'webgl') : current));
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const timer = setTimeout(start, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [storyOn]);

  // One eased progress value (0 → 1) for the pinned section drives the scene, the captions and the indicator.
  useGSAP(
    () => {
      if (reduced) {
        storyStore.set(1);
        return undefined;
      }

      const media = gsap.matchMedia();
      media.add(storyMedia, context => {
        const desktop = Boolean(context.conditions?.desktop);
        const track = trackRef.current;
        if (!track || (!desktop && !context.conditions?.compact)) return undefined;

        const state = { progress: 0 };
        const stages = gsap.utils.toArray<HTMLElement>('[data-stage]', rootRef.current);
        const markStage = (progress: number) => {
          let active = 0;
          story.stages.forEach((stage, index) => {
            if (progress >= stage.from) active = index;
          });
          stages.forEach((element, index) => {
            const value = index === active ? 'true' : 'false';
            if (element.dataset.active !== value) element.dataset.active = value;
          });
        };
        let alive = true;
        const apply = () => {
          if (!alive) return;
          storyStore.set(state.progress);
          paintStage(state.progress);
          markStage(state.progress);
        };

        const headerHeight = () =>
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: apply,
          scrollTrigger: {
            trigger: track,
            // The stage is pinned by CSS (position: sticky). ScrollTrigger only measures the progress.
            start: () => (desktop ? 'top top' : `top ${headerHeight()}px`),
            end: 'bottom bottom',
            scrub: motion.storyScrub,
            invalidateOnRefresh: true,
            // After a refresh (page reloaded mid-story, window resized, breakpoint crossed) GSAP places the
            // timeline at the current scroll position without firing onUpdate, so sync the scene explicitly.
            onRefresh: () => {
              apply();
              gsap.delayedCall(0, apply);
            }
          }
        });

        timeline.to(state, { progress: 1, duration: 1 }, 0);
        timeline.fromTo(fillRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
        if (desktop && hintRef.current) timeline.to(hintRef.current, { autoAlpha: 0, duration: 0.04 }, 0.02);

        if (desktop) {
          // The headline gives way to the story captions in the same column.
          timeline.to(copyRef.current, { autoAlpha: 0, y: -28, duration: 0.07 }, 0.12);
          timeline.fromTo(panelRef.current, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.17);
        } else {
          gsap.set(panelRef.current, { autoAlpha: 1, y: 0 });
        }

        gsap.utils.toArray<HTMLElement>('[data-caption]', rootRef.current).forEach((element, index) => {
          const stage = captions[index];
          const last = index === captions.length - 1;
          timeline.fromTo(element, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.05 }, stage.from + 0.015);
          if (!last) timeline.to(element, { autoAlpha: 0, y: -26, duration: 0.04 }, stage.to - 0.035);
        });

        apply();
        return () => {
          alive = false;
          storyStore.set(0);
        };
      });

      return () => media.revert();
    },
    { dependencies: [reduced, paintStage], scope: rootRef, revertOnUpdate: true }
  );

  // Art-directed poster: the wide render on desktop, a tighter crop on phones. Both go through next/image.
  const common = { sizes: '100vw', quality: 85, loading: 'eager', fetchPriority: 'high' } as const;
  const {
    props: { srcSet: desktopSrcSet }
  } = getImageProps({ ...common, alt: '', src: posterDesktop });
  const {
    props: { srcSet: mobileSrcSet, ...posterProps }
  } = getImageProps({ ...common, alt: hero.posterAlt, src: posterMobile });

  const delay = (index: number) => ({ '--i': index }) as CSSProperties;

  return (
    <section ref={rootRef} className="story" aria-labelledby="hero-title" data-intro={introDone ? 'done' : undefined}>
      <div className="story__hero">
        <div className="story__copy">
          <div className="shell">
            <div ref={copyRef} className="lg:w-[41%]">
              <p className="eyebrow hero-in" style={delay(0)}>
                {hero.eyebrow}
              </p>
              <h1 id="hero-title" className="display-title mt-4 lg:mt-5">
                <span className="hero-in block" style={delay(1)}>
                  {hero.titleLines[0]}
                </span>
                <span className="hero-in block" style={delay(2)}>
                  ولاستثمارك{' '}
                  {/* React Bits ShinyText: one brass sheen across the name. The word is never split. */}
                  <ShinyText text={site.name} color="#75603a" shineColor="#d6c29a" trigger="view" speed={2.4} shineWidth={50} />.
                </span>
              </h1>
              <p className="lead hero-in mt-5 lg:mt-6" style={delay(3)}>
                {hero.text}
              </p>
              {/* The layout of the two buttons depends on the screen width only, never on how wide the text
                  happens to be, so the page does not jump when the web font replaces the fallback font. */}
              <div className="hero-in mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:flex sm:flex-wrap lg:mt-8" style={delay(4)}>
                <ButtonLink href={hero.primary.href} className="px-4 sm:px-6">
                  {hero.primary.label}
                </ButtonLink>
                <ButtonLink href={hero.secondary.href} variant="outline" className="px-4 sm:px-6">
                  {hero.secondary.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        <div ref={trackRef} className="story__track">
          <div className="story__sticky">
            <div className="story__stage">
              <div ref={posterRef} className="story__poster hero-poster-in">
                <picture>
                  <source
                    media="(min-width: 1024px)"
                    srcSet={desktopSrcSet}
                    sizes={common.sizes}
                    width={posterDesktop.width}
                    height={posterDesktop.height}
                  />
                  {/* Art-directed <picture>: every attribute below comes from next/image (getImageProps). */}
                  <img {...posterProps} alt={hero.posterAlt} srcSet={mobileSrcSet} />
                </picture>
              </div>
              <div ref={canvasRef} className="story__canvas" style={{ opacity: 0 }} aria-hidden="true">
                {storyOn && renderer === 'webgl' ? (
                  <SceneBoundary onError={switchToFrames}>
                    <BuildingCanvas {...scene} onReady={() => setReady(true)} onFail={switchToFrames} />
                  </SceneBoundary>
                ) : null}
                {storyOn && renderer === 'frames' ? (
                  <StorySequence variant={desktopStage ? 'desktop' : 'compact'} onReady={() => setReady(true)} />
                ) : null}
              </div>
            </div>

            <div className="story__captions">
              <div className="shell pb-4 pt-1 lg:py-0">
                <div ref={panelRef} className="invisible opacity-0 lg:w-[41%]">
                  <p className="eyebrow">{story.label}</p>
                  <div className="mt-2 grid min-h-[2.6em] items-start text-[clamp(1.5rem,6.2vw,2.25rem)] lg:mt-5 lg:text-[clamp(2.25rem,3.6vw,3.5rem)]">
                    {captions.map(stage => (
                      <p
                        key={stage.id}
                        data-caption
                        className="invisible font-semibold leading-[1.3] text-forest opacity-0 [grid-area:1/1]"
                      >
                        {stage.caption}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 max-w-md lg:mt-8">
                    <span className="relative block h-px bg-line">
                      <span ref={fillRef} className="absolute inset-0 origin-right scale-x-0 bg-brass-deep" />
                    </span>
                    <ol className="mt-2.5 flex justify-between gap-2 text-[0.8125rem] font-medium lg:mt-3 lg:text-[0.9375rem]">
                      {story.stages.map((stage, index) => (
                        <li
                          key={stage.id}
                          data-stage
                          data-active={index === 0 ? 'true' : 'false'}
                          className="text-ink-soft decoration-brass decoration-2 underline-offset-[6px] transition-colors duration-300 data-[active=true]:text-forest data-[active=true]:underline"
                        >
                          {stage.name}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <Link
                    href="#services"
                    className="mt-1 inline-flex min-h-11 items-center text-[0.9375rem] text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-forest hover:decoration-brass lg:mt-5"
                  >
                    تخطَّ إلى الخدمات
                  </Link>
                </div>
              </div>
            </div>

            <p
              ref={hintRef}
              className="story__hint pointer-events-none absolute inset-x-0 bottom-6 z-[1] items-center justify-center gap-3 text-[0.875rem] text-ink-soft"
            >
              <span aria-hidden="true" className="h-8 w-px bg-brass" />
              {hero.scrollHint}
            </p>
          </div>
        </div>
      </div>

      {/* The same story as plain text, for reduced motion, short screens and browsers without JavaScript. */}
      <div className="story__static border-y border-line">
        <div className="shell py-8 lg:py-10">
          <p className="eyebrow">{story.label}</p>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3 sm:gap-8">
            {story.staticSteps.map((step, index) => (
              <li key={step.name} className="border-s border-line ps-5">
                <span className="ltr text-sm font-medium text-brass-deep">{String(index + 1).padStart(2, '0')}</span>
                <p className="mt-1 text-[0.9375rem] text-ink-soft">{step.name}</p>
                <p className="text-xl font-semibold leading-snug text-forest">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
