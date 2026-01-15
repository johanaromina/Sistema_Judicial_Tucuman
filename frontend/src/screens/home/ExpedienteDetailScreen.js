import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { expedientesApi } from '../../api/expedientes.api';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { ENV } from '../../config/env';

const ExpedienteDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user, hasPermission } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const scrollRef = useRef(null);

  const goToDocumentos = () => {
    setActiveTab('documentos');
    setTimeout(() => {
      try { scrollRef.current && scrollRef.current.scrollTo({ y: 0, animated: true }); } catch {}
    }, 60);
  };

  // Obtener datos del expediente
  const { data: expediente, isLoading, error, refetch } = useQuery({
    queryKey: ['expediente', id],
    queryFn: () => expedientesApi.getExpediente(id),
    staleTime: 5 * 60 * 1000,
  });

  // Estado y consulta de actuaciones (paginación + búsqueda)
  const [actPage, setActPage] = useState(1);
  const [actLimit, setActLimit] = useState(10);
  const [actSearch, setActSearch] = useState('');
  const { data: actuacionesResp, refetch: refetchAct } = useQuery({
    queryKey: ['actuaciones', id, actPage, actLimit],
    queryFn: () => expedientesApi.getActuaciones(id, { page: actPage, limit: actLimit }),
    staleTime: 60 * 1000,
    keepPreviousData: true,
  });

  // Obtener documentos del expediente (normalizado)
  const { data: documentos } = useQuery({
    queryKey: ['documentos', id],
    queryFn: () => expedientesApi.getDocumentos(id),
    staleTime: 5 * 60 * 1000,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const handleNuevaActuacion = () => {
    if (hasPermission('expedientes.write')) {
      navigation.navigate('NuevaActuacion', { expedienteId: id });
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para crear actuaciones.');
    }
  };

  const handleSubirDocumento = () => {
    if (hasPermission('documentos.write')) {
      navigation.navigate('SubirDocumento', { expedienteId: id });
    } else {
      Alert.alert('Acceso Denegado', 'No tienes permisos para subir documentos.');
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'abierto': return COLORS.primary;
      case 'en_tramite': return COLORS.warning;
      case 'resuelto': return COLORS.success;
      case 'archivado': return COLORS.text.secondary;
      default: return COLORS.text.secondary;
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'abierto': return 'Abierto';
      case 'en_tramite': return 'En Trámite';
      case 'resuelto': return 'Resuelto';
      case 'archivado': return 'Archivado';
      default: return estado;
    }
  };

  const TabButton = ({ title, value, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const ActuacionCard = ({ actuacion }) => (
    <View style={styles.actuacionCard}>
      <View style={styles.actuacionHeader}>
        <View style={styles.actuacionType}>
          <Ionicons name="document-text" size={20} color={COLORS.primary} />
          <Text style={styles.actuacionTypeText}>{actuacion.tipo}</Text>
        </View>
        <Text style={styles.actuacionDate}>
          {new Date(actuacion.fecha || actuacion.created_at).toLocaleString('es-AR')}
          {actuacion.creado_por_nombre ? ` · por ${actuacion.creado_por_nombre}` : ''}
        </Text>
      </View>
      <Text style={styles.actuacionDescription}>{actuacion.descripcion}</Text>
      <View style={styles.actuacionFooter}>
        <TouchableOpacity style={styles.linkButton} onPress={goToDocumentos}>
          <Ionicons name="folder" size={16} color={COLORS.secondary} />
          <Text style={styles.linkButtonText}>Ver documentos del expediente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const DocumentoCard = ({ documento }) => (
    <TouchableOpacity style={styles.documentoCard} activeOpacity={0.8} onPress={async () => {
      try {
        // Descarga rápida (web): abrir blob en nueva pestaña
        const base = ENV.API_BASE_URL || '';
        const urlReq = `${base.replace(/\/$/, '')}/documentos/${documento.id}/download`;
        const blob = await (await fetch(urlReq, { credentials: 'include' })).blob();
        const url = URL.createObjectURL(blob);
        try { window.open(url, '_blank'); } catch {}
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } catch {
        // Fallback: no-op
      }
    }}>
      <View style={styles.documentoIcon}>
        <Ionicons name="document" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.documentoInfo}>
        <Text style={styles.documentoNombre}>{documento.nombre}</Text>
        <Text style={styles.documentoSize}>
          {(documento.size / 1024 / 1024).toFixed(2)} MB
        </Text>
      </View>
      <TouchableOpacity style={styles.documentoAction}>
        <Ionicons name="download" size={20} color={COLORS.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass" size={48} color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando expediente...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Error al cargar expediente</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!expediente) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document" size={64} color={COLORS.text.disabled} />
        <Text style={styles.errorTitle}>Expediente no encontrado</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con logo y navegación */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.inverse} />
        </TouchableOpacity>
        
        <Image
          source={require('../../../assets/WhatsApp Image 2025-08-22 at 07.58.37 (3).jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Detalle del Expediente</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Información principal del expediente */}
        <View style={styles.expedienteInfo}>
          <View style={styles.expedienteHeader}>
            <View style={styles.expedienteNumber}>
              <Text style={styles.expedienteNumberText}>{expediente.nro}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expediente.estado) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(expediente.estado) }]}>
                {getStatusText(expediente.estado)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.caratulaText}>{expediente.caratula}</Text>
          
          <View style={styles.expedienteDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="business" size={20} color={COLORS.text.secondary} />
              <Text style={styles.detailLabel}>Fuero:</Text>
              <Text style={styles.detailValue}>{expediente.fuero}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
              <Text style={styles.detailLabel}>Fecha de creación:</Text>
              <Text style={styles.detailValue}>
                {new Date(expediente.created_at).toLocaleDateString('es-AR')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color={COLORS.text.secondary} />
              <Text style={styles.detailLabel}>Creado por:</Text>
              <Text style={styles.detailValue}>{expediente.creado_por_nombre || 'Usuario del sistema'}</Text>
            </View>
          </View>
        </View>

        {/* Tabs de navegación */}
        <View style={styles.tabsContainer}>
          <TabButton
            title="General"
            value="general"
            isActive={activeTab === 'general'}
            onPress={() => setActiveTab('general')}
          />
          <TabButton
            title="Actuaciones"
            value="actuaciones"
            isActive={activeTab === 'actuaciones'}
            onPress={() => setActiveTab('actuaciones')}
          />
          <TabButton
            title="Documentos"
            value="documentos"
            isActive={activeTab === 'documentos'}
            onPress={() => setActiveTab('documentos')}
          />
        </View>

        {/* Contenido de los tabs */}
        {activeTab === 'general' && (
          <View style={styles.tabContent}>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="document-text" size={32} color={COLORS.primary} />
                <Text style={styles.statNumber}>{(actuacionesResp?.actuaciones || []).length}</Text>
                <Text style={styles.statLabel}>Actuaciones</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="folder" size={32} color={COLORS.secondary} />
                <Text style={styles.statNumber}>{(documentos || []).length}</Text>
                <Text style={styles.statLabel}>Documentos</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                <Text style={styles.statNumber}>
                  {documentos?.filter(d => d.estado === 'firmado').length || 0}
                </Text>
                <Text style={styles.statLabel}>Firmados</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'actuaciones' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actuaciones del Expediente</Text>
              {hasPermission('expedientes.write') && (
                <TouchableOpacity style={styles.addButton} onPress={handleNuevaActuacion}>
                  <Ionicons name="add" size={20} color={COLORS.text.inverse} />
                  <Text style={styles.addButtonText}>Nueva Actuación</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Filtros y acciones */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm }}>
              <View style={{ flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs }}>
                <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>Buscar</Text>
                <TextInput
                  placeholder="Tipo o descripción"
                  value={actSearch}
                  onChangeText={setActSearch}
                  style={{ ...TYPOGRAPHY.body2, color: COLORS.text.primary, paddingVertical: 2 }}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                <TouchableOpacity disabled={actPage <= 1} onPress={() => setActPage(p => Math.max(1, p - 1))} style={[styles.pageButton, actPage <= 1 && { opacity: 0.5 }]}>
                  <Ionicons name="chevron-back" size={18} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>
                  Página {actuacionesResp?.paginacion?.page || actPage} / {actuacionesResp?.paginacion?.totalPages || 1}
                </Text>
                <TouchableOpacity disabled={(actuacionesResp?.paginacion?.page || 1) >= (actuacionesResp?.paginacion?.totalPages || 1)} onPress={() => setActPage(p => p + 1)} style={[styles.pageButton, ((actuacionesResp?.paginacion?.page || 1) >= (actuacionesResp?.paginacion?.totalPages || 1)) && { opacity: 0.5 }]}>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {((actuacionesResp?.actuaciones || [])
              .filter(a => {
                const q = (actSearch || '').toLowerCase();
                if (!q) return true;
                return (a.tipo || '').toLowerCase().includes(q) || (a.descripcion || '').toLowerCase().includes(q);
              })).length > 0 ? (
              (actuacionesResp?.actuaciones || [])
                .filter(a => {
                  const q = (actSearch || '').toLowerCase();
                  if (!q) return true;
                  return (a.tipo || '').toLowerCase().includes(q) || (a.descripcion || '').toLowerCase().includes(q);
                })
                .map((actuacion) => (
                <ActuacionCard key={actuacion.id} actuacion={actuacion} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text" size={48} color={COLORS.text.disabled} />
                <Text style={styles.emptyText}>No hay actuaciones registradas</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'documentos' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Documentos del Expediente</Text>
              {hasPermission('documentos.write') && (
                <TouchableOpacity style={styles.addButton} onPress={handleSubirDocumento}>
                  <Ionicons name="cloud-upload" size={20} color={COLORS.text.inverse} />
                  <Text style={styles.addButtonText}>Subir Documento</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {documentos?.length > 0 ? (
              documentos.map((documento) => (
                <DocumentoCard key={documento.id} documento={documento} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder" size={48} color={COLORS.text.disabled} />
                <Text style={styles.emptyText}>No hay documentos subidos</Text>
              </View>
            )}
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
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  
  logo: {
    width: 50,
    height: 50,
    marginRight: SPACING.md,
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.inverse + 'CC',
  },
  
  content: {
    flex: 1,
  },
  
  expedienteInfo: {
    backgroundColor: COLORS.surface,
    margin: SPACING.screenPadding,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  
  expedienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  expedienteNumber: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  
  expedienteNumberText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  
  statusText: {
    ...TYPOGRAPHY.button,
    fontWeight: '600',
  },
  
  caratulaText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    lineHeight: 28,
  },
  
  expedienteDetails: {
    gap: SPACING.md,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  detailLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 100,
  },
  
  detailValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    ...SHADOWS.small,
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  
  tabButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  
  tabButtonTextActive: {
    color: COLORS.text.inverse,
  },
  
  tabContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    ...SHADOWS.small,
  },
  
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  
  addButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.inverse,
    marginLeft: SPACING.xs,
  },
  
  actuacionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  
  actuacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  actuacionType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actuacionTypeText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  
  actuacionDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  actuacionDescription: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  actuacionFooter: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  linkButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  pageButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  
  documentoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  
  documentoIcon: {
    marginRight: SPACING.md,
  },
  
  documentoInfo: {
    flex: 1,
  },
  
  documentoNombre: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  
  documentoSize: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  documentoAction: {
    padding: SPACING.sm,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
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

export default ExpedienteDetailScreen; 
