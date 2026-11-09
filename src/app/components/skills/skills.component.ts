import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ChangeDetectorRef, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

export type SkillLevel =
  'Expert' | 'Advanced' | 'Intermediate';

export interface Skill {
  name: string;
  cat: string;
  icon: string;
  level: SkillLevel;
}

export interface SkillColumn {
  cat: string;
  items: Skill[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit,
  AfterViewInit, OnDestroy {

  skills: Skill[] = [
    { name:'HTML5 / CSS3',  cat:'Frontend', icon:'fab fa-html5',      level:'Expert' },
    { name:'JavaScript',    cat:'Frontend', icon:'fab fa-js-square',   level:'Advanced' },
    { name:'Bootstrap 5',   cat:'Frontend', icon:'fab fa-bootstrap',   level:'Expert' },
    { name:'React.js',      cat:'Frontend', icon:'fab fa-react',       level:'Intermediate' },
    { name:'PHP 8',         cat:'Backend',  icon:'fab fa-php',         level:'Expert' },
    { name:'MySQL',         cat:'Backend',  icon:'fas fa-database',    level:'Advanced' },
    { name:'Node.js',       cat:'Backend',  icon:'fab fa-node-js',     level:'Intermediate' },
    { name:'REST API',      cat:'Backend',  icon:'fas fa-code',        level:'Advanced' },
    { name:'Git & GitHub',  cat:'Tools',    icon:'fab fa-git-alt',     level:'Expert' },
    { name:'Figma',         cat:'Tools',    icon:'fab fa-figma',       level:'Intermediate' },
    { name:'VS Code',       cat:'Tools',    icon:'fas fa-code',        level:'Expert' },
    { name:'XAMPP',         cat:'Tools',    icon:'fas fa-server',      level:'Expert' },
  ];

  categories = ['all', 'Frontend', 'Backend', 'Tools'];
  activeCategory = 'all';
  columns: SkillColumn[] = [];

  /** Grid fades out while the filter swaps the visible columns. */
  isFiltering = false;

  private fadeTimer?: ReturnType<typeof setTimeout>;
  private ctx?: ReturnType<typeof gsap.context>;

  constructor(
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>,
    private scrollService: ScrollAnimationService
  ) {}

  ngOnInit(): void {
    this.columns = this.buildColumns();
  }

  ngAfterViewInit(): void {
    if (this.scrollService.prefersReducedMotion) return;

    this.ctx = gsap.context(() => {
      const entrance = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 72%',
          once: true
        }
      });

      entrance
        .from('.skills-col-wrap', {
          y: 40, opacity: 0, duration: 0.8,
          stagger: 0.12
        })
        .from('.skill-item', {
          y: 12, opacity: 0, duration: 0.4,
          stagger: 0.03
        }, '-=0.55')
        .from('.skill-icon', {
          scale: 0.7, opacity: 0, duration: 0.35,
          stagger: 0.03
        }, '-=0.45');
    }, this.host.nativeElement);
  }

  filterSkills(cat: string): void {
    if (cat === this.activeCategory || this.isFiltering) return;

    this.activeCategory = cat;
    this.isFiltering = true;          // phase 1 — fade out
    this.cdr.markForCheck();

    clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => {
      // Swap the columns while the grid is hidden, then let the
      // CSS opacity transition fade the new cards back in.
      this.columns = this.buildColumns();
      this.isFiltering = false;
      this.cdr.markForCheck();
      this.scrollService.refresh();
    }, 180);
  }

  private buildColumns(): SkillColumn[] {
    return ['Frontend', 'Backend', 'Tools']
      .filter(cat =>
        this.activeCategory === 'all'
        || cat === this.activeCategory)
      .map(cat => ({
        cat,
        items: this.skills.filter(s => s.cat === cat)
      }));
  }

  trackByCol(_: number, col: SkillColumn): string {
    return col.cat;
  }

  trackBySkill(_: number, skill: Skill): string {
    return skill.name;
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    clearTimeout(this.fadeTimer);
  }
}
