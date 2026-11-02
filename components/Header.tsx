"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="relative border-b border-border-soft bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="text-xl font-bold text-rose sm:text-2xl"
        >
          Jerusha Beauty Parlour
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="font-medium text-brown transition-colors hover:text-rose"
          >
            Home
          </Link>

          <Link
            href="/services"
            className="font-medium text-brown transition-colors hover:text-rose"
          >
            Services
          </Link>

          <Link
            href="/booking"
            className="rounded-full bg-rose px-4 py-2 font-medium text-white transition-colors hover:bg-rose-dark"
          >
            Book Now
          </Link>

          <Link
            href="/admin/login"
            className="rounded-full border border-rose px-4 py-2 font-medium text-rose transition-colors hover:bg-rose hover:text-white"
          >
            Admin Login
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className="group flex h-11 w-11 items-center justify-center rounded-xl border border-border-soft bg-white transition-colors hover:bg-blush md:hidden"
        >
          <span className="relative flex h-5 w-6 flex-col items-center justify-between">

            {/* Top Line */}
            <span
              className={`h-0.5 w-6 rounded-full bg-rose transition-all duration-300 ease-in-out ${
                isMenuOpen
                  ? "translate-y-2.25 rotate-45"
                  : ""
              }`}
            />

            {/* Middle Line */}
            <span
              className={`h-0.5 w-6 rounded-full bg-rose transition-all duration-200 ease-in-out ${
                isMenuOpen
                  ? "scale-x-0 opacity-0"
                  : "scale-x-100 opacity-100"
              }`}
            />

            {/* Bottom Line */}
            <span
              className={`h-0.5 w-6 rounded-full bg-rose transition-all duration-300 ease-in-out ${
                isMenuOpen
                  ? "-translate-y-2.25 -rotate-45"
                  : ""
              }`}
            />

          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={`absolute left-0 right-0 top-full z-50 overflow-hidden border-b border-border-soft bg-cream shadow-lg transition-[max-height,opacity,transform] duration-300 ease-in-out motion-reduce:transition-none md:hidden ${
          isMenuOpen
            ? "max-h-[380px] translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-6">

          <div className="rounded-2xl border border-border-soft bg-white p-4 shadow-sm">

            {/* Home */}
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center justify-between rounded-xl px-4 py-3 font-medium text-brown transition-colors hover:bg-blush-light hover:text-rose"
            >
              Home
              <span className="text-rose">→</span>
            </Link>

            {/* Services */}
            <Link
              href="/services"
              onClick={closeMenu}
              className="flex items-center justify-between rounded-xl px-4 py-3 font-medium text-brown transition-colors hover:bg-blush-light hover:text-rose"
            >
              Services
              <span className="text-rose">→</span>
            </Link>

            <div className="my-3 border-t border-border-soft" />

            {/* Book Now */}
            <Link
              href="/booking"
              onClick={closeMenu}
              className="block rounded-xl bg-rose px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-rose-dark"
            >
              Book Your Appointment
            </Link>

            {/* Admin Login */}
            <Link
              href="/admin/login"
              onClick={closeMenu}
              className="mt-3 block rounded-xl border border-rose px-5 py-3 text-center font-medium text-rose transition-colors hover:bg-blush-light"
            >
              Admin Login
            </Link>

          </div>

        </nav>
      </div>
    </header>
  );
}