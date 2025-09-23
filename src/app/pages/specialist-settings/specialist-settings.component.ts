import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Specialist } from '../../classes/specialist.class';
import { AuthService } from '../../services/auth/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-specialist-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialist-settings.component.html',
  styleUrl: './specialist-settings.component.css',
})
export class SpecialistSettingsComponent implements OnInit, OnDestroy {
  private afs = inject(AngularFirestore);
  private authService = inject(AuthService);
  private subscription: Subscription | null = null;

  user: Specialist | null = null;
  captchaEnabled = true;
  cargando = false;
  mensaje: string | null = null;

  ngOnInit(): void {
    this.subscription = this.authService.user$.subscribe((user) => {
      if (user instanceof Specialist) {
        this.user = user;
        this.captchaEnabled = user.settings?.useCaptcha ?? true; // siempre sincronizamos
      } else {
        this.user = null;
      }
    });
  }

  async guardarConfiguracion() {
    if (!this.user) return;

    this.cargando = true;
    this.mensaje = null;

    try {
      // Actualizar en Firestore
      await this.afs.collection('users').doc(this.user.id).update({
        'settings.useCaptcha': this.captchaEnabled,
      });

      // Actualizar en el usuario local y forzar emisión en AuthService
      this.user.settings = {
        ...this.user.settings,
        useCaptcha: this.captchaEnabled,
      };
      this.authService.setUser(this.user);

      this.mensaje = '✅ Configuración guardada con éxito';
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      this.mensaje = '❌ Error al guardar configuración';
    } finally {
      this.cargando = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
