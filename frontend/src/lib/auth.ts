export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  }
};

export const setUserData = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(user));
  }
};

export const getUserData = (): User | null => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("user_data");
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
