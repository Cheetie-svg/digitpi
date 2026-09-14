import Link from "next/link";

const folders = [
  {
    date: "2026-08-13",
    label: "Today",
    complaints: 4,
    returns: 1,
  },
  {
    date: "2026-08-12",
    label: "Yesterday",
    complaints: 7,
    returns: 2,
  },
  {
    date: "2026-08-11",
    label: "11 Aug 2026",
    complaints: 3,
    returns: 0,
  },
  {
    date: "2026-08-10",
    label: "10 Aug 2026",
    complaints: 5,
    returns: 1,
  },
];

export default function SupportArchivePage() {
  return (
    <div className="min-h-screen bg-[#DCE4E3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#142A2E] rounded-[2.5rem] p-2.5 shadow-2xl">
        <div className="bg-[#EEF2F1] rounded-[2rem] overflow-hidden min-h-[620px] flex flex-col">
          
          {/* Header */}
          <div className="px-5 pt-6 pb-3">
            <h1 className="text-[16px] font-bold text-[#142A2E]">Archive</h1>
            <p className="text-[12px] text-[#6B7A79] mt-0.5">
              Daily folders of completed cases
            </p>
          </div>

          {/* Folder List */}
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-4">
            {folders.map((folder) => (
              <div
                key={folder.date}
                className="bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-[#142A2E]">
                      {folder.label}
                    </p>
                    <p className="text-[11px] text-[#8B9998] mt-0.5">
                      {folder.date}
                    </p>
                  </div>
                  <span className="text-[#8B9998]">›</span>
                </div>

                <div className="flex gap-4 mt-3 pt-2 border-t border-[#F0F4F3]">
                  <div>
                    <p className="text-[11px] text-[#8B9998]">Complaints</p>
                    <p className="text-[14px] font-medium text-[#142A2E]">
                      {folder.complaints}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#8B9998]">Returns</p>
                    <p className="text-[14px] font-medium text-[#C64435]">
                      {folder.returns}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-[#DCE4E3] bg-white px-6 py-3 flex justify-between items-center">
            <Link href="/support/profile" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">👤</span>
              <span className="text-[10px] text-[#8B9998]">Profile</span>
            </Link>

            <Link href="/support/main" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">🎧</span>
              <span className="text-[10px] text-[#8B9998]">Main</span>
            </Link>

            <Link href="/support/archive" className="flex flex-col items-center gap-0.5">
              <span className="text-xl">📁</span>
              <span className="text-[10px] text-[#0F6E76] font-medium">Archive</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}