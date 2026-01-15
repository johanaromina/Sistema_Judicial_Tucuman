import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import JudicialLogo from '../../components/ui/JudicialLogo';
import AnimatedWrapper, { ANIMATION_TYPES } from '../../components/ui/AnimatedWrapper';
import { authApi } from '../../api/auth.api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

// Roles judiciales disponibles
const ROLES_JUDICIALES = [
  { value: 'ADMIN', label: 'Administrador del Sistema' },
  { value: 'JUEZ', label: 'Juez' },
  { value: 'ABOGADO', label: 'Abogado' },
  { value: 'ESCRIBANO', label: 'Escribano' },
  { value: 'SECRETARIO', label: 'Secretario Judicial' },
  { value: 'OPERADOR', label: 'Operador Administrativo' },
  { value: 'AUXILIAR', label: 'Auxiliar Judicial' },
  { value: 'PROCURADOR', label: 'Procurador' },
  { value: 'DEFENSOR', label: 'Defensor Oficial' },
  { value: 'FISCAL', label: 'Fiscal' },
];

const CrearUsuarioScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    institucion: '',
    numeroMatricula: '',
    rol: '', // Asegurar que siempre sea string vacío, no undefined
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const updateFormData = (field, value) => {
    // Validar que el valor no sea undefined
    const safeValue = value !== undefined ? value : '';
    
    setFormData(prev => ({ ...prev, [field]: safeValue }));
    // Limpiar error del campo cuando se modifica
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    }

    if (!formData.institucion.trim()) {
      errors.institucion = 'La institución es requerida';
    }

    if (!formData.numeroMatricula.trim()) {
      errors.numeroMatricula = 'El número de matrícula es requerido';
    } else if (formData.numeroMatricula.length < 3) {
      errors.numeroMatricula = 'El número de matrícula debe tener al menos 3 caracteres';
    }

    if (!formData.rol || !formData.rol.trim()) {
      errors.rol = 'El rol es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrearUsuario = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        nombre: `${formData.nombre} ${formData.apellido}`.trim(),
        email: formData.email.trim(),
        password: formData.password,
        // Intentamos enviar el rol si el backend lo admite; si no, usará el rol por defecto
        rol: formData.rol || undefined,
      };
      await authApi.register(payload);

      Alert.alert(
        'Usuario Creado',
        'Tu cuenta ha sido creada exitosamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudo crear el usuario. Intente nuevamente.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <AnimatedWrapper type={ANIMATION_TYPES.SLIDE_DOWN} duration={800} delay={200}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <JudicialLogo size="large" showText={false} />
            </View>
            <Text style={styles.title}>Crear Usuario</Text>
            <Text style={styles.subtitle}>
              Completa el formulario para crear tu cuenta
            </Text>
          </View>
        </AnimatedWrapper>

        {/* Formulario */}
        <AnimatedWrapper type={ANIMATION_TYPES.SLIDE_UP} duration={600} delay={400}>
          <View style={styles.formContainer}>
            {/* Nombre y Apellido */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AppInput
                  label="Nombre"
                  placeholder="Ingrese su nombre"
                  value={formData.nombre}
                  onChangeText={(value) => updateFormData('nombre', value)}
                  autoCapitalize="words"
                  error={formErrors.nombre}
                />
              </View>
              <View style={styles.halfWidth}>
                <AppInput
                  label="Apellido"
                  placeholder="Ingrese su apellido"
                  value={formData.apellido}
                  onChangeText={(value) => updateFormData('apellido', value)}
                  autoCapitalize="words"
                  error={formErrors.apellido}
                />
              </View>
            </View>

            <AppInput
              label="Email"
              placeholder="Ingrese su email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              error={formErrors.email}
            />

            <AppInput
              label="Teléfono"
              placeholder="Ingrese su teléfono"
              value={formData.telefono}
              onChangeText={(value) => updateFormData('telefono', value)}
              keyboardType="phone-pad"
              leftIcon="call"
              error={formErrors.telefono}
            />

            <AppInput
              label="Institución"
              placeholder="Ingrese su institución"
              value={formData.institucion}
              onChangeText={(value) => updateFormData('institucion', value)}
              autoCapitalize="words"
              leftIcon="business"
              error={formErrors.institucion}
            />

            <AppInput
              label="Número de Matrícula"
              placeholder="Ingrese su número de matrícula"
              value={formData.numeroMatricula}
              onChangeText={(value) => updateFormData('numeroMatricula', value)}
              keyboardType="numeric"
              leftIcon="card"
              error={formErrors.numeroMatricula}
            />

            {/* Selector de Rol */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Rol Judicial</Text>
              <AppButton
                title={formData.rol && formData.rol !== '' ? 
                  ROLES_JUDICIALES.find(r => r.value === formData.rol)?.label || 'Seleccione un rol' :
                  'Seleccione un rol'
                }
                onPress={() => setShowRoleSelector(true)}
                variant="outlined"
                style={styles.roleButton}
                textStyle={styles.roleButtonText}
              />
              {formErrors.rol && (
                <Text style={styles.errorText}>{formErrors.rol}</Text>
              )}
            </View>

            <AppInput
              label="Contraseña"
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              leftIcon="lock-closed"
              error={formErrors.password}
            />

            <AppInput
              label="Confirmar Contraseña"
              placeholder="Confirme su contraseña"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              leftIcon="lock-closed"
              error={formErrors.confirmPassword}
            />

            <AppButton
              title="Crear Usuario"
              onPress={handleCrearUsuario}
              loading={loading}
              fullWidth
              style={styles.crearButton}
            />

            <AppButton
              title="Volver al Login"
              onPress={handleVolver}
              variant="outlined"
              fullWidth
              style={styles.volverButton}
              textStyle={styles.volverButtonText}
            />
          </View>
        </AnimatedWrapper>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SPJT v1.0.0 - Sistema de Procesos Judiciales y Tramitación
          </Text>
        </View>
      </ScrollView>

      {/* Modal Selector de Roles */}
      <Modal
        visible={showRoleSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRoleSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Rol Judicial</Text>
              <TouchableOpacity
                onPress={() => setShowRoleSelector(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.rolesList}>
              {ROLES_JUDICIALES.map((rol) => (
                <TouchableOpacity
                  key={rol.value}
                  style={[
                    styles.roleOption,
                    formData.rol === rol.value && styles.roleOptionSelected
                  ]}
                  onPress={() => {
                    updateFormData('rol', rol.value);
                    setShowRoleSelector(false);
                  }}
                >
                  <Text style={[
                    styles.roleOptionText,
                    formData.rol === rol.value && styles.roleOptionTextSelected
                  ]}>
                    {rol.label}
                  </Text>
                  {formData.rol === rol.value && (
                    <Text style={styles.roleOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: SPACING.xl,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.judicial.blue,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 22,
  },
  
  formContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  
  halfWidth: {
    flex: 1,
  },
  
  pickerContainer: {
    marginBottom: SPACING.md,
  },
  
  pickerLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  
  roleButton: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'flex-start',
  },
  
  roleButtonText: {
    color: COLORS.text.primary,
    textAlign: 'left',
  },
  
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    width: '90%',
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  
  closeButton: {
    padding: SPACING.xs,
  },
  
  closeButtonText: {
    fontSize: 24,
    color: COLORS.text.secondary,
    fontWeight: 'bold',
  },
  
  rolesList: {
    maxHeight: 400,
  },
  
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  roleOptionSelected: {
    backgroundColor: COLORS.primaryLighter,
  },
  
  roleOptionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
  },
  
  roleOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  roleOptionCheck: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  
  crearButton: {
    marginTop: SPACING.lg,
  },
  
  volverButton: {
    marginTop: SPACING.md,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.judicial.orange,
  },
  
  volverButtonText: {
    color: COLORS.judicial.orange,
    fontWeight: '600',
  },
  
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
  },
  
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default CrearUsuarioScreen; 
