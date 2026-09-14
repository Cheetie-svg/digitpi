"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "vendor" | "partner" | "support">(
    "all"
  );

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", false)
      .in("role", [
        "Vendor",
        "Partner",
        "Support",
        "vendor",
        "partner",
        "support",
        "Customer Support",
      ])
      .order("created_at", { ascending: false });

    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const accept = async (userId: string) => {
    setActionId(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: true })
      .eq("user_id", userId);
    if (error) alert(error.message);
    else await load();
    setActionId(null);
  };

  const reject = async (userId: string) => {
    if (!confirm("Reject this application?")) return;
    setActionId(userId);
    await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("user_id", userId);
    await load();
    setActionId(null);
  };

  const filtered = apps.filter((a) => {
    if (filter === "all") return true;
    const r = (a.role || "").toLowerCase();
    if (filter === "support")
      return r === "support" || r === "customer support";
    return r === filter;
  });

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">New applications</h1>
        <p className="text-sm text-[#9BB5B4] mb-6">
          Vendor · Partner · Support
        </p>

        <div className="flex gap-2 mb-6">
          {(["all", "vendor", "partner", "support"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${
                filter === f ? "bg-[#0F6E76]" : "bg-white/10 text-[#C7D6D4]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-hidden">
          {loading ? (
            <div className="px-6 py-10 text-center text-[#8B9998]">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-10 text-center text-[#8B9998]">
              No pending applications
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((a) => (
                <div
                  key={a.user_id}
                  className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">
                      {a.full_name || a.username || "—"}
                    </p>
                    <p className="text-[12px] text-[#9BB5B4]">
                      {a.role} · {a.email}
                    </p>
                    <p className="text-[11px] text-[#8B9998] mt-1">
                      {(a.role || "").toLowerCase() === "vendor"
                        ? "Send field agents to verify shop (5–7 days)"
                        : "Review application"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => accept(a.user_id)}
                      disabled={actionId === a.user_id}
                      className="px-4 py-2 rounded-xl bg-[#0F6E76] text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => reject(a.user_id)}
                      disabled={actionId === a.user_id}
                      className="px-4 py-2 rounded-xl bg-white/10 text-sm text-[#C64435]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}