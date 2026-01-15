import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const SecuritySettingsScreen = ({ navigation }) => {
  const handleBack = () => { try { navigation.goBack(); } catch {} };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={{ padding: SPACING.xs, marginRight: SPACING.sm }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguridad</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.paragraph}>Configuración de seguridad en construcción.</Text>
        <Text style={styles.paragraph}>Aquí podrás gestionar MFA, sesiones activas, dispositivos y permisos.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.text.inverse, marginLeft: SPACING.xs },
  content: { padding: SPACING.screenPadding },
  paragraph: { ...TYPOGRAPHY.body1, color: COLORS.text.primary, marginBottom: SPACING.md },
});

export default SecuritySettingsScreen;

