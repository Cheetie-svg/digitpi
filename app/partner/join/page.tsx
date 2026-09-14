"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function PartnerJoinPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleJoin = async () => {
    setError("");
    if (!fullName.trim() || !email.trim() || !password || !orgName.trim()) {
      setError("Please fill required fields");
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

      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        role: "Partner",
        full_name: fullName.trim(),
        username: username.trim() || orgName.trim(),
        phone: phone.trim() || null,
        email: email.trim(),
        is_active: false,
        // optional: store org in a note field if you have one
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#F0F4F3] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0F6E76] text-white text-2xl flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-xl font-bold text-[#142A2E]">Application received</h1>
          <p className="text-sm text-[#6B7A79] mt-3 leading-relaxed">
            Your Partner application for <strong>{orgName}</strong> has been submitted.
            DIGITπ Admin will review it. Typical review: 5–7 working days.
          </p>
          <Link href="/login">
            <button className="mt-6 w-full bg-[#0F6E76] text-white rounded-full py-3 text-sm font-medium">
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F3] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <p className="text-sm text-[#6B7A79]">DIGITπ · Invite only</p>
        <h1 className="text-2xl font-bold text-[#142A2E] mt-1">Partner registration</h1>
        <p className="text-sm text-[#6B7A79] mt-2">
          For water companies and approved organisations. This page is not public signup.
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Organisation name</p>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-[#DCE4E3] rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Contact full name</p>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-[#DCE4E3] rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Username</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-[#DCE4E3] rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Phone</p>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[#DCE4E3] rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#DCE4E3] rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <p className="text-xs text-[#8B9998] uppercase mb-1">Password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#DCE4E3] rounded-xl px-4 py-3 text-sm outline-none"
            />
          </div>

          {error && <p className="text-sm text-[#C64435] text-center">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Partner application"}
          </button>
        </div>
      </div>
    </div>
  );
}