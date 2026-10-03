import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "./features/auth/states/reducer";
import { postsReducer, postDetailReducer } from "./features/posts/states/reducer";
import { usersReducer, profileReducer } from "./features/users/states/reducer";

const rootReducer = combineReducers({
  auth: authReducer,
  posts: postsReducer,
  postDetail: postDetailReducer,
  users: usersReducer,
  profile: profileReducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as any,
  });
}

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
