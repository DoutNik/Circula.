import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

// Adjunta el token guardado en localStorage a TODAS las requests que pasen
// por esta instancia, así no hay que repetirlo a mano en cada componente
// (y no se nos vuelve a olvidar en algún endpoint nuevo del backend).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token.trim() !== "") {
    config.headers.token = token;
  }
  return config;
});

export default api;
