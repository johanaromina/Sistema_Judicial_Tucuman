import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Card, Title, Paragraph, Button, Switch, Divider, List, Avatar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, APP_CONFIG } from '../types';

const PerfilScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Administrador';
      case USER_ROLES.JUEZ:
        return 'Juez';
      case USER_ROLES.SECRETARIO:
        return 'Secretario';
      case USER_ROLES.OPERADOR:
        return 'Operador';
      default:
        return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return '👑';
      case USER_ROLES.JUEZ:
        return '⚖️';
      case USER_ROLES.SECRETARIO:
        return '📋';
      case USER_ROLES.OPERADOR:
        return '🔧';
      default:
        return '👤';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error en logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    // TODO: Implementar cambio de contraseña
    Alert.alert('Cambio de Contraseña', 'Funcionalidad en desarrollo');
  };

  const handleEditProfile = () => {
    // TODO: Implementar edición de perfil
    Alert.alert('Editar Perfil', 'Funcionalidad en desarrollo');
  };

  const handleSecuritySettings = () => {
    // TODO: Implementar configuración de seguridad
    Alert.alert('Configuración de Seguridad', 'Funcionalidad en desarrollo');
  };

  const handleDataExport = () => {
    // TODO: Implementar exportación de datos
    Alert.alert('Exportar Datos', 'Funcionalidad en desarrollo');
  };

  const handlePrivacyPolicy = () => {
    // TODO: Mostrar política de privacidad
    Alert.alert('Política de Privacidad', 'Funcionalidad en desarrollo');
  };

  const handleTermsOfService = () => {
    // TODO: Mostrar términos de servicio
    Alert.alert('Términos de Servicio', 'Funcionalidad en desarrollo');
  };

  const handleSupport = () => {
    // TODO: Abrir soporte
    Alert.alert('Soporte', `Contacta a: ${APP_CONFIG.SUPPORT_EMAIL}`);
  };

  const handleAbout = () => {
    Alert.alert(
      'Acerca de SPJT',
      `${APP_CONFIG.NAME}\n\nVersión: ${APP_CONFIG.VERSION}\nBuild: ${APP_CONFIG.BUILD}\n\nSistema de Procesos Judiciales\n\n© 2024 SPJT - Todos los derechos reservados`
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header del perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={80}
            label={`${user?.nombre?.charAt(0)}${user?.apellido?.charAt(0)}`}
            style={styles.avatar}
          />
        </View>
        
        <View style={styles.userInfo}>
          <Title style={styles.userName}>
            {user?.nombre} {user?.apellido}
          </Title>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleIcon}>{getRoleIcon(user?.rol)}</Text>
            <Text style={styles.roleText}>{getRoleDisplayName(user?.rol)}</Text>
          </View>
          <Text style={styles.userInstitution}>{user?.institucion}</Text>
        </View>
      </View>

      {/* Información del perfil */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Información del Perfil</Title>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID de Usuario:</Text>
            <Text style={styles.infoValue}>{user?.id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user?.nombre}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Apellido:</Text>
            <Text style={styles.infoValue}>{user?.apellido}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol:</Text>
            <Text style={styles.infoValue}>{getRoleDisplayName(user?.rol)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Institución:</Text>
            <Text style={styles.infoValue}>{user?.institucion}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[styles.infoValue, { color: '#4caf50' }]}>Activo</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Configuración */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Configuración</Title>
          
          <List.Item
            title="Notificaciones Push"
            description="Recibir notificaciones de eventos importantes"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color="#1976d2"
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Modo Oscuro"
            description="Cambiar el tema de la aplicación"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                color="#1976d2"
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Autenticación Biométrica"
            description="Usar huella dactilar o Face ID para login"
            left={(props) => <List.Icon {...props} icon="fingerprint" />}
            right={() => (
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                color="#1976d2"
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Acciones del perfil */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Acciones</Title>
          
          <Button
            mode="outlined"
            icon="pencil"
            onPress={handleEditProfile}
            style={styles.actionButton}
          >
            Editar Perfil
          </Button>
          
          <Button
            mode="outlined"
            icon="lock"
            onPress={handleChangePassword}
            style={styles.actionButton}
          >
            Cambiar Contraseña
          </Button>
          
          <Button
            mode="outlined"
            icon="shield"
            onPress={handleSecuritySettings}
            style={styles.actionButton}
          >
            Configuración de Seguridad
          </Button>
          
          <Button
            mode="outlined"
            icon="download"
            onPress={handleDataExport}
            style={styles.actionButton}
          >
            Exportar Mis Datos
          </Button>
        </Card.Content>
      </Card>

      {/* Información y soporte */}
      <Card style={styles.supportCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Información y Soporte</Title>
          
          <List.Item
            title="Política de Privacidad"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            onPress={handlePrivacyPolicy}
          />
          
          <Divider />
          
          <List.Item
            title="Términos de Servicio"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={handleTermsOfService}
          />
          
          <Divider />
          
          <List.Item
            title="Soporte Técnico"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={handleSupport}
          />
          
          <Divider />
          
          <List.Item
            title="Acerca de SPJT"
            left={(props) => <List.Icon {...props} icon="information" />}
            onPress={handleAbout}
          />
        </Card.Content>
      </Card>

      {/* Botón de logout */}
      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#f44336"
        >
          Cerrar Sesión
        </Button>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {APP_CONFIG.NAME} v{APP_CONFIG.VERSION}
        </Text>
        <Text style={styles.footerText}>
          © 2024 SPJT - Todos los derechos reservados
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#1976d2',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'capitalize',
  },
  userInstitution: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  profileCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  supportCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  actionButton: {
    marginBottom: 12,
    borderColor: '#1976d2',
  },
  logoutContainer: {
    padding: 16,
    paddingTop: 8,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default PerfilScreen; 