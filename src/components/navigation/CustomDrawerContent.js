import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES, APP_CONFIG } from '../../types';

const CustomDrawerContent = (props) => {
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // La navegación se maneja automáticamente en el contexto
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Administrador';
      case USER_ROLES.JUEZ:
        return 'Juez';
      case USER_ROLES.SECRETARIO:
        return 'Secretario';
      case USER_ROLES.OPERADOR:
        return 'Operador';
      default:
        return role;
    }
  };

  const getInstitutionIcon = () => {
    return '🏛️';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return '👑';
      case USER_ROLES.JUEZ:
        return '⚖️';
      case USER_ROLES.SECRETARIO:
        return '📋';
      case USER_ROLES.OPERADOR:
        return '🔧';
      default:
        return '👤';
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.container}>
        {/* Header del drawer */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>{getInstitutionIcon()}</Text>
          </View>
          <Text style={styles.appName}>{APP_CONFIG.NAME}</Text>
          <Text style={styles.appVersion}>
            v{APP_CONFIG.VERSION}
          </Text>
        </View>

        {/* Información del usuario */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.nombre} {user?.apellido}
            </Text>
            <Text style={styles.userRole}>
              {getRoleIcon(user?.rol)} {getRoleDisplayName(user?.rol)}
            </Text>
            <Text style={styles.userInstitution}>
              {user?.institucion}
            </Text>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Opciones de navegación */}
        <View style={styles.navigationSection}>
          <Text style={styles.sectionTitle}>Navegación</Text>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => props.navigation.navigate('MainTabs')}
          >
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabel}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => props.navigation.navigate('MainTabs', { screen: 'Expedientes' })}
          >
            <Text style={styles.navIcon}>📁</Text>
            <Text style={styles.navLabel}>Expedientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => props.navigation.navigate('MainTabs', { screen: 'Documentos' })}
          >
            <Text style={styles.navIcon}>📄</Text>
            <Text style={styles.navLabel}>Documentos</Text>
          </TouchableOpacity>

          {/* Solo mostrar para roles administrativos */}
          {(hasPermission(USER_ROLES.ADMIN) || hasPermission(USER_ROLES.SECRETARIO)) && (
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => props.navigation.navigate('MainTabs', { screen: 'Usuarios' })}
            >
              <Text style={styles.navIcon}>👥</Text>
              <Text style={styles.navLabel}>Usuarios</Text>
            </TouchableOpacity>
          )}

          {/* Solo mostrar para roles administrativos */}
          {(hasPermission(USER_ROLES.ADMIN) || hasPermission(USER_ROLES.SECRETARIO)) && (
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => props.navigation.navigate('MainTabs', { screen: 'Auditoria' })}
            >
              <Text style={styles.navIcon}>📊</Text>
              <Text style={styles.navLabel}>Auditoría</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Opciones del usuario */}
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => props.navigation.navigate('Perfil')}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navLabel}>Mi Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {/* Abrir configuración */}}
          >
            <Text style={styles.navIcon}>⚙️</Text>
            <Text style={styles.navLabel}>Configuración</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {/* Abrir ayuda */}}
          >
            <Text style={styles.navIcon}>❓</Text>
            <Text style={styles.navLabel}>Ayuda</Text>
          </TouchableOpacity>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Botón de logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {APP_CONFIG.SUPPORT_EMAIL}
          </Text>
          <Text style={styles.footerText}>
            © 2024 SPJT - Todos los derechos reservados
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: '#666',
  },
  userSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  userInstitution: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  navigationSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#f44336',
    borderRadius: 8,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#fff',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default CustomDrawerContent; 