"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function BuyerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const row = (label: string, value: string) => (
    <div className="rounded-xl bg-[#1B3338] border border-white/10 px-4 py-3">
      <p className="text-xs text-[#8B9998] uppercase">{label}</p>
      <p className="text-sm mt-0.5">{value || "—"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-xl mx-auto p-6 lg:p-10">
        <Link href="/buyer" className="text-sm text-[#7EB6B8]">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Profile</h1>

        {loading ? (
          <p className="text-[#8B9998]">Loading...</p>
        ) : (
          <div className="space-y-3">
            {row("Full name", profile?.full_name)}
            {row("Username", profile?.username)}
            {row("Email", profile?.email)}
            {row("Phone", profile?.phone)}
            {row("Country", profile?.country)}
            {row("County", profile?.county)}
            {row("Town", profile?.town)}
            {row("P.O. Box", profile?.po_box)}
            {row(
              "Referral code",
              profile?.referral_code || profile?.user_id?.slice(0, 8)
            )}

            <Link href="/buyer/returns">
              <div className="rounded-xl bg-[#1B3338] border border-white/10 px-4 py-3 text-[#7EB6B8]">
                Return / Replace →
              </div>
            </Link>

            <button
              onClick={logout}
              className="w-full py-3 rounded-xl border border-[#C64435] text-[#C64435] text-sm font-medium"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}