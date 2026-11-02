
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { adminLogout } from "@/lib/admin";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
};

export default function AdminCustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Fetch customers.
  const fetchCustomers = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<Customer[]>("/api/customers/");
      setCustomers(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.replace("/admin/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Check admin authentication.
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Search customers by name, email, or phone.
  const filteredCustomers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return customers;

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.toLowerCase().includes(searchTerm) ||
        String(customer.id).includes(searchTerm)
      );
    });
  }, [customers, search]);

  // Format registration date.
  function formatDate(dateString: string) {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Admin logout.
  async function logout() {
    try {
      await adminLogout();
    } catch {
      // Continue to the login page if the logout request fails.
    } finally {
      router.replace("/admin/login");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-cream">
        <p className="text-muted">Loading customers...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-2 inline-block text-sm font-medium text-rose hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-brown sm:text-3xl">
              Manage Customers
            </h1>

            <p className="mt-1 text-sm text-muted">
              View and search your parlour customers.
            </p>
          </div>

          <button
            onClick={logout}
            className="cursor-pointer rounded-lg border border-border-soft px-4 py-2 text-sm font-medium text-brown transition hover:bg-blush"
          >
            Logout
          </button>
        </div>

        {/* Customer Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <SummaryCard
            title="Total Customers"
            value={customers.length}
          />

          <SummaryCard
            title="Search Results"
            value={filteredCustomers.length}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{error}</p>

            <button
              onClick={() => {
                setLoading(true);
                fetchCustomers();
              }}
              className="cursor-pointer font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search and Refresh */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="min-w-[220px] flex-1">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone or ID..."
              className="w-full rounded-lg border border-border-soft bg-white px-4 py-3 text-sm text-brown outline-none transition placeholder:text-muted focus:border-rose focus:ring-2 focus:ring-rose/10"
            />
          </div>

          <button
            onClick={fetchCustomers}
            className="cursor-pointer rounded-lg border border-border-soft bg-white px-4 py-3 text-sm font-medium text-brown transition hover:bg-blush"
          >
            Refresh
          </button>
        </div>

        {/* Customer List */}
        <section className="overflow-hidden rounded-2xl border border-border-soft bg-white">
          <div className="border-b border-border-soft px-4 py-4 sm:px-6">
            <h2 className="font-semibold text-brown">
              Customers ({filteredCustomers.length})
            </h2>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="font-medium text-brown">
                {customers.length === 0
                  ? "No customers found."
                  : "No matching customers."}
              </p>

              <p className="mt-1 text-sm text-muted">
                {customers.length === 0
                  ? "Customers will appear here after making bookings."
                  : "Try searching with a different name, email, or phone number."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Customer Cards */}
              <div className="grid gap-2 p-3 lg:hidden">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-lg border border-border-soft p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brown">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          Customer #{customer.id}
                        </p>
                      </div>

                      <p className="shrink-0 text-xs text-muted">
                        {formatDate(customer.created_at)}
                      </p>
                    </div>

                    <div className="mt-3 space-y-1 border-t border-border-soft pt-3 text-xs text-muted">
                      <p className="break-all">{customer.email}</p>
                      <p>{customer.phone}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Customer Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-blush-light text-muted">
                    <tr>
                      <th className="px-5 py-4 font-semibold">ID</th>
                      <th className="px-5 py-4 font-semibold">Customer</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Phone</th>
                      <th className="px-5 py-4 font-semibold">
                        Registered Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border-soft">
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="transition hover:bg-cream"
                      >
                        <td className="px-5 py-4 text-muted">
                          #{customer.id}
                        </td>

                        <td className="px-5 py-4 font-medium text-brown">
                          {customer.name}
                        </td>

                        <td className="px-5 py-4 text-brown">
                          {customer.email}
                        </td>

                        <td className="px-5 py-4 text-brown">
                          {customer.phone}
                        </td>

                        <td className="px-5 py-4 text-muted">
                          {formatDate(customer.created_at)}
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