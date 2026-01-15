import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Searchbar, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { auditoriaService } from '../services/api';

const AuditoriaScreen = () => {
  const { hasPermission } = useAuth();
  const [auditoria, setAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAuditoria, setFilteredAuditoria] = useState([]);
  const [viewMode, setViewMode] = useState('logs');
  const [filters, setFilters] = useState({
    tipo: 'todos',
    usuario: 'todos',
    fecha: 'todos'
  });

  useEffect(() => {
    loadAuditoria();
  }, []);

  useEffect(() => {
    filterAuditoria();
  }, [searchQuery, auditoria, filters]);

  const loadAuditoria = async () => {
    try {
      setLoading(true);
      const response = await auditoriaService.listar({}, 1, 100);
      setAuditoria(response.data || []);
    } catch (error) {
      console.error('Error cargando auditoría:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAuditoria = () => {
    let filtered = auditoria;

    // Filtrar por tipo
    if (filters.tipo !== 'todos') {
      filtered = filtered.filter(item => item.tipo === filters.tipo);
    }

    // Filtrar por usuario
    if (filters.usuario !== 'todos') {
      filtered = filtered.filter(item => item.usuario_id === filters.usuario);
    }

    // Filtrar por fecha (últimos 7 días, 30 días, etc.)
    if (filters.fecha !== 'todos') {
      const now = new Date();
      let cutoffDate;
      
      switch (filters.fecha) {
        case '7dias':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30dias':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90dias':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        filtered = filtered.filter(item => new Date(item.fecha) >= cutoffDate);
      }
    }

    // Filtrar por búsqueda de texto
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.accion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recurso?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.usuario_nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detalles?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAuditoria(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuditoria();
    setRefreshing(false);
  };

  const getActionIcon = (tipo) => {
    switch (tipo) {
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      case 'LOGIN':
        return '🔑';
      case 'LOGOUT':
        return '🚪';
      case 'DOWNLOAD':
        return '⬇️';
      case 'UPLOAD':
        return '⬆️';
      case 'SIGN':
        return '✍️';
      default:
        return '📝';
    }
  };

  const getActionColor = (tipo) => {
    switch (tipo) {
      case 'CREATE':
        return '#4caf50';
      case 'UPDATE':
        return '#2196f3';
      case 'DELETE':
        return '#f44336';
      case 'LOGIN':
        return '#ff9800';
      case 'LOGOUT':
        return '#9e9e9e';
      case 'DOWNLOAD':
        return '#673ab7';
      case 'UPLOAD':
        return '#009688';
      case 'SIGN':
        return '#e91e63';
      default:
        return '#666';
    }
  };

  const getActionText = (tipo) => {
    switch (tipo) {
      case 'CREATE':
        return 'Crear';
      case 'UPDATE':
        return 'Actualizar';
      case 'DELETE':
        return 'Eliminar';
      case 'LOGIN':
        return 'Inicio Sesión';
      case 'LOGOUT':
        return 'Cerrar Sesión';
      case 'DOWNLOAD':
        return 'Descargar';
      case 'UPLOAD':
        return 'Subir';
      case 'SIGN':
        return 'Firmar';
      default:
        return tipo;
    }
  };

  const getResourceIcon = (recurso) => {
    if (recurso?.includes('expediente')) return '📁';
    if (recurso?.includes('documento')) return '📄';
    if (recurso?.includes('usuario')) return '👤';
    if (recurso?.includes('actuacion')) return '📋';
    return '📝';
  };

  const handleExportAuditoria = async () => {
    try {
      // TODO: Implementar exportación
      console.log('Exportar auditoría');
    } catch (error) {
      console.error('Error exportando auditoría:', error);
    }
  };

  const handleViewReport = (reportType) => {
    // TODO: Implementar vista de reportes
    console.log('Ver reporte:', reportType);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Cargando auditoría...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Auditoría</Title>
        <Paragraph style={styles.headerSubtitle}>
          {filteredAuditoria.length} registros encontrados
        </Paragraph>
      </View>

      {/* Modo de vista */}
      <View style={styles.viewModeContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'logs', label: 'Logs' },
            { value: 'reports', label: 'Reportes' }
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {viewMode === 'logs' ? (
        <>
          {/* Filtros */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Chip
                selected={filters.tipo === 'todos'}
                onPress={() => setFilters(prev => ({ ...prev, tipo: 'todos' }))}
                style={styles.filterChip}
              >
                Todos los tipos
              </Chip>
              <Chip
                selected={filters.tipo === 'CREATE'}
                onPress={() => setFilters(prev => ({ ...prev, tipo: 'CREATE' }))}
                style={styles.filterChip}
              >
                Creaciones
              </Chip>
              <Chip
                selected={filters.tipo === 'UPDATE'}
                onPress={() => setFilters(prev => ({ ...prev, tipo: 'UPDATE' }))}
                style={styles.filterChip}
              >
                Actualizaciones
              </Chip>
              <Chip
                selected={filters.tipo === 'DELETE'}
                onPress={() => setFilters(prev => ({ ...prev, tipo: 'DELETE' }))}
                style={styles.filterChip}
              >
                Eliminaciones
              </Chip>
            </ScrollView>
          </View>

          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Buscar en auditoría..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
          </View>

          {/* Lista de logs */}
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredAuditoria.length > 0 ? (
              filteredAuditoria.map((item) => (
                <Card key={item.id} style={styles.auditoriaCard}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.actionInfo}>
                        <Text style={styles.actionIcon}>
                          {getActionIcon(item.tipo)}
                        </Text>
                        <View style={styles.actionDetails}>
                          <Title style={styles.actionTitle}>
                            {getActionText(item.tipo)}
                          </Title>
                          <Text style={styles.actionResource}>
                            {getResourceIcon(item.recurso)} {item.recurso}
                          </Text>
                        </View>
                      </View>
                      <Chip
                        style={[
                          styles.actionChip,
                          { backgroundColor: getActionColor(item.tipo) }
                        ]}
                        textStyle={{ color: '#fff' }}
                      >
                        {item.tipo}
                      </Chip>
                    </View>
                    
                    <View style={styles.auditoriaMetadata}>
                      <Text style={styles.metadataText}>
                        <Text style={styles.metadataLabel}>Usuario:</Text> {item.usuario_nombre}
                      </Text>
                      
                      <Text style={styles.metadataText}>
                        <Text style={styles.metadataLabel}>Fecha:</Text> {new Date(item.fecha).toLocaleString()}
                      </Text>
                      
                      <Text style={styles.metadataText}>
                        <Text style={styles.metadataLabel}>IP:</Text> {item.ip_address || 'N/A'}
                      </Text>
                      
                      {item.detalles && (
                        <Text style={styles.metadataText}>
                          <Text style={styles.metadataLabel}>Detalles:</Text> {item.detalles}
                        </Text>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No hay registros de auditoría</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || filters.tipo !== 'todos' || filters.usuario !== 'todos' || filters.fecha !== 'todos'
                    ? 'No se encontraron registros con los filtros aplicados'
                    : 'No hay actividad registrada en el sistema'
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      ) : (
        /* Vista de reportes */
        <ScrollView style={styles.content}>
          <View style={styles.reportsContainer}>
            <Title style={styles.sectionTitle}>Reportes Disponibles</Title>
            
            <Card style={styles.reportCard}>
              <Card.Content>
                <Title style={styles.reportTitle}>Actividad por Usuario</Title>
                <Paragraph style={styles.reportDescription}>
                  Muestra la actividad de cada usuario en el sistema
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => handleViewReport('usuarios')}
                  style={styles.reportButton}
                >
                  Ver Reporte
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.reportCard}>
              <Card.Content>
                <Title style={styles.reportTitle}>Actividad por Recurso</Title>
                <Paragraph style={styles.reportDescription}>
                  Muestra la actividad por tipo de recurso (expedientes, documentos, etc.)
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => handleViewReport('recursos')}
                  style={styles.reportButton}
                >
                  Ver Reporte
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.reportCard}>
              <Card.Content>
                <Title style={styles.reportTitle}>Actividad por Tiempo</Title>
                <Paragraph style={styles.reportDescription}>
                  Muestra la actividad del sistema a lo largo del tiempo
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => handleViewReport('tiempo')}
                  style={styles.reportButton}
                >
                  Ver Reporte
                </Button>
              </Card.Content>
            </Card>

            <View style={styles.exportContainer}>
              <Button
                mode="outlined"
                icon="download"
                onPress={handleExportAuditoria}
                style={styles.exportButton}
              >
                Exportar Auditoría
              </Button>
            </View>
          </View>
        </ScrollView>
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
  viewModeContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    marginHorizontal: 4,
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
  auditoriaCard: {
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
  actionInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  actionDetails: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionResource: {
    fontSize: 14,
    color: '#666',
  },
  actionChip: {
    alignSelf: 'flex-start',
  },
  auditoriaMetadata: {
    marginBottom: 8,
    paddingLeft: 44,
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
    paddingHorizontal: 32,
  },
  reportsContainer: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  reportButton: {
    alignSelf: 'flex-start',
  },
  exportContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  exportButton: {
    paddingHorizontal: 32,
  },
});

export default AuditoriaScreen; 