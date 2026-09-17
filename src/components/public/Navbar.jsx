
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  MapPin,
  ChevronDown,
} from "lucide-react";

const navigationLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Destinations",
    href: "/destinations",
  },
  {
    label: "Places",
    href: "/places",
  },
  {
    label: "Packages",
    href: "/packages",
  },
  {
    label: "Hotels",
    href: "/hotels",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}

          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <MapPin size={24} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                Explore<span className="text-indigo-600">India</span>
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Travel & Discover
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-7 lg:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTION */}

          <div className="hidden lg:block">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Plan Your Trip
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            onClick={() =>
              setMobileMenuOpen((current) => !current)
            }
            className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>

        </div>

        {/* MOBILE NAVIGATION */}

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="mt-2 rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Plan Your Trip
              </Link>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
}