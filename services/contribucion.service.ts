import axios from 'axios';
import { axiosInstance } from './auth.service';
import { getApiBaseUrl } from './api.config';

const API_BASE_URL = `${getApiBaseUrl()}/api`;

// Interfaces para los datos de contribución
export interface ContribucionData {
  nombreDonante: string;
  correoDonante: string;
  tipoMaterial: string;
  descripcion: string;
  cantidad: number;
  telefono: string;
}

export interface Contribucion {
  id: number;
  usuarioId: number;
  nombreDonante: string;
  correoDonante: string;
  tipoMaterial: string;
  descripcion: string;
  cantidad: number;
  telefono: string;
  estado: string;
  fechaContribucion: string;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
}

class ContribucionService {
  private handleError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data;
      if (serverError && typeof serverError === 'object' && 'error' in serverError) {
        return new Error(serverError.error as string);
      }
      if (serverError && typeof serverError === 'object' && 'message' in serverError) {
        return new Error(serverError.message as string);
      }
    }
    return new Error(defaultMessage);
  }

  async createContribucion(data: ContribucionData): Promise<Contribucion> {
    try {
      const response = await axiosInstance.post<Contribucion>(`/contribuciones`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al crear la contribución');
    }
  }

  async getContribucionesByUsuario(): Promise<Contribucion[]> {
    try {
      const response = await axiosInstance.get<Contribucion[]>(`/contribuciones/usuario/me`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener las contribuciones del usuario');
    }
  }

  async getContribucionById(id: number): Promise<Contribucion> {
    try {
      const response = await axios.get<Contribucion>(`${API_BASE_URL}/contribuciones/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener la contribución');
    }
  }

  async updateContribucion(id: number, data: Partial<ContribucionData>): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/contribuciones/${id}`, data);
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar la contribución');
    }
  }

  async deleteContribucion(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/contribuciones/${id}`);
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar la contribución');
    }
  }

  async getContribucionesByEstado(estado: string): Promise<Contribucion[]> {
    try {
      const response = await axios.get<Contribucion[]>(`${API_BASE_URL}/contribuciones/estado/${estado}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener las contribuciones por estado');
    }
  }

  async getContribucionesByTipoMaterial(tipoMaterial: string): Promise<Contribucion[]> {
    try {
      const response = await axios.get<Contribucion[]>(`${API_BASE_URL}/contribuciones/material/${tipoMaterial}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener las contribuciones por tipo de material');
    }
  }
}

export const contribucionService = new ContribucionService(); 