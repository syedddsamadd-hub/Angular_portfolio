import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { PortfolioService } from '../../services/portfolio.service';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit,
  AfterViewInit, OnDestroy {

  profile: any;
  private ctx?: ReturnType<typeof gsap.context>;

  constructor(
    private portfolioService: PortfolioService,
    private host: ElementRef<HTMLElement>,
    private scrollService: ScrollAnimationService
  ) {}

  ngOnInit(): void {
    this.profile = this.portfolioService.getProfile();
  }

  ngAfterViewInit(): void {
    if (this.scrollService.prefersReducedMotion) return;

    this.ctx = gsap.context(() => {
      // Image enters through a vertical mask.
      gsap.from('.about-img-wrap', {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: '#about',
          start: 'top 75%',
          once: true
        }
      });

      // Content reveals sequentially.
      gsap.from('.about-content > *', {
        y: 22,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#about',
          start: 'top 70%',
          once: true
        }
      });

      // Subtle parallax inside the masked image frame.
      gsap.utils
        .toArray<HTMLElement>('.about-img, .img-placeholder')
        .forEach(el => {
          gsap.to(el, {
            yPercent: -7,
            scale: 1.06,
            ease: 'none',
            scrollTrigger: {
              trigger: '.about-img-wrap',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        });
    }, this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }
}
