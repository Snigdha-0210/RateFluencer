"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loginUser = useAppStore((state) => state.loginUser);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) return;

    setLoading(true);
    // Mock network request delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    loginUser(isRegister ? name : name || "Alex Chen", email);
    setLoading(false);
    setSuccess(true);

    // Redirect after brief visual check animation
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.1fr",
        minHeight: "100vh",
        background: "#FAFBFC",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {/* Left Column: Branding Showcase */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",
          padding: "60px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating gradient orb for premium Stripe-like look */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)",
            top: -100,
            left: -100,
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
            }}
          >
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.4px" }}>CreatorOS</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>AI Chief Content Officer</div>
          </div>
        </div>

        {/* Value Proposition */}
        <div style={{ maxWidth: 440, position: "relative", zIndex: 1, margin: "60px 0" }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: "#60A5FA",
                marginBottom: 20,
              }}
            >
              <Sparkles size={12} />
              Version 2.0 Personalization Engine
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.25, letterSpacing: "-1px", marginBottom: 20 }}>
              The Ultimate Co-Pilot for Content Creators.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.8, color: "#E2E8F0" }}>
              CreatorOS handles your entire content pipeline. Discover trending niches, analyze audience distributions, generate custom hooks, and forecast virality scores before you press publish.
            </p>
          </motion.div>

          {/* Testimonial snippet */}
          <div style={{ marginTop: 40, borderLeft: "3px solid #2563EB", paddingLeft: 16 }}>
            <p style={{ fontSize: 13.5, fontStyle: "italic", opacity: 0.75, lineHeight: 1.5 }}>
              "CreatorOS feels like having Netflix, Duolingo, and a team of professional marketers in my pocket. Highly recommended!"
            </p>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, color: "#60A5FA" }}>
              Alex Chen · Tech Content Creator
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 12, opacity: 0.4, position: "relative", zIndex: 1 }}>
          © 2026 CreatorOS Inc. All rights reserved. Premium content intelligence.
        </div>
      </div>

      {/* Right Column: Auth Card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="card"
          style={{
            width: "100%",
            maxWidth: 440,
            background: "white",
            padding: "40px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xl)",
            borderRadius: 16,
          }}
        >
          {/* Form Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              {isRegister ? "Create your account" : "Welcome back"}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 6 }}>
              {isRegister ? "Start your 14-day free Content Officer trial" : "Sign in to access your Content Studio"}
            </p>
          </div>

          {/* Form container */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <AnimatePresence mode="popLayout">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                  key="name"
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px 10px 38px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 13.5,
                        color: "var(--text-primary)",
                        background: "#FAFBFC",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#2563EB";
                        e.target.style.background = "white";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border)";
                        e.target.style.background = "#FAFBFC";
                      }}
                    />
                    <User
                      size={15}
                      color="var(--text-muted)"
                      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  placeholder="alex@creatorhq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 13.5,
                    color: "var(--text-primary)",
                    background: "#FAFBFC",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.background = "white";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.background = "#FAFBFC";
                  }}
                />
                <Mail
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Password
                </label>
                {!isRegister && (
                  <a href="#" style={{ fontSize: 11.5, color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>
                    Forgot Password?
                  </a>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 13.5,
                    color: "var(--text-primary)",
                    background: "#FAFBFC",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.background = "white";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.background = "#FAFBFC";
                  }}
                />
                <Lock
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            {!isRegister && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input type="checkbox" id="remember" style={{ cursor: "pointer" }} />
                <label htmlFor="remember" style={{ fontSize: 12.5, color: "var(--text-secondary)", cursor: "pointer" }}>
                  Remember me for 30 days
                </label>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "11px",
                fontSize: 13.5,
                fontWeight: 700,
                justifyContent: "center",
                gap: 8,
                marginTop: 8,
                position: "relative",
                height: 42,
              }}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="pulse-dot" style={{ width: 6, height: 6, background: "white" }} />
                  <span>{isRegister ? "Creating Account..." : "Signing In..."}</span>
                </div>
              ) : success ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10B981" }}>
                  <Check size={14} color="#10B981" strokeWidth={3} />
                  <span style={{ color: "white" }}>Success! Redirecting...</span>
                </div>
              ) : (
                <>
                  <span>{isRegister ? "Register Trial Account" : "Sign In to CreatorOS"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Toggle register vs login */}
          <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 18 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {isRegister ? "Already have an account?" : "New to CreatorOS?"}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setEmail("");
                setPassword("");
                setName("");
              }}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#2563EB",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: 6,
                padding: 0,
              }}
            >
              {isRegister ? "Sign In" : "Create Account"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
