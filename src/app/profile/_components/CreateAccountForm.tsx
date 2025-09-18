"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FaRocket } from "react-icons/fa";

const GUEST_PROFILE_KEY = "guestProfileData";
const GUEST_JOURNAL_ENTRIES_KEY = "guestJournalEntries";

export function CreateAccountForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsSaving(true);
    try {
      const guestProfile = JSON.parse(localStorage.getItem(GUEST_PROFILE_KEY) || "{}");
      const guestJournalEntries = JSON.parse(localStorage.getItem(GUEST_JOURNAL_ENTRIES_KEY) || "[]");

      const payload = {
        email,
        password,
        profile: guestProfile,
        journal_entries: guestJournalEntries,
      };

      const res = await apiFetch("/api/register/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: payload,
      });

      if (!(res.status >= 200 && res.status < 300)) {
        throw new Error(res.data.message || "Failed to create account.");
      }
      
      const { token } = res.data;
      localStorage.setItem("token", token);

      // Clear guest data
      localStorage.removeItem("guestId");
      localStorage.removeItem(GUEST_PROFILE_KEY);
      localStorage.removeItem(GUEST_JOURNAL_ENTRIES_KEY);
      localStorage.removeItem("guestStats");

      toast.success("Account created successfully! Welcome aboard.");
      
      router.push("/dashboard");
      router.refresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="card p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Make it Official? 🚀</h2>
      <p className="text-gray-600 mb-4">
        Don't let your epic progress vanish into the digital ether! Create an account to save your journey to the cloud. You'll get access from any device, and your data will be safer than a dragon's treasure hoard.
      </p>
      <form onSubmit={handleCreateAccount} className="space-y-4">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your-legendary-email@example.com"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Make it match!"
            />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={isSaving} className="btn w-full flex items-center justify-center gap-2">
            <FaRocket /> {isSaving ? "Launching..." : "Save My Progress & Create Account"}
          </button>
        </div>
      </form>
    </section>
  );
}
