import { describe, it, expect } from "vitest";
import { authReducer, initialAuthState } from "./reducer";
import { ActionType } from "./action";

describe("authReducer", () => {
  it("should return the initial state when called with undefined state", () => {
    const state = authReducer(undefined, { type: "UNKNOWN" });
    expect(state).toEqual(initialAuthState);
  });

  it("should return current state on unknown action", () => {
    const currentState = { authUser: null, isPreload: false };
    const state = authReducer(currentState, { type: "RANDOM" });
    expect(state).toEqual(currentState);
  });

  it("should handle SET_AUTH_USER", () => {
    const user = { id: 1, name: "Giva", email: "giva@delcom.org" };
    const state = authReducer(initialAuthState, {
      type: ActionType.SET_AUTH_USER,
      payload: { authUser: user },
    });
    expect(state.authUser).toEqual(user);
  });

  it("should handle UNSET_AUTH_USER", () => {
    const loggedInState = {
      authUser: { id: 1, name: "Giva", email: "giva@delcom.org" },
      isPreload: false,
    };
    const state = authReducer(loggedInState, {
      type: ActionType.UNSET_AUTH_USER,
    });
    expect(state.authUser).toBeNull();
  });

  it("should handle SET_IS_PRELOAD", () => {
    const state = authReducer(initialAuthState, {
      type: ActionType.SET_IS_PRELOAD,
      payload: { isPreload: false },
    });
    expect(state.isPreload).toBe(false);
  });
});
