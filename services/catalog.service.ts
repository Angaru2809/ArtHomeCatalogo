import axios from 'axios';

export const API_BASE_URL = 'http://localhost:4000';

export interface ImagenResponse {
  success: boolean;
  imagenes: string[];
  total: number;
  archivos: string[];
  ultima_actualizacion?: string;
}

export const getCategorias = async () => {
  const res = await fetch(`${API_BASE_URL}/api/categorias`);
  return res.json();
};

export const getProductosPorCategoria = async (categoriaId: number) => {
  const res = await fetch(`${API_BASE_URL}/api/productos/catalogo?categoriaId=${categoriaId}`);
  return res.json();
};

export const getProductosPorCategoriaNombre = async (categoriaNombre: string) => {
  const url = `${API_BASE_URL}/api/productos/filtro?categoria=${encodeURIComponent(categoriaNombre)}`;
  const res = await fetch(url);
  return res.json();
};

export async function getAllProductos() {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const data = await response.json();
    const dataSize = JSON.stringify(data).length;
    
    // Mostrar información de la petición HTTP
    console.log(`🌐 GET /api/productos ${response.status} ${responseTime}ms - ${dataSize} bytes`);
    
    // Si la respuesta es { success: true, productos: [...] }
    return data.productos || [];
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.error(`❌ GET /api/productos ERROR ${responseTime}ms - ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Nuevas funciones para imágenes del directorio
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

export const buscarProductosPorNombre = async (nombre: string) => {
  const url = `${API_BASE_URL}/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`;
  const res = await fetch(url);
  return res.json();
};

export const getProductoPorId = async (id: number) => {
  const response = await axios.get(`${API_BASE_URL}/api/productos/${id}`);
  return response.data;
}; 