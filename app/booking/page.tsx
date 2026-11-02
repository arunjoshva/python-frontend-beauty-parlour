"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createAppointment,
  getAvailableSlots,
  getServices,
  type Service,
  type AppointmentFormData,
} from "@/lib/api";

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [minimumDate, setMinimumDate] = useState("");

  const [formData, setFormData] = useState<AppointmentFormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_id: 0,
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  // Fetch active services when the page loads.
  useEffect(() => {
    async function loadServices() {
      try {
        setLoadingServices(true);
        const data = await getServices();
        setServices(data);

        if (data.length > 0) {
          setFormData((previous) => ({
            ...previous,
            service_id: data[0].id,
          }));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load services.",
        );
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  // Fetch available slots whenever service or date changes.
  useEffect(() => {
    if (!formData.service_id || !formData.appointment_date) {
      setAvailableSlots([]);
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setAvailableSlots([]);
        setError("");

        const data = await getAvailableSlots(
          formData.service_id,
          formData.appointment_date,
        );

        if (!cancelled) {
          setAvailableSlots(data.available_slots);
        }
      } catch (err) {
        if (!cancelled) {
          setAvailableSlots([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load available time slots.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [formData.service_id, formData.appointment_date]);

  useEffect(() => {
    const today = new Date();

    const formattedDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    setMinimumDate(formattedDate);
    }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "service_id" ? Number(value) : value,
      ...(name === "service_id" || name === "appointment_date"
        ? { appointment_time: "" }
        : {}),
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.appointment_time) {
      setError("Please select an available appointment time.");
      return;
    }

    try {
      setSubmitting(true);

      await createAppointment(formData);

      setSuccess(
        "Your appointment request has been submitted successfully!",
      );

      setTimeout(() => (
        setSuccess("")
      ), 3000);

      setFormData((previous) => ({
        ...previous,
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        appointment_date: "",
        appointment_time: "",
        notes: "",
      }));

      setAvailableSlots([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your appointment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-rose">
            Jerusha Beauty Parlour
          </p>

          <h1 className="text-3xl font-bold text-brown sm:text-4xl">
            Book Your Appointment
          </h1>

          <p className="mt-3 text-muted">
            Choose your preferred service, date and time.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-border-soft bg-white p-6 shadow-sm sm:p-10"
        >
          <div>
            <h2 className="mb-5 text-xl font-semibold text-brown">
              Your Details
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="customer_name"
                  className="mb-2 block text-sm font-medium text-brown"
                >
                  Full Name
                </label>

                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-border-soft px-4 py-3 text-brown outline-none focus:border-rose"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="customer_email"
                  className="mb-2 block text-sm font-medium text-brown"
                >
                  Email Address
                </label>

                <input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border-soft px-4 py-3 text-brown outline-none focus:border-rose"
                  placeholder="Enter your email"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="customer_phone"
                  className="mb-2 block text-sm font-medium text-brown"
                >
                  Phone Number
                </label>

                <input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                  minLength={7}
                  maxLength={20}
                  className="w-full rounded-lg border border-border-soft px-4 py-3 text-brown outline-none focus:border-rose"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border-soft pt-6">
            <h2 className="mb-5 text-xl font-semibold text-brown">
              Appointment Details
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="service_id"
                  className="mb-2 block text-sm font-medium text-brown"
                >
                  Select Service
                </label>

                <select
                  id="service_id"
                  name="service_id"
                  value={formData.service_id || ""}
                  onChange={handleChange}
                  required
                  disabled={loadingServices || services.length === 0}
                  className="w-full rounded-lg border border-border-soft bg-white px-4 py-3 text-brown outline-none focus:border-rose disabled:opacity-60"
                >
                  {loadingServices ? (
                    <option value="">Loading services...</option>
                  ) : services.length === 0 ? (
                    <option value="">No services available</option>
                  ) : (
                    services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - ₹{service.price} ({service.duration} minutes)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {formData.service_id !== 0 && (
                <div className="rounded-lg bg-blush-light p-4">
                  {services
                    .filter((service) => service.id === formData.service_id)
                    .map((service) => (
                      <div key={service.id}>
                        <p className="font-semibold text-brown">
                          {service.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {service.description}
                        </p>
                        <p className="mt-2 text-sm font-medium text-rose">
                          ₹{service.price} · {service.duration} minutes
                        </p>
                      </div>
                    ))}
                </div>
              )}

              <div>
                <label
                  htmlFor="appointment_date"
                  className="mb-2 block text-sm font-medium text-brown"
                >
                  Appointment Date
                </label>

                <input
                  id="appointment_date"
                  name="appointment_date"
                  type="date"
                  min={minimumDate}
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border-soft px-4 py-3 text-brown outline-none focus:border-rose"
                />
              </div>

              {formData.appointment_date && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-brown">
                    Available Time Slots
                  </label>

                  {loadingSlots ? (
                    <p className="text-sm text-muted">
                      Checking available time slots...
                    </p>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() =>
                            setFormData((previous) => ({
                              ...previous,
                              appointment_time: slot,
                            }))
                          }
                          className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${
                            formData.appointment_time === slot
                              ? "border-rose bg-rose text-white"
                              : "border-border-soft bg-white text-brown hover:border-rose hover:text-rose"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-blush-light p-4 text-sm text-muted">
                      No available time slots for this date. Please select
                      another date.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-brown"
                >
                  Additional Notes (Optional)
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border-soft px-4 py-3 text-brown outline-none focus:border-rose"
                  placeholder="Any special requests?"
                />
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-4 text-sm text-green-700"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              loadingServices ||
              services.length === 0 ||
              !formData.appointment_time
            }
            className="cursor-pointer w-full rounded-lg bg-rose px-6 py-3 font-semibold text-white transition hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Book Appointment"}
          </button>

          <p className="text-center text-sm text-muted">
            <Link href="/" className="font-medium text-rose hover:underline">
              Back to Home
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}