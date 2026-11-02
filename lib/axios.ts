
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

export async function initializeCsrf(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfRequest) {
    csrfRequest = api
      .get<{ csrf_token: string }>("/api/admin/csrf")
      .then((response) => {
        csrfToken = response.data.csrf_token;
        return csrfToken;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  return csrfRequest;
}

export function clearCsrfToken() {
  csrfToken = null;
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();

  const requiresCsrf = ["post", "put", "patch", "delete"].includes(
    method || ""
  );

  if (requiresCsrf) {
    const token = await initializeCsrf();

    config.headers["X-CSRF-Token"] = token;
  }

  return config;
});

export default api;
