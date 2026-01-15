// Tema de la aplicación SPJT

export const COLORS = {
  // Colores principales - Paleta Azul Profesional y Negro
  primary: '#1e3a8a',           // Azul oscuro principal
  primaryDark: '#1e40af',       // Azul medio oscuro
  primaryLight: '#3b82f6',      // Azul medio
  primaryLighter: '#60a5fa',    // Azul claro
  primaryLightest: '#93c5fd',   // Azul muy claro
  
  // Colores secundarios - Naranja
  secondary: '#ea580c',         // Naranja principal
  secondaryDark: '#c2410c',     // Naranja oscuro
  secondaryLight: '#f97316',    // Naranja claro
  secondaryLighter: '#fb923c',  // Naranja muy claro
  secondaryLightest: '#fdba74', // Naranja más claro
  
  // Colores de estado - Profesionales
  success: '#059669',            // Verde para éxito
  warning: '#d97706',            // Naranja para advertencias
  error: '#dc2626',              // Rojo para errores
  info: '#2563eb',               // Azul para información
  
  // Colores de fondo - Elegantes
  background: '#f8fafc',         // Gris muy claro elegante
  surface: '#ffffff',             // Blanco puro
  surfaceVariant: '#f1f5f9',     // Gris claro elegante
  surfaceDark: '#e2e8f0',        // Gris medio
  surfaceDarker: '#cbd5e0',      // Gris más oscuro
  
  // Colores de texto - Profesionales
  text: {
    primary: '#0f172a',          // Negro azulado muy oscuro
    secondary: '#334155',        // Gris azulado oscuro
    disabled: '#64748b',         // Gris azulado medio
    inverse: '#ffffff',           // Blanco
    accent: '#ea580c'            // Naranja para acentos
  },
  
  // Colores de borde - Sutiles
  border: '#e2e8f0',             // Gris azulado claro
  divider: '#cbd5e0',            // Gris azulado medio
  borderAccent: '#ea580c',       // Naranja para bordes especiales
  
  // Colores de sombra - Profesionales
  shadow: 'rgba(30, 58, 138, 0.08)',      // Azul con transparencia
  shadowDark: 'rgba(30, 58, 138, 0.15)',  // Azul más oscuro
  shadowLight: 'rgba(30, 58, 138, 0.04)', // Azul muy claro
  shadowOrange: 'rgba(234, 88, 12, 0.1)', // Naranja con transparencia
  
  // Colores especiales judiciales
  judicial: {
    blue: '#1e3a8a',              // Azul principal
    blueLight: '#3b82f6',         // Azul claro
    blueDark: '#1e40af',          // Azul oscuro
    orange: '#ea580c',            // Naranja principal
    orangeLight: '#f97316',       // Naranja claro
    orangeDark: '#c2410c',        // Naranja oscuro
    black: '#0f172a',             // Negro principal
    blackLight: '#334155',        // Negro claro
    cream: '#f8fafc',             // Crema elegante
    navy: '#1e40af'               // Azul marino
  }
};

export const TYPOGRAPHY = {
  // Tamaños de fuente
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22
  },
  h6: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textTransform: 'uppercase'
  }
};

export const SPACING = {
  // Espaciados base
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Espaciados específicos
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  sectionSpacing: 24
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  }
};

export const SIZES = {
  // Tamaños de botones
  buttonHeight: 48,
  buttonMinWidth: 120,
  
  // Tamaños de inputs
  inputHeight: 48,
  
  // Tamaños de iconos
  iconSize: 24,
  iconSizeSmall: 16,
  iconSizeLarge: 32,
  
  // Tamaños de avatar
  avatarSize: 40,
  avatarSizeSmall: 32,
  avatarSizeLarge: 56
};

// Tema completo
export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  sizes: SIZES
};

export default theme; 