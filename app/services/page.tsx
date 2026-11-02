
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  duration: number;
  category: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<Service[]>("/api/services/");

      setServices(
        [...response.data].sort((a, b) => b.id - a.id)
      );
    } catch {
      setError("Unable to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  function formatPrice(price: number | string) {
    return Number(price).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="min-h-screen bg-cream text-brown">

      {/* Page Heading */}
      <section className="bg-blush px-6 py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-light">
            Our Beauty Treatments
          </p>

          <h1 className="mt-4 text-3xl font-semibold md:text-5xl">
            Explore Our Services
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted">
            Discover treatments designed to help you look and feel your best.
            Find your favourite service and book your beauty appointment.
          </p>

          <Link
            href="/booking"
            className="mt-7 inline-flex cursor-pointer items-center justify-center rounded-full bg-rose px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-dark"
          >
            Book an Appointment
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10">
            <h2 className="text-2xl font-semibold md:text-3xl">
              All Beauty Services
            </h2>

            <p className="mt-3 leading-7 text-muted">
              Explore our treatments, estimated prices and appointment durations.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <p className="py-10 text-center text-muted">
              Loading services...
            </p>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="py-10 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                onClick={() => {
                  setLoading(true);
                  fetchServices();
                }}
                className="mt-4 cursor-pointer rounded-full bg-rose px-5 py-2 text-sm font-semibold text-white hover:bg-rose-dark"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Service Cards */}
          {!loading && !error && (
            <>
              {services.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <article
                      key={service.id}
                      className="flex flex-col rounded-2xl border border-border-soft bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <span className="w-fit rounded-full bg-blush-light px-3 py-1 text-xs font-semibold text-rose">
                        {service.category}
                      </span>

                      <h3 className="mt-5 text-xl font-semibold">
                        {service.name}
                      </h3>

                      <p className="mt-3 flex-1 leading-7 text-muted">
                        {service.description}
                      </p>

                      {/* Price and Duration */}
                      <div className="mt-6 border-t border-border-soft pt-4">
                        <p className="text-lg font-semibold text-rose">
                          ₹{formatPrice(service.price)}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                          <span aria-hidden="true">◷</span>
                          {service.duration} minutes
                        </p>
                      </div>

                      <Link
                        href="/booking"
                        className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-rose px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-dark"
                      >
                        Book Now
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-muted">
                  No services are currently available.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Booking Call to Action */}
      <section className="px-6 pb-16 md:px-10 md:pb-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-blush px-6 py-12 text-center md:px-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-light">
            Your Moment of Self-Care
          </p>

          <h2 className="mt-4 text-2xl font-semibold md:text-4xl">
            Found Your Perfect Treatment?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">
            Choose your preferred service and continue to appointment booking.
          </p>

          <Link
            href="/booking"
            className="mt-7 inline-flex cursor-pointer items-center justify-center rounded-full bg-rose px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-dark"
          >
            Schedule Your Visit
          </Link>
        </div>
      </section>
    </main>
  );
}