import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import {
  PortfolioService, Service
} from '../../services/portfolio.service';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit,
  AfterViewInit, OnDestroy {

  services: Service[] = [];
  private ctx?: ReturnType<typeof gsap.context>;

  constructor(
    private ps: PortfolioService,
    private host: ElementRef<HTMLElement>,
    private scrollService: ScrollAnimationService
  ) {}

  ngOnInit(): void {
    this.services = this.ps.getServices();
  }

  ngAfterViewInit(): void {
    if (this.scrollService.prefersReducedMotion) return;

    this.ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '#services',
          start: 'top 72%',
          once: true
        }
      });

      timeline
        .from('.section-badge', {
          y: 14, opacity: 0, duration: 0.5
        })
        .from('.section-title', {
          y: 20, opacity: 0, duration: 0.6
        }, '-=0.35')
        .from('.srv-card', {
          y: 44, opacity: 0, duration: 0.7,
          stagger: 0.08
        }, '-=0.3')
        .from('.srv-icon', {
          scale: 0.8, opacity: 0, duration: 0.45,
          stagger: 0.08
        }, '-=0.5');
    }, this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
