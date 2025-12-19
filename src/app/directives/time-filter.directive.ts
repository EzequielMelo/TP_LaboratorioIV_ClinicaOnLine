import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  Renderer2,
} from '@angular/core';

export interface TimeFilterCriteria {
  type: 'next-30-days' | 'all' | 'this-month' | 'last-3-months';
  label: string;
}

@Directive({
  selector: '[appTimeFilter]',
  standalone: true,
})
export class TimeFilterDirective {
  @Output() filterChange = new EventEmitter<TimeFilterCriteria>();

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Agregar estilos visuales al select
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.2s');
  }

  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    const criteria = this.parseTimeFilter(value);

    if (criteria) {
      this.addVisualFeedback();
      this.filterChange.emit(criteria);
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.02)');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
  }

  private parseTimeFilter(value: string): TimeFilterCriteria | null {
    const filterMap: { [key: string]: TimeFilterCriteria } = {
      'next-30-days': { type: 'next-30-days', label: 'Próximos 30 días' },
      all: { type: 'all', label: 'Todos' },
      'this-month': { type: 'this-month', label: 'Este mes' },
      'last-3-months': { type: 'last-3-months', label: 'Últimos 3 meses' },
    };

    return filterMap[value] || null;
  }

  private addVisualFeedback(): void {
    const element = this.el.nativeElement;

    this.renderer.addClass(element, 'ring-2');
    this.renderer.addClass(element, 'ring-blue-500');

    setTimeout(() => {
      this.renderer.removeClass(element, 'ring-2');
      this.renderer.removeClass(element, 'ring-blue-500');
    }, 300);
  }
}
