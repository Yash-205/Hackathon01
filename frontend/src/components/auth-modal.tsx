"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Brain, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setAuthToken, setUserData } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch('/api/auth/login', {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Login failed");
        }

        const { access_token } = await response.json();
        setAuthToken(access_token);

        const userResponse = await fetch('/api/auth/me', {
          headers: { "Authorization": `Bearer ${access_token}` },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData);
        }
        window.location.reload(); // Refresh to update auth state
      } else {
        const response = await fetch('/api/auth/register', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Signup failed");
        }
        
        // Auto login after signup
        const loginFormData = new URLSearchParams();
        loginFormData.append("username", email);
        loginFormData.append("password", password);
        
        const loginResponse = await fetch('/api/auth/login', {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: loginFormData,
        });

        if (loginResponse.ok) {
          const { access_token } = await loginResponse.json();
          setAuthToken(access_token);
          const userResponse = await fetch('/api/auth/me', {
            headers: { "Authorization": `Bearer ${access_token}` },
          });
          if (userResponse.ok) {
            setUserData(await userResponse.json());
          }
          window.location.reload();
        } else {
          setMode("login");
          setError("Account created! Please sign in.");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 md:p-10">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-white/40 text-sm mt-1">
                  {mode === "login" ? "Sign in to your NeuroTutor" : "Join the future of learning"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className={`text-xs font-medium py-3 px-4 rounded-xl text-center ${error.includes("created") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  data-testid="auth-submit-button"
                  disabled={isLoading}
                  className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-purple-500/40 disabled:opacity-50 mt-4 group"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Get Started"}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                  }}
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-purple-400 font-bold">
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
