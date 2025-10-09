"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TokenStorage, User } from "@/lib/auth";
import jwt from "jsonwebtoken";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  checkTokenExpiration: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const accessToken = TokenStorage.getAccessToken();

      if (accessToken) {
        try {
          // Decode the JWT token to get user information
          const decodedToken = jwt.decode(accessToken) as any;

          console.log("Decoded token:", decodedToken); // Debug log

          if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            // Token is valid and not expired
            setUser({
              id:
                decodedToken.userId ||
                decodedToken.sub ||
                decodedToken.id ||
                "user-id",
              phoneNumber: decodedToken.phoneNumber || decodedToken.phone || "",
              role: decodedToken.role || "VENDOR",
              isActive:
                decodedToken.isActive !== undefined
                  ? decodedToken.isActive
                  : true,
            });
          } else if (decodedToken && !decodedToken.exp) {
            // Token doesn't have expiration (handle non-standard JWT)
            console.log("Token without expiration, setting user anyway");
            setUser({
              id:
                decodedToken.userId ||
                decodedToken.sub ||
                decodedToken.id ||
                "user-id",
              phoneNumber: decodedToken.phoneNumber || decodedToken.phone || "",
              role: decodedToken.role || "VENDOR",
              isActive:
                decodedToken.isActive !== undefined
                  ? decodedToken.isActive
                  : true,
            });
          } else {
            // Token is expired or invalid
            console.warn("Token is expired or invalid", { decodedToken });
            TokenStorage.clearTokens();
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          // If JWT decode fails but token exists, create a basic user session
          // This is a fallback - you might want to remove this in production
          console.log("Creating fallback user session");
          setUser({
            id: "temp-user",
            phoneNumber: "",
            role: "VENDOR",
            isActive: true,
          });
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    TokenStorage.setTokens(accessToken, refreshToken);
    setUser(userData);
  };

  const logout = () => {
    TokenStorage.clearTokens();
    setUser(null);
  };

  const checkTokenExpiration = (): boolean => {
    const accessToken = TokenStorage.getAccessToken();
    if (!accessToken) return false;

    try {
      const decodedToken = jwt.decode(accessToken) as any;
      if (decodedToken && decodedToken.exp) {
        const isExpired = decodedToken.exp * 1000 <= Date.now();
        if (isExpired) {
          console.log("Token is expired, clearing tokens");
          logout();
          return false;
        }
        return true;
      }
      return true; // If no expiration, assume it's valid
    } catch (error) {
      console.error("Error checking token expiration:", error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkTokenExpiration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
