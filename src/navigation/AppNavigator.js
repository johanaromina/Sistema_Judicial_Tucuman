import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../types';

// Importar pantallas (se crearán después)
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ExpedientesScreen from '../screens/ExpedientesScreen';
import DocumentosScreen from '../screens/DocumentosScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
import AuditoriaScreen from '../screens/AuditoriaScreen';
import PerfilScreen from '../screens/PerfilScreen';

// Importar componentes de navegación
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';
import CustomTabBar from '../components/navigation/CustomTabBar';

// Crear navegadores
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Navegador de tabs para usuarios autenticados
const TabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Inicio',
          iconName: 'home'
        }}
      />
      
      <Tab.Screen 
        name="Expedientes" 
        component={ExpedientesScreen}
        options={{
          title: 'Expedientes',
          iconName: 'folder'
        }}
      />
      
      <Tab.Screen 
        name="Documentos" 
        component={DocumentosScreen}
        options={{
          title: 'Documentos',
          iconName: 'document'
        }}
      />
      
      {/* Solo mostrar para roles administrativos */}
      {(user?.rol === USER_ROLES.ADMIN || user?.rol === USER_ROLES.SECRETARIO) && (
        <Tab.Screen 
          name="Usuarios" 
          component={UsuariosScreen}
          options={{
            title: 'Usuarios',
            iconName: 'people'
          }}
        />
      )}
      
      {/* Solo mostrar para roles administrativos */}
      {(user?.rol === USER_ROLES.ADMIN || user?.rol === USER_ROLES.SECRETARIO) && (
        <Tab.Screen 
          name="Auditoria" 
          component={AuditoriaScreen}
          options={{
            title: 'Auditoría',
            iconName: 'analytics'
          }}
        />
      )}
    </Tab.Navigator>
  );
};

// Navegador principal con drawer
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{
          title: 'SPJT',
          iconName: 'business'
        }}
      />
      
      <Drawer.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{
          title: 'Mi Perfil',
          iconName: 'person'
        }}
      />
    </Drawer.Navigator>
  );
};

// Navegador principal de la aplicación
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Aquí podrías mostrar una pantalla de carga
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 