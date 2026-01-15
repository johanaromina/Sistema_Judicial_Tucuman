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
import { documentosService } from '../services/api';
import { DOCUMENTO_STATUS } from '../types';

const DocumentosScreen = () => {
  const { hasPermission } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocumentos, setFilteredDocumentos] = useState([]);

  useEffect(() => {
    loadDocumentos();
  }, []);

  useEffect(() => {
    filterDocumentos();
  }, [searchQuery, documentos]);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      const response = await documentosService.listar({}, 1, 100);
      setDocumentos(response.data || []);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocumentos = () => {
    if (!searchQuery.trim()) {
      setFilteredDocumentos(documentos);
      return;
    }

    const filtered = documentos.filter(documento =>
      documento.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      documento.expediente_numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      documento.tipo?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDocumentos(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocumentos();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case DOCUMENTO_STATUS.BORRADOR:
        return '#9e9e9e';
      case DOCUMENTO_STATUS.PENDIENTE_FIRMA:
        return '#ff9800';
      case DOCUMENTO_STATUS.FIRMADO:
        return '#4caf50';
      case DOCUMENTO_STATUS.VERIFICADO:
        return '#2196f3';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case DOCUMENTO_STATUS.BORRADOR:
        return 'Borrador';
      case DOCUMENTO_STATUS.PENDIENTE_FIRMA:
        return 'Pendiente Firma';
      case DOCUMENTO_STATUS.FIRMADO:
        return 'Firmado';
      case DOCUMENTO_STATUS.VERIFICADO:
        return 'Verificado';
      default:
        return status;
    }
  };

  const getFileIcon = (tipo) => {
    if (tipo?.includes('pdf')) return '📄';
    if (tipo?.includes('doc')) return '📝';
    if (tipo?.includes('image')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadDocument = () => {
    // TODO: Implementar subida de documento
    console.log('Subir documento');
  };

  const handleViewDocument = (documento) => {
    // TODO: Navegar a vista del documento
    console.log('Ver documento:', documento.id);
  };

  const handleDownloadDocument = async (documento) => {
    try {
      // TODO: Implementar descarga
      console.log('Descargar documento:', documento.id);
    } catch (error) {
      console.error('Error descargando documento:', error);
    }
  };

  const handleSignDocument = (documento) => {
    // TODO: Implementar firma
    console.log('Firmar documento:', documento.id);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Cargando documentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Documentos</Title>
        <Paragraph style={styles.headerSubtitle}>
          {filteredDocumentos.length} documentos encontrados
        </Paragraph>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar documentos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Lista de documentos */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredDocumentos.length > 0 ? (
          filteredDocumentos.map((documento) => (
            <Card key={documento.id} style={styles.documentoCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.documentoInfo}>
                    <Text style={styles.fileIcon}>
                      {getFileIcon(documento.tipo)}
                    </Text>
                    <View style={styles.documentoDetails}>
                      <Title style={styles.documentoName}>
                        {documento.nombre}
                      </Title>
                      <Text style={styles.documentoType}>
                        {documento.tipo} • {formatFileSize(documento.tamano)}
                      </Text>
                    </View>
                  </View>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(documento.estado) }
                    ]}
                    textStyle={{ color: '#fff' }}
                  >
                    {getStatusText(documento.estado)}
                  </Chip>
                </View>
                
                <View style={styles.documentoMetadata}>
                  <Text style={styles.metadataText}>
                    <Text style={styles.metadataLabel}>Expediente:</Text> {documento.expediente_numero}
                  </Text>
                  <Text style={styles.metadataText}>
                    <Text style={styles.metadataLabel}>Subido por:</Text> {documento.usuario_nombre}
                  </Text>
                  <Text style={styles.metadataText}>
                    <Text style={styles.metadataLabel}>Fecha:</Text> {new Date(documento.fecha_creacion).toLocaleDateString()}
                  </Text>
                  {documento.fecha_firma && (
                    <Text style={styles.metadataText}>
                      <Text style={styles.metadataLabel}>Firmado:</Text> {new Date(documento.fecha_firma).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleViewDocument(documento)}
                  >
                    Ver
                  </Button>
                  
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleDownloadDocument(documento)}
                  >
                    Descargar
                  </Button>
                  
                  {documento.estado === DOCUMENTO_STATUS.PENDIENTE_FIRMA && hasPermission('juez') && (
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleSignDocument(documento)}
                    >
                      Firmar
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No hay documentos</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No se encontraron documentos con esa búsqueda' : 'Comienza subiendo un nuevo documento'}
            </Text>
            {!searchQuery && hasPermission('secretario') && (
              <Button
                mode="contained"
                onPress={handleUploadDocument}
                style={styles.uploadButton}
              >
                Subir Documento
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB para subir documento */}
      {hasPermission('secretario') && (
        <FAB
          style={styles.fab}
          icon="upload"
          onPress={handleUploadDocument}
          label="Subir Documento"
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
  documentoCard: {
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
  documentoInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  fileIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  documentoDetails: {
    flex: 1,
  },
  documentoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  documentoType: {
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  documentoMetadata: {
    marginBottom: 16,
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 44,
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
  uploadButton: {
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

export default DocumentosScreen; 