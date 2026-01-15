import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';
import { getPerformanceConfig } from './src/config/performance';
import { COLORS } from './src/theme';

// Obtener configuración de performance según el ambiente
const performanceConfig = getPerformanceConfig(__DEV__ ? 'development' : 'production');

// Crear cliente de React Query optimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: performanceConfig.reactQuery.retry,
      retryDelay: performanceConfig.reactQuery.retryDelay,
      staleTime: performanceConfig.reactQuery.staleTime,
      gcTime: performanceConfig.reactQuery.gcTime,
      refetchOnWindowFocus: performanceConfig.reactQuery.refetchOnWindowFocus,
      refetchOnReconnect: performanceConfig.reactQuery.refetchOnReconnect,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Tema judicial personalizado para React Native Paper
const theme = {
  colors: {
    primary: COLORS.primary,
    accent: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text.primary,
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
    info: COLORS.info,
    onPrimary: COLORS.text.inverse,
    onSurface: COLORS.text.primary,
    onBackground: COLORS.text.primary,
  },
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
