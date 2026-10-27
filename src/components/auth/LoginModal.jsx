"use client";

import React, { useState } from "react";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login({
        email: email.trim(),
        name: name.trim() || email.split("@")[0],
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg border border-zinc-800">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-950">
            Sign In to Revid.ai Studio
          </h2>
          <p className="text-xs text-zinc-500">
            Enter your email to sign in or create an account with real-time credits.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Email Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Creator Name"
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
          By signing in, you agree to our Terms of Service. Purchases are stored securely in your PostgreSQL database.
        </p>
      </div>
    </div>
  );
}
