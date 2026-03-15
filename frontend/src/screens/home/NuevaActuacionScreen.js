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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { expedientesApi } from '../../api/expedientes.api';

const getToday = () => new Date().toISOString().slice(0, 10);

const NuevaActuacionScreen = ({ navigation, route }) => {
  const { expedienteId } = route.params || {};
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: '',
    descripcion: '',
    fecha: getToday(),
    expediente_id: expedienteId || '',
  });
  const [errors, setErrors] = useState({});
  const [expModal, setExpModal] = useState(false);
  const [expQuery, setExpQuery] = useState('');
  const [expLoading, setExpLoading] = useState(false);
  const [expError, setExpError] = useState('');
  const [expResults, setExpResults] = useState([]);
  const [selectedExpediente, setSelectedExpediente] = useState(null);
  const currentExpedienteId = selectedExpediente?.id || formData.expediente_id || expedienteId || '';

  React.useEffect(() => {
    let cancelled = false;

    const preloadExpediente = async () => {
      if (!expedienteId || selectedExpediente?.id) {
        return;
      }

      try {
        const response = await expedientesApi.getExpediente(expedienteId);
        const expediente = response?.data?.expediente || response?.expediente || response;

        if (cancelled || !expediente?.id) {
          return;
        }

        setSelectedExpediente(expediente);
        setFormData((prev) => ({ ...prev, expediente_id: String(expediente.id) }));
      } catch (error) {
        if (!cancelled) {
          setExpError('No se pudo cargar el expediente seleccionado.');
        }
      }
    };

    preloadExpediente();

    return () => {
      cancelled = true;
    };
  }, [expedienteId, selectedExpediente?.id]);

  React.useEffect(() => {
    if (!selectedExpediente && !expedienteId) {
      const timer = setTimeout(() => setExpModal(true), 300);
      return () => clearTimeout(timer);
    }
  }, [expedienteId, selectedExpediente]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setExpError('');
        setExpLoading(true);
        const rs = await expedientesApi.quickSearch({ query: expQuery, limit: 10 });
        if (!cancelled) {
          setExpResults(rs?.data?.expedientes || rs?.expedientes || []);
        }
      } catch (error) {
        if (!cancelled) {
          setExpError('No se pudieron cargar expedientes');
        }
      } finally {
        if (!cancelled) {
          setExpLoading(false);
        }
      }
    };

    const timer = setTimeout(run, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [expQuery]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!currentExpedienteId) {
      newErrors.expediente_id = 'Debe seleccionar un expediente';
    }

    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo de actuación es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 5) {
      newErrors.descripcion = 'La descripción debe tener al menos 5 caracteres';
    }

    if (!formData.fecha.trim()) {
      newErrors.fecha = 'La fecha es requerida';
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
      const expedienteIdResuelto = currentExpedienteId;
      const payload = {
        tipo: formData.tipo.trim(),
        descripcion: formData.descripcion.trim(),
        fecha: formData.fecha.trim(),
      };

      await expedientesApi.crearActuacion(expedienteIdResuelto, payload);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['actuaciones', expedienteIdResuelto] }),
        queryClient.invalidateQueries({ queryKey: ['expediente', expedienteIdResuelto] }),
      ]);

      Alert.alert(
        'Éxito',
        'Actuación creada correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'No se pudo crear la actuación';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Nueva Actuación</Text>
          <Text style={styles.headerSubtitle}>Poder Judicial de Tucumán</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Registrar actuación</Text>

          <AppInput
            label="Expediente"
            placeholder="Seleccionar expediente"
            value={selectedExpediente ? `${selectedExpediente.nro} - ${selectedExpediente.caratula}` : ''}
            onChangeText={() => {}}
            error={errors.expediente_id || expError}
            leftIcon="folder-open"
            rightIcon="search"
            onRightIconPress={() => setExpModal(true)}
            disabled
          />

          {selectedExpediente && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>Seleccionado:</Text>
              <Text style={styles.selectedValue}>{selectedExpediente.nro} - {selectedExpediente.caratula}</Text>
            </View>
          )}

          <AppInput
            label="Tipo de actuación"
            placeholder="Ej: Providencia, Informe, Pase"
            value={formData.tipo}
            onChangeText={(value) => handleInputChange('tipo', value)}
            error={errors.tipo}
            leftIcon="document-text"
          />

          <AppInput
            label="Descripción"
            placeholder="Detalle de la actuación"
            value={formData.descripcion}
            onChangeText={(value) => handleInputChange('descripcion', value)}
            error={errors.descripcion}
            multiline
            numberOfLines={4}
            leftIcon="create"
          />

          <AppInput
            label="Fecha"
            placeholder="YYYY-MM-DD"
            value={formData.fecha}
            onChangeText={(value) => handleInputChange('fecha', value)}
            error={errors.fecha}
            leftIcon="calendar"
          />

          <View style={styles.buttonContainer}>
            <AppButton
              title="Cancelar"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />

            <AppButton
              title="Guardar Actuación"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={expModal} transparent animationType="slide" onRequestClose={() => setExpModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buscar expediente</Text>
            <AppInput
              label="Buscar"
              placeholder="Número o carátula"
              value={expQuery}
              onChangeText={setExpQuery}
              leftIcon="search"
            />

            {expLoading ? (
              <Text style={styles.modalMessage}>Cargando...</Text>
            ) : expError ? (
              <Text style={styles.modalError}>{expError}</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {(expResults || []).map((exp) => (
                  <TouchableOpacity
                    key={exp.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedExpediente(exp);
                      setFormData((prev) => ({ ...prev, expediente_id: String(exp.id) }));
                      setErrors((prev) => ({ ...prev, expediente_id: '' }));
                      setExpModal(false);
                    }}
                  >
                    <Text style={styles.modalItemTitle}>{exp.nro}</Text>
                    <Text style={styles.modalItemSubtitle}>{exp.caratula}</Text>
                  </TouchableOpacity>
                ))}
                {(!expResults || expResults.length === 0) && (
                  <Text style={styles.modalMessage}>Sin resultados</Text>
                )}
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setExpModal(false)}>
                <Text style={styles.modalClose}>Cerrar</Text>
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
  selectedContainer: {
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  selectedLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  selectedValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: SPACING.screenPadding,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: '75%',
    padding: SPACING.md,
    ...SHADOWS.large,
  },
  modalTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  modalList: {
    maxHeight: 350,
  },
  modalItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '55',
  },
  modalItemTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  modalItemSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  modalMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  modalError: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
  },
  modalFooter: {
    alignItems: 'flex-end',
    marginTop: SPACING.md,
  },
  modalClose: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },
});

export default NuevaActuacionScreen;
