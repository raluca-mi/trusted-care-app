import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { UserInterface } from '../../auth/models/user.model';

export interface FavouritesState extends EntityState<UserInterface> {}

export const favouritesAdapter: EntityAdapter<UserInterface> =
  createEntityAdapter<UserInterface>({
    selectId: (assistant: UserInterface) => assistant.uid,
  });


export const initialFavouritesState: FavouritesState = favouritesAdapter.getInitialState({});
