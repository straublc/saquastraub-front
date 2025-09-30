import axios, { AxiosInstance } from "axios"

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000", // ajuste se backend rodar em outra porta
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
