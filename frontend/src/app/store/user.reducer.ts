import { createReducer, on } from '@ngrx/store';
import { setUser, clearUser } from './user.actions';

export interface UserState {
  username: string | null;
  email: string | null;
}

export const initialState: UserState = {
  username: null,
  email: null,
};

export const userReducer = createReducer(
  initialState,
  on(setUser, (state, { username, email }) => ({ username, email })),
  on(clearUser, () => initialState)
);
