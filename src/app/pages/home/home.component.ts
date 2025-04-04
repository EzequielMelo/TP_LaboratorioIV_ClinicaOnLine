import { CardComponent } from '../../components/home-components/card/card.component';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/general-components/navbar/navbar.component';
import { CarouselComponent } from '../../components/home-components/carousel/carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CarouselComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
