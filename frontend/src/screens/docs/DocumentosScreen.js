import React, { useState, useRef, useEffect } from 'react';
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
  Platform,
  ToastAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { documentosApi } from '../../api/documentos.api';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { DOCUMENTO_STATUS } from '../../types';
import { useRoute } from '@react-navigation/native';

const DocumentosScreen = ({ navigation }) => {
  const route = useRoute();
  const { user, hasPermission } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [highlightId, setHighlightId] = useState(null);
  const scrollRef = useRef(null);
  const itemPositions = useRef({});

  // Obtener documentos con React Query
  const { data: documentos, isLoading, error, refetch } = useQuery({
    queryKey: ['documentos', searchQuery, selectedFilter],
    queryFn: () => documentosApi.getDocumentos({
      query: searchQuery,
      estado: selectedFilter === 'todos' ? undefined : selectedFilter
    }),
    staleTime: 5 * 60 * 1000,
  });

  const documentosList = documentos?.data?.documentos ?? documentos?.documentos ?? [];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // Toast y resaltado tras crear
  useEffect(() => {
    const toast = route.params?.toast;
    const hl = route.params?.highlightId;
    if (toast) {
      if (Platform.OS === 'android') ToastAndroid.show(toast, ToastAndroid.SHORT);
      else if (Platform.OS === 'web') { try { window.alert(toast); } catch {} }
      else Alert.alert('', toast);
      try { navigation.setParams({ toast: undefined }); } catch {}
    }
    if (hl) {
      setHighlightId(Number(hl));
      try { refetch(); } catch {}
      const t = setTimeout(() => setHighlightId(null), 6000);
      try { navigation.setParams({ highlightId: undefined }); } catch {}
      return () => clearTimeout(t);
    }
  }, [route.params?.toast]);

  // Scroll automático al resaltado
  useEffect(() => {
    if (!highlightId || !scrollRef.current) return;
    const y = itemPositions.current[highlightId];
    if (typeof y === 'number') {
      const target = Math.max(y - 60, 0);
      setTimeout(() => { try { scrollRef.current.scrollTo({ y: target, animated: true }); } catch {} }, 120);
    }
  }, [highlightId, documentosList]);

  const handleSubirDocumento = () => {
    if (hasPermission('documentos.write')) {
      navigation.navigate('SubirDocumento');
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para subir documentos.');
    }
  };

  const handleFirmarDocumento = (documento) => {
    if (hasPermission('firmas.all')) {
      navigation.navigate('FirmarDocumento', { documentoId: documento.id });
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para firmar documentos.');
    }
  };

  const handleVerDocumento = (documento) => {
    // Aquí podrías implementar la visualización del documento
    Alert.alert('Ver Documento', `Visualizando: ${documento.nombre}`);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'borrador': return COLORS.text.secondary;
      case 'pendiente_firma': return COLORS.warning;
      case 'en_firma': return COLORS.info;
      case 'firmado': return COLORS.success;
      case 'verificado': return COLORS.info;
      default: return COLORS.text.secondary;
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'borrador': return 'Borrador';
      case 'pendiente_firma': return 'Pendiente Firma';
      case 'en_firma': return 'En Proceso';
      case 'firmado': return 'Firmado';
      case 'verificado': return 'Verificado';
      default: return estado;
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

  const DocumentoCard = ({ documento }) => (
    <View
      style={[styles.documentoCard, documento.id === highlightId && styles.documentoCardHighlighted]}
      onLayout={(e) => { itemPositions.current[documento.id] = e.nativeEvent.layout.y; }}
    >
      <View style={styles.documentoHeader}>
        <View style={styles.documentoIcon}>
          <Ionicons name="document" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.documentoInfo}>
          <Text style={styles.documentoNombre} numberOfLines={2}>
            {documento.nombre}
          </Text>
          <Text style={styles.documentoExpediente}>
            Exp: {documento.expediente_nro || 'N/A'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(documento.estado) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(documento.estado) }]}>
            {getStatusText(documento.estado)}
          </Text>
        </View>
      </View>
      
      <View style={styles.documentoDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>
            {new Date(documento.created_at).toLocaleDateString('es-AR')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="hardware-chip" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailText}>
            {(documento.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        </View>
        
        {documento.hash_sha256 && (
          <View style={styles.detailRow}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.detailText}>
              Hash: {documento.hash_sha256.substring(0, 8)}...
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.documentoActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleVerDocumento(documento)}
        >
          <Ionicons name="eye" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleVerDocumento(documento)}
        >
          <Ionicons name="download" size={20} color={COLORS.secondary} />
          <Text style={styles.actionButtonText}>Descargar</Text>
        </TouchableOpacity>
        
        {documento.estado === 'pendiente_firma' && hasPermission('firmas.all') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.firmarButton]}
            onPress={() => handleFirmarDocumento(documento)}
          >
            <Ionicons name="create" size={20} color={COLORS.success} />
            <Text style={[styles.actionButtonText, { color: COLORS.success }]}>Firmar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Error al cargar documentos</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Documentos Judiciales</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar documento por nombre o expediente..."
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

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="Todos"
            value="todos"
            isSelected={selectedFilter === 'todos'}
            onPress={() => setSelectedFilter('todos')}
          />
          <FilterButton
            title="Borradores"
            value="borrador"
            isSelected={selectedFilter === 'borrador'}
            onPress={() => setSelectedFilter('borrador')}
          />
          <FilterButton
            title="Pendientes"
            value="pendiente_firma"
            isSelected={selectedFilter === 'pendiente_firma'}
            onPress={() => setSelectedFilter('pendiente_firma')}
          />
          <FilterButton
            title="En Firma"
            value="en_firma"
            isSelected={selectedFilter === 'en_firma'}
            onPress={() => setSelectedFilter('en_firma')}
          />
          <FilterButton
            title="Firmados"
            value="firmado"
            isSelected={selectedFilter === 'firmado'}
            onPress={() => setSelectedFilter('firmado')}
          />
          <FilterButton
            title="Verificados"
            value="verificado"
            isSelected={selectedFilter === 'verificado'}
            onPress={() => setSelectedFilter('verificado')}
          />
        </ScrollView>
      </View>

      {/* Botón Subir Documento */}
      {hasPermission('documentos.write') && (
        <TouchableOpacity style={styles.subirDocumentoButton} onPress={handleSubirDocumento}>
          <Ionicons name="cloud-upload" size={24} color={COLORS.text.inverse} />
          <Text style={styles.subirDocumentoText}>Subir Documento</Text>
        </TouchableOpacity>
      )}

      {/* Lista de Documentos */}
      <ScrollView
        ref={scrollRef}
        style={styles.documentosList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass" size={48} color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando documentos...</Text>
          </View>
        ) : documentosList.length > 0 ? (
          documentosList.map((documento) => (
            <DocumentoCard key={documento.id} documento={documento} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>No hay documentos</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery || selectedFilter !== 'todos'
                ? 'No se encontraron documentos con los filtros aplicados'
                : 'No hay documentos registrados en el sistema'
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
  
  subirDocumentoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: SPACING.screenPadding,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  
  subirDocumentoText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
    marginLeft: SPACING.sm,
  },
  
  documentosList: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  
  documentoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  documentoCardHighlighted: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  documentoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  
  documentoIcon: {
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  
  documentoInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  
  documentoNombre: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  
  documentoExpediente: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  
  documentoDetails: {
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
  
  documentoActions: {
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
  
  firmarButton: {
    backgroundColor: COLORS.success + '20',
  },
  
  actionButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  
  loadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
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
  
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.screenPadding,
  },
  
  errorTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.error,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  
  errorMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  
  retryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
  },
});

export default DocumentosScreen; 
