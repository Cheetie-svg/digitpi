import Link from "next/link";

const folders = [
  { date: "2026-08-23", label: "Today", orders: 0, sales: "KSh 0" },
  { date: "2026-08-22", label: "Yesterday", orders: 18, sales: "KSh 74,200" },
  { date: "2026-08-21", label: "21 Aug 2026", orders: 14, sales: "KSh 51,800" },
  { date: "2026-08-20", label: "20 Aug 2026", orders: 22, sales: "KSh 89,450" },
  { date: "2026-08-19", label: "19 Aug 2026", orders: 11, sales: "KSh 42,300" },
];

export default function AdminArchivePage() {
  return (
    <div className="min-h-screen bg-[#F0F4F3] p-6">
      
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/main"
            className="px-4 py-2 bg-white rounded-lg text-sm text-[#142A2E] shadow-sm hover:bg-gray-50"
          >
            ← Back to Admin
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#142A2E]">Order Archive</h1>
            <p className="text-sm text-[#6B7A79]">Daily folders of completed orders</p>
          </div>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {folders.map((folder) => (
          <div 
            key={folder.date}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-[#142A2E]">{folder.label}</p>
                <p className="text-sm text-[#8B9998] mt-0.5">{folder.date}</p>
              </div>
              <span className="text-[#8B9998]">›</span>
            </div>

            <div className="flex gap-6 mt-4 pt-3 border-t border-[#EEF2F1]">
              <div>
                <p className="text-xs text-[#8B9998]">Orders</p>
                <p className="text-lg font-bold text-[#142A2E]">{folder.orders}</p>
              </div>
              <div>
                <p className="text-xs text-[#8B9998]">Sales Value</p>
                <p className="text-lg font-bold text-[#0F6E76]">{folder.sales}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}