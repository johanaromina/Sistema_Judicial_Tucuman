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
import { expedientesService } from '../services/api';
import { EXPEDIENTE_STATUS } from '../types';

const ExpedientesScreen = () => {
  const { hasPermission } = useAuth();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExpedientes, setFilteredExpedientes] = useState([]);

  useEffect(() => {
    loadExpedientes();
  }, []);

  useEffect(() => {
    filterExpedientes();
  }, [searchQuery, expedientes]);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const response = await expedientesService.listar({}, 1, 100);
      setExpedientes(response.data || []);
    } catch (error) {
      console.error('Error cargando expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpedientes = () => {
    if (!searchQuery.trim()) {
      setFilteredExpedientes(expedientes);
      return;
    }

    const filtered = expedientes.filter(expediente =>
      expediente.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expediente.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expediente.materia?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExpedientes(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpedientes();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case EXPEDIENTE_STATUS.PENDIENTE:
        return '#ff9800';
      case EXPEDIENTE_STATUS.EN_TRAMITE:
        return '#2196f3';
      case EXPEDIENTE_STATUS.RESUELTO:
        return '#4caf50';
      case EXPEDIENTE_STATUS.ARCHIVADO:
        return '#9e9e9e';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case EXPEDIENTE_STATUS.PENDIENTE:
        return 'Pendiente';
      case EXPEDIENTE_STATUS.EN_TRAMITE:
        return 'En Trámite';
      case EXPEDIENTE_STATUS.RESUELTO:
        return 'Resuelto';
      case EXPEDIENTE_STATUS.ARCHIVADO:
        return 'Archivado';
      default:
        return status;
    }
  };

  const handleCreateExpediente = () => {
    // TODO: Navegar a pantalla de crear expediente
    console.log('Crear expediente');
  };

  const handleViewExpediente = (expediente) => {
    // TODO: Navegar a detalle del expediente
    console.log('Ver expediente:', expediente.id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Cargando expedientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Expedientes</Title>
        <Paragraph style={styles.headerSubtitle}>
          {filteredExpedientes.length} expedientes encontrados
        </Paragraph>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar expedientes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Lista de expedientes */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredExpedientes.length > 0 ? (
          filteredExpedientes.map((expediente) => (
            <TouchableOpacity
              key={expediente.id}
              onPress={() => handleViewExpediente(expediente)}
            >
              <Card style={styles.expedienteCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Title style={styles.expedienteNumber}>
                      Exp. {expediente.numero}
                    </Title>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(expediente.estado) }
                      ]}
                      textStyle={{ color: '#fff' }}
                    >
                      {getStatusText(expediente.estado)}
                    </Chip>
                  </View>
                  
                  <Paragraph style={styles.expedienteDescription}>
                    {expediente.descripcion}
                  </Paragraph>
                  
                  <View style={styles.expedienteDetails}>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Materia:</Text> {expediente.materia}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Juez:</Text> {expediente.juez_nombre}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Secretario:</Text> {expediente.secretario_nombre}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Fecha:</Text> {new Date(expediente.fecha_creacion).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleViewExpediente(expediente)}
                    >
                      Ver Detalle
                    </Button>
                    
                    {hasPermission('secretario') && expediente.estado === EXPEDIENTE_STATUS.PENDIENTE && (
                      <Button
                        mode="contained"
                        compact
                        onPress={() => {/* Cambiar estado */}}
                      >
                        Iniciar Trámite
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyTitle}>No hay expedientes</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No se encontraron expedientes con esa búsqueda' : 'Comienza creando un nuevo expediente'}
            </Text>
            {!searchQuery && hasPermission('secretario') && (
              <Button
                mode="contained"
                onPress={handleCreateExpediente}
                style={styles.createButton}
              >
                Crear Expediente
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB para crear expediente */}
      {hasPermission('secretario') && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleCreateExpediente}
          label="Nuevo Expediente"
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
  expedienteCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expedienteNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  expedienteDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  expedienteDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default ExpedientesScreen; 