import {
  Component, AfterViewInit, OnDestroy, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements
  AfterViewInit, OnDestroy {

  private ctx?: ReturnType<typeof gsap.context>;

  constructor(
    private host: ElementRef<HTMLElement>,
    private scrollService: ScrollAnimationService
  ) {}

  ngAfterViewInit(): void {
    if (this.scrollService.prefersReducedMotion) return;

    this.ctx = gsap.context(() => {
      gsap.from(
        '.footer-logo, .footer-links, .footer-copy',
        {
          y: 16, opacity: 0, duration: 0.6,
          stagger: 0.08, ease: 'power2.out',
          scrollTrigger: {
            trigger: 'footer',
            start: 'top 96%',
            once: true
          }
        }
      );
    }, this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  scroll(id: string): void {
    this.scrollService.scrollTo(id);
  }
}
