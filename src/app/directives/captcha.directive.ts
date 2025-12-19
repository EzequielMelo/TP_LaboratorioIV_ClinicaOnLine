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
  private canvas: HTMLCanvasElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.generateCaptcha();
    this.showCaptcha();
  }

  private generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.captchaCode = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }

  private showCaptcha() {
    // Crear canvas
    this.canvas = this.renderer.createElement('canvas');
    if (!this.canvas) return;

    this.canvas.width = 200;
    this.canvas.height = 70;

    this.renderer.addClass(this.canvas, 'mb-2');
    this.renderer.addClass(this.canvas, 'rounded');
    this.renderer.addClass(this.canvas, 'border');
    this.renderer.addClass(this.canvas, 'border-gray-300');
    this.renderer.addClass(this.canvas, 'cursor-pointer');
    this.renderer.setStyle(this.canvas, 'display', 'block');

    // Evento para regenerar captcha al hacer clic
    this.renderer.listen(this.canvas, 'click', () => {
      this.generateCaptcha();
      this.drawCaptcha();
      // Limpiar el input
      (this.el.nativeElement as HTMLInputElement).value = '';
      this.captchaResolved.emit(false);
    });

    // Insertar antes del input
    const parent = this.el.nativeElement.parentNode;
    parent.insertBefore(this.canvas, this.el.nativeElement);

    this.drawCaptcha();
  }

  private drawCaptcha() {
    if (!this.canvas) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    gradient.addColorStop(0, '#f0f4f8');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Agregar ruido de fondo
    this.addNoise(ctx);

    // Agregar líneas de distorsión
    this.addDistortionLines(ctx);

    // Dibujar el texto del captcha con distorsión
    this.drawDistortedText(ctx);

    // Agregar más ruido encima
    this.addNoise(ctx, 0.3);
  }

  private addNoise(ctx: CanvasRenderingContext2D, density: number = 0.05) {
    const imageData = ctx.getImageData(
      0,
      0,
      this.canvas!.width,
      this.canvas!.height
    );
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      if (Math.random() < density) {
        const color = Math.random() * 255;
        pixels[i] = color; // R
        pixels[i + 1] = color; // G
        pixels[i + 2] = color; // B
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private addDistortionLines(ctx: CanvasRenderingContext2D) {
    const lineCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < lineCount; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${
        Math.random() * 100
      }, 0.3)`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();

      const startX = Math.random() * this.canvas!.width;
      const startY = Math.random() * this.canvas!.height;

      ctx.moveTo(startX, startY);

      // Línea curva
      const cpX = Math.random() * this.canvas!.width;
      const cpY = Math.random() * this.canvas!.height;
      const endX = Math.random() * this.canvas!.width;
      const endY = Math.random() * this.canvas!.height;

      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }
  }

  private drawDistortedText(ctx: CanvasRenderingContext2D) {
    const chars = this.captchaCode.split('');
    const spacing = this.canvas!.width / (chars.length + 1);

    chars.forEach((char, index) => {
      // Configuración de fuente con variación
      const fontSize = 28 + Math.random() * 8;
      const fontFamily = ['Arial', 'Verdana', 'Georgia', 'Times New Roman'][
        Math.floor(Math.random() * 4)
      ];
      ctx.font = `bold ${fontSize}px ${fontFamily}`;

      // Color aleatorio oscuro
      const r = Math.floor(Math.random() * 100);
      const g = Math.floor(Math.random() * 100);
      const b = Math.floor(Math.random() * 100);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      // Posición con variación
      const x = spacing * (index + 1) + (Math.random() - 0.5) * 10;
      const y = 35 + (Math.random() - 0.5) * 15;

      // Guardar estado
      ctx.save();

      // Aplicar transformaciones
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4); // Rotación aleatoria
      ctx.scale(
        1 + (Math.random() - 0.5) * 0.2,
        1 + (Math.random() - 0.5) * 0.2
      ); // Escala

      // Dibujar caracter
      ctx.fillText(char, 0, 0);

      // Restaurar estado
      ctx.restore();
    });
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
