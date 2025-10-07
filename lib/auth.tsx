"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getApiUrl } from "./api";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clear navigation state when pathname changes
  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isMounted) return;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.id || payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        });
      } catch (error) {
        console.error("[v0] Token decode error:", error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);

    const refreshInterval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        refreshToken(currentToken);
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [isMounted]);

  const refreshToken = async (token: string) => {
    try {
      const response = await fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          setUser({
            id: payload.id || payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role,
          });
        } catch (error) {
          console.error("[v0] Token decode error:", error);
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error("[v0] Token refresh error:", error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(getApiUrl("/auth/admin/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);

    setUser({
      id: data.admin.id,
      email: data.admin.email,
      name: data.admin.name,
      role: data.admin.role,
    });

    // Set navigating state before pushing to dashboard
    setIsNavigating(true);

    // Small delay to ensure state is set before navigation
    setTimeout(() => {
      router.push("/dashboard");
    }, 50);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  // Show loading state until mounted to prevent hydration issues
  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <div>
            <p className="text-sm font-medium">Loading...</p>
            <p className="text-xs text-muted-foreground mt-1">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // Show navigation loading overlay
  if (isNavigating) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <div>
            <p className="text-sm font-medium">Redirecting to dashboard</p>
            <p className="text-xs text-muted-foreground mt-1">
              Loading your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
