import { describe, it, expect } from "vitest";
import {
  usersReducer,
  profileReducer,
  initialUsersState,
  initialProfileState,
} from "./reducer";
import { ActionType } from "./action";

describe("users and profile reducers", () => {
  describe("usersReducer", () => {
    it("should return initial state when called with undefined", () => {
      const state = usersReducer(undefined, { type: "UNKNOWN" });
      expect(state).toEqual(initialUsersState);
    });

    it("should return current state on unknown action", () => {
      const current = [{ id: 1, name: "A", email: "a@delcom.org" }];
      const state = usersReducer(current, { type: "UNKNOWN" });
      expect(state).toEqual(current);
    });

    it("should handle RECEIVE_USERS", () => {
      const users = [{ id: 1, name: "A", email: "a@delcom.org" }];
      const state = usersReducer(initialUsersState, {
        type: ActionType.RECEIVE_USERS,
        payload: { users },
      });
      expect(state).toEqual(users);
    });
  });

  describe("profileReducer", () => {
    it("should return initial state when called with undefined", () => {
      const state = profileReducer(undefined, { type: "UNKNOWN" });
      expect(state).toEqual(initialProfileState);
    });

    it("should return current state on unknown action", () => {
      const current = { id: 1, name: "A", email: "a@delcom.org" };
      const state = profileReducer(current, { type: "UNKNOWN" });
      expect(state).toEqual(current);
    });

    it("should handle RECEIVE_PROFILE", () => {
      const user = { id: 1, name: "A", email: "a@delcom.org" };
      const state = profileReducer(initialProfileState, {
        type: ActionType.RECEIVE_PROFILE,
        payload: { profile: user },
      });
      expect(state).toEqual(user);
    });

    it("should handle UPDATE_PROFILE", () => {
      const updated = { id: 1, name: "A Updated", email: "a@delcom.org" };
      const state = profileReducer(
        { id: 1, name: "A", email: "a@delcom.org" },
        {
          type: ActionType.UPDATE_PROFILE,
          payload: { profile: updated },
        }
      );
      expect(state).toEqual(updated);
    });
  });
});
