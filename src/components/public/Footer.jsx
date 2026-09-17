import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Globe,
  Camera,
  Video,
} from "lucide-react";

const quickLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Destinations",
    href: "/destinations",
  },
  {
    label: "Places to Visit",
    href: "/places",
  },
  {
    label: "Travel Packages",
    href: "/packages",
  },
  {
    label: "Reviews",
    href: "/reviews",
  },
];

const supportLinks = [
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "Hotels & Stays",
    href: "/hotels",
  },
  {
    label: "Transportation",
    href: "/transportation",
  },
  {
    label: "FAQs",
    href: "/faq",
  },
];

const socialLinks = [
  {
    label: "Website",
    href: "#",
    icon: Globe,
  },
  {
    label: "Photos",
    href: "#",
    icon: Camera,
  },
  {
    label: "Videos",
    href: "#",
    icon: Video,
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* MAIN FOOTER */}

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}

          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <MapPin size={22} />
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-white">
                  Explore
                  <span className="text-indigo-400">India</span>
                </h2>

                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Travel & Discover
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
              Discover amazing destinations, explore unforgettable places, and
              plan your next journey with confidence.
            </p>

            {/* SOCIAL LINKS */}

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="rounded-lg bg-slate-800 p-2.5 transition hover:bg-indigo-600 hover:text-white"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Explore More
            </h3>

            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Get In Touch
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-indigo-400" />

                <p className="text-sm leading-6 text-slate-400">
                  Coimbatore, Tamil Nadu, India
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-indigo-400" />

                <p className="text-sm text-slate-400">+91 00000 00000</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-indigo-400" />

                <p className="break-all text-sm text-slate-400">
                  support@example.com
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 pt-2 text-sm font-bold text-indigo-400 transition hover:text-indigo-300"
              >
                Contact our team
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-center text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
          <p>© {new Date().getFullYear()} ExploreIndia. All rights reserved.</p>

          <div className="flex justify-center gap-5 md:justify-end">
            <Link href="/privacy" className="transition hover:text-indigo-400">
              Privacy Policy
            </Link>

            <Link href="/terms" className="transition hover:text-indigo-400">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
