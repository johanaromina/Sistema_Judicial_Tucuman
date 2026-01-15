// Exportaciones lazy de todas las pantallas para optimizar el rendimiento

// Pantallas de autenticación
export { default as LoginScreen } from '../auth/LoginScreen';

// Pantallas principales
export { default as HomeScreen } from '../home/HomeScreen';
export { default as ExpedientesListScreen } from '../home/ExpedientesListScreen';
export { default as ExpedienteDetailScreen } from '../home/ExpedienteDetailScreen';
export { default as NuevoExpedienteScreen } from '../home/NuevoExpedienteScreen';

// Pantallas de documentos
export { default as DocumentosScreen } from '../docs/DocumentosScreen';
export { default as SubirDocumentoScreen } from '../docs/SubirDocumentoScreen';
export { default as FirmarDocumentoScreen } from '../docs/FirmarDocumentoScreen';

// Pantallas administrativas
export { default as UsuariosScreen } from '../admin/UsuariosScreen';
export { default as AuditoriaScreen } from '../admin/AuditoriaScreen';

// Pantallas de perfil
export { default as PerfilScreen } from '../profile/PerfilScreen'; 