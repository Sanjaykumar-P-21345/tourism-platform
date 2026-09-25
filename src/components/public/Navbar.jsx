"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Menu,
  Plane,
  Search,
  X,
} from "lucide-react";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Destinations",
    href: "/destinations",
  },
  {
    label: "Packages",
    href: "/packages",
  },
  {
    label: "Hotels",
    href: "/hotels",
  },
  // {
  //   label: "Food & Travel",
  //   href: "/food-travel",
  // },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto max-w-[1450px] px-5 pt-5 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          {/* =================================================
              LOGO
              ================================================= */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <Globe2
                size={51}
                strokeWidth={1.7}
                className="text-[#08795f]"
              />

              <Plane
                size={25}
                strokeWidth={2.5}
                className="absolute -right-1 -top-1 rotate-[-25deg] fill-[#08795f] text-[#08795f]"
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-[28px] font-black leading-none tracking-[-1.2px] text-[#075847]">
                SST Travels
              </div>

              <div className="mt-1 text-[12px] font-medium tracking-wide text-[#28695d]">
                Explore&nbsp; • &nbsp;Discover&nbsp; • &nbsp;Experience
              </div>
            </div>
          </Link>

          {/* =================================================
              DESKTOP NAV
              ================================================= */}

          <div className="hidden items-center gap-7 lg:flex xl:gap-9">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-2 text-[14px] font-semibold text-[#124f45] transition-colors hover:text-[#07805f]"
              >
                {link.label}

                {link.label === "Home" && (
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[#07805f]" />
                )}

                {link.label !== "Home" && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-[#07805f] transition-all duration-300 group-hover:w-full" />
                )}
              </Link>
            ))}
          </div>

          {/* =================================================
              RIGHT ACTIONS
              ================================================= */}

          <div className="hidden items-center gap-5 lg:flex">
            {/* <button
              type="button"
              aria-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#075847] transition-all hover:bg-white/60"
            >
              <Search size={22} />
            </button> */}

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#075847] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(0,60,45,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#064c3e]"
            >
              <Plane size={18} />
              Plan Your Trip
            </Link>
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
              ================================================= */}

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/65 text-[#075847] shadow-sm backdrop-blur-md lg:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* =================================================
            MOBILE MENU
            ================================================= */}

        {mobileOpen && (
          <div className="mt-4 rounded-[25px] border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur-xl lg:hidden">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-[#075847] hover:bg-[#eaf8f3]"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#075847] px-5 py-3.5 text-sm font-bold text-white"
              >
                <Plane size={17} />
                Plan Your Trip
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}