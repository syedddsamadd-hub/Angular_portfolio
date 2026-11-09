import {
  Component, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

declare const THREE: any;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit,
  AfterViewInit, OnDestroy {

  @ViewChild('heroCanvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  // Typing animation
  typingTexts = [
    'Web Developer',
    'PHP Developer',
    'Problem Solver',
    'ASP.NET Core MVC DEVELOPER',
    'Full Stack Developer'
  ];
  displayText = '';
  private typeIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typeTimer: any;

  // Three.js objects
  private renderer: any;
  private scene: any;
  private camera: any;
  private torusKnot: any;
  private ring: any;
  private icosa: any;
  private spheres: any[] = [];
  private clock: any;
  private animFrameId: any;
  private targetRotX = 0;
  private targetRotY = 0;
  private currentRotX = 0;
  private currentRotY = 0;
  private heroEl: HTMLElement | null = null;
  private onHeroMouseMove?: (e: MouseEvent) => void;
  private onWindowResize?: () => void;

  private ctx?: ReturnType<typeof gsap.context>;

  constructor(
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>,
    private scrollService: ScrollAnimationService
  ) {}

  ngOnInit(): void {
    if (this.scrollService.prefersReducedMotion) {
      this.displayText = this.typingTexts[0];
      return;
    }
    this.startTyping();
  }

  ngAfterViewInit(): void {
    const reduced = this.scrollService.prefersReducedMotion;

    // Skip the 3D scene on small screens, for reduced motion,
    // and when the CDN script failed to load.
    if (window.innerWidth > 768 && !reduced
        && typeof THREE !== 'undefined') {
      this.initThreeJS();
    }

    if (!reduced) this.initAnimations();
  }

  // ── GSAP: entrance + scroll storytelling ──────────────
  private initAnimations(): void {
    this.ctx = gsap.context(() => {
      const entrance = gsap.timeline({
        defaults: { ease: 'power3.out' }
      });

      entrance
        .from('.hero-badge', {
          y: 16, opacity: 0, duration: 0.6
        })
        .from('.hero-title .word', {
          yPercent: 115, duration: 0.9,
          stagger: 0.07
        }, '-=0.35')
        .from('.hero-typing', {
          y: 14, opacity: 0, duration: 0.5
        }, '-=0.55')
        .from('.hero-bio', {
          y: 16, opacity: 0, duration: 0.6
        }, '-=0.45')
        .from('.hero-btns > *', {
          y: 16, opacity: 0, duration: 0.55,
          stagger: 0.1
        }, '-=0.4')
        .from('.hero-stats .stat, .hero-stats .stat-divider', {
          y: 14, opacity: 0, duration: 0.5,
          stagger: 0.07
        }, '-=0.35')
        .from('.hero-canvas-wrap canvas', {
          opacity: 0, scale: 0.92, duration: 1.2
        }, '-=0.9');

      // Content leaves as the hero scrolls away.
      gsap.to('.hero-content', {
        opacity: 0, yPercent: -8, scale: 0.98,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.hero-canvas-wrap', {
        opacity: 0, scale: 0.9, yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // Decorative orbs drift at different scroll speeds.
      gsap.utils.toArray<HTMLElement>('.orb')
        .forEach((orb, i) => {
          gsap.to(orb, {
            yPercent: 12 + i * 9,
            xPercent: (i - 1) * 7,
            ease: 'none',
            scrollTrigger: {
              trigger: '#hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true
            }
          });
        });
    }, this.host.nativeElement);
  }

  // ── Typing Animation ──────────────────────────────────
  startTyping(): void {
    this.typeTimer = setInterval(() => {
      this.typeStep();
    }, this.isDeleting ? 60 : 100);
  }

  typeStep(): void {
    clearInterval(this.typeTimer);
    // This app is zoneless, so a timer callback does NOT trigger change
    // detection on its own. Flag the view dirty before mutating; Angular
    // then re-renders and picks up the displayText change below.
    this.cdr.markForCheck();
    const word = this.typingTexts[this.typeIndex];

    if (!this.isDeleting) {
      this.displayText = word.substring(
        0, this.charIndex + 1
      );
      this.charIndex++;
      if (this.charIndex === word.length) {
        this.isDeleting = true;
        setTimeout(() => this.scheduleType(), 1800);
        return;
      }
    } else {
      this.displayText = word.substring(
        0, this.charIndex - 1
      );
      this.charIndex--;
      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.typeIndex =
          (this.typeIndex + 1) % this.typingTexts.length;
      }
    }
    this.scheduleType();
  }

  scheduleType(): void {
    this.typeTimer = setTimeout(() => {
      this.typeStep();
    }, this.isDeleting ? 60 : 100);
  }

  // ── Three.js Scene ────────────────────────────────────
  initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const wrap = canvas.parentElement!;

    this.renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      wrap.offsetWidth, wrap.offsetHeight
    );

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      wrap.offsetWidth / wrap.offsetHeight,
      0.1, 100
    );
    this.camera.position.set(0, 0, 5);
    this.clock = new THREE.Clock();

    // Torus Knot (main object)
    const tkGeo = new THREE.TorusKnotGeometry(
      1.2, 0.35, 200, 32
    );
    const tkMat = new THREE.MeshStandardMaterial({
      color: 0xB6FF2E,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0xB6FF2E,
      emissiveIntensity: 0.15
    });
    this.torusKnot = new THREE.Mesh(tkGeo, tkMat);
    this.scene.add(this.torusKnot);

    // Orbiting Ring
    const ringGeo = new THREE.TorusGeometry(
      2.2, 0.025, 16, 100
    );
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xB6FF2E,
      transparent: true, opacity: 0.4
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.rotation.x = Math.PI / 2;
    this.scene.add(this.ring);

    // 5 Floating Spheres
    const sGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const sMat = new THREE.MeshBasicMaterial({
      color: 0xB6FF2E,
      transparent: true, opacity: 0.8
    });
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(sGeo, sMat);
      this.spheres.push(s);
      this.scene.add(s);
    }

    // Wireframe Icosahedron
    const iGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const iMat = new THREE.MeshBasicMaterial({
      color: 0xB6FF2E,
      wireframe: true,
      transparent: true, opacity: 0.06
    });
    this.icosa = new THREE.Mesh(iGeo, iMat);
    this.scene.add(this.icosa);

    // Lights
    this.scene.add(
      new THREE.AmbientLight(0xffffff, 0.5)
    );
    const pl1 = new THREE.PointLight(0xB6FF2E, 2, 10);
    pl1.position.set(3, 3, 3);
    this.scene.add(pl1);

    // Mouse interaction
    this.heroEl = document.getElementById('hero');
    this.onHeroMouseMove = (e: MouseEvent) => {
      this.targetRotX =
        (e.clientY / window.innerHeight - 0.5) * 0.6;
      this.targetRotY =
        (e.clientX / window.innerWidth - 0.5) * 0.6;
    };
    this.heroEl?.addEventListener(
      'mousemove', this.onHeroMouseMove
    );

    // Window resize
    this.onWindowResize = () => {
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this.onWindowResize);

    this.animate();
  }

  animate(): void {
    this.animFrameId = requestAnimationFrame(
      () => this.animate()
    );
    const t = this.clock.getElapsedTime();

    this.torusKnot.rotation.x += 0.005;
    this.torusKnot.rotation.y += 0.003;
    this.torusKnot.rotation.z += 0.002;

    this.ring.rotation.z += 0.008;
    this.ring.rotation.y += 0.003;

    this.icosa.rotation.y -= 0.002;
    this.icosa.rotation.x += 0.001;

    this.spheres.forEach((s, i) => {
      const angle = t * 0.8 + (i * Math.PI * 2 / 5);
      s.position.x = Math.cos(angle) * 2.0;
      s.position.y = Math.sin(angle * 0.7) * 0.8;
      s.position.z = Math.sin(angle) * 2.0;
    });

    this.currentRotX +=
      (this.targetRotX - this.currentRotX) * 0.05;
    this.currentRotY +=
      (this.targetRotY - this.currentRotY) * 0.05;
    this.scene.rotation.x = this.currentRotX;
    this.scene.rotation.y = this.currentRotY;

    this.renderer.render(this.scene, this.camera);
  }

  scrollTo(id: string): void {
    this.scrollService.scrollTo(id);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    clearInterval(this.typeTimer);
    clearTimeout(this.typeTimer);

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.onHeroMouseMove) {
      this.heroEl?.removeEventListener(
        'mousemove', this.onHeroMouseMove
      );
    }
    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
    }

    this.torusKnot?.geometry?.dispose();
    this.torusKnot?.material?.dispose();
    this.ring?.geometry?.dispose();
    this.ring?.material?.dispose();
    this.icosa?.geometry?.dispose();
    this.icosa?.material?.dispose();
    this.spheres.forEach(s => {
      s.geometry?.dispose();
      s.material?.dispose();
    });
    this.renderer?.dispose();
  }
}
