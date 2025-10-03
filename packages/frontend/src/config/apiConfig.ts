// Base API URLs and endpoints
import axios from "axios"

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
export default axios;