import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * URL base completa del API (recomendado). Ej.: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.5:4000
 * Si no está definida, se construye host + puerto (factor III: configuración por entorno).
 */
const OVERRIDE_URL = (process as any)?.env?.EXPO_PUBLIC_API_BASE_URL as string | undefined;

/** Puerto del backend solo si no usas OVERRIDE_URL. Ej.: EXPO_PUBLIC_API_PORT=4000 */
const API_PORT =
  ((process as any)?.env?.EXPO_PUBLIC_API_PORT as string | undefined)?.trim() || '4000';

function getExpoHostUri(): string | null {
  const expoConfigHost = (Constants as any)?.expoConfig?.hostUri as string | undefined;
  const manifestHost = (Constants as any)?.manifest?.debuggerHost as string | undefined;
  const manifest2Host = (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost as string | undefined;

  return (expoConfigHost || manifestHost || manifest2Host || '').trim() || null;
}

function stripPort(hostUri: string): string {
  return hostUri.split(':')[0] || hostUri;
}

export function getApiBaseUrl(): string {
  if (OVERRIDE_URL && OVERRIDE_URL.trim().length > 0) {
    return OVERRIDE_URL.trim().replace(/\/+$/, '');
  }

  const hostUri = getExpoHostUri();
  if (hostUri) {
    const host = stripPort(hostUri);

    if ((host === 'localhost' || host === '127.0.0.1') && Platform.OS === 'android') {
      return `http://10.0.2.2:${API_PORT}`;
    }

    return `http://${host}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}
