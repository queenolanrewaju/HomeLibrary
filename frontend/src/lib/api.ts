import { Platform } from 'react-native';

// "localhost" means "this device", so a phone can't reach your computer with it.
// Android emulator: 10.0.2.2 is the host machine. iOS simulator and web: localhost works.
// A real phone needs your computer's LAN IP, e.g. EXPO_PUBLIC_API_URL=http://192.168.1.20:8080
const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${defaultHost}:8080`;

export type User = { id: string; name: string; email: string };
export type AuthResponse = { token: string; user: User };

export async function request<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    // Spring puts our message in the "message" field of its error JSON.
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? `Request failed (${response.status})`);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
