import {
  AfterViewInit, Component, OnDestroy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ServicesComponent } from './components/services/services.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import {
  ScrollAnimationService
} from './services/scroll-animation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ProjectsComponent,
    ServicesComponent,
    ContactComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,
  AfterViewInit, OnDestroy {

  private readonly onWindowScroll = (): void => {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight
                - window.innerHeight;
    const pct = total > 0
      ? Math.min(100, (scrolled / total) * 100)
      : 0;
    const bar = document.getElementById('scroll-progress');
    if (bar) bar.style.width = pct + '%';

    const btn = document.getElementById('back-top');
    if (btn) btn.classList.toggle('show', scrolled > 400);
  };

  private readonly onBackTop = (): void => {
    this.scrollService.scrollTo(0, 0);
  };

  constructor(private scrollService: ScrollAnimationService) {}

  ngOnInit(): void {
    window.addEventListener('scroll', this.onWindowScroll);
    document.getElementById('back-top')
      ?.addEventListener('click', this.onBackTop);
    this.onWindowScroll();
  }

  ngAfterViewInit(): void {
    // Lenis + ScrollTrigger need the rendered layout.
    this.scrollService.init();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
    document.getElementById('back-top')
      ?.removeEventListener('click', this.onBackTop);
    this.scrollService.destroy();
  }
}
