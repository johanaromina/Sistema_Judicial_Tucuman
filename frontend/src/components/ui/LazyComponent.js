import React, { Suspense, useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';

// Componente de skeleton loading
const SkeletonLoader = ({ width, height, style }) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity,
          ...style,
        },
      ]}
    />
  );
};

// Componente principal de lazy loading
const LazyComponent = ({ 
  component: Component, 
  fallback = null,
  skeletonProps = {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simular tiempo de carga para componentes pesados
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return fallback || (
      <View style={styles.skeletonContainer}>
        <SkeletonLoader
          width={skeletonProps.width || '100%'}
          height={skeletonProps.height || 200}
          style={skeletonProps.style}
        />
      </View>
    );
  }

  return (
    <Suspense fallback={fallback || (
      <View style={styles.skeletonContainer}>
        <SkeletonLoader
          width={skeletonProps.width || '100%'}
          height={skeletonProps.height || 200}
          style={skeletonProps.style}
        />
      </View>
    )}>
      <Component {...props} />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.md,
  },
});

export default LazyComponent;
export { SkeletonLoader }; 