"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getApiUrl, fetchWithAuth } from "./api";
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
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
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

  // Check if user is authenticated on mount
  useEffect(() => {
    if (!isMounted) return;

    checkAuth();
  }, [isMounted]);

  // Check authentication status by trying to refresh token
  const checkAuth = async () => {
    try {
      const response = await fetchWithAuth(getApiUrl("/auth/admin/refresh-token"), {
        method: "POST",
        credentials: "include", // Send cookies
      });

      if (response.ok) {
        const data = await response.json();
        // User or admin data depending on role
        const userData = data.user || data.admin;
        if (userData) {
          setUser(userData);
        }
      } else {
        // Not authenticated or session expired
        setUser(null);
      }
    } catch (error) {
      console.error("[Auth] Check auth error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await checkAuth();
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(getApiUrl("/auth/admin/login"), {
      method: "POST",
      credentials: "include", // Important: Send/receive cookies
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Login failed");
    }

    const data = await response.json();

    // Set user from response
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

  const logout = async () => {
    try {
      // Call logout endpoint to revoke session
      await fetchWithAuth(getApiUrl("/auth/admin/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[Auth] Logout error:", error);
    } finally {
      // Clear user state regardless of API call success
      setUser(null);
      router.push("/login");
    }
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
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, refreshUser }}
    >
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
