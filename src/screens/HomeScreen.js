import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../types';
import { expedientesService, documentosService } from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState({
    expedientes: { total: 0, pendientes: 0, enTramite: 0, resueltos: 0 },
    documentos: { total: 0, pendientesFirma: 0, firmados: 0 },
    actuaciones: { total: 0, pendientes: 0, completadas: 0 }
  });
  const [recentExpedientes, setRecentExpedientes] = useState([]);
  const [recentDocumentos, setRecentDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas básicas
      await Promise.all([
        loadExpedientesStats(),
        loadDocumentosStats(),
        loadRecentData()
      ]);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpedientesStats = async () => {
    try {
      const response = await expedientesService.listar({}, 1, 1000);
      const expedientes = response.data || [];
      
      const stats = {
        total: expedientes.length,
        pendientes: expedientes.filter(e => e.estado === 'pendiente').length,
        enTramite: expedientes.filter(e => e.estado === 'en_tramite').length,
        resueltos: expedientes.filter(e => e.estado === 'resuelto').length
      };
      
      setStats(prev => ({ ...prev, expedientes: stats }));
    } catch (error) {
      console.error('Error cargando estadísticas de expedientes:', error);
    }
  };

  const loadDocumentosStats = async () => {
    try {
      const response = await documentosService.listar({}, 1, 1000);
      const documentos = response.data || [];
      
      const stats = {
        total: documentos.length,
        pendientesFirma: documentos.filter(d => d.estado === 'pendiente_firma').length,
        firmados: documentos.filter(d => d.estado === 'firmado').length
      };
      
      setStats(prev => ({ ...prev, documentos: stats }));
    } catch (error) {
      console.error('Error cargando estadísticas de documentos:', error);
    }
  };

  const loadRecentData = async () => {
    try {
      // Cargar expedientes recientes
      const expedientesResponse = await expedientesService.listar({}, 1, 5);
      setRecentExpedientes(expedientesResponse.data || []);
      
      // Cargar documentos recientes
      const documentosResponse = await documentosService.listar({}, 1, 5);
      setRecentDocumentos(documentosResponse.data || []);
    } catch (error) {
      console.error('Error cargando datos recientes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return '#ff9800';
      case 'en_tramite': return '#2196f3';
      case 'resuelto': return '#4caf50';
      case 'archivado': return '#9e9e9e';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en_tramite': return 'En Trámite';
      case 'resuelto': return 'Resuelto';
      case 'archivado': return 'Archivado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con información del usuario */}
      <Card style={styles.userCard}>
        <Card.Content>
          <Title style={styles.welcomeTitle}>
            ¡Bienvenido, {user?.nombre}!
          </Title>
          <Paragraph style={styles.userInfo}>
            {user?.rol} • {user?.institucion}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Estadísticas principales */}
      <View style={styles.statsContainer}>
        <Title style={styles.sectionTitle}>Estadísticas Generales</Title>
        
        <View style={styles.statsGrid}>
          {/* Expedientes */}
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{stats.expedientes.total}</Title>
              <Paragraph style={styles.statLabel}>Total Expedientes</Paragraph>
              <View style={styles.statBreakdown}>
                <Chip style={[styles.statusChip, { backgroundColor: '#ff9800' }]}>
                  {stats.expedientes.pendientes} Pendientes
                </Chip>
                <Chip style={[styles.statusChip, { backgroundColor: '#2196f3' }]}>
                  {stats.expedientes.enTramite} En Trámite
                </Chip>
                <Chip style={[styles.statusChip, { backgroundColor: '#4caf50' }]}>
                  {stats.expedientes.resueltos} Resueltos
                </Chip>
              </View>
            </Card.Content>
          </Card>

          {/* Documentos */}
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{stats.documentos.total}</Title>
              <Paragraph style={styles.statLabel}>Total Documentos</Paragraph>
              <View style={styles.statBreakdown}>
                <Chip style={[styles.statusChip, { backgroundColor: '#ff9800' }]}>
                  {stats.documentos.pendientesFirma} Pendientes Firma
                </Chip>
                <Chip style={[styles.statusChip, { backgroundColor: '#4caf50' }]}>
                  {stats.documentos.firmados} Firmados
                </Chip>
              </View>
            </Card.Content>
          </Card>

          {/* Actuaciones */}
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>{stats.actuaciones.total}</Title>
              <Paragraph style={styles.statLabel}>Total Actuaciones</Paragraph>
              <View style={styles.statBreakdown}>
                <Chip style={[styles.statusChip, { backgroundColor: '#ff9800' }]}>
                  {stats.actuaciones.pendientes} Pendientes
                </Chip>
                <Chip style={[styles.statusChip, { backgroundColor: '#4caf50' }]}>
                  {stats.actuaciones.completadas} Completadas
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Expedientes recientes */}
      <View style={styles.recentContainer}>
        <Title style={styles.sectionTitle}>Expedientes Recientes</Title>
        
        {recentExpedientes.length > 0 ? (
          recentExpedientes.map((expediente) => (
            <Card key={expediente.id} style={styles.recentCard}>
              <Card.Content>
                <View style={styles.recentHeader}>
                  <Title style={styles.recentTitle}>
                    Exp. {expediente.numero}
                  </Title>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(expediente.estado) }
                    ]}
                  >
                    {getStatusText(expediente.estado)}
                  </Chip>
                </View>
                <Paragraph style={styles.recentDescription}>
                  {expediente.descripcion}
                </Paragraph>
                <Text style={styles.recentDate}>
                  Creado: {new Date(expediente.fecha_creacion).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph style={styles.emptyText}>
                No hay expedientes recientes
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Documentos recientes */}
      <View style={styles.recentContainer}>
        <Title style={styles.sectionTitle}>Documentos Recientes</Title>
        
        {recentDocumentos.length > 0 ? (
          recentDocumentos.map((documento) => (
            <Card key={documento.id} style={styles.recentCard}>
              <Card.Content>
                <View style={styles.recentHeader}>
                  <Title style={styles.recentTitle}>
                    {documento.nombre}
                  </Title>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(documento.estado) }
                    ]}
                  >
                    {getStatusText(documento.estado)}
                  </Chip>
                </View>
                <Paragraph style={styles.recentDescription}>
                  Expediente: {documento.expediente_numero}
                </Paragraph>
                <Text style={styles.recentDate}>
                  Subido: {new Date(documento.fecha_creacion).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph style={styles.emptyText}>
                No hay documentos recientes
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Acciones rápidas */}
      {hasPermission(USER_ROLES.SECRETARIO) && (
        <View style={styles.actionsContainer}>
          <Title style={styles.sectionTitle}>Acciones Rápidas</Title>
          
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="plus"
              style={styles.actionButton}
              onPress={() => {/* Navegar a crear expediente */}}
            >
              Nuevo Expediente
            </Button>
            
            <Button
              mode="outlined"
              icon="upload"
              style={styles.actionButton}
              onPress={() => {/* Navegar a subir documento */}}
            >
              Subir Documento
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
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
  userCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#1976d2',
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  statsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 3,
    marginBottom: 16,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#666',
  },
  statBreakdown: {
    alignItems: 'center',
  },
  statusChip: {
    marginVertical: 2,
  },
  recentContainer: {
    margin: 16,
  },
  recentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  recentDescription: {
    marginBottom: 8,
    color: '#666',
  },
  recentDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyCard: {
    marginBottom: 12,
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  actionsContainer: {
    margin: 16,
    marginBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default HomeScreen; 