import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appCaptcha]',
  standalone: true,
})
export class CaptchaDirective implements OnInit {
  @Input() disabled = false;
  @Output() captchaResolved = new EventEmitter<boolean>();

  private captchaCode: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.generateCaptcha();
    this.showCaptcha();
  }

  private generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.captchaCode = Array.from({ length: 5 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }

  private showCaptcha() {
    // Creamos un elemento visual para mostrar el captcha arriba del input
    const captchaDiv = this.renderer.createElement('div');
    const text = this.renderer.createText(this.captchaCode);

    this.renderer.addClass(captchaDiv, 'px-3');
    this.renderer.addClass(captchaDiv, 'py-1');
    this.renderer.addClass(captchaDiv, 'mb-2');
    this.renderer.addClass(captchaDiv, 'rounded');
    this.renderer.addClass(captchaDiv, 'bg-gray-200');
    this.renderer.addClass(captchaDiv, 'font-bold');
    this.renderer.addClass(captchaDiv, 'tracking-widest');
    this.renderer.addClass(captchaDiv, 'select-none');
    this.renderer.appendChild(captchaDiv, text);

    // Insertar antes del input
    const parent = this.el.nativeElement.parentNode;
    parent.insertBefore(captchaDiv, this.el.nativeElement);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    if (this.disabled) {
      this.captchaResolved.emit(true);
      return;
    }

    const value = (event.target as HTMLInputElement).value.trim().toUpperCase();
    this.captchaResolved.emit(value === this.captchaCode);
  }
}
