
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/admin";
import api from "@/lib/axios";

export default function AdminLoginPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function resetLoginFields() {
      setUsername("");
      setPassword("");
      setError("");
    }

    resetLoginFields();

    async function checkAdminSession() {
      try {
        await api.get("/api/admin/me");
        router.replace("/admin/dashboard");
      } catch {
        setCheckingAuth(false);
      }
    }

    checkAdminSession();

    window.addEventListener("pageshow", resetLoginFields);

    return () => {
      window.removeEventListener("pageshow", resetLoginFields);
    };
  }, [router]);
  
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await adminLogin({
        username,
        password,
      });

      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-muted">Checking admin session...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border-soft bg-white p-8 shadow-sm sm:p-10">

        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-rose">
            Jerusha Beauty Parlour
          </p>

          <h1 className="text-3xl font-bold text-brown">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-muted">
            Sign in to manage appointments and services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-brown"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required                            
              placeholder="Enter your username"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-brown outline-none focus:border-rose"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-brown"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required                       
              placeholder="Enter your password"
              className="w-full rounded-lg border border-border-soft px-4 py-3 text-brown outline-none focus:border-rose"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-rose px-6 py-3 font-semibold text-white transition hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href="/"
            className="font-medium text-rose hover:underline"
          >
            Back to Website
          </Link>
        </p>
      </div>
    </main>
  );
}
