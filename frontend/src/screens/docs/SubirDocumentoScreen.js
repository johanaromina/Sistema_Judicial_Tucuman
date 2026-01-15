import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import * as DocumentPicker from 'expo-document-picker';
import { useQueryClient } from '@tanstack/react-query';
import { documentosApi } from '../../api/documentos.api';
import { expedientesApi } from '../../api/expedientes.api';

const SubirDocumentoScreen = ({ navigation, route }) => {
  const { expedienteId } = route.params || {};
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    expediente_id: expedienteId || ''
  });
  const [errors, setErrors] = useState({});
  const [expModal, setExpModal] = useState(false);
  const [expQuery, setExpQuery] = useState('');
  const [expLoading, setExpLoading] = useState(false);
  const [expError, setExpError] = useState('');
  const [expResults, setExpResults] = useState([]);
  const [selectedExpediente, setSelectedExpediente] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes || Number.isNaN(Number(bytes))) return 'Tamaño desconocido';
    const mb = Number(bytes) / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        throw new Error('No se pudo leer el archivo seleccionado.');
      }

      setSelectedFile({
        ...asset,
        size: asset.size ?? asset.file?.size ?? null,
      });
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: '' }));
      }
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo. Intenta nuevamente.');
    }
  };

  const resolverExpedienteId = async (input) => {
    const value = (input || '').trim();
    if (!value) throw new Error('Debe indicar el expediente relacionado.');

    // Si es numérico, probar ID; si falla, buscar por número (nro)
    if (/^\d+$/.test(value)) {
      try {
        const byId = await expedientesApi.getExpediente(value);
        const exp = byId?.data?.expediente || byId?.expediente || byId;
        if (exp?.id) return exp.id;
      } catch {}
      const rs = await expedientesApi.quickSearch({ query: value, limit: 5 });
      const lista = rs?.data?.expedientes || rs?.expedientes || [];
      const porNro = lista.find((e) => String(e.nro) === value) || lista[0];
      if (porNro?.id) return porNro.id;
      throw new Error('Expediente no encontrado');
    }

    // Texto: buscar y elegir mejor coincidencia
    const response = await expedientesApi.quickSearch({ query: value, limit: 5 });
    const expedientes = response?.data?.expedientes || response?.expedientes || [];
    const match = expedientes.find((exp) => exp.nro === value) || expedientes[0];
    if (!match?.id) throw new Error('No se encontró un expediente que coincida con el dato ingresado.');
    return match.id;
  };

  // Abrir el selector automáticamente si no hay expediente preseleccionado
  React.useEffect(() => {
    if (!selectedExpediente && !expedienteId) {
      setTimeout(() => setExpModal(true), 300);
    }
  }, []);

  // Autocompletar expedientes con debounce
  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setExpError('');
        setExpLoading(true);
        const rs = await expedientesApi.quickSearch({ query: expQuery, limit: 10 });
        if (!cancelled) setExpResults(rs?.data?.expedientes || rs?.expedientes || []);
      } catch (e) {
        if (!cancelled) setExpError('No se pudieron cargar expedientes');
      } finally {
        if (!cancelled) setExpLoading(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [expQuery]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del documento es requerido';
    }

    if (!selectedFile) {
      newErrors.file = 'Debe seleccionar un archivo';
    }

    if (!selectedExpediente?.id) {
      newErrors.expediente_id = 'Debe seleccionar un expediente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (!selectedExpediente?.id) throw new Error('Debe seleccionar un expediente');
      const expedienteIdResuelto = selectedExpediente.id;

      await documentosApi.subirDocumento({
        expedienteId: expedienteIdResuelto,
        archivo: selectedFile,
        datos: {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ['documentos'] });

      Alert.alert(
        'Éxito',
        'Documento subido correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error al subir documento:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al subir el documento';
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
          <Text style={styles.headerTitle}>Subir Documento</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Información del Documento</Text>
          
          <AppInput
            label="Nombre del Documento"
            placeholder="Ej: Resolución judicial"
            value={formData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            error={errors.nombre}
            leftIcon="document"
          />
          
          <AppInput
            label="Descripción"
            placeholder="Descripción del documento"
            value={formData.descripcion}
            onChangeText={(value) => handleInputChange('descripcion', value)}
            error={errors.descripcion}
            multiline
            numberOfLines={3}
            leftIcon="text"
          />
          
          <AppInput
            label="Tipo de Documento"
            placeholder="Ej: Resolución, Sentencia, Oficio"
            value={formData.tipo}
            onChangeText={(value) => handleInputChange('tipo', value)}
            error={errors.tipo}
            leftIcon="folder"
          />
          
          <AppInput
            label="Expediente"
            placeholder="Número de expediente"
            value={selectedExpediente ? `${selectedExpediente.nro} - ${selectedExpediente.caratula}` : ''}
            onChangeText={() => {}}
            error={errors.expediente_id}
            leftIcon="folder-open"
            rightIcon="search"
            onRightIconPress={() => setExpModal(true)}
            disabled
          />
          
          {/* Selector visible del expediente (opcional) */}
          {selectedExpediente && (
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>Seleccionado:</Text>
              <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.primary }}>{selectedExpediente.nro} - {selectedExpediente.caratula}</Text>
            </View>
          )}

          {/* Selección de archivo */}
          <View style={styles.fileSection}>
            <Text style={styles.fileSectionTitle}>Archivo a Subir</Text>
            
            <TouchableOpacity
              style={styles.fileSelector}
              onPress={handleFileSelection}
              activeOpacity={0.8}
            >
              {selectedFile ? (
                <View style={styles.selectedFile}>
                  <Ionicons name="document" size={24} color={COLORS.primary} />
                  <Text style={styles.selectedFileName}>{selectedFile.name || 'Documento seleccionado'}</Text>
                  <Text style={styles.selectedFileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
              ) : (
                <View style={styles.filePlaceholder}>
                  <Ionicons name="cloud-upload" size={48} color={COLORS.text.disabled} />
                  <Text style={styles.filePlaceholderText}>Seleccionar Archivo</Text>
                  <Text style={styles.filePlaceholderSubtext}>
                    PDF, DOC, DOCX (máx. 10MB)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {errors.file && (
              <Text style={styles.errorText}>{errors.file}</Text>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <AppButton
              title="Cancelar"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
            
            <AppButton
              title="Subir Documento"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !selectedFile || !selectedExpediente}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de búsqueda y selección de expediente */}
      <Modal visible={expModal} transparent animationType="slide" onRequestClose={() => setExpModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: SPACING.screenPadding }}>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, maxHeight: '75%', padding: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.h5, color: COLORS.text.primary, marginBottom: SPACING.md }}>Buscar expediente</Text>
            <AppInput
              label="Buscar"
              placeholder="Número o carátula"
              value={expQuery}
              onChangeText={setExpQuery}
              leftIcon="search"
            />
            {expLoading ? (
              <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.secondary }}>Cargando...</Text>
            ) : expError ? (
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.error }}>{expError}</Text>
            ) : (
              <ScrollView style={{ maxHeight: 350 }}>
                {(expResults || []).map((e) => (
                  <TouchableOpacity key={e.id} style={{ paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border + '55' }} onPress={() => { setSelectedExpediente(e); setFormData((p) => ({ ...p, expediente_id: String(e.id) })); setErrors((pr) => ({ ...pr, expediente_id: '' })); setExpModal(false); }}>
                    <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.primary }}>{e.nro}</Text>
                    <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>{e.caratula}</Text>
                  </TouchableOpacity>
                ))}
                {(!expResults || expResults.length === 0) && (
                  <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>Sin resultados</Text>
                )}
              </ScrollView>
            )}
            <View style={{ alignItems: 'flex-end', marginTop: SPACING.md }}>
              <TouchableOpacity onPress={() => setExpModal(false)}>
                <Text style={{ ...TYPOGRAPHY.button, color: COLORS.primary }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  
  fileSection: {
    marginTop: SPACING.lg,
  },
  
  fileSectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  
  fileSelector: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  
  filePlaceholder: {
    alignItems: 'center',
  },
  
  filePlaceholderText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  
  filePlaceholderSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.disabled,
    textAlign: 'center',
  },
  
  selectedFile: {
    alignItems: 'center',
  },
  
  selectedFileName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  
  selectedFileSize: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  
  cancelButton: {
    flex: 1,
  },
  
  submitButton: {
    flex: 2,
  },
});

export default SubirDocumentoScreen; 

