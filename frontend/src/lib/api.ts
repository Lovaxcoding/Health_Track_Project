import axios, { type AxiosInstance } from 'axios';

// On définit la structure d'un Utilisateur pour TypeScript
export interface User {
  id: number;
  email: string;
  name?: string;
}

// On définit la structure d'une donnée de santé
export interface HealthRecord {
  id: number;
  type: string;
  value: number;
  unit: string;
  userId: number;
  createdAt: string;
}

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;