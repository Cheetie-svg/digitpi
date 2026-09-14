import Link from "next/link";

const partners = [
  { id: "PAR-01", name: "NCWSC", code: "PARTNER001", pacs: 48, earnings: "KSh 124,500", status: "Active" },
  { id: "PAR-02", name: "RUJWASCO", code: "PARTNER002", pacs: 31, earnings: "KSh 87,200", status: "Active" },
  { id: "PAR-03", name: "Kiambu Water", code: "PARTNER003", pacs: 19, earnings: "KSh 52,800", status: "Active" },
  { id: "PAR-04", name: "Thika Utilities", code: "PARTNER004", pacs: 7, earnings: "KSh 18,400", status: "Pending" },
];

export default function AdminPartnersPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F3] p-6">
      
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-4">
        <Link 
          href="/admin/main"
          className="px-4 py-2 bg-white rounded-lg text-sm text-[#142A2E] shadow-sm hover:bg-gray-50"
        >
          ← Back to Admin
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#142A2E]">Partners / Referrals</h1>
          <p className="text-sm text-[#6B7A79]">View partner performance and commissions</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-[#142A2E] text-white text-sm font-medium">
          <div>ID</div>
          <div>Organisation</div>
          <div>Referral Code</div>
          <div>PACs</div>
          <div>Total Earnings</div>
          <div>Status</div>
        </div>

        <div className="divide-y divide-[#EEF2F1]">
          {partners.map((p) => (
            <div key={p.id} className="grid grid-cols-6 gap-4 px-6 py-4 text-sm items-center hover:bg-[#F8FAF9]">
              <div className="font-medium text-[#142A2E]">{p.id}</div>
              <div className="text-[#142A2E]">{p.name}</div>
              <div className="text-[#0F6E76] font-medium">{p.code}</div>
              <div className="text-[#6B7A79]">{p.pacs}</div>
              <div className="font-semibold text-[#0F6E76]">{p.earnings}</div>
              <div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  p.status === "Active" 
                    ? "bg-[#E4F1EE] text-[#0F6E76]" 
                    : "bg-[#FFF3E0] text-[#E4A73B]"
                }`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}