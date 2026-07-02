import siteData from "../data/site-data.json";

async function getContactSettings() {
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SECRET_KEY;
  const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!SB_URL || !SB_KEY || !PROJECT_ID) return null;
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/restaurant_projects?project_id=eq.${PROJECT_ID}&select=extracted_info`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
    );
    const rows = await res.json();
    const info = rows?.[0]?.extracted_info || {};
    return {
      phone: info.phone || "",
      email: info.email || "",
      address: info.address || "",
      opening_hours: info.opening_hours || {},
    };
  } catch {
    return null;
  }
}

export default async function Contact() {
  const { restaurant: def, content } = siteData;
  const s = await getContactSettings();

  const phone = s?.phone || def.phone || "";
  const email = s?.email || def.email || "";
  const address = s?.address || def.address || "";
  const hours = (s && Object.keys(s.opening_hours || {}).length > 0)
    ? s.opening_hours
    : (def.openingHours || {});
  const hasHours = Object.keys(hours).length > 0;
  const hasContact = phone || email || address;

  return (
    <section id="kontakt" className="mx-auto max-w-5xl px-4 py-20">
      <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
        {content.contactHeading || "Kontakt"}
      </h2>
      <div className="mx-auto mt-2 h-1 w-16 rounded bg-terra" />

      <div className={`mt-12 grid gap-10 ${hasHours ? "md:grid-cols-2" : "max-w-md mx-auto"}`}>
        <div className="rounded-2xl bg-sand/60 p-8">
          <h3 className="font-display text-xl font-bold">So finden Sie uns</h3>
          {hasContact ? (
            <ul className="mt-5 space-y-4 text-coffee/85">
              {address && (
                <li className="flex gap-3">
                  <span aria-hidden>📍</span>
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex gap-3">
                  <span aria-hidden>📞</span>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-terra">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex gap-3">
                  <span aria-hidden>✉️</span>
                  <a href={`mailto:${email}`} className="hover:text-terra">{email}</a>
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-coffee/50">Kontaktdaten werden noch eingetragen.</p>
          )}
        </div>

        {hasHours && (
          <div className="rounded-2xl bg-sand/60 p-8">
            <h3 className="font-display text-xl font-bold">Öffnungszeiten</h3>
            <ul className="mt-5 space-y-2">
              {Object.entries(hours).map(([day, time]) => (
                <li key={day} className="flex justify-between gap-4 text-coffee/85">
                  <span>{day}</span>
                  <span className="font-medium">{String(time)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
