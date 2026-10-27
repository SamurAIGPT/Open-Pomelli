"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fetch initial session and credits from database
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setCredits(data.user.credits ?? 0);
      }
    } catch (err) {
      console.error("[AUTH CONTEXT] Error fetching session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen to cross-component credits sync events
    const handleSync = (e) => {
      if (typeof e.detail?.credits === "number") {
        setCredits(e.detail.credits);
        setUser((prev) => (prev ? { ...prev, credits: e.detail.credits } : prev));
      }
    };
    window.addEventListener("revid-credits-updated", handleSync);
    return () => window.removeEventListener("revid-credits-updated", handleSync);
  }, [refreshSession]);

  // Login handler
  const login = async ({ email, name, image } = {}) => {
    if (!email) {
      throw new Error("Please enter your email to sign in.");
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, image }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setCredits(data.user.credits ?? 0);
        setIsLoginModalOpen(false);
        return { success: true, user: data.user };
      }
      throw new Error(data.error || "Login failed");
    } catch (err) {
      console.error("[AUTH] Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCredits(0);
    } catch (err) {
      console.error("[AUTH] Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Deduct credits handler (Atomic with rollback)
  const deductCredits = async (amount = 5, reason = "AI Script Generation") => {
    if (credits < amount) {
      setIsTopUpOpen(true);
      throw new Error(`Insufficient credits. You need ${amount} credits, but have ${credits}.`);
    }

    const previousCredits = credits;
    // Optimistic UI update
    setCredits((prev) => Math.max(0, prev - amount));

    try {
      const res = await fetch("/api/user/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deduct", amount, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback
        setCredits(previousCredits);
        if (data.insufficient) {
          setIsTopUpOpen(true);
        }
        throw new Error(data.error || "Failed to deduct credits");
      }

      const newCredits = data.credits;
      setCredits(newCredits);
      setUser((prev) => (prev ? { ...prev, credits: newCredits } : prev));

      // Broadcast update
      window.dispatchEvent(
        new CustomEvent("revid-credits-updated", { detail: { credits: newCredits } })
      );

      return { success: true, credits: newCredits };
    } catch (err) {
      setCredits(previousCredits);
      throw err;
    }
  };

  // Top Up Credits handler
  const topUpCredits = async (amount = 100, packName = "Top Up") => {
    try {
      const res = await fetch("/api/user/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "topup", amount, reason: packName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add credits");
      }

      const newCredits = data.credits;
      setCredits(newCredits);
      setUser((prev) => (prev ? { ...prev, credits: newCredits } : prev));

      window.dispatchEvent(
        new CustomEvent("revid-credits-updated", { detail: { credits: newCredits } })
      );

      return { success: true, credits: newCredits };
    } catch (err) {
      console.error("[TOPUP] Error:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        isLoading,
        isAuthenticated: !!user,
        isTopUpOpen,
        setIsTopUpOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        logout,
        refreshSession,
        deductCredits,
        topUpCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
