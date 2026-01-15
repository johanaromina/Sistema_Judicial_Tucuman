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
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../types';

const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await login(data);
      
      if (result.success) {
        // El login se maneja automáticamente en el contexto
        reset();
      } else {
        Alert.alert('Error', result.error || 'Error en el login');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado en el login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
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
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Title style={styles.appTitle}>{APP_CONFIG.NAME}</Title>
          <Paragraph style={styles.appSubtitle}>
            Sistema de Procesos Judiciales
          </Paragraph>
        </View>

        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.loginTitle}>Iniciar Sesión</Title>
            
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  error={!!errors.email}
                  disabled={isLoading}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Contraseña"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  error={!!errors.password}
                  disabled={isLoading}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.loginButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>

            <View style={styles.helpContainer}>
              <Button
                mode="text"
                onPress={() => Alert.alert('Ayuda', 'Contacta al administrador del sistema')}
                style={styles.helpButton}
              >
                ¿Necesitas ayuda?
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Versión {APP_CONFIG.VERSION} - Build {APP_CONFIG.BUILD}
          </Text>
          <Text style={styles.footerText}>
            {APP_CONFIG.SUPPORT_EMAIL}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  loginCard: {
    elevation: 4,
    borderRadius: 12,
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 20,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default LoginScreen; 