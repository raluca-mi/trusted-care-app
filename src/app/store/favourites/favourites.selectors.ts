import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavouritesState, favouritesAdapter } from './favourites.state';

export const FAVOURITES_FEATURE_KEY = 'favourites';

export const selectFavouritesState = createFeatureSelector<FavouritesState>(
  FAVOURITES_FEATURE_KEY
);

const {
  selectIds: selectFavouriteUids,
  selectEntities: selectFavouriteEntities,
  selectAll: selectAllFavourites,
  selectTotal: selectTotalFavourites,
} = favouritesAdapter.getSelectors(selectFavouritesState);

export const selectIsFavourite = (assistantUid: string) =>
  createSelector(
    selectFavouriteEntities,
    (entities): boolean => !!entities[assistantUid]
  );

export const FavouritesSelectors = {
  selectFavouritesState,
  selectFavouriteUids,
  selectFavouriteEntities,
  selectAllFavourites,
  selectTotalFavourites,
  selectIsFavourite,
};
