"use client";

import { useState, useEffect, useRef } from "react";

const inputCls = "w-full border border-coffee/20 bg-cream px-3 py-2 text-coffee outline-none focus:border-terra rounded";
const btnCls = "bg-terra px-5 py-2.5 text-sm text-cream transition-colors hover:bg-terradark disabled:opacity-40 rounded";

const IMAGE_SLOTS = [
  { key: "hero", label: "Hero (Kapak Fotoğrafı)" },
  { key: "about", label: "Hakkımızda Görseli" },
  { key: "gallery_1", label: "Galeri 1" },
  { key: "gallery_2", label: "Galeri 2" },
  { key: "gallery_3", label: "Galeri 3" },
];

function api(path, key, init = {}) {
  return fetch(path, {
    ...init,
    headers: { "x-admin-key": key, ...(init.headers || {}) },
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Fehler");
    return data;
  });
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("bilder");
  const [loginError, setLoginError] = useState("");

  async function login(e) {
    e.preventDefault();
    setLoginError("");
    try {
      await api("/api/admin/images", adminKey);
      sessionStorage.setItem("adminKey", adminKey);
      setAuthed(true);
    } catch {
      setLoginError("Falsches Passwort.");
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("adminKey");
    if (saved) {
      api("/api/admin/images", saved)
        .then(() => { setAdminKey(saved); setAuthed(true); })
        .catch(() => sessionStorage.removeItem("adminKey"));
    }
  }, []);

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-4 py-24">
        <h1 className="text-center font-display text-3xl font-semibold text-coffee">Admin-Bereich</h1>
        <form onSubmit={login} className="mt-8 space-y-4">
          <input type="password" placeholder="Admin-Passwort" value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)} className={inputCls} autoFocus />
          {loginError && <p className="text-center text-sm text-red-700">{loginError}</p>}
          <button className={`${btnCls} w-full`}>Anmelden</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold text-coffee">Admin-Bereich</h1>
        <button onClick={() => { sessionStorage.removeItem("adminKey"); setAuthed(false); }}
          className="text-sm text-coffee/50 hover:text-coffee">Abmelden</button>
      </div>

      <div className="flex gap-2 border-b border-coffee/15 mb-6 flex-wrap">
        {[["bilder", "🖼 Bilder"], ["einstellungen", "⚙️ Einstellungen"], ["support", "💬 Support"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm ${tab === id ? "border-b-2 border-terra font-semibold text-coffee" : "text-coffee/50"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "bilder" && <BilderTab adminKey={adminKey} />}
      {tab === "einstellungen" && <EinstellungenTab adminKey={adminKey} />}
      {tab === "support" && <SupportTab adminKey={adminKey} />}
    </main>
  );
}

function BilderTab({ adminKey }) {
  const [images, setImages] = useState({});
  const [uploading, setUploading] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api("/api/admin/images", adminKey).then((d) => setImages(d.images || {}));
  }, [adminKey]);

  async function upload(slotKey, file) {
    setUploading((p) => ({ ...p, [slotKey]: true }));
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("key", slotKey);
      fd.append("file", file);
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages((p) => ({ ...p, [slotKey]: data.url }));
      setMsg("✓ Hochgeladen!");
    } catch (e) {
      setMsg("Fehler: " + e.message);
    } finally {
      setUploading((p) => ({ ...p, [slotKey]: false }));
    }
  }

  async function remove(slotKey) {
    if (!confirm("Dieses Bild entfernen?")) return;
    await fetch(`/api/admin/images?key=${slotKey}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    setImages((p) => { const n = { ...p }; delete n[slotKey]; return n; });
  }

  return (
    <div className="space-y-5">
      {msg && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">{msg}</p>}
      {IMAGE_SLOTS.map(({ key, label }) => (
        <ImageSlot
          key={key}
          slotKey={key}
          label={label}
          url={images[key]}
          uploading={!!uploading[key]}
          onUpload={(file) => upload(key, file)}
          onRemove={() => remove(key)}
        />
      ))}
    </div>
  );
}

function ImageSlot({ slotKey, label, url, uploading, onUpload, onRemove }) {
  const fileRef = useRef(null);
  return (
    <div className="border border-coffee/15 rounded-lg p-4">
      <p className="text-sm font-medium text-coffee mb-3">{label}</p>
      {url ? (
        <div className="flex items-start gap-3">
          <img src={url} alt={slotKey} className="h-24 w-36 object-cover rounded border border-coffee/10" />
          <div className="flex flex-col gap-2">
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className={btnCls}>Ersetzen</button>
            <button onClick={onRemove}
              className="text-xs text-red-600 hover:underline">Entfernen</button>
          </div>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className={`${btnCls} w-full`}>
          {uploading ? "Lädt hoch…" : "📁 Bild hochladen"}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
    </div>
  );
}

const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

function EinstellungenTab({ adminKey }) {
  const [form, setForm] = useState({ phone: "", email: "", address: "", opening_hours: {} });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api("/api/admin/settings", adminKey)
      .then((d) => setForm({ phone: d.phone || "", email: d.email || "", address: d.address || "", opening_hours: d.opening_hours || {} }))
      .finally(() => setLoading(false));
  }, [adminKey]);

  async function save(e) {
    e.preventDefault();
    setMsg("");
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(form),
      });
      setMsg("✓ Gespeichert!");
    } catch (e) {
      setMsg("Fehler: " + e.message);
    }
  }

  function setHour(day, val) {
    setForm((p) => ({ ...p, opening_hours: { ...p.opening_hours, [day]: val } }));
  }

  if (loading) return <p className="text-coffee/50 text-sm">Lädt…</p>;

  return (
    <form onSubmit={save} className="space-y-6 max-w-lg">
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-coffee">Kontaktdaten</h3>
        <input type="tel" placeholder="Telefon (z.B. +49 30 12345678)" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
        <input type="email" placeholder="E-Mail" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        <textarea placeholder="Adresse" value={form.address} rows={2}
          onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
      </div>

      <div className="space-y-2">
        <h3 className="font-display font-semibold text-coffee">Öffnungszeiten</h3>
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <span className="w-28 text-sm text-coffee/70 shrink-0">{day}</span>
            <input type="text" placeholder="Ruhetag oder 11:00 – 22:00"
              value={form.opening_hours[day] || ""}
              onChange={(e) => setHour(day, e.target.value)}
              className={`${inputCls} text-sm`} />
          </div>
        ))}
      </div>

      {msg && <p className={`text-sm ${msg.startsWith("✓") ? "text-green-700" : "text-red-600"}`}>{msg}</p>}
      <button type="submit" className={btnCls}>Speichern</button>
    </form>
  );
}

function SupportTab({ adminKey }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/admin/support", adminKey)
      .then((d) => setMessages(d.messages || []))
      .finally(() => setLoading(false));
  }, [adminKey]);

  async function markRead(id) {
    await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ id, status: "read" }),
    });
    setMessages((p) => p.map((m) => m.id === id ? { ...m, status: "read" } : m));
  }

  if (loading) return <p className="text-coffee/50 text-sm">Lädt…</p>;

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-coffee/40">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm">Noch keine Nachrichten</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={`border rounded-lg p-4 ${m.status === "new" ? "border-terra/40 bg-terra/5" : "border-coffee/10 bg-cream"}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm text-coffee">{m.name} {m.email ? `(${m.email})` : ""}</p>
              <p className="text-xs text-coffee/50 mt-0.5">{new Date(m.created_at).toLocaleString("de-DE")}</p>
            </div>
            {m.status === "new" && (
              <button onClick={() => markRead(m.id)}
                className="text-xs px-2 py-1 border border-coffee/20 rounded hover:bg-coffee/5 shrink-0">
                Als gelesen markieren
              </button>
            )}
          </div>
          <p className="text-sm text-coffee mt-3 whitespace-pre-wrap">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
