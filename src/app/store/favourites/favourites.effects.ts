import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  exhaustMap,
  filter,
  map,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../shared/services/firestore/user-profile.service';
import * as FavouritesActions from './favourites.actions';
import { FavouritesSelectors } from './favourites.selectors';

@Injectable()
export class FavouritesEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);

  persistFavourites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        FavouritesActions.addFavourite,
        FavouritesActions.removeFavourite,
        FavouritesActions.removeAllFavourites
      ),
      withLatestFrom(
        toObservable(this.authService.currentUser),
        this.store.pipe(select(FavouritesSelectors.selectFavouriteUids))
      ),
      filter(([_, currentUserProfile, favouriteUids]) => {
        if (!currentUserProfile || !currentUserProfile.uid) {
          return false;
        }
        return true;
      }),
      debounceTime(1000),
      exhaustMap(([_, currentUserProfile, favouriteUids]) => {
        const userId = currentUserProfile!.uid;

        return this.userProfileService
          .updateFavouriteAssistants(userId, favouriteUids as string[])
          .pipe(
            map(() => {
              return FavouritesActions.updateFavouritesInDbSuccess();
            }),
            catchError((error) => {
              return of(
                FavouritesActions.updateFavouritesInDbFailure({ error })
              );
            })
          );
      })
    )
  );

  loadFavourites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavouritesActions.loadFavourites),
      withLatestFrom(toObservable(this.authService.currentUser)),
      filter(([action, currentUserProfile]) => {
        if (!currentUserProfile || currentUserProfile.uid !== action.userId) {
          return false;
        }
        return true;
      }),
      switchMap(([action, currentUserProfile]) => {
        if (
          currentUserProfile &&
          currentUserProfile.favouriteAssistantUids &&
          currentUserProfile.favouriteAssistantUids.length > 0
        ) {
          return this.userProfileService
            .getUserProfilesByIds(currentUserProfile.favouriteAssistantUids)
            .pipe(
              map((assistants) => {
                return FavouritesActions.loadFavouritesSuccess({ assistants });
              }),
              catchError((error) => {
                return of(FavouritesActions.loadFavouritesFailure({ error }));
              })
            );
        }

        return of(FavouritesActions.loadFavouritesSuccess({ assistants: [] }));
      }),
      catchError((error) => {
        return of(FavouritesActions.loadFavouritesFailure({ error }));
      })
    )
  );

  constructor() {}
}
