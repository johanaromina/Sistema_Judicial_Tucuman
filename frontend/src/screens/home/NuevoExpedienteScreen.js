import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { expedientesApi } from '../../api/expedientes.api';
import { institucionesApi } from '../../api/instituciones.api';
import { EXPEDIENTE_CONFIG } from '../../config/env';
import { Modal } from 'react-native';

const NuevoExpedienteScreen = ({ navigation }) => {
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const generateNro = () => {
    const prefix = EXPEDIENTE_CONFIG?.PREFIX || 'EXP';
    const yearFmt = (EXPEDIENTE_CONFIG?.YEAR_FORMAT || 'YYYY').toUpperCase();
    const now = new Date();
    const year = yearFmt === 'YYYY' ? now.getFullYear() : String(now.getFullYear()).slice(-2);
    const rand = String(Math.floor(10000 + Math.random() * 90000));
    return `${prefix}-${year}-${rand}`;
  };

  const [formData, setFormData] = useState({
    nro: '',
    caratula: '',
    fuero: '',
    institucion_id: '',
    institucion_nombre: ''
  });
  const [errors, setErrors] = useState({});
  const [instModal, setInstModal] = useState(false);
  const [instituciones, setInstituciones] = useState([]);
  const [instLoading, setInstLoading] = useState(false);
  const [instError, setInstError] = useState('');
  const [instQuery, setInstQuery] = useState('');

  React.useEffect(() => {
    // Autogenerar nro al montar
    setFormData(prev => ({ ...prev, nro: generateNro() }));
    // Cargar instituciones
    (async () => { await cargarInstituciones(); })();
  }, []);

  const cargarInstituciones = async (search = '') => {
    try {
      setInstError('');
      setInstLoading(true);
      const list = await institucionesApi.listar({ limit: 200, search });
      setInstituciones(list);
    } catch (e) {
      setInstError(e?.response?.data?.message || 'No se pudieron cargar las instituciones');
    } finally {
      setInstLoading(false);
    }
  };

  // Búsqueda con pequeño debounce
  React.useEffect(() => {
    const t = setTimeout(() => { cargarInstituciones(instQuery); }, 300);
    return () => clearTimeout(t);
  }, [instQuery]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nro.trim()) {
      newErrors.nro = 'El número de expediente es requerido';
    }

    if (!formData.caratula.trim()) {
      newErrors.caratula = 'La carátula es requerida';
    } else if (formData.caratula.length < 10) {
      newErrors.caratula = 'La carátula debe tener al menos 10 caracteres';
    }

    if (!formData.fuero.trim()) {
      newErrors.fuero = 'El fuero es requerido';
    }

    if (instituciones.length > 0 && !formData.institucion_id) {
      newErrors.institucion_id = 'La institución es requerida';
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
      const payload = {
        nro: formData.nro.trim(),
        caratula: formData.caratula.trim(),
        fuero: formData.fuero.trim(),
        institucion_id: formData.institucion_id || undefined,
      };
      const res = await expedientesApi.crearExpediente(payload);
      const ok = res?.success !== false;
      const created = res?.data?.expediente || res?.data?.data?.expediente || res?.expediente;
      if (ok && created?.id) {
        // Ofrecer opciones de navegación (en Web usar confirm)
        if (Platform.OS === 'web') {
          try {
            const goList = window.confirm(`Expediente creado\nN° ${created.nro}\n\n¿Ir a la lista? (Cancelar: Ver detalle)`);
            if (goList) {
              navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'Expedientes', params: { toast: 'Expediente creado', highlightId: created.id } } });
            } else {
              navigation.navigate('ExpedienteDetail', { id: created.id });
            }
          } catch {
            navigation.navigate('ExpedienteDetail', { id: created.id });
          }
        } else {
          Alert.alert(
            'Expediente creado',
            `N° ${created.nro}\n¿Qué deseas hacer ahora?`,
            [
              { text: 'Ir a la lista', onPress: () => navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'Expedientes', params: { toast: 'Expediente creado', highlightId: created.id } } }) },
              { text: 'Ver detalle', onPress: () => navigation.navigate('ExpedienteDetail', { id: created.id }) }
            ]
          );
        }
      } else if (ok) {
        // Fallback: ir a la lista con toast
        navigation.navigate('MainTabs', { screen: 'Expedientes', params: { toast: 'Expediente creado' } });
      } else {
        throw new Error(res?.message || 'No se pudo crear el expediente');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Error al crear el expediente';
      Alert.alert('Error', msg);
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
          <Text style={styles.headerTitle}>Nuevo Expediente</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Información del Expediente</Text>
          
          <AppInput
            label="Número de Expediente"
            placeholder="Ej: EXP-2024-001"
            value={formData.nro}
            onChangeText={(value) => handleInputChange('nro', value)}
            error={errors.nro}
            leftIcon="document"
          />
          <View style={{ alignItems: 'flex-end', marginTop: -SPACING.sm, marginBottom: SPACING.sm }}>
            <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, nro: generateNro() }))}>
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '600' }}>Regenerar número</Text>
            </TouchableOpacity>
          </View>
          
          <AppInput
            label="Carátula"
            placeholder="Descripción del caso judicial"
            value={formData.caratula}
            onChangeText={(value) => handleInputChange('caratula', value)}
            error={errors.caratula}
            multiline
            numberOfLines={3}
            leftIcon="text"
          />
          
          <AppInput
            label="Fuero"
            placeholder="Ej: Civil, Penal, Comercial"
            value={formData.fuero}
            onChangeText={(value) => handleInputChange('fuero', value)}
            error={errors.fuero}
            leftIcon="business"
          />
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary, marginBottom: SPACING.xs }}>Institución</Text>
            <TouchableOpacity onPress={() => setInstModal(true)} style={{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={18} color={COLORS.text.secondary} />
              <Text style={{ marginLeft: SPACING.sm, color: formData.institucion_nombre ? COLORS.text.primary : COLORS.text.disabled }}>
                {formData.institucion_nombre || 'Seleccionar institución'}
              </Text>
            </TouchableOpacity>
            {!!errors.institucion_id && (
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.error, marginTop: SPACING.xs }}>{errors.institucion_id}</Text>
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
              title="Crear Expediente"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </View>
  </ScrollView>
      {/* Modal de instituciones */}
      <Modal visible={instModal} animationType="slide" transparent onRequestClose={() => setInstModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: SPACING.screenPadding }}>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, maxHeight: '70%', padding: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.h5, color: COLORS.text.primary, marginBottom: SPACING.md }}>Seleccionar institución</Text>
            {/* Buscador */}
            <AppInput
              label="Buscar"
              placeholder="Escribe para filtrar instituciones"
              value={instQuery}
              onChangeText={setInstQuery}
              leftIcon="search"
            />

            {instLoading ? (
              <View style={{ paddingVertical: SPACING.lg, alignItems: 'center' }}>
                <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.secondary }}>Cargando instituciones...</Text>
              </View>
            ) : instError ? (
              <View style={{ paddingVertical: SPACING.md }}>
                <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.error }}>{instError}</Text>
                <TouchableOpacity onPress={cargarInstituciones} style={{ marginTop: SPACING.sm }}>
                  <Text style={{ ...TYPOGRAPHY.button, color: COLORS.primary }}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : instituciones.length === 0 ? (
              <View style={{ paddingVertical: SPACING.lg }}>
                <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>No hay instituciones disponibles.</Text>
              </View>
            ) : (
              <ScrollView>
                {instituciones.map((i) => (
                  <TouchableOpacity key={i.id} style={{ paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border + '55' }} onPress={() => { setFormData(prev => ({ ...prev, institucion_id: i.id, institucion_nombre: i.nombre })); setErrors(prev => ({ ...prev, institucion_id: '' })); setInstModal(false); }}>
                    <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.primary }}>{i.nombre}</Text>
                    {!!i.tipo && <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.text.secondary }}>{i.tipo}</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View style={{ alignItems: 'flex-end', marginTop: SPACING.md }}>
              <TouchableOpacity onPress={() => setInstModal(false)}>
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

export default NuevoExpedienteScreen; 
