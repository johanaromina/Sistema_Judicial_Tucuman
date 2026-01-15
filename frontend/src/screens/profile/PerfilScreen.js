import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  ActivityIndicator,
  Platform,
  ToastAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { USER_ROLES } from '../../types';

const PerfilScreen = ({ navigation }) => {
  const { user, signOut, hasPermission } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const showToast = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else if (Platform.OS === 'web') {
      try { window.alert(msg); } catch { /* no-op */ }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: async () => {
            try {
              setLoggingOut(true);
              await signOut();
              showToast('Sesión cerrada');
            } finally {
              setLoggingOut(false);
            }
          } }
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSecuritySettings = () => {
    navigation.navigate('SecuritySettings');
  };

  const getRoleDisplayName = (rol) => {
    switch (rol) {
      case USER_ROLES.ADMIN: return 'Administrador del Sistema';
      case USER_ROLES.JUEZ: return 'Juez';
      case USER_ROLES.SECRETARIO: return 'Secretario';
      case USER_ROLES.OPERADOR: return 'Operador';
      default: return rol;
    }
  };

  const getRoleColor = (rol) => {
    switch (rol) {
      case USER_ROLES.ADMIN: return COLORS.error;
      case USER_ROLES.JUEZ: return COLORS.primary;
      case USER_ROLES.SECRETARIO: return COLORS.secondary;
      case USER_ROLES.OPERADOR: return COLORS.info;
      default: return COLORS.text.secondary;
    }
  };

  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true, showSwitch = false, switchValue, onSwitchChange }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, { backgroundColor: COLORS.primary + '20' }]}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
          thumbColor={switchValue ? COLORS.primary : COLORS.text.disabled}
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
      ) : null}
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header con logo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { try { if (navigation.canGoBack && navigation.canGoBack()) navigation.goBack(); else navigation.navigate('MainTabs', { screen: 'Home' }); } catch {} }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/WhatsApp Image 2025-08-22 at 07.58.37 (3).jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del usuario */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: getRoleColor(user?.rol) + '20' }]}>
              <Ionicons name="person" size={40} color={getRoleColor(user?.rol)} />
            </View>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.rol) }]}>
              <Text style={styles.roleText}>{getRoleDisplayName(user?.rol)}</Text>
            </View>
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@ejemplo.com'}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user?.rol)}</Text>
          </View>
        </View>

        {/* Estadísticas del usuario */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Expedientes"
              value="12"
              icon="folder"
              color={COLORS.primary}
            />
            <StatCard
              title="Documentos"
              value="45"
              icon="document"
              color={COLORS.secondary}
            />
            <StatCard
              title="Firmas"
              value="23"
              icon="create"
              color={COLORS.success}
            />
            <StatCard
              title="Actuaciones"
              value="9"
              icon="document-text"
              color={COLORS.warning}
            />
          </View>
        </View>

        {/* Menú de opciones */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <MenuItem
            icon="person"
            title="Editar Perfil"
            subtitle="Modificar información personal"
            onPress={handleEditProfile}
          />
          
          <MenuItem
            icon="lock-closed"
            title="Cambiar Contraseña"
            subtitle="Actualizar contraseña de acceso"
            onPress={handleChangePassword}
          />
          
          <MenuItem
            icon="shield-checkmark"
            title="Configuración de Seguridad"
            subtitle="Configurar autenticación y permisos"
            onPress={handleSecuritySettings}
          />
          
          <MenuItem
            icon="notifications"
            title="Notificaciones"
            subtitle="Configurar alertas y notificaciones"
            showSwitch={true}
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          
          <MenuItem
            icon="moon"
            title="Modo Oscuro"
            subtitle="Cambiar tema de la aplicación"
            showSwitch={true}
            switchValue={darkModeEnabled}
            onSwitchChange={setDarkModeEnabled}
          />
        </View>

        {/* Información del sistema */}
        <View style={styles.systemInfoContainer}>
          <Text style={styles.sectionTitle}>Información del Sistema</Text>
          
          <View style={styles.systemInfoItem}>
            <Text style={styles.systemInfoLabel}>Versión de la App</Text>
            <Text style={styles.systemInfoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.systemInfoItem}>
            <Text style={styles.systemInfoLabel}>Último Acceso</Text>
            <Text style={styles.systemInfoValue}>
              {user?.ultimo_acceso 
                ? new Date(user.ultimo_acceso).toLocaleDateString('es-AR')
                : 'Hoy'
              }
            </Text>
          </View>
          
          <View style={styles.systemInfoItem}>
            <Text style={styles.systemInfoLabel}>Estado de la Cuenta</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.systemInfoValue}>Activa</Text>
            </View>
          </View>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loggingOut}>
          {loggingOut ? (
            <ActivityIndicator size={20} color={COLORS.text.inverse} />
          ) : (
            <Ionicons name="log-out-outline" size={24} color={COLORS.text.inverse} />
          )}
          <Text style={styles.logoutButtonText}>{loggingOut ? 'Cerrando…' : 'Cerrar Sesión'}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SPJT v1.0.0 - Sistema de Procesos Judiciales y Tramitación
          </Text>
          <Text style={styles.footerSubtext}>
            Poder Judicial de Tucumán
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  
  logo: {
    width: 60,
    height: 60,
    marginRight: SPACING.md,
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  
  content: {
    flex: 1,
  },
  
  userInfoContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.screenPadding,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  
  roleBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  
  roleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  
  userDetails: {
    alignItems: 'center',
  },
  
  userName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  
  userEmail: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  
  userRole: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  statsContainer: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.lg,
  },
  
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.medium,
  },
  
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statInfo: {
    flex: 1,
  },
  
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  
  statTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  menuContainer: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.lg,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  
  menuItemContent: {
    flex: 1,
  },
  
  menuItemTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  
  menuItemSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  systemInfoContainer: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.lg,
  },
  
  systemInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  
  systemInfoLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  
  systemInfoValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.xs,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    margin: SPACING.screenPadding,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  
  logoutButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
    marginLeft: SPACING.sm,
  },
  
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
  },
  
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  
  footerSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.disabled,
    textAlign: 'center',
  },
});

export default PerfilScreen; 
