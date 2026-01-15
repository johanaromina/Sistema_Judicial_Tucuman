import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { USER_ROLES } from '../../types';
import { CommonActions } from '@react-navigation/native';

const CustomDrawerContent = (props) => {
  const { user, signOut, hasPermission } = useAuth();
  const { navigation } = props;
  const [loggingOut, setLoggingOut] = useState(false);

  const showToast = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else if (Platform.OS === 'web') {
      try { window.alert(msg); } catch { Alert.alert('', msg); }
    } else {
      Alert.alert('', msg);
    }
  };

  const confirmLogout = async () => {
    if (Platform.OS === 'web') {
      try { return window.confirm('¿Está seguro que desea cerrar sesión?'); } catch { /* fallthrough */ }
    }
    return await new Promise((resolve) => {
      Alert.alert(
        'Cerrar Sesión',
        '¿Está seguro que desea cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Cerrar Sesión', onPress: () => resolve(true) },
        ]
      );
    });
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (!confirmed) return;
    try {
      setLoggingOut(true);
      await signOut();
      showToast('Sesión cerrada');
    } finally {
      navigation.closeDrawer();
      const resetAction = CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });

      const rootNavigation = navigation.getParent();
      if (rootNavigation) {
        rootNavigation.dispatch(resetAction);
      } else {
        navigation.dispatch(resetAction);
      }
    }
    setLoggingOut(false);
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

  const MenuItem = ({ icon, title, subtitle, onPress, showBadge = false, badgeText = '' }) => (
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
      
      {showBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }) => (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header del drawer */}
      <View style={styles.drawerHeader}>
        <Image
          source={require('../../../assets/WhatsApp Image 2025-08-22 at 07.58.37 (3).jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerContent}>
          <Text style={styles.appTitle}>SPJT</Text>
          <Text style={styles.appSubtitle}>Sistema de Procesos Judiciales</Text>
          <Text style={styles.appVersion}>v1.0.0</Text>
        </View>
      </View>

      {/* Información del usuario */}
      <View style={styles.userInfo}>
        <View style={[styles.userAvatar, { backgroundColor: getRoleColor(user?.rol) + '20' }]}>
          <Ionicons name="person" size={32} color={getRoleColor(user?.rol)} />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@ejemplo.com'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.rol) }]}>
            <Text style={styles.roleText}>{getRoleDisplayName(user?.rol)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
        {/* Navegación principal */}
        <SectionTitle title="Navegación Principal" />
        
        <MenuItem
          icon="home"
          title="Inicio"
          subtitle="Dashboard principal"
          onPress={() => {
            navigation.navigate('MainTabs', { screen: 'Home' });
            navigation.closeDrawer();
          }}
        />
        
        <MenuItem
          icon="folder"
          title="Expedientes"
          subtitle="Gestión de expedientes judiciales"
          onPress={() => {
            navigation.navigate('MainTabs', { screen: 'Expedientes' });
            navigation.closeDrawer();
          }}
        />
        
        <MenuItem
          icon="document"
          title="Documentos"
          subtitle="Gestión de documentos"
          onPress={() => {
            navigation.navigate('MainTabs', { screen: 'Documentos' });
            navigation.closeDrawer();
          }}
        />

        {/* Sección administrativa */}
        {(user?.rol === USER_ROLES.ADMIN || user?.rol === USER_ROLES.SECRETARIO) && (
          <>
            <SectionTitle title="Administración" />
            
            <MenuItem
              icon="people"
              title="Usuarios"
              subtitle="Gestión de usuarios del sistema"
              onPress={() => {
                navigation.navigate('MainTabs', { screen: 'Usuarios' });
                navigation.closeDrawer();
              }}
            />
            
            <MenuItem
              icon="analytics"
              title="Auditoría"
              subtitle="Registros de actividad del sistema"
              onPress={() => {
                navigation.navigate('MainTabs', { screen: 'Auditoria' });
                navigation.closeDrawer();
              }}
            />
          </>
        )}

        {/* Sección de herramientas */}
        <SectionTitle title="Herramientas" />
        
        <MenuItem
          icon="add-circle"
          title="Nuevo Expediente"
          subtitle="Crear expediente judicial"
          onPress={() => {
            navigation.navigate('NuevoExpediente');
            navigation.closeDrawer();
          }}
        />
        
        <MenuItem
          icon="cloud-upload"
          title="Subir Documento"
          subtitle="Agregar documento al sistema"
          onPress={() => {
            navigation.navigate('SubirDocumento');
            navigation.closeDrawer();
          }}
        />
        
        <MenuItem
          icon="create"
          title="Firmar Documento"
          subtitle="Firmar documentos pendientes"
          onPress={() => {
            navigation.navigate('FirmarDocumento');
            navigation.closeDrawer();
          }}
        />

        {/* Sección de configuración */}
        <SectionTitle title="Configuración" />
        
        <MenuItem
          icon="person"
          title="Mi Perfil"
          subtitle="Configurar perfil personal"
          onPress={() => {
            navigation.navigate('Perfil');
            navigation.closeDrawer();
          }}
        />
        
        <MenuItem
          icon="settings"
          title="Configuración"
          subtitle="Ajustes de la aplicación"
          onPress={() => {
            // Aquí podrías navegar a una pantalla de configuración
            navigation.closeDrawer();
          }}
        />
        
        <MenuItem
          icon="help-circle"
          title="Ayuda"
          subtitle="Documentación y soporte"
          onPress={() => {
            // Aquí podrías navegar a una pantalla de ayuda
            navigation.closeDrawer();
          }}
        />
      </ScrollView>

      {/* Footer del drawer */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loggingOut}>
          {loggingOut ? (
            <ActivityIndicator size={20} color={COLORS.error} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          )}
          <Text style={styles.logoutText}>{loggingOut ? 'Cerrando…' : 'Cerrar Sesión'}</Text>
        </TouchableOpacity>
        
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Poder Judicial de Tucumán
          </Text>
          <Text style={styles.footerSubtext}>
            Sistema de Procesos Judiciales y Tramitación
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  
  drawerHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.screenPadding,
    alignItems: 'center',
  },
  
  logo: {
    width: 80,
    height: 80,
    marginBottom: SPACING.md,
  },
  
  headerContent: {
    alignItems: 'center',
  },
  
  appTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  
  appSubtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.inverse + 'CC',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  
  appVersion: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse + '99',
  },
  
  userInfo: {
    backgroundColor: COLORS.surface,
    padding: SPACING.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  
  userDetails: {
    flex: 1,
  },
  
  userName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  userEmail: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  
  roleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  
  drawerContent: {
    flex: 1,
  },
  
  sectionTitle: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  
  sectionTitleText: {
    ...TYPOGRAPHY.h6,
    color: COLORS.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
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
  
  badge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  
  drawerFooter: {
    padding: SPACING.screenPadding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  
  logoutText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  
  footerInfo: {
    alignItems: 'center',
  },
  
  footerText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  
  footerSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default CustomDrawerContent; 
