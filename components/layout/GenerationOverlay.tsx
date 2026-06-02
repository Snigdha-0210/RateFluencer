"use client";

import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, Cpu } from "lucide-react";

const STEPS = [
  "Analyzing Topic",
  "Finding Audience",
  "Generating Hook",
  "Writing Script",
  "Creating Captions",
  "Building Assets",
  "Predicting Virality",
  "Finalizing Reel"
];

export default function GenerationOverlay() {
  const isGenerating = useAppStore((state) => state.isGenerating);
  const generationStep = useAppStore((state) => state.generationStep);

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 22, 41, 0.6)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="card"
            style={{
              width: "100%",
              maxWidth: 440,
              padding: "32px 36px",
              background: "white",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.7)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Ambient background glow */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.15) 100%)",
                filter: "blur(40px)",
                pointerEvents: "none"
              }}
            />

            {/* Icon & Title */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 10px 20px rgba(37,99,235,0.25)"
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                >
                  <Cpu size={24} color="white" />
                </motion.div>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F1629", letterSpacing: "-0.5px" }}>
                AI Chief Content Officer
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Sparkles size={12} color="#7C3AED" />
                Orchestrating production pipeline...
              </p>
            </div>

            {/* Steps Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {STEPS.map((step, idx) => {
                const isCompleted = idx < generationStep;
                const isActive = idx === generationStep;

                return (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      opacity: isCompleted || isActive ? 1 : 0.4,
                      transition: "opacity 0.3s ease"
                    }}
                  >
                    {/* Status Circle */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: isCompleted
                          ? "1px solid #10B981"
                          : isActive
                          ? "1px solid #2563EB"
                          : "1px solid var(--border)",
                        background: isCompleted ? "#F0FDF4" : isActive ? "#EFF6FF" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      {isCompleted ? (
                        <Check size={11} color="#10B981" strokeWidth={3} />
                      ) : isActive ? (
                        <Loader2 className="animate-spin" size={11} color="#2563EB" strokeWidth={3} />
                      ) : (
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-muted)" }} />
                      )}
                    </div>

                    {/* Step Label */}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#2563EB" : isCompleted ? "#0F1629" : "var(--text-muted)",
                        transition: "color 0.3s ease"
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                <span>PROGRESS</span>
                <span>{Math.round((generationStep / 8) * 100)}%</span>
              </div>
              <div className="progress-track" style={{ height: 6, background: "#F1F5F9" }}>
                <motion.div
                  className="progress-fill"
                  style={{
                    background: "linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)",
                    height: "100%"
                  }}
                  animate={{ width: `${(generationStep / 8) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
