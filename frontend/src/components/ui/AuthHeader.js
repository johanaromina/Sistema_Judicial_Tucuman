import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JudicialLogo from './JudicialLogo';
import AnimatedWrapper, { ANIMATION_TYPES } from './AnimatedWrapper';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme';

const AuthHeader = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  logoSize = 'large',
  style,
  ...props
}) => {
  return (
    <AnimatedWrapper type={ANIMATION_TYPES.SLIDE_DOWN} duration={800} delay={200}>
      <View style={[styles.container, style]} {...props}>
        {/* Botón de volver */}
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={COLORS.judicial.blue} 
            />
          </TouchableOpacity>
        )}

        {/* Logo */}
        <View style={styles.logoContainer}>
          <JudicialLogo size={logoSize} showText={false} />
        </View>

        {/* Título */}
        <Text style={styles.title}>{title}</Text>

        {/* Subtítulo */}
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </AnimatedWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    position: 'relative',
  },
  
  backButton: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
});

export default AuthHeader; 