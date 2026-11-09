import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import {
  PortfolioService, Project
} from '../../services/portfolio.service';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit,
  AfterViewInit, OnDestroy {

  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  categories: string[] = [];
  activeCategory = 'all';

  private ctx?: ReturnType<typeof gsap.context>;
  private media?: ReturnType<typeof gsap.matchMedia>;
  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private ps: PortfolioService,
    private host: ElementRef<HTMLElement>,
    private scrollService: ScrollAnimationService
  ) {}

  ngOnInit(): void {
    this.allProjects = this.ps.getProjects();
    this.categories = [
      'all',
      ...new Set(this.allProjects.map(p => p.cat))
    ];
    this.filterProjects('all');
  }

  ngAfterViewInit(): void {
    if (this.scrollService.prefersReducedMotion) return;

    this.ctx = gsap.context(() => {
      gsap.from(
        '.projects-head .section-badge, ' +
        '.projects-head .section-title, ' +
        '.projects-head .section-desc, ' +
        '.proj-filters button',
        {
          y: 18, opacity: 0, duration: 0.6,
          stagger: 0.05, ease: 'power2.out',
          scrollTrigger: {
            trigger: '#projects',
            start: 'top 80%',
            once: true
          }
        }
      );

      // Pinned horizontal storytelling only on desktop.
      this.media = gsap.matchMedia();
      this.media.add('(min-width: 1024px)', () => {
        const section = this.host.nativeElement
          .querySelector('#projects') as HTMLElement | null;
        const viewport = section?.querySelector(
          '.projects-viewport'
        ) as HTMLElement | null;
        const track = section?.querySelector(
          '.projects-track'
        ) as HTMLElement | null;
        if (!section || !viewport || !track) return;

        const distance = (): number => Math.max(
          0, track.scrollWidth - viewport.clientWidth
        );

        const horizontal = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: () => this.updateActiveCard(
              viewport, track
            )
          }
        });

        // Images drift slightly while their card travels.
        gsap.utils
          .toArray<HTMLElement>('.proj-img-wrap img', section)
          .forEach(img => {
            const card = img.closest('.proj-card');
            if (!card) return;
            gsap.fromTo(img,
              { xPercent: -5, scale: 1.12 },
              {
                xPercent: 5,
                ease: 'none',
                scrollTrigger: {
                  trigger: card as HTMLElement,
                  containerAnimation: horizontal,
                  start: 'left right',
                  end: 'right left',
                  scrub: true
                }
              });
          });

        this.updateActiveCard(viewport, track);
      });
    }, this.host.nativeElement);
  }

  filterProjects(cat: string): void {
    this.activeCategory = cat;
    this.filteredProjects = cat === 'all'
      ? this.allProjects
      : this.allProjects.filter(p => p.cat === cat);

    // The track width changed, so trigger positions must be
    // recalculated after the new cards render.
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.scrollService.refresh();
      const section = this.host.nativeElement
        .querySelector('#projects');
      const viewport = section?.querySelector(
        '.projects-viewport'
      ) as HTMLElement | null;
      const track = section?.querySelector(
        '.projects-track'
      ) as HTMLElement | null;
      if (viewport && track) {
        this.updateActiveCard(viewport, track);
      }
    }, 0);
  }

  /** Gives the card closest to the viewport center a subtle lift. */
  private updateActiveCard(
    viewport: HTMLElement,
    track: HTMLElement
  ): void {
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>('.proj-card')
    );
    if (!cards.length) return;

    const bounds = viewport.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    let active = cards[0];
    let min = Infinity;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(
        rect.left + rect.width / 2 - center
      );
      if (distance < min) {
        min = distance;
        active = card;
      }
    });

    cards.forEach(card => {
      card.classList.toggle('is-active', card === active);
    });
  }

  ngOnDestroy(): void {
    this.media?.revert();
    this.ctx?.revert();
    clearTimeout(this.refreshTimer);
  }

  /** Responsive WebP candidates for the project screenshot. */
  srcset(proj: Project): string | null {
    return proj.imgSmall
      ? `${proj.imgSmall} 480w, ${proj.img} 960w`
      : null;
  }

  // 3D Tilt Effect
  onMouseMove(event: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform =
      `perspective(800px)
       rotateY(${x * 12}deg)
       rotateX(${-y * 12}deg)
       translateY(-6px)`;
  }

  onMouseLeave(card: HTMLElement): void {
    card.style.transform = '';
  }

  openLink(url: string): void {
    if (url && url !== '#') window.open(url, '_blank');
  }
}
