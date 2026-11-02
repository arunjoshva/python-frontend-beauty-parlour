
import axios from "axios";
import api, { initializeCsrf, clearCsrfToken } from "./axios";

export type AdminLoginData = {
  username: string;
  password: string;
};

export async function adminLogin(
  credentials: AdminLoginData
): Promise<void> {
  try {
    // Obtain CSRF token before login.
    await initializeCsrf();

    await api.post("/api/admin/login", credentials);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail ||
          "Invalid username or password."
      );
    }

    throw new Error("Unable to log in. Please try again.");
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await api.post("/api/admin/logout");
  } finally {
    clearCsrfToken();
  }
}
