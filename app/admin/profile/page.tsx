"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type MagazineRow = {
  year: number;
  url: string | null;
  locked: boolean;
};

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  const [companyName, setCompanyName] = useState("DIGITπ");
  const [founderName, setFounderName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [liveDate, setLiveDate] = useState("");
  const [apiNotes, setApiNotes] = useState("");

  // Simple stored maps as JSON strings in profile (works without extra tables)
  const [magazineMap, setMagazineMap] = useState<Record<string, string>>({});
  const [legalFiles, setLegalFiles] = useState<{ name: string; url: string }[]>([]);

  const [panel, setPanel] = useState<"home" | "magazine" | "legal" | "api">("home");
  const [openYear, setOpenYear] = useState<number | null>(null);
  const [yearLink, setYearLink] = useState("");
  const [legalName, setLegalName] = useState("");
  const [legalUrl, setLegalUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setCompanyName(profile.company_name || "DIGITπ");
        setFounderName(profile.founder_name || profile.full_name || "");
        setContactEmail(profile.contact_email || profile.email || "");
        setContactPhone(profile.contact_phone || profile.phone || "");
        setLiveDate(profile.live_date ? String(profile.live_date).slice(0, 10) : "");
        setApiNotes(profile.api_notes || "");

        try {
          if (profile.magazine_json) {
            setMagazineMap(JSON.parse(profile.magazine_json));
          } else if (profile.magazine_url && profile.magazine_year) {
            setMagazineMap({ [profile.magazine_year]: profile.magazine_url });
          }
        } catch {
          setMagazineMap({});
        }

        try {
          if (profile.legal_json) {
            setLegalFiles(JSON.parse(profile.legal_json));
          } else if (profile.legal_doc_url) {
            setLegalFiles([{ name: "Legal document", url: profile.legal_doc_url }]);
          }
        } catch {
          setLegalFiles([]);
        }
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const magazineYears: MagazineRow[] = useMemo(() => {
    const nowY = new Date().getFullYear();
    const startY = liveDate ? new Date(liveDate).getFullYear() : nowY;
    if (Number.isNaN(startY)) {
      return [{ year: nowY, url: magazineMap[String(nowY)] || null, locked: false }];
    }
    const rows: MagazineRow[] = [];
    // From launch year through next year (future locked)
    for (let y = startY; y <= nowY + 1; y++) {
      rows.push({
        year: y,
        url: magazineMap[String(y)] || null,
        locked: y > nowY,
      });
    }
    return rows;
  }, [liveDate, magazineMap]);

  const anniversaryText = useMemo(() => {
    if (!liveDate) return null;
    const live = new Date(liveDate);
    if (Number.isNaN(live.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - live.getFullYear();
    const m = now.getMonth() - live.getMonth();
    const d = now.getDate() - live.getDate();
    if (m < 0 || (m === 0 && d < 0)) years -= 1;
    if (years < 1) return "First anniversary not reached yet.";
    const isDay =
      now.getDate() === live.getDate() && now.getMonth() === live.getMonth();
    if (isDay) {
      return `Anniversary: ${years} year${years > 1 ? "s" : ""} live today. Publish this year’s magazine.`;
    }
    return `About ${years} year${years > 1 ? "s" : ""} since go-live.`;
  }, [liveDate]);

  const saveCore = async () => {
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyName.trim() || null,
        founder_name: founderName.trim() || null,
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        live_date: liveDate || null,
        api_notes: apiNotes.trim() || null,
        magazine_json: JSON.stringify(magazineMap),
        legal_json: JSON.stringify(legalFiles),
        role: "Admin",
        is_active: true,
      })
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message + " (add magazine_json / legal_json text columns if missing)");
    } else {
      setMessage("Saved");
    }
    setSaving(false);
  };

  const saveYearMagazine = async () => {
    if (openYear == null) return;
    if (!yearLink.trim()) {
      setMessage("Paste a magazine link (PDF recommended)");
      return;
    }
    const next = { ...magazineMap, [String(openYear)]: yearLink.trim() };
    setMagazineMap(next);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ magazine_json: JSON.stringify(next) })
      .eq("user_id", userId);
    setSaving(false);
    if (error) setMessage(error.message);
    else setMessage(`Magazine ${openYear} saved`);
  };

  const addLegal = async () => {
    if (!legalName.trim() || !legalUrl.trim()) {
      setMessage("Name and file link required");
      return;
    }
    const next = [...legalFiles, { name: legalName.trim(), url: legalUrl.trim() }];
    setLegalFiles(next);
    setLegalName("");
    setLegalUrl("");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ legal_json: JSON.stringify(next) })
      .eq("user_id", userId);
    setSaving(false);
    if (error) setMessage(error.message);
    else setMessage("Legal file added");
  };

  const removeLegal = async (idx: number) => {
    const next = legalFiles.filter((_, i) => i !== idx);
    setLegalFiles(next);
    await supabase
      .from("profiles")
      .update({ legal_json: JSON.stringify(next) })
      .eq("user_id", userId);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#142A2E] flex items-center justify-center">
        <p className="text-white">Loading company profile...</p>
      </div>
    );
  }

  // —— Magazine reader (simple book frame + print) ——
  if (panel === "magazine" && openYear != null && magazineMap[String(openYear)]) {
    const src = magazineMap[String(openYear)];
    return (
      <div className="min-h-screen bg-[#142A2E] p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setOpenYear(null)}
              className="text-sm text-[#C7D6D4]"
            >
              ← Back to years
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[#0F6E76] text-white text-sm"
              >
                Print
              </button>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm"
              >
                Open file
              </a>
            </div>
          </div>
          <div className="bg-[#0B1C1F] rounded-2xl p-4 shadow-2xl">
            <p className="text-center text-[#C7D6D4] text-sm mb-3">
              DIGITπ Magazine · {openYear}
            </p>
            <div className="bg-[#EEF2F1] rounded-xl overflow-hidden min-h-[70vh]">
              <iframe title={`magazine-${openYear}`} src={src} className="w-full h-[70vh]" />
            </div>
            <p className="text-center text-[11px] text-[#8B9998] mt-3">
              Flip through pages in the PDF viewer. Use Print for a physical copy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#142A2E] text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin/main" className="text-sm text-[#7EB6B8]">
              ← Dashboard
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold mt-1">Company control</h1>
            <p className="text-sm text-[#9BB5B4] mt-1">
              {companyName || "DIGITπ"} · founder workspace
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveCore}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#0F6E76] text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-sm"
            >
              Log out
            </button>
          </div>
        </div>

        {anniversaryText && (
          <div className="mb-6 rounded-xl bg-[#0F6E76]/30 border border-[#0F6E76] px-4 py-3 text-sm text-[#C7F0E8]">
            {anniversaryText}
          </div>
        )}

        {message && (
          <div className="mb-4 text-sm text-[#C7F0E8]">{message}</div>
        )}

        {/* Nav chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["home", "Overview"],
              ["magazine", "Company magazine"],
              ["legal", "Legal documents"],
              ["api", "API & integrations"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setPanel(key);
                setOpenYear(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                panel === key
                  ? "bg-[#0F6E76] text-white"
                  : "bg-white/10 text-[#C7D6D4]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW — desktop grid */}
        {panel === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#C7F0E8]">Identity</h2>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">Company name</p>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">Founder</p>
                <input
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">Go-live date</p>
                <input
                  type="date"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-[#C7F0E8]">
                Public customer contact
              </h2>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">Contact email</p>
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-[#8B9998] uppercase mb-1">Contact phone</p>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
                />
              </div>
              <p className="text-[12px] text-[#8B9998]">
                Same number/email buyers see for support.
              </p>
            </div>

            <button
              onClick={() => setPanel("magazine")}
              className="rounded-2xl bg-[#0F6E76] p-6 text-left hover:brightness-110 transition"
            >
              <p className="text-xs uppercase text-white/70">Library</p>
              <p className="text-xl font-semibold mt-1">Company magazine →</p>
              <p className="text-sm text-white/80 mt-2">
                Year by year from launch. Future years stay locked.
              </p>
            </button>

            <button
              onClick={() => setPanel("legal")}
              className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 text-left hover:border-[#0F6E76] transition"
            >
              <p className="text-xs uppercase text-[#8B9998]">Compliance</p>
              <p className="text-xl font-semibold mt-1">Legal documents →</p>
              <p className="text-sm text-[#9BB5B4] mt-2">
                {legalFiles.length} file(s) in the company folder
              </p>
            </button>
          </div>
        )}

        {/* MAGAZINE YEARS */}
        {panel === "magazine" && openYear == null && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Company magazine by year</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {magazineYears.map((row) => (
                <button
                  key={row.year}
                  disabled={row.locked}
                  onClick={() => {
                    if (row.locked) return;
                    setOpenYear(row.year);
                    setYearLink(row.url || "");
                  }}
                  className={`rounded-2xl p-5 text-left border transition ${
                    row.locked
                      ? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                      : row.url
                      ? "bg-[#0F6E76] border-[#0F6E76]"
                      : "bg-[#1B3338] border-white/10 hover:border-[#0F6E76]"
                  }`}
                >
                  <p className="text-2xl font-bold">{row.year}</p>
                  <p className="text-xs mt-2 text-white/80">
                    {row.locked
                      ? "Frozen · not yet"
                      : row.url
                      ? "Open magazine"
                      : "Empty · upload"}
                  </p>
                </button>
              ))}
            </div>
            {!liveDate && (
              <p className="text-sm text-[#E4A73B] mt-4">
                Set go-live date on Overview so years start from launch.
              </p>
            )}
          </div>
        )}

        {/* MAGAZINE YEAR EDITOR */}
        {panel === "magazine" && openYear != null && !magazineMap[String(openYear)] && (
          <div className="max-w-xl rounded-2xl bg-[#1B3338] border border-white/10 p-6 space-y-4">
            <button onClick={() => setOpenYear(null)} className="text-sm text-[#7EB6B8]">
              ← Years
            </button>
            <h2 className="text-xl font-semibold">Magazine {openYear}</h2>
            <p className="text-sm text-[#9BB5B4]">
              Upload your PDF to Drive/Storage, then paste the public link. It opens as a
              readable book with print.
            </p>
            <input
              value={yearLink}
              onChange={(e) => setYearLink(e.target.value)}
              placeholder="https://...magazine.pdf"
              className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
            />
            <button
              onClick={saveYearMagazine}
              className="px-5 py-3 rounded-xl bg-[#0F6E76] text-sm font-medium"
            >
              Save magazine for {openYear}
            </button>
          </div>
        )}

        {panel === "magazine" && openYear != null && magazineMap[String(openYear)] && (
          <div className="max-w-xl rounded-2xl bg-[#1B3338] border border-white/10 p-6 space-y-4">
            <button onClick={() => setOpenYear(null)} className="text-sm text-[#7EB6B8]">
              ← Years
            </button>
            <h2 className="text-xl font-semibold">Magazine {openYear}</h2>
            <button
              onClick={() => {
                /* reader mode uses same openYear + map */
                setPanel("magazine");
              }}
              className="w-full py-3 rounded-xl bg-[#0F6E76] text-sm font-medium"
              onMouseDown={(e) => {
                // force reader by ensuring map has url — already does
              }}
            >
              Open as book
            </button>
            <p className="text-xs text-[#8B9998]">
              Tip: click Open as book — reader is the full-page view above when a URL exists.
            </p>
            <input
              value={yearLink || magazineMap[String(openYear)]}
              onChange={(e) => setYearLink(e.target.value)}
              className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
            />
            <button
              onClick={saveYearMagazine}
              className="px-5 py-3 rounded-xl bg-white/10 text-sm"
            >
              Replace file link
            </button>
            <button
              onClick={() => {
                // open reader: ensure yearLink synced
                setYearLink(magazineMap[String(openYear)]);
              }}
              className="w-full py-3 rounded-xl bg-[#0F6E76] text-sm font-medium"
            >
              <a
                href={magazineMap[String(openYear)]}
                className="block"
                onClick={(e) => {
                  e.preventDefault();
                  // trigger reader branch by keeping openYear and url in map
                  window.scrollTo(0, 0);
                  // Reader renders when openYear && magazineMap[year]
                  // Force re-render path: set a dummy state
                  setMessage("Opening reader…");
                  setTimeout(() => setMessage(""), 300);
                }}
              >
                Read / Print magazine
              </a>
            </button>
          </div>
        )}

        {/* LEGAL FOLDER */}
        {panel === "legal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Company legal folder</h2>
              {legalFiles.length === 0 ? (
                <p className="text-sm text-[#8B9998]">No files yet</p>
              ) : (
                <ul className="space-y-2">
                  {legalFiles.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#142A2E] px-4 py-3"
                    >
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#7EB6B8] truncate"
                      >
                        {f.name}
                      </a>
                      <button
                        onClick={() => removeLegal(i)}
                        className="text-xs text-[#C64435]"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 space-y-3">
              <h2 className="text-lg font-semibold">Add file</h2>
              <p className="text-[12px] text-[#8B9998]">
                Upload to Drive/Supabase Storage, then paste the link (importable path).
              </p>
              <input
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="File name e.g. Certificate of incorporation"
                className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
              />
              <input
                value={legalUrl}
                onChange={(e) => setLegalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none"
              />
              <button
                onClick={addLegal}
                className="px-5 py-3 rounded-xl bg-[#0F6E76] text-sm font-medium"
              >
                Add to folder
              </button>
            </div>
          </div>
        )}

        {/* API — cleaner ops board */}
        {panel === "api" && (
          <div className="rounded-2xl bg-[#1B3338] border border-white/10 p-6 max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold text-[#C7F0E8]">
              Integrations board
            </h2>
            <p className="text-sm text-[#9BB5B4]">
              Operational checklist only. Real secret keys stay in server environment
              variables — never in the browser.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                "M-Pesa / payments webhook",
                "SMS / OTP provider",
                "Maps / delivery location",
                "Email (support inbox)",
                "Storage (magazines & legal)",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-[#C7D6D4]"
                >
                  {label}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-[#8B9998] uppercase mb-1">Notes</p>
              <textarea
                value={apiNotes}
                onChange={(e) => setApiNotes(e.target.value)}
                rows={6}
                className="w-full rounded-xl bg-[#142A2E] border border-white/10 px-4 py-3 text-sm outline-none resize-none"
                placeholder="Status notes, which env vars are set, who owns each integration..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}