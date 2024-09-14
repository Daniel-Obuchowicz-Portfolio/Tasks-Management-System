import { createAction, props } from '@ngrx/store';

export const setUser = createAction(
  '[User] Set User',
  props<{ username: string, email: string }>()
);

export const clearUser = createAction('[User] Clear User');
