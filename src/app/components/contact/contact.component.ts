import {
  Component, AfterViewInit, OnDestroy, ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { gsap } from 'gsap';
import { CONTACT_FORM } from '../../contact.config';
import {
  ScrollAnimationService
} from '../../services/scroll-animation.service';

interface ContactResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements
  AfterViewInit, OnDestroy {

  formData = {
    name: '', email: '',
    subject: '', message: ''
  };
  formMsg = '';
  formMsgType = '';
  isSubmitting = false;
  botcheck = false;

  private ctx?: ReturnType<typeof gsap.context>;
  private clearTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private host: ElementRef<HTMLElement>,
    private scrollService: ScrollAnimationService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (this.scrollService.prefersReducedMotion) return;

    this.ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '#contact',
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
        .from('.contact-info > *', {
          y: 20, opacity: 0, duration: 0.6,
          stagger: 0.08
        }, '-=0.25')
        .from('.contact-form-wrap', {
          y: 30, opacity: 0, duration: 0.7
        }, '-=0.55')
        .from('.f-group', {
          y: 14, opacity: 0, duration: 0.4,
          stagger: 0.06
        }, '-=0.45')
        .from('.btn-block', {
          y: 12, opacity: 0, duration: 0.4
        }, '-=0.3');
    }, this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    clearTimeout(this.clearTimer);
  }

  submitForm(): void {
    if (this.isSubmitting) return;

    const name = this.formData.name.trim();
    const email = this.formData.email.trim();
    const subject = this.formData.subject.trim();
    const message = this.formData.message.trim();

    if (!name || !email || !subject || !message) {
      this.showMessage('Please fill all fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showMessage(
        'Please enter a valid email address.', 'error'
      );
      return;
    }
    if (!CONTACT_FORM.accessKey) {
      this.showMessage(
        'The form is not configured yet. Please email me ' +
        'directly at syedddsamadd@gmail.com.', 'error'
      );
      return;
    }

    this.isSubmitting = true;
    this.formMsg = '';
    this.cdr.markForCheck();

    this.http.post<ContactResponse>(
      CONTACT_FORM.endpoint,
      {
        access_key: CONTACT_FORM.accessKey,
        name,
        email,
        subject,
        message,
        from_name: 'Abdul Samad Portfolio',
        botcheck: this.botcheck
      }
    ).subscribe({
      next: response => {
        this.isSubmitting = false;

        if (response?.success) {
          this.formData = {
            name: '', email: '', subject: '', message: ''
          };
          this.showMessage(
            '✅ Message sent! I will get back to you soon.',
            'success', 6000
          );
        } else {
          this.showMessage(
            response?.message
              ?? 'Something went wrong. Please try again.',
            'error'
          );
        }
        this.cdr.markForCheck();
      },
      error: err => {
        this.isSubmitting = false;
        this.showMessage(
          err?.error?.message
            ?? 'Could not send your message. Please email me ' +
               'directly at syedddsamadd@gmail.com.',
          'error'
        );
        this.cdr.markForCheck();
      }
    });
  }

  private showMessage(
    message: string,
    type: 'success' | 'error',
    clearAfter?: number
  ): void {
    this.formMsg = message;
    this.formMsgType = type;
    this.cdr.markForCheck();

    clearTimeout(this.clearTimer);
    if (clearAfter) {
      this.clearTimer = setTimeout(() => {
        this.formMsg = '';
        this.cdr.markForCheck();
      }, clearAfter);
    }
  }
}
