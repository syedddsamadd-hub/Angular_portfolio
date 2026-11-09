import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  isScrolled = false;
  isMenuOpen = false;
  activeSection = 'hero';

  navLinks = [
    { label: 'Home',     href: '#hero' },
    { label: 'About',    href: '#about' },
    { label: 'Skills',   href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Services', href: '#services' },
    { label: 'Contact',  href: '#contact' },
  ];

  constructor(
    private scrollService: ScrollAnimationService
  ) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 60;
    this.updateActiveSection();
  }

  updateActiveSection(): void {
    const sections = ['hero','about','skills',
      'projects','services','contact'];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          this.activeSection = id;
          break;
        }
      }
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.scrollService.stop();
    } else {
      this.scrollService.start();
    }
  }

  closeMenu(): void {
    if (!this.isMenuOpen) return;
    this.isMenuOpen = false;
    this.scrollService.start();
  }

  scrollTo(event: Event, href: string): void {
    event.preventDefault();
    this.closeMenu();
    this.scrollService.scrollTo(href.replace('#', ''));
  }

  isActive(href: string): boolean {
    return this.activeSection === href.replace('#', '');
  }
}
