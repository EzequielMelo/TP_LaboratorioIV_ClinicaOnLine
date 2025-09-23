import { CardComponent } from '../../components/home-components/card/card.component';
import { Component, OnInit, inject } from '@angular/core';
import { CarouselComponent } from '../../components/home-components/carousel/carousel.component';
import { DatabaseService } from '../../services/database/database.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private db = inject(DatabaseService);

  ngOnInit(): void {
    this.registrarVisita();
  }

  private registrarVisita() {
    this.db
      .registerVisit()
      .then(() => {
        console.log('Visita registrada con éxito');
      })
      .catch((error) => {
        console.error('Error al registrar la visita:', error);
      });
  }
}
