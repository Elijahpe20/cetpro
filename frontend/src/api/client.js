import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export const estudiantesAPI = {
  listar: () => api.get("/estudiantes/"),
  crear: (data) => api.post("/estudiantes/", data),
  obtener: (id) => api.get(`/estudiantes/${id}`),
  actualizar: (id, data) => api.put(`/estudiantes/${id}`, data),
  eliminar: (id) => api.delete(`/estudiantes/${id}`),
  stats: (id) => api.get(`/estudiantes/${id}/stats`),
};

export const indicadoresAPI = {
  listar: (params) => api.get("/indicadores/", { params }),
  modulos: () => api.get("/indicadores/modulos"),
  clases: (modulo) => api.get("/indicadores/clases", { params: { modulo } }),
};

export const calificacionesAPI = {
  grilla: (estudianteId) => api.get(`/calificaciones/estudiante/${estudianteId}`),
  guardarBulk: (data) => api.post("/calificaciones/bulk", data),
  actualizar: (id, data) => api.put(`/calificaciones/${id}`, data),
  reporteClase: (claseNum) => api.get(`/calificaciones/reporte/clase/${claseNum}`),
};

export default api;
