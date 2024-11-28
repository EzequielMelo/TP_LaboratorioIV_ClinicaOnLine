import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  startLoading() {
    console.log('Cargando...');
    this.isLoadingSubject.next(true);
  }

  stopLoading() {
    console.log('Carga terminada.');
    this.isLoadingSubject.next(false);
  }
}
