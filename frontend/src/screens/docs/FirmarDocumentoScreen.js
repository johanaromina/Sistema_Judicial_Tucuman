import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Platform,
  ToastAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { documentosApi } from '../../api/documentos.api';
import { useRoute } from '@react-navigation/native';

const FirmarDocumentoScreen = ({ navigation, route }) => {
  const r = useRoute();
  const { documentoId, expedienteId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_firma: 'demo',
    pin: '',
    comentario: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [docModal, setDocModal] = useState(false);
  const [docQuery, setDocQuery] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docResults, setDocResults] = useState([]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tipo_firma) {
      newErrors.tipo_firma = 'Debe seleccionar un tipo de firma';
    }

    if (formData.tipo_firma === 'token' && !formData.pin.trim()) {
      newErrors.pin = 'El PIN es requerido para firma con token';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cargar documento inicial o abrir selector
  useEffect(() => {
    (async () => {
      try {
        if (documentoId) {
          const rs = await documentosApi.getDocumento(documentoId);
          const doc = rs?.data?.documento || rs?.documento || rs;
          if (doc?.id) setSelectedDocumento(doc);
        } else {
          setTimeout(() => setDocModal(true), 200);
        }
      } catch (_) {
        setTimeout(() => setDocModal(true), 200);
      }
    })();
  }, []);

  // Búsqueda de documentos para el modal
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setDocError('');
        setDocLoading(true);
        const rs = await documentosApi.getDocumentos({ query: docQuery, expediente_id: expedienteId });
        if (!cancelled) setDocResults(rs?.data?.documentos || rs?.documentos || []);
      } catch (e) {
        if (!cancelled) setDocError('No se pudieron cargar documentos');
      } finally {
        if (!cancelled) setDocLoading(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [docQuery]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedDocumento || !selectedDocumento.id) {
      Alert.alert('Error', 'Debes seleccionar el documento a firmar');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      let response;
      const targetId = selectedDocumento.id;

      if (formData.tipo_firma === 'demo') {
        response = await documentosApi.firmarDemo(targetId, {
          comentario: formData.comentario
        });
      } else if (formData.tipo_firma === 'token') {
        const preparacion = await documentosApi.prepararFirmaToken(targetId, {
          comentario: formData.comentario
        });

        // Simulación de firma con token para el prototipo
        const firmaBase64 = 'U1BKVF9UT0tFTl9ERU1P'; // "SPJT_TOKEN_DEMO" en base64

        response = await documentosApi.completarFirmaToken(targetId, {
          solicitudId: preparacion.data?.solicitudId,
          firmaBase64,
          certificadoSn: 'TOKEN-DEMO-CERT',
          referenciaExterna: preparacion.data?.parametros?.nonce,
          comentario: formData.comentario,
          metadatosAdicionales: {
            modo: 'simulado',
            mensaje: 'Firma con token simulada en prototipo'
          }
        });
      } else if (formData.tipo_firma === 'hsm') {
        response = await documentosApi.firmarHSM(targetId, {
          comentario: formData.comentario
        });
      }

      setStatus({ type: 'success', message: response?.message || 'Documento firmado correctamente' });
      navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'Documentos', params: { toast: 'Documento firmado', highlightId: selectedDocumento.id } } });
    } catch (error) {
      console.error('Error al firmar documento:', error);
      const message = error.response?.data?.message || 'Error al firmar el documento';
      setStatus({ type: 'error', message });
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const FirmaTypeOption = ({ type, title, description, icon, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.firmaTypeOption, isSelected && styles.firmaTypeOptionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.firmaTypeHeader}>
        <View style={[styles.firmaTypeIcon, { backgroundColor: (isSelected ? COLORS.primary : COLORS.text.secondary) + '20' }]}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isSelected ? COLORS.primary : COLORS.text.secondary} 
          />
        </View>
        <View style={styles.firmaTypeInfo}>
          <Text style={[styles.firmaTypeTitle, isSelected && styles.firmaTypeTitleSelected]}>
            {title}
          </Text>
          <Text style={[styles.firmaTypeDescription, isSelected && styles.firmaTypeDescriptionSelected]}>
            {description}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>Firmar Documento</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Configuración de Firma</Text>
          
          {/* Información del documento + selector */}
          <View style={styles.documentInfo}>
            <View style={styles.documentIcon}>
              <Ionicons name="document" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.documentDetails}>
              <Text style={styles.documentTitle}>Documento a Firmar</Text>
              {selectedDocumento ? (
                <>
                  <Text style={styles.documentName}>{selectedDocumento.nombre}</Text>
                  <Text style={styles.documentSize}>
                    {(selectedDocumento.size / 1024 / 1024).toFixed(2)} MB - {selectedDocumento.tipo_mime?.toUpperCase() || 'N/A'}
                  </Text>
                </>
              ) : (
                <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>Selecciona un documento</Text>
              )}
            </View>
            <TouchableOpacity style={styles.changeButton} onPress={() => setDocModal(true)}>
              <Ionicons name="search" size={18} color={COLORS.primary} />
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.primary, marginLeft: SPACING.xs }}>Cambiar</Text>
            </TouchableOpacity>
          </View>

          {/* Modal: seleccionar documento */}
          <Modal visible={docModal} transparent animationType="slide" onRequestClose={() => setDocModal(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: SPACING.screenPadding }}>
              <View style={{ backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, maxHeight: '75%', padding: SPACING.md }}>
                <Text style={{ ...TYPOGRAPHY.h5, color: COLORS.text.primary, marginBottom: SPACING.md }}>Seleccionar documento</Text>
                <AppInput label="Buscar" placeholder="Nombre o número de expediente" value={docQuery} onChangeText={setDocQuery} leftIcon="search" />
                {docLoading ? (
                  <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.secondary }}>Cargando...</Text>
                ) : docError ? (
                  <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.error }}>{docError}</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 350 }}>
                    {(docResults || []).map((d) => (
                      <TouchableOpacity key={d.id} style={{ paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border + '55' }} onPress={() => { setSelectedDocumento(d); setDocModal(false); }}>
                        <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.primary }}>{d.nombre}</Text>
                        <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>Exp: {d.expediente_nro || 'N/A'} · {(d.size/1024/1024).toFixed(2)} MB</Text>
                      </TouchableOpacity>
                    ))}
                    {(!docResults || docResults.length === 0) && (
                      <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>Sin resultados</Text>
                    )}
                  </ScrollView>
                )}
                <View style={{ alignItems: 'flex-end', marginTop: SPACING.md }}>
                  <TouchableOpacity onPress={() => setDocModal(false)}>
                    <Text style={{ ...TYPOGRAPHY.button, color: COLORS.primary }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          
          {/* Tipo de firma */}
          <View style={styles.firmaTypeSection}>
            <Text style={styles.sectionTitle}>Tipo de Firma</Text>
            
            <FirmaTypeOption
              type="demo"
              title="Firma Demo"
              description="Firma de prueba para desarrollo"
              icon="flask"
              isSelected={formData.tipo_firma === 'demo'}
              onPress={() => handleInputChange('tipo_firma', 'demo')}
            />
            
            <FirmaTypeOption
              type="token"
              title="Firma con Token"
              description="Firma segura con dispositivo físico"
              icon="key"
              isSelected={formData.tipo_firma === 'token'}
              onPress={() => handleInputChange('tipo_firma', 'token')}
            />
            
            <FirmaTypeOption
              type="hsm"
              title="Firma HSM"
              description="Firma con módulo de seguridad"
              icon="shield-checkmark"
              isSelected={formData.tipo_firma === 'hsm'}
              onPress={() => handleInputChange('tipo_firma', 'hsm')}
            />
          </View>
          
          {/* Campos adicionales según tipo de firma */}
          {formData.tipo_firma === 'token' && (
            <View style={styles.pinSection}>
              <AppInput
                label="PIN de Seguridad"
                placeholder="Ingrese su PIN"
                value={formData.pin}
                onChangeText={(value) => handleInputChange('pin', value)}
                error={errors.pin}
                secureTextEntry
                leftIcon="lock-closed"
              />
            </View>
          )}
          
          <AppInput
            label="Comentario (Opcional)"
            placeholder="Agregar comentario sobre la firma"
            value={formData.comentario}
            onChangeText={(value) => handleInputChange('comentario', value)}
            error={errors.comentario}
            multiline
            numberOfLines={3}
            leftIcon="chatbubble"
          />
          
          {/* Información de seguridad */}
          <View style={styles.securityInfo}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
              <Text style={styles.securityTitle}>Información de Seguridad</Text>
            </View>
            <Text style={styles.securityText}>
              • La firma será verificada criptográficamente{'\n'}
              • Se registrará en el sistema de auditoría{'\n'}
              • El documento quedará protegido contra modificaciones
            </Text>
          </View>

          {status && (
            <View
              style={[
                styles.statusBanner,
                status.type === 'success' ? styles.statusSuccess : styles.statusError
              ]}
            >
              <Ionicons
                name={status.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={status.type === 'success' ? COLORS.success : COLORS.error}
              />
              <Text
                style={[
                  styles.statusText,
                  status.type === 'success' ? styles.statusTextSuccess : styles.statusTextError
                ]}
              >
                {status.message}
              </Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <AppButton
              title="Cancelar"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
            
            <AppButton
              title="Firmar Documento"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !selectedDocumento}
              style={styles.submitButton}
            />
          </View>
        </View>
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
  
  formContainer: {
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
  },
  
  formTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  
  documentInfo: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  
  documentIcon: {
    marginRight: SPACING.md,
  },
  
  documentDetails: {
    flex: 1,
  },
  
  documentTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  
  documentName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  documentSize: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  
  firmaTypeSection: {
    marginBottom: SPACING.lg,
  },
  
  sectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  
  firmaTypeOption: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  
  firmaTypeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  
  firmaTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  firmaTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  
  firmaTypeInfo: {
    flex: 1,
  },
  
  firmaTypeTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  firmaTypeTitleSelected: {
    color: COLORS.primary,
  },
  
  firmaTypeDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  
  firmaTypeDescriptionSelected: {
    color: COLORS.primary + 'CC',
  },
  
  pinSection: {
    marginBottom: SPACING.md,
  },
  
  securityInfo: {
    backgroundColor: COLORS.success + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  securityTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  
  securityText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.success + 'CC',
    lineHeight: 20,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },

  statusSuccess: {
    backgroundColor: COLORS.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },

  statusError: {
    backgroundColor: COLORS.error + '20',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },

  statusText: {
    ...TYPOGRAPHY.body2,
    flex: 1,
  },

  statusTextSuccess: {
    color: COLORS.success,
  },

  statusTextError: {
    color: COLORS.error,
  },
  
  cancelButton: {
    flex: 1,
  },
  
  submitButton: {
    flex: 2,
  },
});

export default FirmarDocumentoScreen; 



