import Link from "next/link";

export default function DeliveryContactPage() {
  // Replace with your real Customer Support details
  const supportPhone = "+254140211109";
  const supportEmail = "hydrosmartexpress263@gmail.com";

  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-3">
            <Link 
              href="/delivery/profile" 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <span className="text-[#142A2E]">←</span>
            </Link>
            <h1 className="text-[16px] font-bold text-[#142A2E]">Help & Support</h1>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 pt-4 space-y-4">
            
            <p className="text-[13px] text-[#6B7A79]">
              Need help? Contact our Customer Support team.
            </p>

            {/* Call Button */}
            <a 
              href={`tel:${supportPhone}`}
              className="block bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-lg">
                  📞
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#142A2E]">Call Customer Support</p>
                  <p className="text-[12px] text-[#6B7A79]">{supportPhone}</p>
                </div>
              </div>
            </a>

            {/* Email Button */}
            <a 
              href={`mailto:${supportEmail}?subject=Delivery Support Request - DIGITπ`}
              className="block bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#0F6E76] flex items-center justify-center text-white text-lg">
                  ✉️
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#142A2E]">Email Us</p>
                  <p className="text-[12px] text-[#6B7A79]">{supportEmail}</p>
                </div>
              </div>
            </a>

          </div>

        </div>
      </div>
    </div>
  );
}