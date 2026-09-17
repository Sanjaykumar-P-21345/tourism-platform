"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Compass,
  Globe,
  Mail,
  MapPin,
  Phone,
  Video,
} from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Destinations", href: "/destinations" },
  { name: "Packages", href: "/packages" },
  { name: "Reviews", href: "/reviews" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600">
              <Compass size={24} />
            </div>

            <span className="text-xl font-bold">
              Explore India
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-gray-400">
            Discover amazing destinations, explore unique
            experiences, and plan unforgettable journeys.
          </p>

          <p className="mt-5 flex items-center gap-2 text-sm text-gray-400">
            <Globe size={16} />
            Explore the world with us
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-base font-semibold">
            Quick Links
          </h3>

          <ul className="mt-5 space-y-3">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-400 transition hover:text-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-base font-semibold">
            Explore
          </h3>

          <ul className="mt-5 space-y-4 text-sm text-gray-400">
            <li className="flex items-center gap-3">
              <MapPin
                size={17}
                className="text-indigo-400"
              />
              Beautiful Destinations
            </li>

            <li className="flex items-center gap-3">
              <Camera
                size={17}
                className="text-indigo-400"
              />
              Travel Photo Galleries
            </li>

            <li className="flex items-center gap-3">
              <Video
                size={17}
                className="text-indigo-400"
              />
              Memorable Experiences
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-base font-semibold">
            Contact Us
          </h3>

          <ul className="mt-5 space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-indigo-400"
              />

              <span>India</span>
            </li>

            <li className="flex items-center gap-3">
              <Phone
                size={17}
                className="shrink-0 text-indigo-400"
              />

              <span>+91 00000 00000</span>
            </li>

            <li className="flex items-start gap-3">
              <Mail
                size={17}
                className="mt-0.5 shrink-0 text-indigo-400"
              />

              <span>contact@example.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Explore India. All
            rights reserved.
          </p>

          <Link
            href="/contact"
            className="flex items-center gap-1 transition hover:text-white"
          >
            Plan Your Trip
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </footer>
  );
}