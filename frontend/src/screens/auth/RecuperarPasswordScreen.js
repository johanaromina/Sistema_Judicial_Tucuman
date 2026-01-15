import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import JudicialLogo from '../../components/ui/JudicialLogo';
import AnimatedWrapper, { ANIMATION_TYPES } from '../../components/ui/AnimatedWrapper';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const RecuperarPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'El email no es válido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRecuperarPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular envío de email de recuperación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Email Enviado',
        'Se ha enviado un enlace de recuperación a tu correo electrónico.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el email de recuperación. Intente nuevamente.');
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
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu email para recibir un enlace de recuperación
            </Text>
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

            <AppButton
              title="Enviar Email de Recuperación"
              onPress={handleRecuperarPassword}
              loading={loading}
              fullWidth
              style={styles.recuperarButton}
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
  
  recuperarButton: {
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

export default RecuperarPasswordScreen; 