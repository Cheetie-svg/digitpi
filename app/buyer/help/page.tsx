import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link 
              href="/buyer" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[#142A2E]">←</span>
            </Link>
            <h1 className="text-[16px] font-bold text-[#142A2E]">Help & Support</h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-6">
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[14px] font-medium text-[#142A2E]">How do I place an order?</p>
              <p className="text-[12px] text-[#6B7A79] mt-1">
                Go to Marketplace, choose a product, select quantity, and pay with M-Pesa.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[14px] font-medium text-[#142A2E]">How long does delivery take?</p>
              <p className="text-[12px] text-[#6B7A79] mt-1">
                Most orders are delivered within a few hours depending on your location.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[14px] font-medium text-[#142A2E]">Can I return an item?</p>
              <p className="text-[12px] text-[#6B7A79] mt-1">
                Yes. You have 24 hours after delivery to request a return & refund.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[14px] font-medium text-[#142A2E]">Emergency water problem?</p>
              <p className="text-[12px] text-[#6B7A79] mt-1">
                Use the Emergency Assistant on the home screen for quick guidance.
              </p>
            </div>

            <div className="bg-[#0F6E76] rounded-xl p-4 mt-4">
              <p className="text-white text-[13px] font-medium">Still need help?</p>
              <p className="text-[#BFE0DD] text-[12px] mt-1">
                Contact our Customer Support team.
              </p>
              <p className="text-white text-[13px] mt-3">📞 Call: Your support number</p>
              <p className="text-white text-[13px]">✉️ Email: Your support email</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}