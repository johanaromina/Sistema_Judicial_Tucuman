import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip, FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { usuariosService } from '../services/api';
import { USER_ROLES, USER_STATUS } from '../types';

const UsuariosScreen = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    filterUsuarios();
  }, [searchQuery, usuarios]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosService.listar({}, 1, 100);
      setUsuarios(response.data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsuarios = () => {
    if (!searchQuery.trim()) {
      setFilteredUsuarios(usuarios);
      return;
    }

    const filtered = usuarios.filter(usuario =>
      usuario.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.rol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsuarios(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsuarios();
    setRefreshing(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return '#d32f2f';
      case USER_ROLES.JUEZ:
        return '#1976d2';
      case USER_ROLES.SECRETARIO:
        return '#388e3c';
      case USER_ROLES.OPERADOR:
        return '#f57c00';
      default:
        return '#666';
    }
  };

  const getRoleText = (role) => {
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

  const getStatusColor = (status) => {
    return status === USER_STATUS.ACTIVE ? '#4caf50' : '#f44336';
  };

  const getStatusText = (status) => {
    return status === USER_STATUS.ACTIVE ? 'Activo' : 'Inactivo';
  };

  const canManageUser = (targetUser) => {
    // Solo admin puede gestionar otros admin
    if (targetUser.rol === USER_ROLES.ADMIN && currentUser.rol !== USER_ROLES.ADMIN) {
      return false;
    }
    
    // Usuario no puede gestionarse a sí mismo
    if (targetUser.id === currentUser.id) {
      return false;
    }
    
    return hasPermission(USER_ROLES.SECRETARIO);
  };

  const handleCreateUser = () => {
    // TODO: Navegar a pantalla de crear usuario
    console.log('Crear usuario');
  };

  const handleViewUser = (usuario) => {
    // TODO: Navegar a detalle del usuario
    console.log('Ver usuario:', usuario.id);
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const newStatus = usuario.estado === USER_STATUS.ACTIVE ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
      await usuariosService.cambiarEstado(usuario.id, newStatus);
      await loadUsuarios(); // Recargar lista
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const handleChangeRole = async (usuario) => {
    // TODO: Implementar cambio de rol
    console.log('Cambiar rol de usuario:', usuario.id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Usuarios</Title>
        <Paragraph style={styles.headerSubtitle}>
          {filteredUsuarios.length} usuarios encontrados
        </Paragraph>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar usuarios..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Lista de usuarios */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredUsuarios.length > 0 ? (
          filteredUsuarios.map((usuario) => (
            <Card key={usuario.id} style={styles.usuarioCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.usuarioInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.usuarioDetails}>
                      <Title style={styles.usuarioName}>
                        {usuario.nombre} {usuario.apellido}
                      </Title>
                      <Text style={styles.usuarioEmail}>
                        {usuario.email}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(usuario.estado) }
                      ]}
                      textStyle={{ color: '#fff' }}
                    >
                      {getStatusText(usuario.estado)}
                    </Chip>
                  </View>
                </View>
                
                <View style={styles.usuarioMetadata}>
                  <Chip
                    style={[
                      styles.roleChip,
                      { backgroundColor: getRoleColor(usuario.rol) }
                    ]}
                    textStyle={{ color: '#fff' }}
                  >
                    {getRoleText(usuario.rol)}
                  </Chip>
                  
                  <Text style={styles.metadataText}>
                    <Text style={styles.metadataLabel}>Institución:</Text> {usuario.institucion}
                  </Text>
                  
                  <Text style={styles.metadataText}>
                    <Text style={styles.metadataLabel}>Último acceso:</Text> {
                      usuario.ultimo_acceso 
                        ? new Date(usuario.ultimo_acceso).toLocaleDateString()
                        : 'Nunca'
                    }
                  </Text>
                  
                  <Text style={styles.metadataText}>
                    <Text style={styles.metadataLabel}>Creado:</Text> {new Date(usuario.fecha_creacion).toLocaleDateString()}
                  </Text>
                </View>

                {canManageUser(usuario) && (
                  <View style={styles.cardActions}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleViewUser(usuario)}
                    >
                      Ver
                    </Button>
                    
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleToggleStatus(usuario)}
                    >
                      {usuario.estado === USER_STATUS.ACTIVE ? 'Desactivar' : 'Activar'}
                    </Button>
                    
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleChangeRole(usuario)}
                    >
                      Cambiar Rol
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No hay usuarios</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No se encontraron usuarios con esa búsqueda' : 'Comienza creando un nuevo usuario'}
            </Text>
            {!searchQuery && hasPermission(USER_ROLES.ADMIN) && (
              <Button
                mode="contained"
                onPress={handleCreateUser}
                style={styles.createButton}
              >
                Crear Usuario
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB para crear usuario */}
      {hasPermission(USER_ROLES.ADMIN) && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleCreateUser}
          label="Nuevo Usuario"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  usuarioCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  usuarioInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  usuarioDetails: {
    flex: 1,
  },
  usuarioName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  usuarioEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  roleChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  usuarioMetadata: {
    marginBottom: 16,
    paddingLeft: 62,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metadataLabel: {
    fontWeight: '600',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 62,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default UsuariosScreen; 