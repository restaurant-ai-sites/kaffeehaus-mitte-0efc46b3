import siteData from "../data/site-data.json";

async function getImageOverrides() {
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SECRET_KEY;
  const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!SB_URL || !SB_KEY || !PROJECT_ID) return {};
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/site_images?project_id=eq.${PROJECT_ID}&select=image_key,url`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" }
    );
    const rows = await res.json();
    const map = {};
    (rows || []).forEach((r) => { map[r.image_key] = r.url; });
    return map;
  } catch {
    return {};
  }
}

export default async function Hero() {
  const { restaurant, content, images: defaultImages } = siteData;
  const overrides = await getImageOverrides();
  const images = { ...defaultImages, ...overrides };

  return (
    <section className="relative overflow-hidden border-b border-coffee/10">
      {/* Dekoratif arka plan halkası */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-terra/5" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sand/40" />

      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2">
        <div style={{ animation: "fadeUp 0.9s ease-out both" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-terra/30 bg-terra/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-terra">
            <span className="h-1.5 w-1.5 rounded-full bg-terra" />
            {restaurant.cuisine || restaurant.tagline}
          </span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
            {content.welcomeHeading || restaurant.name}
          </h1>

          {content.welcomeSubtext && (
            <p className="mt-6 max-w-md text-lg leading-relaxed text-coffee/70">
              {content.welcomeSubtext}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a
              href="#speisekarte"
              className="group inline-flex items-center gap-2 bg-coffee px-8 py-4 text-sm font-semibold uppercase tracking-wider text-cream shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-terra hover:shadow-xl"
            >
              Zur Speisekarte
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#kontakt"
              className="text-sm font-semibold underline decoration-terra decoration-2 underline-offset-8 transition-colors hover:text-terra"
            >
              Kontakt aufnehmen
            </a>
          </div>
        </div>

        <div className="relative" style={{ animation: "fadeUp 0.9s ease-out 0.2s both" }}>
          {/* Offset çerçeve */}
          <div className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl border-2 border-terra/30" />
          {images.hero ? (
            <img
              src={images.hero}
              alt={restaurant.name}
              className="relative h-[62vh] w-full rounded-3xl object-cover shadow-2xl"
            />
          ) : (
            <div className="relative flex h-[62vh] w-full items-center justify-center rounded-3xl bg-sand shadow-2xl">
              <span className="font-display text-8xl font-bold text-coffee/10">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Yüzen rozet */}
          <div className="absolute -bottom-6 left-8 rounded-2xl bg-cream px-6 py-4 shadow-xl">
            <p className="font-display text-lg font-bold text-coffee">{restaurant.name}</p>
            <p className="text-xs uppercase tracking-widest text-terra">{restaurant.tagline || restaurant.cuisine}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
