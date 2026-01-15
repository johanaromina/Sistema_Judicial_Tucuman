import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usuariosApi } from '../../api/usuarios.api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const NuevoUsuarioScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState([]);
  const [rolId, setRolId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRoles(true);
        const rs = await usuariosApi.listarRoles();
        if (mounted) {
          setRoles(rs);
          if (rs?.length) setRolId(rs[0].id);
        }
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar los roles.');
      } finally {
        if (mounted) setLoadingRoles(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const validar = () => {
    if (!nombre.trim() || !email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Completa nombre, email y contraseña.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Email inválido', 'Ingresa un email válido.');
      return false;
    }
    if (!rolId) {
      Alert.alert('Rol requerido', 'Selecciona un rol.');
      return false;
    }
    return true;
  };

  const crear = async () => {
    if (!validar()) return;
    try {
      setLoading(true);
      await usuariosApi.crear({ nombre: nombre.trim(), email: email.trim(), password, rol_id: rolId });
      // Notificación rápida + navegación automática con toast
      try {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Usuario creado', ToastAndroid.SHORT);
        } else if (Platform.OS === 'web') {
          try { window.alert('Usuario creado'); } catch {}
        }
      } catch {}
      try {
        navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'Usuarios', params: { toast: 'Usuario creado' } } });
      } catch {
        navigation.navigate('Usuarios');
      }
    } catch (e) {
      const status = e?.response?.status;
      const serverMsg = e?.response?.data?.message;
      const message = status === 409 ? 'Ya existe un usuario con ese email' : (serverMsg || 'No se pudo crear el usuario');
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => { try { navigation.goBack(); } catch { navigation.navigate('MainTabs', { screen: 'Usuarios' }); } };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <TouchableOpacity onPress={handleBack} style={{ padding: SPACING.xs, marginRight: SPACING.sm }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Usuario</Text>
      </View>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@spjt.com" autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="******" secureTextEntry />

      <Text style={styles.label}>Rol</Text>
      {loadingRoles ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <View style={styles.rolesList}>
          {roles.map((r) => (
            <TouchableOpacity key={r.id} style={[styles.roleChip, rolId === r.id && styles.roleChipSelected]} onPress={() => setRolId(r.id)}>
              <Text style={[styles.roleChipText, rolId === r.id && styles.roleChipTextSelected]}>{r.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={crear} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.text.inverse} />
        ) : (
          <>
            <Ionicons name="save" size={20} color={COLORS.text.inverse} />
            <Text style={styles.saveText}>Crear Usuario</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.screenPadding, backgroundColor: COLORS.background },
  title: { ...TYPOGRAPHY.h3, marginBottom: SPACING.lg, color: COLORS.text.primary },
  label: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  rolesList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  roleChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.surface },
  roleChipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  roleChipText: { ...TYPOGRAPHY.body2, color: COLORS.text.primary },
  roleChipTextSelected: { color: COLORS.primary, fontWeight: '600' },
  saveButton: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, ...SHADOWS.medium },
  saveText: { ...TYPOGRAPHY.button, color: COLORS.text.inverse },
});

export default NuevoUsuarioScreen;
