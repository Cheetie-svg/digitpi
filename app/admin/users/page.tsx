"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFilter = (searchParams.get("role") || "all").toLowerCase();
  const [users, setUsers] = useState<any[]>([]);
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
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const filtered = users.filter((u) => {
    const r = (u.role || "").toLowerCase();
    if (roleFilter === "all") return true;
    if (roleFilter === "support")
      return r === "support" || r === "customer support";
    return r === roleFilter;
  });

  const title =
    roleFilter === "all"
      ? "All users"
      : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) + "s";

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2">{title}</h1>
        <p className="text-sm text-[#9BB5B4] mb-6">{filtered.length} profile(s)</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "buyer", "vendor", "delivery", "partner", "support"].map(
            (r) => (
              <Link
                key={r}
                href={r === "all" ? "/admin/users" : `/admin/users?role=${r}`}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  roleFilter === r
                    ? "bg-[#0F6E76] text-white"
                    : "bg-white/10 text-[#C7D6D4]"
                }`}
              >
                {r}
              </Link>
            )
          )}
        </div>

        <div className="rounded-2xl bg-[#1B3338] border border-white/10 overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-6 gap-3 px-6 py-4 text-xs uppercase text-[#8B9998] border-b border-white/10">
              <div>Name</div>
              <div>Role</div>
              <div>Contact</div>
              <div>User ID</div>
              <div>Active</div>
              <div>Joined</div>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#8B9998]">No users</div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <div
                    key={u.user_id || u.id}
                    className="grid grid-cols-6 gap-3 px-6 py-4 text-sm items-start"
                  >
                    <div>
                      <p className="font-medium">
                        {u.full_name || u.username || "—"}
                      </p>
                      <p className="text-[11px] text-[#8B9998]">{u.username}</p>
                    </div>
                    <div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0F6E76]/40 text-[#C7F0E8]">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#9BB5B4]">
                      <p>{u.email || "—"}</p>
                      <p>{u.phone || ""}</p>
                    </div>
                    <div className="text-[11px] text-[#8B9998] break-all">
                      {u.user_id || "—"}
                    </div>
                    <div
                      className={
                        u.is_active !== false
                          ? "text-[#7EB6B8] text-[12px]"
                          : "text-[#C64435] text-[12px]"
                      }
                    >
                      {u.is_active !== false ? "Yes" : "No / Pending"}
                    </div>
                    <div className="text-[12px] text-[#8B9998]">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#142A2E] text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}