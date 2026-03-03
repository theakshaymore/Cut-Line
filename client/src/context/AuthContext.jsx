import { createContext, useContext, useMemo, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("nextcut_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("nextcut_user");
    return stored ? JSON.parse(stored) : null;
  });

  const saveSession = (nextToken, nextUser) => {
    localStorage.setItem("nextcut_token", nextToken);
    localStorage.setItem("nextcut_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("nextcut_token");
    localStorage.removeItem("nextcut_user");
    setToken(null);
    setUser(null);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveSession(data.token, data.user);
    return data;
  };

  const registerCustomer = async (payload) => {
    const { data } = await api.post("/auth/register", { ...payload, role: "customer" });
    saveSession(data.token, data.user);
    return data;
  };

  const registerBarberWithToken = async (tokenValue, payload) => {
    const url = tokenValue ? `/auth/barber-register/${tokenValue}` : "/auth/barber-register";
    const { data } = await api.post(url, payload);
    saveSession(data.token, data.user);
    return data;
  };

  const value = useMemo(
    () => ({ token, user, login, logout, registerCustomer, registerBarberWithToken }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
