import { User } from "@/types";
import { ActionType } from "./action";

export interface AuthState {
  authUser: User | null;
  isPreload: boolean;
}

export const initialAuthState: AuthState = {
  authUser: null,
  isPreload: true,
};

export function authReducer(
  state: AuthState = initialAuthState,
  action: { type: string; payload?: any } = { type: "" }
): AuthState {
  switch (action.type) {
    case ActionType.SET_AUTH_USER:
      return {
        ...state,
        authUser: action.payload.authUser,
      };
    case ActionType.UNSET_AUTH_USER:
      return {
        ...state,
        authUser: null,
      };
    case ActionType.SET_IS_PRELOAD:
      return {
        ...state,
        isPreload: action.payload.isPreload,
      };
    default:
      return state;
  }
}
