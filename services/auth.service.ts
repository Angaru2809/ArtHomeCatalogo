import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getApiBaseUrl } from './api.config';

const API_URL = `${getApiBaseUrl()}/api`;
console.log(`🌍 API base configurada: ${API_URL}`);

// Configurar axios con interceptores
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs de peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url} - Enviando petición`);
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para logs de respuestas
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'ERROR'}`);
    return Promise.reject(error);
  }
);

// Constantes para las claves de almacenamiento
const ACCESS_TOKEN_KEY = '@auth:accessToken';
const REFRESH_TOKEN_KEY = '@auth:refreshToken';
const USER_KEY = '@auth:user';

export interface Role {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
}

export interface RegisterData {
  cedula: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudadId: number | null;
  contrasena: string;
  rolId: number;
}

export interface LoginData {
  email: string;
  contrasena: string;
}

export interface UpdateUserData {
  cedula?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudadId?: number | null;
  rolId?: number;
}

export interface AuthResponse {
  usuario: any;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message?: string;
  usuario?: any;
}

class AuthService {
  private async setTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  async clearTokens() {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await axiosInstance.post<RegisterResponse>('/usuarios/users', data);
      return response.data ?? {};
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.details || 
                           error.response?.data?.message || 
                           'Error al registrar usuario';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async updateUser(userId: number, data: UpdateUserData): Promise<any> {
    try {
      const response = await axiosInstance.put(`/usuarios/users/${userId}`, data);
      
      // Actualizar los datos del usuario en el almacenamiento local
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.details || 
                           error.response?.data?.message || 
                           'Error al actualizar usuario';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      const response = await axiosInstance.delete(`/usuarios/users/${userId}`);
      await this.clearTokens();
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.details || 
                           error.response?.data?.message || 
                           'Error al eliminar usuario';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/usuarios/login', {
        email: data.email,
        contrasena: data.contrasena
      });
      
      const { accessToken, refreshToken, usuario } = response.data;
      
      // Guardar tokens y datos del usuario
      await this.setTokens(accessToken, refreshToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuario));

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.details || 
                           error.response?.data?.message || 
                           'Error al iniciar sesión';
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await axiosInstance.post('/usuarios/refresh-token', { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // Guardar nuevos tokens
      await this.setTokens(newAccessToken, newRefreshToken);

      return response.data;
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/usuarios/logout');
    } catch (error) {
      // Incluso si hay error en el servidor, limpiamos localmente
      console.log('Error en logout del servidor, limpiando localmente');
    } finally {
      await this.clearTokens();
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const response = await axiosInstance.get('/roles');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Error al obtener roles');
      }
      throw error;
    }
  }

  async getCiudades(): Promise<Ciudad[]> {
    try {
      const response = await axiosInstance.get('/ciudades');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Error al obtener ciudades');
      }
      throw error;
    }
  }

  // Método para obtener el token actual
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // Método para verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Método para obtener el usuario actual
  async getCurrentUser(): Promise<any | null> {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Función simple para verificar el estado de autenticación
  async checkAuthStatus(): Promise<{ hasToken: boolean; hasUser: boolean; isAuth: boolean }> {
    const token = await this.getAccessToken();
    const user = await this.getCurrentUser();
    const isAuth = await this.isAuthenticated();
    
    console.log('🔍 Estado de autenticación:', {
      hasToken: !!token,
      hasUser: !!user,
      isAuth: isAuth
    });
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      isAuth: isAuth
    };
  }
}

// Crear interceptor para manejar automáticamente el refresh token
const authService = new AuthService();

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token agregado a la petición:', config.url);
    } else {
      console.log('⚠️ No hay token disponible para la petición:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de token expirado
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // No intentar refresh token en rutas de autenticación
    const authRoutes = ['/usuarios/login', '/usuarios/register', '/usuarios/users'];
    let isAuthRoute = false;
    
    if (originalRequest && originalRequest.url) {
      isAuthRoute = authRoutes.some(route => originalRequest.url.includes(route));
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await authService.refreshToken();
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await authService.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default authService;
export { axiosInstance };

