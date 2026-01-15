import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedCard = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  elevation = 2,
  animated = true,
  pressable = true,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(elevation)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (!animated || !pressable) return;
    
    setIsPressed(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: elevation + 2,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!animated || !pressable) return;
    
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: elevation,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const CardContent = () => (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
          elevation: shadowAnim,
          shadowOpacity: shadowAnim.interpolate({
            inputRange: [0, 10],
            outputRange: [0, 0.3],
          }),
          shadowRadius: shadowAnim.interpolate({
            inputRange: [0, 10],
            outputRange: [0, 10],
          }),
        },
        style,
      ]}
      {...props}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );

  if (!pressable) {
    return <CardContent />;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.touchable}
    >
      <CardContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    width: '100%',
    minHeight: 100,
    ...SHADOWS.medium,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  content: {
    flex: 1,
  },
});

export default AnimatedCard; 