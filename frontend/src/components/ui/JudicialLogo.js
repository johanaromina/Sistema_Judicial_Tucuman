import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SIZES } from '../../theme';

const JudicialLogo = ({ size = 'large', showText = true, style }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { logoSize: 40, textSize: 12 };
      case 'medium':
        return { logoSize: 60, textSize: 16 };
      case 'large':
        return { logoSize: 80, textSize: 20 };
      case 'xlarge':
        return { logoSize: 120, textSize: 28 };
      default:
        return { logoSize: 80, textSize: 20 };
    }
  };

  const { logoSize, textSize } = getSize();

  return (
    <View style={[styles.container, style]}>
      {/* Logo circular con colores judiciales */}
      <View style={[styles.logo, { width: logoSize, height: logoSize }]}>
        {/* Círculo exterior dorado */}
        <View style={[styles.outerCircle, { width: logoSize, height: logoSize }]} />
        
        {/* Círculo interior azul */}
        <View style={[styles.innerCircle, { width: logoSize * 0.8, height: logoSize * 0.8 }]} />
        
        {/* Texto central */}
        <Text style={[styles.logoText, { fontSize: textSize * 0.6 }]}>
          PJT
        </Text>
      </View>
      
      {/* Texto del logo */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: textSize }]}>
            Poder Judicial
          </Text>
          <Text style={[styles.subtitle, { fontSize: textSize * 0.7 }]}>
            Tucumán
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.judicial.orange,
    borderWidth: 2,
    borderColor: COLORS.judicial.orangeLight,
  },
  innerCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.judicial.blue,
    borderWidth: 2,
    borderColor: COLORS.judicial.blueLight,
  },
  logoText: {
    color: COLORS.text.inverse,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default JudicialLogo; 