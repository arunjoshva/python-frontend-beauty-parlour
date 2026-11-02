
"use client";

import Image from "next/image";
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

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<Service[]>("/api/services/");

      // Show the latest three services first.
      const latestServices = [...response.data]
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);

      setServices(latestServices);
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

      {/* Hero Section */}
      <section className="w-full">
        <Link href="/booking" className="cursor-pointer">
          <Image
            src="/jerusha-beauty-parlour.webp"
            alt="Jerusha Beauty Parlour - Where Beauty Meets Confidence"
            width={1920}
            height={1080}
            priority
            sizes="100vw"
            className="h-auto w-full cursor-pointer"
          />
        </Link>
      </section>

      {/* Services Section */}
      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">

          {/* Section Heading */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-light">
              Our Treatments
            </p>

            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
              Discover Our Beauty Services
            </h2>

            <p className="mt-4 leading-7 text-muted">
              From rejuvenating facials to professional hair styling,
              discover the perfect treatment for you at Jerusha Beauty Parlour.
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
                      {/* Service Icon */}
                      <div
                        aria-hidden="true"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-blush-light text-2xl text-rose"
                      >
                        ✿
                      </div>

                      {/* Service Details */}
                      <span className="mt-5 w-fit rounded-full bg-blush-light px-3 py-1 text-xs font-semibold text-rose">
                        {service.category}
                      </span>

                      <h3 className="mt-2 text-xl font-semibold">
                        {service.name}
                      </h3>

                      <p className="mt-3 flex-1 leading-7 text-muted">
                        {service.description}
                      </p>

                      {/* Price and Duration */}
                      <div className="mt-5 border-t border-border-soft pt-4">
                        <p className="font-semibold text-rose">
                          ₹{formatPrice(service.price)}
                        </p>

                        <p className="mt-1 text-sm text-muted">
                          {service.duration} minutes
                        </p>
                      </div>

                      {/* Booking Navigation */}
                      <Link
                        href="/booking"
                        className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-rose px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-dark"
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

          {/* View All Services */}
          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-rose px-6 py-3 text-sm font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
            >
              Explore All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Call to Action */}
      <section className="bg-blush px-6 py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-light">
            Your Moment of Self-Care
          </p>

          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            Ready for a Little Pampering?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">
            Choose your favourite beauty treatment and book an appointment
            for a relaxing beauty experience.
          </p>

          <Link
            href="/booking"
            className="mt-7 inline-flex cursor-pointer items-center justify-center rounded-full bg-rose px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-dark"
          >
            Book an Appointment
          </Link>
        </div>
      </section>
    </main>
  );
}
