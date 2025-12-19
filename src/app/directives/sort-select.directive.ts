import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  Renderer2,
} from '@angular/core';

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

@Directive({
  selector: '[appSortSelect]',
  standalone: true,
})
export class SortSelectDirective {
  @Output() sortChange = new EventEmitter<SortCriteria>();

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Agregar estilos visuales al select
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.2s');
  }

  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    // Parsear el valor para obtener field y direction
    const criteria = this.parseSortValue(value);

    if (criteria) {
      // Agregar efecto visual al cambiar
      this.addVisualFeedback();

      // Emitir el criterio de ordenamiento
      this.sortChange.emit(criteria);
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

  private parseSortValue(value: string): SortCriteria | null {
    // Mapeo de valores del select a criterios de ordenamiento
    const sortMap: { [key: string]: SortCriteria } = {
      'date-asc': { field: 'date', direction: 'asc' },
      'date-desc': { field: 'date', direction: 'desc' },
      specialty: { field: 'specialty', direction: 'asc' },
      status: { field: 'status', direction: 'asc' },
      specialist: { field: 'specialist', direction: 'asc' },
      patient: { field: 'patient', direction: 'asc' },
    };

    return sortMap[value] || null;
  }

  private addVisualFeedback(): void {
    const element = this.el.nativeElement;

    // Agregar clase temporal para efecto visual
    this.renderer.addClass(element, 'ring-2');
    this.renderer.addClass(element, 'ring-green-500');

    setTimeout(() => {
      this.renderer.removeClass(element, 'ring-2');
      this.renderer.removeClass(element, 'ring-green-500');
    }, 300);
  }
}
