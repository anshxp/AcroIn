import React, { createContext, useState } from "react";

export const AuthContext = createContext({ token: null, signIn: () => {}, signOut: () => {} });

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const signIn = (newToken) => setToken(newToken);
  const signOut = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
