import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';

import AnimatedWrapper, { ANIMATION_TYPES } from '../../components/ui/AnimatedWrapper';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const LoginScreen = ({ navigation }) => {
  const { signIn, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'El email no es válido';
    }

    if (!password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    clearError();

    try {
      const result = await signIn(email, password);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Error en el inicio de sesión');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
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
              <Image
                source={require('../../../assets/images (1).jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Sistema de Procesos Judiciales</Text>
            <Text style={styles.subtitle}>Iniciar Sesión</Text>
          </View>
        </AnimatedWrapper>

        {/* Formulario */}
        <AnimatedWrapper type={ANIMATION_TYPES.SLIDE_UP} duration={600} delay={400}>
          <View style={styles.formContainer}>
            <AppInput
              label="Email"
              placeholder="Ingrese su email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              error={formErrors.email}
            />

            <AppInput
              label="Contraseña"
              placeholder="Ingrese su contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock-closed"
            error={formErrors.password}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AppButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          {/* Botones adicionales */}
          <View style={styles.additionalButtonsContainer}>
            <AppButton
              title="¿Olvidaste tu contraseña?"
              onPress={() => navigation?.navigate('RecuperarPassword')}
              variant="text"
              style={styles.textButton}
              textStyle={styles.textButtonText}
            />
            
            <AppButton
              title="Crear Usuario"
              onPress={() => navigation?.navigate('CrearUsuario')}
              variant="outlined"
              style={styles.outlinedButton}
              textStyle={styles.outlinedButtonText}
            />
          </View>

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              ¿Necesita ayuda? Contacte al administrador
            </Text>
          </View>
        </View>
        </AnimatedWrapper>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SPJT v1.0.0 - Sistema de Procesos Judiciales y Tramitación
          </Text>
        </View>
      </ScrollView>
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
  
  logo: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.judicial.blue,
    ...SHADOWS.medium,
  },
  
  logoText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.inverse,
    fontSize: 24,
  },
  
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.judicial.blue,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  
  subtitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.judicial.orange,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  formContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  
  errorText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.error,
    textAlign: 'center',
  },
  
  loginButton: {
    marginTop: SPACING.lg,
  },
  
  additionalButtonsContainer: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  
  textButtonText: {
    color: COLORS.judicial.orange,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.judicial.blue,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  
  outlinedButtonText: {
    color: COLORS.judicial.blue,
    fontSize: 14,
    fontWeight: '600',
  },
  
  helpContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  
  helpText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    textAlign: 'center',
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

export default LoginScreen; 