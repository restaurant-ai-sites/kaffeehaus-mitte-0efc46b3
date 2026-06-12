import siteData from "../data/site-data.json";

export default function Hero() {
  const { restaurant, content, images } = siteData;

  return (
    <section className="border-b border-coffee/10">
      <div className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terra">
            {restaurant.cuisine || restaurant.tagline}
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {content.welcomeHeading || restaurant.name}
          </h1>
          {content.welcomeSubtext && (
            <p className="mt-6 max-w-md text-lg leading-relaxed text-coffee/70">
              {content.welcomeSubtext}
            </p>
          )}
          <div className="mt-10 flex items-center gap-6">
            <a
              href="#speisekarte"
              className="bg-coffee px-8 py-4 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-terra"
            >
              Zur Speisekarte
            </a>
            <a href="#kontakt" className="text-sm font-semibold underline underline-offset-4 hover:text-terra">
              Kontakt
            </a>
          </div>
        </div>

        {images.hero ? (
          <img
            src={images.hero}
            alt={restaurant.name}
            className="h-[60vh] w-full object-cover"
          />
        ) : (
          <div className="flex h-[60vh] w-full items-center justify-center bg-sand">
            <span className="font-display text-8xl font-bold text-coffee/10">
              {restaurant.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
