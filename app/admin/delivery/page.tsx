"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

function getRank(points: number) {
  if (points >= 70) return "Apex";
  if (points >= 40) return "Vanguard";
  return "Prospect";
}

function getRankColor(rank: string) {
  if (rank === "Apex") return "bg-[#E4F1EE] text-[#0F6E76]";
  if (rank === "Vanguard") return "bg-[#E3F2FD] text-[#1976D2]";
  return "bg-[#FFF3E0] text-[#E4A73B]";
}

export default function AdminDeliveryPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUnits = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Delivery")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setUnits(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleSuspend = async (userId: string, currentlyActive: boolean) => {
    const newValue = !currentlyActive;

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: newValue })
      .eq("user_id", userId);

    if (!error) {
      loadUnits();
    } else {
      alert("Failed to update status: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F3] p-6">
      
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-4">
        <Link 
          href="/admin/main"
          className="px-4 py-2 bg-white rounded-lg text-sm text-[#142A2E] shadow-sm hover:bg-gray-50"
        >
          ← Back to Admin
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#142A2E]">Delivery Units</h1>
          <p className="text-sm text-[#6B7A79]">Track delivery partners, rankings and suspend if needed</p>
        </div>
      </div>

      {/* Ranking Legend */}
      <div className="max-w-6xl mx-auto mb-5 flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-[#E4F1EE] text-[#0F6E76] font-medium">
          Apex (70–100)
        </span>
        <span className="px-3 py-1 rounded-full bg-[#E3F2FD] text-[#1976D2] font-medium">
          Vanguard (40–69)
        </span>
        <span className="px-3 py-1 rounded-full bg-[#FFF3E0] text-[#E4A73B] font-medium">
          Prospect (0–39)
        </span>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-[#142A2E] text-white text-sm font-medium">
          <div>Name</div>
          <div>Phone</div>
          <div>Status</div>
          <div>Rank</div>
          <div>Joined</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-[#8B9998]">Loading delivery units...</div>
        ) : units.length === 0 ? (
          <div className="px-6 py-8 text-center text-[#8B9998]">No delivery units registered yet</div>
        ) : (
          <div className="divide-y divide-[#EEF2F1]">
            {units.map((unit) => {
              const active = unit.is_active !== false;
              const points = 50; // temporary until we store real points
              const rank = getRank(points);

              return (
                <div key={unit.id} className="grid grid-cols-6 gap-4 px-6 py-4 text-sm items-center hover:bg-[#F8FAF9]">
                  <div className="font-medium text-[#142A2E]">
                    {unit.full_name || unit.username || "—"}
                  </div>
                  <div className="text-[#6B7A79]">{unit.phone || "—"}</div>
                  <div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      active
                        ? "bg-[#E4F1EE] text-[#0F6E76]"
                        : "bg-[#FDECEC] text-[#C64435]"
                    }`}>
                      {active ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${getRankColor(rank)}`}>
                      {rank}
                    </span>
                  </div>
                  <div className="text-[#8B9998]">
                    {unit.created_at ? new Date(unit.created_at).toLocaleDateString() : "—"}
                  </div>
                  <div>
                    <button
                      onClick={() => handleSuspend(unit.user_id, active)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${
                        active
                          ? "bg-[#FDECEC] text-[#C64435] hover:bg-[#F9D4D4]"
                          : "bg-[#E4F1EE] text-[#0F6E76] hover:bg-[#D0E8E4]"
                      }`}
                    >
                      {active ? "Suspend" : "Reactivate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}