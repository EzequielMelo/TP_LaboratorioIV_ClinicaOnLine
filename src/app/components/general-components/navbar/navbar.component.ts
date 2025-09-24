import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { LoadingService } from '../../../services/loading/loading.service';
import { UserTypes } from '../../../models/user-types';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: UserTypes | null = null;
  auth: boolean = false;
  isLoading$: Observable<boolean>;
  currentLang: string = 'es';
  isMobileMenuOpen: boolean = false;
  isUserMenuOpen: boolean = false;
  private userSubscription: Subscription;

  protected authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private translate = inject(TranslateService);

  constructor() {
    // Inicializar el idioma
    this.initializeLanguage();

    // Suscripciones
    this.authService.authUser$.subscribe((auth) => (this.auth = !!auth));
    this.userSubscription = this.authService.user$.subscribe(
      (user) => (this.user = user)
    );
    this.isLoading$ = this.loadingService.isLoading$;
  }

  ngOnInit(): void {
    // Verificar que las traducciones se carguen
    this.translate.get('NAV.LOGIN').subscribe((translation: string) => {
      console.log('Translation loaded:', translation);
    });

    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const mobileMenu = document.getElementById('mobile-menu');
      const hamburgerButton = document.querySelector(
        '[aria-controls="navbar-user"]'
      );
      const userMenu = document.getElementById('user-dropdown');
      const userButton = document.getElementById('user-menu-button');

      // Cerrar menú móvil si se hace clic fuera
      if (this.isMobileMenuOpen && mobileMenu && hamburgerButton) {
        if (!mobileMenu.contains(target) && !hamburgerButton.contains(target)) {
          this.isMobileMenuOpen = false;
        }
      }

      // Cerrar menú de usuario si se hace clic fuera
      if (this.isUserMenuOpen && userMenu && userButton) {
        if (!userMenu.contains(target) && !userButton.contains(target)) {
          this.isUserMenuOpen = false;
        }
      }
    });
  }

  private initializeLanguage(): void {
    // Obtener idioma guardado o usar español por defecto
    const savedLang = localStorage.getItem('lang') || 'es';
    this.currentLang = savedLang;

    // Configurar idioma por defecto
    this.translate.setDefaultLang('es');

    // Usar el idioma seleccionado
    this.translate.use(this.currentLang);
  }

  changeLanguage(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);

    // Cerrar ambos menús después de seleccionar idioma
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;

    // Log para debugging
    console.log('Language changed to:', lang);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Cerrar menú de usuario si está abierto
    if (this.isMobileMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Cerrar menú móvil si está abierto
    if (this.isUserMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  logOut(): void {
    this.authService.logOut();
    // Cerrar ambos menús después del logout
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
