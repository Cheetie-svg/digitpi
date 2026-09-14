import Link from "next/link";

export default function SupportProfilePage() {
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">Agent Profile</h1>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center mt-4 px-6">
            <div className="w-20 h-20 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-2xl font-bold">
              CS
            </div>
            <h2 className="text-[17px] font-semibold text-[#142A2E] mt-3">Support Agent</h2>
            <p className="text-[13px] text-[#6B7A79]">Customer Service</p>
          </div>

          {/* Agent Details */}
          <div className="mt-8 px-5 space-y-2 flex-1">
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Name</p>
              <p className="text-[14px] text-[#142A2E]">Not set</p>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Phone / Extension</p>
              <p className="text-[14px] text-[#142A2E]">Not set</p>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Agency / Department</p>
              <p className="text-[14px] text-[#142A2E]">Not set</p>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Email</p>
              <p className="text-[14px] text-[#142A2E]">Not set</p>
            </div>

            <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[11px] text-[#8B9998] uppercase">Location</p>
              <p className="text-[14px] text-[#142A2E]">Not set</p>
            </div>

            <Link href="/" className="bg-white rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm mt-4">
              <span className="text-[13px] text-[#C64435]">Log Out</span>
              <span className="text-[#8B9998]">›</span>
            </Link>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-[#DCE4E3] bg-white px-6 py-3 flex justify-between items-center">
            <Link href="/support/profile" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">👤</span>
              <span className="text-[10px] text-[#0F6E76] font-medium">Profile</span>
            </Link>

            <Link href="/support/main" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">🎧</span>
              <span className="text-[10px] text-[#8B9998]">Main</span>
            </Link>

            <Link href="/support/archive" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">📁</span>
              <span className="text-[10px] text-[#8B9998]">Archive</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}