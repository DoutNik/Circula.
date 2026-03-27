import axios from "axios";

const api = axios.create({
  baseURL: "https://circula-lj9f.onrender.com",
});

export default api;