import {
  ApplicationConfig,
  provideZoneChangeDetection,
  LOCALE_ID,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { environment } from '../environments/environment';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideEcharts } from 'ngx-echarts';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Factory function para el TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

// Registrar datos de localización española
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    // Solo un provideHttpClient con ambas configuraciones
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    { provide: LOCALE_ID, useValue: 'es' },
    provideEcharts(),
    // Configuración de ngx-translate
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        defaultLanguage: 'es',
        useDefaultLang: true,
      })
    ),
    provideAnimations(),
  ],
};
