import siteData from "../data/site-data.json";

const links = [
  { href: "#ueber-uns", label: "Über uns" },
  { href: "#speisekarte", label: "Speisekarte" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-coffee/10 bg-cream">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#" className="font-display text-lg font-bold tracking-tight">
          {siteData.restaurant.name}
        </a>
        <ul className="flex gap-6 text-xs font-semibold uppercase tracking-[0.2em] sm:gap-10">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-terra">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
