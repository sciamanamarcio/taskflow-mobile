import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "taskflow.token";

export const loadStoredToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const saveStoredToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const removeStoredToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);
