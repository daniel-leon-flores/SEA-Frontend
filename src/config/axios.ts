import axios, { AxiosInstance } from "axios";

const API: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const instance: AxiosInstance = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export default instance;
