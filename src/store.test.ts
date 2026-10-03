import { describe, it, expect } from "vitest";
import { setupStore, store } from "./store";
import { setAuthUserActionCreator } from "./features/auth/states/action";

describe("Redux Store", () => {
  it("should create default store with all reducers registered", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("posts");
    expect(state).toHaveProperty("postDetail");
    expect(state).toHaveProperty("users");
    expect(state).toHaveProperty("profile");
  });

  it("should create store with preloaded state using setupStore", () => {
    const customStore = setupStore({
      auth: {
        authUser: { id: 99, name: "Test User", email: "test@delcom.org" },
        isPreload: false,
      },
    });

    const state = customStore.getState();
    expect(state.auth.authUser?.id).toBe(99);
    expect(state.auth.authUser?.name).toBe("Test User");
  });

  it("should handle dispatch actions correctly", () => {
    const testStore = setupStore();
    testStore.dispatch(
      setAuthUserActionCreator({ id: 1, name: "Admin", email: "admin@delcom.org" })
    );

    const state = testStore.getState();
    expect(state.auth.authUser?.id).toBe(1);
  });
});
