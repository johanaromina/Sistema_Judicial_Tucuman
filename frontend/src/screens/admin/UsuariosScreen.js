import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { USER_ROLES } from '../../types';
import { useUsersList, useRoles, useToggleUserState } from '../../hooks/useUsers';

const UsuariosScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [page, setPage] = useState(1);

  const { data: rolesData } = useRoles();
  const {
    data: usuariosData,
    isLoading,
    isFetching,
    refetch,
  } = useUsersList({
    page,
    search: searchQuery || undefined,
    rol: selectedFilter !== 'todos' ? selectedFilter : undefined,
  });
  const toggleUserState = useToggleUserState();

  const usuarios = usuariosData?.usuarios ?? [];
  const paginacion = usuariosData?.paginacion;

  const handleNuevoUsuario = () => {
    if (user?.rol === USER_ROLES.ADMIN) {
      navigation.navigate('NuevoUsuario');
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para crear usuarios.');
    }
  };

  const handleEditarUsuario = (usuario) => {
    if (user?.rol === USER_ROLES.ADMIN) {
      navigation.navigate('EditarUsuario', { usuarioId: usuario.id });
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para editar usuarios.');
    }
  };

  const handleCambiarEstado = (usuario) => {
    if (user?.rol === USER_ROLES.ADMIN) {
      const nuevoEstado = !usuario.activo;
      Alert.alert(
        'Cambiar Estado',
        `¿Está seguro que desea ${nuevoEstado ? 'activar' : 'desactivar'} al usuario ${usuario.nombre}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => {
            toggleUserState.mutate(
              { id: usuario.id, activo: nuevoEstado },
              {
                onSuccess: () => {
                  Alert.alert('Éxito', `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
                },
                onError: (error) => {
                  const message = error?.response?.data?.message || 'No se pudo cambiar el estado del usuario.';
                  Alert.alert('Error', message);
                },
              }
            );
          }}
        ]
      );
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para cambiar el estado de usuarios.');
    }
  };

  const getRoleDisplayName = (rol) => {
    switch (rol) {
      case USER_ROLES.ADMIN: return 'Administrador';
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

  const getStatusColor = (estado) => {
  return estado === true || estado === 'activo' ? COLORS.success : COLORS.text.disabled;
  };

  const FilterButton = ({ title, value, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const UsuarioCard = ({ usuario }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioHeader}>
        <View style={styles.usuarioAvatar}>
          <Ionicons name="person" size={24} color={getRoleColor(usuario.rol)} />
        </View>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioNombre}>{usuario.nombre}</Text>
          <Text style={styles.usuarioEmail}>{usuario.email}</Text>
          <Text style={styles.usuarioPermisos}>
            Permisos: {usuario.permisos?.length ? usuario.permisos.join(', ') : 'No asignados'}
          </Text>
        </View>
        <View style={styles.usuarioStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(usuario.activo) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(usuario.activo) }]}>
            {usuario.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      
      <View style={styles.usuarioDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="business" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>{usuario.institucion}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>
            Último acceso: {usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-AR') : 'Sin registro'}
          </Text>
        </View>
      </View>
      
      <View style={styles.usuarioActions}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(usuario.rol) + '20' }]}>
          <Text style={[styles.roleText, { color: getRoleColor(usuario.rol) }]}>
            {getRoleDisplayName(usuario.rol)}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          {user?.rol === USER_ROLES.ADMIN && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditarUsuario(usuario)}
            >
              <Ionicons name="create" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          
          {user?.rol === USER_ROLES.ADMIN && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCambiarEstado(usuario)}
            >
              <Ionicons
                name={usuario.activo ? 'pause-circle' : 'play-circle'}
                size={20}
                color={usuario.activo ? COLORS.warning : COLORS.success}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const filteredUsuarios = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return usuarios.filter(usuario => {
      const matchesSearch = normalizedSearch.length === 0 ||
        usuario.nombre?.toLowerCase().includes(normalizedSearch) ||
        usuario.email?.toLowerCase().includes(normalizedSearch);
      return matchesSearch;
    });
  }, [usuarios, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header con logo */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/WhatsApp Image 2025-08-22 at 07.58.37 (3).jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuario por nombre o email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.text.disabled}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros por rol */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="Todos"
            value="todos"
            isSelected={selectedFilter === 'todos'}
            onPress={() => setSelectedFilter('todos')}
          />
          <FilterButton
            title="Administradores"
            value="admin"
            isSelected={selectedFilter === 'admin'}
            onPress={() => setSelectedFilter('admin')}
          />
          <FilterButton
            title="Jueces"
            value="juez"
            isSelected={selectedFilter === 'juez'}
            onPress={() => setSelectedFilter('juez')}
          />
          <FilterButton
            title="Secretarios"
            value="secretario"
            isSelected={selectedFilter === 'secretario'}
            onPress={() => setSelectedFilter('secretario')}
          />
          <FilterButton
            title="Operadores"
            value="operador"
            isSelected={selectedFilter === 'operador'}
            onPress={() => setSelectedFilter('operador')}
          />
        </ScrollView>
      </View>

      {/* Botón Nuevo Usuario */}
      {user?.rol === USER_ROLES.ADMIN && (
        <TouchableOpacity style={styles.nuevoUsuarioButton} onPress={handleNuevoUsuario}>
          <Ionicons name="person-add" size={24} color={COLORS.text.inverse} />
          <Text style={styles.nuevoUsuarioText}>Nuevo Usuario</Text>
        </TouchableOpacity>
      )}

      {/* Lista de Usuarios */}
      <ScrollView
        style={styles.usuariosList}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando usuarios...</Text>
          </View>
        ) : filteredUsuarios.length > 0 ? (
          filteredUsuarios.map((usuario) => (
            <UsuarioCard key={usuario.id} usuario={usuario} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>No hay usuarios</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery || selectedFilter !== 'todos'
                ? 'No se encontraron usuarios con los filtros aplicados'
                : 'No hay usuarios registrados en el sistema'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {paginacion && paginacion.totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
            onPress={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
          >
            <Ionicons name="chevron-back" size={20} color={page === 1 ? COLORS.text.disabled : COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            Página {page} de {paginacion.totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.pageButton, page >= paginacion.totalPages && styles.pageButtonDisabled]}
            onPress={() => page < paginacion.totalPages && setPage(page + 1)}
            disabled={page >= paginacion.totalPages}
          >
            <Ionicons name="chevron-forward" size={20} color={page >= paginacion.totalPages ? COLORS.text.disabled : COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}
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
  
  searchContainer: {
    padding: SPACING.screenPadding,
    backgroundColor: COLORS.surface,
  },
  
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  
  filtersContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  filterButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  
  filterButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  
  filterButtonTextSelected: {
    color: COLORS.text.inverse,
  },
  
  nuevoUsuarioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: SPACING.screenPadding,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  
  nuevoUsuarioText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
    marginLeft: SPACING.sm,
  },
  
  usuariosList: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  
  usuarioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  
  usuarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  usuarioAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  
  usuarioInfo: {
    flex: 1,
  },
  
  usuarioNombre: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  usuarioEmail: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  
  usuarioStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.xs,
  },
  
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  
  usuarioDetails: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  detailText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  
  usuarioActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  roleBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  
  roleText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  
  actionButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  
  emptyMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.disabled,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default UsuariosScreen; 