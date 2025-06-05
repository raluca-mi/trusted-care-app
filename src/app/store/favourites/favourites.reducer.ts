import { Action, createReducer, on } from '@ngrx/store';
import * as FavouritesActions from './favourites.actions';
import {
  FavouritesState,
  favouritesAdapter,
  initialFavouritesState,
} from './favourites.state';

const favouritesReducerInternal = createReducer(
  initialFavouritesState,

  on(FavouritesActions.addFavourite, (state, { assistant }) => {
    return favouritesAdapter.upsertOne(assistant, state);
  }),

  on(FavouritesActions.removeFavourite, (state, { assistantUid }) => {
    return favouritesAdapter.removeOne(assistantUid, state);
  }),

  on(FavouritesActions.removeAllFavourites, (state) => {
    return favouritesAdapter.removeAll(state);
  }),

  on(FavouritesActions.loadFavourites, (state) => {
    return state;
  }),

  on(FavouritesActions.loadFavouritesSuccess, (state, { assistants }) => {
    return favouritesAdapter.setAll(assistants, {
      ...state,
    });
  }),

  on(FavouritesActions.loadFavouritesFailure, (state, { error }) => {
    console.error('Error loading favourites:', error);
    return state;
  }),

  on(FavouritesActions.updateFavouritesInDb, (state) => {
    return state;
  }),

  on(FavouritesActions.updateFavouritesInDbSuccess, (state) => {
    return state;
  }),

  on(FavouritesActions.updateFavouritesInDbFailure, (state, { error }) => {
    console.error(
      'Reducer: updateFavouritesInDbFailure action received',
      error
    );
    return state;
  }),

  on(FavouritesActions.clearFavouritesState, (state) => {
    return favouritesAdapter.removeAll(state);
  })
);

export function favouritesReducer(
  state: FavouritesState | undefined,
  action: Action
) {
  return favouritesReducerInternal(state, action);
}
