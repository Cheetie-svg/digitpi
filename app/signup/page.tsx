"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ROLES = ["Buyer", "Vendor", "Delivery"] as const;
const COUNTRIES = ["Kenya", "Uganda", "Tanzania", "Rwanda"];
const COUNTIES_BY_COUNTRY: Record<string, string[]> = {
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Kajiado", "Other"],
  Uganda: ["Kampala", "Wakiso", "Other"],
  Tanzania: ["Dar es Salaam", "Arusha", "Other"],
  Rwanda: ["Kigali", "Other"],
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof ROLES)[number]>("Buyer");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [poBox, setPoBox] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const counties = country ? COUNTIES_BY_COUNTRY[country] || ["Other"] : [];

  const handleSignup = async () => {
    setError("");
    if (!fullName.trim() || !username.trim() || !phone.trim() || !email.trim() || !password) {
      setError("Please fill all required fields");
      return;
    }
    if (!country || !county || !town.trim()) {
      setError("Please complete location");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.signOut();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError("Signup failed");
        setLoading(false);
        return;
      }

      const isActive = role === "Buyer" || role === "Delivery";
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        role,
        full_name: fullName.trim(),
        username: username.trim(),
        phone: phone.trim(),
        email: email.trim(),
        country,
        county,
        town: town.trim(),
        po_box: poBox.trim() || null,
        is_active: isActive,
        rank_points: role === "Delivery" ? 50 : null,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (role === "Vendor") router.push("/vendor/apply");
      else if (role === "Delivery") router.push("/delivery/orders");
      else router.push("/buyer");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    children: React.ReactNode
  ) => (
    <div>
      <p className="text-[12px] text-[#8B9998] uppercase mb-1">{label}</p>
      {children}
    </div>
  );

  const inputClass =
    "w-full bg-[#1B3338] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white outline-none";

  return (
    <div className="min-h-screen bg-[#0B1C1F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl border border-white/10">
        <div className="bg-[#142A2E] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-[#1B3338] border border-white/10 flex items-center justify-center text-white"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-bold text-white">Create account</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            <div>
              <p className="text-[12px] text-[#8B9998] uppercase mb-2">I am a</p>
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-full text-[12px] font-medium ${
                      role === r
                        ? "bg-[#0F6E76] text-white"
                        : "bg-[#1B3338] border border-white/10 text-[#C7D6D4]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {field("Full name", <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />)}
            {field("Username", <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />)}
            {field("Phone", <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />)}
            {field("Email", <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />)}
            {field("Password", <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />)}

            {field(
              "Country",
              <select value={country} onChange={(e) => { setCountry(e.target.value); setCounty(""); }} className={inputClass}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {country &&
              field(
                "County",
                <select value={county} onChange={(e) => setCounty(e.target.value)} className={inputClass}>
                  <option value="">Select county</option>
                  {counties.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}

            {county && (
              <>
                {field("Town", <input value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Westlands" className={inputClass} />)}
                {field("P.O. Box (optional)", <input value={poBox} onChange={(e) => setPoBox(e.target.value)} className={inputClass} />)}
              </>
            )}

            {error && <p className="text-center text-[13px] text-[#C64435]">{error}</p>}
          </div>

          <div className="px-5 pb-6 space-y-3">
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
            <Link href="/login">
              <p className="text-center text-[13px] text-[#7EB6B8]">Already have an account? Log in</p>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}