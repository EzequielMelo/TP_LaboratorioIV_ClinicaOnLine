import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../classes/patient.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css',
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  private afs = inject(AngularFirestore);
  private authService = inject(AuthService);
  private subscription: Subscription | null = null;

  user: Patient | null = null;
  captchaEnabled = true;
  cargando = false;
  mensaje: string | null = null;

  ngOnInit(): void {
    this.subscription = this.authService.user$.subscribe((user) => {
      if (user instanceof Patient) {
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
