import api from "./axios";

export type Service = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  duration: number;
  category: string;
  is_active: boolean;
};

export type AppointmentFormData = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  notes: string;
};

export async function getServices() {
  const response = await api.get<Service[]>("/api/services/");
  return response.data;
}

export async function getAvailableSlots(
  serviceId: number,
  date: string,
) {
  const response = await api.get("/api/appointments/availability", {
    params: {
      service_id: serviceId,
      appointment_date: date,
    },
  });

  return response.data as {
    date: string;
    service_id: number;
    service_name?: string;
    duration?: number;
    available_slots: string[];
    message?: string;
  };
}

export async function createAppointment(data: AppointmentFormData) {
  const response = await api.post("/api/appointments/", data);
  return response.data;
}