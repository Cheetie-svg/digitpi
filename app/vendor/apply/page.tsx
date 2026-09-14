"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function VendorApplyPage() {
  const router = useRouter();
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const requestVerification = async () => {
    if (!terms || !privacy) {
      setMessage("Please agree to Terms and Privacy Policy");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Keep vendor inactive until Admin approves
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("user_id", user.id);

      if (error) {
        setMessage(error.message);
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Success / congratulations screen
  if (done) {
    return (
      <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
          <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col px-6 py-8">
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-2xl mb-4">
                ✓
              </div>

              <h1 className="text-xl font-bold text-[#142A2E]">
                Congratulations!
              </h1>

              <p className="text-[13px] text-[#6B7A79] mt-4 leading-relaxed">
                Your request for field verification has been submitted successfully.
              </p>

              <p className="text-[13px] text-[#6B7A79] mt-3 leading-relaxed">
                DIGITπ field agents will visit to verify your shop’s authenticity.
                Once approved, your vendor account will be activated and ready to use.
              </p>

              <p className="text-[13px] text-[#0F6E76] font-medium mt-4 leading-relaxed">
                This usually takes 5–7 working days.
              </p>
            </div>

            <Link href="/login">
              <button className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main apply form
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">
              Vendor Verification
            </h1>
            <p className="text-[12px] text-[#6B7A79] mt-1">
              Complete the requirements below to request verification
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            
            <div className="bg-white rounded-xl p-4 shadow-sm text-[13px] text-[#142A2E] leading-relaxed space-y-2">
              <p className="font-semibold">Requirements</p>
              <p>• Valid business or personal identification</p>
              <p>• Ability to supply quality plumbing & hardware products</p>
              <p>• Reliable stock availability</p>
              <p>• Agree to DIGITπ pricing and supply terms</p>
              <p>• Pass field verification by our team</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm text-[13px] text-[#6B7A79] leading-relaxed">
              <p className="font-semibold text-[#142A2E] mb-1">What happens next?</p>
              After you submit your request, our Customer Service team will review it.
              You may be contacted for field verification. Once approved, you will get
              full access to the Vendor dashboard.
            </div>

            <label className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[13px] text-[#142A2E]">
                I agree to the Terms & Conditions
              </span>
            </label>

            <label className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                className="mt-1"
              />
              <span className="text-[13px] text-[#142A2E]">
                I agree to the Privacy Policy
              </span>
            </label>

            {message && (
              <p className="text-center text-[13px] text-[#C64435]">{message}</p>
            )}
          </div>

          <div className="px-5 pb-6">
            <button
              onClick={requestVerification}
              disabled={submitting}
              className="w-full bg-[#0F6E76] text-white rounded-full py-3.5 text-[14px] font-medium disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Request Field Verification"}
            </button>
            <p className="text-center text-[11px] text-[#8B9998] mt-2">
              You will be notified once your application is reviewed
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}