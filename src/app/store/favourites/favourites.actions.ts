import { createAction, props } from '@ngrx/store';
import { UserInterface } from '../../auth/models/user.model';
import { FavouritesActionTypes } from './favourites.action-types';

export const addFavourite = createAction(
  FavouritesActionTypes.ADD_FAVOURITE,
  props<{ assistant: UserInterface }>()
);

export const removeFavourite = createAction(
  FavouritesActionTypes.REMOVE_FAVOURITE,
  props<{ assistantUid: string }>()
);

export const removeAllFavourites = createAction(
  FavouritesActionTypes.REMOVE_ALL_FAVOURITES
);

export const loadFavourites = createAction(
  FavouritesActionTypes.LOAD_FAVOURITES,
  props<{ userId: string }>()
);

export const loadFavouritesSuccess = createAction(
  FavouritesActionTypes.LOAD_FAVOURITES_SUCCESS,
  props<{ assistants: UserInterface[] }>()
);

export const loadFavouritesFailure = createAction(
  FavouritesActionTypes.LOAD_FAVOURITES_FAILURE,
  props<{ error: any }>()
);

export const updateFavouritesInDb = createAction(
  FavouritesActionTypes.UPDATE_FAVOURITES_IN_DB,
  props<{ userId: string; favouriteAssistantUids: string[] }>()
);

export const updateFavouritesInDbSuccess = createAction(
  FavouritesActionTypes.UPDATE_FAVOURITES_IN_DB_SUCCESS
);

export const updateFavouritesInDbFailure = createAction(
  FavouritesActionTypes.UPDATE_FAVOURITES_IN_DB_FAILURE,
  props<{ error: any }>()
);

export const clearFavouritesState = createAction(
  FavouritesActionTypes.CLEAR_FAVOURITES_STATE
);
