import { useColorScheme } from 'react-native';

const sharedColors = {
  primary: '#E5484D', // Rojo Suave y Pálido
  primaryLight: '#F78A8D', 
  secondary: '#16A34A', // Verde Esmeralda
  success: '#16A34A', 
  danger: '#DC2626', 
  warning: '#F59E0B',
};

export const lightColors = {
  ...sharedColors,
  background: '#FDF8F8', 
  card: '#FFFFFF', 
  text: '#292524',
  textMuted: '#A8A29E', 
  border: '#F5ECEC', 
};

export const darkColors = {
  ...sharedColors,
  background: '#121212', 
  card: '#1C1C1E', 
  text: '#F5F5F5', 
  textMuted: '#8E8E93', 
  border: '#2C2C2E', 
};

export const useAppColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
};

// Fallback temporal para las pantallas que no se han actualizado aún
export const colors = lightColors;
