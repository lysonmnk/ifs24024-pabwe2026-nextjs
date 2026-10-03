import { User } from "@/types";
import { ActionType } from "./action";

export const initialUsersState: User[] = [];

export function usersReducer(
  state: User[] = initialUsersState,
  action: { type: string; payload?: any } = { type: "" }
): User[] {
  switch (action.type) {
    case ActionType.RECEIVE_USERS:
      return action.payload.users;
    default:
      return state;
  }
}

export const initialProfileState: User | null = null;

export function profileReducer(
  state: User | null = initialProfileState,
  action: { type: string; payload?: any } = { type: "" }
): User | null {
  switch (action.type) {
    case ActionType.RECEIVE_PROFILE:
    case ActionType.UPDATE_PROFILE:
      return action.payload.profile;
    default:
      return state;
  }
}
