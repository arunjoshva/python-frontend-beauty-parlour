
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { adminLogout } from "@/lib/admin";

type Appointment = {
  id: number;
  customer_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  service: {
    id: number;
    name: string;
    price: number | string;
    duration: number;
    category: string;
  };
};

export default function AdminDashboard() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<Appointment[]>("/api/appointments/");
      setAppointments(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.replace("/admin/login");
        return;
      }

      setError(
        error.response?.data?.detail ||
          "Unable to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function updateStatus(id: number, newStatus: string) {
    try {
      setUpdatingId(id);

      await api.patch(`/api/appointments/${id}/status`, null, {
        params: { new_status: newStatus },
      });

      await fetchAppointments();
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          "Unable to update appointment status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function cancelAppointment(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);

      await api.patch(`/api/appointments/${id}/cancel`);

      await fetchAppointments();
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          "Unable to cancel appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function logout() {
    try {
      await adminLogout();
    } catch {
      // Continue to the login page if the logout request fails.
    } finally {
      router.replace("/admin/login");
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("");
  }

  // Summary counts
  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;

  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesSearch =
        search === "" ||
        appointment.id.toString().includes(search) ||
        appointment.customer.name.toLowerCase().includes(search) ||
        appointment.customer.email.toLowerCase().includes(search) ||
        appointment.customer.phone.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        appointment.status === statusFilter;

      const matchesDate =
        dateFilter === "" ||
        appointment.appointment_date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    dateFilter !== "";

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-cream">
        <p className="text-muted">Loading appointments...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brown sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted">
              Manage your parlour appointments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/services"
              className="cursor-pointer rounded-lg bg-rose px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-dark"
            >
              Manage Services
            </Link>

            <Link
              href="/admin/customers"
              className="cursor-pointer rounded-lg border border-border-soft px-4 py-2 text-sm font-medium text-brown transition hover:bg-blush"
            >
              Manage Customers
            </Link>

            <button
              onClick={logout}
              className="cursor-pointer rounded-lg border border-border-soft px-4 py-2 text-sm font-medium text-brown transition hover:bg-blush"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>

            <button
              onClick={() => {
                setLoading(true);
                fetchAppointments();
              }}
              className="cursor-pointer font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <SummaryCard title="Total" value={totalAppointments} />
          <SummaryCard title="Pending" value={pendingAppointments} />
          <SummaryCard title="Confirmed" value={confirmedAppointments} />
          <SummaryCard title="Completed" value={completedAppointments} />
        </div>

        {/* Appointments Section */}
        <section className="overflow-hidden rounded-2xl border border-border-soft bg-white">

          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-border-soft px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-brown">
              Appointments
            </h2>

            <button
              onClick={fetchAppointments}
              className="cursor-pointer text-sm font-medium text-rose hover:underline"
            >
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-4 border-b border-border-soft p-4 sm:p-6">

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {/* Search */}
              <div>
                <label
                  htmlFor="appointment-search"
                  className="mb-1.5 block text-sm font-medium text-brown"
                >
                  Search Appointments
                </label>

                <input
                  id="appointment-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Name, email, phone or ID"
                  className="w-full rounded-lg border border-border-soft px-3 py-2.5 text-sm text-brown outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label
                  htmlFor="status-filter"
                  className="mb-1.5 block text-sm font-medium text-brown"
                >
                  Filter by Status
                </label>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-border-soft bg-white px-3 py-2.5 text-sm text-brown outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label
                  htmlFor="date-filter"
                  className="mb-1.5 block text-sm font-medium text-brown"
                >
                  Filter by Appointment Date
                </label>

                <input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-border-soft bg-white px-3 py-2.5 text-sm text-brown outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
                />
              </div>
            </div>

            {/* Filter Results and Clear Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Showing{" "}
                <span className="font-semibold text-brown">
                  {filteredAppointments.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-brown">
                  {totalAppointments}
                </span>{" "}
                appointments
              </p>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="cursor-pointer rounded-lg border border-border-soft px-4 py-2 text-sm font-medium text-brown transition hover:bg-blush"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Appointment Results */}
          {appointments.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="font-medium text-brown">
                No appointments found.
              </p>
              <p className="mt-1 text-sm text-muted">
                New bookings will appear here.
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="font-medium text-brown">
                No matching appointments.
              </p>
              <p className="mt-1 text-sm text-muted">
                Try changing your search or filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-4 cursor-pointer rounded-lg bg-rose px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-dark"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Mobile and Tablet Cards */}
              <div className="grid gap-2 p-3 lg:hidden">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border border-border-soft p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brown">
                          {appointment.customer.name}
                        </p>

                        <p className="text-xs text-muted">
                          #{appointment.id} · {appointment.appointment_date}
                        </p>
                      </div>

                      <StatusBadge status={appointment.status} />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-brown">
                        {appointment.service.name}
                      </p>

                      <p className="shrink-0 text-sm font-semibold text-rose">
                        ₹{appointment.service.price}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-xs text-muted">
                        {appointment.appointment_time.slice(0, 5)}
                      </p>

                      <AppointmentActions
                        appointment={appointment}
                        updating={updatingId === appointment.id}
                        onUpdateStatus={updateStatus}
                        onCancel={cancelAppointment}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-blush-light text-muted">
                    <tr>
                      <th className="px-5 py-4 font-semibold">ID</th>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Service</th>
                      <th className="px-5 py-4 font-semibold">Date</th>
                      <th className="px-5 py-4 font-semibold">Time</th>
                      <th className="px-5 py-4 font-semibold">Price</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border-soft">
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="transition hover:bg-cream"
                      >
                        <td className="px-5 py-4 text-muted">
                          #{appointment.id}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-brown">
                            {appointment.customer.name}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            {appointment.customer.email}
                          </p>

                          <p className="text-xs text-muted">
                            {appointment.customer.phone}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-brown">
                          {appointment.service.name}
                        </td>

                        <td className="px-5 py-4 text-brown">
                          {appointment.appointment_date}
                        </td>

                        <td className="px-5 py-4 text-brown">
                          {appointment.appointment_time.slice(0, 5)}
                        </td>

                        <td className="px-5 py-4 font-medium text-brown">
                          ₹{appointment.service.price}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={appointment.status} />
                        </td>

                        <td className="px-5 py-4">
                          <AppointmentActions
                            appointment={appointment}
                            updating={updatingId === appointment.id}
                            onUpdateStatus={updateStatus}
                            onCancel={cancelAppointment}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* Summary Card */
function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-white p-4 sm:p-5">
      <p className="text-xs font-medium text-muted sm:text-sm">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-brown sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

/* Appointment Status Badge */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

/* Appointment Actions */
function AppointmentActions({
  appointment,
  updating,
  onUpdateStatus,
  onCancel,
}: {
  appointment: Appointment;
  updating: boolean;
  onUpdateStatus: (id: number, status: string) => void;
  onCancel: (id: number) => void;
}) {
  if (appointment.status === "cancelled") {
    return (
      <span className="text-xs text-muted">No actions</span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {appointment.status === "pending" && (
        <button
          disabled={updating}
          onClick={() => onUpdateStatus(appointment.id, "confirmed")}
          className="cursor-pointer rounded-md bg-rose px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updating ? "..." : "Confirm"}
        </button>
      )}

      {appointment.status === "confirmed" && (
        <button
          disabled={updating}
          onClick={() => onUpdateStatus(appointment.id, "completed")}
          className="cursor-pointer rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updating ? "..." : "Complete"}
        </button>
      )}

      {(appointment.status === "pending" ||
        appointment.status === "confirmed") && (
        <button
          disabled={updating}
          onClick={() => onCancel(appointment.id)}
          className="cursor-pointer rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      )}

      {appointment.status === "completed" && (
        <span className="text-xs text-muted">Completed</span>
      )}
    </div>
  );
}
