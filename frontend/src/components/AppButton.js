import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SIZES, SHADOWS } from '../theme';

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      baseStyle.push(styles.primary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outline);
    } else if (variant === 'text') {
      baseStyle.push(styles.text);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'outline') {
      baseTextStyle.push(styles.outlineText);
    } else if (variant === 'text') {
      baseTextStyle.push(styles.textButtonText);
    }
    
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.text.inverse} 
          size="small" 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small
  },
  
  // Variantes
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  
  // Tamaños
  small: {
    height: SIZES.buttonHeight - 16,
    paddingHorizontal: SPACING.md,
  },
  medium: {
    height: SIZES.buttonHeight,
    paddingHorizontal: SPACING.lg,
  },
  large: {
    height: SIZES.buttonHeight + 16,
    paddingHorizontal: SPACING.xl,
  },
  
  // Texto por tamaño
  smallText: {
    ...TYPOGRAPHY.button,
    fontSize: 12,
  },
  mediumText: {
    ...TYPOGRAPHY.button,
  },
  largeText: {
    ...TYPOGRAPHY.button,
    fontSize: 16,
  },
  
  // Texto por variante
  outlineText: {
    color: COLORS.primary,
  },
  textButtonText: {
    color: COLORS.primary,
  },
  
  // Estados
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: COLORS.text.disabled,
  },
  
  // Ancho completo
  fullWidth: {
    width: '100%',
  },
  
  // Texto base
  text: {
    color: COLORS.text.inverse,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AppButton; 