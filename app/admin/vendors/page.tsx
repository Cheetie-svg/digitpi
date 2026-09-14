"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVendors = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "Vendor")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setVendors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleSuspend = async (userId: string, currentlyActive: boolean) => {
    const newValue = !currentlyActive;

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: newValue })
      .eq("user_id", userId);

    if (!error) {
      // Refresh list
      loadVendors();
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
          <h1 className="text-2xl font-bold text-[#142A2E]">Vendors (POS)</h1>
          <p className="text-sm text-[#6B7A79]">Track vendors and suspend accounts if needed</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-[#142A2E] text-white text-sm font-medium">
          <div>Name</div>
          <div>Phone</div>
          <div>Email</div>
          <div>Status</div>
          <div>Joined</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-[#8B9998]">Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="px-6 py-8 text-center text-[#8B9998]">No vendors registered yet</div>
        ) : (
          <div className="divide-y divide-[#EEF2F1]">
            {vendors.map((v) => {
              const active = v.is_active !== false;
              return (
                <div key={v.id} className="grid grid-cols-6 gap-4 px-6 py-4 text-sm items-center hover:bg-[#F8FAF9]">
                  <div className="font-medium text-[#142A2E]">
                    {v.full_name || v.username || "—"}
                  </div>
                  <div className="text-[#6B7A79]">{v.phone || "—"}</div>
                  <div className="text-[#6B7A79] truncate">{v.email || "—"}</div>
                  <div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      active
                        ? "bg-[#E4F1EE] text-[#0F6E76]"
                        : "bg-[#FDECEC] text-[#C64435]"
                    }`}>
                      {active ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div className="text-[#8B9998]">
                    {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
                  </div>
                  <div>
                    <button
                      onClick={() => handleSuspend(v.user_id, active)}
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