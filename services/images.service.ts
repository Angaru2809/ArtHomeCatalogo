import { getApiBaseUrl } from './api.config';

export const API_BASE_URL = getApiBaseUrl();

export interface ImagenResponse {
  success: boolean;
  imagenes: string[];
  total: number;
  archivos: string[];
  ultima_actualizacion?: string;
}

export const getImagenesDirectorio = async (): Promise<ImagenResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/imagenes-directorio`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener imágenes del directorio:', error);
    throw error;
  }
};

export const getImagenesPorCategoria = async (categoria: string): Promise<ImagenResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/imagenes-directorio/categoria/${categoria}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener imágenes por categoría:', error);
    throw error;
  }
};

// Función helper para obtener la URL completa de una imagen
export const getImagenUrl = (rutaImagen: string): string => {
  return `${API_BASE_URL}${rutaImagen}`;
}; 