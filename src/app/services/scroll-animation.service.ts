import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/** Fixed navbar height used when scrolling to a section. */
const NAV_OFFSET = -72;

@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {

  private lenis?: Lenis;
  private ticker?: (time: number) => void;
  private started = false;
  private readonly refreshOnLoad =
    () => ScrollTrigger.refresh();

  get prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
  }

  /**
   * Boots Lenis once and keeps ScrollTrigger in sync with it.
   * Skipped entirely for users who prefer reduced motion.
   */
  init(): void {
    if (this.started || typeof window === 'undefined') {
      return;
    }
    this.started = true;

    ScrollTrigger.config({ ignoreMobileResize: true });
    window.addEventListener('load', this.refreshOnLoad);

    if (this.prefersReducedMotion) return;

    this.lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.1
    });

    // Lenis drives the real scroll position; ScrollTrigger follows it.
    this.lenis.on('scroll', () => ScrollTrigger.update());

    this.ticker = (time: number) => {
      this.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(this.ticker);
    gsap.ticker.lagSmoothing(0);
  }

  /** Smoothly scrolls to a section id, element or absolute position. */
  scrollTo(
    target: string | HTMLElement | number,
    offset = NAV_OFFSET
  ): void {
    if (typeof window === 'undefined') return;

    let value: HTMLElement | number;
    if (typeof target === 'string') {
      const el = document.getElementById(target);
      if (!el) return;
      value = el;
    } else {
      value = target;
    }

    if (this.lenis) {
      this.lenis.scrollTo(value, { offset, duration: 1.1 });
      return;
    }

    const top = typeof value === 'number'
      ? value
      : value.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.max(0, top + offset),
      behavior: this.prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  /** Pauses smooth scrolling (used while the mobile menu is open). */
  stop(): void { this.lenis?.stop(); }

  /** Resumes smooth scrolling. */
  start(): void { this.lenis?.start(); }

  /** Recalculates every trigger after layout-changing updates. */
  refresh(): void {
    if (typeof window === 'undefined') return;
    ScrollTrigger.refresh();
  }

  /** Releases Lenis, ticker and every ScrollTrigger. */
  destroy(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('load', this.refreshOnLoad);
    if (this.ticker) gsap.ticker.remove(this.ticker);
    this.ticker = undefined;

    this.lenis?.destroy();
    this.lenis = undefined;

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    this.started = false;
  }
}
