import { AfterViewInit, Component } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    initFlowbite();
  }
}
