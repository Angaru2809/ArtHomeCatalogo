import axios from 'axios';
import { getApiBaseUrl } from './api.config';

export const API_BASE_URL = getApiBaseUrl();

// Imágenes locales para el caso de Sillas (fallback si el backend no manda imagen correcta).
const LOCAL_SILLAS_IMAGES: Record<number, any> = {
  1: require('../assets/images/Silla1.png'),
  2: require('../assets/images/Silla2.png'),
  3: require('../assets/images/Silla3.png'),
  4: require('../assets/images/Silla4.png'),
  5: require('../assets/images/Silla5.png'),
  6: require('../assets/images/Silla6.png'),
};

// Mapeo por nombre real del producto -> imagen local.
// Ej:
// - TireSoul => Silla1.png
// - NeoLlan => Silla2.png
// - ecoas => Silla3.png
// - blackchan => Silla4.png
// - fridaybaby => Silla5.png
// - batch => Silla6.png
const LOCAL_SILLAS_BY_PRODUCT_NAME: Record<string, number> = {
  tiresoul: 1,
  neollan: 2,
  ecoas: 3,
  blackchan: 4,
  fridaybaby: 5,
  batch: 6,
};

const normalize = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

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
  // Si el backend ya entrega URL completa, no la prefijamos.
  if (rutaImagen.startsWith('http://') || rutaImagen.startsWith('https://')) {
    return rutaImagen;
  }
  return `${API_BASE_URL}${rutaImagen}`;
};

export const getProductoImageSource = (producto: {
  nombre?: string;
  imagenUrl?: string;
  categoria?: { nombre?: string };
}) => {
  const nombre = normalize(producto?.nombre);
  const categoriaNombre = normalize(producto?.categoria?.nombre);

  const isSilla = categoriaNombre.includes('silla') || nombre.includes('silla');
  if (isSilla) {
    const mappedSillaNumero = LOCAL_SILLAS_BY_PRODUCT_NAME[nombre];
    if (mappedSillaNumero && LOCAL_SILLAS_IMAGES[mappedSillaNumero]) {
      return LOCAL_SILLAS_IMAGES[mappedSillaNumero];
    }

    const match = nombre.match(/silla\s*(\d+)/i);
    const sillaNumero = match ? Number(match[1]) : NaN;
    if (!Number.isNaN(sillaNumero) && LOCAL_SILLAS_IMAGES[sillaNumero]) {
      return LOCAL_SILLAS_IMAGES[sillaNumero];
    }
  }

  if (producto?.imagenUrl) {
    return { uri: getImagenUrl(producto.imagenUrl) };
  }

  return null;
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