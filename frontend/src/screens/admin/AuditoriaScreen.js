import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const AuditoriaScreen = ({ navigation }) => {
  const { user, hasPermission } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [dateRange, setDateRange] = useState('hoy');

  // Mock data para auditoría (en producción esto vendría de la API)
  const mockAuditoria = [
    {
      id: 1,
      usuario: 'admin@spjt.com',
      accion: 'LOGIN',
      recurso: 'auth',
      recurso_id: null,
      detalles: 'Inicio de sesión exitoso',
      ip: '192.168.1.100',
      timestamp: '2025-08-22T10:00:00Z'
    },
    {
      id: 2,
      usuario: 'juez.perez@spjt.com',
      accion: 'CREATE',
      recurso: 'expediente',
      recurso_id: 123,
      detalles: 'Creación de expediente EXP-2024-003',
      ip: '192.168.1.101',
      timestamp: '2025-08-22T09:45:00Z'
    },
    {
      id: 3,
      usuario: 'secretaria.gonzalez@spjt.com',
      accion: 'UPDATE',
      recurso: 'documento',
      recurso_id: 456,
      detalles: 'Actualización de documento de expediente',
      ip: '192.168.1.102',
      timestamp: '2025-08-22T09:30:00Z'
    },
    {
      id: 4,
      usuario: 'operador.rodriguez@spjt.com',
      accion: 'VIEW',
      recurso: 'expediente',
      recurso_id: 123,
      detalles: 'Consulta de expediente',
      ip: '192.168.1.103',
      timestamp: '2025-08-22T09:15:00Z'
    }
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Aquí podrías recargar datos de la API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getActionColor = (accion) => {
    switch (accion) {
      case 'CREATE': return COLORS.success;
      case 'UPDATE': return COLORS.warning;
      case 'DELETE': return COLORS.error;
      case 'LOGIN': return COLORS.info;
      case 'LOGOUT': return COLORS.text.secondary;
      case 'VIEW': return COLORS.primary;
      default: return COLORS.text.secondary;
    }
  };

  const getActionIcon = (accion) => {
    switch (accion) {
      case 'CREATE': return 'add-circle';
      case 'UPDATE': return 'create';
      case 'DELETE': return 'trash';
      case 'LOGIN': return 'log-in';
      case 'LOGOUT': return 'log-out';
      case 'VIEW': return 'eye';
      default: return 'information-circle';
    }
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

  const AuditoriaCard = ({ item }) => (
    <View style={styles.auditoriaCard}>
      <View style={styles.auditoriaHeader}>
        <View style={[styles.actionIcon, { backgroundColor: getActionColor(item.accion) + '20' }]}>
          <Ionicons name={getActionIcon(item.accion)} size={20} color={getActionColor(item.accion)} />
        </View>
        <View style={styles.auditoriaInfo}>
          <Text style={styles.auditoriaUsuario}>{item.usuario}</Text>
          <Text style={styles.auditoriaTimestamp}>
            {new Date(item.timestamp).toLocaleString('es-AR')}
          </Text>
        </View>
        <View style={[styles.actionBadge, { backgroundColor: getActionColor(item.accion) + '20' }]}>
          <Text style={[styles.actionText, { color: getActionColor(item.accion) }]}>
            {item.accion}
          </Text>
        </View>
      </View>
      
      <View style={styles.auditoriaDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="document" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>
            {item.recurso}: {item.recurso_id || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="information-circle" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>{item.detalles}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>IP: {item.ip}</Text>
        </View>
      </View>
      
      <View style={styles.auditoriaActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download" size={20} color={COLORS.secondary} />
          <Text style={styles.actionButtonText}>Exportar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Filtrar auditoría según búsqueda y filtros
  const filteredAuditoria = mockAuditoria.filter(item => {
    const matchesSearch = item.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.detalles.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.accion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || item.accion === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
          <Text style={styles.headerTitle}>Sistema de Auditoría</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en auditoría..."
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

      {/* Filtros por acción */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="Todas"
            value="todos"
            isSelected={selectedFilter === 'todos'}
            onPress={() => setSelectedFilter('todos')}
          />
          <FilterButton
            title="Creaciones"
            value="CREATE"
            isSelected={selectedFilter === 'CREATE'}
            onPress={() => setSelectedFilter('CREATE')}
          />
          <FilterButton
            title="Modificaciones"
            value="UPDATE"
            isSelected={selectedFilter === 'UPDATE'}
            onPress={() => setSelectedFilter('UPDATE')}
          />
          <FilterButton
            title="Eliminaciones"
            value="DELETE"
            isSelected={selectedFilter === 'DELETE'}
            onPress={() => setSelectedFilter('DELETE')}
          />
          <FilterButton
            title="Accesos"
            value="LOGIN"
            isSelected={selectedFilter === 'LOGIN'}
            onPress={() => setSelectedFilter('LOGIN')}
          />
          <FilterButton
            title="Consultas"
            value="VIEW"
            isSelected={selectedFilter === 'VIEW'}
            onPress={() => setSelectedFilter('VIEW')}
          />
        </ScrollView>
      </View>

      {/* Estadísticas de auditoría */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumen de Actividad</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="eye" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{filteredAuditoria.length}</Text>
            <Text style={styles.statTitle}>Registros</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={COLORS.secondary} />
            <Text style={styles.statNumber}>
              {new Set(filteredAuditoria.map(item => item.usuario)).size}
            </Text>
            <Text style={styles.statTitle}>Usuarios</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>
              {filteredAuditoria.filter(item => 
                new Date(item.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </Text>
            <Text style={styles.statTitle}>Hoy</Text>
          </View>
        </View>
      </View>

      {/* Lista de Auditoría */}
      <ScrollView
        style={styles.auditoriaList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAuditoria.length > 0 ? (
          filteredAuditoria.map((item) => (
            <AuditoriaCard key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>No hay registros de auditoría</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery || selectedFilter !== 'todos'
                ? 'No se encontraron registros con los filtros aplicados'
                : 'No hay actividad registrada en el sistema'
              }
            </Text>
          </View>
        )}
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
  
  statsContainer: {
    padding: SPACING.screenPadding,
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
    justifyContent: 'space-between',
  },
  
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  
  statTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  
  auditoriaList: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  
  auditoriaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  
  auditoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  
  auditoriaInfo: {
    flex: 1,
  },
  
  auditoriaUsuario: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  auditoriaTimestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  actionBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  
  actionText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  
  auditoriaDetails: {
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
  
  auditoriaActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
  },
  
  actionButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
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

export default AuditoriaScreen; 