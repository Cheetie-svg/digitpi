"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function getRank(points: number) {
  if (points >= 67) return "Apex";
  if (points >= 34) return "Vanguard";
  return "Prospect";
}

export default function DeliveryProfilePage() {
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

  const points = Number(profile?.rank_points ?? 50);
  const rank = getRank(points);

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col">
          
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-white">Profile</h1>
            <p className="text-[12px] text-[#9BB5B4]">Delivery unit</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            {loading ? (
              <p className="text-center text-[#8B9998] text-[13px]">Loading...</p>
            ) : (
              <>
                <div className="bg-[#1B3338] border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-[#8B9998] uppercase">Rank</p>
                  <p className="text-[18px] font-bold text-[#7EB6B8] mt-1">
                    {rank}
                  </p>
                  <p className="text-[12px] text-[#9BB5B4] mt-1">
                    {points.toFixed(1)} / 100 points
                  </p>
                  <div className="h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                    <div
                      className="h-full bg-[#0F6E76] rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, points))}%`,
                      }}
                    />
                  </div>
                </div>

                {[
                  ["Full name", profile?.full_name],
                  ["Username", profile?.username],
                  ["Email", profile?.email],
                  ["Phone", profile?.phone],
                  ["Town", profile?.town],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3"
                  >
                    <p className="text-[11px] text-[#8B9998] uppercase">
                      {label}
                    </p>
                    <p className="text-[13px] text-white mt-0.5">
                      {(value as string) || "—"}
                    </p>
                  </div>
                ))}

                <a href="tel:+254700000000">
                  <div className="bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-[#7EB6B8]">
                    Call support
                  </div>
                </a>
                <a href="mailto:support@digitpi.com">
                  <div className="bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-[#7EB6B8]">
                    Email support
                  </div>
                </a>

                <button
                  onClick={logout}
                  className="w-full py-3 rounded-full border border-[#C64435] text-[#C64435] text-[13px] font-medium"
                >
                  Log out
                </button>
              </>
            )}
          </div>

          <div className="border-t border-white/10 bg-[#1B3338] px-6 py-3 flex justify-between">
            <Link href="/delivery/profile" className="text-center">
              <div className="text-xl">👤</div>
              <div className="text-[10px] text-[#7EB6B8] font-medium">Profile</div>
            </Link>
            <Link href="/delivery/orders" className="text-center">
              <div className="text-xl">🚚</div>
              <div className="text-[10px] text-[#8B9998]">Jobs</div>
            </Link>
            <Link href="/delivery/completed" className="text-center">
              <div className="text-xl">✓</div>
              <div className="text-[10px] text-[#8B9998]">Completed</div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}