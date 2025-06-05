import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStorage } from '@angular/fire/storage';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { getStorage } from 'firebase/storage';
import { config } from '../config/firebase.config';
import { FavouritesEffects } from './store/favourites/favourites.effects';
import { favouritesReducer } from './store/favourites/favourites.reducer';
import { FAVOURITES_FEATURE_KEY } from './store/favourites/favourites.selectors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // Firebase imports
    provideFirebaseApp(() => initializeApp(config.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    importProvidersFrom(MatSnackBarModule),

    provideStore({
      [FAVOURITES_FEATURE_KEY]: favouritesReducer,
    }),

    provideEffects([FavouritesEffects]),

    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
