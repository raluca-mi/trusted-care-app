import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserInterface } from '../../auth/models/user.model';
import * as FavouritesActions from './favourites.actions';
import { FavouritesSelectors } from './favourites.selectors';
import { FavouritesState } from './favourites.state';

@Injectable({
  providedIn: 'root',
})
export class FavouritesFacade {
  private readonly store = inject(Store<FavouritesState>);

  allFavourites$: Observable<UserInterface[]> = this.store.pipe(
    select(FavouritesSelectors.selectAllFavourites)
  );
  totalFavourites$: Observable<number> = this.store.pipe(
    select(FavouritesSelectors.selectTotalFavourites)
  );

  constructor() {}

  addFavourite(assistant: UserInterface): void {
    this.store.dispatch(FavouritesActions.addFavourite({ assistant }));
  }

  removeFavourite(assistantUid: string): void {
    this.store.dispatch(FavouritesActions.removeFavourite({ assistantUid }));
  }

  removeAllFavourites(): void {
    this.store.dispatch(FavouritesActions.removeAllFavourites());
  }

  isFavourite$(assistantUid: string): Observable<boolean> {
    return this.store.pipe(
      select(FavouritesSelectors.selectIsFavourite(assistantUid))
    );
  }

  loadFavourites(userId: string): void {
    this.store.dispatch(FavouritesActions.loadFavourites({ userId }));
  }

  clearFavouritesState(): void {
    this.store.dispatch(FavouritesActions.clearFavouritesState());
  }
}
