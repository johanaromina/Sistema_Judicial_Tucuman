import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const EditProfileScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  const handleBack = () => { try { navigation.goBack(); } catch {} };

  const onSubmit = () => {
    Alert.alert('Información', 'Edición de perfil en construcción.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={{ padding: SPACING.xs, marginRight: SPACING.sm }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

        <TouchableOpacity style={styles.saveButton} onPress={onSubmit}>
          <Ionicons name="save" size={18} color={COLORS.text.inverse} />
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.text.inverse, marginLeft: SPACING.xs },
  content: { padding: SPACING.screenPadding },
  label: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary, marginTop: SPACING.md, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  saveButton: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: SPACING.xs, ...SHADOWS.medium },
  saveText: { ...TYPOGRAPHY.button, color: COLORS.text.inverse },
});

export default EditProfileScreen;

