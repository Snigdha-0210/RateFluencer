"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight, ArrowLeft, Check, CheckCircle2, User, Globe, Users, Target, Loader2 } from "lucide-react";

const CATEGORIES = [
  "AI", "Technology", "Business", "Finance", "Startups", "Creator Economy", "Marketing", "Productivity", "Education",
  "Career", "Programming", "Coding", "Software Engineering", "Science", "Space", "History", "Politics", "Religion",
  "Current Affairs", "Travel", "Tourism", "Food", "Street Food", "Cooking", "Recipes", "Fitness", "Gym", "Sports",
  "Cricket", "Football", "Basketball", "Tennis", "Movies", "TV Shows", "OTT", "Anime", "Gaming", "Pets", "Animals",
  "Nature", "Wildlife", "Luxury", "Fashion", "Beauty", "Lifestyle", "Relationships", "Psychology", "Motivation",
  "Self Improvement", "Books", "Podcasts", "News", "Entertainment", "Memes", "Vlogging", "Personal Stories",
  "College Life", "Study Tips", "Entrepreneurship", "Side Hustles", "Investing", "Real Estate", "Health", "Mental Health",
  "Parenting", "Photography", "Art", "Music", "Dance", "Culture", "Local Trends", "Global Trends"
];

const OCCUPATIONS = [
  "Student", "College Student", "Software Engineer", "Doctor", "Teacher", "Founder", "Freelancer",
  "Content Creator", "Marketer", "Designer", "Government Employee", "Business Owner", "Entrepreneur", "All"
];

const REGIONS = ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East", "Africa", "Global"];
const AGE_GROUPS = ["Gen Z (13-24)", "Millennials (25-40)", "Gen X (41-56)", "Boomers (57+)", "All Ages"];
const GENDERS = ["Male", "Female", "Non-Binary", "Other", "Prefer Not To Say", "All Genders"];

export default function ProfileOnboarding() {
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const setCreatorProfile = useAppStore((state) => state.setCreatorProfile);
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(creatorProfile.category || "AI");
  const [countries, setCountries] = useState(creatorProfile.countries.join(", "));
  const [region, setRegion] = useState(creatorProfile.regions[0] || "North America");
  const [ageGroup, setAgeGroup] = useState(creatorProfile.ageGroups[0] || "Gen Z (13-24)");
  const [gender, setGender] = useState(creatorProfile.genders[0] || "All Genders");
  const [interests, setInterests] = useState(creatorProfile.interests.join(", "));
  const [occupation, setOccupation] = useState(creatorProfile.occupations[0] || "Software Engineers");

  useEffect(() => {
    async function checkProfile() {
      if (status === "unauthenticated") {
        setIsLoading(false);
        return;
      }
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/profile");
          const data = await res.json();
          if (data?.profile?.onboardingCompleted) {
            setCreatorProfile({ completed: true });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    checkProfile();
  }, [status, setCreatorProfile]);

  if (isLoading) return null; // or a spinner
  if (creatorProfile.completed || status === "unauthenticated") return null;

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSaving(true);
      // Save and Complete
      const countryList = countries.split(",").map((s) => s.trim()).filter(Boolean);
      const interestList = interests.split(",").map((s) => s.trim()).filter(Boolean);

      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            countries: countryList.length > 0 ? countryList : ["United States"],
            regions: [region],
            ageGroups: [ageGroup],
            genders: [gender],
            interests: interestList.length > 0 ? interestList : ["Technology"],
            occupations: [occupation]
          }),
        });

        setCreatorProfile({
          completed: true,
          category,
          countries: countryList.length > 0 ? countryList : ["United States"],
          regions: [region],
          ageGroups: [ageGroup],
          genders: [gender],
          interests: interestList.length > 0 ? interestList : ["Technology"],
          occupations: [occupation]
        });
      } catch (e) {
        console.error("Failed to save onboarding", e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepsData = [
    { title: "Define Your Niche", desc: "Select the primary category for your content channel", icon: User },
    { title: "Target Geography", desc: "Where does your target audience live?", icon: Globe },
    { title: "Target Demographics", desc: "Age and gender segments for custom scripts", icon: Users },
    { title: "Audience Profession & Interests", desc: "Align hook tone with their background", icon: Target }
  ];

  const CurrentIcon = stepsData[step - 1].icon;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 22, 41, 0.45)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card"
        style={{
          width: "100%",
          maxWidth: 500,
          background: "white",
          padding: 0,
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        {/* Header Progress */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-subtle)", background: "#FAFBFC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #BFDBFE"
                }}
              >
                <Sparkles size={13} color="#2563EB" />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-primary)" }}>Creator Setup Wizard</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>Step {step} of 4</span>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 99,
                  background: s <= step ? "var(--accent)" : "#E2E8F0",
                  transition: "background 0.3s"
                }}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ padding: "24px 28px", minHeight: 250, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CurrentIcon size={16} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{stepsData[step - 1].title}</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{stepsData[step - 1].desc}</p>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {step === 1 && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Primary Content Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.4 }}>
                  💡 Mapped category details will drive trending briefings and script recommendations.
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Target Countries</label>
                  <input
                    type="text"
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="e.g. United States, India, United Kingdom"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "white", outline: "none" }}
                  />
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>Separate multiple countries with commas</span>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Target Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Target Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                  >
                    {AGE_GROUPS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Target Gender Focus</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Target Occupation Focus</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                  >
                    {OCCUPATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Target Interests / Keywords</label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. Technology, Startups, Personal Finance"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "white", outline: "none" }}
                  />
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>Separate multiple interests with commas</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", background: "#FAFBFC" }}>
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="btn btn-secondary"
            style={{ fontSize: 13, opacity: step === 1 ? 0.4 : 1, cursor: step === 1 ? "not-allowed" : "pointer", padding: "8px 14px" }}
          >
            <ArrowLeft size={13} />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ fontSize: 13, padding: "8px 18px", gap: 6, opacity: isSaving ? 0.7 : 1 }}
          >
            {step === 4 ? (
              isSaving ? <Loader2 size={13} className="animate-spin" /> : <>
                <Check size={13} />
                Save Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
