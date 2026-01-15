import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { usuariosApi } from '../../api/usuarios.api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { USER_ROLES } from '../../types';

const UsuariosScreenReal = ({ navigation, route }) => {
  const { hasPermission } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [toast, setToast] = useState(route?.params?.toast || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rolesModal, setRolesModal] = useState({ open: false, user: null });
  const [roles, setRoles] = useState([]);

  // Debounce de búsqueda para no disparar demasiadas peticiones
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch((searchQuery || '').trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Cargar roles para acciones de cambio de rol / ver permisos
  React.useEffect(() => {
    (async () => {
      try { const rs = await usuariosApi.listarRoles(); setRoles(Array.isArray(rs) ? rs : []); } catch { /* no-op */ }
    })();
  }, []);

  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ['usuarios', selectedFilter, debouncedSearch],
    queryFn: async () => {
      const rol = selectedFilter !== 'todos' ? selectedFilter.toUpperCase() : undefined;
      const search = debouncedSearch || undefined;
      const { usuarios } = await usuariosApi.listar({ page: 1, limit: 50, rol, search });
      return (usuarios || []).map(u => ({ ...u, estado: u.activo ? 'activo' : 'inactivo' }));
    },
    retry: (count, err) => {
      // No reintentar si es 403/401
      const s = err?.response?.status;
      return !(s === 401 || s === 403) && count < 2;
    },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.resolve(refetch()).finally(() => setRefreshing(false));
  }, [refetch]);

  // Refrescar al volver a enfocar o cuando llega toast por creación
  React.useEffect(() => {
    const unsub = navigation.addListener('focus', () => { try { refetch(); } catch {} });
    return unsub;
  }, [navigation, refetch]);

  React.useEffect(() => {
    if (route?.params?.toast) {
      try { refetch(); } catch {}
      try { navigation.setParams({ toast: undefined }); } catch {}
    }
  }, [route?.params?.toast]);

  const handleNuevoUsuario = () => {
    if (hasPermission('usuarios.write')) {
      navigation.navigate('NuevoUsuario');
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para crear usuarios.');
    }
  };

  const getRoleDisplayName = (rol) => {
    switch ((rol || '').toUpperCase()) {
      case USER_ROLES.ADMIN: return 'Administrador';
      case USER_ROLES.JUEZ: return 'Juez';
      case USER_ROLES.SECRETARIO: return 'Secretario';
      case USER_ROLES.OPERADOR: return 'Operador';
      default: return rol;
    }
  };

  const getRoleColor = (rol) => {
    switch ((rol || '').toUpperCase()) {
      case USER_ROLES.ADMIN: return COLORS.error;
      case USER_ROLES.JUEZ: return COLORS.primary;
      case USER_ROLES.SECRETARIO: return COLORS.secondary;
      case USER_ROLES.OPERADOR: return COLORS.info;
      default: return COLORS.text.secondary;
    }
  };

  const usuarios = Array.isArray(data) ? data : [];
  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = (usuario.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usuario.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || (usuario.rol || '').toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleToggleEstado = async (usuario) => {
    try {
      await usuariosApi.cambiarEstado(usuario.id, !usuario.activo);
      refetch();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo actualizar el estado');
    }
  };

  const handleAbrirCambiarRol = (usuario) => {
    setRolesModal({ open: true, user: usuario });
  };

  const handleConfirmarRol = async (rolId) => {
    const u = rolesModal.user;
    if (!u) return setRolesModal({ open: false, user: null });
    try {
      await usuariosApi.cambiarRol(u.id, rolId);
      setRolesModal({ open: false, user: null });
      refetch();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo cambiar el rol');
    }
  };

  const UsuarioRow = ({ usuario }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 2 }]}> 
        <Text style={styles.cellPrimary}>{usuario.nombre}</Text>
        <Text style={styles.cellSecondary}>{usuario.email}</Text>
      </View>
      <View style={[styles.cell, { flex: 1, alignItems: 'flex-start' }]}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(usuario.rol) + '20' }]}> 
          <Text style={[styles.roleText, { color: getRoleColor(usuario.rol) }]}>{getRoleDisplayName(usuario.rol)}</Text>
        </View>
      </View>
      <View style={[styles.cell, { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
        <View style={[styles.statusDot, { backgroundColor: usuario.estado === 'activo' ? COLORS.success : COLORS.text.disabled }]} />
        <Text style={styles.cellSecondary}>{usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}</Text>
      </View>
      <View style={[styles.cell, { flex: 2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }]}>
        {hasPermission('usuarios.write') && (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAbrirCambiarRol(usuario)}>
              <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Cambiar rol</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleEstado(usuario)}>
              <Ionicons name={usuario.activo ? 'pause' : 'play'} size={16} color={COLORS.secondary} />
              <Text style={[styles.actionText, { color: COLORS.secondary }]}>{usuario.activo ? 'Desactivar' : 'Activar'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/WhatsApp Image 2025-08-22 at 07.58.37 (3).jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
          <Text style={styles.headerSubtitle}>Administra usuarios y permisos del sistema</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { t: 'Todos', v: 'todos' },
            { t: 'Administradores', v: 'admin' },
            { t: 'Jueces', v: 'juez' },
            { t: 'Secretarios', v: 'secretario' },
            { t: 'Operadores', v: 'operador' },
          ].map(({ t, v }) => (
            <TouchableOpacity key={v} style={[styles.filterButton, selectedFilter === v && styles.filterButtonSelected]} onPress={() => setSelectedFilter(v)}>
              <Text style={[styles.filterButtonText, selectedFilter === v && styles.filterButtonTextSelected]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {hasPermission('usuarios.write') && (
        <TouchableOpacity style={styles.nuevoUsuarioButton} onPress={handleNuevoUsuario}>
          <Ionicons name="person-add" size={24} color={COLORS.text.inverse} />
          <Text style={styles.nuevoUsuarioText}>Nuevo Usuario</Text>
        </TouchableOpacity>
      )}

      {error ? (
        <View style={{ padding: SPACING.screenPadding }}>
          <View style={{ backgroundColor: COLORS.error + '15', padding: SPACING.md, borderRadius: BORDER_RADIUS.md }}>
            <Text style={{ ...TYPOGRAPHY.body1, color: COLORS.error, fontWeight: '600', marginBottom: SPACING.xs }}>
              No se pudieron cargar los usuarios
            </Text>
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>
              {error?.response?.status === 403 ? 'No tiene permisos para ver esta sección.' : (error?.response?.data?.message || 'Intente nuevamente más tarde.')}
            </Text>
          </View>
        </View>
      ) : (
      <ScrollView
        style={styles.usuariosList}
        refreshControl={<RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsuarios.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 2 }]}>Usuario</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Rol</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Estado</Text>
              <Text style={[styles.headerCell, { flex: 2, textAlign: 'right' }]}>Acciones</Text>
            </View>
            {filteredUsuarios.map((u) => (
              <UsuarioRow key={u.id} usuario={u} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>No hay usuarios</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery || selectedFilter !== 'todos'
                ? 'No se encontraron usuarios con los filtros aplicados'
                : 'No hay usuarios registrados en el sistema'}
            </Text>
          </View>
        )}
      </ScrollView>
      )}

      {/* Modal cambio de rol / ver permisos */}
      <Modal visible={rolesModal.open} transparent animationType="fade" onRequestClose={() => setRolesModal({ open: false, user: null })}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: SPACING.screenPadding }}>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.h5, color: COLORS.text.primary, marginBottom: SPACING.sm }}>Seleccionar rol</Text>
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary, marginBottom: SPACING.md }}>
              {rolesModal.user ? rolesModal.user.nombre : ''}
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {roles.map((r) => (
                <TouchableOpacity key={r.id} style={{ paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border + '55' }} onPress={() => handleConfirmarRol(r.id)}>
                  <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.primary }}>{r.nombre}</Text>
                  {!!r.permisos && r.permisos.length > 0 && (
                    <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>Permisos: {r.permisos.join(', ')}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ alignItems: 'flex-end', marginTop: SPACING.md }}>
              <TouchableOpacity onPress={() => setRolesModal({ open: false, user: null })}>
                <Text style={{ ...TYPOGRAPHY.button, color: COLORS.primary }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

  <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={3000}>
    {toast}
  </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, paddingTop: SPACING.xl, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.screenPadding, flexDirection: 'row', alignItems: 'center', ...SHADOWS.medium },
  backButton: { marginRight: SPACING.sm, padding: SPACING.xs },
  logo: { width: 60, height: 60, marginRight: SPACING.md },
  headerContent: { flex: 1 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text.primary, marginBottom: SPACING.xs },
  headerSubtitle: { ...TYPOGRAPHY.body2, color: COLORS.text.secondary },
  searchContainer: { padding: SPACING.screenPadding, backgroundColor: COLORS.surface },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, marginLeft: SPACING.sm, ...TYPOGRAPHY.body1, color: COLORS.text.primary },
  filtersContainer: { paddingHorizontal: SPACING.screenPadding, paddingVertical: SPACING.md, backgroundColor: COLORS.surface },
  filterButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginRight: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  filterButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterButtonText: { ...TYPOGRAPHY.body2, color: COLORS.text.secondary, fontWeight: '500' },
  filterButtonTextSelected: { color: COLORS.text.inverse },
  nuevoUsuarioButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, margin: SPACING.screenPadding, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, ...SHADOWS.medium },
  nuevoUsuarioText: { ...TYPOGRAPHY.button, color: COLORS.text.inverse, marginLeft: SPACING.sm },
  usuariosList: { flex: 1, paddingHorizontal: SPACING.screenPadding },
  table: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', ...SHADOWS.medium },
  headerRow: { flexDirection: 'row', backgroundColor: COLORS.background, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerCell: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border + '33' },
  cell: { paddingRight: SPACING.sm },
  cellPrimary: { ...TYPOGRAPHY.body1, color: COLORS.text.primary },
  cellSecondary: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary },
  statusDot: { width: 8, height: 8, borderRadius: BORDER_RADIUS.round },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  actionText: { ...TYPOGRAPHY.caption, fontWeight: '600' },
  roleBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.md },
  roleText: { ...TYPOGRAPHY.caption, fontWeight: '600' },
});

export default UsuariosScreenReal;
