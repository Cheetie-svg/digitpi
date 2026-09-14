"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VendorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center">
        <p className="text-[#142A2E]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">Vendor Profile</h1>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center mt-4 px-6">
            <div className="w-20 h-20 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-2xl font-bold">
              {(profile?.username || "V").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-[17px] font-semibold text-[#142A2E] mt-3">
              {profile?.username || "Vendor"}
            </h2>
            <p className="text-[13px] text-[#6B7A79]">
              {profile?.role || "Vendor"} Account
            </p>
          </div>

          {/* Details */}
          <div className="mt-6 px-5 space-y-2 flex-1 overflow-y-auto pb-4">
            
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Full Name</p>
              <p className="text-[14px] text-[#142A2E]">{profile?.full_name || "Not set"}</p>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Phone</p>
              <p className="text-[14px] text-[#142A2E]">{profile?.phone || "Not set"}</p>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Email</p>
              <p className="text-[14px] text-[#142A2E]">{profile?.email || "Not set"}</p>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Location</p>
              <p className="text-[14px] text-[#142A2E]">
                {[profile?.town, profile?.county, profile?.country].filter(Boolean).join(", ") || "Not set"}
              </p>
            </div>

            {/* Referral Code */}
            <div className="bg-[#0F6E76] rounded-xl px-4 py-4 mt-2">
              <p className="text-[11px] text-[#BFE0DD] uppercase">Your Referral Code</p>
              <p className="text-xl font-bold text-white mt-1 tracking-wider">
                {profile?.referral_code || "Not set"}
              </p>
              <p className="text-[11px] text-[#BFE0DD] mt-2">
                Share this code with friends and family
              </p>
            </div>

            <Link href="/vendor/products" className="bg-white rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm mt-2">
              <span className="text-[13px] text-[#142A2E]">My Products</span>
              <span className="text-[#8B9998]">›</span>
            </Link>

            <Link href="/vendor/contact" className="bg-white rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm">
              <span className="text-[13px] text-[#142A2E]">Help & Support</span>
              <span className="text-[#8B9998]">›</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full bg-white rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm text-left"
            >
              <span className="text-[13px] text-[#C64435]">Log Out</span>
              <span className="text-[#8B9998]">›</span>
            </button>

          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-[#DCE4E3] bg-white px-6 py-3 flex justify-between items-center">
            <Link href="/vendor/profile" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">👤</span>
              <span className="text-[10px] text-[#0F6E76] font-medium">Profile</span>
            </Link>
            <Link href="/vendor/orders" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">🏠</span>
              <span className="text-[10px] text-[#8B9998]">Home</span>
            </Link>
            <Link href="/vendor/payout" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">💰</span>
              <span className="text-[10px] text-[#8B9998]">Payout</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}