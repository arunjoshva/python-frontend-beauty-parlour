
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { adminLogout } from "@/lib/admin";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  duration: number;
  category: string;
  is_active: boolean;
};

type ServiceFormData = {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
};

const emptyForm: ServiceFormData = {
  name: "",
  description: "",
  price: "",
  duration: "",
  category: "",
};

export default function AdminServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceFormData>(emptyForm);
  const [filter, setFilter] = useState("all");

  // Fetch all services, including inactive services.
  const fetchServices = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<Service[]>("/api/services/admin/all");
      setServices(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.replace("/admin/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Check admin authentication.
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Open Add Service form.
  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  // Open Edit Service form.
  function openEditForm(service: Service) {
    setEditingId(service.id);

    setForm({
      name: service.name,
      description: service.description || "",
      price: String(service.price),
      duration: String(service.duration),
      category: service.category,
    });

    setShowForm(true);
    setError("");
  }

  // Close form.
  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  // Handle form input changes.
  function handleInputChange(
    field: keyof ServiceFormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Add or update service.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      setError("Enter a valid duration in minutes.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      duration,
      category: form.category.trim(),
    };

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        await api.patch(`/api/services/${editingId}`, payload);
      } else {
        await api.post("/api/services/", payload);
      }

      closeForm();
      await fetchServices();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to save the service. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Activate or deactivate service.
  async function changeServiceStatus(service: Service) {
    const action = service.is_active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${service.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      if (service.is_active) {
        await api.delete(`/api/services/${service.id}`);
      } else {
        await api.patch(`/api/services/${service.id}`, {
          is_active: true,
        });
      }

      await fetchServices();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          `Unable to ${action} this service.`
      );
    }
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

  // Filter services.
  const filteredServices = services.filter((service) => {
    if (filter === "active") return service.is_active;
    if (filter === "inactive") return !service.is_active;
    return true;
  });

  const activeCount = services.filter(
    (service) => service.is_active
  ).length;

  const inactiveCount = services.length - activeCount;

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-cream">
        <p className="text-muted">Loading services...</p>
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
              Manage Services
            </h1>

            <p className="mt-1 text-sm text-muted">
              Add, edit, activate, and deactivate parlour services.
            </p>
          </div>

          <button
            onClick={logout}
            className="cursor-pointer rounded-lg border border-border-soft px-4 py-2 text-sm font-medium text-brown transition hover:bg-blush"
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <SummaryCard title="Total" value={services.length} />
          <SummaryCard title="Active" value={activeCount} />
          <SummaryCard title="Inactive" value={inactiveCount} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Service and Filter */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === option.value
                    ? "bg-rose text-white"
                    : "border border-border-soft bg-white text-brown hover:bg-blush"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={openAddForm}
            className="cursor-pointer rounded-lg bg-rose px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-dark"
          >
            + Add Service
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <section className="mb-6 rounded-2xl border border-border-soft bg-white p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-brown">
                {editingId !== null ? "Edit Service" : "Add New Service"}
              </h2>

              <button
                onClick={closeForm}
                type="button"
                className="cursor-pointer text-sm text-muted hover:text-brown"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Service Name">
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      handleInputChange("name", event.target.value)
                    }
                    placeholder="e.g. Hair Styling"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Category">
                  <input
                    required
                    value={form.category}
                    onChange={(event) =>
                      handleInputChange("category", event.target.value)
                    }
                    placeholder="e.g. Hair"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Price (₹)">
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      handleInputChange("price", event.target.value)
                    }
                    placeholder="e.g. 500"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Duration (minutes)">
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.duration}
                    onChange={(event) =>
                      handleInputChange("duration", event.target.value)
                    }
                    placeholder="e.g. 60"
                    className="form-input"
                  />
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    handleInputChange("description", event.target.value)
                  }
                  placeholder="Describe the service..."
                  className="form-input resize-y"
                />
              </FormField>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-rose px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-dark disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Service"
                      : "Add Service"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="cursor-pointer rounded-lg border border-border-soft px-5 py-2.5 text-sm font-medium text-brown hover:bg-blush"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Services List */}
        <section className="overflow-hidden rounded-2xl border border-border-soft bg-white">
          <div className="border-b border-border-soft px-4 py-4 sm:px-6">
            <h2 className="font-semibold text-brown">
              Services ({filteredServices.length})
            </h2>
          </div>

          {filteredServices.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="font-medium text-brown">
                No services found.
              </p>

              <p className="mt-1 text-sm text-muted">
                Add a service or select another filter.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="grid gap-2 p-3 lg:hidden">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-lg border border-border-soft p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brown">
                          {service.name}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {service.category} · {service.duration} min
                        </p>
                      </div>

                      <ServiceStatus active={service.is_active} />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-rose">
                        ₹{service.price}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(service)}
                          className="cursor-pointer rounded-md border border-border-soft px-3 py-1.5 text-xs font-medium text-brown hover:bg-blush"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => changeServiceStatus(service)}
                          className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium ${
                            service.is_active
                              ? "border border-red-200 text-red-600 hover:bg-red-50"
                              : "bg-green-700 text-white hover:bg-green-800"
                          }`}
                        >
                          {service.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
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
                      <th className="px-5 py-4 font-semibold">Service</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Price</th>
                      <th className="px-5 py-4 font-semibold">Duration</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border-soft">
                    {filteredServices.map((service) => (
                      <tr
                        key={service.id}
                        className="transition hover:bg-cream"
                      >
                        <td className="px-5 py-4 text-muted">
                          #{service.id}
                        </td>

                        <td className="max-w-xs px-5 py-4">
                          <p className="font-medium text-brown">
                            {service.name}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs text-muted">
                            {service.description}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-brown">
                          {service.category}
                        </td>

                        <td className="px-5 py-4 font-medium text-brown">
                          ₹{service.price}
                        </td>

                        <td className="px-5 py-4 text-brown">
                          {service.duration} min
                        </td>

                        <td className="px-5 py-4">
                          <ServiceStatus active={service.is_active} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openEditForm(service)}
                              className="cursor-pointer rounded-md border border-border-soft px-3 py-1.5 text-xs font-medium text-brown hover:bg-blush"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => changeServiceStatus(service)}
                              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium ${
                                service.is_active
                                  ? "border border-red-200 text-red-600 hover:bg-red-50"
                                  : "bg-green-700 text-white hover:bg-green-800"
                              }`}
                            >
                              {service.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
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

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #eadbd4;
          border-radius: 0.5rem;
          padding: 0.7rem 0.8rem;
          color: #492d2d;
          background: #fffaf7;
          outline: none;
        }

        .form-input:focus {
          border-color: #884e59;
          box-shadow: 0 0 0 2px rgb(136 78 89 / 12%);
        }
      `}</style>
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
    <div className="rounded-xl border border-border-soft bg-white p-3 sm:p-5">
      <p className="text-xs font-medium text-muted sm:text-sm">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-brown sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

/* Form Field */
function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brown">
        {label}
      </span>

      {children}
    </label>
  );
}

/* Service Status */
function ServiceStatus({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
