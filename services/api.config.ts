import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACKEND_PORT = 4000;

// Puedes sobreescribir la URL con una variable de entorno en el .env
// por ejemplo: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.5:4000
const OVERRIDE_URL = (process as any)?.env?.EXPO_PUBLIC_API_BASE_URL as string | undefined;

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

    // En móvil, 'localhost' casi siempre apunta al dispositivo, no al host PC.
    if ((host === 'localhost' || host === '127.0.0.1') && Platform.OS === 'android') {
      return `http://10.0.2.2:${BACKEND_PORT}`;
    }

    return `http://${host}:${BACKEND_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${BACKEND_PORT}`;
  }

  return `http://localhost:${BACKEND_PORT}`;
}

