// src/app/admin/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StatCard } from "../dashboard/_components/StatCard"; // Reusing the StatCard component
import { AdminSkeleton } from "./_components/AdminSkeleton";
import { FaBook, FaCalendarAlt, FaChartBar, FaUsers } from "react-icons/fa";

// Define the shape of the admin overview data
type AdminOverview = {
  total_users: number;
  total_journal_entries: number;
  active_users_this_week: number;
  entries_this_week: number;
  entries_this_month: number;
};

export default function AdminPage() {
  const [overviewData, setOverviewData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeader = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return undefined;
    return { Authorization: `Bearer ${token}` };
  }, []);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/admin/overview", { headers: authHeader() });

      if (res.status === 403) {
        throw new Error("You do not have permission to view this page.");
      }
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Failed to fetch admin data: ${res.statusText}`);
      }

      const data: AdminOverview = res.data;
      setOverviewData(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (loading) {
    return <AdminSkeleton />;
  }

  if (error || !overviewData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
        <div className="card border-red-500 text-red-700">
          <p className="font-bold">Access Denied or Error:</p>
          <p>{error || "Could not load admin overview data."}</p>
          <a href="/dashboard" className="btn mt-4">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-lg text-gray-600 mt-1">
            A high-level look at system-wide statistics.
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={overviewData.total_users}
              icon={<FaUsers className="text-purple-500" />}
            />
            <StatCard
              title="Total Journal Entries"
              value={overviewData.total_journal_entries}
              icon={<FaBook className="text-blue-500" />}
            />
             <StatCard
              title="Active Users This Week"
              value={overviewData.active_users_this_week}
              icon={<FaChartBar className="text-green-500" />}
            />
            <StatCard
              title="Entries This Week"
              value={overviewData.entries_this_week}
              icon={<FaCalendarAlt className="text-orange-500" />}
              isSmall={true}
            />
            <StatCard
              title="Entries This Month"
              value={overviewData.entries_this_month}
              icon={<FaCalendarAlt className="text-red-500" />}
              isSmall={true}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
