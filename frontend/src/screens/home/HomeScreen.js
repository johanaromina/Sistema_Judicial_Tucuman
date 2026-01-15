import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  ToastAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const HomeScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const showToast = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else if (Platform.OS === 'web') {
      try { window.alert(msg); } catch { /* no-op */ }
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Aquí podrías recargar datos
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.quickAction, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionContent}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.quickActionInfo}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.menuButton} onPress={() => { const p = navigation.getParent && navigation.getParent(); if (p && p.openDrawer) p.openDrawer(); }}>
            <Ionicons name="menu" size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../../assets/images (1).jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>¡Bienvenido!</Text>
              <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
              <Text style={styles.userRole}>{user?.rol || 'Rol'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loggingOut}>
            {loggingOut ? (
              <ActivityIndicator size={20} color={COLORS.error} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                {Platform.OS === 'web' && (
                  <Text style={styles.logoutLabel}>Salir</Text>
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
        

      </View>

      {/* Título del Sistema */}
      <View style={styles.systemTitleContainer}>
        <Text style={styles.systemTitle}>Sistema de Procesos Judiciales y Tramitación</Text>
        <Text style={styles.systemSubtitle}>Poder Judicial de Tucumán</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumen del Sistema</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Expedientes"
            value="24"
            icon="folder"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Expedientes')}
          />
          <StatCard
            title="Documentos"
            value="156"
            icon="document"
            color={COLORS.secondary}
            onPress={() => navigation.navigate('Documentos')}
          />
          <StatCard
            title="Pendientes"
            value="8"
            icon="time"
            color={COLORS.warning}
            onPress={() => navigation.navigate('Expedientes')}
          />
          <StatCard
            title="Firmados"
            value="142"
            icon="checkmark-circle"
            color={COLORS.success}
            onPress={() => navigation.navigate('Documentos')}
          />
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActionsList}>
          <QuickAction
            title="Nuevo Expediente"
            subtitle="Crear un nuevo expediente judicial"
            icon="add-circle"
            color={COLORS.primary}
            onPress={() => navigation.navigate('NuevoExpediente')}
          />
          <QuickAction
            title="Subir Documento"
            subtitle="Agregar documento a expediente"
            icon="cloud-upload"
            color={COLORS.secondary}
            onPress={() => navigation.navigate('SubirDocumento')}
          />
          <QuickAction
            title="Firmar Documento"
            subtitle="Firmar documentos pendientes"
            icon="create"
            color={COLORS.success}
            onPress={() => navigation.navigate('FirmarDocumento')}
          />
          {(user?.rol === USER_ROLES.ADMIN) && (
            <QuickAction
              title="Gestionar Usuarios"
              subtitle="Administrar usuarios del sistema"
              icon="people"
              color={COLORS.info}
              onPress={() => navigation.navigate('Usuarios')}
            />
          )}
        </View>
      </View>

      {/* Actividad Reciente */}
      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="document" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Documento subido</Text>
              <Text style={styles.activitySubtitle}>Expediente #2024-001</Text>
              <Text style={styles.activityTime}>Hace 2 horas</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Documento firmado</Text>
              <Text style={styles.activitySubtitle}>Resolución judicial</Text>
              <Text style={styles.activityTime}>Hace 4 horas</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Ionicons name="folder" size={16} color={COLORS.warning} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Expediente creado</Text>
              <Text style={styles.activitySubtitle}>Caso civil #2024-002</Text>
              <Text style={styles.activityTime}>Hace 1 día</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.screenPadding,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: SPACING.md,
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  logo: {
    width: 75,
    height: 75,
    marginRight: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.judicial.blue,
    ...SHADOWS.medium,
  },
  
  userInfo: {
    flex: 1,
  },
  

  
  greeting: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  
  userRole: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.inverse + 'CC',
    textTransform: 'capitalize',
  },
  
  logoutButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  
  systemTitleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.screenPadding,
    marginTop: -SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  
  systemTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.judicial.blue,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontWeight: 'bold',
  },
  
  systemSubtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.judicial.orange,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  statsContainer: {
    padding: SPACING.screenPadding,
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
  
  quickActionsContainer: {
    padding: SPACING.screenPadding,
  },
  
  quickActionsList: {
    gap: SPACING.sm,
  },
  
  quickAction: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  
  quickActionInfo: {
    flex: 1,
  },
  
  quickActionTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  quickActionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  recentActivityContainer: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
  },
  
  activityList: {
    gap: SPACING.md,
  },
  
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  
  activityInfo: {
    flex: 1,
  },
  
  activityTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  activitySubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  
  activityTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.disabled,
  },
});

export default HomeScreen; 
