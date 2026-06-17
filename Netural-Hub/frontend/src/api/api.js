import axios from "axios";

const API = axios.create({
  baseURL:"http://127.0.0.1:8000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;

// Auth
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// Patients
export const getPatients = () => API.get("/patients/");
export const getPatient = (id) => API.get(`/patients/${id}`);
export const createPatient = (data) => API.post("/patients/", data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);

// Medical AI / RAG
export const askMedicalAI = (data) => API.post("/agents/medical-rag", data);
export const getCarePlan = (patientId) => API.get(`/agents/care-plan/${patientId}`);

// ✅ Documents — trailing slash hataya
export const uploadDocument = (formData) =>
  API.post("/documents/upload", formData, {         // ✅ slash hataya
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getDocuments = () => API.get("/documents/");  // ✅ theek hai
export const deleteDocument = (id) => API.delete(`/documents/delete/${id}`);

// ✅ Appointments — /agents/ hataya
// ✅ Yeh honi chahiye
export const getAppointments = () => API.get("/appointments/");
export const createAppointment = (data) => API.post("/appointments/", data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);

// Therapy
export const askTherapyAI = (data) => API.post("/agents/therapy", data);
